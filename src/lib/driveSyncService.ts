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
export const DEFAULT_FOLDER_ID = '1QirE97-gMrqZ5kQT_hZZGmRFB-efREro'; // Active Drive folder (DC 701-740)

export const KNOWN_SCAN_FOLDERS = [
  { id: '1QirE97-gMrqZ5kQT_hZZGmRFB-efREro', label: 'DC Scans 701-800 (Current / Active to DC-740)' },
  { id: '1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW', label: 'DC Scans 601-700' },
  { id: '1nVxz4_rtVUnYed8PEykDaQub61FdQHzL', label: 'Master Drive Scans Folder' }
];

export const RECENT_DRIVE_SCANS: DriveScannedFile[] = [
  { id: '1fe36xeEiKP15ORQeeWNd_imEtw9WhJzx', name: 'DC 694.jpeg', dcNumber: 'DC-694', imageUrl: 'https://lh3.googleusercontent.com/d/1fe36xeEiKP15ORQeeWNd_imEtw9WhJzx=w1200', viewLink: 'https://drive.google.com/file/d/1fe36xeEiKP15ORQeeWNd_imEtw9WhJzx/view' },
  { id: '1KPPeCPD9A6pjxhZ742LT2CR2VRcLWdEj', name: 'DC 695.jpeg', dcNumber: 'DC-695', imageUrl: 'https://lh3.googleusercontent.com/d/1KPPeCPD9A6pjxhZ742LT2CR2VRcLWdEj=w1200', viewLink: 'https://drive.google.com/file/d/1KPPeCPD9A6pjxhZ742LT2CR2VRcLWdEj/view' },
  { id: '1upSa-gDI8rz23_CRCWCEPh6UsFWMxmiw', name: 'DC 696.jpeg', dcNumber: 'DC-696', imageUrl: 'https://lh3.googleusercontent.com/d/1upSa-gDI8rz23_CRCWCEPh6UsFWMxmiw=w1200', viewLink: 'https://drive.google.com/file/d/1upSa-gDI8rz23_CRCWCEPh6UsFWMxmiw/view' },
  { id: '1XQfF0ooHyxI0G08Tl4UEhQxPQ_Go5xhl', name: 'DC 697.jpeg', dcNumber: 'DC-697', imageUrl: 'https://lh3.googleusercontent.com/d/1XQfF0ooHyxI0G08Tl4UEhQxPQ_Go5xhl=w1200', viewLink: 'https://drive.google.com/file/d/1XQfF0ooHyxI0G08Tl4UEhQxPQ_Go5xhl/view' },
  { id: '16uhR8w7AkY2tlOqDXhfA3uwHGAysOpHc', name: 'DC 698.jpeg', dcNumber: 'DC-698', imageUrl: 'https://lh3.googleusercontent.com/d/16uhR8w7AkY2tlOqDXhfA3uwHGAysOpHc=w1200', viewLink: 'https://drive.google.com/file/d/16uhR8w7AkY2tlOqDXhfA3uwHGAysOpHc/view' },
  { id: '1lvaRGoLLt8zWK_0vWJ3WFsrV1bNpihlk', name: 'DC 699.jpeg', dcNumber: 'DC-699', imageUrl: 'https://lh3.googleusercontent.com/d/1lvaRGoLLt8zWK_0vWJ3WFsrV1bNpihlk=w1200', viewLink: 'https://drive.google.com/file/d/1lvaRGoLLt8zWK_0vWJ3WFsrV1bNpihlk/view' },
  { id: '1muwE0tfdSfYeqQy-tG1EWvnhVB1b1si4', name: 'DC 700.jpeg', dcNumber: 'DC-700', imageUrl: 'https://lh3.googleusercontent.com/d/1muwE0tfdSfYeqQy-tG1EWvnhVB1b1si4=w1200', viewLink: 'https://drive.google.com/file/d/1muwE0tfdSfYeqQy-tG1EWvnhVB1b1si4/view' },
  { id: '1Zfxxs1VXr5fM9CiWee_mjJKWoPSa-2YF', name: 'DC 701.jpeg', dcNumber: 'DC-701', imageUrl: 'https://lh3.googleusercontent.com/d/1Zfxxs1VXr5fM9CiWee_mjJKWoPSa-2YF=w1200', viewLink: 'https://drive.google.com/file/d/1Zfxxs1VXr5fM9CiWee_mjJKWoPSa-2YF/view' },
  { id: '1xh5VF3ut426iNOtGe1PgKQaSSiramX_g', name: 'DC 702.jpeg', dcNumber: 'DC-702', imageUrl: 'https://lh3.googleusercontent.com/d/1xh5VF3ut426iNOtGe1PgKQaSSiramX_g=w1200', viewLink: 'https://drive.google.com/file/d/1xh5VF3ut426iNOtGe1PgKQaSSiramX_g/view' },
  { id: '1aswz1gWsI9SGsq_XrSqRtTTj7EivAXv4', name: 'DC 703.jpeg', dcNumber: 'DC-703', imageUrl: 'https://lh3.googleusercontent.com/d/1aswz1gWsI9SGsq_XrSqRtTTj7EivAXv4=w1200', viewLink: 'https://drive.google.com/file/d/1aswz1gWsI9SGsq_XrSqRtTTj7EivAXv4/view' },
  { id: '1Pb0pmic4OyiFqwlC0AIiCZ2vrbFa01f7', name: 'DC 704.jpeg', dcNumber: 'DC-704', imageUrl: 'https://lh3.googleusercontent.com/d/1Pb0pmic4OyiFqwlC0AIiCZ2vrbFa01f7=w1200', viewLink: 'https://drive.google.com/file/d/1Pb0pmic4OyiFqwlC0AIiCZ2vrbFa01f7/view' },
  { id: '1SkE7u49fHAxHSCaxItENMTnHapY4FVQb', name: 'DC 705.jpeg', dcNumber: 'DC-705', imageUrl: 'https://lh3.googleusercontent.com/d/1SkE7u49fHAxHSCaxItENMTnHapY4FVQb=w1200', viewLink: 'https://drive.google.com/file/d/1SkE7u49fHAxHSCaxItENMTnHapY4FVQb/view' },
  { id: '1wP4jVvFDam97W_8W5LpAPBi5yTWBS4Ta', name: 'DC 706.jpeg', dcNumber: 'DC-706', imageUrl: 'https://lh3.googleusercontent.com/d/1wP4jVvFDam97W_8W5LpAPBi5yTWBS4Ta=w1200', viewLink: 'https://drive.google.com/file/d/1wP4jVvFDam97W_8W5LpAPBi5yTWBS4Ta/view' },
  { id: '1Ar1nFTwzK5PHHXouy03SlFtfX9LThv_5', name: 'DC 707.jpg', dcNumber: 'DC-707', imageUrl: 'https://lh3.googleusercontent.com/d/1Ar1nFTwzK5PHHXouy03SlFtfX9LThv_5=w1200', viewLink: 'https://drive.google.com/file/d/1Ar1nFTwzK5PHHXouy03SlFtfX9LThv_5/view' },
  { id: '1RxxiozXjdMtDh96UCVkHwK9p5eCdfmJX', name: 'DC 708.jpg', dcNumber: 'DC-708', imageUrl: 'https://lh3.googleusercontent.com/d/1RxxiozXjdMtDh96UCVkHwK9p5eCdfmJX=w1200', viewLink: 'https://drive.google.com/file/d/1RxxiozXjdMtDh96UCVkHwK9p5eCdfmJX/view' },
  { id: '1OprRCkvq4Nx4udLv39Kd3lg-8GbAYHMG', name: 'DC 710.jpg', dcNumber: 'DC-710', imageUrl: 'https://lh3.googleusercontent.com/d/1OprRCkvq4Nx4udLv39Kd3lg-8GbAYHMG=w1200', viewLink: 'https://drive.google.com/file/d/1OprRCkvq4Nx4udLv39Kd3lg-8GbAYHMG/view' },
  { id: '1QWbSDBsPCiU1Ez4IOtIUMTzjB-C1CjFK', name: 'DC 711.jpg', dcNumber: 'DC-711', imageUrl: 'https://lh3.googleusercontent.com/d/1QWbSDBsPCiU1Ez4IOtIUMTzjB-C1CjFK=w1200', viewLink: 'https://drive.google.com/file/d/1QWbSDBsPCiU1Ez4IOtIUMTzjB-C1CjFK/view' },
  { id: '1y7_jYGniPdQtNpIVNG6wydCL4Vuz-1re', name: 'DC 712.jpg', dcNumber: 'DC-712', imageUrl: 'https://lh3.googleusercontent.com/d/1y7_jYGniPdQtNpIVNG6wydCL4Vuz-1re=w1200', viewLink: 'https://drive.google.com/file/d/1y7_jYGniPdQtNpIVNG6wydCL4Vuz-1re/view' },
  { id: '16CPZLPHgdRhBtcVIWyro2Nkf-wUgb91M', name: 'DC 714.jpg', dcNumber: 'DC-714', imageUrl: 'https://lh3.googleusercontent.com/d/16CPZLPHgdRhBtcVIWyro2Nkf-wUgb91M=w1200', viewLink: 'https://drive.google.com/file/d/16CPZLPHgdRhBtcVIWyro2Nkf-wUgb91M/view' },
  { id: '1uK9c_8Rlt0GutvhyG2Kwh5C_8xH5NjV_', name: 'DC 715.jpg', dcNumber: 'DC-715', imageUrl: 'https://lh3.googleusercontent.com/d/1uK9c_8Rlt0GutvhyG2Kwh5C_8xH5NjV_=w1200', viewLink: 'https://drive.google.com/file/d/1uK9c_8Rlt0GutvhyG2Kwh5C_8xH5NjV_/view' },
  { id: '10WA4EE3hlSeNlLrT6Zz9zoNKdE-8qigv', name: 'DC 716.jpg', dcNumber: 'DC-716', imageUrl: 'https://lh3.googleusercontent.com/d/10WA4EE3hlSeNlLrT6Zz9zoNKdE-8qigv=w1200', viewLink: 'https://drive.google.com/file/d/10WA4EE3hlSeNlLrT6Zz9zoNKdE-8qigv/view' },
  { id: '1TK0So8Bgnspclg1pvcDJcCxH_HtH7hjV', name: 'DC 718.jpeg', dcNumber: 'DC-718', imageUrl: 'https://lh3.googleusercontent.com/d/1TK0So8Bgnspclg1pvcDJcCxH_HtH7hjV=w1200', viewLink: 'https://drive.google.com/file/d/1TK0So8Bgnspclg1pvcDJcCxH_HtH7hjV/view' },
  { id: '195n3it8DBFVFph0Am_KpHrFHWBLTfFxh', name: 'DC 719.jpg', dcNumber: 'DC-719', imageUrl: 'https://lh3.googleusercontent.com/d/195n3it8DBFVFph0Am_KpHrFHWBLTfFxh=w1200', viewLink: 'https://drive.google.com/file/d/195n3it8DBFVFph0Am_KpHrFHWBLTfFxh/view' },
  { id: '1jVBgp-H4l4MaYUYjfCJg1PZgMq5H1YXg', name: 'DC 720.jpeg', dcNumber: 'DC-720', imageUrl: 'https://lh3.googleusercontent.com/d/1jVBgp-H4l4MaYUYjfCJg1PZgMq5H1YXg=w1200', viewLink: 'https://drive.google.com/file/d/1jVBgp-H4l4MaYUYjfCJg1PZgMq5H1YXg/view' },
  { id: '1g3FwB5DNZwOwnyzcXXiIb675yIY5GK6g', name: 'DC 721.jpeg', dcNumber: 'DC-721', imageUrl: 'https://lh3.googleusercontent.com/d/1g3FwB5DNZwOwnyzcXXiIb675yIY5GK6g=w1200', viewLink: 'https://drive.google.com/file/d/1g3FwB5DNZwOwnyzcXXiIb675yIY5GK6g/view' },
  { id: '1BfTNmYfe9Jbfjs0dTmp0kL2Q5qZc6Q4S', name: 'DC 722.jpg', dcNumber: 'DC-722', imageUrl: 'https://lh3.googleusercontent.com/d/1BfTNmYfe9Jbfjs0dTmp0kL2Q5qZc6Q4S=w1200', viewLink: 'https://drive.google.com/file/d/1BfTNmYfe9Jbfjs0dTmp0kL2Q5qZc6Q4S/view' },
  { id: '1d-afbcjsreq_vJKI0QS92MOuBtp2a5JL', name: 'DC 723.jpg', dcNumber: 'DC-723', imageUrl: 'https://lh3.googleusercontent.com/d/1d-afbcjsreq_vJKI0QS92MOuBtp2a5JL=w1200', viewLink: 'https://drive.google.com/file/d/1d-afbcjsreq_vJKI0QS92MOuBtp2a5JL/view' },
  { id: '187ngMXQUm62gsXSx8jM2nso-hKYlxjXD', name: 'DC 724.jpg', dcNumber: 'DC-724', imageUrl: 'https://lh3.googleusercontent.com/d/187ngMXQUm62gsXSx8jM2nso-hKYlxjXD=w1200', viewLink: 'https://drive.google.com/file/d/187ngMXQUm62gsXSx8jM2nso-hKYlxjXD/view' },
  { id: '1kpspCKFHstwV9UNYNu1poZLtvfedxZhK', name: 'DC 725.jpg', dcNumber: 'DC-725', imageUrl: 'https://lh3.googleusercontent.com/d/1kpspCKFHstwV9UNYNu1poZLtvfedxZhK=w1200', viewLink: 'https://drive.google.com/file/d/1kpspCKFHstwV9UNYNu1poZLtvfedxZhK/view' },
  { id: '1bNfAJ7ZiIj57N6nJaPXShEZlcOnWpn9Q', name: 'DC 726.jpg', dcNumber: 'DC-726', imageUrl: 'https://lh3.googleusercontent.com/d/1bNfAJ7ZiIj57N6nJaPXShEZlcOnWpn9Q=w1200', viewLink: 'https://drive.google.com/file/d/1bNfAJ7ZiIj57N6nJaPXShEZlcOnWpn9Q/view' },
  { id: '1ZJNZ56KD79HhE49b5kPydVulw1hSisoq', name: 'DC 727.jpg', dcNumber: 'DC-727', imageUrl: 'https://lh3.googleusercontent.com/d/1ZJNZ56KD79HhE49b5kPydVulw1hSisoq=w1200', viewLink: 'https://drive.google.com/file/d/1ZJNZ56KD79HhE49b5kPydVulw1hSisoq/view' },
  { id: '1bf41MApoFPABRqhS3_sjQmx6nT-_x9GT', name: 'DC 728.jpg', dcNumber: 'DC-728', imageUrl: 'https://lh3.googleusercontent.com/d/1bf41MApoFPABRqhS3_sjQmx6nT-_x9GT=w1200', viewLink: 'https://drive.google.com/file/d/1bf41MApoFPABRqhS3_sjQmx6nT-_x9GT/view' },
  { id: '1M1hm6eE0yptvn0YgDMyBLDpeYJXJTyr4', name: 'DC 729.jpg', dcNumber: 'DC-729', imageUrl: 'https://lh3.googleusercontent.com/d/1M1hm6eE0yptvn0YgDMyBLDpeYJXJTyr4=w1200', viewLink: 'https://drive.google.com/file/d/1M1hm6eE0yptvn0YgDMyBLDpeYJXJTyr4/view' },
  { id: '1VhaGbmChj5q_h3zgMhTXH5Gb0KxLzOzU', name: 'DC 730.jpg', dcNumber: 'DC-730', imageUrl: 'https://lh3.googleusercontent.com/d/1VhaGbmChj5q_h3zgMhTXH5Gb0KxLzOzU=w1200', viewLink: 'https://drive.google.com/file/d/1VhaGbmChj5q_h3zgMhTXH5Gb0KxLzOzU/view' },
  { id: '1vz9HFsMFVvW9HawzfMYa8qsanptuPWj6', name: 'DC 731.jpg', dcNumber: 'DC-731', imageUrl: 'https://lh3.googleusercontent.com/d/1vz9HFsMFVvW9HawzfMYa8qsanptuPWj6=w1200', viewLink: 'https://drive.google.com/file/d/1vz9HFsMFVvW9HawzfMYa8qsanptuPWj6/view' },
  { id: '1mmnxfietjHZxy7tdNcloToQL-4MNqkWF', name: 'DC 732.jpg', dcNumber: 'DC-732', imageUrl: 'https://lh3.googleusercontent.com/d/1mmnxfietjHZxy7tdNcloToQL-4MNqkWF=w1200', viewLink: 'https://drive.google.com/file/d/1mmnxfietjHZxy7tdNcloToQL-4MNqkWF/view' },
  { id: '19G0z8IFyfXhQ7juohVnzOvEGGC70srCM', name: 'DC 733.jpg', dcNumber: 'DC-733', imageUrl: 'https://lh3.googleusercontent.com/d/19G0z8IFyfXhQ7juohVnzOvEGGC70srCM=w1200', viewLink: 'https://drive.google.com/file/d/19G0z8IFyfXhQ7juohVnzOvEGGC70srCM/view' },
  { id: '1AEawC2ABEInk3RVO6PopDu2PCBh-oEK3', name: 'DC 734.jpg', dcNumber: 'DC-734', imageUrl: 'https://lh3.googleusercontent.com/d/1AEawC2ABEInk3RVO6PopDu2PCBh-oEK3=w1200', viewLink: 'https://drive.google.com/file/d/1AEawC2ABEInk3RVO6PopDu2PCBh-oEK3/view' },
  { id: '1PwToiDzgTZhhMrOCY2bdj2-xwQf5TW7d', name: 'DC 735.jpeg', dcNumber: 'DC-735', imageUrl: 'https://lh3.googleusercontent.com/d/1PwToiDzgTZhhMrOCY2bdj2-xwQf5TW7d=w1200', viewLink: 'https://drive.google.com/file/d/1PwToiDzgTZhhMrOCY2bdj2-xwQf5TW7d/view' },
  { id: '1EH0WRmcktcciDt7tA0ySWlHdIEsgZTbv', name: 'DC 736.jpeg', dcNumber: 'DC-736', imageUrl: 'https://lh3.googleusercontent.com/d/1EH0WRmcktcciDt7tA0ySWlHdIEsgZTbv=w1200', viewLink: 'https://drive.google.com/file/d/1EH0WRmcktcciDt7tA0ySWlHdIEsgZTbv/view' },
  { id: '1FOM0ECTVzOa6gdKjCvOmsgTyOODMv9RS', name: 'DC 737.jpeg', dcNumber: 'DC-737', imageUrl: 'https://lh3.googleusercontent.com/d/1FOM0ECTVzOa6gdKjCvOmsgTyOODMv9RS=w1200', viewLink: 'https://drive.google.com/file/d/1FOM0ECTVzOa6gdKjCvOmsgTyOODMv9RS/view' },
  { id: '1dANtqSPKK6d2lsbLgtTvCFcsiZCY9C60', name: 'DC 738.jpeg', dcNumber: 'DC-738', imageUrl: 'https://lh3.googleusercontent.com/d/1dANtqSPKK6d2lsbLgtTvCFcsiZCY9C60=w1200', viewLink: 'https://drive.google.com/file/d/1dANtqSPKK6d2lsbLgtTvCFcsiZCY9C60/view' },
  { id: '1PYJid-7YuxPJ7Ne0UZTSAI8AtEYRBkXK', name: 'DC 739.jpeg', dcNumber: 'DC-739', imageUrl: 'https://lh3.googleusercontent.com/d/1PYJid-7YuxPJ7Ne0UZTSAI8AtEYRBkXK=w1200', viewLink: 'https://drive.google.com/file/d/1PYJid-7YuxPJ7Ne0UZTSAI8AtEYRBkXK/view' },
  { id: '1d6Ixb6g-CZwlGTNcueVj7exIIkbjyWQa', name: 'DC 740.jpeg', dcNumber: 'DC-740', imageUrl: 'https://lh3.googleusercontent.com/d/1d6Ixb6g-CZwlGTNcueVj7exIIkbjyWQa=w1200', viewLink: 'https://drive.google.com/file/d/1d6Ixb6g-CZwlGTNcueVj7exIIkbjyWQa/view' }
];

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
