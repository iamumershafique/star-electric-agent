import type { DCRecord } from '../types';
import { normalizeDateToISO } from './utils';

export type DeliveryHistoryFilter = {
  itemQuery?: string; brand?: string; unitQuery?: string; prNumber?: string; dcNumber?: string;
  site?: string; startDate?: string; endDate?: string;
};
export type DeliveryHistoryEntry = { dc: DCRecord; item: DCRecord['itemsShipped'][number]; index: number };
const contains = (value: string | undefined, query: string | undefined) => !query?.trim() || (value || '').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());

/** Enumerates recorded DC items without guessing PR links or merging similar products. */
export function findDeliveryHistory(dcs: DCRecord[], filter: DeliveryHistoryFilter): DeliveryHistoryEntry[] {
  return dcs.flatMap(dc => {
    const date = normalizeDateToISO(dc.date || '');
    const comparable = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if ((filter.startDate || filter.endDate) && (!comparable || (filter.startDate && date < filter.startDate) || (filter.endDate && date > filter.endDate))) return [];
    if (!contains(dc.prNumber, filter.prNumber) || (!contains(dc.dcNumber, filter.dcNumber) && !contains(dc.invoiceNumber, filter.dcNumber)) || !contains(dc.siteName, filter.site)) return [];
    return (Array.isArray(dc.itemsShipped) ? dc.itemsShipped : []).flatMap((item, index) => {
      if (!contains(item.itemName, filter.itemQuery) || !contains(item.unit, filter.unitQuery) || (filter.brand && item.brand !== filter.brand)) return [];
      return [{ dc, item, index }];
    });
  });
}
