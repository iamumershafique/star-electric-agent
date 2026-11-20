import type { DCRecord, PRRecord } from '../types';

export type DeliveryDraft = { dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>; fulfillmentMap: Record<string, number> };
export interface Overdelivery { dcNumber: string; prNumber: string; item: string; unit: string; shipped: number; remaining: number }

/** Only case, Unicode composition and whitespace are ignored; empty components never match. */
export function productIdentity(name: string | undefined, brand: string | undefined, unit: string | undefined): string | null {
  const normalize = (value: string | undefined) => (value || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const parts = [normalize(name), normalize(brand), normalize(unit)];
  return parts.every(Boolean) ? JSON.stringify(parts) : null;
}

export function uniqueProductMatch<T>(candidates: T[], identity: string | null, key: (item: T) => string | null): T | undefined {
  if (!identity) return undefined;
  const matches = candidates.filter(candidate => key(candidate) === identity);
  return matches.length === 1 ? matches[0] : undefined;
}

const reference = (value: string | undefined) => (value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();

/** Read-only validation and projection. Never changes ledger records. */
export function planDeliveries(prs: PRRecord[], dcs: DCRecord[], drafts: DeliveryDraft[]): { overdeliveries: Overdelivery[] } {
  const dcNumbers = new Set(dcs.map(dc => reference(dc.dcNumber)).filter(Boolean));
  const projected = new Map<string, Map<string, number>>();
  const checkedPRs = new Set<string>();
  const overdeliveries: Overdelivery[] = [];
  for (const { dcData, fulfillmentMap } of drafts) {
    const number = reference(dcData.dcNumber);
    if (!number) throw new Error('A delivery challan number is required.');
    if (dcNumbers.has(number)) throw new Error(`DC ${dcData.dcNumber} already exists; use the edit workflow instead of creating a duplicate.`);
    if (prs.some(pr => (pr.fulfillmentLogs || []).some(log => reference(log.dcNumber) === number))) throw new Error(`DC ${dcData.dcNumber} already appears in PR fulfillment history; review the missing or existing DC before recording it.`);
    dcNumbers.add(number);
    const idMatches = dcData.prId ? prs.filter(pr => pr.id === dcData.prId) : [];
    const numberMatches = dcData.prNumber ? prs.filter(pr => reference(pr.prNumber) === reference(dcData.prNumber)) : [];
    if (dcData.prId && idMatches.length !== 1) throw new Error(`Selected PR for ${dcData.dcNumber} was not found uniquely.`);
    if (!dcData.prId && numberMatches.length > 1) throw new Error(`PR ${dcData.prNumber} is ambiguous. Select the correct PR explicitly.`);
    const pr = idMatches[0] || numberMatches[0];
    if (pr && dcData.prNumber && reference(pr.prNumber) !== reference(dcData.prNumber)) throw new Error(`The PR ID and PR number for ${dcData.dcNumber} do not match.`);
    const shippedItems = dcData.itemsShipped || [];
    const ids = shippedItems.map(item => item.itemId);
    if (new Set(ids).size !== ids.length) throw new Error(`DC ${dcData.dcNumber} has duplicate item identifiers. Review the items before saving.`);
    for (const item of shippedItems) {
      if (!Number.isFinite(item.quantity) || item.quantity < 0) throw new Error(`Invalid quantity for ${item.itemName}.`);
      if (fulfillmentMap[item.itemId] !== undefined && item.quantity !== fulfillmentMap[item.itemId]) throw new Error(`Conflicting quantities for ${item.itemName}.`);
    }
    for (const [id, qty] of Object.entries(fulfillmentMap)) {
      if (!Number.isFinite(qty) || qty < 0) throw new Error('Quantities must be finite, non-negative numbers.');
      if (qty > 0 && !pr?.items.some(item => item.id === id) && !shippedItems.some(item => item.itemId === id)) throw new Error(`Unknown item in DC ${dcData.dcNumber}.`);
    }
    if (!pr) continue;
    if (!checkedPRs.has(pr.id)) {
      if (new Set(pr.items.map(item => item.id)).size !== pr.items.length) throw new Error(`PR ${pr.prNumber} contains duplicate item IDs; review it before recording deliveries.`);
      for (const item of pr.items) {
        if (!Number.isFinite(item.fulfilledQty) || !Number.isFinite(item.requestedQty) || item.fulfilledQty < 0 || item.requestedQty < 0) throw new Error(`PR ${pr.prNumber} contains invalid quantities.`);
        const recorded = (pr.fulfillmentLogs || []).filter(log => log.itemId === item.id).reduce((sum, log) => sum + log.quantityShipped, 0);
        if (!Number.isFinite(recorded) || Math.abs(recorded - item.fulfilledQty) > 0.000001) throw new Error(`PR ${pr.prNumber} has inconsistent history for ${item.name}; review it before recording another delivery.`);
      }
      checkedPRs.add(pr.id);
      projected.set(pr.id, new Map(pr.items.map(item => [item.id, item.fulfilledQty])));
    }
    const quantities = projected.get(pr.id)!;
    for (const item of pr.items) {
      const qty = fulfillmentMap[item.id] || 0;
      if (qty <= 0) continue;
      if (item.status === 'Cancelled') throw new Error(`Cannot deliver cancelled item ${item.name}.`);
      const supplied = shippedItems.find(shipped => shipped.itemId === item.id);
      if (supplied && (!productIdentity(item.name, item.brand, item.unit) || productIdentity(item.name, item.brand, item.unit) !== productIdentity(supplied.itemName, supplied.brand, supplied.unit))) {
        throw new Error(`Product name, brand and unit for ${item.name} must match the selected PR item.`);
      }
      const remaining = Math.max(0, item.requestedQty - (quantities.get(item.id) || 0));
      if (qty > remaining) overdeliveries.push({ dcNumber: dcData.dcNumber, prNumber: pr.prNumber, item: item.name, unit: item.unit, shipped: qty, remaining });
      quantities.set(item.id, (quantities.get(item.id) || 0) + qty);
    }
  }
  return { overdeliveries };
}
