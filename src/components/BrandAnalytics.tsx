import React from 'react';
import { useApp } from '../context/AppContext';
import type { BrandCategory } from '../types';
import { getBrandBadgeColor } from '../lib/utils';
import { BarChart3 } from 'lucide-react';

const BRANDS: BrandCategory[] = [
  'Pakistan Cables',
  'Amer Cables',
  'Schneider Electric',
  'Terasaki',
  'Philips / Pak Lighting',
  'Conduit & Accessories',
  'Switches & Sockets',
  'General Electrical'
];

export const BrandAnalytics: React.FC = () => {
  const { prs, setSelectedBrandFilter, setActiveTab } = useApp();

  const brandStats: Record<BrandCategory, { requestedQty: number; fulfilledQty: number; itemHits: number }> = {
    'Pakistan Cables': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 },
    'Amer Cables': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 },
    'Schneider Electric': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 },
    'Terasaki': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 },
    'Philips / Pak Lighting': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 },
    'Conduit & Accessories': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 },
    'Switches & Sockets': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 },
    'General Electrical': { requestedQty: 0, fulfilledQty: 0, itemHits: 0 }
  };

  prs.forEach(pr => {
    pr.items.forEach(item => {
      const b = item.brand || 'General Electrical';
      if (brandStats[b]) {
        brandStats[b].requestedQty += item.requestedQty;
        brandStats[b].fulfilledQty += item.fulfilledQty;
        brandStats[b].itemHits++;
      }
    });
  });

  return (
    <div className="space-y-6 w-full text-slate-900">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#1e195b]" />
          Brand Distribution &amp; Stock Alignment
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Breakdown of demand by major electrical manufacturers supplied by Star Electric Enterprises (Saddar, Rawalpindi)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BRANDS.map(brand => {
          const stats = brandStats[brand];
          const pct = stats.requestedQty > 0 ? Math.round((stats.fulfilledQty / stats.requestedQty) * 100) : 0;

          return (
            <div
              key={brand}
              onClick={() => {
                setSelectedBrandFilter(brand);
                setActiveTab('ledger');
              }}
              className="bg-white border border-slate-200 hover:border-[#1e195b]/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${getBrandBadgeColor(brand)}`}>
                  {brand}
                </span>
                <span className="text-xs text-slate-600 font-mono font-bold">
                  {stats.itemHits} Line Items
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Fulfillment Velocity</span>
                  <span className="font-bold text-amber-800 font-mono">{pct}% Shipped</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Demanded Qty</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{stats.requestedQty.toLocaleString()} Units</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Dispatched / Shipped</span>
                  <p className="font-mono font-bold text-emerald-700 mt-0.5">{stats.fulfilledQty.toLocaleString()} Units</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
