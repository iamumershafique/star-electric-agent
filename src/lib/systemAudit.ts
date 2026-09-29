import { PRRecord, DCRecord } from '../types';

export interface AuditIssue {
  id: string;
  type: 'ORPHANED_DC' | 'OVER_FULFILLED' | 'GHOST_RECORD' | 'PR_MISMATCH' | 'DATA_INCONSISTENCY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  affectedRecordId: string;
  recordType: 'PR' | 'DC';
  suggestion: string;
}

export function performSystemAudit(prs: PRRecord[], dcs: DCRecord[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. Orphaned DCs: DC linked to non-existent PR
  dcs.forEach(dc => {
    if (dc.prId && !prs.find(p => p.id === dc.prId)) {
      issues.push({
        id: `orphan-${dc.id}`,
        type: 'ORPHANED_DC',
        severity: 'CRITICAL',
        message: `DC ${dc.dcNumber} is linked to PR ID ${dc.prId}, but that PR does not exist.`,
        affectedRecordId: dc.id,
        recordType: 'DC',
        suggestion: 'Relink this DC to a valid PR or mark it as No PR Required.'
      });
    }
  });

  // 2. Over-fulfillment: Fulfilled > Requested
  prs.forEach(pr => {
    pr.items.forEach(item => {
      if (item.fulfilledQty > item.requestedQty) {
        issues.push({
          id: `overfill-${pr.id}-${item.id}`,
          type: 'OVER_FULFILLED',
          severity: 'CRITICAL',
          message: `PR ${pr.prNumber} item "${item.name}" is over-fulfilled (${item.fulfilledQty}/${item.requestedQty}).`,
          affectedRecordId: pr.id,
          recordType: 'PR',
          suggestion: 'Check DC records and reduce shipped quantities.'
        });
      }
    });
  });

  // 3. Ghost Records: Missing critical data
  dcs.forEach(dc => {
    if (!dc.dcNumber || !dc.date || !dc.siteName || !dc.itemsShipped || dc.itemsShipped.length === 0) {
      issues.push({
        id: `ghost-${dc.id}`,
        type: 'GHOST_RECORD',
        severity: 'WARNING',
        message: `DC ${dc.dcNumber || 'Unknown'} is missing critical data (Date, Site, or Items).`,
        affectedRecordId: dc.id,
        recordType: 'DC',
        suggestion: 'Edit the DC and fill in the missing information.'
      });
    }
  });

  // 4. PR Mismatch: DC linked to PR-A, but extracted PR-B
  dcs.forEach(dc => {
    if (dc.prNumber && dc.prId) {
      const linkedPR = prs.find(p => p.id === dc.prId);
      if (linkedPR && linkedPR.prNumber !== dc.prNumber) {
        issues.push({
          id: `mismatch-${dc.id}`,
          type: 'PR_MISMATCH',
          severity: 'WARNING',
          message: `DC ${dc.dcNumber} is linked to ${linkedPR.prNumber}, but document text says ${dc.prNumber}.`,
          affectedRecordId: dc.id,
          recordType: 'DC',
          suggestion: 'Verify the correct PR and relink if necessary.'
        });
      }
    }
  });

  return issues;
}
