// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/imageStorage', () => ({
  saveImageToMemory: vi.fn(),
  getImageFromMemorySync: vi.fn(),
  normalizeImageKey: (type: string, value: string) => `${type}_${value}`,
}));

import { getDCs, getPRs } from '../src/lib/storage';

const PRS = 'STAR_ELECTRIC_PRS_V2';
const DCS = 'STAR_ELECTRIC_DCS_V2';

describe('non-destructive ledger reads', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no records and does not insert a historical dataset', () => {
    expect(getPRs()).toEqual([]);
    expect(getDCs()).toEqual([]);
    expect(localStorage.getItem(PRS)).toBeNull();
    expect(localStorage.getItem(DCS)).toBeNull();
  });

  it('preserves records, duplicates, and user-entered values without writing storage', () => {
    const prs = [{ id: 'p60', prNumber: 'PR-60', date: '2024-01-01', siteName: 'Site', items: [], fulfillmentLogs: [], createdTimestamp: 1 }];
    const dcs = [
      { id: 'a', dcNumber: 'DC-652', prNumber: 'PR-60', date: '2024-02-01', siteName: 'My site', driverName: 'My driver', vehicleNumber: 'MY-123', itemsShipped: [{ itemId: 'i', itemName: 'Cable', brand: '', unit: 'm', quantity: 7 }], createdTimestamp: 2 },
      { id: 'b', dcNumber: 'DC-652', prNumber: '', date: '2024-02-02', siteName: 'Other site', itemsShipped: [], createdTimestamp: 3 },
    ];
    localStorage.setItem(PRS, JSON.stringify(prs));
    localStorage.setItem(DCS, JSON.stringify(dcs));
    const beforePR = localStorage.getItem(PRS);
    const beforeDC = localStorage.getItem(DCS);
    expect(getPRs().map(p => p.prNumber)).toEqual(['PR-60']);
    const readDCs = getDCs();
    expect(readDCs).toHaveLength(2);
    expect(readDCs[0]).toMatchObject(dcs[0]);
    expect(localStorage.getItem(PRS)).toBe(beforePR);
    expect(localStorage.getItem(DCS)).toBe(beforeDC);
  });

  it('does not replace malformed data with empty or seeded records', () => {
    localStorage.setItem(DCS, '{broken');
    expect(() => getDCs()).toThrow();
    expect(localStorage.getItem(DCS)).toBe('{broken');
  });
});
