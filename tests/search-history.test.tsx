// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
const data = vi.hoisted(() => ({ prs: [], sites: [], dcs: [
  { id: 'a', dcNumber: 'DC-1', invoiceNumber: 'DC-1', prId: 'p', prNumber: 'PR-1', date: '2026-01-01', siteName: 'Site', createdTimestamp: 1, itemsShipped: [{ itemId: 'a', itemName: 'Cable', brand: 'Pakistan Cables', unit: 'm', quantity: 3 }] },
  { id: 'b', dcNumber: 'DC-2', invoiceNumber: 'DC-2', prId: '', prNumber: '', date: '2026-01-02', siteName: 'Other', createdTimestamp: 2, itemsShipped: [{ itemId: 'b', itemName: 'Cable', brand: 'Amer Cables', unit: 'pcs', quantity: 2 }] }
], setSelectedPR: vi.fn(), setIsPRDetailOpen: vi.fn() }));
vi.mock('../src/context/AppContext', () => ({ useApp: () => data }));
import { SearchAuditView } from '../src/components/SearchAuditView';
afterEach(cleanup);
describe('recorded DC product history', () => {
  it('includes an unlinked DC and filters by unit without changing the source records', () => {
    render(<SearchAuditView />);
    const section = screen.getByRole('region', { name: /recorded DC product history/i });
    expect(within(section).getByText('DC-1')).toBeTruthy();
    expect(within(section).getByText('DC-2')).toBeTruthy();
    expect(within(section).getByText('Unlinked')).toBeTruthy();
    fireEvent.change(within(section).getByLabelText('Filter recorded DC items by unit'), { target: { value: 'pcs' } });
    expect(within(section).queryByText('DC-1')).toBeNull();
    expect(within(section).getByText('DC-2')).toBeTruthy();
    expect(data.dcs).toHaveLength(2);
  });
});
