import type {
  GeminiBuiltyExtractionResult,
  GeminiDCExtractionResult,
  GeminiExtractionResult
} from '../types';
import { normalizeBrand } from './utils';
import { getOllamaEndpoint, getOllamaModel } from './storage';
import { DocumentClassificationError, type DCFileInput, type PRFileInput } from './gemini';

type JsonObject = Record<string, unknown>;
type ProgressHandler = (progress: {
  current: number;
  total: number;
  fileName: string;
  status: string;
}) => void;

interface OllamaFile {
  base64: string;
  name: string;
}

function cleanBase64(base64: string): string {
  if (base64.includes('base64,')) {
    return base64.split('base64,')[1];
  }
  return base64.trim();
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

function getFileObjects(files: PRFileInput[] | DCFileInput[]): OllamaFile[] {
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

function parseJsonFromText(rawText: string): JsonObject {
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

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
  throw new Error('Ollama vision model did not return a valid JSON extraction.');
}

async function requestOllamaVision(
  endpoint: string,
  model: string,
  file: OllamaFile,
  prompt: string
): Promise<JsonObject> {
  const rawBase64 = cleanBase64(file.base64);
  const baseEndpoint = (endpoint || 'http://localhost:11434').replace(/\/+$/, '');
  const apiUrl = `${baseEndpoint}/api/generate`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'minicpm-v',
      prompt: `${prompt}\nIMPORTANT: Respond with pure valid JSON only, no markdown, no explanation.`,
      images: [rawBase64],
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${errorText || response.statusText}`);
  }

  const result = await response.json();
  const textContent = result?.response || '';
  if (!textContent) {
    throw new Error('Empty response from Ollama model.');
  }

  return parseJsonFromText(textContent);
}

export async function validateOllamaEndpoint(
  endpoint: string,
  model?: string
): Promise<{ valid: boolean; model?: string; message: string }> {
  const base = (endpoint || 'http://localhost:11434').replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/api/tags`, { method: 'GET' });
    if (!res.ok) {
      return { valid: false, message: `Ollama returned status ${res.status}` };
    }
    const data = await res.json();
    const models: Array<{ name: string }> = data?.models || [];
    const modelNames = models.map(m => m.name);
    const targetModel = model || getOllamaModel() || 'minicpm-v';
    const found = modelNames.some(name => name.toLowerCase().includes(targetModel.toLowerCase()));
    
    return {
      valid: true,
      model: targetModel,
      message: found
        ? `Connected to Ollama! Model "${targetModel}" is ready.`
        : `Connected to Ollama, but model "${targetModel}" is not in: ${modelNames.join(', ') || 'none'}`
    };
  } catch (err) {
    return {
      valid: false,
      message: `Could not connect to Ollama at ${base}. Ensure Ollama is running and CORS is enabled (OLLAMA_ORIGINS="*").`
    };
  }
}

export async function processDocumentWithOllama(
  files: PRFileInput | PRFileInput[],
  endpoint?: string,
  model?: string,
  onProgress?: ProgressHandler
): Promise<GeminiExtractionResult[]> {
  const fileList = getFileObjects(Array.isArray(files) ? files : [files]);
  const activeEndpoint = endpoint || getOllamaEndpoint() || 'http://localhost:11434';
  const activeModel = model || getOllamaModel() || 'minicpm-v';
  const results: GeminiExtractionResult[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const current = fileList[i];
    onProgress?.({
      current: i + 1,
      total: fileList.length,
      fileName: current.name || `PR_${i + 1}`,
      status: `Processing document ${i + 1}/${fileList.length} with Ollama (${activeModel})...`
    });

    const prompt = `Analyze this scanned Purchase Requisition / Demand Order sheet from Jadeed Group.
Extract:
- prNumber: string
- date: YYYY-MM-DD
- siteName: string (farm / mill name)
- documentType: "PURCHASE_REQUISITION" | "DELIVERY_CHALLAN" | "OTHER"
- items: array of {
    name: string,
    brand: "ABB" | "Schneider" | "Mitsubishi" | "Siemens" | "Terasaki" | "Fuji" | "Delta" | "LS" | "Omron" | "Autonics" | "Chint" | "Other",
    quantity: number,
    unit: string,
    remarks: string
  }`;

    const json = await requestOllamaVision(activeEndpoint, activeModel, current, prompt);

    const docType = asString(json.documentType).toUpperCase();
    if (docType === 'DELIVERY_CHALLAN') {
      throw new DocumentClassificationError('DELIVERY_CHALLAN', current.name);
    }

    const lineItems = asArray(json.items).map(raw => {
      const it = asObject(raw) || {};
      return {
        name: asString(it.name),
        brand: normalizeBrand(asString(it.brand)),
        quantity: asNumber(it.quantity, 1),
        unit: asString(it.unit) || 'PCS',
        specifications: asString(it.remarks)
      };
    }).filter(it => it.name.length > 0);

    results.push({
      prNumber: normalizePrNumber(asString(json.prNumber)),
      date: asString(json.date),
      siteName: asString(json.siteName),
      documentType: 'PURCHASE_REQUISITION',
      lineItems,
      confidence: 0.95,
      rawAnalysis: JSON.stringify(json)
    });
  }

  return results;
}

