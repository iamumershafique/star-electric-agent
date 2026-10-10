import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { PRRecord, DCRecord, GeminiExtractionResult, SiteLocation, LineItem, NavigationTab, GeminiBuiltyExtractionResult, BuiltyPreviewInfo } from '../types';
import { 
  getPRs, 
  getDCs, 
  savePR, 
  saveMultiplePRsInStorage,
  deletePR as deletePRFromStorage, 
  deleteDC as deleteDCFromStorage,
  saveDCAndFulfillPR, 
  saveMultipleDCsAndFulfillPRs,
  updateDCInStorage,
  checkDuplicatePR,
  getGeminiApiKey,
  saveGeminiApiKey,
  masterResetWithPassword,
  resetToSeedData,
  linkDCToPRInStorage,
  autoLinkAllDCsInStorage,
  mergeDuplicatePRsInStorage,
  mergeDuplicateDCsInStorage,
  mergeAllDuplicateDCsInStorage,
  deduplicateItemsInPRStorage,
  attachBuiltyToDCInStorage,
  attachMultipleBuiltysInStorage,
  markAllDCsDelivered as markAllDCsDeliveredInStorage,
  isDCPRMissing,
  autoLinkPRsAndDCsInStorage,
  linkDCToManualPRInStorage,
  markDCNoPRRequiredInStorage,
  markAllMissingPRsNoRequiredInStorage,
  attachPRImageToDCInStorage,
  saveAllPRs,
  saveAllDCs,
  DRIVE_IMPORT_VERSION,
  PR_EVIDENCE_VERSION,
  getVerifiedDriveDCUpdates,
  getDriveVerifiedPRFulfillmentUpdates,
  INITIAL_SITES
} from '../lib/storage';
import { initImageMemory } from '../lib/imageStorage';
import {
  subscribeToCloudPRs,
  subscribeToCloudDCs,
  savePRToCloud,
  saveDCToCloud,
  syncDriveVerifiedDCFieldsToCloud,
  syncDriveVerifiedPRFulfillmentToCloud,
  deletePRFromCloud,
  deleteDCFromCloud
} from '../lib/firestoreService';

