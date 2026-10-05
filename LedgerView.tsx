import React from 'react';
import { useApp } from '../context/AppContext';
import { getStatusBadgeColor, calculatePRTotals } from '../lib/utils';
import { siteGroupKey } from '../lib/siteMaster';
import { 
  Search, 
  Filter, 
  Building2, 
  Truck, 
  Eye, 
  Trash2, 
  Plus,
  FileSpreadsheet,
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
    const matchesSite = selectedSiteFilter === 'ALL' || siteGroupKey(pr.siteName) === selectedSiteFilter;

    return matchesSearch && matchesStatus && matchesSite;
  });

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#1e195b]" />
              Master Requisition Ledger
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Showing {filteredPRs.length} of {prs.length} Purchase Requisitions for Jadeed Group
            </p>
          </div>

          <button
            onClick={() => setIsPRUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#fd2729] hover:bg-[#e0191b] text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New PR
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PR #, Farm site, item..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled (Cannot Provide)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Farm Locations</option>
              {sites.map(s => (
                <option key={s.id} value={s.region}>{s.name}</option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedStatusFilter !== 'ALL' || selectedSiteFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatusFilter('ALL');
                setSelectedSiteFilter('ALL');
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">PR Tracking ID</th>
                <th className="p-4">Requisition Date</th>
                <th className="p-4">Jadeed Farm Site</th>
                <th className="p-4">Items & Brands</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-center">Total Items</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredPRs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    No Purchase Requisitions match your active search criteria.
                  </td>
                </tr>
              ) : (
                filteredPRs.map(pr => {
                  const totals = calculatePRTotals(pr);

                  return (
                    <tr key={pr.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <span 
                          onClick={() => {
                            setSelectedPR(pr);
                            setIsPRDetailOpen(true);
                          }}
                          className="font-bold text-slate-900 group-hover:text-amber-700 cursor-pointer font-mono"
                        >
                          {pr.prNumber}
                        </span>
                      </td>

                      <td className="p-4 text-slate-700 font-mono font-semibold">
                        {pr.date}
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            {pr.siteName}
                          </p>
                          {pr.contactPerson && (
                            <p className="text-[10px] text-slate-500">{pr.contactPerson}</p>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 max-w-xs">
                          <div className="text-slate-900 font-bold truncate">
                            {pr.items.map(i => i.name).join(', ')}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {Array.from(new Set(pr.items.map(i => i.brand))).map(b => (
                              <span key={b} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-300">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-block ${getStatusBadgeColor(pr.status)}`}>
                            {pr.status}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${totals.percentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-600 font-mono font-bold">
                              {totals.completedItemsCount}/{totals.totalItemsCount}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-slate-900">
                        {totals.totalItemsCount} Items
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedPR(pr);
                              setIsPRDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Inspect PR Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingPR(pr);
                              setIsPREditOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
                            title="Edit PR & Items"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setTargetDC_PR(pr);
                              setIsDCUploadOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors"
                            title="Issue DC & Invoice"
                          >
                            <Truck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete PR ${pr.prNumber}?`)) {
                                deletePR(pr.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors"
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
