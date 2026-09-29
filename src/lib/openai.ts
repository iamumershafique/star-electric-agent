import type {
  BrandCategory,
  GeminiBuiltyExtractionResult,
  GeminiDCExtractionResult,
  GeminiExtractionResult
} from '../types';
import { normalizeBrand, cleanApiKey } from './utils';
import { getOpenAIApiKey } from './storage';
import { DocumentClassificationError, type DCFileInput, type PRFileInput } from './gemini';

const OPENAI_MODEL = 'gpt-4.1-mini';

type JsonObject = Record<string, unknown>;
type ProgressHandler = (progress: {
  current: number;
  total: number;
  fileName: string;
  status: string;
}) => void;

interface OpenAIFile {
  base64: string;
  name: string;
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

function getFileObjects(files: PRFileInput[] | DCFileInput[]): OpenAIFile[] {
  return files.map(file => typeof file === 'string'
    ? { base64: file, name: '' }
    : { base64: file.base64, name: file.name || '' });
}

function normalizePrNumber(value: string): string {
  const clean = value.trim().toUpperCase().replace(/\s+/g, '');
  if (!clean || ['NOPR', 'PRNO', 'NONE', 'NULL', 'UNKNOWN'].includes(clean)) return 'NO PR';
  if (/^PR[-_]?\w+$/i.test(clean)) return clean.replace(/^PR[-_]?/i, 'PR-');
  if (/^\w+$/.test(clean)) return `PR-${clean}`;
  return clean;
}

function getOpenAIKey(apiKey?: string): string {
  return cleanApiKey(apiKey) || getOpenAIApiKey();
}

function parseDataUrl(base64: string, name: string): {
  dataUrl: string;
  mimeType: string;
} {
  const match = base64.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (match) return { dataUrl: base64, mimeType: match[1] };

  const mimeType = name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
  return {
    dataUrl: `data:${mimeType};base64,${base64.replace(/\s/g, '')}`,
    mimeType
  };
}

function getResponseText(response: unknown): string {
  const body = asObject(response);
  if (!body) throw new Error('OpenAI returned an invalid response.');

  const directText = asString(body.output_text);
  if (directText) return directText;

  for (const outputItem of asArray(body.output)) {
    const item = asObject(outputItem);
    if (!item || item.type !== 'message') continue;
    for (const contentItem of asArray(item.content)) {
      const content = asObject(contentItem);
      if (content?.type === 'output_text' && asString(content.text)) {
        return asString(content.text);
      }
    }
  }

  throw new Error('OpenAI response did not contain extracted text.');
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
  throw new Error('OpenAI did not return a valid JSON document extraction.');
}

function readDocumentType(value: unknown): 'PURCHASE_REQUISITION' | 'DELIVERY_CHALLAN' | 'OTHER' | 'UNCLEAR' {
  const type = asString(value).toUpperCase().replace(/[\s-]+/g, '_');
  if (['PURCHASE_REQUISITION', 'PR', 'DEMAND_SHEET'].includes(type)) return 'PURCHASE_REQUISITION';
  if (['DELIVERY_CHALLAN', 'DC', 'CHALLAN'].includes(type)) return 'DELIVERY_CHALLAN';
  if (type === 'OTHER') return 'OTHER';
  return 'UNCLEAR';
}

async function requestOpenAI(
  apiKey: string,
  file: OpenAIFile,
  prompt: string
): Promise<JsonObject> {
  const { dataUrl, mimeType } = parseDataUrl(file.base64, file.name);
  const filePart = mimeType === 'application/pdf'
    ? {
        type: 'input_file',
        filename: file.name || 'document.pdf',
        file_data: dataUrl
      }
    : {
        type: 'input_image',
        image_url: dataUrl,
        detail: 'high'
      };

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [{
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            filePart
          ]
        }],
        text: { format: { type: 'json_object' } },
        max_output_tokens: 8192
      })
    });
  } catch (error) {
    throw new Error(`Could not reach OpenAI API: ${String(error)}`);
  }

  const responseBody: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = asObject(responseBody);
    const apiError = asObject(body?.error);
    const message = asString(apiError?.message);
    const reason = message || `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) {
      throw new Error(`OpenAI authentication or permissions failed: ${reason}`);
    }
    if (response.status === 429) {
      throw new Error(`OpenAI API quota or rate limit reached: ${reason}`);
    }
    throw new Error(`OpenAI API request failed (${response.status}): ${reason}`);
  }

  return parseJsonResponse(getResponseText(responseBody));
}

export async function validateOpenAIApiKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string; model?: string }> {
  const key = cleanApiKey(apiKey);
  if (!key) return { valid: false, error: 'Enter an OpenAI API key to test.' };

  try {
    const response = await fetch(`https://api.openai.com/v1/models/${OPENAI_MODEL}`, {
      headers: { Authorization: `Bearer ${key}` }
    });
    if (response.ok) return { valid: true, model: OPENAI_MODEL };

    const body: unknown = await response.json().catch(() => null);
    const errorBody = asObject(asObject(body)?.error);
    const message = asString(errorBody?.message);
    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: message || 'OpenAI rejected this API key or its model permissions.' };
    }
    if (response.status === 429) {
      return { valid: false, error: 'OpenAI API quota or rate limit reached. Check API billing and usage limits.' };
    }
    return { valid: false, error: message || `OpenAI API test failed (HTTP ${response.status}).` };
  } catch (error) {
    return { valid: false, error: `Could not reach OpenAI API: ${String(error)}` };
  }
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

