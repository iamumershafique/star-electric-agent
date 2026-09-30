/**
 * Local Ollama integration: vision OCR for PRs, DCs and builty receipts, a connection test,
 * and a read-only PR/DC document audit. Everything runs against the Ollama server on this PC;
 * no document leaves the machine.
 *
 * Ollama must allow the portal's origin, e.g. (PowerShell, then restart Ollama):
 *   setx OLLAMA_ORIGINS "https://star-agent-jpf.web.app,http://localhost:5173"
 */
import type {
  BrandCategory,
  DCRecord,
  GeminiBuiltyExtractionResult,
  GeminiDCExtractionResult,
  GeminiExtractionResult,
  PRRecord
} from '../types';
import { normalizeBrand } from './utils';
import { getOllamaSettings, type OllamaSettings } from './storage';
import { DocumentClassificationError, type DCFileInput, type PRFileInput } from './gemini';
import { getImageFromMemory, resolveScanReference } from './imageStorage';
import { STAR_DC_LAYOUT_GUIDE } from './dcLayout';
import { mapWithConcurrency } from './concurrency';
import { imageSideForQuality } from './scanQuality';

type JsonObject = Record<string, unknown>;
type ProgressHandler = (progress: {
  current: number;
  total: number;
  fileName: string;
  status: string;
}) => void;

interface SourceFile {
  base64: string;
  name: string;
}

/**
 * Longest image side sent to the model when no scan-quality setting is available.
 * Larger scans are downscaled; CPU time grows with the number of image patches.
 */
const FALLBACK_IMAGE_SIDE = 1152;
/** PDF pages rendered per document. Multi-page DCs beyond this are truncated with a warning. */
const MAX_PDF_PAGES = 3;
/** Vision patches are 28 px cells; used to size the context window to the real payload. */
const PATCH = 28;
/** How many scans can be decoded/prepared ahead of the model. */
const PREPARE_CONCURRENCY = 3;
/** Prepared-page cache size (scans); keeps a retried or re-audited scan free of re-rendering. */
const PREPARED_CACHE_LIMIT = 16;

/** Image side chosen by the scan quality setting (fast / balanced / accurate). */
export function getMaxImageSide(settings: OllamaSettings = getOllamaSettings()): number {
  return imageSideForQuality(settings.scanQuality) || FALLBACK_IMAGE_SIDE;
}

/** Thrown when Ollama cannot be reached, times out, or rejects the request (not a document problem). */
export class OllamaConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OllamaConnectionError';
  }
}

export function isOllamaEnabled(settings: OllamaSettings = getOllamaSettings()): boolean {
  return settings.enabled && Boolean(settings.baseUrl) && Boolean(settings.visionModel);
}

function corsHint(baseUrl: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'this portal';
  return `Could not reach Ollama at ${baseUrl}. Check that Ollama is running on this PC and that OLLAMA_ORIGINS includes ${origin} (then restart Ollama). In Chrome, allow "local network access" if prompted.`;
}

