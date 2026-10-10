import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFirebaseApp, isFirebaseConfigured } from './firebase';

const FOLDER = 'scans';

function storageRef(key: string) {
  const app = getFirebaseApp();
  if (!app || !isFirebaseConfigured()) return null;
  return ref(getStorage(app), `${FOLDER}/${key}`);
}

export async function uploadScanToCloud(key: string, dataUrl: string): Promise<void> {
  if (!dataUrl.startsWith('data:')) return;
  const target = storageRef(key);
  if (!target) return;
  try {
    await uploadString(target, dataUrl, 'data_url');
  } catch (error) {
    console.warn('[CloudImages] Upload failed:', error);
  }
}

export async function getScanUrlFromCloud(key: string): Promise<string | undefined> {
  const target = storageRef(key);
  if (!target) return undefined;
  try {
    return await getDownloadURL(target);
  } catch {
    return undefined;
  }
}
