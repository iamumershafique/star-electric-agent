import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentClassificationError, fileToBase64 } from '../lib/gemini';
import { getActiveOCRProvider, getOCREngineLabel, processDCWithAI } from '../lib/aiOcr';
import type { BrandCategory, PRRecord, TransportType } from '../types';
import { 
  X, 
  Truck, 
  FileCheck, 
  Building2, 
  Calendar, 
  AlertCircle,
  Hash,
  CheckCircle2,
  Sparkles,
  Loader2,
  CheckSquare,
  Square,
  RefreshCw,
  PlusCircle,
  Layers,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DraftItem {
  id: string;
  name: string;
  brand: BrandCategory;
  requestedQty: number;
  fulfilledQty: number;
  shippedQty: number;
  unit: string;
  maxRemaining: number;
}

interface ScannedDCDraft {
  id: string;
  dcNumber: string;
  invoiceNumber: string;
  prNumber: string;
  selectedPrId: string;
  date: string;
  siteName: string;
  transportType: TransportType;
  addaName: string;
  biltyNumber: string;
  freightCharges: string;
  isFreightFree: boolean;
  driverName: string;
  vehicleNumber: string;
  remarks: string;
  items: DraftItem[];
  documentImage?: string;
  prDocumentImage?: string;
}

  const normalizeReference = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special chars but keep spaces
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  };

  const calculateSimilarity = (s1: string, s2: string) => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

  const editDistance = (s1: string, s2: string) => {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue: number = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j] = newValue;
          lastValue = newValue;
        }
      }
    }
    return costs[s2.length];
  };

const createDefaultDraft = (targetPR?: PRRecord | null): ScannedDCDraft => {
  const today = new Date().toISOString().split('T')[0];
  if (targetPR) {
    const initialItems: DraftItem[] = (targetPR.items || []).map(it => {
      const remaining = Math.max(0, it.requestedQty - it.fulfilledQty);
      return {
        id: it.id,
        name: it.name,
        brand: it.brand,
        requestedQty: it.requestedQty,
        fulfilledQty: it.fulfilledQty,
        shippedQty: 0,
        unit: it.unit,
        maxRemaining: remaining
      };
    });

    return {
      id: `draft-${Date.now()}`,
      dcNumber: '',
      invoiceNumber: '',
      prNumber: targetPR.prNumber,
      selectedPrId: targetPR.id,
      date: today,
      siteName: targetPR.siteName || 'Rawat Warehouse',
      transportType: 'Adda / Goods Transport',
      addaName: 'Rawalpindi Goods Transport Adda',
      biltyNumber: '',
      freightCharges: '0',
      isFreightFree: true,
      driverName: 'Nawaz',
      vehicleNumber: 'STS-1500',
      remarks: '',
      items: initialItems
    };
  }

  return {
    id: `draft-${Date.now()}`,
    dcNumber: '',
    invoiceNumber: '',
    prNumber: '',
    selectedPrId: '',
    date: today,
    siteName: 'Jadeed Group Site',
    transportType: 'Delivered',
    addaName: '',
    biltyNumber: '',
    freightCharges: '0',
    isFreightFree: true,
    driverName: '',
    vehicleNumber: '',
    remarks: '',
    items: []
  };
};