async function ollamaFetch(
  settings: OllamaSettings,
  path: string,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), timeoutMs);
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', onAbort, { once: true });
  try {
    return await fetch(`${settings.baseUrl}${path}`, { ...init, signal: controller.signal });
  } catch {
    if (signal?.aborted) throw new DOMException('Audit stopped.', 'AbortError');
    if (controller.signal.aborted) {
      throw new OllamaConnectionError(`Ollama did not answer within ${Math.round(timeoutMs / 1000)} s. The model may still be loading, or the scan is too large for CPU inference. Raise the timeout in Settings or use a smaller model.`);
    }
    throw new OllamaConnectionError(corsHint(settings.baseUrl));
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export async function testOllamaConnection(
  settings: OllamaSettings
): Promise<{ valid: boolean; error?: string; version?: string; models?: string[] }> {
  try {
    const versionResponse = await ollamaFetch(settings, '/api/version', { method: 'GET' }, 8000);
    const version = asString(asObject(await versionResponse.json().catch(() => null))?.version);
    const tagsResponse = await ollamaFetch(settings, '/api/tags', { method: 'GET' }, 8000);
    if (!tagsResponse.ok) return { valid: false, error: `Ollama answered with HTTP ${tagsResponse.status}.` };
    const models = asArray(asObject(await tagsResponse.json().catch(() => null))?.models)
      .map(model => asString(asObject(model)?.name))
      .filter(Boolean);
    const wanted = settings.visionModel.includes(':') ? settings.visionModel : `${settings.visionModel}:latest`;
    if (!models.includes(wanted) && !models.includes(settings.visionModel)) {
      return {
        valid: false,
        version,
        models,
        error: `Connected to Ollama ${version}, but "${settings.visionModel}" is not installed. Run: ollama pull ${settings.visionModel}`
      };
    }
    return { valid: true, version, models };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ---------------------------------------------------------------------------
// Image preparation
// ---------------------------------------------------------------------------

function splitDataUrl(value: string, name: string): { mimeType: string; data: string } {
  const match = value.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (match) return { mimeType: match[1].toLowerCase(), data: match[2].replace(/\s/g, '') };
  const mimeType = name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
  return { mimeType, data: value.replace(/\s/g, '') };
}

function base64ToBytes(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function canvasToJpegBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
}

async function downscaleImage(dataUrl: string, maxSide: number): Promise<string> {
  const image = new Image();
  image.decoding = 'async';
  image.src = dataUrl;
  await image.decode();
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  // Already small enough and already JPEG: send it as-is instead of decode + re-encode.
  if (longest <= maxSide && /^data:image\/jpe?g;base64,/i.test(dataUrl)) {
    return dataUrl.replace(/^data:image\/jpe?g;base64,/i, '');
  }
  const scale = Math.min(1, maxSide / longest);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare the scan for OCR (canvas unavailable).');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvasToJpegBase64(canvas);
}

async function renderPdfPages(data: string, maxSide: number): Promise<{ images: string[]; totalPages: number }> {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const pdf = await pdfjs.getDocument({ data: base64ToBytes(data) }).promise;
  const images: string[] = [];
  const pages = Math.min(pdf.numPages, MAX_PDF_PAGES);
  for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: maxSide / Math.max(base.width, base.height) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not render the PDF for OCR (canvas unavailable).');
    await page.render({ canvasContext: context, viewport }).promise;
    images.push(canvasToJpegBase64(canvas));
  }
  const totalPages = pdf.numPages;
  await pdf.destroy();
  return { images, totalPages };
}

/** Converts an uploaded image or PDF into downscaled JPEG pages (raw base64, no data: prefix). */
async function prepareImages(file: SourceFile, maxSide: number): Promise<{ images: string[]; note: string }> {
  const { mimeType, data } = splitDataUrl(file.base64, file.name);
  if (mimeType === 'application/pdf') {
    const { images, totalPages } = await renderPdfPages(data, maxSide);
    const note = totalPages > images.length
      ? `Only the first ${images.length} of ${totalPages} PDF pages were read.`
      : '';
    return { images, note };
  }
  if (!mimeType.startsWith('image/')) {
    throw new Error(`${file.name || 'The file'} is not an image or PDF.`);
  }
  return { images: [await downscaleImage(`data:${mimeType};base64,${data}`, maxSide)], note: '' };
}

/**
 * Prepared pages are cached (and pre-rendered ahead of the model) so the CPU is never idle
 * between documents: preparing the next scan takes a few hundred ms per photo and used to
 * be paid one file at a time, in front of every model call.
 */
const preparedScanCache = new Map<string, { images: string[]; note: string }>();

const preparedScanKey = (file: SourceFile, maxSide: number) =>
  `${maxSide}|${file.name}|${file.base64.length}|${file.base64.slice(-48)}`;

export async function prepareScan(file: SourceFile, maxSide: number): Promise<{ images: string[]; note: string }> {
  const key = preparedScanKey(file, maxSide);
  const cached = preparedScanCache.get(key);
  if (cached) return cached;
  const prepared = await prepareImages(file, maxSide);
  preparedScanCache.set(key, prepared);
  if (preparedScanCache.size > PREPARED_CACHE_LIMIT) {
    const oldest = preparedScanCache.keys().next().value;
    if (oldest) preparedScanCache.delete(oldest);
  }
  return prepared;
}

/** Prepares every document up front (bounded concurrency) so the model never waits on canvas work. */
async function prepareAll(
  files: SourceFile[],
  maxSide: number
): Promise<Array<{ images: string[]; note: string }>> {
  if (files.length <= 1) return Promise.all(files.map(file => prepareScan(file, maxSide)));
  return mapWithConcurrency(files, PREPARE_CONCURRENCY, file => prepareScan(file, maxSide));
}

/** Frees the cached pages of a finished batch so long sessions do not hold onto scans. */
export function clearPreparedScanCache(): void {
  preparedScanCache.clear();
}

/**
 * Loads the model into memory before the user starts a scan, so the first document does not
 * pay the 10-60 s load time. Safe to call repeatedly; failures are ignored on purpose.
 */
let warmedTarget = '';
let warmedAt = 0;

export async function warmUpOllama(settings: OllamaSettings = getOllamaSettings()): Promise<boolean> {
  if (!isOllamaEnabled(settings)) return false;
  const target = `${settings.baseUrl}|${settings.visionModel}`;
  if (warmedTarget === target && Date.now() - warmedAt < 15 * 60 * 1000) return true;
  try {
    const response = await ollamaFetch(settings, '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.visionModel,
        prompt: 'ok',
        stream: false,
        keep_alive: '20m',
        options: { num_predict: 1 }
      })
    }, 180_000);
    if (!response.ok) return false;
    warmedTarget = target;
    warmedAt = Date.now();
    return true;
  } catch (error) {
    console.warn('Ollama warm-up skipped:', error instanceof Error ? error.message : error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Chat request
// ---------------------------------------------------------------------------

/**
 * Context window sized to the payload actually sent (prompt + image patches + room for the
 * JSON answer). A bigger window than needed costs KV memory and slows every token down.
 */
function chooseNumCtx(prompt: string, imageCount: number, settings: OllamaSettings): number {
  const side = getMaxImageSide(settings);
  const patchesPerImage = Math.ceil((side * side) / (PATCH * PATCH));
  const needed = Math.ceil(prompt.length / 3.2) + imageCount * patchesPerImage + 2048;
  if (needed <= 4096) return 4096;
  if (needed <= 8192) return 8192;
  return 12288;
}

async function requestOllama(
  prompt: string,
  images: string[],
  settings: OllamaSettings,
  signal?: AbortSignal
): Promise<JsonObject> {
  const response = await ollamaFetch(settings, '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.visionModel,
      stream: false,
      format: 'json',
      keep_alive: '20m',
      options: { temperature: 0, num_ctx: chooseNumCtx(prompt, images.length, settings) },
      messages: [{ role: 'user', content: prompt, images }]
    })
  }, settings.timeoutSeconds * 1000, signal);

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = asString(asObject(body)?.error) || `HTTP ${response.status}`;
    if (response.status === 404) {
      throw new OllamaConnectionError(`Model "${settings.visionModel}" is not installed in Ollama. Run: ollama pull ${settings.visionModel}`);
    }
    throw new OllamaConnectionError(`Ollama request failed: ${message}`);
  }
  const content = asString(asObject(asObject(body)?.message)?.content);
  if (!content) throw new Error('The Ollama model returned an empty answer.');
  return parseJsonResponse(content);
}

