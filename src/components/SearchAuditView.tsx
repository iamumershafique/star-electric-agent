import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getBrandBadgeColor } from '../lib/utils';
import { auditRecords } from '../lib/recordAudit';
import type { BrandCategory } from '../types';
import { 
  Search, 
  Calendar, 
  Building2, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Filter, 
  RotateCcw, 
  PackageCheck,
  ShieldCheck,
  FileCheck,
  Zap
} from 'lucide-react';

const BRAND_CATEGORIES: BrandCategory[] = [
  'Pakistan Cables',
  'Amer Cables',
  'Schneider Electric',
  'Terasaki',
  'Philips / Pak Lighting',
  'Conduit & Accessories',
  'Switches & Sockets',
  'General Electrical'
];

export const SearchAuditView: React.FC = () => {
  const { 
    prs, 
    dcs, 
    sites, 
    setSelectedPR, 
    setIsPRDetailOpen 
  } = useApp();
  const auditReport = useMemo(() => auditRecords(prs, dcs), [prs, dcs]);
  const highFindings = auditReport.findings.filter(finding => finding.severity === 'High').length;
  const mediumFindings = auditReport.findings.filter(finding => finding.severity === 'Medium').length;
  const lowFindings = auditReport.findings.filter(finding => finding.severity === 'Low').length;

  // Search & Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itemQuery, setItemQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [prNumberQuery, setPrNumberQuery] = useState('');
  const [dcNumberQuery, setDcNumberQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Material Delivery Verification Tool state
  const [verifyItemQuery, setVerifyItemQuery] = useState('');
  const [verifyPrQuery, setVerifyPrQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'FOUND_DELIVERED' | 'FOUND_PENDING' | 'NOT_FOUND';
    details?: string;
    dcNumber?: string;
    date?: string;
    transportInfo?: string;
    remainingQty?: number;
    totalRequested?: number;
  } | null>(null);

  // Clear all filters
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setItemQuery('');
    setBrandFilter('ALL');
    setPrNumberQuery('');
    setDcNumberQuery('');
    setSiteFilter('ALL');
    setStatusFilter('ALL');
  };

  // Filtered Fulfillment Logs (Deliveries Timeline)
  const filteredFulfillmentLogs = useMemo(() => {
    const allLogs: {
      id: string;
      dcNumber: string;
      invoiceNumber: string;
      prNumber: string;
      prId: string;
      siteName: string;
      itemId: string;
      itemName: string;
      brand?: string;
      quantityShipped: number;
      date: string;
      transportType?: string;
      addaName?: string;
      biltyNumber?: string;
      freightCharges?: number;
      isFreightFree?: boolean;
      driverName?: string;
      vehicleNo?: string;
      notes?: string;
    }[] = [];

    prs.forEach(pr => {
      if (pr.fulfillmentLogs) {
        pr.fulfillmentLogs.forEach(log => {
          const matchedItem = pr.items.find(i => i.id === log.itemId || i.name === log.itemName);
          allLogs.push({
            ...log,
            prId: pr.id,
            siteName: pr.siteName,
            brand: matchedItem?.brand
          });
        });
      }
    });

    return allLogs.filter(log => {
      // Date range filter
      if (startDate && log.date < startDate) return false;
      if (endDate && log.date > endDate) return false;

      // Item query filter
      if (itemQuery.trim()) {
        const query = itemQuery.toLowerCase().trim();
        if (!log.itemName.toLowerCase().includes(query)) return false;
      }

      // Brand filter
      if (brandFilter !== 'ALL' && log.brand !== brandFilter) return false;

      // PR Number filter
      if (prNumberQuery.trim()) {
        const query = prNumberQuery.toLowerCase().trim();
        if (!log.prNumber.toLowerCase().includes(query)) return false;
      }

      // DC Number filter
      if (dcNumberQuery.trim()) {
        const query = dcNumberQuery.toLowerCase().trim();
        if (!log.dcNumber.toLowerCase().includes(query) && !log.invoiceNumber.toLowerCase().includes(query)) return false;
      }

      // Site Location filter
      if (siteFilter !== 'ALL') {
        if (!log.siteName.toLowerCase().includes(siteFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [prs, startDate, endDate, itemQuery, brandFilter, prNumberQuery, dcNumberQuery, siteFilter]);

  // Filtered PRs list based on current filters
  const filteredPRs = useMemo(() => {
    return prs.filter(pr => {
      if (startDate && pr.date < startDate) return false;
      if (endDate && pr.date > endDate) return false;

      if (prNumberQuery.trim() && !pr.prNumber.toLowerCase().includes(prNumberQuery.toLowerCase().trim())) {
        return false;
      }

      if (siteFilter !== 'ALL' && !pr.siteName.toLowerCase().includes(siteFilter.toLowerCase())) {
        return false;
      }

      if (statusFilter !== 'ALL' && pr.status !== statusFilter) {
        return false;
      }

      if (brandFilter !== 'ALL') {
        const hasBrand = pr.items.some(i => i.brand === brandFilter);
        if (!hasBrand) return false;
      }

      if (itemQuery.trim()) {
        const q = itemQuery.toLowerCase().trim();
        const hasItem = pr.items.some(i => i.name.toLowerCase().includes(q));
        if (!hasItem) return false;
      }

      return true;
    });
  }, [prs, startDate, endDate, prNumberQuery, siteFilter, statusFilter, brandFilter, itemQuery]);

  // Matched DC Record for instant preview
  const matchedDC = useMemo(() => {
    if (!dcNumberQuery.trim()) return null;
    const q = dcNumberQuery.trim().toLowerCase();
    return dcs.find(d => d.dcNumber.toLowerCase().includes(q) || d.invoiceNumber.toLowerCase().includes(q)) || null;
  }, [dcs, dcNumberQuery]);

  // Run Material Delivery Verification Check
  const handleRunVerification = () => {
    if (!verifyItemQuery.trim() && !verifyPrQuery.trim()) {
      setVerificationResult(null);
      return;
    }

    const itemQ = verifyItemQuery.trim().toLowerCase();
    const prQ = verifyPrQuery.trim().toLowerCase();

    // Check PRs for matching item / PR Number
    for (const pr of prs) {
      if (prQ && !pr.prNumber.toLowerCase().includes(prQ)) continue;

      for (const item of pr.items) {
        if (itemQ && !item.name.toLowerCase().includes(itemQ)) continue;

        // Match found! Check fulfillment
        const fulfilled = item.fulfilledQty;
        const requested = item.requestedQty;
        const remaining = Math.max(0, requested - fulfilled);

        // Find relevant fulfillment log
        const log = pr.fulfillmentLogs?.find(l => l.itemId === item.id || l.itemName.toLowerCase().includes(item.name.toLowerCase()));

        if (fulfilled > 0 && log) {
          const transportStr = log.transportType === 'Adda / Goods Transport' || log.addaName
            ? `🚚 Adda: ${log.addaName || 'Goods Adda'} (Bilty #${log.biltyNumber || 'N/A'})`
            : `🚗 Driver: ${log.driverName || 'Star Electric'} (${log.vehicleNo || ''})`;

          setVerificationResult({
            status: 'FOUND_DELIVERED',
            details: `Item "${item.name}" under PR #${pr.prNumber} at ${pr.siteName}`,
            dcNumber: log.dcNumber,
            date: log.date,
            transportInfo: transportStr,
            remainingQty: remaining,
            totalRequested: requested
          });
          return;
        } else {
          setVerificationResult({
            status: 'FOUND_PENDING',
            details: `Item "${item.name}" under PR #${pr.prNumber} at ${pr.siteName}`,
            remainingQty: remaining,
            totalRequested: requested
          });
          return;
        }
      }
    }

    setVerificationResult({
      status: 'NOT_FOUND',
      details: `No recorded requisition found matching item "${verifyItemQuery}" or PR "${verifyPrQuery}".`
    });
  };

  return (
    <div className="space-y-5 w-full text-slate-900">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Search</h1>
          <p className="mt-1 text-sm text-slate-500">Filter dispatches by date, item, brand, PR, DC or location.</p>
        </div>
        <button
          onClick={handleResetFilters}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset filters
        </button>
      </div>

      <details className="bg-white border border-slate-300 rounded-xl overflow-hidden">
        <summary className="cursor-pointer list-none p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Record Integrity Audit
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Checked all {auditReport.requisitionCount} requisitions and {auditReport.deliveryCount} delivery challans.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-1">{highFindings} High</span>
            <span className="rounded-full bg-amber-100 text-amber-900 px-2.5 py-1">{mediumFindings} Medium</span>
            <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1">{lowFindings} Low</span>
            <span className="text-slate-500">{auditReport.findings.length ? 'View findings' : 'No findings'}</span>
          </div>
        </summary>
        <div className="border-t border-slate-300 p-4 sm:p-5 space-y-2">
          {auditReport.findings.length === 0 ? (
            <p className="text-sm font-semibold text-emerald-800">No data integrity issues were found.</p>
          ) : (
            <>
              <p className="text-xs text-slate-600">
                Findings are read-only. Resolve them from the corresponding requisition or delivery record.
                {auditReport.findings.length > 100 && ` Showing the first 100 of ${auditReport.findings.length}.`}
              </p>
              <ul className="max-h-96 overflow-y-auto divide-y divide-slate-200">
                {auditReport.findings.slice(0, 100).map(finding => (
                  <li key={finding.id} className="py-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs">
                    <span className={`shrink-0 font-semibold ${
                      finding.severity === 'High' ? 'text-rose-700' :
                      finding.severity === 'Medium' ? 'text-amber-800' : 'text-slate-600'
                    }`}>
                      {finding.severity} · {finding.recordType} {finding.recordNumber}
                    </span>
                    <span className="text-slate-700 break-words">{finding.message}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </details>

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-amber-600" />
            Multi-Dimensional Audit Filter Controls
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Showing {filteredFulfillmentLogs.length} Dispatch Logs • {filteredPRs.length} PR Requisitions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Start Date */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-slate-500" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Item Name Keyword */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Search className="w-3 h-3 text-slate-500" /> Item / Product Keyword
            </label>
            <input
              type="text"
              value={itemQuery}
              onChange={(e) => setItemQuery(e.target.value)}
              placeholder="e.g. 50mm Cable, Breaker"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">
              Brand Category
            </label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Brands</option>
              {BRAND_CATEGORIES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* PR Number */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">
              PR Number Filter
            </label>
            <input
              type="text"
              value={prNumberQuery}
              onChange={(e) => setPrNumberQuery(e.target.value)}
              placeholder="e.g. PR-JAD-2026-614"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* DC Number */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">
              DC / Invoice # Filter
            </label>
            <input
              type="text"
              value={dcNumberQuery}
              onChange={(e) => setDcNumberQuery(e.target.value)}
              placeholder="e.g. DC-612"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-600" /> Jadeed Group Farm Location / Site
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Farm Locations ({sites.length} Sites)</option>
              {sites.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">
              Fulfillment Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-500"
            >
              <option value="ALL">All Statuses (Pending, In-Progress, Fulfilled)</option>
              <option value="Pending">🔴 Pending (Not Delivered)</option>
              <option value="In-Progress">⏳ In-Progress (Partially Delivered)</option>
              <option value="Fulfilled">🟢 Fulfilled (100% Completed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matched DC Instant Card Inspector (if DC # query typed) */}
      {matchedDC && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <h3 className="text-xs font-semibold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              Matched Delivery Challan Inspector: {matchedDC.dcNumber}
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-800">
              Invoice #{matchedDC.invoiceNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-800 font-medium">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Target PR Number</span>
              <p className="font-mono font-bold text-blue-900 mt-0.5">#{matchedDC.prNumber}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Target Farm Location</span>
              <p className="font-bold text-slate-900 mt-0.5">{matchedDC.siteName}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Dispatch Date</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{matchedDC.date}</p>
            </div>
          </div>

          {(matchedDC.transportType || matchedDC.addaName || matchedDC.biltyNumber || matchedDC.driverName) && (
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs flex flex-wrap items-center gap-2 font-bold">
              {matchedDC.transportType === 'Adda / Goods Transport' || matchedDC.addaName ? (
                <span className="text-amber-900">
                  🚚 Adda: {matchedDC.addaName || 'Goods Adda'} | Bilty #{matchedDC.biltyNumber || 'N/A'} | Freight: {matchedDC.isFreightFree || matchedDC.freightCharges === 0 ? 'FREE / مفت' : `PKR ${matchedDC.freightCharges}`}
                </span>
              ) : (
                <span className="text-blue-900">
                  🚗 Driver: {matchedDC.driverName || 'N/A'} | Vehicle: {matchedDC.vehicleNumber || 'N/A'}
                </span>
              )}
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Items Dispatched under this DC:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {matchedDC.itemsShipped.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white border border-slate-300 text-xs flex justify-between items-center">
                  <span className="font-bold text-slate-900">{item.itemName}</span>
                  <span className="font-mono font-semibold text-emerald-800">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Material Delivery Verification Tool */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            Material Delivery Verification & Status Checker (میٹریل ڈلیوری چیکر)
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Verify if a material item has been dispatched or remains pending</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">Product / Material Name</label>
            <input
              type="text"
              value={verifyItemQuery}
              onChange={(e) => setVerifyItemQuery(e.target.value)}
              placeholder="e.g. 50mm Cu Cable"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 block">PR Number (Optional)</label>
            <input
              type="text"
              value={verifyPrQuery}
              onChange={(e) => setVerifyPrQuery(e.target.value)}
              placeholder="e.g. PR-JAD-2026-614"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunVerification}
              className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Search className="w-4 h-4" /> Verify Material Delivery Status
            </button>
          </div>
        </div>

        {verificationResult && (
          <div className={`p-4 rounded-xl border text-xs font-bold space-y-1.5 ${
            verificationResult.status === 'FOUND_DELIVERED'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : verificationResult.status === 'FOUND_PENDING'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {verificationResult.status === 'FOUND_DELIVERED' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>✅ STATUS: DISPATCHED & DELIVERED (DC #{verificationResult.dcNumber})</span>
                </>
              ) : verificationResult.status === 'FOUND_PENDING' ? (
                <>
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>⏳ STATUS: PENDING / NOT DELIVERED YET</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5 text-rose-600" />
                  <span>⚠️ NOT FOUND IN REQUISITIONS</span>
                </>
              )}
            </div>

            <p className="text-slate-800 font-semibold">{verificationResult.details}</p>

            {verificationResult.status === 'FOUND_DELIVERED' && (
              <div className="pt-1 text-slate-700 space-y-1">
                <p>Dispatch Date: <span className="font-mono font-bold text-slate-900">{verificationResult.date}</span></p>
                <p>Evidence: <span className="font-bold text-amber-900">{verificationResult.transportInfo}</span></p>
                {verificationResult.remainingQty! > 0 && (
                  <p className="text-amber-800 font-bold">
                    Note: Partial delivery shipped. Remaining pending: {verificationResult.remainingQty} units (out of {verificationResult.totalRequested}).
                  </p>
                )}
              </div>
            )}

            {verificationResult.status === 'FOUND_PENDING' && (
              <p className="text-amber-900 font-bold">
                Remaining quantity to be shipped: {verificationResult.remainingQty} units (out of {verificationResult.totalRequested}).
              </p>
            )}
          </div>
        )}
      </div>

      {/* Item Supply Traceability Report Table */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Item Supply Traceability & Dispatch Timeline ({filteredFulfillmentLogs.length})
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Historical log of all line items shipped across Jadeed Group farm locations</p>
          </div>
        </div>

        {filteredFulfillmentLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-300 rounded-xl text-slate-500 text-xs font-semibold">
            No dispatch logs found matching the selected filter criteria.
          </div>
        ) : (
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Dispatch Date</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Brand Tag</th>
                  <th className="p-3">Target Farm Location</th>
                  <th className="p-3 text-center">PR #</th>
                  <th className="p-3 text-center">DC #</th>
                  <th className="p-3 text-center">Qty Shipped</th>
                  <th className="p-3">Transport / Bilty / Driver Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 bg-white">
                {filteredFulfillmentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 shrink-0">
                      {log.date}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{log.itemName}</p>
                    </td>
                    <td className="p-3">
                      {log.brand && (
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getBrandBadgeColor(log.brand as BrandCategory)}`}>
                          {log.brand}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {log.siteName}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          const prMatch = prs.find(p => p.id === log.prId || p.prNumber === log.prNumber);
                          if (prMatch) {
                            setSelectedPR(prMatch);
                            setIsPRDetailOpen(true);
                          }
                        }}
                        className="font-mono font-bold text-blue-700 hover:underline"
                      >
                        #{log.prNumber}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
                        {log.dcNumber}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-emerald-700">
                      {log.quantityShipped}
                    </td>
                    <td className="p-3">
                      {log.transportType === 'Adda / Goods Transport' || log.addaName ? (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                          🚚 {log.addaName || 'Goods Adda'} | Bilty #{log.biltyNumber || 'N/A'} | Freight: {log.isFreightFree || log.freightCharges === 0 ? 'FREE / مفت' : `PKR ${log.freightCharges}`}
                        </span>
                      ) : log.driverName || log.vehicleNo ? (
                        <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                          🚗 Driver: {log.driverName || 'N/A'} | Vehicle: {log.vehicleNo || 'N/A'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">Standard Dispatch</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
