import { getOpenAIApiKey } from './storage';
import {
  getActiveGeminiApiKey,
  processBuiltyWithGemini,
  processDCWithGemini,
  processDocumentWithGemini,
  type DCFileInput,
  type PRFileInput
} from './gemini';
import {
  processBuiltyWithOpenAI,
  processDCWithOpenAI,
  processDocumentWithOpenAI
} from './openai';
import type {
  GeminiBuiltyExtractionResult,
  GeminiDCExtractionResult,
  GeminiExtractionResult
} from '../types';

export type OCRProviderName = 'OpenAI' | 'Gemini' | 'None';
export type OCRProgressHandler = (progress: {
  current: number;
  total: number;
  fileName: string;
  status: string;
}) => void;

export function getActiveOCRProvider(geminiApiKey?: string): OCRProviderName {
  if (getOpenAIApiKey()) return 'OpenAI';
  return getActiveGeminiApiKey(geminiApiKey) ? 'Gemini' : 'None';
}

export function processDocumentWithAI(
  files: PRFileInput | PRFileInput[],
  geminiApiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiExtractionResult[]> {
  const openAIKey = getOpenAIApiKey();
  return openAIKey
    ? processDocumentWithOpenAI(files, openAIKey, onProgress)
    : processDocumentWithGemini(files, geminiApiKey, onProgress);
}

export function processDCWithAI(
  files: DCFileInput | DCFileInput[],
  geminiApiKey?: string,
  onProgress?: OCRProgressHandler,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const openAIKey = getOpenAIApiKey();
  return openAIKey
    ? processDCWithOpenAI(files, openAIKey, onProgress, knownPRMemory)
    : processDCWithGemini(files, geminiApiKey, onProgress, knownPRMemory);
}

export function processBuiltyWithAI(
  files: DCFileInput | DCFileInput[],
  geminiApiKey?: string
): Promise<GeminiBuiltyExtractionResult[]> {
  const openAIKey = getOpenAIApiKey();
  return openAIKey
    ? processBuiltyWithOpenAI(files, openAIKey)
    : processBuiltyWithGemini(files, geminiApiKey);
}
