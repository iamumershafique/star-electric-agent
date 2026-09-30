import { GoogleGenAI } from '@google/genai';
import { STAR_DC_LAYOUT_GUIDE } from './dcLayout';
import type { GeminiExtractionResult, GeminiDCExtractionResult, GeminiBuiltyExtractionResult } from '../types';
import { normalizeBrand, cleanApiKey } from './utils';
import { RequestGate, isRateLimitError, mapWithConcurrency } from './concurrency';

/** How many documents are sent to Gemini at the same time in one scan batch. */
export const GEMINI_FILE_CONCURRENCY = 3;
/** Wall-clock limit for a single Gemini call; a hung request must not stall a whole batch. */
const GEMINI_REQUEST_TIMEOUT_MS = 120_000;
/** Cooldown applied to the whole batch when the API reports a rate limit. */
const GEMINI_RATE_LIMIT_COOLDOWN_MS = 4000;

export function getActiveGeminiApiKey(apiKey?: string): string {
  const cleanedPassed = cleanApiKey(apiKey);
  if (cleanedPassed) return cleanedPassed;

  if (typeof window !== 'undefined' && window.localStorage) {
    const keys = ['STAR_ELECTRIC_GEMINI_KEY', 'gemini_api_key', 'GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'GOOGLE_API_KEY'];
    for (const k of keys) {
      const v = cleanApiKey(window.localStorage.getItem(k));
      if (v) return v;
    }
    if ((window as any).__GEMINI_API_KEY__) {
      const v = cleanApiKey(String((window as any).__GEMINI_API_KEY__));
      if (v) return v;
    }
  }

  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
      const v = cleanApiKey((import.meta as any).env.VITE_GEMINI_API_KEY);
      if (v) return v;
    }
  } catch {
    // ignore
  }

  return '';
}

export async function validateGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string; model?: string }> {
  const key = getActiveGeminiApiKey(apiKey);
  if (!key) {
    return { valid: false, error: 'No API key provided. Please enter a valid Gemini API key.' };
  }

  const testModels = modelsToTry(key);
  let lastErr = '';

  for (const model of testModels) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model,
        contents: 'Respond with the single word: READY',
        config: {
          maxOutputTokens: 10,
          httpOptions: { timeout: 30_000 }
        }
      });
      if (response) {
        rememberGeminiModel(key, model);
        return { valid: true, model };
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`[Gemini Test] Model ${model} test failed:`, msg);
      lastErr = msg;
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || msg.includes('API_KEY_SERVICE_BLOCKED')) {
        forgetGeminiModel();
        return { valid: false, error: 'Invalid Google Gemini API Key. Please verify your key in Google AI Studio.' };
      }
      if (msg.includes('PERMISSION_DENIED')) {
        return { valid: false, error: 'Permission denied. Ensure Generative Language API is enabled for this key in Google Cloud.' };
      }
      if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
        return { valid: false, error: 'Gemini API Rate Limit / Quota Reached. Please wait a moment or check billing.' };
      }
    }
  }

  return { valid: false, error: lastErr || 'Failed to connect to Google Gemini API.' };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
}

function getPureBase64(dataUrl: string): { mimeType: string; data: string } {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z]+|application\/pdf);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl.replace(/^data:image\/\w+;base64,/, '') };
}

export const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash'
];

// ---------------------------------------------------------------------------
// Model memory
//
// Every scan used to walk the whole CANDIDATE_MODELS list from the top. If the first
// four models are not enabled for the API key (common), each uploaded document paid for
// four failed round trips before the working model answered - and a 20-document batch
// paid for 80. The model that answered last is remembered per key and tried first.
// ---------------------------------------------------------------------------
let preferredModel: { apiKey: string; model: string } | null = null;
const modelsWithoutThinkingConfig = new Set<string>();

/** The model that last answered for this API key, if any. */
export function getPreferredGeminiModel(apiKey: string): string | null {
  const key = cleanApiKey(apiKey);
  return preferredModel && preferredModel.apiKey === key ? preferredModel.model : null;
}

export function rememberGeminiModel(apiKey: string, model: string): void {
  const key = cleanApiKey(apiKey);
  if (!key || !model) return;
  preferredModel = { apiKey: key, model };
}

/** Drops the remembered model so the next scan probes the list again. */
export function forgetGeminiModel(): void {
  preferredModel = null;
}

/** Ordered list of models to try: the remembered one first, then the defaults. */
function modelsToTry(apiKey: string): string[] {
  const remembered = getPreferredGeminiModel(apiKey);
  return remembered
    ? [remembered, ...CANDIDATE_MODELS.filter(model => model !== remembered)]
    : [...CANDIDATE_MODELS];
}

function isInvalidApiKeyError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error ?? '')).toUpperCase();
  return message.includes('API_KEY_INVALID')
    || message.includes('API KEY NOT VALID')
    || message.includes('API_KEY_SERVICE_BLOCKED')
    || message.includes('PERMISSION_DENIED');
}

