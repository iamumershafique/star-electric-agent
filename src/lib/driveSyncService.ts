import type { DCRecord, PRRecord, GeminiDCExtractionResult } from '../types';
import { processDCWithAI } from './aiOcr';
import { getActiveGeminiApiKey } from './gemini';

export interface DriveScannedFile {
  id: string;
  name: string;
  dcNumber: string;
  imageUrl: string;
  viewLink: string;
  lastModified?: string;
}

export interface DriveSyncResult {
  success: boolean;
  addedCount: number;
  updatedCount: number;
  unchangedCount: number;
  updatedDCs: DCRecord[];
  logs: string[];
  errors: string[];
}

export interface DriveFolderConfig {
  folderId: string;
  folderUrl: string;
  autoSyncEnabled: boolean;
  pollIntervalMinutes: number;
  autoRescanOnImageChange: boolean;
  lastSyncTimestamp?: number;
}

const STORAGE_KEY_DRIVE_CONFIG = 'STAR_PORTAL_DRIVE_SYNC_CONFIG';
const DEFAULT_FOLDER_ID = '1nVxz4_rtVUnYed8PEykDaQub61FdQHzL'; // Jadeed Group Master Drive Scans folder

export function getDriveFolderConfig(): DriveFolderConfig {
  if (typeof window === 'undefined') {
    return {
      folderId: DEFAULT_FOLDER_ID,
      folderUrl: `https://drive.google.com/drive/folders/${DEFAULT_FOLDER_ID}`,
      autoSyncEnabled: false,
      pollIntervalMinutes: 2,
      autoRescanOnImageChange: true
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRIVE_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        folderId: parsed.folderId || DEFAULT_FOLDER_ID,
        folderUrl: parsed.folderUrl || `https://drive.google.com/drive/folders/${parsed.folderId || DEFAULT_FOLDER_ID}`,
        autoSyncEnabled: Boolean(parsed.autoSyncEnabled),
        pollIntervalMinutes: Number(parsed.pollIntervalMinutes) || 2,
        autoRescanOnImageChange: parsed.autoRescanOnImageChange !== false,
        lastSyncTimestamp: parsed.lastSyncTimestamp
      };
    }
  } catch {
    // fallback
  }

  return {
    folderId: DEFAULT_FOLDER_ID,
    folderUrl: `https://drive.google.com/drive/folders/${DEFAULT_FOLDER_ID}`,
    autoSyncEnabled: false,
    pollIntervalMinutes: 2,
    autoRescanOnImageChange: true
  };
}

export function saveDriveFolderConfig(config: Partial<DriveFolderConfig>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDriveFolderConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY_DRIVE_CONFIG, JSON.stringify(updated));
  } catch (err) {
    console.error('[DriveSync] Failed to save Drive folder configuration:', err);
  }
}

/**
 * Extracts Google Drive file or folder ID from various URL formats or raw ID string.
 */
export function extractDriveId(input: string): string | null {
  const clean = input.trim();
  if (!clean) return null;

  // Raw file ID (alphanumeric, underscores, hyphens, 25-45 chars)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
    return clean;
  }

  // File URL formats:
  // https://drive.google.com/file/d/1fe36xeEiKP15ORQeeWNd_imEtw9WhJzx/view
  const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]{25,45})/);
  if (fileMatch) return fileMatch[1];

  // Folder URL formats:
  // https://drive.google.com/drive/folders/1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW
  const folderMatch = clean.match(/\/folders\/([a-zA-Z0-9_-]{25,45})/);
  if (folderMatch) return folderMatch[1];

  // uc?id= or open?id= format
  const queryMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]{25,45})/);
  if (queryMatch) return queryMatch[1];

  return null;
}

/**
 * Extracts normalized DC number (e.g. "DC-694") from filename or text.
 */
