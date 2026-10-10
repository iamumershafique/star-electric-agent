import { getOpenAIApiKey, getOllamaEndpoint, getClaudeApiKey, getAgentRouterApiKey, getPreferredOCRProvider } from './storage';
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
import {
  processBuiltyWithOllama,
  processDCWithOllama,
  processDocumentWithOllama
} from './ollama';
import type {
  GeminiBuiltyExtractionResult,
  GeminiDCExtractionResult,
  GeminiExtractionResult
} from '../types';

export type OCRProviderName = 'Ollama' | 'Gemini' | 'Claude' | 'OpenAI' | 'None';
export type OCRProgressHandler = (progress: {
  current: number;
  total: number;
  fileName: string;
  status: string;
}) => void;

export function getOCRProviderLabel(provider: OCRProviderName): string {
  switch (provider) {
    case 'Ollama': return 'Ollama OCR';
    case 'Gemini': return 'Gemini AI';
    case 'Claude': return 'Claude AI';
    case 'OpenAI': return 'OpenAI Vision';
    default: return 'AI Vision';
  }
}

/**
 * Returns the currently active AI provider based on preference and availability:
 * Preferred setting takes precedence if configured, otherwise auto priority:
 * 1. Ollama (if explicitly connected/configured)
 * 2. Gemini (Portal default engine)
 * 3. Claude
 * 4. OpenAI
 */
export function getActiveOCRProvider(geminiApiKey?: string): OCRProviderName {
  const preferred = getPreferredOCRProvider();
  const hasGemini = !!getActiveGeminiApiKey(geminiApiKey);
  const hasOllama = !!getOllamaEndpoint();
  const hasClaude = !!(getClaudeApiKey() || getAgentRouterApiKey());
  const hasOpenAI = !!getOpenAIApiKey();

  if (preferred === 'gemini' && hasGemini) return 'Gemini';
  if (preferred === 'ollama' && hasOllama) return 'Ollama';
  if (preferred === 'claude' && hasClaude) return 'Claude';
  if (preferred === 'openai' && hasOpenAI) return 'OpenAI';

  if (hasOllama) return 'Ollama';
  if (hasGemini) return 'Gemini';
  if (hasClaude) return 'Claude';
  if (hasOpenAI) return 'OpenAI';
  return 'None';
}

export async function processDocumentWithAI(
  files: PRFileInput | PRFileInput[],
  geminiApiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiExtractionResult[]> {
  const provider = getActiveOCRProvider(geminiApiKey);

  if (provider === 'Ollama') {
    const ollamaEndpoint = getOllamaEndpoint();
    try {
      return await processDocumentWithOllama(files, ollamaEndpoint, undefined, onProgress);
    } catch (ollamaErr) {
      console.warn('[AI Routing] Ollama failed or offline, falling back to Gemini...', ollamaErr);
      const activeGemini = getActiveGeminiApiKey(geminiApiKey);
      if (activeGemini) {
        return processDocumentWithGemini(files, activeGemini, onProgress);
      }
      throw ollamaErr;
    }
  }

  if (provider === 'OpenAI') {
    const openAIKey = getOpenAIApiKey();
    if (openAIKey) {
      return processDocumentWithOpenAI(files, openAIKey, onProgress);
    }
  }

  const activeGemini = getActiveGeminiApiKey(geminiApiKey);
  return processDocumentWithGemini(files, activeGemini || geminiApiKey, onProgress);
}

export async function processDCWithAI(
  files: DCFileInput | DCFileInput[],
  geminiApiKey?: string,
  onProgress?: OCRProgressHandler,
  knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const provider = getActiveOCRProvider(geminiApiKey);

  if (provider === 'Ollama') {
    const ollamaEndpoint = getOllamaEndpoint();
    try {
      return await processDCWithOllama(files, ollamaEndpoint, undefined, onProgress, knownPRMemory);
    } catch (ollamaErr) {
      console.warn('[AI Routing] Ollama failed or offline, falling back to Gemini...', ollamaErr);
      const activeGemini = getActiveGeminiApiKey(geminiApiKey);
      if (activeGemini) {
        return processDCWithGemini(files, activeGemini, onProgress, knownPRMemory);
      }
      throw ollamaErr;
    }
  }

  if (provider === 'OpenAI') {
    const openAIKey = getOpenAIApiKey();
    if (openAIKey) {
      return processDCWithOpenAI(files, openAIKey, onProgress, knownPRMemory);
    }
  }

  const activeGemini = getActiveGeminiApiKey(geminiApiKey);
  return processDCWithGemini(files, activeGemini || geminiApiKey, onProgress, knownPRMemory);
}

export async function processBuiltyWithAI(
  files: DCFileInput | DCFileInput[],
  geminiApiKey?: string
): Promise<GeminiBuiltyExtractionResult[]> {
  const provider = getActiveOCRProvider(geminiApiKey);

  if (provider === 'Ollama') {
    const ollamaEndpoint = getOllamaEndpoint();
    try {
      return await processBuiltyWithOllama(files, ollamaEndpoint);
    } catch (ollamaErr) {
      console.warn('[AI Routing] Ollama failed or offline, falling back to Gemini...', ollamaErr);
      const activeGemini = getActiveGeminiApiKey(geminiApiKey);
      if (activeGemini) {
        return processBuiltyWithGemini(files, activeGemini);
      }
      throw ollamaErr;
    }
  }

  if (provider === 'OpenAI') {
    const openAIKey = getOpenAIApiKey();
    if (openAIKey) {
      return processBuiltyWithOpenAI(files, openAIKey);
    }
  }

  const activeGemini = getActiveGeminiApiKey(geminiApiKey);
  return processBuiltyWithGemini(files, activeGemini || geminiApiKey);
}
