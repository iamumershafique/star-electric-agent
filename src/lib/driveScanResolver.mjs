// Reusable Drive discovery for browser sync and the Node watcher.
/**
 * Extracts Google Drive file or folder ID from various URL formats or raw ID string.
 */
export function extractDriveId(input) {
  const clean = input.trim();
  if (!clean) return null;

  // Raw file ID (alphanumeric, underscores, hyphens, up to 150 chars)
  if (/^[a-zA-Z0-9_-]{1,150}$/.test(clean)) {
    return clean;
  }

  // File URL formats.
  const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]{1,150})/);
  if (fileMatch) return fileMatch[1];

  // Folder URL formats.
  const folderMatch = clean.match(/\/folders\/([a-zA-Z0-9_-]{1,150})/);
  if (folderMatch) return folderMatch[1];

  // uc?id= or open?id= format
  const queryMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]{1,150})/);
  if (queryMatch) return queryMatch[1];

  return null;
}

/**
 * Extracts normalized DC number (e.g. "DC-694") from filename or text.
 */
export function extractDCNumberFromFileName(name) {
  const match = name.match(/\bDC[ _-]?(\d+)\b/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (isNaN(num) || num <= 0) return null;
  return `DC-${num}`;
}

/**
 * Construct Google Drive direct image URL and view link from File ID.
 */
export function buildDriveUrls(fileId) {
  return {
    imageUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1200`,
    viewLink: `https://drive.google.com/file/d/${fileId}/view`
  };
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SCAN_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

/** Safe, generic failures: never expose Drive IDs, links, filenames or API responses. */
export class DriveInputError extends Error {
  constructor(kind, status) {
    super(kind === 'folder' ? 'Folder could not be opened.' : kind === 'file' ? 'File metadata could not be opened.' : kind === 'configuration' ? 'Drive API access is not configured.' : 'Enter a valid Drive folder or file link or ID.');
    this.kind = kind; this.status = status;
  }
}

/** Parse input without claiming a raw ID is a file or inventing metadata. */
export function parseDriveLinksText(text) {
  return text.split(/[\r\n,;]+/).map(value => value.trim()).filter(Boolean).map(value => {
    const id = extractDriveId(value);
    if (!id) throw new DriveInputError('input');
    if (/^[a-zA-Z0-9_-]{1,150}$/.test(value)) return { id, kind: 'unknown' };
    let url;
    try { url = new URL(value); } catch { throw new DriveInputError('input'); }
    if (url.protocol !== 'https:' || !['drive.google.com', 'docs.google.com'].includes(url.hostname)) throw new DriveInputError('input');
    return { id, kind: /\/folders\//.test(url.pathname) ? 'folder' : /\/file\/d\//.test(url.pathname) ? 'file' : 'unknown' };
  });
}

async function driveJson(path, params, key, kind) {
  params.set('key', key);
  let response;
  try { response = await fetch(`https://www.googleapis.com/drive/v3/${path}?${params}`, { mode: 'cors' }); }
  catch { throw new DriveInputError(kind); }
  if (!response.ok) throw new DriveInputError(kind, response.status);
  try { return await response.json(); } catch { throw new DriveInputError(kind); }
}
function validMetadata(data) {
  const m = data;
  return !!m && typeof m.id === 'string' && /^[a-zA-Z0-9_-]{1,150}$/.test(m.id) && typeof m.name === 'string' && !!m.name.trim() && typeof m.mimeType === 'string';
}
function scanFile(meta) {
  const urls = buildDriveUrls(meta.id);
  return { id: meta.id, name: meta.name, dcNumber: extractDCNumberFromFileName(meta.name) || '', ...urls, lastModified: meta.modifiedTime, mimeType: meta.mimeType };
}

/** Resolve all inputs before downloads; an incomplete folder listing aborts the whole run. */
export async function resolveDriveScanInputs(links, selectedFolder, apiKey = '') {
  const inputs = links.trim() ? parseDriveLinksText(links) : parseDriveLinksText(selectedFolder).map(input => {
    if (input.kind === 'file') throw new DriveInputError('input');
    return { ...input, kind: 'folder' };
  });
  if (!inputs.length) throw new DriveInputError('input');
  if (!apiKey.trim()) throw new DriveInputError('configuration');
  const result = [];
  const seen = new Set();
  const folders = new Set();
  const add = (meta) => {
    if (!meta.trashed && SCAN_MIMES.has(meta.mimeType) && !seen.has(meta.id)) { seen.add(meta.id); result.push(scanFile(meta)); }
  };
  for (const input of inputs) {
    let kind = input.kind;
    if (kind !== 'folder') {
      const data = await driveJson(`files/${encodeURIComponent(input.id)}`, new URLSearchParams({ fields: 'id,name,mimeType,modifiedTime,trashed', supportsAllDrives: 'true' }), apiKey, 'file');
      if (!validMetadata(data) || data.id !== input.id || data.trashed) throw new DriveInputError('file');
      if (data.mimeType === FOLDER_MIME) kind = 'folder';
      else {
        if (!SCAN_MIMES.has(data.mimeType)) throw new DriveInputError('file');
        add(data); continue;
      }
    }
    folders.add(input.id);
    let pageToken = '';
    const tokens = new Set();
    do {
      const params = new URLSearchParams({ q: `'${input.id}' in parents and trashed = false`, fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,trashed)', pageSize: '1000', supportsAllDrives: 'true', includeItemsFromAllDrives: 'true' });
      if (pageToken) params.set('pageToken', pageToken);
      const data = await driveJson('files', params, apiKey, 'folder');
      if (!data || !Array.isArray(data.files) || data.files.some(file => !validMetadata(file)) || (data.nextPageToken !== undefined && typeof data.nextPageToken !== 'string')) throw new DriveInputError('folder');
      for (const file of data.files) add(file);
      pageToken = data.nextPageToken || '';
      if (pageToken && tokens.has(pageToken)) throw new DriveInputError('folder');
      if (pageToken) tokens.add(pageToken);
    } while (pageToken);
  }
  if (result.some(file => folders.has(file.id))) throw new DriveInputError('folder');
  return result;
}