function isThinkingConfigError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase();
  return message.includes('thinking');
}

/**
 * Turns off "thinking" where the model supports it - the extraction is a transcription
 * task, and the default thinking budget is the single biggest latency cost per scan.
 */
function thinkingConfigFor(model: string): Record<string, unknown> | undefined {
  if (modelsWithoutThinkingConfig.has(model)) return undefined;
  if (/^gemini-3/i.test(model)) return { thinkingLevel: 'LOW' };
  if (/^gemini-2\.5/i.test(model)) return { thinkingBudget: 0 };
  return undefined;
}

function withRequestDefaults(config: any, model: string): any {
  const merged = { ...(config || {}) };
  merged.httpOptions = { timeout: GEMINI_REQUEST_TIMEOUT_MS, ...(config?.httpOptions || {}) };
  const thinkingConfig = thinkingConfigFor(model);
  if (thinkingConfig) merged.thinkingConfig = thinkingConfig;
  return merged;
}

function extractJsonFromText(text: string): any {
  const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (initialErr) {
    // Try to find JSON block more carefully
    let jsonText = '';
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let startIdx = -1;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\' && inString) {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
      }
      
      if (!inString) {
        if (char === '{' || char === '[') {
          if (braceCount === 0) startIdx = i;
          braceCount++;
        } else if (char === '}' || char === ']') {
          braceCount--;
          if (braceCount === 0 && startIdx !== -1) {
            jsonText = text.substring(startIdx, i + 1);
            try {
              return JSON.parse(jsonText);
            } catch (e) {
              // Continue searching
              startIdx = -1;
            }
          }
        }
      }
    }
    
    console.warn('JSON extraction failed for text at position with length:', text.length);
    throw initialErr;
  }
}

/**
 * Calls Gemini, remembering the model that works so later scans skip the dead probes.
 * `apiKey` is optional: when omitted the active key from settings is used for the cache.
 */
export async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any,
  config?: any,
  apiKey?: string
) {
  const key = cleanApiKey(apiKey) || getActiveGeminiApiKey();
  let lastError: any = null;

  for (const model of modelsToTry(key)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: withRequestDefaults(config, model)
        });
        if (response) {
          (response as any).activeModel = model;
          rememberGeminiModel(key, model);
          return response;
        }
      } catch (err: any) {
        const message = err?.message || String(err);
        // A bad key will not work on any other model either - fail fast instead of
        // burning five round trips on every document.
        if (isInvalidApiKeyError(err)) {
          forgetGeminiModel();
          throw err;
        }
        // Some models reject the thinking settings; retry once without them.
        if (attempt === 0 && isThinkingConfigError(err)) {
          modelsWithoutThinkingConfig.add(model);
          console.warn(`Gemini model ${model} rejected the thinking settings; retrying without them.`, message);
          continue;
        }
        console.warn(`Gemini model ${model} attempt failed:`, message);
        lastError = err;
        if (getPreferredGeminiModel(key) === model) forgetGeminiModel();
        break;
      }
    }
  }
  throw lastError;
}

export type PRFileInput = string | { base64: string; name?: string };

export class DocumentClassificationError extends Error {
  readonly documentType: 'DELIVERY_CHALLAN' | 'PURCHASE_REQUISITION' | 'OTHER' | 'UNCLEAR';
  readonly fileName?: string;

  constructor(
    documentType: 'DELIVERY_CHALLAN' | 'PURCHASE_REQUISITION' | 'OTHER' | 'UNCLEAR',
    fileName?: string
  ) {
    const name = fileName ? `"${fileName}"` : 'The uploaded document';
    const message = documentType === 'DELIVERY_CHALLAN'
      ? `${name} is a Delivery Challan, not a Purchase Requisition. Use the Delivery Challan upload instead.`
      : `${name} could not be confirmed as a Purchase Requisition. Check the printed document heading and upload it in the correct section.`;
    super(message);
    this.documentType = documentType;
    this.fileName = fileName;
    this.name = 'DocumentClassificationError';
  }
}

function readDocumentType(value: unknown): DocumentClassificationError['documentType'] {
  const type = String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (['PURCHASE_REQUISITION', 'PR', 'DEMAND_SHEET'].includes(type)) return 'PURCHASE_REQUISITION';
  if (['DELIVERY_CHALLAN', 'DC', 'CHALLAN'].includes(type)) return 'DELIVERY_CHALLAN';
  if (type === 'OTHER') return 'OTHER';
  return 'UNCLEAR';
}