function getFileObjects(files: PRFileInput[] | DCFileInput[]): SourceFile[] {
  return files.map(file => typeof file === 'string'
    ? { base64: file, name: '' }
    : { base64: file.base64, name: file.name || '' });
}

function asObject(value: unknown): JsonObject | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as JsonObject
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asNumber(value: unknown, fallback = 0): number {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizePrNumber(value: string): string {
  const clean = value.trim().toUpperCase().replace(/\s+/g, '');
  if (!clean || ['NOPR', 'PRNO', 'NONE', 'NULL', 'UNKNOWN'].includes(clean)) return 'NO PR';
  if (/^PR[-_]?\w+$/i.test(clean)) return clean.replace(/^PR[-_]?/i, 'PR-');
  if (/^\w+$/.test(clean)) return `PR-${clean}`;
  return clean;
}

function parseJsonResponse(text: string): JsonObject {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    const parsed: unknown = JSON.parse(cleaned);
    const object = asObject(parsed);
    if (object) return object;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const parsed: unknown = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      const object = asObject(parsed);
      if (object) return object;
    }
  }
  throw new Error('The Ollama model did not return a valid JSON document extraction.');
}

function readDocumentType(value: unknown): 'PURCHASE_REQUISITION' | 'DELIVERY_CHALLAN' | 'OTHER' | 'UNCLEAR' {
  const type = asString(value).toUpperCase().replace(/[\s-]+/g, '_');
  if (['PURCHASE_REQUISITION', 'PR', 'DEMAND_SHEET'].includes(type)) return 'PURCHASE_REQUISITION';
  if (['DELIVERY_CHALLAN', 'DC', 'CHALLAN'].includes(type)) return 'DELIVERY_CHALLAN';
  if (type === 'OTHER') return 'OTHER';
  return 'UNCLEAR';
}