export const DCUploadModal: React.FC = () => {
  const { 
    isDCUploadOpen, 
    setIsDCUploadOpen, 
    setIsPRUploadOpen,
    prs, 
    dcs,
    targetDC_PR, 
    recordDeliveryChallan,
    recordMultipleDeliveryChallans,
    geminiApiKey,
    setActiveTab,
    setIsSettingsOpen
  } = useApp();

  const [activeMode, setActiveMode] = useState<'scan' | 'manual'>('scan');
  const [drafts, setDrafts] = useState<ScannedDCDraft[]>([createDefaultDraft(targetDC_PR)]);
  const [activeDraftIndex, setActiveDraftIndex] = useState<number>(0);
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; fileName: string; percent: number; status?: string } | null>(null);
  const [scanAnalysisNote, setScanAnalysisNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Item creation state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemBrand, setNewItemBrand] = useState<BrandCategory>('Pakistan Cables');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>('Numbers');
  const activeOCRProvider = getActiveOCRProvider(geminiApiKey);
  const ocrEngine = getOCREngineLabel(activeOCRProvider);

  // Initialize draft when modal opens
  useEffect(() => {
    if (!isDCUploadOpen) return;
    setActiveMode(targetDC_PR ? 'manual' : 'scan');
    const newDrafts = [createDefaultDraft(targetDC_PR)];
    setDrafts(newDrafts);
    setActiveDraftIndex(0);
    setErrorMsg(null);
    setScanAnalysisNote(null);
    setScanProgress(null);
  }, [targetDC_PR, isDCUploadOpen]);

  if (!isDCUploadOpen) return null;

  // Ensure drafts is never empty and currentDraft is always valid
  const safeDrafts = drafts && drafts.length > 0 ? drafts : [createDefaultDraft(targetDC_PR)];
  const safeActiveDraftIndex = Math.min(Math.max(activeDraftIndex, 0), safeDrafts.length - 1);
  const currentDraft = safeDrafts[safeActiveDraftIndex] || createDefaultDraft(targetDC_PR);

  // Helper to update current active draft
  const updateCurrentDraft = (updater: (prev: ScannedDCDraft) => ScannedDCDraft) => {
    setDrafts(prev => {
      const working = prev && prev.length > 0 ? prev : [createDefaultDraft(targetDC_PR)];
      const next = [...working];
      const idx = Math.min(Math.max(activeDraftIndex, 0), next.length - 1);
      if (next[idx]) {
        next[idx] = updater(next[idx]);
      }
      return next;
    });
  };

  const handleAddItemToCurrentDraft = () => {
    if (!newItemName.trim()) {
      setErrorMsg('Item description is required.');
      return;
    }
    const qty = Math.max(1, newItemQty || 1);
    const newItem: DraftItem = {
      id: `item-manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newItemName.trim(),
      brand: newItemBrand,
      requestedQty: qty,
      fulfilledQty: 0,
      shippedQty: qty,
      unit: newItemUnit || 'Numbers',
      maxRemaining: qty
    };
    updateCurrentDraft(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setNewItemName('');
    setNewItemQty(1);
    setIsAddingItem(false);
    setErrorMsg(null);
  };

  const handleRemoveItem = (itemId: string) => {
    updateCurrentDraft(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== itemId)
    }));
  };

  const handleDCFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = Array.from(e.target.files || []);
    if (filesList.length === 0) return;

    setIsScanning(true);
    setScanProgress({
      current: 0,
      total: filesList.length,
      fileName: '',
      percent: 0,
      status: `Preparing ${filesList.length} Delivery Challan file(s)...`
    });
    setErrorMsg(null);
    setScanAnalysisNote(null);

    try {
      const filePayloads = await Promise.all(
        filesList.map(async f => ({
          base64: await fileToBase64(f),
          name: f.name
        }))
      );

      // Provide active PR memory to Gemini so it can accurately recognize handwritten PR numbers and sites
      const prSummaryMemory = prs.slice(0, 50).map(p => 
        `- PR Number: ${p.prNumber} | Site: "${p.siteName}" | Items: ${p.items.map(it => `${it.name} (${it.requestedQty} ${it.unit})`).join(', ')}`
      ).join('\n');

      const results = await processDCWithAI(
        filePayloads, 
        geminiApiKey, 
        (prog) => {
          setScanProgress({
            current: prog.current,
            total: prog.total,
            fileName: prog.fileName,
            percent: Math.round((prog.current / prog.total) * 100),
            status: prog.status
          });
        },
        prSummaryMemory
      );

      if (!results || results.length === 0) {
        throw new Error('No delivery challan data extracted.');
      }

      // Duplicate check for extracted DCs
      const duplicateDCs = results.filter(res => {
        const dcNum = res.dcNumber?.trim().toUpperCase();
        const digitsOnly = (value: string) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
        return dcNum && dcs.some(existing => existing.dcNumber.toUpperCase() === dcNum ||
          (digitsOnly(existing.dcNumber) !== '' && digitsOnly(existing.dcNumber) === digitsOnly(dcNum)));
      });

      if (duplicateDCs.length > 0) {
        const dupNumbers = duplicateDCs.map(d => d.dcNumber).join(', ');
        setScanAnalysisNote(`⚠️ Warning: The following DC(s) already exist in the system: ${dupNumbers}. They will be added as drafts for your review, but you may want to edit them.`);
      }

      // Convert each extracted DC into a ScannedDCDraft
      const newDrafts: ScannedDCDraft[] = results.map((res, index) => {
        const rawDcNum = res.dcNumber?.trim() || '';
        if (!rawDcNum) throw new Error(`DC number could not be read from document ${index + 1}; no record was saved.`);
        const dcNum = rawDcNum.toUpperCase().startsWith('DC-') ? rawDcNum.toUpperCase() : `DC-${rawDcNum.replace(/[^0-9a-zA-Z]/g, '')}`;
        const rawPrNum = res.prNumber?.trim() || '';

        const matchedPR = rawPrNum
          ? prs.find(p => normalizeReference(p.prNumber) === normalizeReference(rawPrNum))
          : undefined;
        const scannedItems = res.shippedItems || [];
        const draftItems: DraftItem[] = scannedItems.map((shipped, itemIndex) => {
          const matchedItem = matchedPR?.items.find(item => {
            const score = calculateSimilarity(normalizeReference(item.name), normalizeReference(shipped.itemName));
            return score > 0.8; // Fuzzy match threshold
          });
          const remaining = matchedItem
            ? Math.max(0, matchedItem.requestedQty - matchedItem.fulfilledQty)
            : shipped.quantityShipped;
          return {
            id: matchedItem?.id || `item-scanned-${Date.now()}-${index}-${itemIndex}`,
            name: matchedItem?.name || shipped.itemName,
            brand: (matchedItem?.brand || shipped.brand || 'General Electrical') as BrandCategory,
            requestedQty: matchedItem?.requestedQty ?? shipped.quantityShipped,
            fulfilledQty: matchedItem?.fulfilledQty ?? 0,
            shippedQty: shipped.quantityShipped,
            unit: matchedItem?.unit || shipped.unit || 'Numbers',
            maxRemaining: remaining
          };
        });

        const dcImg = filePayloads[index]?.base64 || '';
        const prImg = matchedPR?.documentImage || '';

        return {
          id: `scanned-draft-${Date.now()}-${index}`,
          dcNumber: dcNum,
          invoiceNumber: dcNum,
          prNumber: matchedPR?.prNumber || rawPrNum,
          selectedPrId: matchedPR?.id || '',
          date: res.date || new Date().toISOString().split('T')[0],
          siteName: res.siteName || matchedPR?.siteName || 'Jadeed Group Site',
          transportType: 'Delivered',
          addaName: '',
          biltyNumber: '',
          freightCharges: '0',
          isFreightFree: true,
          driverName: '',
          vehicleNumber: '',
          remarks: res.remarks || '',
          items: draftItems,
          documentImage: dcImg,
          prDocumentImage: prImg
        };
      });

      setDrafts(newDrafts);
      setActiveDraftIndex(0);
      setScanAnalysisNote(`✓ Verified ${newDrafts.length} Delivery Challan document(s). Review extracted details and quantities before recording.`);
    } catch (err: any) {
      console.error('DC OCR Scanning error:', err);
      if (err instanceof DocumentClassificationError) {
        if (err.documentType === 'PURCHASE_REQUISITION') {
          setIsDCUploadOpen(false);
          setIsPRUploadOpen(true);
          alert(`${err.message} Please select the same file again in the Purchase Requisition uploader.`);
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg(`Could not verify the uploaded Delivery Challan(s): ${err?.message || 'Unknown scanning error.'}`);
        setActiveMode('manual');
      }
    } finally {
      setIsScanning(false);
      setScanProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectPR = (val: string) => {
    const selected = prs.find(p => p.id === val);
    if (!selected) {
      updateCurrentDraft(prev => ({
        ...prev,
        selectedPrId: '',
        prNumber: ''
      }));
      return;
    }

    updateCurrentDraft(prev => {
      const mappedItems: DraftItem[] = selected.items.map(item => {
          const scanned = prev.items.find(draftItem => {
            const score = calculateSimilarity(normalizeReference(draftItem.name), normalizeReference(item.name));
            return score > 0.8;
          });

        return {
          id: item.id,
          name: item.name,
          brand: item.brand,
          requestedQty: item.requestedQty,
          fulfilledQty: item.fulfilledQty,
          shippedQty: scanned?.shippedQty || 0,
          unit: item.unit,
          maxRemaining: Math.max(0, item.requestedQty - item.fulfilledQty)
        };
      });
          const matchedDraftNames = new Set(selected.items.map(item => normalizeReference(item.name)));
          const unverifiedScannedItems = prev.items.filter(item => {
            const itemNorm = normalizeReference(item.name);
            return !Array.from(matchedDraftNames).some(dn => calculateSimilarity(dn, itemNorm) > 0.8);
          });


      return {
        ...prev,
        selectedPrId: selected.id,
        prNumber: selected.prNumber,
        siteName: selected.siteName,
        items: [...mappedItems, ...unverifiedScannedItems]
      };
    });
  };

  const handleBulkMarkAllDelivered = () => {
    updateCurrentDraft(prev => ({
      ...prev,
      items: prev.items.map(it => ({
        ...it,
        shippedQty: it.maxRemaining > 0 ? it.maxRemaining : (it.requestedQty > 0 ? it.requestedQty : 1)
      }))
    }));
  };

  const handleBulkResetAllUndelivered = () => {
    updateCurrentDraft(prev => ({
      ...prev,
      items: prev.items.map(it => ({
        ...it,
        shippedQty: 0
      }))
    }));
  };

  const handleToggleItemDelivered = (itemId: string) => {
    updateCurrentDraft(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId) {
          const targetQty = it.maxRemaining > 0 ? it.maxRemaining : (it.requestedQty > 0 ? it.requestedQty : 1);
          return {
            ...it,
            shippedQty: it.shippedQty > 0 ? 0 : targetQty
          };
        }
        return it;
      })
    }));
  };

  const handleQtyChange = (itemId: string, value: number) => {
    const val = Math.max(0, value);
    updateCurrentDraft(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === itemId ? { ...it, shippedQty: val } : it)
    }));
  };

  const handleRemoveDraft = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (drafts.length <= 1) return;
    const nextDrafts = drafts.filter((_, i) => i !== idx);
    setDrafts(nextDrafts);
    setActiveDraftIndex(Math.max(0, Math.min(activeDraftIndex, nextDrafts.length - 1)));
  };

  // Submit only current active draft
  const handleSubmitSingle = () => {
    setErrorMsg(null);
    if (!currentDraft.dcNumber.trim()) {
      setErrorMsg('Delivery Challan (DC) Number is required.');
      return;
    }

    const hasItemsToShip = currentDraft.items.some(q => q.shippedQty > 0);
    if (!hasItemsToShip) {
      setErrorMsg('Please enter a shipped quantity greater than 0 for at least one line item.');
      return;
    }

    // Validation: Check if any shipped quantity exceeds the remaining requested quantity
    const overshippedItems = currentDraft.items.filter(it => it.shippedQty > it.maxRemaining && currentDraft.selectedPrId !== '');
    if (overshippedItems.length > 0) {
      const itemNames = overshippedItems.map(it => it.name).join(', ');
      if (!window.confirm(`Warning: The following items exceed the remaining requested quantity: ${itemNames}. Do you want to proceed anyway?`)) {
        return;
      }
    }

    const cleanDC = currentDraft.dcNumber.trim().toUpperCase();
    const fulfillmentMap: Record<string, number> = {};
    currentDraft.items.forEach(it => {
      if (it.shippedQty > 0) fulfillmentMap[it.id] = it.shippedQty;
    });

    recordDeliveryChallan(
      {
        dcNumber: cleanDC,
        invoiceNumber: cleanDC,
        prNumber: currentDraft.prNumber.trim().toUpperCase(),
        prId: currentDraft.selectedPrId,
        date: currentDraft.date,
        siteName: currentDraft.siteName,
        itemsShipped: currentDraft.items.filter(it => it.shippedQty > 0).map(it => ({
          itemId: it.id,
          itemName: it.name,
          brand: it.brand,
          quantity: it.shippedQty,
          unit: it.unit
        })),
        transportType: currentDraft.transportType,
        addaName: currentDraft.transportType === 'Adda / Goods Transport' ? currentDraft.addaName.trim() : undefined,
        biltyNumber: currentDraft.transportType === 'Adda / Goods Transport' ? currentDraft.biltyNumber.trim() : undefined,
        freightCharges: currentDraft.isFreightFree ? 0 : (parseFloat(currentDraft.freightCharges) || 0),
        isFreightFree: currentDraft.isFreightFree,
        driverName: currentDraft.transportType === 'Pickup / Driver' ? currentDraft.driverName.trim() : undefined,
        vehicleNumber: currentDraft.transportType === 'Pickup / Driver' ? currentDraft.vehicleNumber.trim() : undefined,
        remarks: currentDraft.remarks.trim() || (currentDraft.transportType === 'Adda / Goods Transport' ? `Sent via ${currentDraft.addaName}` : `Dispatched via ${currentDraft.driverName}`),
        documentImage: currentDraft.documentImage,
        prDocumentImage: currentDraft.prDocumentImage
      },
      fulfillmentMap
    );

    if (drafts.length > 1) {
      const remaining = drafts.filter((_, i) => i !== activeDraftIndex);
      setDrafts(remaining);
      setActiveDraftIndex(0);
      setScanAnalysisNote(`✓ Successfully recorded ${cleanDC}. ${remaining.length} DC(s) remaining to review.`);
    } else {
      setIsDCUploadOpen(false);
      setActiveTab('deliveries');
    }
  };

  // Submit all drafts in batch
  const handleSubmitAll = () => {
    setErrorMsg(null);

    // Validate all drafts
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      if (!d.dcNumber.trim()) {
        setErrorMsg(`Draft #${i + 1} is missing a Delivery Challan (DC) Number.`);
        setActiveDraftIndex(i);
        return;
      }
      const hasItems = d.items.some(it => it.shippedQty > 0);
      if (!hasItems) {
        setErrorMsg(`Draft #${i + 1} (${d.dcNumber}) has no items selected for delivery.`);
        setActiveDraftIndex(i);
        return;
      }
    }

    const batchList = drafts.map(d => {
      const cleanDC = d.dcNumber.trim().toUpperCase();
      const fulfillmentMap: Record<string, number> = {};
      d.items.forEach(it => {
        if (it.shippedQty > 0) fulfillmentMap[it.id] = it.shippedQty;
      });

      return {
        dcData: {
          dcNumber: cleanDC,
          invoiceNumber: cleanDC,
          prNumber: d.prNumber.trim().toUpperCase(),
          prId: d.selectedPrId,
          date: d.date,
          siteName: d.siteName,
          itemsShipped: d.items.filter(it => it.shippedQty > 0).map(it => ({
            itemId: it.id,
            itemName: it.name,
            brand: it.brand,
            quantity: it.shippedQty,
            unit: it.unit
          })),
          transportType: d.transportType,
          addaName: d.transportType === 'Adda / Goods Transport' ? d.addaName.trim() : undefined,
          biltyNumber: d.transportType === 'Adda / Goods Transport' ? d.biltyNumber.trim() : undefined,
          freightCharges: d.isFreightFree ? 0 : (parseFloat(d.freightCharges) || 0),
          isFreightFree: d.isFreightFree,
          driverName: d.transportType === 'Pickup / Driver' ? d.driverName.trim() : undefined,
          vehicleNumber: d.transportType === 'Pickup / Driver' ? d.vehicleNumber.trim() : undefined,
          remarks: d.remarks.trim() || (d.transportType === 'Adda / Goods Transport' ? `Sent via ${d.addaName}` : `Dispatched via ${d.driverName}`),
          documentImage: d.documentImage,
          prDocumentImage: d.prDocumentImage
        },
        fulfillmentMap
      };
    });

    recordMultipleDeliveryChallans(batchList);
    setIsDCUploadOpen(false);
    setActiveTab('deliveries');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Delivery Challan & Invoice Management
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  DC # = Invoice #
                </span>
                {activeOCRProvider !== 'None' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live {activeOCRProvider} OCR
                  </span>
                ) : (
                  <button
                    onClick={() => { setIsDCUploadOpen(false); setIsSettingsOpen(true); }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Click to configure an AI OCR provider"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Configure OCR
                  </button>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Auto-extract DC Number, PR Reference, Site Destination & Shipped Items from Challans
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDCUploadOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Modes Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMode('manual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'manual'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-200" />
              Manual / Quick Dispatch
            </button>

            <button
              onClick={() => {
                setActiveMode('scan');
                fileInputRef.current?.click();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'scan'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              Scan DC Image(s) via {ocrEngine}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDCFileScan}
              accept="image/*,.pdf"
              multiple
              className="hidden"
            />
          </div>

          {drafts.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>{drafts.length} Challans Ready</span>
            </div>
          )}
        </div>

        {/* Scanned Multiple DCs Tabs / Selector */}
        {drafts.length > 1 && (
          <div className="space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700">
                  Challan {activeDraftIndex + 1} of {drafts.length}:
                </span>
                <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {currentDraft.dcNumber || `DC #${activeDraftIndex + 1}`}
                </span>
                {currentDraft.prNumber && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    {currentDraft.prNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveDraftIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeDraftIndex === 0}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-0.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <select
                  value={activeDraftIndex}
                  onChange={(e) => setActiveDraftIndex(parseInt(e.target.value, 10))}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 max-w-[150px] truncate"
                >
                  {drafts.map((d, i) => (
                    <option key={d.id} value={i}>
                      #{i + 1}: {d.dcNumber || `DC #${i + 1}`} {d.prNumber ? `(${d.prNumber})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setActiveDraftIndex(prev => Math.min(drafts.length - 1, prev + 1))}
                  disabled={activeDraftIndex === drafts.length - 1}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-0.5"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-shrink-0">
              {drafts.map((d, idx) => {
                const isActive = idx === activeDraftIndex;
                return (
                  <div
                    key={d.id}
                    onClick={() => setActiveDraftIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="text-left">
                      <p className="font-mono font-extrabold leading-tight">{d.dcNumber || `DC #${idx + 1}`}</p>
                      <p className="text-[10px] font-medium text-slate-500 truncate max-w-[130px]">
                        {d.prNumber || d.siteName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveDraft(idx, e)}
                      className="p-1 hover:text-rose-600 text-slate-400 rounded-md transition-colors"
                      title="Remove this DC"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {activeMode === 'scan' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const inputEvent = { target: { files: e.dataTransfer.files } } as any;
                  handleDCFileScan(inputEvent);
                }
              }}
              className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group shadow-xs"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-md group-hover:scale-105 transition-transform">
                <Truck className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-2">
                  Upload / Drop Delivery Challan Pictures
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                    Mark Delivered
                  </span>
                </h4>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto mt-1">
                  Upload photo(s) of Star Electric Challans (e.g. DC-674, DC-673, DC-668, DC-667, DC-666).
                  The system will automatically record them as <strong className="text-emerald-800 font-extrabold">DELIVERED</strong> and display them immediately in the DC section!
                </p>
              </div>

              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all pointer-events-none"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                Select DC Pictures / Files
              </button>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold pt-2 border-t border-emerald-200/60">
                <span>✓ Auto-extracts DC & PR Numbers</span>
                <span>•</span>
                <span>✓ Automatically marks items as Delivered</span>
                <span>•</span>
                <span>✓ Live in DC Section</span>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Processing Delivery Challans via {ocrEngine}...</span>
                </div>
                {scanProgress && (
                  <span className="font-mono font-extrabold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md text-[11px]">
                    {scanProgress.current} / {scanProgress.total} ({scanProgress.percent}%)
                  </span>
                )}
              </div>

              {scanProgress && (
                <>
                  <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(5, scanProgress.percent)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium truncate">
                    {scanProgress.status || `Processing: ${scanProgress.fileName}`}
                  </p>
                </>
              )}
            </div>
          )}

          {scanAnalysisNote && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{scanAnalysisNote}</span>
            </div>
          )}

          {/* DC & PR Header Identification */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DC Number Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Hash className="w-3.5 h-3.5 text-emerald-600" /> Delivery Challan (DC) #
                  <span className="text-[10px] text-slate-400 font-normal">(Printed next to "No.")</span>
                </label>
                <input
                  type="text"
                  value={currentDraft.dcNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentDraft(prev => ({
                      ...prev,
                      dcNumber: val,
                      invoiceNumber: val
                    }));
                  }}
                  placeholder="e.g. DC-674"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              {/* Invoice # */}
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" /> Invoice # (Manual Entry)
                  </label>
                  <input
                    type="text"
                    value={currentDraft.invoiceNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentDraft(prev => ({
                        ...prev,
                        invoiceNumber: val
                      }));
                    }}
                    placeholder="e.g. INV-123"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    Commonly matches DC #, but can be edited manually.
                  </span>
                </div>

            </div>

            {/* Target PR Selection */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  Target Purchase Requisition (PR Assignment)
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  {currentDraft.selectedPrId ? 'Linked to existing PR' : 'No PR link confirmed'}
                </span>
              </div>

              <select
                value={currentDraft.selectedPrId}
                onChange={(e) => handleSelectPR(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-xs focus:outline-none focus:border-amber-500 shadow-2xs"
              >
                <option value="">Unlinked — choose an existing PR only</option>
                <optgroup label="Existing Purchase Requisitions">
                  {prs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.prNumber} • {p.siteName} ({p.status})
                    </option>
                  ))}
                </optgroup>
              </select>

              <div className="text-xs text-slate-600 flex flex-wrap gap-4 pt-1 font-medium">
                <span className="flex items-center gap-1 text-slate-900 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> {currentDraft.siteName}
                </span>
                {currentDraft.prNumber && <span>Target PR: <strong className="text-slate-900">{currentDraft.prNumber}</strong></span>}
              </div>
            </div>
          </div>

          {/* Transport & Date Details */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                Goods Transport & Dispatch Method
              </label>

              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Date:
                </label>
                <input
                  type="date"
                  value={currentDraft.date}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentDraft(prev => ({ ...prev, date: val }));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateCurrentDraft(prev => ({ ...prev, transportType: 'Delivered' }))}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1 cursor-pointer ${
                  currentDraft.transportType === 'Delivered'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ✅ Delivered (ڈیلیورڈ)
              </button>

              <button
                type="button"
                onClick={() => updateCurrentDraft(prev => ({ ...prev, transportType: 'Adda / Goods Transport' }))}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1 cursor-pointer ${
                  currentDraft.transportType === 'Adda / Goods Transport'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                🚚 Adda Transport (اڈا)
              </button>

              <button
                type="button"
                onClick={() => updateCurrentDraft(prev => ({ ...prev, transportType: 'Pickup / Driver' }))}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1 cursor-pointer ${
                  currentDraft.transportType === 'Pickup / Driver'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                🚗 Driver / Truck (پک اپ)
              </button>
            </div>

            {currentDraft.transportType === 'Delivered' && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Status set to <strong>Delivered</strong> without pre-linking transport. You can enter carrier, bilty, or vehicle details manually anytime.</span>
              </div>
            )}

            {currentDraft.transportType === 'Adda / Goods Transport' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Adda / Transport Name (اڈے کا نام)
                    </label>
                    <input
                      type="text"
                      value={currentDraft.addaName}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentDraft(prev => ({ ...prev, addaName: val }));
                      }}
                      placeholder="e.g. Rawalpindi Goods Transport"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Bilty Number (بلٹی نمبر)
                    </label>
                    <input
                      type="text"
                      value={currentDraft.biltyNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCurrentDraft(prev => ({ ...prev, biltyNumber: val }));
                      }}
                      placeholder="e.g. BL-7891"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-800">Freight / Transport Charges (کرایہ):</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                      <input
                        type="checkbox"
                        checked={currentDraft.isFreightFree}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          updateCurrentDraft(prev => ({
                            ...prev,
                            isFreightFree: checked,
                            freightCharges: checked ? '0' : prev.freightCharges
                          }));
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      FREE / مفت کرایہ
                    </label>

                    {!currentDraft.isFreightFree && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-600">PKR</span>
                        <input
                          type="number"
                          min={0}
                          value={currentDraft.freightCharges}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentDraft(prev => ({ ...prev, freightCharges: val }));
                          }}
                          placeholder="Amount"
                          className="w-28 px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Driver Name (ڈرائیور کا نام)
                  </label>
                  <input
                    type="text"
                    value={currentDraft.driverName}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentDraft(prev => ({ ...prev, driverName: val }));
                    }}
                    placeholder="e.g. Nawaz"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Vehicle Number (گاڑی نمبر)
                  </label>
                  <input
                    type="text"
                    value={currentDraft.vehicleNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateCurrentDraft(prev => ({ ...prev, vehicleNumber: val }));
                    }}
                    placeholder="e.g. STS-1500"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Remarks / Handwritten Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">
                Challan Remarks / Transport Notes (e.g. Direct Delivery by PCL)
              </label>
              <input
                type="text"
                value={currentDraft.remarks}
                onChange={(e) => {
                  const val = e.target.value;
                  updateCurrentDraft(prev => ({ ...prev, remarks: val }));
                }}
                placeholder="e.g. Direct Delivery by PCL"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Line Items Shipped on {currentDraft.dcNumber || 'this Challan'} ({currentDraft.items.length})
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkMarkAllDelivered}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-xs"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Mark All Delivered
                </button>

                <button
                  type="button"
                  onClick={handleBulkResetAllUndelivered}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset All
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingItem(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>
            </div>

            {/* Inline add item form */}
            {isAddingItem && (
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-amber-700" /> Add Custom / Additional Line Item
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="text-amber-800 hover:text-amber-950 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Item Description (e.g. 4 Core 16mm² Cable)"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <select
                      value={newItemBrand}
                      onChange={(e) => setNewItemBrand(e.target.value as BrandCategory)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-600"
                    >
                      <option value="Pakistan Cables">Pakistan Cables</option>
                      <option value="Schneider Electric">Schneider Electric</option>
                      <option value="FAST Cables">FAST Cables</option>
                      <option value="Newage Cables">Newage Cables</option>
                      <option value="Pioneer Cables">Pioneer Cables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0.1}
                      step="any"
                      placeholder="Qty"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-amber-600"
                    />
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="w-24 px-2 py-1.5 rounded-lg bg-white border border-amber-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-600"
                    >
                      <option value="Meters">Meters</option>
                      <option value="Numbers">Numbers</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Coils">Coils</option>
                      <option value="Kg">Kg</option>
                      <option value="Sets">Sets</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddItemToCurrentDraft}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentDraft.items.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs space-y-2">
                <p>No items on this Challan yet.</p>
                <button
                  type="button"
                  onClick={() => setIsAddingItem(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Add First Line Item
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full min-w-[640px] text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3 w-10 text-center">Set</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3 text-center">Reference Qty</th>
                      <th className="p-3 w-32 text-center">Ship Now</th>
                      <th className="p-3 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {currentDraft.items.map((item) => {
                      const isFull = item.shippedQty > 0 && item.shippedQty >= item.maxRemaining && item.maxRemaining > 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleItemDelivered(item.id)}
                              className="p-1 text-slate-500 hover:text-emerald-700 transition-colors"
                              title={isFull ? 'Mark as Undelivered' : 'Mark as Delivered'}
                            >
                              {isFull ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{item.name}</td>
                          <td className="p-3 text-slate-600 font-semibold">{item.brand}</td>
                          <td className="p-3 text-center font-mono font-bold">
                            {item.maxRemaining} {item.unit}
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.shippedQty}
                              onChange={(e) => handleQtyChange(item.id, parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-center text-emerald-700 font-extrabold font-mono text-sm focus:outline-none focus:border-emerald-600"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Remove item from this Challan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={() => setIsDCUploadOpen(false)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {drafts.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={handleSubmitSingle}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
                >
                  Record Only This DC ({currentDraft.dcNumber || `#${activeDraftIndex + 1}`})
                </button>

                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Record All ({drafts.length}) Delivery Challans
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSubmitSingle}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Issue DC & Invoice ({currentDraft.dcNumber || 'DC'})
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
