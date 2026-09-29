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
  processDocumentWithOllama
} from './ollama';
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
  return `${fileCount} files at roughly 1 minute each is about ${fileCount} minutes on this PC. Keep this window open, or scan in batches of 10–20.`;
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
 * Runs each file through Ollama first. A wrong document type is reported as-is; any other
 * Ollama failure (not running, timeout, unreadable output) falls back to Gemini for that file
 * when a Gemini key is configured.
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
  for (let index = 0; index < files.length; index++) {
    try {
      results.push(...await viaOllama(files[index], index));
    } catch (error) {
      if (error instanceof DocumentClassificationError || !hasGemini) throw error;
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`Ollama OCR failed for ${fileName(files[index], index)}; using Gemini.`, reason);
      onProgress?.({
        current: index + 1,
        total: files.length,
        fileName: fileName(files[index], index),
        status: `Local model failed (${reason.slice(0, 120)}). Retrying with Gemini...`
      });
      results.push(...await viaGemini([files[index]]));
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
    batch => processDCWithGemini(batch, geminiApiKey, onProgress, knownPRMemory));
}

export function processBuiltyWithAI(
  files: DCFileInput | DCFileInput[],
  geminiApiKey?: string
): Promise<GeminiBuiltyExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return withOllamaFirst(list, geminiApiKey, undefined,
    file => processBuiltyWithOllama(file),
    batch => processBuiltyWithGemini(batch, geminiApiKey));
}
