/**
 * DEMO PREVIEW ONLY. Drop-in replacement for src/context/AppContext used by demo-preview.
 *
 * Same shape as the real provider (useApp() returns the same fields), but:
 *   - sample PR/DC ledger instead of Firestore + localStorage
 *   - "signed in" immediately, no Firebase
 *   - mutations stay in memory (refresh resets everything)
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import type {
  PRRecord,
  DCRecord,
  SiteLocation,
  LineItem,
  GeminiExtractionResult,
  GeminiBuiltyExtractionResult,
  BuiltyPreviewInfo,
  NavigationTab
} from '../../src/types';
import { computeItemStatus, computePRStatus, normalizePRNumber } from '../../src/lib/utils';
import { seedPRs, seedDCs, SEED_SITES } from './seedData';

const AppContext = createContext<any>(undefined);

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prs, setPRs] = useState<PRRecord[]>(() => clone(seedPRs));
  const [dcs, setDCs] = useState<DCRecord[]>(() => clone(seedDCs));
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPRUploadOpen, setIsPRUploadOpen] = useState(false);
  const [isPRReviewOpen, setIsPRReviewOpen] = useState(false);
  const [isDCUploadOpen, setIsDCUploadOpen] = useState(false);
  const [isDuplicateWarningOpen, setIsDuplicateWarningOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPRDetailOpen, setIsPRDetailOpen] = useState(false);
  const [isMasterResetOpen, setIsMasterResetOpen] = useState(false);
  const [isQuickDispatchOpen, setIsQuickDispatchOpen] = useState(false);
  const [isPREditOpen, setIsPREditOpen] = useState(false);
  const [editingPR, setEditingPR] = useState<PRRecord | null>(null);
  const [isDCEditOpen, setIsDCEditOpen] = useState(false);
  const [editingDC, setEditingDC] = useState<DCRecord | null>(null);
  const [isBuiltyUploadOpen, setIsBuiltyUploadOpen] = useState(false);
  const [targetBuiltyDC, setTargetBuiltyDC] = useState<DCRecord | null>(null);
  const [selectedBuiltyPreview, setSelectedBuiltyPreview] = useState<BuiltyPreviewInfo | null>(null);
  const [isMobileAccessOpen, setIsMobileAccessOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState('https://preview.example.invalid');
  const [selectedPR, setSelectedPR] = useState<PRRecord | null>(null);
  const [targetDC_PR, setTargetDC_PR] = useState<PRRecord | null>(null);
  const [quickDispatchTarget, setQuickDispatchTarget] = useState<{ pr: PRRecord; items: LineItem[] } | null>(null);
  const [pendingExtractedData, setPendingExtractedData] = useState<GeminiExtractionResult | null>(null);
  const [pendingExtractedDataList, setPendingExtractedDataList] = useState<GeminiExtractionResult[] | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{ isDuplicate: boolean; existingPR?: PRRecord; pendingPrNumber?: string } | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const sites = useMemo<SiteLocation[]>(() => {
    const names = Array.from(new Set([...SEED_SITES, ...prs.map(p => p.siteName), ...dcs.map(d => d.siteName)].filter(Boolean))).sort();
    return names.map((name, index) => ({ id: `site-${index + 1}`, name, region: name, code: `S-${String(index + 1).padStart(2, '0')}` }));
  }, [prs, dcs]);

  const dcKey = (value: string) => (value || '').replace(/[^a-zA-Z0-9]/g, '').replace(/^0+(?=\d)/, '').toLowerCase();

  const verifyAndCheckDuplicate = (prNumber: string) => {
    const normalized = normalizePRNumber(prNumber);
    if (!normalized) return { isDuplicate: false };
    const existing = prs.find(pr => normalizePRNumber(pr.prNumber) === normalized);
    return existing ? { isDuplicate: true, existingPR: existing } : { isDuplicate: false };
  };

  const addNewPR = (newPR: PRRecord): boolean => {
    const dup = verifyAndCheckDuplicate(newPR.prNumber);
    if (dup.isDuplicate) {
      setDuplicateInfo({ isDuplicate: true, existingPR: dup.existingPR, pendingPrNumber: newPR.prNumber });
      setIsDuplicateWarningOpen(true);
      return false;
    }
    setPRs(prev => [newPR, ...prev]);
    return true;
  };

  const addMultiplePRs = (records: PRRecord[]) => {
    setPRs(prev => {
      const next = [...prev];
      records.forEach(record => {
        const index = next.findIndex(p => normalizePRNumber(p.prNumber) === normalizePRNumber(record.prNumber));
        if (index >= 0) next[index] = { ...next[index], ...record, items: record.items };
        else next.unshift(record);
      });
      return next;
    });
  };

  const recordDeliveryChallan = (
    dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>,
    fulfillmentMap: Record<string, number>
  ): { success: boolean; error?: string } => {
    const clean = dcData.dcNumber.trim().toUpperCase();
    const existing = dcs.find(d => dcKey(d.dcNumber) === dcKey(clean));
    if (existing) {
      return {
        success: false,
        error: `Delivery Challan ${existing.dcNumber} has already been recorded. Open it in the Delivery log and use 'Edit DC' if you need to change it.`
      };
    }

    const prIndex = prs.findIndex(p =>
      (dcData.prId && p.id === dcData.prId) || (dcData.prNumber && normalizePRNumber(p.prNumber) === normalizePRNumber(dcData.prNumber))
    );

    if (prIndex >= 0) {
      setPRs(prev => prev.map((pr, index) => {
        if (index !== prIndex) return pr;
        const items = pr.items.map(it => {
          const shipped = fulfillmentMap[it.id] || 0;
          if (shipped <= 0) return it;
          const fulfilled = Math.min(it.requestedQty, it.fulfilledQty + shipped);
          return { ...it, fulfilledQty: fulfilled, status: computeItemStatus(it.requestedQty, fulfilled) };
        });
        return { ...pr, items, status: computePRStatus(items) };
      }));
    }

    const newDC: DCRecord = {
      ...dcData,
      id: `dc-demo-${Date.now()}`,
      dcNumber: clean,
      invoiceNumber: clean,
      prId: prIndex >= 0 ? prs[prIndex].id : '',
      prNumber: prIndex >= 0 ? prs[prIndex].prNumber : (dcData.prNumber || ''),
      deliveryStatus: 'Delivered',
      createdTimestamp: Date.now()
    };
    setDCs(prev => [newDC, ...prev]);
    return { success: true };
  };

  const recordMultipleDeliveryChallans = (dcList: Array<{ dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>; fulfillmentMap: Record<string, number> }>) => {
    const skipped: { dcNumber: string; reason: string }[] = [];
    let savedCount = 0;
    dcList.forEach(entry => {
      const result = recordDeliveryChallan(entry.dcData, entry.fulfillmentMap);
      if (result.success) savedCount += 1;
      else skipped.push({ dcNumber: entry.dcData.dcNumber, reason: result.error || 'Duplicate DC number.' });
    });
    return { savedCount, skipped };
  };

  const updateExistingPR = (updated: PRRecord) => {
    setPRs(prev => prev.map(pr => pr.id === updated.id ? updated : pr));
    setEditingPR(updated);
  };

  const deletePR = (id: string) => setPRs(prev => prev.filter(pr => pr.id !== id));

  const updateDC = (updated: DCRecord) => {
    setDCs(prev => prev.map(dc => dc.id === updated.id ? updated : dc));
    setEditingDC(updated);
  };

  const deleteDC = (id: string) => setDCs(prev => prev.filter(dc => dc.id !== id));

  const linkDCToPR = (dcId: string, prId: string) => {
    const pr = prs.find(p => p.id === prId);
    if (!pr) return { success: false, error: 'PR not found in the demo ledger.' };
    setDCs(prev => prev.map(dc => dc.id === dcId ? { ...dc, prId: pr.id, prNumber: pr.prNumber } : dc));
    return { success: true };
  };

  const linkDCToManualPR = (dcId: string, prNumber: string) => {
    setDCs(prev => prev.map(dc => dc.id === dcId ? { ...dc, prNumber, prId: '' } : dc));
    return { success: true };
  };

  const attachBuiltyToDC = (dcIdOrNumber: string, builty: Partial<GeminiBuiltyExtractionResult>) => {
    const key = dcKey(dcIdOrNumber);
    const target = dcs.find(dc => dc.id === dcIdOrNumber || dcKey(dc.dcNumber) === key);
    if (!target) return { success: false, error: 'No matching DC in the demo ledger.' };
    const updated: DCRecord = {
      ...target,
      isBuiltyAttached: true,
      builtyNumber: builty.builtyNumber || target.builtyNumber,
      addaName: builty.addaName || target.addaName,
      destinationCity: builty.destinationCity || target.destinationCity,
      packagesCount: builty.packagesCount || target.packagesCount,
      freightCharges: builty.freightCharges ?? target.freightCharges,
      freightStatus: builty.freightStatus || target.freightStatus,
      builtyDate: builty.builtyDate || target.builtyDate,
      builtyImage: builty.builtyImage || target.builtyImage
    };
    setDCs(prev => prev.map(dc => dc.id === target.id ? updated : dc));
    return { success: true, linkedDC: updated, message: 'Builty attached (demo).' };
  };

  const attachMultipleBuiltys = (builtys: GeminiBuiltyExtractionResult[]) => {
    let attachedCount = 0;
    const results: any[] = [];
    builtys.forEach(builty => {
      const result = attachBuiltyToDC(builty.dcNumber, builty);
      if (result.success) attachedCount += 1;
      results.push({ dcNumber: builty.dcNumber, ...result });
    });
    return { attachedCount, unlinkedCount: builtys.length - attachedCount, results };
  };

  const markAllDCsDelivered = async () => {
    const missing = dcs.filter(dc => !dc.prId && !dc.noPrRequired).length;
    setDCs(prev => prev.map(dc => ({ ...dc, deliveryStatus: 'Delivered' })));
    return { updatedCount: dcs.length, deliveredCount: dcs.length - missing, dispatchedCount: missing, skippedCount: missing, cloudFailures: 0 };
  };

  const value: any = {
    prs, dcs, sites, activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    selectedStatusFilter, setSelectedStatusFilter,
    selectedSiteFilter, setSelectedSiteFilter,
    selectedBrandFilter, setSelectedBrandFilter,
    isExportOpen, setIsExportOpen,
    isPRUploadOpen, setIsPRUploadOpen,
    isPRReviewOpen, setIsPRReviewOpen,
    isDCUploadOpen, setIsDCUploadOpen,
    isDuplicateWarningOpen, setIsDuplicateWarningOpen,
    isSettingsOpen, setIsSettingsOpen,
    isPRDetailOpen, setIsPRDetailOpen,
    isMasterResetOpen, setIsMasterResetOpen,
    isQuickDispatchOpen, setIsQuickDispatchOpen,
    isPREditOpen, setIsPREditOpen, editingPR, setEditingPR,
    isDCEditOpen, setIsDCEditOpen, editingDC, setEditingDC,
    isBuiltyUploadOpen, setIsBuiltyUploadOpen,
    targetBuiltyDC, setTargetBuiltyDC,
    selectedBuiltyPreview, setSelectedBuiltyPreview,
    isAuthenticated: true,
    isAuthLoading: false,
    authError: null,
    currentUser: { username: 'demo@star-electric', role: 'Demo preview', displayName: 'Demo Preview User' },
    login: async () => ({ success: true }),
    logout: () => {},
    publicUrl, setPublicUrl,
    isMobileAccessOpen, setIsMobileAccessOpen,
    selectedPR, setSelectedPR,
    targetDC_PR, setTargetDC_PR,
    quickDispatchTarget, setQuickDispatchTarget,
    pendingExtractedData, setPendingExtractedData,
    pendingExtractedDataList, setPendingExtractedDataList,
    pendingImage, setPendingImage,
    duplicateInfo, setDuplicateInfo,
    geminiApiKey, updateGeminiApiKey: setGeminiApiKey,
    addNewPR, addMultiplePRs, updateExistingPR, deletePR, deleteDC, updateDC,
    recordDeliveryChallan, recordMultipleDeliveryChallans,
    attachBuiltyToDC, attachMultipleBuiltys,
    verifyAndCheckDuplicate,
    linkDCToPR,
    autoLinkAllDCs: () => ({ linkedCount: 0 }),
    mergeDuplicatePRs: () => ({ success: false, error: 'Not available in the demo ledger.' }),
    mergeDuplicateDCs: () => ({ success: false, error: 'Not available in the demo ledger.' }),
    mergeAllDuplicateDCs: () => ({ success: false, mergedCount: 0 }),
    deduplicatePRItems: () => ({ success: false, error: 'Not available in the demo ledger.' }),
    performMasterReset: () => ({ success: false, error: 'Reset is disabled in the demo preview.' }),
    markAllDCsDelivered,
    isDCPRMissing: (dc: DCRecord) => !dc.prId && !dc.noPrRequired && !dc.prNumber,
    autoLinkDeliveredPRsAndDCs: () => ({ linkedCount: 0, updatedPRs: prs, updatedDCs: dcs }),
    linkDCToManualPR,
    markDCNoPRRequired: (dcId: string) => setDCs(prev => prev.map(dc => dc.id === dcId ? { ...dc, noPrRequired: true } : dc)),
    markAllMissingPRsNoRequired: () => {
      const count = dcs.filter(dc => !dc.prId && !dc.prNumber).length;
      setDCs(prev => prev.map(dc => ({ ...dc, noPrRequired: true })));
      return { count };
    },
    attachPRImageToDC: (dcId: string, base64Image: string, prNumber?: string) =>
      setDCs(prev => prev.map(dc => dc.id === dcId ? { ...dc, prDocumentImage: base64Image, prNumber: prNumber || dc.prNumber } : dc)),
    resetData: () => { setPRs(clone(seedPRs)); setDCs(clone(seedDCs)); },
    exportBackupJSON: () => {},
    importBackupJSON: () => false
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Demo marker: this preview is sample data with simulated OCR, not the live portal. */}
      <div className="fixed bottom-3 left-3 z-[999] max-w-xs rounded-xl border border-indigo-300 bg-indigo-50/95 px-3 py-2 text-[10px] font-semibold text-indigo-900 shadow-lg">
        <div className="font-black uppercase tracking-wide">Demo preview</div>
        Sample ledger, simulated OCR, nothing is saved and no Firebase/Ollama is used. Real portal:
        port 5173.
      </div>
    </AppContext.Provider>
  );
};

export const useApp = (): any => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export default AppContext;
