import type { BrandCategory, ItemStatus, PRStatus, LineItem, PRRecord } from '../types';

export function formatCurrencyPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(amount).replace('PKR', 'Rs.');
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Normalize any date string to ISO YYYY-MM-DD for reliable comparison/matching.
 * Handles DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, and other parseable formats.
 * Returns the trimmed original string if it cannot be parsed.
 */
export function normalizeDateToISO(dateString: string): string {
  if (!dateString) return '';
  const s = dateString.trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD-MM-YYYY or DD/MM/YYYY (day-first, common on PK documents)
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return s;
}

export function generateId(prefix: string = 'ID'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export function computeItemStatus(requested: number, fulfilled: number): ItemStatus {
  if (fulfilled <= 0) return 'Pending';
  if (fulfilled >= requested) return 'Completed';
  return 'Partially Fulfilled';
}

export function computePRStatus(items: LineItem[]): PRStatus {
  if (!items || items.length === 0) return 'Pending';
  const allCancelled = items.every(item => item.status === 'Cancelled');
  if (allCancelled) return 'Cancelled';

  const nonCancelled = items.filter(item => item.status !== 'Cancelled');
  if (nonCancelled.length === 0) return 'Cancelled';

  const allCompletedOrCancelled = items.every(
    item => item.status === 'Cancelled' || item.fulfilledQty >= item.requestedQty
  );
  if (allCompletedOrCancelled) return 'Fulfilled';

  const anyFulfilled = nonCancelled.some(item => item.fulfilledQty > 0);
  if (anyFulfilled) return 'In-Progress';
  return 'Pending';
}

export function normalizeBrand(inputStr: string): BrandCategory {
  const str = inputStr.toLowerCase();
  if (str.includes('pakistan cable') || str.includes('pk cable')) return 'Pakistan Cables';
  if (str.includes('amer cable') || str.includes('amer')) return 'Amer Cables';
  if (str.includes('schneider') || str.includes('mcb') || str.includes('mccb')) return 'Schneider Electric';
  if (str.includes('terasaki')) return 'Terasaki';
  if (str.includes('philips') || str.includes('led') || str.includes('light') || str.includes('floodlight')) return 'Philips / Pak Lighting';
  if (str.includes('conduit') || str.includes('pvc') || str.includes('pipe') || str.includes('flex')) return 'Conduit & Accessories';
  if (str.includes('switch') || str.includes('socket') || str.includes('gang')) return 'Switches & Sockets';
  return 'General Electrical';
}

// Light theme brand badge styling
export function getBrandBadgeColor(brand: BrandCategory): string {
  switch (brand) {
    case 'Pakistan Cables':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'Amer Cables':
      return 'bg-blue-50 text-blue-800 border-blue-300';
    case 'Schneider Electric':
      return 'bg-purple-50 text-purple-800 border-purple-300';
    case 'Terasaki':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'Philips / Pak Lighting':
      return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    case 'Conduit & Accessories':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'Switches & Sockets':
      return 'bg-cyan-50 text-cyan-800 border-cyan-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

// Light theme status badge styling
export function getStatusBadgeColor(status: PRStatus | ItemStatus): string {
  switch (status) {
    case 'Fulfilled':
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
    case 'In-Progress':
    case 'Partially Fulfilled':
      return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
    case 'Cancelled':
      return 'bg-slate-200 text-slate-700 border-slate-400 font-semibold line-through decoration-slate-400';
    case 'Pending':
    default:
      return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
  }
}

export function calculatePRTotals(pr: PRRecord) {
  let totalRequestedQty = 0;
  let totalFulfilledQty = 0;
  let totalItemsCount = pr.items.length;
  let completedItemsCount = 0;
  let cancelledItemsCount = 0;

  pr.items.forEach(item => {
    if (item.status === 'Cancelled') {
      cancelledItemsCount++;
    } else {
      totalRequestedQty += item.requestedQty;
      totalFulfilledQty += item.fulfilledQty;
      if (item.fulfilledQty >= item.requestedQty) {
        completedItemsCount++;
      }
    }
  });

  const activeItemsCount = totalItemsCount - cancelledItemsCount;
  const percentage = activeItemsCount > 0 
    ? Math.round((completedItemsCount / activeItemsCount) * 100)
    : (cancelledItemsCount > 0 ? 100 : 0);

  return {
    totalRequestedQty,
    totalFulfilledQty,
    totalItemsCount,
    completedItemsCount,
    cancelledItemsCount,
    activeItemsCount,
    percentage
  };
}

export function cleanApiKey(key?: string | null): string {
  if (!key) return '';
  let cleaned = String(key).trim();
  // Strip quotes if pasted with quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  // Strip env prefix if pasted like VITE_GEMINI_API_KEY=AIzaSy... or GEMINI_API_KEY=AIzaSy...
  cleaned = cleaned.replace(/^[A-Za-z0-9_]+\s*=\s*/i, '');
  return cleaned.trim();
}

// ========== NEW: Consistent PR Number Normalization ==========
export function normalizePRNumber(prNum: string | undefined | null): string {
  if (!prNum) return '';
  return prNum
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^0+/, ''); // Remove leading zeros
}

export function hasPRNumber(pr: string | undefined | null): boolean {
  return !!(pr && pr.trim() && pr !== 'NO PR' && pr !== 'NO PR REQUIRED');
}

export function normalizeSiteName(site: string | undefined | null): string {
  if (!site) return '';
  return site
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^warehouse\s+/, 'ware house ')
    .replace(/\s+warehouse$/, ' ware house')
    .replace(/\s+warehouse\s+/, ' ware house ')
    .replace(/via\s+/, ' via ');
}
