import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { DCRecord } from '../types';
import { fileToBase64 } from '../lib/gemini';
import { getImageFromMemorySync } from '../lib/imageStorage';
import { 
  Truck, 
  Building2, 
  Calendar, 
  Plus, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Package, 
  Eye, 
  CheckCircle2,
  Search, 
  Filter, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen, 
  FileText,
  UploadCloud,
  AlertTriangle,
  Sparkles,
  X,
  Loader2,
  Image as ImageIcon,
  ArrowDownUp,
  ListChecks
} from 'lucide-react';
const JADEED_DRIVE_LINKS: { masterFolder: string; builtyFolder: string; dcScanFolders: Record<string, string> } = { masterFolder: '', builtyFolder: '', dcScanFolders: {} };

const hasBuiltyEvidence = (dc: DCRecord) => !!(dc.isBuiltyAttached || dc.biltyNumber?.trim() || dc.builtyImage);
const isMissingPhysicalPage = (dc: DCRecord) => (dc.dcNumber || '').toLowerCase().includes('missing');

export const DeliveriesView: React.FC = () => {
  const { 
    dcs, 
    setIsDCUploadOpen, 
    setSelectedPR, 
    setIsPRDetailOpen, 
    prs, 
    sites,
    deleteDC, 
    setEditingDC, 
    setIsDCEditOpen,
    setIsBuiltyUploadOpen,
    setTargetBuiltyDC,
    setSelectedBuiltyPreview,
    markAllDCsDelivered,
    isDCPRMissing,
    autoLinkDeliveredPRsAndDCs,
    linkDCToManualPR,
    markDCNoPRRequired,
    markAllMissingPRsNoRequired,
    attachPRImageToDC
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'MISSING_PR' | 'PR_LINKED' | 'BUILTY' | 'DELIVERED' | 'DISPATCHED'>('ALL');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isMissingPRMenuOpen, setIsMissingPRMenuOpen] = useState(false);

  // Sorting state: Defaults to DESC (e.g. DC 700 / 686 on top down to DC 001 on the last page)
  const [sortBy, setSortBy] = useState<'dc' | 'date' | 'site' | 'pr'>('dc');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal states for Missing PR resolution
  const [manualPRModalDC, setManualPRModalDC] = useState<DCRecord | null>(null);
  const [manualPRInput, setManualPRInput] = useState('');
  const [manualPRNotes, setManualPRNotes] = useState('');

  const [uploadPRModalDC, setUploadPRModalDC] = useState<DCRecord | null>(null);
  const [uploadPRFile, setUploadPRFile] = useState<File | null>(null);
  const [uploadPRPreview, setUploadPRPreview] = useState<string | null>(null);
  const [uploadPRNumber, setUploadPRNumber] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const missingPRCount = useMemo(() => dcs.filter(d => isDCPRMissing(d)).length, [dcs, isDCPRMissing]);
  const missingPRDCs = useMemo(() => dcs.filter(d => isDCPRMissing(d)), [dcs, isDCPRMissing]);
  const prLinkedCount = useMemo(() => dcs.length - missingPRCount, [dcs, missingPRCount]);
  const builtyAttachedCount = dcs.filter(hasBuiltyEvidence).length;
  const directDeliveredCount = dcs.filter(d => d.deliveryStatus === 'Delivered' && !isMissingPhysicalPage(d)).length;
  const dispatchedCount = dcs.filter(d => d.deliveryStatus === 'Dispatched' && !isMissingPhysicalPage(d)).length;

  // Filtered & Sorted DCs
  const filteredDCs = useMemo(() => {
    const list = dcs.filter(dc => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (dc.dcNumber || '').toLowerCase().includes(q) ||
        (dc.invoiceNumber || '').toLowerCase().includes(q) ||
        (dc.siteName || '').toLowerCase().includes(q) ||
        (dc.biltyNumber && dc.biltyNumber.toLowerCase().includes(q)) ||
        (dc.addaName && dc.addaName.toLowerCase().includes(q)) ||
        (dc.remarks && dc.remarks.toLowerCase().includes(q)) ||
        (dc.prNumber && dc.prNumber.toLowerCase().includes(q))
      );

      let matchesStatus = true;
      const hasBuilty = hasBuiltyEvidence(dc);
      const isMissing = isDCPRMissing(dc);

      if (selectedStatusFilter === 'MISSING_PR') matchesStatus = isMissing;
      else if (selectedStatusFilter === 'PR_LINKED') matchesStatus = !isMissing;
      else if (selectedStatusFilter === 'BUILTY') matchesStatus = hasBuilty;
      else if (selectedStatusFilter === 'DELIVERED') matchesStatus = dc.deliveryStatus === 'Delivered' && !isMissingPhysicalPage(dc);
      else if (selectedStatusFilter === 'DISPATCHED') matchesStatus = dc.deliveryStatus === 'Dispatched' && !isMissingPhysicalPage(dc);

      const matchesSite = selectedSiteFilter === 'ALL' || (dc.siteName || '').toLowerCase() === selectedSiteFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesSite;
    });

    return list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'dc') {
        const numA = parseInt((a.dcNumber.match(/\d+/) || ['0'])[0], 10);
        const numB = parseInt((b.dcNumber.match(/\d+/) || ['0'])[0], 10);
        cmp = numA !== numB ? numA - numB : a.dcNumber.localeCompare(b.dcNumber);
      } else if (sortBy === 'date') {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        cmp = timeA - timeB;
      } else if (sortBy === 'site') {
        cmp = (a.siteName || '').localeCompare(b.siteName || '');
      } else if (sortBy === 'pr') {
        const numA = parseInt(((a.prNumber || '').match(/\d+/) || ['0'])[0], 10);
        const numB = parseInt(((b.prNumber || '').match(/\d+/) || ['0'])[0], 10);
        cmp = numA !== numB ? numA - numB : (a.prNumber || '').localeCompare(b.prNumber || '');
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });
  }, [dcs, searchQuery, selectedStatusFilter, selectedSiteFilter, sortBy, sortOrder, isDCPRMissing]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDCs.length / pageSize) || 1;
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedDCs = useMemo(() => {
    const startIndex = (clampedPage - 1) * pageSize;
    return filteredDCs.slice(startIndex, startIndex + pageSize);
  }, [filteredDCs, clampedPage, pageSize]);

  // Handle Manual PR submission
  const handleSaveManualPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPRModalDC) return;
    const cleanNum = manualPRInput.trim();
    if (!cleanNum) {
      alert('Please enter a valid PR Number (e.g. PR-151 or PR-204).');
      return;
    }

    const result = linkDCToManualPR(manualPRModalDC.id, cleanNum, manualPRNotes);
    if (!result.success) {
      alert(result.error || `PR ${cleanNum} could not be linked.`);
      return;
    }
    setActionToast(`✓ DC ${manualPRModalDC.dcNumber} linked to existing PR #${cleanNum}. Item fulfillment was not changed.`);
    setManualPRModalDC(null);
    setManualPRInput('');
    setManualPRNotes('');
    setTimeout(() => setActionToast(null), 4000);
  };

  // Handle PR Image selection
  const handlePRFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadPRFile(file);
    try {
      const base64 = await fileToBase64(file);
      setUploadPRPreview(base64);
    } catch (err) {
      console.error('Failed to read image file', err);
    }
  };

  // Handle PR Image upload submission
  const handleSaveUploadedPRImage = async () => {
    if (!uploadPRModalDC || !uploadPRPreview) {
      alert('Please select or drag a PR document image first.');
      return;
    }

    setIsProcessingUpload(true);
    try {
      attachPRImageToDC(uploadPRModalDC.id, uploadPRPreview, uploadPRNumber);
      setActionToast(`✓ Attached PR document image to DC ${uploadPRModalDC.dcNumber} and marked Delivered!`);
      setUploadPRModalDC(null);
      setUploadPRFile(null);
      setUploadPRPreview(null);
      setUploadPRNumber('');
      setTimeout(() => setActionToast(null), 4000);
    } catch (err) {
      console.error('Failed to attach PR image', err);
      alert('Could not attach PR image. Please try again.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const openManualPRModal = (dc: DCRecord) => {
    setManualPRModalDC(dc);
    setManualPRInput('');
    setManualPRNotes('');
    setIsMissingPRMenuOpen(false);
  };

  const openUploadPRModal = (dc: DCRecord) => {
    setUploadPRModalDC(dc);
    setUploadPRFile(null);
    setUploadPRPreview(null);
    setUploadPRNumber(`PR-${dc.dcNumber.replace(/^DC-?/i, '')}`);
    setIsMissingPRMenuOpen(false);
  };

  return (
    <div className="space-y-5 w-full text-slate-900">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[11px] border border-emerald-300">
              {dcs.length} Deliveries Loaded (DC# 0001 → 600+)
            </span>
            {missingPRCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-[11px] border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {missingPRCount} Missing PRs
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px] border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                100% PRs Reconciled
              </span>
            )}
            <span className="text-xs text-slate-500 font-bold">• Master Ledger Google Drive</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            Delivery Challans &amp; Invoices Log
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Strict 1:1 Unified DC Number = Invoice Number • Reconciled Star Electric ↔ Jadeed Group
          </p>
          <p className="text-[11px] text-slate-600 font-medium mt-1">
            Builty upload is optional and does not determine a DC&apos;s delivery status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Auto-link button */}
          <button
            onClick={() => {
              const res = autoLinkDeliveredPRsAndDCs();
              setActionToast(`⚡ Reconciliation complete: Auto-linked ${res.linkedCount} deliveries and PRs!`);
              setTimeout(() => setActionToast(null), 5000);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Auto-link all delivered material PRs with DCs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Auto-Link PRs &amp; DCs
          </button>

          {/* Batch resolve missing PRs */}
          {missingPRCount > 0 && (
            <button
              onClick={() => setIsMissingPRMenuOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open the separate menu to resolve delivery challans missing a PR"
            >
              <ListChecks className="w-4 h-4 text-amber-600" />
              Resolve Missing PRs ({missingPRCount})
            </button>
          )}

          {/* Mark All Delivered */}
          <button
            onClick={async () => {
              const eligibleCount = dcs.filter(dc => !(dc.dcNumber || '').toLowerCase().includes('missing')).length;
              if (!window.confirm(`Mark all ${eligibleCount} eligible DCs as Delivered? This may change existing delivery statuses.`)) return;
              const res = await markAllDCsDelivered();
              setActionToast(
                `✓ ${res.deliveredCount} DCs marked Delivered; builty attachments do not affect delivery status.` +
                (res.skippedCount ? ` ${res.skippedCount} missing-page records were left unchanged.` : '') +
                (res.cloudFailures ? ` Cloud sync failed for ${res.cloudFailures} records; see console.` : '')
              );
              setTimeout(() => setActionToast(null), 4000);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All DCs Delivered
          </button>

          {/* Scan Builty */}
          <button
            onClick={() => {
              setTargetBuiltyDC(null);
              setIsBuiltyUploadOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#1e195b] hover:bg-[#282070] text-white font-extrabold text-xs shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-red-300" /> 
            Scan Builty
          </button>

          {/* Issue DC */}
          <button
            onClick={() => setIsDCUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#fd2729] hover:bg-[#e0191b] text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Issue DC
          </button>
        </div>
      </div>

      {/* Action Toast Alert */}
      {actionToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {isMissingPRMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="missing-pr-menu-title"
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90dvh] flex flex-col shadow-2xl text-slate-900"
          >
            <header className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-200">
              <div className="min-w-0">
                <h3 id="missing-pr-menu-title" className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-amber-600 shrink-0" />
                  Resolve Missing PRs
                  <span className="text-xs rounded-full bg-amber-100 text-amber-900 px-2 py-0.5">{missingPRDCs.length}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Choose an action for each delivery challan. Resolved entries leave this list.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMissingPRMenuOpen(false)}
                aria-label="Close missing PR menu"
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="overflow-y-auto p-3 sm:p-4 space-y-2">
              {missingPRDCs.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-emerald-800">
                  All delivery challans have a PR link or are marked No PR Required.
                </div>
              ) : missingPRDCs.map(dc => (
                <div key={dc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{dc.dcNumber} <span className="text-slate-400 font-normal">· {dc.date}</span></p>
                    <p className="text-xs text-slate-600 truncate">{dc.siteName}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openManualPRModal(dc)}
                      className="px-2.5 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Add PR
                    </button>
                    <button
                      type="button"
                      onClick={() => openUploadPRModal(dc)}
                      className="px-2.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> Upload PR
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        markDCNoPRRequired(dc.id);
                        setActionToast(`✓ ${dc.dcNumber} marked Delivered (No PR Required).`);
                        setTimeout(() => setActionToast(null), 4000);
                      }}
                      className="px-2.5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> No PR Required
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {missingPRDCs.length > 0 && (
              <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                <p className="text-[11px] text-slate-500">Bulk option sets every currently listed challan to “No PR Required.”</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm(`Mark all ${missingPRDCs.length} Delivery Challans with missing PRs as "Delivered - No PR Required"?`)) return;
                    const res = markAllMissingPRsNoRequired();
                    setActionToast(`✓ Marked ${res.count} Delivery Challans as Delivered (No PR Required).`);
                    setIsMissingPRMenuOpen(false);
                    setTimeout(() => setActionToast(null), 5000);
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 hover:bg-amber-100 text-xs font-bold"
                >
                  Mark all as No PR Required
                </button>
              </footer>
            )}
          </section>
        </div>
      )}

      {/* Google Drive Master Cloud Folder Bar */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-blue-950">
              Google Drive Cloud Storage (Star Electric Data)
            </p>
            <p className="text-[11px] text-blue-800 font-medium">
              Synchronized with master ledger (DC# 600), Builty Scans, and DC Scans (001-600) archives
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-semibold text-[11px]">
          <a
            href={JADEED_DRIVE_LINKS.masterFolder}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-900 hover:bg-blue-100 flex items-center gap-1 font-bold transition-all shadow-2xs"
          >
            Master Drive <ExternalLink className="w-3 h-3 text-blue-600" />
          </a>
          <a
            href={JADEED_DRIVE_LINKS.builtyFolder}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-1 font-bold transition-all shadow-2xs"
          >
            Builty Scans <ExternalLink className="w-3 h-3 text-amber-600" />
          </a>
          <span className="text-slate-400 font-bold px-1">|</span>
          <span className="text-slate-500 text-[10px] font-bold">DC Scan Folders:</span>
          {Object.entries(JADEED_DRIVE_LINKS.dcScanFolders).map(([range, url]) => (
            <a
              key={range}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-[10px] font-mono font-bold transition-colors"
            >
              {range} <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          ))}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search DC#, Invoice#, Site, PR#, Builty#..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
            <button
              onClick={() => { setSelectedStatusFilter('ALL'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${selectedStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({dcs.length})
            </button>
            <button
              onClick={() => { setSelectedStatusFilter('MISSING_PR'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${selectedStatusFilter === 'MISSING_PR' ? 'bg-amber-500 text-slate-950 shadow-xs font-black' : 'text-amber-800 hover:text-amber-950'}`}
              title="Deliveries missing associated Purchase Requisition (PR)"
            >
              ⚠️ Missing PR ({missingPRCount})
            </button>
            <button
              onClick={() => { setSelectedStatusFilter('PR_LINKED'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${selectedStatusFilter === 'PR_LINKED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Deliveries with linked PR or No PR Required"
            >
              ✓ PR Resolved ({prLinkedCount})
            </button>
            <button
              onClick={() => { setSelectedStatusFilter('BUILTY'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${selectedStatusFilter === 'BUILTY' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Builty ({builtyAttachedCount})
            </button>
            <button
              onClick={() => { setSelectedStatusFilter('DELIVERED'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${selectedStatusFilter === 'DELIVERED' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Direct ({directDeliveredCount})
            </button>
            <button
              onClick={() => { setSelectedStatusFilter('DISPATCHED'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${selectedStatusFilter === 'DISPATCHED' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Dispatched ({dispatchedCount})
            </button>
          </div>

          {/* Farm Site Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSiteFilter}
              onChange={(e) => {
                setSelectedSiteFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 truncate"
            >
              <option value="ALL">All Farm Sites ({sites.length})</option>
              {sites.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Page Size & Stats */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500 font-semibold truncate">
              Showing <span className="font-bold text-slate-800">{filteredDCs.length}</span> matching
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={600}>600 (All)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Interactive Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" /> Sort By:
            </span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => { setSortBy('dc'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${sortBy === 'dc' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
              >
                DC # (Challan)
              </button>
              <button
                onClick={() => { setSortBy('date'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${sortBy === 'date' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Date Wise
              </button>
              <button
                onClick={() => { setSortBy('site'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${sortBy === 'site' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Party / Site
              </button>
              <button
                onClick={() => { setSortBy('pr'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${sortBy === 'pr' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
              >
                PR Wise
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Order:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => { setSortOrder('desc'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${sortOrder === 'desc' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                title="Latest / Highest numbers on top (e.g. DC 700 / 686 -> DC 001)"
              >
                <span>DESC (Latest on Top)</span>
              </button>
              <button
                onClick={() => { setSortOrder('asc'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${sortOrder === 'asc' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                title="Oldest / Lowest numbers on top (e.g. DC 001 -> DC 700)"
              >
                <span>ASC (Oldest First)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DCs List Grid */}
      <div className="space-y-3">
        {filteredDCs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-xs font-semibold shadow-xs space-y-2">
            <p className="text-sm font-bold text-slate-700">No matching delivery challans found</p>
            <p className="text-slate-500">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          paginatedDCs.map(dc => {
            const isMissingPR = isDCPRMissing(dc);
            const hasNoPRReq = dc.noPrRequired || dc.prNumber === 'NO PR REQUIRED' || dc.prNumber === 'Delivered (No PR Required)';
            
            const linkedPR = prs.find(p => 
              p.id === dc.prId || 
              p.prNumber === dc.prNumber ||
              (dc.prNumber && (p.prNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === dc.prNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
            );

            const hasBuilty = hasBuiltyEvidence(dc);
            const isMissingPage = isMissingPhysicalPage(dc);

            return (
              <div
                key={dc.id}
                className={`bg-white border rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-all shadow-xs ${isMissingPR ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-extrabold font-mono text-xs ${isMissingPage ? 'bg-rose-50 text-rose-800 border-rose-200' : isMissingPR ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-emerald-100 border-emerald-300 text-emerald-800'}`}>
                      DC
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">{dc.dcNumber}</span>
                        {!isMissingPage && (
                          <>
                            <span className="text-slate-400 font-bold">=</span>
                            <span className="font-mono font-extrabold text-emerald-700 text-sm">{dc.invoiceNumber}</span>
                          </>
                        )}

                        {!isMissingPage && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border flex items-center gap-1 ${
                            dc.deliveryStatus === 'Dispatched'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {dc.deliveryStatus === 'Dispatched' ? <Package className="w-3 h-3 text-amber-700" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {dc.deliveryStatus || 'Delivered'}
                          </span>
                        )}

                        {/* PR Resolution Badges */}
                        {hasNoPRReq ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold border border-blue-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Delivered (No PR Required)
                          </span>
                        ) : linkedPR ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PR #{linkedPR.prNumber} (Linked)
                          </span>
                        ) : isMissingPR ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black border border-amber-300 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> PR Missing
                          </span>
                        ) : null}

                        {hasBuilty && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-300 flex items-center gap-1">
                            <Package className="w-3 h-3 text-amber-700" /> Builty #{dc.biltyNumber}
                          </span>
                        )}

                        {dc.noBuiltyRequired && !hasBuilty && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black border border-slate-300 flex items-center gap-1">
                            Builty Optional
                          </span>
                        )}

                        {isMissingPage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-300 flex items-center gap-1">
                            Voided / Missing Physical Page
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 font-semibold mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {dc.siteName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-600 flex items-center gap-1 font-mono font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dc.date}
                    </span>

                    {linkedPR && (
                      <button
                        onClick={() => {
                          setSelectedPR(linkedPR);
                          setIsPRDetailOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 text-xs font-bold border border-slate-300 flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        PR #{linkedPR.prNumber} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {/* Edit DC Button */}
                    <button
                      onClick={() => {
                        setEditingDC(dc);
                        setIsDCEditOpen(true);
                      }}
                      className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                      title="Edit Delivery Challan Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete DC Button */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete Delivery Challan ${dc.dcNumber}? This will restore shipped quantities back to PR.`)) {
                          deleteDC(dc.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors cursor-pointer"
                      title="Delete Delivery Challan Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Shipped Items */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Dispatched Items
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {dc.itemsShipped.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="pr-2 truncate">
                          <p className="font-bold text-slate-900 truncate">{item.itemName}</p>
                          <span className="text-[10px] text-slate-500 font-semibold">{item.brand}</span>
                        </div>
                        <span className="font-mono font-extrabold text-emerald-800 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 shrink-0">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Builty Footer Bar */}
                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 font-semibold">
                  <div className="flex flex-wrap items-center gap-2">
                    {hasBuilty ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-extrabold border border-amber-300 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-amber-700" />
                        Adda: {dc.addaName || 'Goods Transport'} | Bilty #{dc.biltyNumber} | Freight: {dc.isFreightFree || dc.freightCharges === 0 ? 'FREE / مفت' : `PKR ${dc.freightCharges || 'To Pay'}`}
                        {dc.freightStatus && (
                          <span className="text-[10px] font-mono px-1 rounded bg-amber-200 text-amber-900 uppercase">
                            ({dc.freightStatus})
                          </span>
                        )}
                      </span>
                    ) : dc.transportType === 'Pickup / Driver' && dc.driverName ? (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-extrabold border border-blue-300 flex items-center gap-1.5">
                        🚗 Driver: {dc.driverName} | Vehicle: {dc.vehicleNumber || 'N/A'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 font-extrabold border border-emerald-300 flex items-center gap-1.5">
                        ✅ Delivered to Farm / Site
                      </span>
                    )}

                    {dc.packagesCount && (
                      <span className="text-slate-600 text-xs font-medium">({dc.packagesCount})</span>
                    )}

                    {dc.remarks && (
                      <span className="text-slate-600 italic">"{dc.remarks}"</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Attached PR Scan if available */}
                    {(() => {
                      const prImg = dc.prDocumentImage || getImageFromMemorySync(`pr_${dc.prNumber}`) || getImageFromMemorySync(`pr_${dc.dcNumber}`);
                      if (!prImg) return null;
                      return (
                        <button
                          onClick={() => {
                            setSelectedBuiltyPreview({
                              url: prImg,
                              title: `PR Document Scan (${dc.prNumber || dc.dcNumber})`,
                              dcNumber: dc.dcNumber,
                              date: dc.date,
                              siteName: dc.siteName
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="View Attached PR Picture"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-700" />
                          <span>View PR Picture</span>
                        </button>
                      );
                    })()}

                    {/* View DC Scan if available */}
                    {(() => {
                      const dcImg = dc.documentImage || getImageFromMemorySync(`dc_${dc.dcNumber}`);
                      if (dcImg) {
                        return (
                          <button
                            onClick={() => {
                              setSelectedBuiltyPreview({
                                url: dcImg,
                                title: `Delivery Challan Scan (${dc.dcNumber})`,
                                dcNumber: dc.dcNumber,
                                date: dc.date,
                                siteName: dc.siteName
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Scanned Physical Delivery Challan"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-700" />
                            <span>View DC Scan</span>
                          </button>
                        );
                      }
                      return (
                        <span
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium flex items-center gap-1"
                          title="Physical scan not present in physical delivery book"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Scan Missing in Book</span>
                        </span>
                      );
                    })()}

                    {/* View Builty Picture Button if image exists */}
                    {dc.builtyImage && (
                      <button
                        onClick={() => {
                          setSelectedBuiltyPreview({
                            url: dc.builtyImage!,
                            title: `Builty #${dc.biltyNumber || 'Receipt'} (${dc.addaName || 'Goods Transport'})`,
                            dcNumber: dc.dcNumber,
                            biltyNumber: dc.biltyNumber,
                            addaName: dc.addaName,
                            date: dc.date,
                            siteName: dc.siteName
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View Goods Transport Builty Receipt Picture"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>View Builty Picture</span>
                      </button>
                    )}

                    {/* Edit Carrier Details */}
                    <button
                      onClick={() => {
                        setEditingDC(dc);
                        setIsDCEditOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Enter or update delivery carrier details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{hasBuilty ? 'Edit Carrier' : '+ Delivery Remarks'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 font-semibold">
            Page <span className="font-extrabold text-slate-900">{clampedPage}</span> of <span className="font-extrabold text-slate-900">{totalPages}</span> ({filteredDCs.length} total deliveries)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={clampedPage <= 1}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Direct Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = clampedPage - 2 + i;
                if (clampedPage <= 3) pageNum = i + 1;
                else if (clampedPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${pageNum === clampedPage ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={clampedPage >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MANUAL PR LINK DIALOG */}
      {manualPRModalDC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Add PR Number Manually
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Link {manualPRModalDC.dcNumber} to a Purchase Requisition
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManualPRModalDC(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPR} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between font-mono font-bold text-slate-800">
                  <span>Challan: {manualPRModalDC.dcNumber}</span>
                  <span>Date: {manualPRModalDC.date}</span>
                </div>
                <p className="text-slate-600 font-semibold">{manualPRModalDC.siteName}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Purchase Requisition (PR) Number:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={manualPRInput}
                  onChange={(e) => setManualPRInput(e.target.value)}
                  placeholder="e.g. PR-151, PR-58, PR-674, PR-204"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 bg-white"
                />
              </div>

              {/* Quick Suggestion Pills from Loaded PRs */}
              {prs.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Quick Pick from Existing PRs:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                    {prs.slice(0, 15).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setManualPRInput(p.prNumber)}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 text-slate-800 text-xs font-mono font-bold border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                      >
                        {p.prNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notes / Remarks (Optional):
                </label>
                <textarea
                  rows={2}
                  value={manualPRNotes}
                  onChange={(e) => setManualPRNotes(e.target.value)}
                  placeholder="e.g. Delivered per supervisor verbal confirmation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setManualPRModalDC(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Link PR &amp; Mark Delivered
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD PR IMAGE */}
      {uploadPRModalDC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-900 flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Upload PR Document Image
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Attach PR scan for {uploadPRModalDC.dcNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadPRModalDC(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between font-mono font-bold text-slate-800">
                  <span>Challan: {uploadPRModalDC.dcNumber}</span>
                  <span>Date: {uploadPRModalDC.date}</span>
                </div>
                <p className="text-slate-600 font-semibold">{uploadPRModalDC.siteName}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  PR Number for this document:
                </label>
                <input
                  type="text"
                  value={uploadPRNumber}
                  onChange={(e) => setUploadPRNumber(e.target.value)}
                  placeholder="e.g. PR-151, PR-674"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Upload Drop Zone */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.pdf"
                onChange={handlePRFileChange}
                className="hidden"
              />

              {!uploadPRPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-indigo-950">
                      Click to choose or drag PR photo here
                    </p>
                    <p className="text-[11px] text-indigo-700 font-medium">
                      Select CamScanner image from your JADEED PR folder
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-bold text-xs shadow-2xs">
                    Browse Files
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 max-h-48 flex items-center justify-center">
                    <img 
                      src={uploadPRPreview} 
                      alt="PR Preview" 
                      className="max-h-48 object-contain w-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadPRFile(null);
                        setUploadPRPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium text-center">
                    {uploadPRFile?.name} (Ready to attach &amp; mark delivered)
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadPRModalDC(null)}
                  disabled={isProcessingUpload}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!uploadPRPreview || isProcessingUpload}
                  onClick={handleSaveUploadedPRImage}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessingUpload ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Attach &amp; Mark Delivered
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