function buildPRPrompt(fileName: string): string {
  return `You are extracting structured data from a business document for a supply-chain portal.
Classify by the printed document heading, not the filename or contents alone.
Only classify as PURCHASE_REQUISITION when the page itself is a purchase requisition or demand sheet.
Classify a document headed DELIVERY CHALLAN, DELIVERY NOTE, or CHALLAN as DELIVERY_CHALLAN. Classify any other report, register, invoice, or unclear page as OTHER or UNCLEAR.
Do not turn a delivery challan or a summary/report into a purchase requisition.
Extract all visible requisitions and every item row. If one page contains several PR numbers, return a separate requisition for each PR number and group rows only by the PR number printed on those rows.
Read PR number, requisition date, site, item description, brand, quantity, unit, and specifications only from visible evidence. Never infer a PR number from a DC number, filename, site, date, or similar items. Return "NO PR" when no PR number is legible and empty strings for unknown dates/sites.
If the sheet states alternatives such as "either item A or item B, not both", preserve that condition in the relevant specifications and do not imply both alternatives are simultaneously required.
Return a JSON object with documentType and a requisitions array. Each requisition must contain prNumber, date (YYYY-MM-DD or empty), siteName, lineItems (name, brand, quantity, unit, specifications), confidence (0 to 1), and rawAnalysis. The brand must be one of: Pakistan Cables, Amer Cables, Schneider Electric, Terasaki, Philips / Pak Lighting, Conduit & Accessories, Switches & Sockets, General Electrical.
Source filename for logging only: ${fileName || 'unknown'}.`;
}

function parsePRResults(parsed: JsonObject, fileName: string): GeminiExtractionResult[] {
  const documentType = readDocumentType(parsed.documentType);
  if (documentType !== 'PURCHASE_REQUISITION') {
    throw new DocumentClassificationError(documentType, fileName);
  }

  let requisitions = asArray(parsed.requisitions)
    .map(asObject)
    .filter((item): item is JsonObject => item !== null);

  if (requisitions.length === 0 && (Array.isArray(parsed.lineItems) || Array.isArray(parsed.items))) {
    requisitions = [parsed];
  }
  if (requisitions.length === 0) {
    throw new Error(`No requisition entries were extracted from ${fileName || 'the document'}.`);
  }

  return requisitions.map(req => {
    const rawLineItems = asArray(req.lineItems ?? req.items);
    const lineItems = rawLineItems.map(value => {
      const item = asObject(value);
      if (!item) throw new Error(`An item row in ${fileName || 'the document'} could not be read.`);
      const name = asString(item.name ?? item.itemName ?? item.description);
      if (!name) throw new Error(`An item description in ${fileName || 'the document'} could not be read.`);
      const quantity = asNumber(item.quantity ?? item.requestedQty, Number.NaN);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(`A valid positive quantity could not be read for "${name}" in ${fileName || 'the document'}.`);
      }
      const brandValue = asString(item.brand);
      return {
        name,
        brand: normalizeBrand(brandValue || name) as BrandCategory,
        quantity,
        unit: asString(item.unit),
        specifications: asString(item.specifications)
      };
    });
    if (lineItems.length === 0) {
      throw new Error(`No item rows were extracted from ${fileName || 'the document'}.`);
    }

    return {
      documentType: 'PURCHASE_REQUISITION',
      prNumber: normalizePrNumber(asString(req.prNumber ?? parsed.prNumber)),
      date: asString(req.date ?? parsed.date),
      siteName: asString(req.siteName ?? parsed.siteName),
      lineItems,
      confidence: Math.min(1, Math.max(0, asNumber(req.confidence, 0))),
      rawAnalysis: asString(req.rawAnalysis)
    };
  });
}

