import React from 'react';
import { useApp } from '../context/AppContext';
import { getStatusBadgeColor, calculatePRTotals } from '../lib/utils';
import { 
  Search, 
  Truck, 
  Eye, 
  Trash2, 
  Plus,
  Edit3
} from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { 
    prs, 
    searchQuery, 
    setSearchQuery, 
    selectedStatusFilter, 
    setSelectedStatusFilter,
    selectedSiteFilter,
    setSelectedSiteFilter,
    sites,
    setSelectedPR,
    setIsPRDetailOpen,
    setTargetDC_PR,
    setIsDCUploadOpen,
    setIsPRUploadOpen,
    deletePR,
    setEditingPR,
    setIsPREditOpen
  } = useApp();

  const filteredPRs = prs.filter(pr => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      (pr.prNumber || '').toLowerCase().includes(q) ||
      (pr.siteName || '').toLowerCase().includes(q) ||
      (pr.items || []).some(i => (i.name || '').toLowerCase().includes(q) || (i.brand || '').toLowerCase().includes(q))
    );
    const matchesStatus = selectedStatusFilter === 'ALL' || pr.status === selectedStatusFilter;
    const matchesSite = selectedSiteFilter === 'ALL' || (pr.siteName || '').toLowerCase().includes(selectedSiteFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSite;
  });

  return (
    <div className="space-y-6 text-slate-900">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Requisitions</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredPRs.length} of {prs.length} purchase requisitions</p>
        </div>
        <button
          onClick={() => setIsPRUploadOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New PR
        </button>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PR number, site or item"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In-Progress">In progress</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={selectedSiteFilter}
          onChange={(e) => setSelectedSiteFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
        >
          <option value="ALL">All locations</option>
          {sites.map(s => (
            <option key={s.id} value={s.region}>{s.name}</option>
          ))}
        </select>
        {(searchQuery || selectedStatusFilter !== 'ALL' || selectedSiteFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatusFilter('ALL');
              setSelectedSiteFilter('ALL');
            }}
            className="cursor-pointer px-2 py-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">PR</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPRs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No requisitions match your filters.
                  </td>
                </tr>
              ) : (
                filteredPRs.map(pr => {
                  const totals = calculatePRTotals(pr);

                  return (
                    <tr key={pr.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedPR(pr);
                            setIsPRDetailOpen(true);
                          }}
                          className="cursor-pointer font-mono text-sm font-semibold text-slate-900 hover:underline"
                        >
                          {pr.prNumber}
                        </button>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{pr.date}</td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{pr.siteName}</p>
                        {pr.contactPerson && <p className="text-xs text-slate-500">{pr.contactPerson}</p>}
                      </td>

                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate text-slate-800">{pr.items.map(i => i.name).join(', ')}</p>
                        <p className="truncate text-xs text-slate-500">
                          {totals.totalItemsCount} items · {Array.from(new Set(pr.items.map(i => i.brand))).filter(Boolean).join(', ')}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(pr.status)}`}>
                            {pr.status}
                          </span>
                          <div className="hidden items-center gap-2 lg:flex">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-slate-700" style={{ width: `${totals.percentage}%` }} />
                            </div>
                            <span className="text-xs tabular-nums text-slate-500">{totals.completedItemsCount}/{totals.totalItemsCount}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => {
                              setSelectedPR(pr);
                              setIsPRDetailOpen(true);
                            }}
                            className="cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingPR(pr);
                              setIsPREditOpen(true);
                            }}
                            className="cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setTargetDC_PR(pr);
                              setIsDCUploadOpen(true);
                            }}
                            className="cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            title="Record delivery"
                          >
                            <Truck className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete PR ${pr.prNumber}?`)) {
                                deletePR(pr.id);
                              }
                            }}
                            className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
