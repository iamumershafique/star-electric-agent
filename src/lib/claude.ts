import type { DCRecord, PRRecord } from '../types';
import { cleanApiKey } from './utils';
import {
  getAgentRouterApiKey,
  getAgentRouterModel,
  getClaudeApiKey
} from './storage';
import { getImageFromMemory } from './imageStorage';

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_VERSION = '2023-06-01';
const AGENTROUTER_API_BASE = 'https://agentrouter.org/v1';
const BATCH_SIZE = 5;

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
}

export interface ClaudeAuditFinding {
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

export interface ClaudeLinkSuggestion {
  dcId: string;
  dcNumber: string;
  prId: string;
  prNumber: string;
  visiblePRNumber: string;
  confidence: number;
  evidence: string;
}

export interface ClaudeAuditResult {
  findings: ClaudeAuditFinding[];
  suggestions: ClaudeLinkSuggestion[];
  completed: number;
  total: number;
}

type ProgressHandler = (current: number, total: number) => void;
type JsonObject = Record<string, unknown>;

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

function normalizeReference(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function getActiveClaudeKey(apiKey?: string): string {
  return cleanApiKey(apiKey) || getClaudeApiKey();
}

function getActiveAgentRouterKey(): string {
  return getAgentRouterApiKey();
}

function extractText(response: unknown): string {
  const body = asObject(response);
  if (!body || !Array.isArray(body.content)) {
    throw new Error('Claude returned an invalid response.');
  }
  const text = body.content
    .map(item => asObject(item))
    .filter(item => item?.type === 'text')
    .map(item => asString(item?.text))
    .filter(Boolean)
    .join('\n');
  if (!text) throw new Error('Claude response did not contain audit results.');
  return text;
}

function parseJson(text: string): JsonObject {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    const value: unknown = JSON.parse(cleaned);
    const object = asObject(value);
    if (object) return object;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const value: unknown = JSON.parse(cleaned.slice(start, end + 1));
      const object = asObject(value);
      if (object) return object;
    }
  }
  throw new Error('Claude did not return valid JSON audit results.');
}

function readImageData(image?: string): { mediaType: string; data: string } | null {
  if (!image) return null;
  const match = image.match(/^data:(image\/(?:jpeg|png|gif|webp)|application\/pdf);base64,([\s\S]+)$/i);
  if (!match) return null;
  return { mediaType: match[1].toLowerCase(), data: match[2].replace(/\s/g, '') };
}