function buildDCPrompt(fileName: string, knownPRMemory?: string): string {
  return `You are extracting data from a Delivery Challan for Star Electric Enterprises.
Classify by the printed heading: DELIVERY_CHALLAN only when the page itself says Delivery Challan, Delivery Note, or Challan. If it is a Purchase Requisition, return PURCHASE_REQUISITION; unrelated documents are OTHER; unreadable type is UNCLEAR.
${STAR_DC_LAYOUT_GUIDE}
${knownPRMemory ? `Existing PR register for validating a PR reference only (never use it to infer one):\n${knownPRMemory}\n` : ''}
Read the printed DC number, invoice number, date, destination/site, driver, vehicle, remarks, and every shipped item with quantity and unit. Set invoiceNumber equal to dcNumber only when the document shows they are the same. Set prNumber only when the challan visibly shows an explicit PR reference; otherwise use an empty string. Never infer or create a PR from site, item, date, or filename.
Return JSON with documentType and deliveryChallans array. Each entry contains dcNumber, invoiceNumber, prNumber, date (YYYY-MM-DD or empty), siteName, driverName, vehicleNumber, remarks, shippedItems (itemName, brand, quantityShipped, unit), confidence (0 to 1), and rawAnalysis.
Filename for logging only: ${fileName || 'unknown'}.`;
}

function parseDCResults(parsed: JsonObject, fileName: string): GeminiDCExtractionResult[] {
  const documentType = readDocumentType(parsed.documentType);
  if (documentType !== 'DELIVERY_CHALLAN') {
    throw new DocumentClassificationError(documentType, fileName);
  }

  let entries = asArray(parsed.deliveryChallans)
    .map(asObject)
    .filter((item): item is JsonObject => item !== null);
  if (entries.length === 0 && parsed.dcNumber) entries = [parsed];
  if (entries.length === 0) throw new Error(`No Delivery Challan entries were extracted from ${fileName || 'the document'}.`);

  return entries.map(entry => {
    const dcNumber = asString(entry.dcNumber);
    if (!dcNumber) throw new Error(`The DC number could not be read from ${fileName || 'the document'}.`);
    const shippedItems = asArray(entry.shippedItems).map(value => {
      const item = asObject(value);
      if (!item) throw new Error(`A shipped item row in ${fileName || 'the document'} could not be read.`);
      const itemName = asString(item.itemName ?? item.name);
      if (!itemName) throw new Error(`A shipped item description in ${fileName || 'the document'} could not be read.`);
      const quantityShipped = asNumber(item.quantityShipped ?? item.quantity, Number.NaN);
      if (!Number.isFinite(quantityShipped) || quantityShipped <= 0) {
        throw new Error(`A valid positive shipped quantity could not be read for "${itemName}" in ${fileName || 'the document'}.`);
      }
      return {
        itemName,
        brand: asString(item.brand),
        quantityShipped,
        unit: asString(item.unit)
      };
    });
    if (shippedItems.length === 0) {
      throw new Error(`No shipped item rows were extracted from ${fileName || 'the document'}.`);
    }

    return {
      documentType: 'DELIVERY_CHALLAN',
      dcNumber,
      invoiceNumber: asString(entry.invoiceNumber),
      prNumber: asString(entry.prNumber),
      date: asString(entry.date),
      siteName: asString(entry.siteName),
      driverName: asString(entry.driverName),
      vehicleNumber: asString(entry.vehicleNumber),
      remarks: asString(entry.remarks),
      shippedItems,
      confidence: Math.min(1, Math.max(0, asNumber(entry.confidence, 0))),
      rawAnalysis: asString(entry.rawAnalysis)
    };
  });
}

function buildBuiltyPrompt(fileName: string): string {
  return `You are reading a Pakistani goods transport bilty/consignment receipt for Star Electric Enterprises.
Set documentType to BUILTY for a visibly identified goods transport receipt/bilty. Classify other documents as OTHER or UNCLEAR.
Extract only legible details: DC number when explicitly written, bilty/consignment number, transport adda, destination city, packages, freight amount/status, date, sender, receiver, and confidence.
Never infer a DC number from the bilty number, destination, filename, or examples. Unknown values must be empty strings or null. Return JSON with documentType and a builtys array of extracted receipts.
Filename for logging only: ${fileName || 'unknown'}.`;
}

const JSON_ONLY = '\nAnswer with one JSON object only, no prose.';

