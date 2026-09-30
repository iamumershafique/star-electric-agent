import {
  getActiveGeminiApiKey,
  processBuiltyWithGemini,
  processDCWithGemini,
  processDocumentWithGemini,
  DocumentClassificationError,
  type DCFileInput,
  type PRFileInput
} from './gemini';
import {
  isOllamaEnabled,
  processBuiltyWithOllama,
  processDCWithOllama,
  processDocumentWithOllama,
  warmUpOllama,
  OllamaConnectionError
} from './ollama';
import { normalizeDCResult } from './dcLayout';
import { getOllamaSettings } from './storage';
import { SCAN_QUALITY_LABEL } from './scanQuality';
import type {
  GeminiBuiltyExtractionResult,
  GeminiDCExtractionResult,
  GeminiExtractionResult
} from '../types';

export type OCRProviderName = 'Ollama' | 'Ollama + Gemini fallback' | 'Gemini' | 'None';
export type OCRProgressHandler = (progress: {
  current: number;
  total: number;
  fileName: string;
  status: string;
}) => void;

/** Short engine name for buttons and status text. */
export function getOCREngineLabel(provider: OCRProviderName): string {
  if (provider.startsWith('Ollama')) return 'Local Ollama';
  if (provider === 'Gemini') return 'Gemini AI';
  return 'AI';
}

/** Rough CPU-only time for a local batch, shown before large Ollama scans. */
export function getLocalScanWarning(provider: OCRProviderName, fileCount: number): string {
  if (!provider.startsWith('Ollama') || fileCount <= 10) return '';
  return `${fileCount} files at roughly 1 minute each is about ${fileCount} minutes on this PC. Keep this window open, or scan in batches of 10–20. Lower the scan quality in Settings for a faster read.`;
}

export function getActiveOCRProvider(geminiApiKey?: string): OCRProviderName {
  const hasGemini = Boolean(getActiveGeminiApiKey(geminiApiKey));
  if (isOllamaEnabled()) return hasGemini ? 'Ollama + Gemini fallback' : 'Ollama';
  return hasGemini ? 'Gemini' : 'None';
}

type FileInput = PRFileInput | DCFileInput;

const fileName = (file: FileInput, index: number) =>
  (typeof file === 'string' ? '' : file.name || '') || `File #${index + 1}`;

/**
 * Loads the local model into memory before the first document is sent, so the scan does not
 * pay the model load time. No-op when Ollama is disabled or unreachable.
 */
export async function preloadLocalOCRModel(): Promise<void> {
  if (!isOllamaEnabled()) return;
  await warmUpOllama(getOllamaSettings());
}

/**
 * Runs each file through Ollama first. A wrong document type is reported as-is; any other
 * Ollama failure (not running, timeout, unreadable output) falls back to Gemini for that file
 * when a Gemini key is configured.
 *
 * If Ollama fails to answer twice in a row (server off, wrong port, blocked origin) the rest
 * of the batch goes straight to Gemini instead of paying a failed round trip per file.
 */
async function withOllamaFirst<T>(
  files: FileInput[],
  geminiApiKey: string | undefined,
  onProgress: OCRProgressHandler | undefined,
  viaOllama: (file: FileInput, index: number) => Promise<T[]>,
  viaGemini: (files: FileInput[]) => Promise<T[]>
): Promise<T[]> {
  if (!isOllamaEnabled()) return viaGemini(files);
  const hasGemini = Boolean(getActiveGeminiApiKey(geminiApiKey));
  const results: T[] = [];
  let consecutiveOllamaFailures = 0;
  let ollamaSkipped = false;

  for (let index = 0; index < files.length; index++) {
    const name = fileName(files[index], index);
    if (ollamaSkipped) {
      const batch = files.slice(index);
      onProgress?.({ current: index, total: files.length, fileName: name, status: `Local model unavailable; reading the remaining ${batch.length} file(s) with Gemini...` });
      results.push(...await viaGemini(batch));
      break;
    }
    try {
      results.push(...await viaOllama(files[index], index));
      consecutiveOllamaFailures = 0;
    } catch (error) {
      if (error instanceof DocumentClassificationError || !hasGemini) throw error;
      const reason = error instanceof Error ? error.message : String(error);
      const localModelDown = error instanceof OllamaConnectionError;
      consecutiveOllamaFailures = localModelDown ? consecutiveOllamaFailures + 1 : 0;
      if (localModelDown && consecutiveOllamaFailures >= 2) {
        ollamaSkipped = true;
      }
      console.warn(`Ollama OCR failed for ${name}; using Gemini.`, reason);
      onProgress?.({
        current: index,
        total: files.length,
        fileName: name,
        status: `Local model failed (${reason.slice(0, 120)}). Retrying with Gemini...`
      });
      try {
        results.push(...await viaGemini([files[index]]));
      } catch (geminiError) {
        const geminiReason = geminiError instanceof Error ? geminiError.message : String(geminiError);
        throw new Error(`${name}: local Ollama failed (${reason}) and the Gemini fallback also failed (${geminiReason}).`);
      }
    }
  }
  return results;
}

const perFileProgress = (onProgress: OCRProgressHandler | undefined, index: number, total: number): OCRProgressHandler | undefined =>
  onProgress && (progress => onProgress({ ...progress, current: index + 1, total }));

export function processDocumentWithAI(
  files: PRFileInput | PRFileInput[],
  geminiApiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return withOllamaFirst(list, geminiApiKey, onProgress,
    (file, index) => processDocumentWithOllama(file, perFileProgress(onProgress, index, list.length)),
    batch => processDocumentWithGemini(batch, geminiApiKey, onProgress));
}

export function processDCWithAI(
  files: DCFileInput | DCFileInput[],
  geminiApiKey?: string,
  onProgress?: OCRProgressHandler,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return withOllamaFirst(list, geminiApiKey, onProgress,
    (file, index) => processDCWithOllama(file, perFileProgress(onProgress, index, list.length), knownPRMemory),
    batch => processDCWithGemini(batch, geminiApiKey, onProgress, knownPRMemory))
    .then(results => results.map(normalizeDCResult));
}

export function processBuiltyWithAI(
  files: DCFileInput | DCFileInput[],
  geminiApiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiBuiltyExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return withOllamaFirst(list, geminiApiKey, onProgress,
    (file, index) => processBuiltyWithOllama(file, perFileProgress(onProgress, index, list.length)),
    batch => processBuiltyWithGemini(batch, geminiApiKey));
}

/** One-line description of the read quality used by the local model, for the upload modals. */
export function getLocalScanQualityNote(): string {
  const settings = getOllamaSettings();
  if (!isOllamaEnabled(settings)) return '';
  return `Local model read quality: ${SCAN_QUALITY_LABEL[settings.scanQuality]}.`;
}
