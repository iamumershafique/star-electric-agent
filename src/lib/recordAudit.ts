import type { DCRecord, PRRecord } from '../types';

export type AuditSeverity = 'High' | 'Medium' | 'Low';

export interface RecordAuditFinding {
  id: string;
  severity: AuditSeverity;
  recordType: 'PR' | 'DC';
  recordNumber: string;
  message: string;
}

export interface RecordAuditReport {
  requisitionCount: number;
  deliveryCount: number;
  findings: RecordAuditFinding[];
}

const normalize = (value: string | undefined) => (value || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const isValidDate = (value: string | undefined) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export function auditRecords(prs: PRRecord[], dcs: DCRecord[]): RecordAuditReport {
  const findings: RecordAuditFinding[] = [];
  const addFinding = (
    severity: AuditSeverity,
    recordType: 'PR' | 'DC',
    recordNumber: string,
    message: string,
    suffix: string
  ) => {
    findings.push({
      id: `${recordType}-${normalize(recordNumber)}-${suffix}-${findings.length}`,
      severity,
      recordType,
      recordNumber: recordNumber || '(unnumbered)',
      message
    });
  };

  const prNumbers = new Map<string, PRRecord[]>();
  const prIds = new Set<string>();
  prs.forEach(pr => {
    const numberKey = normalize(pr.prNumber);
    if (numberKey) prNumbers.set(numberKey, [...(prNumbers.get(numberKey) || []), pr]);

    if (!pr.id || prIds.has(pr.id)) {
      addFinding('High', 'PR', pr.prNumber, 'Missing or duplicate record ID.', 'id');
    } else {
      prIds.add(pr.id);
    }
    if (!numberKey) addFinding('High', 'PR', pr.prNumber, 'Missing PR number.', 'number');
    if (!pr.siteName?.trim()) addFinding('Medium', 'PR', pr.prNumber, 'Missing site name.', 'site');
    if (!isValidDate(pr.date)) addFinding('Medium', 'PR', pr.prNumber, `Invalid or missing date: ${pr.date || '(empty)'}.`, 'date');
    if (!Array.isArray(pr.items) || pr.items.length === 0) {
      addFinding('Medium', 'PR', pr.prNumber, 'No line items recorded.', 'items');
    } else {
      const itemIds = new Set<string>();
      pr.items.forEach(item => {
        if (!item.id || itemIds.has(item.id)) {
          addFinding('High', 'PR', pr.prNumber, `Missing or duplicate line-item ID for "${item.name || 'unnamed item'}".`, 'item-id');
        } else {
          itemIds.add(item.id);
        }
        if (!item.name?.trim()) addFinding('Medium', 'PR', pr.prNumber, 'Line item has no description.', 'item-name');
        if (!Number.isFinite(item.requestedQty) || item.requestedQty < 0) {
          addFinding('High', 'PR', pr.prNumber, `Invalid requested quantity for "${item.name || 'unnamed item'}".`, 'requested-qty');
        }
        if (!Number.isFinite(item.fulfilledQty) || item.fulfilledQty < 0) {
          addFinding('High', 'PR', pr.prNumber, `Invalid fulfilled quantity for "${item.name || 'unnamed item'}".`, 'fulfilled-qty');
        } else if (Number.isFinite(item.requestedQty) && item.fulfilledQty > item.requestedQty) {
          addFinding('Medium', 'PR', pr.prNumber, `"${item.name}" is fulfilled above its requested quantity.`, 'over-fulfilled');
        }
      });
    }

    (pr.fulfillmentLogs || []).forEach(log => {
      if (!Number.isFinite(log.quantityShipped) || log.quantityShipped <= 0) {
        addFinding('High', 'PR', pr.prNumber, `Invalid shipped quantity in DC ${log.dcNumber || '(unnumbered)'}.`, 'log-qty');
      }
      if (!isValidDate(log.date)) {
        addFinding('Low', 'PR', pr.prNumber, `Invalid or missing fulfillment date in DC ${log.dcNumber || '(unnumbered)'}.`, 'log-date');
      }
    });
  });

  prNumbers.forEach((records) => {
    if (records.length > 1) {
      records.forEach(pr => addFinding('High', 'PR', pr.prNumber, `Duplicate PR number appears in ${records.length} records.`, 'duplicate-number'));
    }
  });

  const dcNumbers = new Map<string, DCRecord[]>();
  const dcIds = new Set<string>();
  dcs.forEach(dc => {
    const numberKey = normalize(dc.dcNumber);
    if (numberKey) dcNumbers.set(numberKey, [...(dcNumbers.get(numberKey) || []), dc]);

    if (!dc.id || dcIds.has(dc.id)) {
      addFinding('High', 'DC', dc.dcNumber, 'Missing or duplicate record ID.', 'id');
    } else {
      dcIds.add(dc.id);
    }
    if (!numberKey) addFinding('High', 'DC', dc.dcNumber, 'Missing DC number.', 'number');
    if (!dc.siteName?.trim()) addFinding('Medium', 'DC', dc.dcNumber, 'Missing site name.', 'site');
    if (!isValidDate(dc.date)) addFinding('Medium', 'DC', dc.dcNumber, `Invalid or missing date: ${dc.date || '(empty)'}.`, 'date');
    if (!Array.isArray(dc.itemsShipped) || dc.itemsShipped.length === 0) {
      addFinding('Low', 'DC', dc.dcNumber, 'No shipped line items recorded.', 'items');
    } else {
      dc.itemsShipped.forEach(item => {
        if (!item.itemName?.trim()) addFinding('Medium', 'DC', dc.dcNumber, 'Shipped line item has no description.', 'item-name');
        if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
          addFinding('High', 'DC', dc.dcNumber, `Invalid shipped quantity for "${item.itemName || 'unnamed item'}".`, 'item-qty');
        }
      });
    }

    const noPRRequired = dc.noPrRequired || ['no pr', 'no pr required', 'delivered no pr required'].includes((dc.prNumber || '').toLowerCase().trim());
    const isVoidedOrMissingPage = dc.dcNumber.toLowerCase().includes('missing');
    if (!noPRRequired && !isVoidedOrMissingPage) {
      const hasPRLink = (dc.prId && prs.some(pr => pr.id === dc.prId)) ||
        (normalize(dc.prNumber) && prNumbers.has(normalize(dc.prNumber)));
      if (!hasPRLink) {
        addFinding('Medium', 'DC', dc.dcNumber, `No matching PR found for reference "${dc.prNumber || '(empty)'}".`, 'pr-link');
      }
    }
  });

  dcNumbers.forEach((records) => {
    if (records.length > 1) {
      records.forEach(dc => addFinding('High', 'DC', dc.dcNumber, `Duplicate DC number appears in ${records.length} records.`, 'duplicate-number'));
    }
  });

  const severityRank: Record<AuditSeverity, number> = { High: 0, Medium: 1, Low: 2 };
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return { requisitionCount: prs.length, deliveryCount: dcs.length, findings };
}