export async function processDocumentWithOllama(
  base64Images: PRFileInput | PRFileInput[],
  onProgress?: ProgressHandler
): Promise<GeminiExtractionResult[]> {
  const settings = getOllamaSettings();
  const files = getFileObjects(Array.isArray(base64Images) ? base64Images : [base64Images]);
  const prepared = await prepareAll(files, getMaxImageSide(settings));
  const results: GeminiExtractionResult[] = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const displayName = file.name || `Document #${index + 1}`;
    onProgress?.({ current: index, total: files.length, fileName: displayName, status: `Reading ${displayName} with local ${settings.visionModel} (can take a minute on CPU)...` });
    const parsed = await requestOllama(buildPRPrompt(displayName) + JSON_ONLY, prepared[index].images, settings);
    // Keep the page these requisitions were read from (one page can hold several PRs).
    results.push(...parsePRResults(parsed, displayName).map(result => ({ ...result, documentImage: file.base64 })));
    onProgress?.({ current: index + 1, total: files.length, fileName: displayName, status: `Read ${displayName}` });
  }
  if (results.length === 0) throw new Error('No purchase requisitions were extracted.');
  return results;
}

export async function processDCWithOllama(
  base64Images: DCFileInput | DCFileInput[],
  onProgress?: ProgressHandler,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const settings = getOllamaSettings();
  const files = getFileObjects(Array.isArray(base64Images) ? base64Images : [base64Images]);
  const prepared = await prepareAll(files, getMaxImageSide(settings));
  // The PR register is only used to validate a handwritten reference, so it is sent once and
  // only when it is short enough to be worth the prompt tokens.
  const prompt = buildDCPrompt('', knownPRMemory) + JSON_ONLY;
  const results: GeminiDCExtractionResult[] = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const displayName = file.name || `Delivery Challan #${index + 1}`;
    onProgress?.({ current: index, total: files.length, fileName: displayName, status: `Reading ${displayName} with local ${settings.visionModel} (can take a minute on CPU)...` });
    const parsed = await requestOllama(prompt, prepared[index].images, settings);
    // Keep the page these challans were read from (one page can hold several challans).
    results.push(...parseDCResults(parsed, displayName).map(result => ({ ...result, documentImage: file.base64 })));
    onProgress?.({ current: index + 1, total: files.length, fileName: displayName, status: `Read ${displayName}` });
  }
  if (results.length === 0) throw new Error('No Delivery Challan documents were extracted.');
  return results;
}

