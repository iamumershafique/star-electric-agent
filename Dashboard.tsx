import React from 'react';
import { useApp } from '../context/AppContext';
import { getStatusBadgeColor, plural } from '../lib/utils';
import { siteGroupKey } from '../lib/siteMaster';
import { 
  FileCheck2, 
  CheckCircle2, 
  Building, 
  Zap, 
  ArrowRight,
  Truck,
  Edit3,
  Package
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    prs, 
    dcs,
    sites,
    setActiveTab,
    setSelectedPR, 
    setIsPRDetailOpen, 
    setSearchQuery,
    setSelectedSiteFilter,
    setEditingPR,
    setIsPREditOpen,
    setEditingDC,
    setIsDCEditOpen
  } = useApp();

  const totalPRs = prs.length;
  const fulfilledPRs = prs.filter(p => p.status === 'Fulfilled').length;
  const inProgressPRs = prs.filter(p => p.status === 'In-Progress').length;
  const pendingPRs = prs.filter(p => p.status === 'Pending').length;
  const cancelledPRs = prs.filter(p => p.status === 'Cancelled').length;

  let totalLineItems = 0;
  let fulfilledLineItems = 0;

  prs.forEach(pr => {
    pr.items.forEach(item => {
      if (item.status !== 'Cancelled') {
        totalLineItems++;
        if (item.fulfilledQty >= item.requestedQty) {
          fulfilledLineItems++;
        }
      }
    });
  });

  const fulfillmentPercentage = totalLineItems > 0 
    ? Math.round((fulfilledLineItems / totalLineItems) * 100) 
    : 0;

  // DC metrics. "Missing" placeholder DCs are excluded everywhere so every card uses the same base.
  const isMissingDC = (d: typeof dcs[number]) => (d.dcNumber || '').toLowerCase().includes('missing');
  const hasBuilty = (d: typeof dcs[number]) => Boolean(d.isBuiltyAttached || d.biltyNumber?.trim() || d.builtyImage);
  const realDCs = dcs.filter(d => !isMissingDC(d));
  const totalDCs = realDCs.length;
  const missingDCCount = dcs.length - totalDCs;
  const deliveredDCCount = realDCs.filter(d => d.deliveryStatus === 'Delivered').length;
  const dispatchedDCCount = realDCs.filter(d => d.deliveryStatus === 'Dispatched' || d.deliveryStatus === 'In-Transit').length;
  const noStatusDCCount = totalDCs - deliveredDCCount - dispatchedDCCount;
  const completedDCCount = deliveredDCCount + dispatchedDCCount;
  // Builty = sent via goods transport; everything else went straight to the farm / site.
  const builtyDCCount = realDCs.filter(hasBuilty).length;
  const builtyInTransitCount = realDCs.filter(d => hasBuilty(d) && d.deliveryStatus !== 'Delivered').length;
  const directDeliveredCount = realDCs.filter(d => !hasBuilty(d) && d.deliveryStatus === 'Delivered').length;
  const recentDCs = realDCs;

  // Count DCs / PRs per site by grouping key, not substring (substring made "Warehouse" swallow every "Warehouse X").
  const dcCountBySite = new Map<string, number>();
  realDCs.forEach(d => {
    const k = siteGroupKey(d.siteName);
    if (k) dcCountBySite.set(k, (dcCountBySite.get(k) || 0) + 1);
  });
  const prCountBySite = new Map<string, number>();
  prs.forEach(p => {
    const k = siteGroupKey(p.siteName);
    if (k) prCountBySite.set(k, (prCountBySite.get(k) || 0) + 1);
  });

  return (
    <div className="w-full flex flex-col gap-3 min-w-0">
      {/* KPI Cards (4 columns): Every DC attached means material delivered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        
        {/* Card 1: Total Material Delivered (DCs) */}
        <div 
          onClick={() => setActiveTab('deliveries')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2 hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/20 transition-all cursor-pointer group"
          title={`Click to view all ${totalDCs} Delivery Challans in Deliveries log${missingDCCount ? ` (${missingDCCount} missing-DC placeholders excluded)` : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
              Delivery Statuses Set
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">{completedDCCount}</span>
            <span className="text-xs text-slate-500 font-semibold">Completed DCs</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-emerald-700 font-bold">{deliveredDCCount} Delivered · {dispatchedDCCount} In transit{noStatusDCCount > 0 ? ` · ${noStatusDCCount} No status` : ''}</span>
            <span className="text-slate-400 group-hover:text-emerald-700 font-medium flex items-center gap-0.5">
              All {totalDCs} DCs <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Direct Farm / Site Deliveries */}
        <div 
          onClick={() => setActiveTab('deliveries')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/20 transition-all cursor-pointer group"
          title="Click to view Direct Deliveries to Poultry Farms"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider group-hover:text-blue-700 transition-colors">
              Direct Site Deliveries
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-700">{directDeliveredCount}</span>
            <span className="text-xs text-slate-500 font-semibold">Farm / Site Deliveries</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-blue-700 font-bold">Delivered direct (no builty)</span>
            <span className="text-slate-400 group-hover:text-blue-700 font-medium flex items-center gap-0.5">
              View Log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Goods Transport Builtys */}
        <div 
          onClick={() => setActiveTab('deliveries')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2 hover:border-amber-300 hover:shadow-md hover:bg-amber-50/20 transition-all cursor-pointer group"
          title="Click to view Goods Transport deliveries with builty scans"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              Goods Transport (Builties)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{builtyDCCount}</span>
            <span className="text-xs text-slate-500 font-semibold">Sent via Goods Transport</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-amber-700 font-bold">{builtyInTransitCount} still in transit</span>
            <span className="text-slate-400 group-hover:text-amber-700 font-medium flex items-center gap-0.5">
              View Log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Demand Requisitions (PRs) */}
        <div 
          onClick={() => setActiveTab('ledger')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2 hover:border-purple-300 hover:shadow-md hover:bg-purple-50/20 transition-all cursor-pointer group"
          title="Click to view Demand PRs in Master Requisition Ledger"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider group-hover:text-purple-700 transition-colors">
              Demand Requisitions (PRs)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700">{totalPRs}</span>
            <span className="text-xs text-slate-500 font-semibold">PR Demand Orders</span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
              {fulfilledPRs} Fulfilled
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
              {inProgressPRs + pendingPRs} Active
            </span>
            {cancelledPRs > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px] border border-slate-300">
                {cancelledPRs} Cancelled
              </span>
            )}
            <span className="text-slate-400 font-medium ml-auto">
              {fulfillmentPercentage}% matched
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Fits in remaining desktop height with scrollable panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 min-h-0">
        
        {/* Left Column (2 Cols): Recent Requisitions */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#fd2729]" />
                Recent Requisitions (Jadeed Group)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Incoming demand sheets & status</p>
            </div>

            <button
              onClick={() => setActiveTab('ledger')}
              className="text-xs font-bold text-[#1e195b] hover:text-[#fd2729] flex items-center gap-1 cursor-pointer"
            >
              Master Ledger <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[36rem] pr-1">
            {prs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <p className="text-xs font-bold text-slate-700">No requisitions recorded yet</p>
                <p className="text-[11px] text-slate-500">Click "Scan Demand PR" to upload a demand sheet.</p>
              </div>
            ) : (
              prs.slice(0, 6).map(pr => {
                const completedItems = pr.items.filter(i => i.fulfilledQty >= i.requestedQty).length;
                const progressPct = pr.items.length > 0 ? Math.round((completedItems / pr.items.length) * 100) : 0;

                return (
                  <div
                    key={pr.id}
                    onClick={() => {
                      setSelectedPR(pr);
                      setIsPRDetailOpen(true);
                    }}
                    className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-[#1e195b]/40 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-[#1e195b] transition-colors">
                          {pr.prNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadgeColor(pr.status)}`}>
                          {pr.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        {pr.siteName}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Date: {pr.date} • {plural(pr.items.length, 'Line Item')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-800">
                          {completedItems}/{pr.items.length} Fulfilled
                        </span>
                        <div className="w-28 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden border border-slate-300">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPR(pr);
                            setIsPREditOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-colors shadow-2xs flex items-center gap-1"
                          title="Edit PR"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button className="px-2.5 py-1 rounded bg-white group-hover:bg-[#1e195b] text-slate-900 group-hover:text-white text-xs font-extrabold border border-slate-300 group-hover:border-[#1e195b] transition-colors shadow-2xs">
                          Inspect
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Split vertically between Major Brands & Farm Locations */}
        <div className="flex flex-col gap-3 min-h-0">
          
          {/* Top Card: Recent Delivery Challans & Invoices (DCs) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Recent Delivery Challans (DCs)
              </h3>
              <button
                onClick={() => setActiveTab('deliveries')}
                className="text-[11px] font-bold text-[#1e195b] hover:text-[#fd2729] hover:underline cursor-pointer"
              >
                All DCs ({totalDCs})
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pt-2 pr-1">
              {recentDCs.length === 0 ? (
                <div className="text-center py-4 text-[11px] text-slate-500 font-medium">
                  No Delivery Challans generated yet. Click "Record DC" to create one.
                </div>
              ) : (
                recentDCs.slice(0, 5).map(dc => (
                  <div 
                    key={dc.id} 
                    onClick={() => setActiveTab('deliveries')}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 text-[11px]">
                          {dc.dcNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{dc.date}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDC(dc);
                          setIsDCEditOpen(true);
                        }}
                        className="p-1 rounded bg-white hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-slate-200 transition-colors shadow-2xs"
                        title="Edit Delivery Challan"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 truncate">
                      {dc.siteName}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-600 font-semibold">
                      <span>{plural(dc.itemsShipped.length, 'Line Item')}</span>
                      {dc.prNumber?.trim() ? (
                        <span className="text-blue-800 font-extrabold font-mono">PR #{dc.prNumber}</span>
                      ) : dc.noPrRequired ? (
                        <span className="text-slate-500 font-bold">No PR required</span>
                      ) : (
                        <span className="text-red-700 font-extrabold">PR not linked</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Card: Jadeed Group Farm Locations */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Jadeed Group Farm Locations
              </h3>
              <span className="text-[10px] font-bold text-slate-500">{sites.length} Active</span>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 pt-2 pr-1">
              {sites.length === 0 ? (
                <div className="text-center py-4 text-[11px] text-slate-500 font-medium">
                  No farm locations recorded yet. Upload a demand document to discover.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {sites.map(site => {
                    const siteDCCount = dcCountBySite.get(site.region) || 0;
                    const sitePRCount = prCountBySite.get(site.region) || 0;
                    return (
                      <div
                        key={site.id}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSiteFilter(site.region);
                          setActiveTab('deliveries');
                        }}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all cursor-pointer group flex items-center justify-between shadow-2xs"
                        title={`View ${siteDCCount} delivered DCs for ${site.name}`}
                      >
                        <div className="truncate pr-1">
                          <h4 className="text-[11px] font-bold text-slate-900 truncate group-hover:text-emerald-900 transition-colors">
                            {site.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {siteDCCount > 0 ? (
                            <span className="text-[10px] font-extrabold text-emerald-950 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                              {plural(siteDCCount, 'DC')}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                              0 DCs
                            </span>
                          )}
                          {sitePRCount > 0 && (
                            <span className="text-[10px] font-extrabold text-amber-950 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300">
                              {plural(sitePRCount, 'PR')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
