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

export type OCRProviderName = 'Ollama' | 'None';
export type OCRProgressHandler = (progress: {
  current: number;
  total: number;
  fileName: string;
  status: string;
}) => void;

/** Short engine name for buttons and status text. */
export function getOCREngineLabel(provider: OCRProviderName): string {
  if (provider === 'Ollama') return 'Local Ollama';
  return 'AI';
}

/** Rough CPU-only time for a local batch, shown before large Ollama scans. */
export function getLocalScanWarning(provider: OCRProviderName, fileCount: number): string {
  if (provider !== 'Ollama' || fileCount <= 10) return '';
  return `${fileCount} files at roughly 1 minute each is about ${fileCount} minutes on this PC. Keep this window open, or scan in batches of 10–20. Lower the scan quality in Settings for a faster pass.`;
}

export function getActiveOCRProvider(_geminiApiKey?: string): OCRProviderName {
  return isOllamaEnabled() ? 'Ollama' : 'None';
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
 * Run OCR through Ollama only. Gemini is intentionally no longer required for the portal.
 * If Ollama is disabled or fails, the user is guided to enable local Ollama.
 */
async function withOllamaOnly<T>(
  files: FileInput[],
  onProgress: OCRProgressHandler | undefined,
  viaOllama: (file: FileInput, index: number) => Promise<T[]>
): Promise<T[]> {
  if (!isOllamaEnabled()) {
    throw new Error('Ollama is required for PR/DC scanning. Enable Local Ollama in Settings before uploading documents.');
  }

  const results: T[] = [];
  for (let index = 0; index < files.length; index++) {
    const name = fileName(files[index], index);
    try {
      results.push(...await viaOllama(files[index], index));
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      onProgress?.({
        current: index,
        total: files.length,
        fileName: name,
        status: `Ollama failed (${reason.slice(0, 120)}). Please check the local model or settings.`
      });
      throw error;
    }
  }
  return results;
}

const perFileProgress = (onProgress: OCRProgressHandler | undefined, index: number, total: number): OCRProgressHandler | undefined =>
  onProgress && (progress => onProgress({ ...progress, current: index + 1, total }));

export function processDocumentWithAI(
  files: PRFileInput | PRFileInput[],
  _geminiApiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return withOllamaOnly(list, onProgress, (file, index) =>
    processDocumentWithOllama(file, perFileProgress(onProgress, index, list.length))
  );
}

export function processDCWithAI(
  files: DCFileInput | DCFileInput[],
  _geminiApiKey?: string,
  onProgress?: OCRProgressHandler,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return withOllamaOnly(list, onProgress, (file, index) =>
    processDCWithOllama(file, perFileProgress(onProgress, index, list.length), knownPRMemory)
  ).then(results => results.map(normalizeDCResult));
}

export function processBuiltyWithAI(
  files: DCFileInput | DCFileInput[],
  _geminiApiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiBuiltyExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return withOllamaOnly(list, onProgress, (file, index) =>
    processBuiltyWithOllama(file, perFileProgress(onProgress, index, list.length))
  );
}

/** One-line description of the read quality used by the local model, for the upload modals. */
export function getLocalScanQualityNote(): string {
  const settings = getOllamaSettings();
  if (!isOllamaEnabled(settings)) return '';
  return `Local model read quality: ${SCAN_QUALITY_LABEL[settings.scanQuality]}.`;
}