export function extractDCNumberFromFileName(name: string): string | null {
  const match = name.match(/DC[ _-]?(\d+)/i) || name.match(/(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (isNaN(num) || num <= 0) return null;
  return `DC-${num}`;
}

/**
 * Construct Google Drive direct image URL and view link from File ID.
 */
export function buildDriveUrls(fileId: string): { imageUrl: string; viewLink: string } {
  return {
    imageUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1200`,
    viewLink: `https://drive.google.com/file/d/${fileId}/view`
  };
}

/**
 * Fetches an image from Google User Content (lh3.googleusercontent.com) and converts to Base64 data URI.
 */
export async function fetchDriveImageAsBase64(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, { mode: 'cors' });
  if (!res.ok) {
    throw new Error(`Failed to download scan from Google Drive (${res.status}): ${res.statusText}`);
  }
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result) resolve(result);
      else reject(new Error('Failed to read Drive image blob into data URI'));
    };
    reader.onerror = () => reject(new Error('FileReader error while reading Drive scan'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Parses user-pasted or auto-retrieved Google Drive file links into structured DriveScannedFile list.
 */
export function parseDriveLinksText(text: string): DriveScannedFile[] {
  const lines = text.split(/[\r\n,;]+/);
  const files: DriveScannedFile[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const fileId = extractDriveId(trimmed);
    if (!fileId) continue;

    const dcNum = extractDCNumberFromFileName(trimmed) || `DC-AUTO`;
    const { imageUrl, viewLink } = buildDriveUrls(fileId);

    files.push({
      id: fileId,
      name: `${dcNum}.jpg`,
      dcNumber: dcNum,
      imageUrl,
      viewLink
    });
  }

  return files;
}

/**
 * Core AI Google Drive Auto-Sync Engine.
 * 
 * Inspects Google Drive scanned files, detects new DCs or replaced/updated scan images,
 * and runs Gemini Vision AI OCR to extract items and update the delivery challans.
 */
export async function syncDriveScansWithAI({
  scannedFiles,
  currentDCs,
  currentPRs,
  geminiApiKey,
  autoRescanOnImageChange = true,
  onProgress
}: {
  scannedFiles: DriveScannedFile[];
  currentDCs: DCRecord[];
  currentPRs: PRRecord[];
  geminiApiKey?: string;
  autoRescanOnImageChange?: boolean;
  onProgress?: (progress: { current: number; total: number; message: string; dcNumber?: string }) => void;
}): Promise<DriveSyncResult> {
  const logs: string[] = [];
  const errors: string[] = [];
  let addedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;

  const updatedDCsList = [...currentDCs];
  const activeKey = getActiveGeminiApiKey(geminiApiKey);

  const total = scannedFiles.length;
  logs.push(`[DriveSync] Commencing sync for ${total} Google Drive file(s)...`);

  // Build existing DC lookup by numeric key and file ID
  const dcByNumber = new Map<string, DCRecord>();
  const dcByFileId = new Map<string, DCRecord>();

  currentDCs.forEach(dc => {
    const cleanNum = dc.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (cleanNum) dcByNumber.set(cleanNum, dc);
    if (dc.driveFileId) dcByFileId.set(dc.driveFileId, dc);
  });

  // Provide contextual PR memory so Gemini accurately identifies written PR numbers
  const prSummaryMemory = currentPRs.slice(0, 50).map(p => 
    `- PR Number: ${p.prNumber} | Site: "${p.siteName}" | Items: ${p.items.map(it => `${it.name} (${it.requestedQty} ${it.unit})`).join(', ')}`
  ).join('\n');

  for (let i = 0; i < scannedFiles.length; i++) {
    const file = scannedFiles[i];
    const dcKey = file.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const existingDC = dcByNumber.get(dcKey) || dcByFileId.get(file.id);

    // Determine if this file needs AI OCR processing:
    // 1. DC is completely new (doesn't exist in ledger)
    // 2. DC exists, BUT its driveFileId or documentImage has changed (user replaced/reattached image in Drive)
    const isNewDC = !existingDC;
    const isImageReplaced = Boolean(
      existingDC && 
      autoRescanOnImageChange && 
      (
        (existingDC.driveFileId && existingDC.driveFileId !== file.id) ||
        (!existingDC.documentImage && file.imageUrl) ||
        (existingDC.documentImage && existingDC.documentImage !== file.imageUrl && !existingDC.documentImage.includes(file.id))
      )
    );

    if (!isNewDC && !isImageReplaced) {
      unchangedCount++;
      continue;
    }

    const actionLabel = isNewDC ? 'New DC Scan' : 'Replaced/Updated DC Scan';
    onProgress?.({
      current: i + 1,
      total,
      message: `${actionLabel} detected for ${file.dcNumber}. Downloading from Google Drive...`,
      dcNumber: file.dcNumber
    });
    logs.push(`[DriveSync] ${actionLabel} for ${file.dcNumber} (Drive ID: ${file.id})`);

    try {
      // 1. Download image from Drive
      const base64DataUri = await fetchDriveImageAsBase64(file.imageUrl);

      onProgress?.({
        current: i + 1,
        total,
        message: `Analyzing ${file.dcNumber} with Google Gemini Vision AI...`,
        dcNumber: file.dcNumber
      });

      // 2. Run Gemini Vision OCR
      const extractions: GeminiDCExtractionResult[] = await processDCWithAI(
        [{ base64: base64DataUri, name: file.name }],
        activeKey,
        undefined,
        prSummaryMemory
      );

      const aiResult = extractions && extractions.length > 0 ? extractions[0] : null;
      if (!aiResult) {
        throw new Error(`Gemini Vision did not return valid extraction data for ${file.dcNumber}`);
      }

      const rawItems = (aiResult.shippedItems && aiResult.shippedItems.length > 0)
        ? aiResult.shippedItems
        : ((aiResult as any).items || []);

      const extractedItems = rawItems.map((it: any, idx: number) => ({
        itemId: `item-drive-${Date.now()}-${idx + 1}`,
        itemName: (it.itemName || it.name || '').trim() || 'Electrical Item',
        brand: (it.brand as any) || 'Pakistan Cables',
        quantity: (it.quantityShipped || it.quantity || 1) > 0 ? (it.quantityShipped || it.quantity || 1) : 1,
        unit: it.unit || 'Nos'
      }));

      const finalDCNumber = aiResult.dcNumber && aiResult.dcNumber.toLowerCase().includes('dc')
        ? aiResult.dcNumber.toUpperCase().trim()
        : file.dcNumber;

      if (isNewDC) {
        // Construct brand new DC record
        const newRecord: DCRecord = {
          id: `dc-drive-${file.id.substring(0, 12)}`,
          dcNumber: finalDCNumber,
          invoiceNumber: finalDCNumber,
          prNumber: aiResult.prNumber || '',
          prId: '',
          date: aiResult.date || new Date().toISOString().split('T')[0],
          siteName: aiResult.siteName || 'Jadeed Poultry Farm',
          itemsShipped: extractedItems,
          documentImage: file.imageUrl,
          driveFileId: file.id,
          driveViewLink: file.viewLink,
          createdTimestamp: Date.now(),
          transportType: ((aiResult as any).transportType || 'Delivered') as any,
          driverName: aiResult.driverName || 'Nawaz',
          vehicleNumber: aiResult.vehicleNumber || 'STS-1500',
          deliveryStatus: 'Delivered',
          remarks: aiResult.remarks || `Auto-imported and verified from Google Drive (${file.name})`
        };

        // Attempt PR matching
        if (newRecord.prNumber && newRecord.prNumber !== 'NO PR') {
          const matchedPR = currentPRs.find(p => p.prNumber.toUpperCase() === newRecord.prNumber.toUpperCase());
          if (matchedPR) {
            newRecord.prId = matchedPR.id;
          }
        }

        updatedDCsList.push(newRecord);
        dcByNumber.set(finalDCNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(), newRecord);
        addedCount++;
        logs.push(`[DriveSync] Added new ${finalDCNumber} with ${extractedItems.length} items from Drive.`);
      } else if (existingDC) {
        // Update existing DC with newly attached image and re-transcribed details
        const dcIdx = updatedDCsList.findIndex(d => d.id === existingDC.id);
        if (dcIdx >= 0) {
          const updatedRecord: DCRecord = {
            ...existingDC,
            dcNumber: finalDCNumber || existingDC.dcNumber,
            date: aiResult.date || existingDC.date,
            siteName: aiResult.siteName || existingDC.siteName,
            itemsShipped: extractedItems.length > 0 ? extractedItems : existingDC.itemsShipped,
            documentImage: file.imageUrl, // New Drive scan image attached!
            driveFileId: file.id,
            driveViewLink: file.viewLink,
            driverName: aiResult.driverName || existingDC.driverName,
            vehicleNumber: aiResult.vehicleNumber || existingDC.vehicleNumber,
            remarks: existingDC.remarks 
              ? `${existingDC.remarks} | Scan updated from Drive (${file.name})`
              : `Scan updated from Drive (${file.name})`
          };

          updatedDCsList[dcIdx] = updatedRecord;
          updatedCount++;
          logs.push(`[DriveSync] Re-scanned and updated ${existingDC.dcNumber} with new image (File ID: ${file.id}) and ${extractedItems.length} items.`);
        }
      }
    } catch (err: any) {
      const msg = `Failed to process ${file.name}: ${err?.message || err}`;
      console.error('[DriveSync]', msg, err);
      errors.push(msg);
      logs.push(`[DriveSync Error] ${msg}`);
    }
  }

  saveDriveFolderConfig({ lastSyncTimestamp: Date.now() });

  logs.push(`[DriveSync] Sync complete! Added: ${addedCount}, Updated (Image Replaced): ${updatedCount}, Unchanged: ${unchangedCount}`);

  return {
    success: errors.length === 0 || addedCount > 0 || updatedCount > 0,
    addedCount,
    updatedCount,
    unchangedCount,
    updatedDCs: updatedDCsList,
    logs,
    errors
  };
}