interface AppContextType {
  prs: PRRecord[];
  dcs: DCRecord[];
  sites: SiteLocation[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  selectedSiteFilter: string;
  setSelectedSiteFilter: (site: string) => void;
  selectedBrandFilter: string;
  setSelectedBrandFilter: (brand: string) => void;

  // Modals & Triggers
  isPRUploadOpen: boolean;
  setIsPRUploadOpen: (open: boolean) => void;
  isPRReviewOpen: boolean;
  setIsPRReviewOpen: (open: boolean) => void;
  isDCUploadOpen: boolean;
  setIsDCUploadOpen: (open: boolean) => void;
  isDuplicateWarningOpen: boolean;
  setIsDuplicateWarningOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isPRDetailOpen: boolean;
  setIsPRDetailOpen: (open: boolean) => void;
  isMasterResetOpen: boolean;
  setIsMasterResetOpen: (open: boolean) => void;
  isQuickDispatchOpen: boolean;
  setIsQuickDispatchOpen: (open: boolean) => void;
  isPREditOpen: boolean;
  setIsPREditOpen: (open: boolean) => void;
  editingPR: PRRecord | null;
  setEditingPR: (pr: PRRecord | null) => void;
  isDCEditOpen: boolean;
  setIsDCEditOpen: (open: boolean) => void;
  editingDC: DCRecord | null;
  setEditingDC: (dc: DCRecord | null) => void;
  isBuiltyUploadOpen: boolean;
  setIsBuiltyUploadOpen: (open: boolean) => void;
  targetBuiltyDC: DCRecord | null;
  setTargetBuiltyDC: (dc: DCRecord | null) => void;
  selectedBuiltyPreview: BuiltyPreviewInfo | null;
  setSelectedBuiltyPreview: (preview: BuiltyPreviewInfo | null) => void;

  // Authentication & Remote Mobile Access
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: { username: string; role: string; displayName: string } | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  publicUrl: string;
  setPublicUrl: (url: string) => void;
  isMobileAccessOpen: boolean;
  setIsMobileAccessOpen: (open: boolean) => void;

  // Active Drafts & Selections
  selectedPR: PRRecord | null;
  setSelectedPR: (pr: PRRecord | null) => void;
  targetDC_PR: PRRecord | null;
  setTargetDC_PR: (pr: PRRecord | null) => void;
  quickDispatchTarget: { pr: PRRecord; items: LineItem[] } | null;
  setQuickDispatchTarget: (target: { pr: PRRecord; items: LineItem[] } | null) => void;
  pendingExtractedData: GeminiExtractionResult | null;
  setPendingExtractedData: (data: GeminiExtractionResult | null) => void;
  pendingExtractedDataList: GeminiExtractionResult[] | null;
  setPendingExtractedDataList: (list: GeminiExtractionResult[] | null) => void;
  pendingImage: string | null;
  setPendingImage: (img: string | null) => void;
  duplicateInfo: { isDuplicate: boolean; existingPR?: PRRecord; pendingPrNumber?: string } | null;
  setDuplicateInfo: (info: any) => void;

  // Settings
  geminiApiKey: string;
  updateGeminiApiKey: (key: string) => void;

  // Actions
  addNewPR: (pr: PRRecord) => boolean;
  addMultiplePRs: (records: PRRecord[]) => void;
  updateExistingPR: (pr: PRRecord) => void;
  deletePR: (id: string) => void;
  deleteDC: (id: string) => void;
  updateDC: (updatedDC: DCRecord) => void;
  recordDeliveryChallan: (
    dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>, 
    fulfillmentMap: Record<string, number>
  ) => void;
  recordMultipleDeliveryChallans: (
    dcList: Array<{
      dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>;
      fulfillmentMap: Record<string, number>;
    }>
  ) => void;
  attachBuiltyToDC: (
    dcIdOrNumber: string,
    builtyData: Partial<GeminiBuiltyExtractionResult>
  ) => { success: boolean; linkedDC?: DCRecord; error?: string; message?: string };
  attachMultipleBuiltys: (
    builtys: GeminiBuiltyExtractionResult[]
  ) => { attachedCount: number; unlinkedCount: number; results: any[] };
  verifyAndCheckDuplicate: (prNumber: string) => { isDuplicate: boolean; existingPR?: PRRecord };
  linkDCToPR: (dcId: string, prId: string) => { success: boolean; error?: string };
  autoLinkAllDCs: () => { linkedCount: number };
  mergeDuplicatePRs: (primaryPrId: string, duplicatePrId: string) => { success: boolean; error?: string };
  mergeDuplicateDCs: (primaryDcId: string, duplicateDcId: string) => { success: boolean; error?: string };
  mergeAllDuplicateDCs: () => { success: boolean; mergedCount: number };
  deduplicatePRItems: (prId: string) => { success: boolean; error?: string };
  performMasterReset: (password: string) => { success: boolean; error?: string };
  markAllDCsDelivered: () => Promise<{
    updatedCount: number;
    deliveredCount: number;
    dispatchedCount: number;
    skippedCount: number;
    cloudFailures: number;
  }>;
  // Missing PR & Auto-linking Actions
  isDCPRMissing: (dc: DCRecord) => boolean;
  autoLinkDeliveredPRsAndDCs: () => { linkedCount: number; updatedPRs: PRRecord[]; updatedDCs: DCRecord[] };
  linkDCToManualPR: (dcId: string, prNumber: string, notes?: string) => { success: boolean; error?: string };
  markDCNoPRRequired: (dcId: string) => void;
  markAllMissingPRsNoRequired: () => { count: number };
  attachPRImageToDC: (dcId: string, base64Image: string, prNumber?: string) => void;
  resetData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;
  pushAllToCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prs, setPRs] = useState<PRRecord[]>(() => {
    try {
      return getPRs();
    } catch {
      return [];
    }
  });
  const [dcs, setDCs] = useState<DCRecord[]>(() => {
    try {
      return getDCs();
    } catch {
      return [];
    }
  });
  