async function resolveImage(record: AuditRecord): Promise<void> {
  let image = record.documentImage;
  if (image?.startsWith('indexeddb:')) image = undefined;
  if (!image) {
    image = await getImageFromMemory(record.kind.toLowerCase() as 'pr' | 'dc', record.recordNumber) ||
      await getImageFromMemory(record.kind.toLowerCase() as 'pr' | 'dc', record.id);
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

  if (!readImageData(image)) {
    record.imageError = 'The source scan is not a supported image or PDF.';
    return;
  }
  record.documentImage = image;
  record.imageAvailable = true;
  record.imageError = undefined;
}

async function requestAuditBatch(apiKey: string, records: AuditRecord[]): Promise<unknown> {
  const routerKey = getActiveAgentRouterKey();
  const routerModel = getAgentRouterModel();
  if (routerKey && !routerModel) {
    throw new Error('Set the exact vision-capable Claude model ID in AgentRouter settings before running an audit.');
  }
  if (routerKey) {
    records.forEach(record => {
      if (record.documentImage && readImageData(record.documentImage)?.mediaType === 'application/pdf') {
        record.imageAvailable = false;
        record.imageError = 'AgentRouter chat-completions audit currently supports image scans only; this PDF was not sent.';
      }
    });
  }

  const prompt = `Audit these portal records against their attached original documents.
Treat the printed document heading and printed reference numbers as authoritative.
Do not infer PR↔DC links from site, date, item similarity, or sequence.
Return ONLY JSON: {"results":[{"recordId":"exact supplied id","documentType":"PURCHASE_REQUISITION|DELIVERY_CHALLAN|OTHER|UNCLEAR","printedNumber":"reference visible on this document, or empty","printedPRNumber":"PR number explicitly printed on this document, or empty","printedSite":"site exactly as read, or empty","confidence":0.0,"findings":["specific discrepancy or missing/unclear evidence"]}]}.
For each image, the immediately preceding text identifies its record. Some records have no readable image; for those, report UNCLEAR and state that the source scan is unavailable. Never fabricate values.
Portal record metadata:
${JSON.stringify(records.map(record => ({
  kind: record.kind,
  id: record.id,
  recordNumber: record.recordNumber,
  date: record.date,
  siteName: record.siteName,
  linkedPRNumber: record.linkedPRNumber,
  lineSummary: record.lineSummary,
  imageAvailable: record.imageAvailable,
  imageError: record.imageError
})), null, 2)}`;

  const content: Record<string, unknown>[] = [{ type: 'text', text: prompt }];

  for (const record of records) {
    const image = readImageData(record.documentImage);
    if (!image) continue;
    if (routerKey && image.mediaType === 'application/pdf') continue;
    content.push({ type: 'text', text: `Source document for record ${record.id} (${record.kind} ${record.recordNumber}):` });
    if (routerKey) {
      content.push({
        type: 'image_url',
        image_url: { url: `data:${image.mediaType};base64,${image.data}`, detail: 'high' }
      });
      continue;
    }
    if (image.mediaType === 'application/pdf') {
      content.push({
        type: 'document',
        source: { type: 'base64', media_type: image.mediaType, data: image.data }
      });
    } else {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: image.mediaType, data: image.data }
      });
    }
  }

  let response: Response;
  try {
    if (routerKey) {
      response = await fetch(`${AGENTROUTER_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${routerKey}`
        },
        body: JSON.stringify({
          model: routerModel,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content }]
        })
      });
    } else {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          messages: [{ role: 'user', content }]
        })
      });
    }
  } catch (error) {
    throw new Error(`Could not reach ${routerKey ? 'AgentRouter' : 'Anthropic Claude'} API: ${String(error)}`);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorBody = asObject(asObject(body)?.error);
    const message = asString(errorBody?.message) || asString(asObject(body)?.message) || `HTTP ${response.status}`;
    if (response.status === 401 || response.status === 403) {
      throw new Error(`${routerKey ? 'AgentRouter' : 'Claude'} authentication or permissions failed: ${message}`);
    }
    if (response.status === 429) {
      throw new Error(`${routerKey ? 'AgentRouter' : 'Claude'} rate limit or quota reached: ${message}`);
    }
    throw new Error(`${routerKey ? 'AgentRouter' : 'Claude'} request failed (${response.status}): ${message}`);
  }

  if (routerKey) {
    const choice = asObject(asArray(asObject(body)?.choices)[0]);
    const message = asObject(choice?.message);
    const text = typeof message?.content === 'string'
      ? message.content
      : asArray(message?.content).map(item => asString(asObject(item)?.text)).filter(Boolean).join('\n');
    if (!text) throw new Error('AgentRouter response did not contain audit results.');
    return parseJson(text);
  }
  return parseJson(extractText(body));
}

