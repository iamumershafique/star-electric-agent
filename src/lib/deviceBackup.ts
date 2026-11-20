import type { DCRecord, PRRecord } from '../types';
import { getAllStoredImages, restoreImagesToEmptyStore, rollbackRestoredImages } from './imageStorage';
import { createBackupFromRecords, validatePayload, type BackupPayload, type BackupSummary } from './backupFormat';
export { verifyDeviceBackup } from './backupFormat';
export type { BackupSummary } from './backupFormat';

const PR_KEY = 'STAR_ELECTRIC_PRS_V2';
const DC_KEY = 'STAR_ELECTRIC_DCS_V2';

/** Export visible records and scans in this browser, not a cloud backup. */
export async function createDeviceBackup(prs: PRRecord[], dcs: DCRecord[]): Promise<{ json: string; summary: BackupSummary }> {
  return createBackupFromRecords(prs, dcs, await getAllStoredImages());
}

/** Called only by the development-only, isolated restore UI. It never contacts Firebase. */
export async function restoreDeviceBackup(payload: BackupPayload): Promise<void> {
  validatePayload(payload);
  if (localStorage.getItem(PR_KEY) !== null || localStorage.getItem(DC_KEY) !== null) {
    throw new Error('Local PR/DC cache is not empty. Use a clean, isolated browser profile.');
  }
  await restoreImagesToEmptyStore(payload.images);
  let prWritten = false;
  let dcWritten = false;
  try {
    if (localStorage.getItem(PR_KEY) !== null || localStorage.getItem(DC_KEY) !== null) {
      throw new Error('The local cache changed during restore. Close other tabs and retry in a clean profile.');
    }
    localStorage.setItem(PR_KEY, JSON.stringify(payload.prs)); prWritten = true;
    localStorage.setItem(DC_KEY, JSON.stringify(payload.dcs)); dcWritten = true;
  } catch (error) {
    try {
      if (prWritten) localStorage.removeItem(PR_KEY);
      if (dcWritten) localStorage.removeItem(DC_KEY);
      await rollbackRestoredImages(payload.images);
    } catch {
      throw new Error('Restore failed and cleanup was incomplete. Do not use this profile; contact the administrator.');
    }
    throw error;
  }
}