async function scanSinglePRDocument(
  ai: GoogleGenAI,
  file: { base64: string; name?: string },
  apiKey: string
): Promise<GeminiExtractionResult[]> {
  const prompt = `
You are an expert document OCR scanner for Star Electric Enterprises (Rawalpindi).
Analyze this document from Jadeed Group (Poultry Division).
${file.name ? `Source Document Filename: "${file.name}"` : ''}

DOCUMENT TYPE CLASSIFICATION (Read from printed heading/format):
RETURN "PURCHASE_REQUISITION" FOR:
- Documents headed "Purchase Requisition", "Demand Sheet", "PR", "Requisition"
- Documents with table containing: QTY, PARTICULARS/DESCRIPTION, UNIT columns
- Documents from Jadeed Group with item requests (not delivery records)
- Documents with "Requested Qty" or similar column headers

RETURN "DELIVERY_CHALLAN" FOR:
- Documents explicitly headed "DELIVERY CHALLAN", "DELIVERY NOTE", "CHALLAN"
- Documents with signature fields and "Received by" sections
- Documents showing "Delivered" items with receiver confirmation
- Example: If you see "Received in good condition" or receiver signature, it's a DC

RETURN "OTHER" or "UNCLEAR" ONLY IF:
- Document is clearly a different type (Invoice, Receipt, etc.)
- Document type cannot be determined from content

⭐ IMPORTANT: If document shows REQUESTED items with quantities (not received items), 
it IS a PURCHASE REQUISITION regardless of exact format.

CRITICAL OCR & TABLE PARSING INSTRUCTIONS:
1. FULL TABLE ROW EXTRACTION (ALL ROWS - MANDATORY):
   - Extract EVERY SINGLE ITEM ROW present in the document from top to bottom!
   - ⚠️ SKIP CROSSED-OUT OR MARKED ITEMS: If an item has a line through it, an X mark, or is visually crossed out, DO NOT INCLUDE IT IN EXTRACTION
   - DO NOT skip rows, DO NOT summarize rows, DO NOT truncate item lists!
   - If the table shows "S.No 1-25", extract all 25 rows (but skip any crossed-out ones). If "1-10", extract all 10 (skip crossed ones).
   - If items overflow to a second page, extract items from BOTH pages (excluding crossed items).
   - After extraction, include "totalRowsExtracted": N in output so we can verify completeness.
   - If you can visually count the rows in the table, verify your extraction matches that count (excluding crossed-out ones).

2. CROSSED-OUT ITEM DETECTION (VERY IMPORTANT):
   - Look for items marked with: diagonal line (/), X marks, strikethrough, or visual crossing
   - These items indicate: Already delivered, Cancelled, Do not supply, or Duplicate
   - EXCLUDE all crossed-out items from the lineItems array
   - Include "crossedOutCount": N to show how many were skipped
   - Never duplicate crossed-out items in output

3. MULTI-PR TABLE GROUPING: 
   - In Jadeed Group demand sheets, a single sheet often contains demands for MULTIPLE PRs (rows with PR 37, PR 66, PR 194 in the 'PR. NO' column).
   - Whenever you see different PR numbers across rows, create a distinct entry in "requisitions" array for each unique PR.
   - Example: If rows show PR-37 (rows 1-5), PR-66 (rows 6-10), PR-194 (rows 11-15):
     - Create requisition#1 with prNumber "PR-37" and rows 1-5
     - Create requisition#2 with prNumber "PR-66" and rows 6-10
     - Create requisition#3 with prNumber "PR-194" and rows 11-15

3. PR NUMBER: Extract the exact PR Number from 'PR . NO' column, document title, or handwritten notes (e.g. PR-37, PR-66, PR-194, PR-139, PR-60, PR-58).
   - Normalize all PR numbers to uppercase format: "PR-37", "PR-66", "PR-194".
   - If no PR number exists in the document, set "prNumber" strictly to "NO PR".

4. SITE NAME & LOCATION: Extract the exact site or warehouse name from the header (e.g. 'Warehouse Rawalpindi', 'P.D Khan Farm', 'Agri Farm Mankera', 'Pending PR Ware House Rawat', 'Feed Mill Khanewal').
   - Preserve original spelling and spacing from document.

5. DATE: Extract the requisition date and format as ISO 8601 YYYY-MM-DD. If missing, use today's date.

6. LINE ITEMS: For each extracted row, include:
   - name: Full item description from Description column
   - brand: Identify from product name or specs (categories: Pakistan Cables, Amer Cables, Schneider Electric, Terasaki, Philips / Pak Lighting, Conduit & Accessories, Switches & Sockets, General Electrical)
   - quantity: Numeric quantity from Qty column
   - unit: Unit from Unit column (Numbers, Feet, Coil, Meters, Pcs, Lengths, Sets, etc.)
   - specifications: Any specs from Specifications/Details column
   - prNumber: PR number for this row (if multi-PR document)
   - For cable items: Distinguish 'Pakistan Cables' from 'Amer Cables' (Amer often described as CU/PVC/PVC or Sheathed Copper)

Return a JSON object in strict valid JSON format:
{
  "documentType": "PURCHASE_REQUISITION",
  "requisitions": [
    {
      "prNumber": "Exact PR ID from document (e.g. 'PR-37', 'PR-66', or 'NO PR')",
      "date": "YYYY-MM-DD",
      "siteName": "Exact site or warehouse name from header",
      "lineItems": [
        {
          "name": "Full item description from Description column",
          "brand": "One of the 8 brand categories listed above",
          "quantity": 10,
          "unit": "Numbers, Feet, Coil, Meters, Pcs, Lengths, Sets, etc.",
          "specifications": "Specifications text or empty string",
          "prNumber": "PR-37 (can differ from parent if multi-PR)"
        }
      ],
      "totalRowsExtracted": 15,
      "confidence": 0.98,
      "rawAnalysis": "Extracted all 15 line items from table. Multi-PR document with PR-37 and PR-66."
    }
  ]
}
`;

  const { mimeType, data } = getPureBase64(file.base64);
  const parts = [
    { text: prompt },
    {
      inlineData: {
        mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
        data: data
      }
    }
  ];

  const response = await generateWithFallback(
    ai,
    [{ role: 'user', parts }],
    {
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    },
    apiKey
  );

  const text = response.text || '';
  const parsed = extractJsonFromText(text);
  const documentType = readDocumentType(parsed.documentType);
  
  // BUG FIX: Be more flexible with PR classification
  // If document has line items, treat as PR even if classification uncertain
  const hasLineItems = (parsed.lineItems || parsed.items || parsed.products || parsed.requisitions || []).length > 0;
  const isLikelyPR = hasLineItems || documentType === 'PURCHASE_REQUISITION';
  
  if (documentType === 'DELIVERY_CHALLAN') {
    // Strict: Never accept DC as PR
    throw new DocumentClassificationError('DELIVERY_CHALLAN', file.name);
  }
  
  if (!isLikelyPR) {
    // Flexible: If not explicitly DC, treat as PR if has content or unclear
    console.warn(`[PR Classification] Document type: ${documentType}, has items: ${hasLineItems}. Proceeding as PR.`);
  }

  let resultList: GeminiExtractionResult[] = [];
  if (parsed.requisitions && Array.isArray(parsed.requisitions)) {
    resultList = parsed.requisitions;
  } else {
    // If returned flat object with lineItems or items
    const rawItems: any[] = parsed.lineItems || parsed.items || parsed.products || parsed.demandItems || [];
    if (rawItems.length > 0) {
      // Check if items have individual PR numbers (e.g. PR 37, 66, 194)
      const prGroups = new Map<string, any[]>();
      rawItems.forEach(it => {
        let itPr = (it.prNumber ? String(it.prNumber).trim() : (parsed.prNumber || 'NO PR')).toUpperCase();
        if (!itPr.startsWith('PR') && itPr !== 'NO PR') {
          itPr = `PR-${itPr.replace(/[^a-zA-Z0-9]/g, '')}`;
        }
        if (!prGroups.has(itPr)) prGroups.set(itPr, []);
        prGroups.get(itPr)!.push(it);
      });

      if (prGroups.size > 1) {
        prGroups.forEach((items, groupPr) => {
          resultList.push({
            prNumber: groupPr,
            date: parsed.date || new Date().toISOString().split('T')[0],
            siteName: parsed.siteName || 'Pending PR Ware House Rawat - Jadeed Group',
            lineItems: items,
            confidence: 0.96,
            rawAnalysis: `Extracted multi-PR group ${groupPr}`
          });
        });
      } else {
        resultList = [{
          prNumber: parsed.prNumber || 'NO PR',
          date: parsed.date || new Date().toISOString().split('T')[0],
          siteName: parsed.siteName || 'Pending PR Ware House Rawat - Jadeed Group',
          lineItems: rawItems,
          confidence: 0.95,
          rawAnalysis: 'Extracted items'
        }];
      }
    } else if (parsed.prNumber) {
      resultList = [parsed as GeminiExtractionResult];
    }
  }

  // Also check if any single requisition contains items that have different prNumbers internally
  const expandedList: GeminiExtractionResult[] = [];
  for (const req of resultList) {
    const items = req.lineItems || [];
    const itemPrMap = new Map<string, any[]>();
    for (const it of items) {
      const itPr = ((it as any).prNumber ? String((it as any).prNumber).trim() : req.prNumber || 'NO PR').toUpperCase();
      const normItPr = !itPr.startsWith('PR') && itPr !== 'NO PR' ? `PR-${itPr.replace(/[^a-zA-Z0-9]/g, '')}` : itPr;
      if (!itemPrMap.has(normItPr)) itemPrMap.set(normItPr, []);
      itemPrMap.get(normItPr)!.push(it);
    }

    if (itemPrMap.size > 1) {
      itemPrMap.forEach((grpItems, grpPr) => {
        expandedList.push({
          ...req,
          prNumber: grpPr,
          lineItems: grpItems
        });
      });
    } else {
      expandedList.push(req);
    }
  }

  return expandedList.map(req => {
    let cleanPr = (req.prNumber && req.prNumber.trim()) ? req.prNumber.trim() : '';
    if (!cleanPr) cleanPr = 'NO PR';

    const items = (req.lineItems || []).map(item => ({
      ...item,
      brand: normalizeBrand(item.brand || item.name)
    }));
    return {
      ...req,
      prNumber: cleanPr,
      lineItems: items
    };
  });
}

