import type { GeminiDCExtractionResult } from '../types';

/**
 * Fixed layout of the Star Electric Enterprises delivery challan book. The form never changes,
 * so every OCR engine is told exactly where each value is written.
 */
export const STAR_DC_LAYOUT_GUIDE = `STAR ELECTRIC DELIVERY CHALLAN LAYOUT (the printed form is always the same):
- Heading at the top: "DELIVERY CHALLAN". Logo and "STAR ELECTRIC ENTERPRISES" on the left, "DEALERS: ..." on the right.
- DC NUMBER: the black stamped/printed digits right after the printed label "No." on the left, below the logo (for example "No. 664"). This is the ONLY source of the DC number. Return it as "DC-<digits>" without leading zeros, e.g. "DC-664".
- PR NUMBER: handwritten in pen, usually just below "STAR ELECTRIC ENTERPRISES" and above or beside the DC number, written like "PR#119", "PR-119" or "PR 119". Return it as "PR-<digits>", e.g. "PR-119". It is never the stamped number after "No.". If no PR is handwritten, return "".
- DATE: handwritten on the line after the printed label "Date" at the top right, written day-month-year (e.g. "17-09-2026"). Return ISO YYYY-MM-DD (e.g. "2026-09-17").
- SITE: handwritten on the line after the printed words "JADEED GROUP" (e.g. "Feed Mill Khanewal"). Return exactly as written, without "Jadeed Group".
- ITEMS: the table below has a narrow "Qty." column on the left and "PARTICULARS" on the right. Each written row is one item. The quantity and its unit are written at the start of the row in the Qty. column (e.g. "5 coil" means quantityShipped 5, unit "Coil"); the rest of the row is the item description (e.g. "Cable 7/29 2-Core PVC/PVC Copper").
- The large pen stroke and the signature at the bottom right are not items. Ignore the footer address and phone numbers.
Worked example of this exact form: "No. 664", handwritten "PR#119", Date "17-09-2026", "JADEED GROUP  Feed Mill Khanewal", row "5 coil Cable 7/29 2-core PVC/PVC copper" -> dcNumber "DC-664", prNumber "PR-119", date "2026-09-17", siteName "Feed Mill Khanewal", shippedItems [{"itemName": "Cable 7/29 2-Core PVC/PVC Copper", "quantityShipped": 5, "unit": "Coil"}].`;

const digitsOf = (value: string | undefined) => (value || '').replace(/\D/g, '').replace(/^0+(?=\d)/, '');

function toIsoDate(value: string): string {
  const text = (value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const dmy = text.match(/^(\d{1,2})[-/.\s](\d{1,2})[-/.\s](\d{2,4})$/);
  if (!dmy) return text;
  const [, d, m, y] = dmy;
  const year = y.length === 2 ? `20${y}` : y;
  const day = Number(d), month = Number(m);
  if (day < 1 || day > 31 || month < 1 || month > 12) return text;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Puts every DC result into one format whichever engine read it: "DC-664", "PR-119", ISO dates,
 * site without the "Jadeed Group" prefix. Flags a DC number that equals the PR number, a common misread.
 */
export function normalizeDCResult(result: GeminiDCExtractionResult): GeminiDCExtractionResult {
  const dcDigits = digitsOf(result.dcNumber);
  const prDigits = digitsOf(result.prNumber);
  const dcNumber = dcDigits ? `DC-${dcDigits}` : (result.dcNumber || '').trim();
  const prNumber = prDigits ? `PR-${prDigits}` : '';
  const invoiceDigits = digitsOf(result.invoiceNumber);
  const notes: string[] = [];
  let confidence = result.confidence;
  if (dcDigits && prDigits && dcDigits === prDigits) {
    notes.push(`DC number and PR number were both read as ${dcDigits}; check the stamped number after "No.".`);
    confidence = Math.min(confidence, 0.4);
  }
  return {
    ...result,
    dcNumber,
    invoiceNumber: invoiceDigits && invoiceDigits === dcDigits ? dcNumber : (result.invoiceNumber || '').trim(),
    prNumber,
    date: toIsoDate(result.date),
    siteName: (result.siteName || '').replace(/^\s*jadeed\s+group\s*[:,-]?\s*/i, '').trim(),
    shippedItems: (result.shippedItems || []).map(item => ({
      ...item,
      unit: item.unit ? item.unit.charAt(0).toUpperCase() + item.unit.slice(1).toLowerCase() : item.unit
    })),
    confidence,
    rawAnalysis: [result.rawAnalysis, ...notes].filter(Boolean).join(' ')
  };
}