  // Dynamically derive sites from PR records, DC records, and master Jadeed site locations
  const sites = useMemo<SiteLocation[]>(() => {
    const rawNames = [
      ...prs.map(p => p.siteName),
      ...dcs.map(d => d.siteName),
      ...INITIAL_SITES.map(s => s.name)
    ].filter(Boolean);
    const uniqueNames = Array.from(new Set(rawNames));
    return uniqueNames.sort().map((name, index) => ({
      id: `site-${index + 1}`,
      name,
      region: name.includes('-') ? name.split('-')[1].trim() : name,
      code: `S-${String(index + 1).padStart(2, '0')}`
    }));
  }, [prs, dcs]);

  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab');
        if (t === 'deliveries' || t === 'ledger' || t === 'search' || t === 'gemini-audit') {
          return t;
        }
      }
    } catch {}
    return 'dashboard';
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL');

  // Modals state
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

  // Authentication & Remote Access state
  const [isAuthenticated] = useState(true);
  const [isAuthLoading] = useState(false);
  const [currentUser] = useState<{ username: string; role: string; displayName: string } | null>({
    username: 'public-user',
    role: 'Authorized user',
    displayName: 'Public Portal User'
  });

  useEffect(() => {
    try {
      localStorage.removeItem('star_auth_session');
      localStorage.removeItem('star_auth_user');
      sessionStorage.removeItem('star_auth_session');
    } catch (error) {
      console.warn('[Auth] Could not clear legacy browser login flags:', error);
    }
  }, []);

  const [isMobileAccessOpen, setIsMobileAccessOpen] = useState(false);
  const [publicUrl, setPublicUrlState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('star_public_url');
      if (saved) return saved;
      if (typeof window !== 'undefined' && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
        return window.location.origin;
      }
      return 'https://technique-wool-appeals-interesting.trycloudflare.com';
    } catch {
      return 'https://technique-wool-appeals-interesting.trycloudflare.com';
    }
  });

  const setPublicUrl = (url: string) => {
    setPublicUrlState(url);
    try {
      localStorage.setItem('star_public_url', url);
    } catch {
      // ignore
    }
  };

  const login = async (_email: string, _password: string, _rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    return { success: true };
  };

  const logout = () => {
    // No-op
  };

  // Active selections
  const [selectedPR, setSelectedPR] = useState<PRRecord | null>(null);
  const [targetDC_PR, setTargetDC_PR] = useState<PRRecord | null>(null);
  const [quickDispatchTarget, setQuickDispatchTarget] = useState<{ pr: PRRecord; items: LineItem[] } | null>(null);
  const [pendingExtractedData, setPendingExtractedData] = useState<GeminiExtractionResult | null>(null);
  const [pendingExtractedDataList, setPendingExtractedDataList] = useState<GeminiExtractionResult[] | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{ isDuplicate: boolean; existingPR?: PRRecord; pendingPrNumber?: string } | null>(null);

  // Gemini API Key - initialize directly from storage so it is immediately available on first render
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => getGeminiApiKey());

  useEffect(() => {
    // 0. Initialize persistent image memory cache from IndexedDB
    initImageMemory().then(() => {
      // Re-hydrate PRs and DCs once image memory cache is ready
      const rehydratedPRs = getPRs();
      const rehydratedDCs = getDCs();
      if (rehydratedPRs.length > 0) setPRs(rehydratedPRs);
      if (rehydratedDCs.length > 0) setDCs(rehydratedDCs);
    });

    // 1. Initial reconciliation & loading (guarantees all 600+ DCs and linked PRs appear immediately)
    const initLink = autoLinkPRsAndDCsInStorage();
    setPRs(initLink.updatedPRs);
    setDCs(initLink.updatedDCs);

    const initialKey = getGeminiApiKey();
    setGeminiApiKeyState(initialKey);
    if (typeof window !== 'undefined' && initialKey) {
      (window as any).__GEMINI_API_KEY__ = initialKey;
    }

    let unsubPR: (() => void) | null = null;
    let unsubDC: (() => void) | null = null;

    if (isAuthenticated) {
      // Sync only fields verified in Drive, leaving user-managed DC details untouched.
      const cloudDriveImportVersionKey = 'STAR_ELECTRIC_DRIVE_CLOUD_IMPORT_VERSION';
      if (localStorage.getItem(cloudDriveImportVersionKey) !== DRIVE_IMPORT_VERSION) {
        void syncDriveVerifiedDCFieldsToCloud(getVerifiedDriveDCUpdates(initLink.updatedDCs))
          .then(synced => {
            if (synced) {
              try {
                localStorage.setItem(cloudDriveImportVersionKey, DRIVE_IMPORT_VERSION);
              } catch (error) {
                console.error('Failed to record the Drive cloud sync version', error);
              }
            }
          })
          .catch(error => {
            console.error('Failed to sync Drive-verified DC data to Firestore', error);
          });
      }

      const cloudPREvidenceVersionKey = 'STAR_ELECTRIC_PR_EVIDENCE_CLOUD_VERSION';
      if (localStorage.getItem(cloudPREvidenceVersionKey) !== PR_EVIDENCE_VERSION) {
        void syncDriveVerifiedPRFulfillmentToCloud(getDriveVerifiedPRFulfillmentUpdates(initLink.updatedPRs))
          .then(synced => {
            if (synced) {
              try {
                localStorage.setItem(cloudPREvidenceVersionKey, PR_EVIDENCE_VERSION);
              } catch (error) {
                console.error('Failed to record the scanned PR cloud sync version', error);
              }
            }
          })
          .catch(error => {
            console.error('Failed to sync scanned PR item evidence to Firestore', error);
          });
      }

      // Subscribe only while Firebase confirms an authenticated user.
      unsubPR = subscribeToCloudPRs((cloudPRs) => {
        if (cloudPRs && cloudPRs.length > 0) {
          setPRs(prev => {
            const map = new Map<string, PRRecord>();
            prev.forEach(p => map.set(p.id, p));
            cloudPRs.forEach(cp => {
              const cloudNumber = (cp.prNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              const existing = map.get(cp.id) || Array.from(map.values()).find(p =>
                (p.prNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cloudNumber
              );
              map.set(existing?.id || cp.id, existing ? {
                ...existing,
                ...cp,
                prNumber: cp.prNumber || existing.prNumber,
                date: cp.date || existing.date,
                siteName: cp.siteName || existing.siteName,
                items: cp.items?.length ? cp.items : existing.items,
                fulfillmentLogs: cp.fulfillmentLogs?.length ? cp.fulfillmentLogs : existing.fulfillmentLogs
              } : cp);
            });
            const merged = Array.from(map.values());
            saveAllPRs(merged);
            return merged;
          });
        }
      });

      unsubDC = subscribeToCloudDCs((cloudDCs) => {
        if (cloudDCs && cloudDCs.length > 0) {
          setDCs(prev => {
            // If cloud has older partial dataset and local has full 600+, keep full 600+ and update fields
            if (cloudDCs.length < 590 && prev.length >= 590) {
              const cloudMap = new Map(cloudDCs.map(c => [(c.dcNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(), c]));
              const merged = prev.map(p => {
                const k = (p.dcNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const cloud = cloudMap.get(k);
                return cloud ? {
                  ...p,
                  ...cloud,
                  dcNumber: cloud.dcNumber || p.dcNumber,
                  invoiceNumber: cloud.invoiceNumber || p.invoiceNumber,
                  prNumber: cloud.prNumber || p.prNumber,
                  prId: cloud.prId || p.prId,
                  date: cloud.date || p.date,
                  siteName: cloud.siteName || p.siteName,
                  itemsShipped: cloud.itemsShipped?.length ? cloud.itemsShipped : p.itemsShipped
                } : p;
              });
              saveAllDCs(merged);
              return merged;
            }
            const map = new Map<string, DCRecord>();
            prev.forEach(d => map.set(d.id, d));
            cloudDCs.forEach(cd => {
              const cloudNumber = (cd.dcNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              const existing = map.get(cd.id) || Array.from(map.values()).find(d =>
                (d.dcNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cloudNumber
              );
              map.set(existing?.id || cd.id, existing ? {
                ...existing,
                ...cd,
                dcNumber: cd.dcNumber || existing.dcNumber,
                invoiceNumber: cd.invoiceNumber || existing.invoiceNumber,
                prNumber: cd.prNumber || existing.prNumber,
                prId: cd.prId || existing.prId,
                date: cd.date || existing.date,
                siteName: cd.siteName || existing.siteName,
                itemsShipped: cd.itemsShipped?.length ? cd.itemsShipped : existing.itemsShipped
              } : cd);
            });
            const merged = Array.from(map.values());
            saveAllDCs(merged);
            return merged;
          });
        }
      });
    }

    return () => {
      unsubPR?.();
      unsubDC?.();
    };
  }, [isAuthenticated]);

  const updateGeminiApiKey = (key: string) => {
    saveGeminiApiKey(key);
    const active = getGeminiApiKey();
    setGeminiApiKeyState(active);
    if (typeof window !== 'undefined') {
      (window as any).__GEMINI_API_KEY__ = active;
    }
  };

  const verifyAndCheckDuplicate = (prNumber: string) => {
    return checkDuplicatePR(prNumber);
  };

  const addNewPR = (newPR: PRRecord): boolean => {
    const dupCheck = checkDuplicatePR(newPR.prNumber, newPR.id);
    if (dupCheck.isDuplicate) {
      setDuplicateInfo({
        isDuplicate: true,
        existingPR: dupCheck.existingPR,
        pendingPrNumber: newPR.prNumber
      });
      setIsDuplicateWarningOpen(true);
      return false;
    }
    const updated = savePR(newPR);
    setPRs(updated);
    savePRToCloud(newPR).catch(err => console.warn('[Firestore] Cloud PR save warning:', err));
    return true;
  };

  const addMultiplePRs = (records: PRRecord[]): void => {
    const updated = saveMultiplePRsInStorage(records);
    setPRs(updated);
    records.forEach(r => savePRToCloud(r).catch(() => {}));
  };

  const updateExistingPR = (updatedPR: PRRecord) => {
    const updated = savePR(updatedPR);
    setPRs(updated);
    savePRToCloud(updatedPR).catch(() => {});
    if (selectedPR && selectedPR.id === updatedPR.id) {
      setSelectedPR(updatedPR);
    }
    if (editingPR && editingPR.id === updatedPR.id) {
      setEditingPR(updatedPR);
    }
  };

  const updateDC = (updatedDC: DCRecord) => {
    const { updatedPRs, updatedDCs } = updateDCInStorage(updatedDC);
    setPRs(updatedPRs);
    setDCs(updatedDCs);
    saveDCToCloud(updatedDC).catch(() => {});
    if (selectedPR) {
      const refreshed = updatedPRs.find(p => p.id === selectedPR.id);
      if (refreshed) setSelectedPR(refreshed);
    }
    if (editingDC && editingDC.id === updatedDC.id) {
      setEditingDC(updatedDC);
    }
  };

  const deletePR = (id: string) => {
    const updated = deletePRFromStorage(id);
    setPRs(updated);
    deletePRFromCloud(id).catch(() => {});
    if (selectedPR?.id === id) {
      setSelectedPR(null);
      setIsPRDetailOpen(false);
    }
  };

  const deleteDC = (id: string) => {
    const { updatedPRs, updatedDCs } = deleteDCFromStorage(id);
    setPRs(updatedPRs);
    setDCs(updatedDCs);
    deleteDCFromCloud(id).catch(() => {});
  };

  const recordDeliveryChallan = (
    dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>,
    fulfillmentMap: Record<string, number>
  ) => {
    const { updatedPRs, updatedDCs } = saveDCAndFulfillPR(dcData, fulfillmentMap);
    setPRs(updatedPRs);
    setDCs(updatedDCs);
    
    const createdDC = updatedDCs.find(d => d.dcNumber === dcData.dcNumber);
    if (createdDC) saveDCToCloud(createdDC).catch(() => {});
    if (dcData.prId) {
      const fulfilledPR = updatedPRs.find(p => p.id === dcData.prId);
      if (fulfilledPR) savePRToCloud(fulfilledPR).catch(() => {});
    }
    
    if (selectedPR && (selectedPR.id === dcData.prId || selectedPR.prNumber === dcData.prNumber)) {
      const refreshed = updatedPRs.find(p => p.id === selectedPR.id);
      if (refreshed) setSelectedPR(refreshed);
    }
  };

  const recordMultipleDeliveryChallans = (
    dcList: Array<{
      dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>;
      fulfillmentMap: Record<string, number>;
    }>
  ) => {
    const { updatedPRs, updatedDCs } = saveMultipleDCsAndFulfillPRs(dcList);
    setPRs(updatedPRs);
    setDCs(updatedDCs);

    dcList.forEach(item => {
      const createdDC = updatedDCs.find(d => d.dcNumber === item.dcData.dcNumber);
      if (createdDC) saveDCToCloud(createdDC).catch(() => {});
      if (item.dcData.prId) {
        const fulfilledPR = updatedPRs.find(p => p.id === item.dcData.prId);
        if (fulfilledPR) savePRToCloud(fulfilledPR).catch(() => {});
      }
    });

    if (selectedPR) {
      const refreshed = updatedPRs.find(p => p.id === selectedPR.id);
      if (refreshed) setSelectedPR(refreshed);
    }
  };

  const linkDCToPR = (dcId: string, prId: string) => {
    const res = linkDCToPRInStorage(dcId, prId);
    if (res.success) {
      setPRs(res.updatedPRs);
      setDCs(res.updatedDCs);
      if (selectedPR && selectedPR.id === prId) {
        const refreshed = res.updatedPRs.find(p => p.id === prId);
        if (refreshed) setSelectedPR(refreshed);
      }
    }
    return { success: res.success, error: res.error };
  };

  const autoLinkAllDCs = () => {
    const res = autoLinkAllDCsInStorage();
    if (res.linkedCount > 0) {
      setPRs(res.updatedPRs);
      setDCs(res.updatedDCs);
      if (selectedPR) {
        const refreshed = res.updatedPRs.find(p => p.id === selectedPR.id);
        if (refreshed) setSelectedPR(refreshed);
      }
    }
    return { linkedCount: res.linkedCount };
  };

  const mergeDuplicatePRs = (primaryPrId: string, duplicatePrId: string) => {
    const res = mergeDuplicatePRsInStorage(primaryPrId, duplicatePrId);
    if (res.success) {
      setPRs(res.updatedPRs);
      setDCs(res.updatedDCs);
      const primaryPR = res.updatedPRs.find(p => p.id === primaryPrId);
      if (primaryPR) savePRToCloud(primaryPR).catch(error => console.error('[Firestore] Failed to sync merged PR:', error));
      deletePRFromCloud(duplicatePrId).catch(error => console.error('[Firestore] Failed to delete merged duplicate PR:', error));
      res.updatedDCs.forEach(dc => {
        const previous = dcs.find(existing => existing.id === dc.id);
        if (previous && (previous.prId !== dc.prId || previous.prNumber !== dc.prNumber)) {
          saveDCToCloud(dc).catch(error => console.error(`[Firestore] Failed to sync PR link for ${dc.dcNumber}:`, error));
        }
      });
      if (selectedPR && (selectedPR.id === primaryPrId || selectedPR.id === duplicatePrId)) {
        if (primaryPR) setSelectedPR(primaryPR);
      }
    }
    return { success: res.success, error: res.error };
  };

  const mergeDuplicateDCs = (primaryDcId: string, duplicateDcId: string) => {
    const res = mergeDuplicateDCsInStorage(primaryDcId, duplicateDcId);
    if (res.success) {
      setDCs(res.updatedDCs);
      const primaryDC = res.updatedDCs.find(dc => dc.id === primaryDcId);
      if (primaryDC) saveDCToCloud(primaryDC).catch(error => console.error('[Firestore] Failed to sync merged DC:', error));
      deleteDCFromCloud(duplicateDcId).catch(error => console.error('[Firestore] Failed to delete merged duplicate DC:', error));
    }
    return { success: res.success, error: res.error };
  };

  const mergeAllDuplicateDCs = () => {
    const res = mergeAllDuplicateDCsInStorage();
    if (res.success) {
      setDCs(res.updatedDCs);
      const updatedIds = new Set(res.updatedDCs.map(dc => dc.id));
      dcs.filter(dc => !updatedIds.has(dc.id)).forEach(dc => {
        deleteDCFromCloud(dc.id).catch(error => console.error(`[Firestore] Failed to delete merged duplicate ${dc.dcNumber}:`, error));
      });
      res.updatedDCs.forEach(dc => {
        const previous = dcs.find(existing => existing.id === dc.id);
        if (!previous || JSON.stringify(previous) !== JSON.stringify(dc)) {
          saveDCToCloud(dc).catch(error => console.error(`[Firestore] Failed to sync merged DC ${dc.dcNumber}:`, error));
        }
      });
    }
    return { success: res.success, mergedCount: res.mergedCount };
  };

  const deduplicatePRItems = (prId: string) => {
    const res = deduplicateItemsInPRStorage(prId);
    if (res.success) {
      setPRs(res.updatedPRs);
      const updatedPR = res.updatedPRs.find(pr => pr.id === prId);
      if (updatedPR) savePRToCloud(updatedPR).catch(error => console.error(`[Firestore] Failed to sync de-duplicated items for ${updatedPR.prNumber}:`, error));
      if (selectedPR && selectedPR.id === prId) {
        if (updatedPR) setSelectedPR(updatedPR);
      }
    }
    return { success: res.success, error: res.error };
  };

  const attachBuiltyToDC = (
    dcIdOrNumber: string,
    builtyData: Partial<GeminiBuiltyExtractionResult>
  ) => {
    const res = attachBuiltyToDCInStorage(dcIdOrNumber, builtyData);
    if (res.success) {
      setDCs(res.updatedDCs);
      setPRs(res.updatedPRs);
      if (selectedPR && res.linkedPR && selectedPR.id === res.linkedPR.id) {
        setSelectedPR(res.linkedPR);
      }
    }
    return { success: res.success, linkedDC: res.linkedDC, error: res.error, message: res.message };
  };

  const attachMultipleBuiltys = (builtys: GeminiBuiltyExtractionResult[]) => {
    const res = attachMultipleBuiltysInStorage(builtys);
    setDCs(res.updatedDCs);
    setPRs(res.updatedPRs);
    if (selectedPR) {
      const refreshed = res.updatedPRs.find(p => p.id === selectedPR.id);
      if (refreshed) setSelectedPR(refreshed);
    }
    return { attachedCount: res.attachedCount, unlinkedCount: res.unlinkedCount, results: res.results };
  };

  const performMasterReset = (password: string) => {
    const res = masterResetWithPassword(password);
    if (res.success) {
      setPRs(res.prs);
      setDCs(res.dcs);
    }
    return { success: res.success, error: res.error };
  };

  const markAllDCsDelivered = async () => {
    const res = markAllDCsDeliveredInStorage();
    setDCs(res.updatedDCs);
    let cloudFailures = 0;
    const recordsToSync = res.updatedDCs.filter(dc => !dc.dcNumber.toLowerCase().includes('missing'));
    for (let start = 0; start < recordsToSync.length; start += 25) {
      const batch = recordsToSync.slice(start, start + 25);
      const results = await Promise.allSettled(batch.map(dc => saveDCToCloud(dc)));
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          cloudFailures++;
          console.error(`[Firestore] Failed to sync delivery status for ${batch[index].dcNumber}:`, result.reason);
        }
      });
    }
    return {
      updatedCount: res.updatedCount,
      deliveredCount: res.deliveredCount,
      dispatchedCount: res.dispatchedCount,
      skippedCount: res.skippedCount,
      cloudFailures
    };
  };

  const isDCPRMissingCheck = (dc: DCRecord) => isDCPRMissing(dc, prs);

  const autoLinkDeliveredPRsAndDCs = () => {
    const res = autoLinkPRsAndDCsInStorage();
    setPRs(res.updatedPRs);
    setDCs(res.updatedDCs);
    res.updatedPRs.forEach(p => savePRToCloud(p).catch(() => {}));
    res.updatedDCs.forEach(d => saveDCToCloud(d).catch(() => {}));
    return res;
  };

  const linkDCToManualPR = (dcId: string, prNumber: string, notes?: string) => {
    const res = linkDCToManualPRInStorage(dcId, prNumber, notes);
    if (res.error) return { success: false, error: res.error };
    setPRs(res.updatedPRs);
    setDCs(res.updatedDCs);
    const targetDC = res.updatedDCs.find(d => d.id === dcId);
    if (targetDC) saveDCToCloud(targetDC).catch(() => {});
    return { success: true };
  };

  const markDCNoPRRequired = (dcId: string) => {
    const res = markDCNoPRRequiredInStorage(dcId);
    setDCs(res.updatedDCs);
    const targetDC = res.updatedDCs.find(d => d.id === dcId);
    if (targetDC) saveDCToCloud(targetDC).catch(() => {});
  };

  const markAllMissingPRsNoRequired = () => {
    const res = markAllMissingPRsNoRequiredInStorage();
    setDCs(res.updatedDCs);
    res.updatedDCs.forEach(d => {
      if (d.noPrRequired) saveDCToCloud(d).catch(() => {});
    });
    return { count: res.count };
  };

  const attachPRImageToDC = (dcId: string, base64Image: string, prNumber?: string) => {
    const res = attachPRImageToDCInStorage(dcId, base64Image, prNumber);
    setPRs(res.updatedPRs);
    setDCs(res.updatedDCs);
    const targetDC = res.updatedDCs.find(d => d.id === dcId);
    if (targetDC) saveDCToCloud(targetDC).catch(() => {});
    const targetPR = res.updatedPRs.find(p => p.prNumber === (targetDC ? targetDC.prNumber : prNumber));
    if (targetPR) savePRToCloud(targetPR).catch(() => {});
  };

  const resetData = () => {
    const { prs: newPRs, dcs: newDCs } = resetToSeedData();
    setPRs(newPRs);
    setDCs(newDCs);
  };

  const exportBackupJSON = () => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      client: 'Jadeed Group',
      supplier: 'Star Electric Enterprises Saddar Rawalpindi',
      prs,
      dcs
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `StarElectric_JadeedDB_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const pushAllToCloud = async (): Promise<void> => {
    if (!isAuthenticated) {
      console.error('Cannot push to cloud: User is not authenticated.');
      return;
    }
    console.log(`Pushing ${prs.length} PRs and ${dcs.length} DCs to Firebase...`);
    const prPromises = prs.map(pr => savePRToCloud(pr).catch(e => console.error('Failed to sync PR:', e)));
    const dcPromises = dcs.map(dc => saveDCToCloud(dc).catch(e => console.error('Failed to sync DC:', e)));
    await Promise.all([...prPromises, ...dcPromises]);
    console.log('Finished pushing all data to Firebase.');
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.prs && Array.isArray(parsed.prs)) {
        setPRs(parsed.prs);
        localStorage.setItem('STAR_ELECTRIC_PRS_V2', JSON.stringify(parsed.prs));
      }
      if (parsed.dcs && Array.isArray(parsed.dcs)) {
        setDCs(parsed.dcs);
        localStorage.setItem('STAR_ELECTRIC_DCS_V2', JSON.stringify(parsed.dcs));
      }
      return true;
    } catch (e) {
      console.error('Invalid backup JSON file', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        prs,
        dcs,
        sites,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedStatusFilter,
        setSelectedStatusFilter,
        selectedSiteFilter,
        setSelectedSiteFilter,
        selectedBrandFilter,
        setSelectedBrandFilter,
        isPRUploadOpen,
        setIsPRUploadOpen,
        isPRReviewOpen,
        setIsPRReviewOpen,
        isDCUploadOpen,
        setIsDCUploadOpen,
        isDuplicateWarningOpen,
        setIsDuplicateWarningOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isPRDetailOpen,
        setIsPRDetailOpen,
        isMasterResetOpen,
        setIsMasterResetOpen,
        isQuickDispatchOpen,
        setIsQuickDispatchOpen,
        selectedPR,
        setSelectedPR,
        targetDC_PR,
        setTargetDC_PR,
        quickDispatchTarget,
        setQuickDispatchTarget,
        pendingExtractedData,
        setPendingExtractedData,
        pendingExtractedDataList,
        setPendingExtractedDataList,
        pendingImage,
        setPendingImage,
        duplicateInfo,
        setDuplicateInfo,
        geminiApiKey,
        updateGeminiApiKey,
        addNewPR,
        addMultiplePRs,
        updateExistingPR,
        deletePR,
        deleteDC,
        updateDC,
        isPREditOpen,
        setIsPREditOpen,
        editingPR,
        setEditingPR,
        isDCEditOpen,
        setIsDCEditOpen,
        editingDC,
        setEditingDC,
        isBuiltyUploadOpen,
        setIsBuiltyUploadOpen,
        targetBuiltyDC,
        setTargetBuiltyDC,
        selectedBuiltyPreview,
        setSelectedBuiltyPreview,
        attachBuiltyToDC,
        attachMultipleBuiltys,
        recordDeliveryChallan,
        recordMultipleDeliveryChallans,
        verifyAndCheckDuplicate,
        linkDCToPR,
        autoLinkAllDCs,
        mergeDuplicatePRs,
        mergeDuplicateDCs,
        mergeAllDuplicateDCs,
        deduplicatePRItems,
        performMasterReset,
        markAllDCsDelivered,
        isDCPRMissing: isDCPRMissingCheck,
        autoLinkDeliveredPRsAndDCs,
        linkDCToManualPR,
        markDCNoPRRequired,
        markAllMissingPRsNoRequired,
        attachPRImageToDC,
        resetData,
        exportBackupJSON,
        importBackupJSON,
        pushAllToCloud,
        isAuthenticated,
        isAuthLoading,
        currentUser,
        login,
        logout,
        publicUrl,
        setPublicUrl,
        isMobileAccessOpen,
        setIsMobileAccessOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
