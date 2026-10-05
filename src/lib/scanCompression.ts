/**
 * Shrinks a scan so it fits comfortably inside one Firestore document (1 MiB limit).
 * Images are re-encoded as JPEG; PDFs are rendered to an image of their first page.
 */
const MAX_CLOUD_BYTES = 850_000; // base64 characters, leaves room for metadata
const SIDES = [1800, 1500, 1200, 1000];
const QUALITIES = [0.78, 0.68, 0.58];

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = 'async';
  image.src = dataUrl;
  await image.decode();
  return image;
}

async function pdfFirstPageToDataUrl(dataUrl: string): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: SIDES[0] / Math.max(base.width, base.height) });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable.');
  await page.render({ canvasContext: context, viewport }).promise;
  await pdf.destroy();
  return canvas.toDataURL('image/jpeg', 0.85);
}

export async function compressScanForCloud(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith('data:')) throw new Error('Only embedded scans can be uploaded.');
  const source = dataUrl.startsWith('data:application/pdf') ? await pdfFirstPageToDataUrl(dataUrl) : dataUrl;
  if (source.length <= MAX_CLOUD_BYTES && source.startsWith('data:image/jpeg')) {
    const image = await loadImage(source);
    if (Math.max(image.naturalWidth, image.naturalHeight) <= SIDES[0]) return source;
  }
  const image = await loadImage(source);
  for (const side of SIDES) {
    const scale = Math.min(1, side / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of QUALITIES) {
      const result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= MAX_CLOUD_BYTES) return result;
    }
  }
  throw new Error('The scan is too large to store even after compression.');
}