export async function processBuiltyWithOllama(
  base64Images: DCFileInput | DCFileInput[],
  onProgress?: ProgressHandler
): Promise<GeminiBuiltyExtractionResult[]> {
  const settings = getOllamaSettings();
  const files = getFileObjects(Array.isArray(base64Images) ? base64Images : [base64Images]);
  const prepared = await prepareAll(files, getMaxImageSide(settings));
  const results: GeminiBuiltyExtractionResult[] = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const displayName = file.name || `Builty #${index + 1}`;
    onProgress?.({ current: index, total: files.length, fileName: displayName, status: `Reading ${displayName} with local ${settings.visionModel}...` });
    const { images } = prepared[index];
    const parsed = await requestOllama(buildBuiltyPrompt(file.name) + JSON_ONLY, images, settings);
    if (asString(parsed.documentType).toUpperCase() !== 'BUILTY') {
      throw new Error(`The local model could not confirm ${file.name || 'the document'} as a goods transport bilty.`);
    }
    const entries = asArray(parsed.builtys)
      .map(asObject)
      .filter((item): item is JsonObject => item !== null);
    if (entries.length === 0) {
      throw new Error(`No bilty details were extracted from ${file.name || 'the document'}.`);
    }
    results.push(...entries.map(entry => ({
      dcNumber: asString(entry.dcNumber),
      builtyNumber: asString(entry.builtyNumber),
      addaName: asString(entry.addaName),
      destinationCity: asString(entry.destinationCity),
      packagesCount: asString(entry.packagesCount),
      freightCharges: entry.freightCharges == null ? undefined : Math.max(0, asNumber(entry.freightCharges)),
      freightStatus: ['Paid', 'To Pay', 'Free'].includes(asString(entry.freightStatus))
        ? asString(entry.freightStatus) as GeminiBuiltyExtractionResult['freightStatus']
        : undefined,
      builtyDate: asString(entry.builtyDate),
      sender: asString(entry.sender),
      receiver: asString(entry.receiver),
      builtyImage: file.base64,
      confidence: Math.min(1, Math.max(0, asNumber(entry.confidence, 0))),
      rawAnalysis: asString(entry.rawAnalysis)
    })));
    onProgress?.({ current: index + 1, total: files.length, fileName: displayName, status: `Read ${displayName}` });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Read-only PR/DC document audit (one record and one scan per request)
// ---------------------------------------------------------------------------

type AuditRecord = {
  kind: 'PR' | 'DC';
  id: string;
  recordNumber: string;
  date: string;
  siteName: string;
  linkedPRNumber?: string;
  documentImage?: string;
  imageAvailable: boolean;
  imageError?: string;
  lineSummary: string[];
};

export interface OllamaAuditFinding {
  recordType: 'PR' | 'DC';
  recordId: string;
  recordNumber: string;
  documentType: string;
  printedNumber: string;
  printedPRNumber: string;
  printedSite: string;
  confidence: number;
  findings: string[];
  imageAvailable: boolean;
  imageError?: string;
}

export interface OllamaLinkSuggestion {
  dcId: string;
  dcNumber: string;
  prId: string;
  prNumber: string;
  visiblePRNumber: string;
  confidence: number;
  evidence: string;
}

export interface OllamaAuditResult {
  findings: OllamaAuditFinding[];
  suggestions: OllamaLinkSuggestion[];
  completed: number;
  total: number;
  stopped: boolean;
}

function normalizeReference(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function resolveAuditImage(record: AuditRecord): Promise<void> {
  let image = await resolveScanReference(record.documentImage);
  if (!image) {
    const kind = record.kind.toLowerCase() as 'pr' | 'dc';
    image = await getImageFromMemory(kind, record.recordNumber) || await getImageFromMemory(kind, record.id);
  }
  if (!image) {
    record.imageError = 'No source scan is attached or saved for this record.';
    return;
  }
  if (image.startsWith('http://') || image.startsWith('https://')) {
    try {
      const response = await fetch(image);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!/^(image\/(jpeg|png|gif|webp)|application\/pdf)$/i.test(blob.type)) {
        throw new Error('The URL did not return a supported image or PDF.');
      }
      image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error || new Error('Could not read document image.'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      record.imageError = `Could not load source scan: ${error instanceof Error ? error.message : String(error)}`;
      return;
    }
  }
  if (!/^data:(image\/[a-z+.-]+|application\/pdf);base64,/i.test(image)) {
    record.imageError = 'The source scan is not a supported image or PDF.';
    return;
  }
  record.documentImage = image;
  record.imageAvailable = true;
}

function toAuditRecords(prs: PRRecord[], dcs: DCRecord[]): AuditRecord[] {
  return [
    ...prs.map((pr): AuditRecord => ({
      kind: 'PR',
      id: pr.id,
      recordNumber: pr.prNumber || '',
      date: pr.date || '',
      siteName: pr.siteName || '',
      documentImage: pr.documentImage,
      imageAvailable: false,
      lineSummary: (pr.items || []).map(item =>
        `${item.name || ''} — ${item.requestedQty ?? ''} ${item.unit || ''} (fulfilled ${item.fulfilledQty ?? ''})`)
    })),
    ...dcs.map((dc): AuditRecord => ({
      kind: 'DC',
      id: dc.id,
      recordNumber: dc.dcNumber || '',
      date: dc.date || '',
      siteName: dc.siteName || '',
      linkedPRNumber: dc.prNumber || '',
      documentImage: dc.documentImage,
      imageAvailable: false,
      lineSummary: (dc.itemsShipped || []).map(item => `${item.itemName || ''} — ${item.quantity ?? ''} ${item.unit || ''}`)
    }))
  ];
}

function buildAuditPrompt(record: AuditRecord, pageNote: string): string {
  return `Audit one portal record against its attached original document image.
Treat the printed document heading and printed reference numbers as authoritative.
Do not infer PR-to-DC links from site, date, item similarity, or sequence. Never fabricate values.
Compare the portal record below with the image and list every concrete discrepancy (wrong number, date, site, missing or extra item, quantity mismatch) or unclear evidence.
${pageNote ? `Note: ${pageNote}\n` : ''}Portal record:
${JSON.stringify({
  kind: record.kind,
  recordNumber: record.recordNumber,
  date: record.date,
  siteName: record.siteName,
  linkedPRNumber: record.linkedPRNumber,
  lineSummary: record.lineSummary
}, null, 2)}
Return ONLY this JSON: {"documentType":"PURCHASE_REQUISITION|DELIVERY_CHALLAN|OTHER|UNCLEAR","printedNumber":"reference printed on the document, or empty","printedPRNumber":"PR number explicitly printed on the document, or empty","printedSite":"site exactly as printed, or empty","confidence":0.0,"findings":["specific discrepancy"]}`;
}

function unreadFinding(record: AuditRecord, message: string): OllamaAuditFinding {
  return {
    recordType: record.kind,
    recordId: record.id,
    recordNumber: record.recordNumber,
    documentType: 'UNCLEAR',
    printedNumber: '',
    printedPRNumber: '',
    printedSite: '',
    confidence: 0,
    findings: [message],
    imageAvailable: record.imageAvailable,
    imageError: record.imageError || message
  };
}

/**
 * Audits the given records one by one against their scans with the local vision model.
 * Records without a scan are reported without a model call. Pass an AbortSignal to stop;
 * results gathered so far are returned with stopped = true. Nothing is written to the portal.
 */
export async function runOllamaDatabaseAudit(
  prs: PRRecord[],
  dcs: DCRecord[],
  onProgress?: (current: number, total: number, label: string) => void,
  signal?: AbortSignal,
  allPRs: PRRecord[] = prs
): Promise<OllamaAuditResult> {
  const settings = getOllamaSettings();
  if (!isOllamaEnabled(settings)) {
    throw new Error('Enable Ollama and set a vision model in Settings before running the audit.');
  }
  const connection = await testOllamaConnection(settings);
  if (!connection.valid) throw new OllamaConnectionError(connection.error || 'Ollama is not reachable.');

  const records = toAuditRecords(prs, dcs);
  const maxSide = getMaxImageSide(settings);
  const findings: OllamaAuditFinding[] = [];
  let completed = 0;
  let stopped = false;

  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    if (signal?.aborted) { stopped = true; break; }
    onProgress?.(completed, records.length, `${record.kind} ${record.recordNumber || record.id}`);

    // The scan of the next record is fetched from IndexedDB / Firestore while this one is
    // being read by the model, so lookups do not add to the per-record time.
    const nextRecord = records[index + 1];
    const nextScanReady = nextRecord && !nextRecord.imageAvailable
      ? resolveAuditImage(nextRecord)
      : Promise.resolve();

    await resolveAuditImage(record);
    if (!record.imageAvailable) {
      findings.push(unreadFinding(record, record.imageError || 'Source scan unavailable.'));
    } else {
      try {
        const { images, note } = await prepareScan({ base64: record.documentImage || '', name: record.recordNumber }, maxSide);
        const result = await requestOllama(buildAuditPrompt(record, note), images, settings, signal);
        findings.push({
          recordType: record.kind,
          recordId: record.id,
          recordNumber: record.recordNumber,
          documentType: asString(result.documentType).toUpperCase() || 'UNCLEAR',
          printedNumber: asString(result.printedNumber),
          printedPRNumber: asString(result.printedPRNumber),
          printedSite: asString(result.printedSite),
          confidence: Math.max(0, Math.min(1, asNumber(result.confidence, 0))),
          findings: asArray(result.findings).filter((item): item is string => typeof item === 'string' && item.trim() !== ''),
          imageAvailable: true
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') { stopped = true; break; }
        if (error instanceof OllamaConnectionError) throw error;
        findings.push(unreadFinding(record, `The local model could not read this scan: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
    await nextScanReady;
    completed += 1;
    onProgress?.(completed, records.length, `${record.kind} ${record.recordNumber || record.id}`);
  }

  const prsByNumber = new Map<string, PRRecord | null>();
  allPRs.forEach(pr => {
    const number = normalizeReference(pr.prNumber || '');
    if (!number) return;
    prsByNumber.set(number, prsByNumber.has(number) ? null : pr);
  });
  const suggestions: OllamaLinkSuggestion[] = findings.flatMap(finding => {
    if (finding.recordType !== 'DC' || !finding.printedPRNumber ||
        finding.documentType !== 'DELIVERY_CHALLAN' || finding.confidence < 0.8) return [];
    const matchedPR = prsByNumber.get(normalizeReference(finding.printedPRNumber));
    if (!matchedPR) return [];
    const dc = dcs.find(record => record.id === finding.recordId);
    if (!dc || dc.prId === matchedPR.id) return [];
    return [{
      dcId: dc.id,
      dcNumber: dc.dcNumber,
      prId: matchedPR.id,
      prNumber: matchedPR.prNumber,
      visiblePRNumber: finding.printedPRNumber,
      confidence: finding.confidence,
      evidence: `The local model read ${finding.printedPRNumber} on the DC; it exactly matches the portal PR number.`
    }];
  });

  return { findings, suggestions, completed, total: records.length, stopped };
}