// 1. Process Purchase Requisition (PR) Demand Sheets (Supports Single & Large Multi-File Batches)
export async function processDocumentWithGemini(
  base64Images: PRFileInput | PRFileInput[],
  apiKey?: string,
  onProgress?: (progress: { current: number; total: number; fileName: string; status: string }) => void
): Promise<GeminiExtractionResult[]> {
  const rawList = Array.isArray(base64Images) ? base64Images : [base64Images];
  const fileObjects = rawList.map(item => typeof item === 'string' ? { base64: item, name: '' } : item);
  const activeKey = getActiveGeminiApiKey(apiKey);

  if (!activeKey) {
    throw new Error('A Gemini API key is required to verify document type and extract PR details. Add the key in Settings, then retry.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });
    const total = fileObjects.length;
    const gate = new RequestGate(GEMINI_RATE_LIMIT_COOLDOWN_MS);
    const skippedFiles: string[] = [];
    let finished = 0;

    const scanOne = async (file: { base64: string; name?: string }): Promise<GeminiExtractionResult[]> => {
      await gate.wait();
      try {
        return await scanSinglePRDocument(ai, file, activeKey);
      } catch (err) {
        if (isRateLimitError(err)) {
          // Hold the whole batch back instead of hammering a rate-limited endpoint.
          gate.penalize(GEMINI_RATE_LIMIT_COOLDOWN_MS);
          await gate.wait();
          return await scanSinglePRDocument(ai, file, activeKey);
        }
        throw err;
      }
    };

    // Files are independent, so up to GEMINI_FILE_CONCURRENCY documents are read at once.
    const perFile = await mapWithConcurrency(fileObjects, GEMINI_FILE_CONCURRENCY, async (file, i) => {
      const displayName = file.name || `Document #${i + 1}`;
      onProgress?.({
        current: finished,
        total,
        fileName: displayName,
        status: total > 1
          ? `Reading ${displayName} (${finished + 1} of ${total} started, ${GEMINI_FILE_CONCURRENCY} in parallel)...`
          : `Reading ${displayName}...`
      });
      try {
        const singleResult = await scanOne(file);
        if (singleResult.length === 0) {
          throw new Error('No PR data was extracted from this document.');
        }
        // Remember which upload produced these requisitions so the review screen can
        // show the right scan even when one page holds several PR numbers.
        singleResult.forEach(result => {
          if (!result.documentImage) result.documentImage = file.base64;
        });
        finished += 1;
        onProgress?.({
          current: finished,
          total,
          fileName: displayName,
          status: `Read ${displayName}`
        });
        return singleResult;
      } catch (err: any) {
        // Re-throw DC classification errors so the user is sent to the DC uploader.
        if (err instanceof DocumentClassificationError) throw err;
        const skipMsg = `Skipped ${displayName}: ${String(err?.message || err)}`;
        console.warn(skipMsg);
        skippedFiles.push(displayName);
        finished += 1;
        onProgress?.({ current: finished, total, fileName: displayName, status: skipMsg });
        return [] as GeminiExtractionResult[];
      }
    });

    const allResults = perFile.flat();

    if (allResults.length === 0) {
      const skipInfo = skippedFiles.length > 0 ? `\nSkipped files: ${skippedFiles.join(', ')}` : '';
      throw new Error(`No Purchase Requisition documents were extracted.${skipInfo}`);
    }

    if (skippedFiles.length > 0) {
      console.info(`Successfully processed ${allResults.length} requisition(s), skipped ${skippedFiles.length} file(s): ${skippedFiles.join(', ')}`);
    }

    return allResults;
  } catch (error) {
    console.error('Gemini PR API Extraction error:', error);
    throw error;
  }
}

export type DCFileInput = string | { base64: string; name?: string };

async function scanSingleDCDocument(
  ai: GoogleGenAI,
  file: { base64: string; name?: string },
  _index: number,
  knownPRMemory?: string,
  apiKey?: string
): Promise<GeminiDCExtractionResult[]> {
  const prompt = `
You are an expert document OCR scanner for Star Electric Enterprises (Rawalpindi).
Analyze this Delivery Challan (DC) image from Star Electric Enterprises to Jadeed Group.
${file.name ? `Source Document Filename: "${file.name}"` : ''}

DOCUMENT TYPE MUST BE CLASSIFIED FROM THE PRINTED DOCUMENT:
- Return documentType "DELIVERY_CHALLAN" only if this document itself is headed or labeled "DELIVERY CHALLAN", "DELIVERY NOTE", or "CHALLAN".
- Return "PURCHASE_REQUISITION" for an actual requisition/demand sheet, "OTHER" for another document, or "UNCLEAR" if unreadable.
- Do not classify a document as a challan based only on its filename, handwritten PR reference, items, or signature.

${knownPRMemory ? `KNOWN PR REGISTER FOR REFERENCE VALIDATION ONLY:\n${knownPRMemory}\nUse this list only to VALIDATE an explicitly visible, handwritten PR number. Never assign or guess a PR number based on site, date, item similarity, or context.` : ''}

${STAR_DC_LAYOUT_GUIDE}

MANDATORY OCR EXTRACTION RULES:
1. DC NUMBER (STRICT):
   - ALWAYS read the printed/stamped digits next to "No.." (e.g. 682, 683, 684, 685, 674, 673, 668, 667, 666, 614, 613).
   - Set "dcNumber" to "DC-[number]" (e.g. "DC-682", "DC-683", "DC-684", "DC-685").
   - NEVER copy or confuse the PR number into the DC number!

2. PR NUMBER (PURCHASE REQUISITION REFERENCE):
   - CRITICAL: ONLY set prNumber if you see EXPLICIT handwritten or printed "PR-XXX" or "PR XXX" on the document.
   - Look under the "STAR ELECTRIC ENTERPRISES" header or next to "No." for handwritten ink stating "PR-139", "PR-60", "PR-58", "PR-614", etc.
   - If handwritten "PR-XXX" exists and is CLEARLY VISIBLE, set "prNumber" to that exact PR string (e.g. "PR-139").
   - If no PR number is explicitly written/printed on the challan, set "prNumber" to "" (empty string).
   - NEVER infer, guess, or assign a PR number based on: destination site, delivery date, delivered items, filename, or known PR register context.
   - Return "prConfidence": 1.0 if PR is explicitly printed/handwritten, 0.0 if no PR visible.

3. DATE (TOP RIGHT):
   - Look next to "Date" label (e.g., "23-09-2026", "18-09-2026", "17-9-2026", "23/09/2026").
   - Always format as ISO 8601: YYYY-MM-DD (e.g. "2026-09-23").
   - If date is illegible, use today's date format.

4. SITE / DESTINATION NAME:
   - Look on the line next to "JADEED GROUP" or "TO:" label (e.g. "Hatchery Rawat", "Warehouse Rawat", "Warehouse Khanewal via Rawat Warehouse", "Oil Extraction Khanewal").
   - Extract exact spelling and spacing from document.

5. TRANSPORT TYPE:
   - Look for delivery method notation (often near remarks or driver info).
   - Extract one of: "Direct" (if "Direct Delivery", "PCL Direct", "Direct by PCL"), "Adda / Goods Transport" (if "Via Adda", "Via Goods Transport", "Transport"), "Pickup" (if "Pickup", "Customer Pickup").
   - Default to "Adda / Goods Transport" if transport type is unclear or not visible.

6. DRIVER & VEHICLE:
   - Extract driver name (often on lower left).
   - Extract vehicle number/registration (e.g. "STS-1500", "LJ-9999").

7. SHIPPED ITEMS & QUANTITIES:
   - Extract each item accurately with quantity, unit, and brand.
   - Use exact units from document: Numbers, Feet, Coil, Meters, Pcs, Sets, etc.

8. REMARKS:
   - Extract any transport notes (e.g. "Dispatched via Star Electric Express").

Return a JSON object in strict valid JSON format:
{
  "documentType": "DELIVERY_CHALLAN",
  "deliveryChallans": [
    {
      "dcNumber": "DC-682",
      "invoiceNumber": "DC-682",
      "prNumber": "PR-139",
      "prConfidence": 0.95,
      "date": "2026-09-23",
      "siteName": "Hatchery Rawat",
      "transportType": "Adda / Goods Transport",
      "driverName": "Nawaz",
      "vehicleNumber": "STS-1500",
      "remarks": "Dispatched via Star Electric Express",
      "shippedItems": [
        {
          "itemName": "EOCR - Electronic Overload control Relay 5-60AMP Schneider",
          "brand": "Schneider Electric",
          "quantityShipped": 12,
          "unit": "Numbers"
        }
      ],
      "confidence": 0.99,
      "rawAnalysis": "Extracted DC from image. PR number explicitly handwritten on document."
    }
  ]
}
`;

  const { mimeType, data } = getPureBase64(file.base64);
  const parts = [
    { text: prompt },
    {
      inlineData: {
        mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
        data: data
      }
    }
  ];

  const response = await generateWithFallback(
    ai,
    [{ role: 'user', parts }],
    {
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    },
    apiKey
  );

  const text = response.text || '';
  const parsed = extractJsonFromText(text);
  const documentType = readDocumentType(parsed.documentType);
  if (documentType !== 'DELIVERY_CHALLAN') {
    throw new DocumentClassificationError(documentType, file.name);
  }

  let resultList: GeminiDCExtractionResult[] = [];
  if (parsed.deliveryChallans && Array.isArray(parsed.deliveryChallans)) {
    resultList = parsed.deliveryChallans;
  } else if (parsed.dcNumber) {
    resultList = [parsed as GeminiDCExtractionResult];
  }

  return resultList;
}

// 2. Process Delivery Challans (DC) & Invoices (Supports Single & Large Multi-File Batches)
export async function processDCWithGemini(
  base64Images: DCFileInput | DCFileInput[],
  apiKey?: string,
  onProgress?: (progress: { current: number; total: number; fileName: string; status: string }) => void,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const rawList = Array.isArray(base64Images) ? base64Images : [base64Images];
  const fileObjects = rawList.map(item => typeof item === 'string' ? { base64: item, name: '' } : item);

  const activeKey = getActiveGeminiApiKey(apiKey);

  if (!activeKey) {
    throw new Error('A Gemini API key is required to verify Delivery Challan documents and extract their contents. Add the key in Settings, then retry.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });
    const total = fileObjects.length;
    const gate = new RequestGate(GEMINI_RATE_LIMIT_COOLDOWN_MS);
    const skippedFiles: string[] = [];
    let finished = 0;

    const scanOne = async (file: { base64: string; name?: string }, index: number): Promise<GeminiDCExtractionResult[]> => {
      await gate.wait();
      try {
        return await scanSingleDCDocument(ai, file, index, knownPRMemory, activeKey);
      } catch (err) {
        if (isRateLimitError(err)) {
          gate.penalize(GEMINI_RATE_LIMIT_COOLDOWN_MS);
          await gate.wait();
          return await scanSingleDCDocument(ai, file, index, knownPRMemory, activeKey);
        }
        throw err;
      }
    };

    // Challans are independent documents, so several can be read at the same time.
    const perFile = await mapWithConcurrency(fileObjects, GEMINI_FILE_CONCURRENCY, async (file, i) => {
      const displayName = file.name || `Delivery Challan #${i + 1}`;
      onProgress?.({
        current: finished,
        total,
        fileName: displayName,
        status: total > 1
          ? `Reading ${displayName} (${finished + 1} of ${total} started, ${GEMINI_FILE_CONCURRENCY} in parallel)...`
          : `Reading ${displayName}...`
      });
      try {
        const singleResult = await scanOne(file, i);
        if (singleResult.length === 0) {
          throw new Error('No Delivery Challan data was extracted from this document.');
        }
        // Keep the uploaded page with the challan(s) read from it.
        singleResult.forEach(result => {
          if (!result.documentImage) result.documentImage = file.base64;
        });
        finished += 1;
        onProgress?.({ current: finished, total, fileName: displayName, status: `Read ${displayName}` });
        return singleResult;
      } catch (err: any) {
        if (err instanceof DocumentClassificationError) throw err;
        const skipMsg = `Skipped ${displayName}: ${String(err?.message || err)}`;
        console.warn(skipMsg);
        skippedFiles.push(displayName);
        finished += 1;
        onProgress?.({ current: finished, total, fileName: displayName, status: skipMsg });
        return [] as GeminiDCExtractionResult[];
      }
    });

    const allResults = perFile.flat();

    if (allResults.length === 0) {
      const skipInfo = skippedFiles.length > 0 ? `\nSkipped files: ${skippedFiles.join(', ')}` : '';
      throw new Error(`No Delivery Challan documents were extracted.${skipInfo}`);
    }

    if (skippedFiles.length > 0) {
      console.info(`Successfully processed ${allResults.length} DC record(s), skipped ${skippedFiles.length} file(s): ${skippedFiles.join(', ')}`);
    }

    return allResults;
  } catch (error) {
    console.error('Gemini DC API Extraction error:', error);
    throw error;
  }
}

// 3. Process Goods Delivered Builty / Bilty Receipts (Supports Single or Batch Uploads)
export async function processBuiltyWithGemini(
  base64Images: DCFileInput | DCFileInput[],
  apiKey?: string
): Promise<GeminiBuiltyExtractionResult[]> {
  const rawList = Array.isArray(base64Images) ? base64Images : [base64Images];
  const fileObjects = rawList.map(item => typeof item === 'string' ? { base64: item, name: '' } : item);
  const images = fileObjects.map(f => f.base64);

  const activeKey = getActiveGeminiApiKey(apiKey);

  if (!activeKey) {
    throw new Error('A Gemini API key is required to extract optional builty details. Add the key in Settings, then retry.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });
    const prompt = `
You are an expert Goods Transport Bilty (بِلٹی / Consignment Receipt) document OCR specialist for Star Electric Enterprises (Rawalpindi) supplying electrical goods and equipment to Jadeed Group across Pakistan.

Analyze the provided ${images.length} Goods Transport Builty image(s)/receipt(s).
Every builty has been issued by a Pakistani Goods Transport Company / Adda (e.g. Tariq Goods, Rawalpindi Goods Transport Adda, Faisal Movers Goods, New Khan, Al-Madina, Al-Saif, TCS, Leopard, etc.).

DELIVERY CHALLAN (DC) NUMBER:
Extract a DC number only when it is clearly written or stamped on the builty. Look for:
- "DC# 674", "DC 674", "DC-674", "DC No 674", "Challan No 674", "Challan #674"
- "DC# 668", "DC 668", "DC-668", "DC 667", "DC 673", "DC 666"
- Handwritten numbers near the top, margin, header, or inside the particulars/description column referencing a DC.
- Never infer a DC number from a bilty number, filename, destination, or example. If none is legible, return an empty string.

CRITICAL FIELDS TO EXTRACT FOR EACH BUILTY RECEIPT:
1. "dcNumber": The DC number explicitly mentioned or written on the builty (e.g. "DC-674", "DC-667").
2. "builtyNumber": The printed receipt/consignment or bilty voucher number (e.g. "78412", "CN-491", "10283").
3. "addaName": Name of the goods transport company/adda (e.g. "Tariq Goods Transport Co.", "Rawalpindi Goods Transport Adda", "Faisal Movers Goods", "New Khan Transport", "Al-Madina Goods").
4. "destinationCity": Destination city/station (e.g. "Khanewal", "Sahiwal", "Mankera", "Rawat", "Faisalabad", "Chakwal", "Bhakkar", "Lahore").
5. "packagesCount": Description and quantity of bundles/cartons/packages (e.g. "3 Bundles Flexible Cable", "2 Cartons Wall Lights", "1 Wooden Case Breaker").
6. "freightCharges": Numeric freight/rent amount (کرایہ) in PKR (e.g., 750, 1200, 500, 0).
7. "freightStatus": One of 'Paid' (ادا شدہ / وصول شد), 'To Pay' (باقی / وصول طلب), or 'Free' (مفت).
8. "builtyDate": Date written on receipt formatted as YYYY-MM-DD.
9. "sender": Sender company name (e.g. "Star Electric Enterprises Rawalpindi").
10. "receiver": Consignee/Receiver name (e.g. "Jadeed Group", "Jadeed Feeds", "Jadeed Farms").

Return a JSON object in strict valid JSON format:
{
  "builtys": [
    {
      "dcNumber": "DC-674",
      "builtyNumber": "78412",
      "addaName": "Tariq Goods Transport Saddar Rawalpindi",
      "destinationCity": "Khanewal",
      "packagesCount": "3 Bundles Flexible Cable",
      "freightCharges": 750,
      "freightStatus": "Paid",
      "builtyDate": "2026-09-18",
      "sender": "Star Electric Enterprises",
      "receiver": "Jadeed Group Oil Extraction Khanewal",
      "confidence": 0.99,
      "rawAnalysis": "Extracted Builty #78412 for DC-674 via Tariq Goods"
    }
  ]
}
`;

    const parts: any[] = [{ text: prompt }];
    images.forEach(img => {
      const { mimeType, data } = getPureBase64(img);
      parts.push({
        inlineData: {
          mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
          data: data
        }
      });
    });

    const response = await generateWithFallback(
      ai,
      [{ role: 'user', parts }],
      {
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      },
      activeKey
    );

    const text = response.text || '';
    const parsed = extractJsonFromText(text);

    let resultList: GeminiBuiltyExtractionResult[] = [];
    if (parsed.builtys && Array.isArray(parsed.builtys)) {
      resultList = parsed.builtys;
    } else if (parsed.builtyNumber || parsed.dcNumber) {
      resultList = [parsed as GeminiBuiltyExtractionResult];
    }

    // Attach builty images to results
    resultList = resultList.map((b, idx) => {
      let cleanDc = (b.dcNumber || '').trim().toUpperCase();
      if (cleanDc && !cleanDc.startsWith('DC-')) {
        const digits = cleanDc.replace(/[^0-9]/g, '');
        if (digits) cleanDc = `DC-${digits}`;
      }
      return {
        ...b,
        dcNumber: cleanDc,
        builtyImage: images[idx] || images[0] || undefined
      };
    });

    if (resultList.length === 0) throw new Error('No builty details could be extracted from the uploaded document.');
    return resultList;
  } catch (error) {
    console.error('Gemini Builty API Extraction error:', error);
    throw error;
  }
}

