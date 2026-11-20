// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DCRecord, PRRecord } from '../src/types';
import { planDeliveries, productIdentity, uniqueProductMatch } from '../src/lib/deliveryRules';
import { findDeliveryHistory } from '../src/lib/deliveryHistory';
import { computePRStatus } from '../src/lib/utils';
vi.mock('../src/lib/imageStorage', () => ({ saveImageToMemory: vi.fn(), getImageFromMemorySync: vi.fn(), normalizeImageKey: (a: string, b: string) => `${a}_${b}` }));
import { getDCs, getPRs, saveDCAndFulfillPR, saveMultipleDCsAndFulfillPRs, savePR, updateDCInStorage } from '../src/lib/storage';

const makePR = (): PRRecord => ({ id: 'p1', prNumber: 'PR-1', date: '2026-01-01', siteName: 'Site', status: 'Pending', createdTimestamp: 1, fulfillmentLogs: [], items: [
  { id: 'i1', name: 'Cable', brand: 'Pakistan Cables', unit: 'm', requestedQty: 10, fulfilledQty: 0, status: 'Pending' },
  { id: 'i2', name: 'Switch', brand: 'Switches & Sockets', unit: 'pcs', requestedQty: 2, fulfilledQty: 0, status: 'Pending' },
  { id: 'i3', name: 'Cancelled', brand: 'General Electrical', unit: 'pcs', requestedQty: 4, fulfilledQty: 0, status: 'Cancelled' },
] });
const draft = (dcNumber: string, qty: number) => ({ dcData: { dcNumber, invoiceNumber: dcNumber, prNumber: 'PR-1', prId: 'p1', date: '2026-01-02', siteName: 'Site', itemsShipped: [{ itemId: 'i1', itemName: 'Cable', brand: 'Pakistan Cables', unit: 'm', quantity: qty }] }, fulfillmentMap: { i1: qty } });
const record = (n: string, q: number, allow = false) => { const x = draft(n, q); return saveDCAndFulfillPR(x.dcData, x.fulfillmentMap, { allowOverdelivery: allow }); };

