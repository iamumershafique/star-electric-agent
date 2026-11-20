import { planDeliveries, type DeliveryDraft } from '../lib/deliveryRules';
import React, { createContext, useContext, useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
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
  INITIAL_SITES
} from '../lib/storage';
import { getImageFromMemorySync, initImageMemory } from '../lib/imageStorage';
import { createDeviceBackup, verifyDeviceBackup, restoreDeviceBackup, type BackupSummary } from '../lib/deviceBackup';
import { createSessionSyncTracker, type CloudSyncIssue } from '../lib/cloudSyncTracker';
import {
  subscribeToCloudPRs,
  subscribeToCloudDCs,
  savePRToCloud as writePRToCloud,
  saveDCToCloud as writeDCToCloud,
  deletePRFromCloud as removePRFromCloud,
  deleteDCFromCloud as removeDCFromCloud
} from '../lib/firestoreService';

interface AppContextType {
  prs: PRRecord[];
  dcs: DCRecord[];
  setDCs: React.Dispatch<React.SetStateAction<DCRecord[]>>;
  saveDCToCloud: (dc: DCRecord) => Promise<void>;
  cloudSyncIssues: CloudSyncIssue[];
  syncTrackingUnavailable: boolean;
  localPersistenceFailed: boolean;
  isLocalOnlyMode: boolean;
  acknowledgeCloudSyncIssue: (id: string) => void;
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
  isDriveSyncOpen: boolean;
  setIsDriveSyncOpen: (open: boolean) => void;
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
  authError: string | null;
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
  updateDC: (updatedDC: DCRecord) => boolean;
  recordDeliveryChallan: (
    dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>, 
    fulfillmentMap: Record<string, number>
  ) => boolean;
  recordMultipleDeliveryChallans: (
    dcList: Array<{
      dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>;
      fulfillmentMap: Record<string, number>;
    }>
  ) => boolean;
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
  exportBackupJSON: () => Promise<BackupSummary>;
  inspectBackupJSON: (jsonStr: string) => Promise<BackupSummary>;
  importBackupJSON: (jsonStr: string) => Promise<BackupSummary>;
  canRestoreLocalBackup: boolean;
  pushAllToCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_AUTH_SESSION = 'STAR_PORTAL_AUTH_SESSION';

// This opt-in is intentionally unavailable in production builds.
const localMode = import.meta.env.DEV && import.meta.env.VITE_ALLOW_LOCAL_MODE === 'true' && !isFirebaseConfigured();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncTracker] = useState(createSessionSyncTracker);
  const syncSnapshot = useSyncExternalStore(syncTracker.subscribe, syncTracker.getSnapshot, syncTracker.getSnapshot);
  const [localPersistenceFailed, setLocalPersistenceFailed] = useState(false);
  useEffect(() => {
    const onFailure = () => setLocalPersistenceFailed(true);
    window.addEventListener('star-ledger-local-save-failed', onFailure);
    return () => window.removeEventListener('star-ledger-local-save-failed', onFailure);
  }, []);
  // Tracked warnings are not a retry queue. Do not claim success until Firestore acknowledges a write.
  const savePRToCloud = (pr: PRRecord): Promise<void> => localMode ? Promise.resolve() : syncTracker.track(`Save PR ${pr.prNumber}`, () => writePRToCloud(pr));
  const saveDCToCloud = (dc: DCRecord): Promise<void> => localMode ? Promise.resolve() : syncTracker.track(`Save DC ${dc.dcNumber}`, () => writeDCToCloud(dc));
  const deletePRFromCloud = (id: string): Promise<void> => localMode ? Promise.resolve() : syncTracker.track(`Delete PR ${id}`, () => removePRFromCloud(id));
  const deleteDCFromCloud = (id: string): Promise<void> => localMode ? Promise.resolve() : syncTracker.track(`Delete DC ${id}`, () => removeDCFromCloud(id));
  // A malformed cache must stop the app rather than be replaced by a cloud snapshot.
  const [prs, setPRs] = useState<PRRecord[]>(getPRs);
  const [dcs, setDCs] = useState<DCRecord[]>(getDCs);
  
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
  const [isDriveSyncOpen, setIsDriveSyncOpen] = useState(false);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; displayName: string } | null>(null);

  useEffect(() => {
    if (localMode) {
      setIsAuthenticated(true);
      setCurrentUser({ username: 'local-admin', role: 'Administrator', displayName: 'Local Administrator (development only)' });
      setIsAuthLoading(false);
      return;
    }
    if (!isFirebaseConfigured()) {
      setAuthError('Secure sign-in is not configured. Contact the portal administrator.');
      setIsAuthLoading(false);
      return;
    }
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (error) {
      console.error('[Auth] Could not initialize Firebase Auth:', error);
      setAuthError('Secure sign-in could not be initialized. Contact the portal administrator.');
      setIsAuthLoading(false);
      return;
    }
    if (!auth) {
      setAuthError('Secure sign-in could not be initialized. Contact the portal administrator.');
      setIsAuthLoading(false);
      return;
    }
    return onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
      setCurrentUser(user ? {
        username: user.email || 'authorized-user',
        role: 'Administrator',
        displayName: user.displayName || user.email?.split('@')[0] || 'Portal User'
      } : null);
      if (user) setAuthError(null);
      setIsAuthLoading(false);
    }, error => {
      console.error('[Auth] Authentication state error:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthError('Unable to verify sign-in. Please try again.');
      setIsAuthLoading(false);
    });
  }, []);

  const [isMobileAccessOpen, setIsMobileAccessOpen] = useState(false);
  const [publicUrl, setPublicUrlState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('star_public_url');
      if (saved) return saved;
      if (typeof window !== 'undefined') {
        return window.location.origin;
      }
      return '';
    } catch {
      return '';
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

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    const auth = getFirebaseAuth();
    if (!auth) {
      const error = 'Secure sign-in is not configured. Contact the portal administrator.';
      setAuthError(error);
      return { success: false, error };
    }

    const cleanEmail = email.trim();
    const finalEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@gmail.com`;

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, finalEmail, password);
      const user = userCredential.user;
      const userData = {
        username: user.email || finalEmail,
        role: 'Administrator',
        displayName: user.displayName || user.email?.split('@')[0] || 'Portal User'
      };
      setIsAuthenticated(true);
      setCurrentUser(userData);
      setAuthError(null);
      return { success: true };
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : '';
      const message = code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password'
        ? 'Email or password is incorrect.'
        : code === 'auth/operation-not-allowed'
          ? 'Email and password sign-in is disabled for this Firebase project.'
          : error instanceof Error
            ? error.message
            : 'Sign-in failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
      localStorage.removeItem('star_auth_session');
      localStorage.removeItem('star_auth_user');
      sessionStorage.removeItem('star_auth_session');
    } catch (error) {
      console.warn('[Auth] Could not clear auth session:', error);
    }

    const auth = getFirebaseAuth();
    if (auth) {
      void signOut(auth).catch(error => {
        console.error('[Auth] Error signing out:', error);
      });
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
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
    if (!isAuthenticated) return;

    let cancelled = false;
    // Hydrate current records, not a stale snapshot captured before cloud updates.
    void initImageMemory().then(() => {
      if (cancelled) return;
      const hydrate = (image: string | undefined) => image?.startsWith('indexeddb:')
        ? getImageFromMemorySync(image.slice('indexeddb:'.length)) || image : image;
      setPRs(prev => prev.map(pr => ({ ...pr, documentImage: hydrate(pr.documentImage) })));
      setDCs(prev => prev.map(dc => ({ ...dc, documentImage: hydrate(dc.documentImage), builtyImage: hydrate(dc.builtyImage), prDocumentImage: hydrate(dc.prDocumentImage) })));
    });

    let unsubPR: (() => void) | null = null;
    let unsubDC: (() => void) | null = null;

    if (!localMode) {
      // Subscribe only while Firebase confirms an authenticated user.
      unsubPR = subscribeToCloudPRs((cloudPRs, metadata) => {
        if (!metadata.fromCache) syncTracker.resolveListener('Live PR updates stopped');
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
      }, () => syncTracker.reportFailure('Live PR updates stopped'));

      unsubDC = subscribeToCloudDCs((cloudDCs, metadata) => {
        if (!metadata.fromCache) syncTracker.resolveListener('Live DC updates stopped');
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
      }, () => syncTracker.reportFailure('Live DC updates stopped'));
    }

    return () => {
      cancelled = true;
      unsubPR?.();
      unsubDC?.();
    };
  }, [isAuthenticated, syncTracker]);

  const updateGeminiApiKey = (key: string) => {
    saveGeminiApiKey(key);
    const active = getGeminiApiKey();
    setGeminiApiKeyState(active);
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

  const updateDC = (updatedDC: DCRecord): boolean => {
    try {
      const { updatedPRs, updatedDCs } = updateDCInStorage(updatedDC);
      setPRs(updatedPRs);
      setDCs(updatedDCs);
      saveDCToCloud(updatedDC).catch(() => {});
      if (selectedPR) {
        const refreshed = updatedPRs.find(p => p.id === selectedPR.id);
        if (refreshed) setSelectedPR(refreshed);
      }
      if (editingDC?.id === updatedDC.id) setEditingDC(updatedDC);
      return true;
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The DC update could not be saved.');
      return false;
    }
  };

  const deletePR = (id: string) => {
    const { updatedPRs, updatedDCs } = deletePRFromStorage(id);
    setPRs(updatedPRs);
    setDCs(updatedDCs);
    deletePRFromCloud(id).catch(() => {});
    updatedDCs.filter(dc => dc.prId === id).forEach(dc => {
      saveDCToCloud(dc).catch(() => {});
    });
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

  // Validate the entire draft set before writing anything. This does not make cloud writes atomic.
  const confirmDeliveryPlan = (drafts: DeliveryDraft[]): boolean => {
    try {
      const { overdeliveries } = planDeliveries(getPRs(), getDCs(), drafts);
      if (!overdeliveries.length) return true;
      const details = overdeliveries.map(item => `${item.dcNumber} / ${item.prNumber}: ${item.item}, ${item.shipped} ${item.unit} (remaining ${item.remaining})`).join('\n');
      return window.confirm(`The following quantities exceed the remaining PR quantity:\n\n${details}\n\nRecord the actual quantities anyway?`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to validate the delivery.');
      return false;
    }
  };

  const recordDeliveryChallan = (
    dcData: Omit<DCRecord, 'id' | 'createdTimestamp'>,
    fulfillmentMap: Record<string, number>
  ): boolean => {
    if (!confirmDeliveryPlan([{ dcData, fulfillmentMap }])) return false;
    try {
      const { updatedPRs, updatedDCs, newDC } = saveDCAndFulfillPR(dcData, fulfillmentMap, { allowOverdelivery: true });
      setPRs(updatedPRs);
      setDCs(updatedDCs);
      saveDCToCloud(newDC).catch(() => {});
      const fulfilledPR = updatedPRs.find(p => p.id === newDC.prId);
      if (fulfilledPR && fulfilledPR.items.some(item => (fulfillmentMap[item.id] || 0) > 0)) savePRToCloud(fulfilledPR).catch(() => {});
      if (selectedPR) {
        const refreshed = updatedPRs.find(p => p.id === selectedPR.id);
        if (refreshed) setSelectedPR(refreshed);
      }
      return true;
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not record the delivery. Verify the ledger before retrying.');
      return false;
    }
  };

  const recordMultipleDeliveryChallans = (dcList: DeliveryDraft[]): boolean => {
    if (!confirmDeliveryPlan(dcList)) return false;
    try {
      const { updatedPRs, updatedDCs, newDCs } = saveMultipleDCsAndFulfillPRs(dcList, { allowOverdelivery: true });
      setPRs(updatedPRs);
      setDCs(updatedDCs);
      newDCs.forEach(dc => saveDCToCloud(dc).catch(() => {}));
      const affectedIds = new Set(newDCs.filter((dc, index) => {
        const pr = updatedPRs.find(item => item.id === dc.prId);
        return pr?.items.some(item => (dcList[index].fulfillmentMap[item.id] || 0) > 0);
      }).map(dc => dc.prId));
      updatedPRs.filter(pr => affectedIds.has(pr.id)).forEach(pr => savePRToCloud(pr).catch(() => {}));
      if (selectedPR) {
        const refreshed = updatedPRs.find(p => p.id === selectedPR.id);
        if (refreshed) setSelectedPR(refreshed);
      }
      return true;
    } catch (error) {
      window.alert(`The batch may be partially recorded. Check the ledger before retrying. ${error instanceof Error ? error.message : ''}`);
      return false;
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

  const exportBackupJSON = async (): Promise<BackupSummary> => {
    const { json, summary } = await createDeviceBackup(prs, dcs);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `StarElectric_DeviceBackup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
    return summary;
  };

  const inspectBackupJSON = async (jsonStr: string): Promise<BackupSummary> =>
    (await verifyDeviceBackup(jsonStr)).summary;

  const pushAllToCloud = async (): Promise<void> => {
    throw new Error('Bulk push is disabled until conflict-safe reconciliation is available. It could overwrite newer cloud data.');
  };

  const importBackupJSON = async (jsonStr: string): Promise<BackupSummary> => {
    if (!localMode) throw new Error('Restore is permitted only in an isolated development-only local session with Firebase unconfigured.');
    const { payload, summary } = await verifyDeviceBackup(jsonStr);
    if (summary.missingLocalReferences > 0) throw new Error('This backup has missing local scan references and cannot be restored as a complete device backup.');
    await restoreDeviceBackup(payload);
    await initImageMemory();
    setPRs(getPRs());
    setDCs(getDCs());
    return summary;
  };

  return (
    <AppContext.Provider
      value={{
        prs,
        dcs,
        setDCs,
        saveDCToCloud,
        cloudSyncIssues: syncSnapshot.issues,
        syncTrackingUnavailable: syncSnapshot.trackingUnavailable,
        localPersistenceFailed,
        isLocalOnlyMode: localMode,
        acknowledgeCloudSyncIssue: (id: string) => syncTracker.acknowledge(id),
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
        isDriveSyncOpen,
        setIsDriveSyncOpen,
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
        inspectBackupJSON,
        importBackupJSON,
        canRestoreLocalBackup: localMode,
        pushAllToCloud,
        isAuthenticated,
        isAuthLoading,
        authError,
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