export async function processDCWithOllama(
  files: DCFileInput | DCFileInput[],
  endpoint?: string,
  model?: string,
  onProgress?: ProgressHandler,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const fileList = getFileObjects(Array.isArray(files) ? files : [files]);
  const activeEndpoint = endpoint || getOllamaEndpoint() || 'http://localhost:11434';
  const activeModel = model || getOllamaModel() || 'minicpm-v';
  const results: GeminiDCExtractionResult[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const current = fileList[i];
    onProgress?.({
      current: i + 1,
      total: fileList.length,
      fileName: current.name || `DC_${i + 1}`,
      status: `Processing Delivery Challan ${i + 1}/${fileList.length} with Ollama (${activeModel})...`
    });

    const prompt = `Analyze this Delivery Challan (DC) from Star Electric Enterprises for Jadeed Group.
Known PR context: ${knownPRMemory || 'None'}
Extract:
- dcNumber: string (e.g. "DC-693" or "693")
- invoiceNumber: string
- prNumber: string (if referenced, e.g. "PR-01")
- date: YYYY-MM-DD
- siteName: string (delivery destination)
- driverName: string
- vehicleNumber: string
- remarks: string
- documentType: "DELIVERY_CHALLAN" | "PURCHASE_REQUISITION" | "OTHER"
- itemsShipped: array of {
    itemName: string,
    brand: "ABB" | "Schneider" | "Mitsubishi" | "Siemens" | "Terasaki" | "Fuji" | "Delta" | "LS" | "Omron" | "Autonics" | "Chint" | "Other",
    quantityShipped: number,
    unit: string
  }`;

    const json = await requestOllamaVision(activeEndpoint, activeModel, current, prompt);

    const docType = asString(json.documentType).toUpperCase();
    if (docType === 'PURCHASE_REQUISITION') {
      throw new DocumentClassificationError('PURCHASE_REQUISITION', current.name);
    }

    const shippedItems = asArray(json.itemsShipped).map(raw => {
      const it = asObject(raw) || {};
      return {
        itemName: asString(it.itemName || it.name),
        brand: normalizeBrand(asString(it.brand)),
        quantityShipped: asNumber(it.quantityShipped, 1),
        unit: asString(it.unit) || 'PCS'
      };
    }).filter(it => it.itemName.length > 0);

    results.push({
      dcNumber: asString(json.dcNumber || json.challanNumber),
      invoiceNumber: asString(json.invoiceNumber),
      prNumber: normalizePrNumber(asString(json.prNumber)),
      date: asString(json.date),
      siteName: asString(json.siteName),
      driverName: asString(json.driverName),
      vehicleNumber: asString(json.vehicleNumber),
      remarks: asString(json.remarks),
      documentType: 'DELIVERY_CHALLAN',
      shippedItems,
      confidence: 0.95,
      rawAnalysis: JSON.stringify(json)
    });
  }

  return results;
}

export async function processBuiltyWithOllama(
  files: DCFileInput | DCFileInput[],
  endpoint?: string,
  model?: string
): Promise<GeminiBuiltyExtractionResult[]> {
  const fileList = getFileObjects(Array.isArray(files) ? files : [files]);
  const activeEndpoint = endpoint || getOllamaEndpoint() || 'http://localhost:11434';
  const activeModel = model || getOllamaModel() || 'minicpm-v';
  const results: GeminiBuiltyExtractionResult[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const current = fileList[i];
    const prompt = `Analyze this Goods Transport Builty / Bilty receipt.
Extract:
- dcNumber: string
- builtyNumber: string (receipt number)
- addaName: string (transport company / adda name)
- destinationCity: string
- packagesCount: string (number of cartons / bags)
- builtyDate: YYYY-MM-DD
- freightCharges: number
- freightStatus: "Paid" | "To Pay" | "Free"`;

    const json = await requestOllamaVision(activeEndpoint, activeModel, current, prompt);

    let statusRaw = asString(json.freightStatus);
    let freightStatus: 'Paid' | 'To Pay' | 'Free' = 'To Pay';
    if (statusRaw.toLowerCase().includes('paid')) freightStatus = 'Paid';
    else if (statusRaw.toLowerCase().includes('free')) freightStatus = 'Free';

    results.push({
      dcNumber: asString(json.dcNumber),
      builtyNumber: asString(json.builtyNumber),
      addaName: asString(json.addaName),
      destinationCity: asString(json.destinationCity),
      packagesCount: asString(json.packagesCount),
      builtyDate: asString(json.builtyDate),
      freightCharges: asNumber(json.freightCharges, 0),
      freightStatus,
      sender: asString(json.sender),
      receiver: asString(json.receiver),
      confidence: 0.95,
      rawAnalysis: JSON.stringify(json)
    });
  }

  return results;
}