describe('delivery matching and product history', () => {
  beforeEach(() => localStorage.clear());
  it('matches only complete unique name, brand and unit identities', () => {
    const key = productIdentity('  CABLE ', 'Pakistan Cables', ' M ');
    expect(key).toEqual(productIdentity('cable', 'pakistan cables', 'm'));
    expect(key).not.toEqual(productIdentity('cable', 'Amer Cables', 'm'));
    expect(key).not.toEqual(productIdentity('cable', 'Pakistan Cables', 'pcs'));
    expect(productIdentity('Cable', '', 'm')).toBeNull();
    expect(uniqueProductMatch([{ key }, { key }], key, item => item.key)).toBeUndefined();
  });
  it('requires all active items to be fulfilled; cancelled items do not block completion', () => {
    const pr = makePR(); expect(computePRStatus(pr.items)).toBe('Pending');
    pr.items[0].fulfilledQty = 10; expect(computePRStatus(pr.items)).toBe('In-Progress');
    pr.items[1].fulfilledQty = 2; expect(computePRStatus(pr.items)).toBe('Fulfilled');
    expect(computePRStatus([pr.items[2]])).toBe('Cancelled');
  });
  it('records multiple partial DCs, keeps cancelled items, and does not silently clamp overdelivery', () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([makePR()]));
    record('DC-1', 4); record('DC-2', 5);
    expect(getPRs()[0].items[0].fulfilledQty).toBe(9); expect(getPRs()[0].status).toBe('In-Progress');
    expect(() => record('DC-3', 3)).toThrow(/confirmation/i);
    expect(getDCs()).toHaveLength(2);
    record('DC-3', 3, true);
    expect(getPRs()[0].items[0].fulfilledQty).toBe(12);
    expect(getPRs()[0].items[2].status).toBe('Cancelled');
    expect(getDCs()[0].itemsShipped[0].quantity).toBe(3);
  });
  it('rejects duplicates, bad identifiers, inconsistent logs and wrong product details before writes', () => {
    const pr = makePR(); localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    record('DC-1', 2); const before = JSON.stringify([getPRs(), getDCs()]);
    expect(() => record('dc 1', 2)).toThrow(/already exists/i);
    const bad = draft('DC-2', 1); bad.dcData.itemsShipped[0].brand = 'Amer Cables';
    expect(() => planDeliveries(getPRs(), getDCs(), [bad])).toThrow(/name, brand and unit/i);
    const inconsistent = makePR(); inconsistent.items[0].fulfilledQty = 3;
    expect(() => planDeliveries([inconsistent], [], [draft('DC-3', 1)])).toThrow(/inconsistent history/i);
    expect(JSON.stringify([getPRs(), getDCs()])).toBe(before);
  });
  it('projects multiple draft deliveries together and rejects duplicate batch numbers before saving', () => {
    const pr = makePR(); localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    const batch = [draft('DC-1', 6), draft('DC-2', 6)];
    expect(planDeliveries([pr], [], batch).overdeliveries[0]).toMatchObject({ remaining: 4, shipped: 6 });
    expect(() => saveMultipleDCsAndFulfillPRs(batch)).toThrow(/confirmation/i);
    expect(getDCs()).toHaveLength(0);
    expect(() => saveMultipleDCsAndFulfillPRs([draft('DC-1', 1), draft('DC-1', 1)], { allowOverdelivery: true })).toThrow(/already exists/i);
    expect(getDCs()).toHaveLength(0);
  });
  it('does not erase an orphaned fulfillment log when its DC record is missing', () => {
    const pr = makePR();
    pr.items[0].fulfilledQty = 2;
    pr.fulfillmentLogs.push({ id: 'old', dcNumber: 'DC-1', invoiceNumber: 'DC-1', prNumber: 'PR-1', itemId: 'i1', itemName: 'Cable', quantityShipped: 2, date: '2026-01-01' });
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([pr]));
    const before = localStorage.getItem('STAR_ELECTRIC_PRS_V2');
    expect(() => record('DC 1', 1)).toThrow(/fulfillment history/i);
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBe(before);
  });
  it('keeps unmatched items on the DC without rewriting the PR', () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([makePR()]));
    const before = localStorage.getItem('STAR_ELECTRIC_PRS_V2');
    const entry = draft('DC-1', 1);
    entry.dcData.itemsShipped = [{ itemId: 'unmatched', itemName: 'Other', brand: '', unit: '', quantity: 1 }];
    entry.fulfillmentMap = { unmatched: 1 };
    saveDCAndFulfillPR(entry.dcData, entry.fulfillmentMap);
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBe(before);
    expect(getDCs()[0].itemsShipped[0].itemName).toBe('Other');
  });
  it('uses the selected PR ID even if another PR has the same number', () => {
    const other = { ...makePR(), id: 'p2' };
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([other, makePR()]));
    record('DC-1', 2);
    expect(getPRs().find(pr => pr.id === 'p1')?.items[0].fulfilledQty).toBe(2);
    expect(getPRs().find(pr => pr.id === 'p2')?.items[0].fulfilledQty).toBe(0);
  });
  it('preserves fulfillment logs on metadata edits and blocks unsafe linked quantity changes', () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([makePR()])); record('DC-1', 2);
    const dc = getDCs()[0], before = localStorage.getItem('STAR_ELECTRIC_PRS_V2');
    updateDCInStorage({ ...dc, remarks: 'Updated metadata' });
    expect(localStorage.getItem('STAR_ELECTRIC_PRS_V2')).toBe(before);
    expect(() => updateDCInStorage({ ...dc, itemsShipped: [{ ...dc.itemsShipped[0], quantity: 7 }] })).toThrow(/temporarily disabled/i);
    expect(getDCs()[0].itemsShipped[0].quantity).toBe(2);
  });
  it('does not write a DC if the local PR save fails', () => {
    localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify([makePR()]));
    const real = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key, value) {
      if (this === localStorage && key === 'STAR_ELECTRIC_PRS_V2') throw new DOMException('Quota', 'QuotaExceededError');
      return real.call(this, key, value);
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    try { expect(() => record('DC-1', 2)).toThrow(/local PR save failed/i); expect(getDCs()).toHaveLength(0); }
    finally { spy.mockRestore(); vi.restoreAllMocks(); }
  });
  it('does not relink unrelated historical DCs when a PR is saved', () => {
    const old = { ...draft('DC-Old', 1).dcData, id: 'old', createdTimestamp: 1, prId: 'missing', prNumber: 'PR-1' } as DCRecord;
    localStorage.setItem('STAR_ELECTRIC_DCS_V2', JSON.stringify([old]));
    const before = localStorage.getItem('STAR_ELECTRIC_DCS_V2');
    savePR(makePR()); expect(localStorage.getItem('STAR_ELECTRIC_DCS_V2')).toBe(before);
  });
  it('searches every available DC item, including unlinked items and distinct brands and units', () => {
    const base = { ...draft('DC-1', 2).dcData, id: 'd1', createdTimestamp: 1 } as DCRecord;
    const unlinked = { ...base, id: 'd2', dcNumber: 'DC-2', prId: '', prNumber: '', date: '03/01/2026', itemsShipped: [{ ...base.itemsShipped[0], brand: 'Amer Cables', unit: 'pcs' }] };
    const list = [base, unlinked];
    expect(findDeliveryHistory(list, { itemQuery: 'cable' })).toHaveLength(2);
    expect(findDeliveryHistory(list, { itemQuery: 'cable', brand: 'Amer Cables', unitQuery: 'pcs', startDate: '2026-01-03' })[0].dc.id).toBe('d2');
    expect(findDeliveryHistory(list, { prNumber: 'PR-1' })).toHaveLength(1);
  });
});