export async function processDocumentWithOpenAI(
  base64Images: PRFileInput | PRFileInput[],
  apiKey?: string,
  onProgress?: ProgressHandler
): Promise<GeminiExtractionResult[]> {
  const key = getOpenAIKey(apiKey);
  if (!key) throw new Error('An OpenAI API key is required. Add one in Settings, then retry.');

  const rawFiles = Array.isArray(base64Images) ? base64Images : [base64Images];
  const files = getFileObjects(rawFiles);
  const results: GeminiExtractionResult[] = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const displayName = file.name || `Document #${index + 1}`;
    onProgress?.({
      current: index + 1,
      total: files.length,
      fileName: displayName,
      status: `Scanning ${displayName} with OpenAI...`
    });
    const parsed = await requestOpenAI(key, file, buildPRPrompt(displayName));
    results.push(...parsePRResults(parsed, displayName));
    if (index < files.length - 1) await new Promise(resolve => setTimeout(resolve, 250));
  }

  if (results.length === 0) throw new Error('No purchase requisitions were extracted.');
  return results;
}

function buildDCPrompt(fileName: string, knownPRMemory?: string): string {
  return `You are extracting data from a Delivery Challan for Star Electric Enterprises.
Classify by the printed heading: DELIVERY_CHALLAN only when the page itself says Delivery Challan, Delivery Note, or Challan. If it is a Purchase Requisition, return PURCHASE_REQUISITION; unrelated documents are OTHER; unreadable type is UNCLEAR.
${knownPRMemory ? `Existing PR register for validating a PR reference only (never use it to infer one):\\n${knownPRMemory}\\n` : ''}
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

export async function processDCWithOpenAI(
  base64Images: DCFileInput | DCFileInput[],
  apiKey?: string,
  onProgress?: ProgressHandler,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const key = getOpenAIKey(apiKey);
  if (!key) throw new Error('An OpenAI API key is required. Add one in Settings, then retry.');

  const rawFiles = Array.isArray(base64Images) ? base64Images : [base64Images];
  const files = getFileObjects(rawFiles);
  const results: GeminiDCExtractionResult[] = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const displayName = file.name || `Delivery Challan #${index + 1}`;
    onProgress?.({
      current: index + 1,
      total: files.length,
      fileName: displayName,
      status: `Scanning ${displayName} with OpenAI...`
    });
    const parsed = await requestOpenAI(key, file, buildDCPrompt(displayName, knownPRMemory));
    results.push(...parseDCResults(parsed, displayName));
    if (index < files.length - 1) await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (results.length === 0) throw new Error('No Delivery Challan documents were extracted.');
  return results;
}

function buildBuiltyPrompt(fileName: string): string {
  return `You are reading a Pakistani goods transport bilty/consignment receipt for Star Electric Enterprises.
Set documentType to BUILTY for a visibly identified goods transport receipt/bilty. Classify other documents as OTHER or UNCLEAR.
Extract only legible details: DC number when explicitly written, bilty/consignment number, transport adda, destination city, packages, freight amount/status, date, sender, receiver, and confidence.
Never infer a DC number from the bilty number, destination, filename, or examples. Unknown values must be empty strings or null. Return JSON with documentType and a builtys array of extracted receipts.
Filename for logging only: ${fileName || 'unknown'}.`;
}

export async function processBuiltyWithOpenAI(
  base64Images: DCFileInput | DCFileInput[],
  apiKey?: string
): Promise<GeminiBuiltyExtractionResult[]> {
  const key = getOpenAIKey(apiKey);
  if (!key) throw new Error('An OpenAI API key is required. Add one in Settings, then retry.');

  const rawFiles = Array.isArray(base64Images) ? base64Images : [base64Images];
  const files = getFileObjects(rawFiles);
  const results: GeminiBuiltyExtractionResult[] = [];
  for (const file of files) {
    const parsed = await requestOpenAI(key, file, buildBuiltyPrompt(file.name));
    if (asString(parsed.documentType).toUpperCase() !== 'BUILTY') {
      throw new Error(`OpenAI could not confirm ${file.name || 'the document'} as a goods transport bilty.`);
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
  }
  return results;
}
