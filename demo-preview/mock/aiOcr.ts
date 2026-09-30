/**
 * DEMO PREVIEW ONLY. Stub for src/lib/aiOcr used by demo-preview.
 *
 * Produces deterministic sample extractions with realistic progress events so the updated
 * scan windows (parallel reads, per-file progress, warm-up, compact PR register, item
 * matching) can be walked through without a Gemini key or a local Ollama model.
 */
import { mockScan } from './seedData';
import type {
  GeminiBuiltyExtractionResult,
  GeminiDCExtractionResult,
  GeminiExtractionResult
} from '../../src/types';

export type OCRProviderName = 'Ollama' | 'Ollama + Gemini fallback' | 'Gemini' | 'None';
export type OCRProgressHandler = (progress: { current: number; total: number; fileName: string; status: string }) => void;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function getOCREngineLabel(provider: OCRProviderName): string {
  if (provider.startsWith('Ollama')) return 'Local Ollama';
  if (provider === 'Gemini') return 'Gemini AI';
  return 'AI';
}

export function getActiveOCRProvider(): OCRProviderName {
  return 'Ollama + Gemini fallback';
}

export function getLocalScanWarning(_provider: OCRProviderName, fileCount: number): string {
  if (fileCount <= 10) return '';
  return `${fileCount} files at roughly 1 minute each is about ${fileCount} minutes on this PC. Keep this window open, or scan in batches of 10–20. Lower the scan quality in Settings for a faster read.`;
}

export function getLocalScanQualityNote(): string {
  return 'Local model read quality: Balanced (1152 px).';
}

export async function preloadLocalOCRModel(): Promise<void> {
  await sleep(150);
}

const nameOf = (file: unknown, index: number, prefix: string) => {
  const name = typeof file === 'object' && file && 'name' in file ? String((file as any).name || '') : '';
  return name || `${prefix} #${index + 1}`;
};

const base64Of = (file: unknown): string => (typeof file === 'string' ? file : String((file as any)?.base64 || ''));

/** Files are reported as they "finish", in a throttled 3-at-a-time pattern like the real pipeline. */
async function simulateBatch<T>(
  files: unknown[],
  onProgress: OCRProgressHandler | undefined,
  perFileDelayMs: number,
  build: (file: unknown, index: number) => T[]
): Promise<T[]> {
  const results: T[] = [];
  let finished = 0;
  const lanes = [0, 1, 2];

  const workers = lanes.map(async lane => {
    for (let index = lane; index < files.length; index += lanes.length) {
      const label = nameOf(files[index], index, 'Document');
      onProgress?.({
        current: finished,
        total: files.length,
        fileName: label,
        status: `Reading ${label} (${finished + 1} of ${files.length} started, 3 in parallel)...`
      });
      await sleep(perFileDelayMs + (index % 3) * 250);
      results.push(...build(files[index], index));
      finished += 1;
      onProgress?.({ current: finished, total: files.length, fileName: label, status: `Read ${label}` });
    }
  });

  await Promise.all(workers);
  return results;
}

let prCounter = 920;

export function processDocumentWithAI(
  files: unknown | unknown[],
  _apiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return simulateBatch(list, onProgress, 1600, (file, index) => {
    // One page can hold several requisitions - exactly what the real pipeline supports.
    const pageScan = base64Of(file) || mockScan('PR PAGE');
    const firstNumber = `PR-${prCounter++}`;
    const secondNumber = index % 2 === 0 ? `PR-${prCounter++}` : '';
    const shared = {
      date: '2026-09-28',
      siteName: index % 2 === 0 ? 'Hatchery Rawat' : 'Feed Mill Khanewal',
      confidence: 0.94,
      rawAnalysis: 'Demo extraction (no AI was called).',
      documentImage: pageScan
    };
    const results: GeminiExtractionResult[] = [
      {
        ...shared,
        prNumber: firstNumber,
        lineItems: [
          { name: 'EOCR- Electronic Overload controls Relay Schneider', brand: 'Schneider Electric', quantity: 12, unit: 'Numbers' },
          { name: 'Limit Switch Heavy Duty Industrial', brand: 'General Electrical', quantity: 36, unit: 'Numbers' }
        ]
      }
    ];
    if (secondNumber) {
      results.push({
        ...shared,
        prNumber: secondNumber,
        lineItems: [
          { name: 'MCCB 630Amp 36kA Adjustable High Breaking Terasaki', brand: 'Terasaki', quantity: 1, unit: 'Numbers' },
          { name: 'Industrial Plug/Socket 5-pin 16AMP', brand: 'Switches & Sockets', quantity: 50, unit: 'Set' }
        ]
      });
    }
    return results;
  });
}

let dcCounter = 912;

export function processDCWithAI(
  files: unknown | unknown[],
  _apiKey?: string,
  onProgress?: OCRProgressHandler,
  _knownPRMemory?: string
): Promise<GeminiDCExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  return simulateBatch(list, onProgress, 1800, file => {
    const number = dcCounter++;
    return [{
      documentType: 'DELIVERY_CHALLAN',
      dcNumber: `DC-${number}`,
      invoiceNumber: `DC-${number}`,
      // Deliberately vague on one file so the reviewer has to pick the PR.
      prNumber: number % 2 === 0 ? 'PR-905' : '',
      date: '2026-09-29',
      siteName: number % 2 === 0 ? 'Hatchery Rawat' : 'Feed Mill Khanewal',
      driverName: 'Nawaz',
      vehicleNumber: 'STS-1500',
      remarks: 'Demo scan',
      shippedItems: [
        { itemName: 'EOCR Relay Schneider', brand: 'Schneider Electric', quantityShipped: 12, unit: 'Numbers' },
        { itemName: 'Limit switch', brand: 'General Electrical', quantityShipped: 36, unit: 'Numbers' }
      ],
      confidence: 0.93,
      documentImage: base64Of(file) || mockScan(`DC-${number}`, 'DEMO DELIVERY CHALLAN')
    }];
  });
}

export function processBuiltyWithAI(
  files: unknown | unknown[],
  _apiKey?: string,
  onProgress?: OCRProgressHandler
): Promise<GeminiBuiltyExtractionResult[]> {
  const list = Array.isArray(files) ? files : [files];
  let counter = 0;
  return simulateBatch(list, onProgress, 1500, file => {
    counter += 1;
    return [{
      dcNumber: counter % 2 === 0 ? 'DC-908' : 'DC-909',
      builtyNumber: String(78412 + counter),
      addaName: 'Tariq Goods Transport Saddar Rawalpindi',
      destinationCity: 'Khanewal',
      packagesCount: '3 Bundles Flexible Cable',
      freightCharges: 750,
      freightStatus: 'Paid',
      builtyDate: '2026-09-28',
      sender: 'Star Electric Enterprises Rawalpindi',
      receiver: 'Jadeed Group',
      builtyImage: base64Of(file) || mockScan('BUILTY', 'DEMO TRANSPORT RECEIPT'),
      confidence: 0.92
    }];
  });
}
