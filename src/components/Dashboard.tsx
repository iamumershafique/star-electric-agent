import React from 'react';
import { useApp } from '../context/AppContext';
import { isDCPRMissing } from '../lib/storage';
import { getStatusBadgeColor } from '../lib/utils';
import type { PRStatus } from '../types';
import { ArrowRight, Building, ClipboardList, Edit3, FileCheck2, Truck } from 'lucide-react';

const PR_STATUS_PRIORITY: Record<PRStatus, number> = {
  Pending: 0,
  'In-Progress': 1,
  Fulfilled: 2,
  Cancelled: 3
};

export const Dashboard: React.FC = () => {
  const {
    prs,
    dcs,
    sites,
    setActiveTab,
    setSelectedPR,
    setIsPRDetailOpen,
    setSearchQuery,
    setEditingPR,
    setIsPREditOpen,
    setEditingDC,
    setIsDCEditOpen
  } = useApp();

  const prioritizedPRs = [...prs].sort((a, b) =>
    PR_STATUS_PRIORITY[a.status] - PR_STATUS_PRIORITY[b.status] ||
    b.createdTimestamp - a.createdTimestamp
  );
  const openPRs = prioritizedPRs.filter(pr =>
    (pr.status === 'Pending' || pr.status === 'In-Progress') &&
    pr.items.some(item => item.status !== 'Cancelled' && item.fulfilledQty < item.requestedQty)
  );
  const realDCs = dcs.filter(dc => !(dc.dcNumber || '').toLowerCase().includes('missing'));
  const unlinkedDCs = realDCs.filter(dc => isDCPRMissing(dc, prs));
  const unstatusedDCs = realDCs.filter(dc => !dc.deliveryStatus);
  const deliveryStatusSet = realDCs.length - unstatusedDCs.length;
  const fulfilledPRs = prs.filter(pr => pr.status === 'Fulfilled').length;
  const inProgressPRs = prs.filter(pr => pr.status === 'In-Progress').length;
  const pendingPRs = prs.filter(pr => pr.status === 'Pending').length;

  const openPR = (pr: typeof prs[number]) => {
    setSelectedPR(pr);
    setIsPRDetailOpen(true);
  };

  const editDC = (dc: typeof dcs[number]) => {
    setEditingDC(dc);
    setIsDCEditOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Star Electric · Jadeed Group</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">A clear view of requisitions, deliveries, and items that need attention.</p>
        </div>
        <button
          onClick={() => setActiveTab('ledger')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          Open master ledger <ArrowRight className="h-4 w-4" />
        </button>
      </header>

      <section aria-label="Portal summary" className="grid grid-cols-2 divide-x divide-y divide-slate-300 overflow-hidden rounded-xl border border-slate-300 bg-white sm:grid-cols-4 sm:divide-y-0">
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Total requisitions</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{prs.length}</p>
          <p className="mt-1 text-xs text-slate-500">{fulfilledPRs} fulfilled</p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Open requisitions</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{openPRs.length}</p>
          <p className="mt-1 text-xs text-slate-500">{pendingPRs} pending · {inProgressPRs} in progress</p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Delivery challans</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{realDCs.length}</p>
          <p className="mt-1 text-xs text-slate-500">{deliveryStatusSet} with delivery status</p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-500">Follow-up needed</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{openPRs.length + unlinkedDCs.length + unstatusedDCs.length}</p>
          <p className="mt-1 text-xs text-slate-500">Across requisitions and deliveries</p>
        </div>
      </section>

      <section aria-labelledby="dashboard-action-center">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="dashboard-action-center" className="text-base font-semibold text-slate-900">Needs attention</h2>
            <p className="mt-0.5 text-sm text-slate-500">The next actions to keep records up to date.</p>
          </div>
          <span className="text-xs font-medium text-slate-500">Live from portal records</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><ClipboardList className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">Open requisitions</p>
                <p className="truncate text-xs text-slate-500">Pending or in-progress with quantities remaining</p>
              </div>
            </div>
            <span className="min-w-8 text-right text-sm font-semibold tabular-nums text-slate-800">{openPRs.length}</span>
            <button
              onClick={() => openPRs[0] ? openPR(openPRs[0]) : setActiveTab('ledger')}
              className="hidden items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 sm:inline-flex"
            >
              {openPRs.length ? 'Review first' : 'View ledger'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><FileCheck2 className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">Delivery challans without a valid PR link</p>
                <p className="truncate text-xs text-slate-500">Link each challan or mark it as no-PR-required</p>
              </div>
            </div>
            <span className="min-w-8 text-right text-sm font-semibold tabular-nums text-slate-800">{unlinkedDCs.length}</span>
            <button
              onClick={() => unlinkedDCs[0] ? editDC(unlinkedDCs[0]) : setActiveTab('deliveries')}
              className="hidden items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 sm:inline-flex"
            >
              {unlinkedDCs.length ? 'Review first' : 'View deliveries'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Truck className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">Delivery challans without a status</p>
                <p className="truncate text-xs text-slate-500">Set the delivery status to complete the record</p>
              </div>
            </div>
            <span className="min-w-8 text-right text-sm font-semibold tabular-nums text-slate-800">{unstatusedDCs.length}</span>
            <button
              onClick={() => unstatusedDCs[0] ? editDC(unstatusedDCs[0]) : setActiveTab('deliveries')}
              className="hidden items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 sm:inline-flex"
            >
              {unstatusedDCs.length ? 'Review first' : 'View deliveries'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section aria-labelledby="priority-requisitions" className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="priority-requisitions" className="text-base font-semibold text-slate-900">Priority requisitions</h2>
              <p className="mt-0.5 text-sm text-slate-500">Open orders first, then most recent.</p>
            </div>
            <button onClick={() => setActiveTab('ledger')} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950">
              All PRs <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
            {prioritizedPRs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No requisitions recorded yet.</p>
            ) : (
              prioritizedPRs.slice(0, 5).map((pr, index) => {
                const remainingQty = pr.items.reduce((total, item) =>
                  item.status === 'Cancelled' ? total : total + Math.max(0, item.requestedQty - item.fulfilledQty), 0
                );
                const requestedQty = pr.items.filter(item => item.status !== 'Cancelled').length;
                const completeQty = pr.items.filter(item => item.status !== 'Cancelled' && item.fulfilledQty >= item.requestedQty).length;
                return (
                  <div key={pr.id} className={`flex items-center gap-3 px-4 py-3 ${index < Math.min(prioritizedPRs.length, 5) - 1 ? 'border-b border-slate-200' : ''}`}>
                    <button onClick={() => openPR(pr)} className="min-w-0 flex-1 text-left">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-slate-900">{pr.prNumber}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeColor(pr.status)}`}>{pr.status}</span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">{pr.siteName} <span className="px-1 text-slate-300">·</span> {pr.date}</span>
                    </button>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-xs font-medium tabular-nums text-slate-700">{completeQty}/{requestedQty} items</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{remainingQty} qty outstanding</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingPR(pr);
                        setIsPREditOpen(true);
                      }}
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Edit requisition ${pr.prNumber}`}
                      title="Edit requisition"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section aria-labelledby="recent-deliveries" className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="recent-deliveries" className="text-base font-semibold text-slate-900">Recent deliveries</h2>
              <p className="mt-0.5 text-sm text-slate-500">Latest delivery challans in the portal.</p>
            </div>
            <button onClick={() => setActiveTab('deliveries')} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950">
              All DCs <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
            {realDCs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No delivery challans recorded yet.</p>
            ) : (
              realDCs.slice(0, 5).map((dc, index) => (
                <div key={dc.id} className={`flex items-center gap-3 px-4 py-3 ${index < Math.min(realDCs.length, 5) - 1 ? 'border-b border-slate-200' : ''}`}>
                  <button onClick={() => setActiveTab('deliveries')} className="min-w-0 flex-1 text-left">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">{dc.dcNumber}</span>
                      <span className="text-xs text-slate-500">{dc.deliveryStatus || 'Status not set'}</span>
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{dc.siteName} <span className="px-1 text-slate-300">·</span> {dc.date}</span>
                  </button>
                  <span className="hidden shrink-0 text-xs text-slate-500 sm:inline">{dc.prNumber?.trim() || (dc.noPrRequired ? 'No PR required' : 'PR not linked')}</span>
                  <button
                    onClick={() => editDC(dc)}
                    className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Edit delivery challan ${dc.dcNumber}`}
                    title="Edit delivery challan"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {sites.length > 0 && (
        <section aria-labelledby="farm-locations">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="farm-locations" className="text-base font-semibold text-slate-900">Locations</h2>
              <p className="mt-0.5 text-sm text-slate-500">{sites.length} active locations</p>
            </div>
            <button onClick={() => setActiveTab('deliveries')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950">
              Browse deliveries <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sites.slice(0, 8).map(site => (
              <button
                key={site.id}
                onClick={() => {
                  setSearchQuery(site.name);
                  setActiveTab('deliveries');
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>{site.name}</span>
              </button>
            ))}
            {sites.length > 8 && (
            <button
              onClick={() => setActiveTab('deliveries')}
              className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700"
            >
              +{sites.length - 8} more
            </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