export async function validateAgentRouterApiKey(
  apiKey: string,
  model: string
): Promise<{ valid: boolean; error?: string }> {
  const key = cleanApiKey(apiKey);
  const cleanModel = model.trim();
  if (!key) return { valid: false, error: 'Enter an AgentRouter API token.' };
  if (!cleanModel) return { valid: false, error: 'Enter the exact vision-capable Claude model ID shown by AgentRouter.' };

  try {
    const response = await fetch(`${AGENTROUTER_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: cleanModel,
        max_tokens: 8,
        messages: [{ role: 'user', content: 'Reply with OK.' }]
      })
    });
    const body: unknown = await response.json().catch(() => null);
    if (response.ok) return { valid: true };
    const errorBody = asObject(asObject(body)?.error);
    const message = asString(errorBody?.message) || asString(asObject(body)?.message) || `HTTP ${response.status}`;
    return { valid: false, error: `AgentRouter API test failed: ${message}` };
  } catch (error) {
    return { valid: false, error: `Could not reach AgentRouter API: ${String(error)}` };
  }
}

export async function validateClaudeApiKey(apiKey: string): Promise<{ valid: boolean; error?: string; model?: string }> {
  const key = cleanApiKey(apiKey);
  if (!key) return { valid: false, error: 'Enter an Anthropic Claude API key to test.' };
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    });
    const body: unknown = await response.json().catch(() => null);
    if (response.ok) return { valid: true, model: CLAUDE_MODEL };
    const error = asObject(asObject(body)?.error);
    const message = asString(error?.message) || `HTTP ${response.status}`;
    return { valid: false, error: `Claude API verification failed: ${message}` };
  } catch (error) {
    return { valid: false, error: `Could not reach Anthropic Claude API: ${String(error)}` };
  }
}

async function buildRecords(prs: PRRecord[], dcs: DCRecord[]): Promise<AuditRecord[]> {
  const prRecords: AuditRecord[] = prs.map(pr => ({
    kind: 'PR',
    id: pr.id,
    recordNumber: pr.prNumber || '',
    date: pr.date || '',
    siteName: pr.siteName || '',
    documentImage: pr.documentImage,
    imageAvailable: false,
    lineSummary: (pr.items || []).map(item =>
      `${item.name || ''} — ${item.requestedQty ?? ''} ${item.unit || ''} (fulfilled ${item.fulfilledQty ?? ''})`
    )
  }));
  const dcRecords: AuditRecord[] = dcs.map(dc => ({
    kind: 'DC',
    id: dc.id,
    recordNumber: dc.dcNumber || '',
    date: dc.date || '',
    siteName: dc.siteName || '',
    linkedPRNumber: dc.prNumber || '',
    documentImage: dc.documentImage,
    imageAvailable: false,
    lineSummary: (dc.itemsShipped || []).map(item =>
      `${item.itemName || ''} — ${item.quantity ?? ''} ${item.unit || ''}`
    )
  }));
  const records = [...prRecords, ...dcRecords];
  await Promise.all(records.map(resolveImage));
  return records;
}

export async function runClaudeDatabaseAudit(
  prs: PRRecord[],
  dcs: DCRecord[],
  onProgress?: ProgressHandler
): Promise<ClaudeAuditResult> {
  const routerKey = getActiveAgentRouterKey();
  const apiKey = routerKey ? '' : getActiveClaudeKey();
  if (!routerKey && !apiKey) {
    throw new Error('Add an AgentRouter API token or Anthropic Claude API key in Settings before running the audit.');
  }

  const records = await buildRecords(prs, dcs);
  const batches: AuditRecord[][] = [];
  for (let index = 0; index < records.length; index += BATCH_SIZE) {
    batches.push(records.slice(index, index + BATCH_SIZE));
  }

  const findings: ClaudeAuditFinding[] = [];
  let completed = 0;
  for (const batch of batches) {
    const response = await requestAuditBatch(apiKey, batch);
    const responseObject = asObject(response);
    const results: unknown[] = Array.isArray(responseObject?.results) ? responseObject.results : [];
    const batchById = new Map(batch.map(record => [record.id, record]));
    const batchFindings: ClaudeAuditFinding[] = [];
    results.forEach((value: unknown) => {
      const result = asObject(value);
      const recordId = asString(result?.recordId);
      const source = batchById.get(recordId);
      if (!source || !result) return;
      batchFindings.push({
        recordType: source.kind,
        recordId,
        recordNumber: source.recordNumber,
        documentType: asString(result.documentType) || 'UNCLEAR',
        printedNumber: asString(result.printedNumber),
        printedPRNumber: asString(result.printedPRNumber),
        printedSite: asString(result.printedSite),
        confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)),
        findings: Array.isArray(result.findings)
          ? result.findings.filter((item): item is string => typeof item === 'string')
          : [],
        imageAvailable: source.imageAvailable,
        imageError: source.imageError
      });
    });
    for (const source of batch) {
      if (!batchFindings.some(finding => finding.recordId === source.id)) {
        batchFindings.push({
          recordType: source.kind,
          recordId: source.id,
          recordNumber: source.recordNumber,
          documentType: 'UNCLEAR',
          printedNumber: '',
          printedPRNumber: '',
          printedSite: '',
          confidence: 0,
          findings: ['Claude returned no result for this record.'],
          imageAvailable: source.imageAvailable,
          imageError: source.imageError || 'Claude returned no result for this record.'
        });
      }
    }
    findings.push(...batchFindings);
    completed += batch.length;
    onProgress?.(completed, records.length);
  }

  const prsByNumber = new Map<string, PRRecord | null>();
  prs.forEach(pr => {
    const number = normalizeReference(pr.prNumber || '');
    if (!number) return;
    prsByNumber.set(number, prsByNumber.has(number) ? null : pr);
  });
  const suggestions: ClaudeLinkSuggestion[] = findings.flatMap(finding => {
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
      evidence: `Claude read ${finding.printedPRNumber} on the DC; it exactly matches the portal PR number.`
    }];
  });

  return { findings, suggestions, completed, total: records.length };
}
