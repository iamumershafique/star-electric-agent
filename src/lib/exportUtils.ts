import type { PRRecord, DCRecord } from '../types';

export interface ExportOptions {
  siteFilter?: string;
  dateRange?: { start: string; end: string };
  includeFulfilledOnly?: boolean;
}

export function convertPRsToCSV(prs: PRRecord[], options?: ExportOptions): string {
  const headers = ['PR Number', 'Site Name', 'Date', 'Status', 'Total Requested', 'Total Fulfilled', 'Fulfillment %'];
  const rows: string[][] = [];

  const filteredPRs = options?.siteFilter 
    ? prs.filter(p => p.siteName === options.siteFilter) 
    : prs;

  filteredPRs.forEach(pr => {
    const totalReq = pr.items.reduce((sum, it) => sum + it.requestedQty, 0);
    const totalFul = pr.items.reduce((sum, it) => sum + it.fulfilledQty, 0);
    const percent = totalReq > 0 ? ((totalFul / totalReq) * 100).toFixed(1) : '0';

    rows.push([
      pr.prNumber,
      `"${pr.siteName}"`,
      pr.date,
      pr.status,
      totalReq.toString(),
      totalFul.toString(),
      `${percent}%`
    ]);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function convertDCsToCSV(dcs: DCRecord[], options?: ExportOptions): string {
  const headers = ['DC Number', 'Invoice Number', 'PR Reference', 'Site Name', 'Date', 'Transport', 'Remarks'];
  const rows: string[][] = [];

  const filteredDCs = options?.siteFilter 
    ? dcs.filter(d => d.siteName === options.siteFilter) 
    : dcs;

  filteredDCs.forEach(dc => {
    rows.push([
      dc.dcNumber,
      dc.invoiceNumber,
      dc.prNumber,
      `"${dc.siteName}"`,
      dc.date,
      dc.transportType ?? '',
      `"${dc.remarks || ''}"`
    ]);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
