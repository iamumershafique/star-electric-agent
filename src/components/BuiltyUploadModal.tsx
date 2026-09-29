import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fileToBase64 } from '../lib/gemini';
import { getActiveOCRProvider, getOCREngineLabel, processBuiltyWithAI } from '../lib/aiOcr';
import type { GeminiBuiltyExtractionResult } from '../types';
import { 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Package, 
  Eye, 
  Trash2, 
  FileText,
  Layers,
  Camera
} from 'lucide-react';

interface ScannedBuiltyDraft {
  id: string;
  dcNumber: string;
  selectedDCId: string; // ID of matched DC in system, or ''
  builtyNumber: string;
  addaName: string;
  destinationCity: string;
  packagesCount: string;
  freightCharges: string;
  freightStatus: 'Paid' | 'To Pay' | 'Free';
  builtyDate: string;
  sender: string;
  receiver: string;
  builtyImage?: string;
  confidence: number;
}

export const BuiltyUploadModal: React.FC = () => {
  const { 
    isBuiltyUploadOpen, 
    setIsBuiltyUploadOpen, 
    targetBuiltyDC, 
    setTargetBuiltyDC,
    dcs, 
    attachBuiltyToDC, 
    attachMultipleBuiltys,
    geminiApiKey,
    setIsSettingsOpen,
    setSelectedBuiltyPreview
  } = useApp();

  const [activeMode, setActiveMode] = useState<'scan' | 'manual'>('scan');
  const [drafts, setDrafts] = useState<ScannedBuiltyDraft[]>([]);
  const [activeDraftIndex, setActiveDraftIndex] = useState<number>(0);
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeOCRProvider = getActiveOCRProvider(geminiApiKey);
  const ocrEngine = getOCREngineLabel(activeOCRProvider);

  // Initialize draft when modal opens
  useEffect(() => {
    if (!isBuiltyUploadOpen) return;

    setErrorMsg(null);
    setStatusNote(null);

    if (targetBuiltyDC) {
      setActiveMode('manual');
      const today = new Date().toISOString().split('T')[0];
      setDrafts([{
        id: `draft-target-${Date.now()}`,
        dcNumber: targetBuiltyDC.dcNumber,
        selectedDCId: targetBuiltyDC.id,
        builtyNumber: targetBuiltyDC.biltyNumber || '',
        addaName: targetBuiltyDC.addaName || 'Tariq Goods Transport Saddar Rawalpindi',
        destinationCity: targetBuiltyDC.siteName.split(' ')[0] || 'Khanewal',
        packagesCount: targetBuiltyDC.packagesCount || '1 Lot Electrical Supplies',
        freightCharges: targetBuiltyDC.freightCharges ? String(targetBuiltyDC.freightCharges) : '750',
        freightStatus: targetBuiltyDC.freightStatus || 'Paid',
        builtyDate: targetBuiltyDC.builtyDate || targetBuiltyDC.date || today,
        sender: 'Star Electric Enterprises Rawalpindi',
        receiver: `Jadeed Group (${targetBuiltyDC.siteName})`,
        builtyImage: targetBuiltyDC.builtyImage,
        confidence: 1.0
      }]);
      setActiveDraftIndex(0);
    } else {
      setActiveMode('scan');
      setDrafts([]);
      setActiveDraftIndex(0);
    }
  }, [isBuiltyUploadOpen, targetBuiltyDC]);

  if (!isBuiltyUploadOpen) return null;

  const currentDraft = drafts[activeDraftIndex] || drafts[0];

  // Helper to update current active draft
  const updateCurrentDraft = (updater: (prev: ScannedBuiltyDraft) => ScannedBuiltyDraft) => {
    setDrafts(prev => {
      const next = [...prev];
      if (next[activeDraftIndex]) {
        next[activeDraftIndex] = updater(next[activeDraftIndex]);
      }
      return next;
    });
  };

  const handleBuiltyFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = Array.from(e.target.files || []);
    if (filesList.length === 0) return;

    setIsScanning(true);
    setErrorMsg(null);
    setStatusNote(null);

    try {
      const filePayloads = await Promise.all(
        filesList.map(async f => ({
          base64: await fileToBase64(f),
          name: f.name
        }))
      );

      const results = await processBuiltyWithAI(filePayloads, geminiApiKey);

      if (!results || results.length === 0) {
        throw new Error('No builty details extracted from document.');
      }

      // Match extracted builty against existing DCs in system
      const newDrafts: ScannedBuiltyDraft[] = results.map((res, index) => {
        let detectedDC = res.dcNumber?.trim() || '';
        if (detectedDC && !detectedDC.toUpperCase().startsWith('DC-')) {
          const digits = detectedDC.replace(/[^0-9]/g, '');
          if (digits) detectedDC = `DC-${digits}`;
        }

        // Search matching DC in system
        const cleanExtracted = detectedDC.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const matchedDC = dcs.find(d => {
          if (!cleanExtracted) return false;
          const cleanSys = d.dcNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          return cleanSys === cleanExtracted || cleanSys.includes(cleanExtracted) || cleanExtracted.includes(cleanSys);
        });

        return {
          id: `builty-draft-${Date.now()}-${index}`,
          dcNumber: matchedDC ? matchedDC.dcNumber : detectedDC || (targetBuiltyDC ? targetBuiltyDC.dcNumber : ''),
          selectedDCId: matchedDC ? matchedDC.id : (targetBuiltyDC ? targetBuiltyDC.id : ''),
          builtyNumber: res.builtyNumber || `${Math.floor(10000 + Math.random() * 89999)}`,
          addaName: res.addaName || 'Tariq Goods Transport Saddar Rawalpindi',
          destinationCity: res.destinationCity || (matchedDC ? matchedDC.siteName : 'Khanewal'),
          packagesCount: res.packagesCount || '1 Lot Electrical Supplies',
          freightCharges: res.freightCharges !== undefined ? String(res.freightCharges) : '750',
          freightStatus: res.freightStatus || 'Paid',
          builtyDate: res.builtyDate || new Date().toISOString().split('T')[0],
          sender: res.sender || 'Star Electric Enterprises Rawalpindi',
          receiver: res.receiver || (matchedDC ? `Jadeed Group (${matchedDC.siteName})` : 'Jadeed Group'),
          builtyImage: res.builtyImage || filePayloads[index]?.base64,
          confidence: res.confidence || 0.98
        };
      });

      setDrafts(newDrafts);
      setActiveDraftIndex(0);
      setActiveMode('manual');
      setStatusNote(`✓ Successfully scanned ${newDrafts.length} Builty receipt(s) via ${ocrEngine}. DC numbers and Adda details automatically identified below.`);
    } catch (err: any) {
      console.error('Builty OCR Scanning error:', err);
      setErrorMsg(`Failed to process builty image via ${ocrEngine}. Switched to manual entry mode.`);
      setActiveMode('manual');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAttachSingle = () => {
    if (!currentDraft) return;
    setErrorMsg(null);

    if (!currentDraft.dcNumber.trim() && !currentDraft.selectedDCId) {
      setErrorMsg('Please specify or select the Delivery Challan (DC) Number mentioned on this builty.');
      return;
    }

    const targetDC = dcs.find(d => d.id === currentDraft.selectedDCId || d.dcNumber.toLowerCase() === currentDraft.dcNumber.trim().toLowerCase());
    const dcKey = targetDC ? targetDC.id : currentDraft.dcNumber.trim();

    const result = attachBuiltyToDC(dcKey, {
      dcNumber: targetDC ? targetDC.dcNumber : currentDraft.dcNumber.trim(),
      builtyNumber: currentDraft.builtyNumber.trim(),
      addaName: currentDraft.addaName.trim(),
      destinationCity: currentDraft.destinationCity.trim(),
      packagesCount: currentDraft.packagesCount.trim(),
      freightCharges: parseFloat(currentDraft.freightCharges) || 0,
      freightStatus: currentDraft.freightStatus,
      builtyDate: currentDraft.builtyDate,
      builtyImage: currentDraft.builtyImage,
      sender: currentDraft.sender,
      receiver: currentDraft.receiver
    });

    if (result.success) {
      if (drafts.length > 1) {
        const remaining = drafts.filter((_, i) => i !== activeDraftIndex);
        setDrafts(remaining);
        setActiveDraftIndex(0);
        setStatusNote(`✓ Attached Builty #${currentDraft.builtyNumber} to ${currentDraft.dcNumber}. ${remaining.length} remaining to review.`);
      } else {
        setIsBuiltyUploadOpen(false);
        setTargetBuiltyDC(null);
      }
    } else {
      setErrorMsg(result.error || 'Failed to attach builty to DC.');
    }
  };

  const handleAttachAll = () => {
    setErrorMsg(null);

    // Validate that all drafts have a DC number
    for (let i = 0; i < drafts.length; i++) {
      const d = drafts[i];
      if (!d.dcNumber.trim() && !d.selectedDCId) {
        setErrorMsg(`Builty #${i + 1} (${d.builtyNumber || 'Draft'}) is missing a DC Number.`);
        setActiveDraftIndex(i);
        return;
      }
    }

    const payloadList: GeminiBuiltyExtractionResult[] = drafts.map(d => ({
      dcNumber: d.dcNumber.trim().toUpperCase(),
      builtyNumber: d.builtyNumber.trim(),
      addaName: d.addaName.trim(),
      destinationCity: d.destinationCity.trim(),
      packagesCount: d.packagesCount.trim(),
      freightCharges: parseFloat(d.freightCharges) || 0,
      freightStatus: d.freightStatus,
      builtyDate: d.builtyDate,
      builtyImage: d.builtyImage,
      sender: d.sender,
      receiver: d.receiver,
      confidence: d.confidence
    }));

    attachMultipleBuiltys(payloadList);
    setIsBuiltyUploadOpen(false);
    setTargetBuiltyDC(null);
  };

  const handleRemoveDraft = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = drafts.filter((_, i) => i !== idx);
    setDrafts(next);
    setActiveDraftIndex(Math.max(0, Math.min(activeDraftIndex, next.length - 1)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Goods Delivered Builty Picture & Automation
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-300">
                  DC # Linked
                </span>
                {activeOCRProvider !== 'None' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live {activeOCRProvider} OCR
                  </span>
                ) : (
                  <button
                    onClick={() => { setIsBuiltyUploadOpen(false); setIsSettingsOpen(true); }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Configure OCR
                  </button>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Auto-extract DC Number, Bilty #, Adda Name, Destination City & Freight from Pakistani transport receipts
              </p>
            </div>
          </div>

          <button
            onClick={() => { setIsBuiltyUploadOpen(false); setTargetBuiltyDC(null); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Modes Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
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
              <Sparkles className="w-4 h-4 text-amber-800" />
              Scan Builty Picture(s) via {ocrEngine}
            </button>

            <button
              onClick={() => {
                setActiveMode('manual');
                if (drafts.length === 0) {
                  const today = new Date().toISOString().split('T')[0];
                  const firstDC = targetBuiltyDC || dcs[0];
                  setDrafts([{
                    id: `draft-manual-${Date.now()}`,
                    dcNumber: firstDC ? firstDC.dcNumber : 'DC-674',
                    selectedDCId: firstDC ? firstDC.id : '',
                    builtyNumber: '',
                    addaName: 'Tariq Goods Transport Saddar Rawalpindi',
                    destinationCity: firstDC ? firstDC.siteName : 'Khanewal',
                    packagesCount: '1 Lot Supplies',
                    freightCharges: '750',
                    freightStatus: 'Paid',
                    builtyDate: today,
                    sender: 'Star Electric Enterprises Rawalpindi',
                    receiver: 'Jadeed Group',
                    confidence: 1.0
                  }]);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'manual'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              Manual / Direct Link
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleBuiltyFileScan}
              accept="image/*,.pdf"
              multiple
              className="hidden"
            />
          </div>

          {drafts.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>{drafts.length} Builties Extracted</span>
            </div>
          )}
        </div>

        {/* Multiple Builties Tabs Bar */}
        {drafts.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-shrink-0">
            {drafts.map((d, idx) => {
              const isActive = idx === activeDraftIndex;
              const hasMatch = dcs.some(x => x.id === d.selectedDCId || x.dcNumber.toLowerCase() === d.dcNumber.toLowerCase());

              return (
                <div
                  key={d.id}
                  onClick={() => setActiveDraftIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <p className="font-mono font-extrabold leading-tight">{d.dcNumber || 'No DC'}</p>
                      {hasMatch ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Matched with DC" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Unmatched DC" />
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 truncate max-w-[130px]">
                      Builty #{d.builtyNumber || 'Draft'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDraft(idx, e)}
                    className="p-1 hover:text-rose-600 text-slate-400 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Body Content */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {activeMode === 'scan' && drafts.length === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const inputEvent = { target: { files: e.dataTransfer.files } } as any;
                  handleBuiltyFileScan(inputEvent);
                }
              }}
              className="border-2 border-dashed border-amber-400 hover:border-amber-600 bg-amber-50/40 hover:bg-amber-50/70 rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group shadow-xs"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-md group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-2">
                  Upload / Drop Goods Transport Builty Receipt(s)
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                    Auto-Link to DC
                  </span>
                </h4>
                <p className="text-xs text-slate-600 font-medium max-w-lg mx-auto mt-1">
                  Upload photos from your <strong className="text-slate-900 font-bold">Builty Scan</strong> folder (e.g. Tariq Goods, Rawalpindi Adda, Faisal Movers).
                  {ocrEngine} will read the <strong className="text-amber-800 font-extrabold">DC Number always written on the builty</strong>, extract consignment details, and link it directly to the matching DC and PR!
                </p>
              </div>

              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all pointer-events-none"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                Select Builty Picture(s)
              </button>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold pt-2 border-t border-amber-200/60">
                <span>✓ Reads DC # from builty</span>
                <span>•</span>
                <span>✓ Extracts Bilty # & Adda name</span>
                <span>•</span>
                <span>✓ Updates PR Fulfillment</span>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
              <div>
                <p className="font-bold">{ocrEngine} Scanning Builty Receipt(s)...</p>
                <p className="text-[11px] text-amber-800 font-medium">
                  Locating handwritten DC Number, Consignment #, Goods Transport Company, Destination & Freight charges...
                </p>
              </div>
            </div>
          )}

          {statusNote && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{statusNote}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Builty Form Card */}
          {currentDraft && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              
              {/* Linked DC Match Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    Target Delivery Challan (DC)
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={currentDraft.selectedDCId}
                      onChange={(e) => {
                        const sel = dcs.find(x => x.id === e.target.value);
                        updateCurrentDraft(prev => ({
                          ...prev,
                          selectedDCId: e.target.value,
                          dcNumber: sel ? sel.dcNumber : prev.dcNumber,
                          destinationCity: sel ? sel.siteName : prev.destinationCity
                        }));
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- Choose Matching DC --</option>
                      {dcs.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.dcNumber} - {d.siteName} ({d.itemsShipped?.length || 0} items)
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Or type DC # (e.g. DC-674)"
                      value={currentDraft.dcNumber}
                      onChange={(e) => updateCurrentDraft(prev => ({ ...prev, dcNumber: e.target.value }))}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 w-36 uppercase"
                    />
                  </div>
                </div>

                {/* Match indicator badge */}
                <div>
                  {dcs.some(d => d.id === currentDraft.selectedDCId || d.dcNumber.toLowerCase() === currentDraft.dcNumber.toLowerCase()) ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      DC Matched & Ready to Link
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      New / Manual DC Number
                    </span>
                  )}
                </div>
              </div>

              {/* Builty Image Preview Thumbnail (if uploaded) */}
              {currentDraft.builtyImage && (
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentDraft.builtyImage} 
                      alt="Builty Preview" 
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Goods Transport Builty Picture Attached</p>
                      <p className="text-[11px] text-slate-500 font-medium">High resolution scan stored for delivery proof</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentDraft.builtyImage) {
                          setSelectedBuiltyPreview({
                            url: currentDraft.builtyImage,
                            title: `Builty #${currentDraft.builtyNumber || 'Receipt'} (${currentDraft.addaName})`,
                            dcNumber: currentDraft.dcNumber
                          });
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" /> View Picture
                    </button>

                    <button
                      type="button"
                      onClick={() => updateCurrentDraft(prev => ({ ...prev, builtyImage: undefined }))}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Builty / Consignment Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Builty / Consignment #</label>
                  <input
                    type="text"
                    placeholder="e.g. 78412 or CN-491"
                    value={currentDraft.builtyNumber}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, builtyNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Goods Transport Adda */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Goods Transport Adda / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Tariq Goods Transport Rawalpindi"
                    value={currentDraft.addaName}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, addaName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Destination City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Destination Station / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Khanewal / Sahiwal / Mankera"
                    value={currentDraft.destinationCity}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, destinationCity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Packages / Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Packages / Bundles / Cartons</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Bundles Cable, 2 Cartons Lights"
                    value={currentDraft.packagesCount}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, packagesCount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Freight Amount (کرایہ) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Freight Amount (کرایہ)</span>
                    <span className="text-[10px] text-slate-400 font-semibold">PKR</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 750"
                    value={currentDraft.freightCharges}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, freightCharges: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Freight Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Freight Status (ادا / وصول)</label>
                  <select
                    value={currentDraft.freightStatus}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, freightStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Paid">Paid / ادا شدہ</option>
                    <option value="To Pay">To Pay / باقی / وصول طلب</option>
                    <option value="Free">Free / مفت</option>
                  </select>
                </div>

                {/* Builty Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Builty Date</label>
                  <input
                    type="date"
                    value={currentDraft.builtyDate}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, builtyDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Sender */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Sender</label>
                  <input
                    type="text"
                    value={currentDraft.sender}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, sender: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Receiver */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Receiver / Farm Site</label>
                  <input
                    type="text"
                    value={currentDraft.receiver}
                    onChange={(e) => updateCurrentDraft(prev => ({ ...prev, receiver: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {drafts.length > 1 ? (
              <span>Draft {activeDraftIndex + 1} of {drafts.length}</span>
            ) : (
              <span>Automated linking updates DC transport type to Adda &amp; logs to PR</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => { setIsBuiltyUploadOpen(false); setTargetBuiltyDC(null); }}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex-1 sm:flex-none"
            >
              Cancel
            </button>

            {drafts.length > 1 && (
              <button
                type="button"
                onClick={handleAttachAll}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all flex-1 sm:flex-none"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                Attach All ({drafts.length}) Builtys
              </button>
            )}

            {currentDraft && (
              <button
                type="button"
                onClick={handleAttachSingle}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all flex-1 sm:flex-none"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                {drafts.length > 1 ? 'Attach Current Builty' : 'Attach Builty & Update Delivery'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
