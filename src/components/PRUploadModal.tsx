import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentClassificationError, fileToBase64 } from '../lib/gemini';
import { getActiveOCRProvider, getLocalScanWarning, getOCREngineLabel, processDocumentWithAI } from '../lib/aiOcr';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  FileText,
  Truck
} from 'lucide-react';

interface FilePreviewItem {
  id: string;
  file: File;
  name: string;
  size: string;
  base64: string;
}

export const PRUploadModal: React.FC = () => {
  const { 
    isPRUploadOpen, 
    setIsPRUploadOpen, 
    setPendingExtractedData, 
    setPendingExtractedDataList, 
    setPendingImage, 
    setIsPRReviewOpen, 
    setIsDCUploadOpen,
    geminiApiKey, 
    verifyAndCheckDuplicate, 
    setDuplicateInfo, 
    setIsDuplicateWarningOpen,
    setIsSettingsOpen
  } = useApp();

  const [files, setFiles] = useState<FilePreviewItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
    percent: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeOCRProvider = getActiveOCRProvider(geminiApiKey);
  const ocrEngine = getOCREngineLabel(activeOCRProvider);
  const localScanWarning = getLocalScanWarning(activeOCRProvider, files.length);

  if (!isPRUploadOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedList = Array.from(e.target.files || []);
    if (selectedList.length === 0) return;
    await addFiles(selectedList);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addFiles = async (newFiles: File[]) => {
    setErrorMsg(null);
    const newItems: FilePreviewItem[] = [];

    for (const file of newFiles) {
      try {
        const base64 = await fileToBase64(file);
        const sizeFormatted = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;
        
        newItems.push({
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: sizeFormatted,
          base64
        });
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }

    setFiles(prev => [...prev, ...newItems]);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      await addFiles(droppedFiles);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleStartOCRScan = async () => {
    if (files.length === 0) {
      setErrorMsg('Please select at least one document image or PDF file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const base64Array = files.map(f => f.base64);
      setPendingImage(base64Array[0]);

      const filePayloads = files.map(f => ({ base64: f.base64, name: f.name }));
      const resultList = await processDocumentWithAI(
        filePayloads,
        geminiApiKey,
        (prog) => {
          setScanProgress({
            current: prog.current,
            total: prog.total,
            fileName: prog.fileName,
            percent: Math.round((prog.current / prog.total) * 100)
          });
        }
      );

      if (!resultList || resultList.length === 0) {
        throw new Error('No requisitions could be extracted from the uploaded file(s).');
      }

      // Attach original document images into each extracted PR item
      resultList.forEach((res, i) => {
        if (!res.documentImage) {
          res.documentImage = files[i]?.base64 || files[0]?.base64 || '';
        }
      });

      const primary = resultList[0];

      setPendingExtractedDataList(resultList);
      setPendingExtractedData(primary);

      setIsPRUploadOpen(false);
      
      // If single PR and duplicate, prompt duplicate warning.
      // For multi-PR batch (e.g. PR-37, PR-66, PR-194), open PRReviewModal directly with all tabs available!
      if (resultList.length === 1) {
        const dupCheck = verifyAndCheckDuplicate(primary.prNumber);
        if (dupCheck.isDuplicate && primary.prNumber !== 'NO PR') {
          setDuplicateInfo({
            isDuplicate: true,
            existingPR: dupCheck.existingPR,
            pendingPrNumber: primary.prNumber,
            pendingExtractedData: primary
          });
          setIsDuplicateWarningOpen(true);
          return;
        }
      }

      setIsPRReviewOpen(true);
    } catch (err: any) {
      console.error('File processing error:', err);
      if (err instanceof DocumentClassificationError && err.documentType === 'DELIVERY_CHALLAN') {
        setIsPRUploadOpen(false);
        setIsDCUploadOpen(true);
        alert(`${err.message} Please select the same file again in the Delivery Challan uploader.`);
        return;
      }
      setErrorMsg(err.message || 'Failed to process document image(s). Please try again.');
    } finally {
      setIsProcessing(false);
      setScanProgress(null);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Scan Demand Requisition
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  Multi-File AI OCR
                </span>
                {activeOCRProvider !== 'None' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live {activeOCRProvider} OCR
                  </span>
                ) : (
                  <button
                    onClick={() => { setIsPRUploadOpen(false); setIsSettingsOpen(true); }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Click to configure an AI OCR provider"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Configure OCR
                  </button>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Upload single or multiple demand sheet images / PDF pages</p>
            </div>
          </div>

          <button
            onClick={() => setIsPRUploadOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf"
          multiple
          className="hidden"
        />

        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Quick Switch to DC Upload */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Uploading Delivery Challan photos to mark as DELIVERED?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPRUploadOpen(false);
                setIsDCUploadOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shrink-0 transition-colors shadow-2xs"
            >
              Upload DC & Deliver
            </button>
          </div>

          {/* File Upload / Drop Zone */}
          {files.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isProcessing
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/40'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">{ocrEngine} Scanning Document(s)...</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{scanProgress ? `File ${scanProgress.current} of ${scanProgress.total}: ${scanProgress.fileName}` : 'Extracting PR details across all uploaded pages'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Click or drag single/multiple files here
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Supports JPG, PNG, WEBP, PDF • Select multiple pages at once
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Attached Document Pages ({files.length} {files.length === 1 ? 'file' : 'files'})
                </span>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add More Files
                </button>
              </div>

              {/* Grid of File Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {files.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {item.base64.startsWith('data:image') ? (
                        <img 
                          src={item.base64} 
                          alt="preview" 
                          className="w-9 h-9 rounded object-cover border border-slate-200 flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          PDF
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          <span className="text-amber-700 font-extrabold mr-1">#{idx + 1}</span> 
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{item.size}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scanProgress && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  Scanning Requisition {scanProgress.current} of {scanProgress.total}...
                </span>
                <span className="font-mono text-amber-800 font-extrabold">{scanProgress.percent}%</span>
              </div>
              <div className="w-full bg-amber-200/80 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-800 truncate font-mono">
                Active scan: {scanProgress.fileName}
              </p>
            </div>
          )}

          {localScanWarning && !isProcessing && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
              {localScanWarning}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setIsPRUploadOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          {files.length > 0 && (
            <button
              onClick={handleStartOCRScan}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Scanning {files.length} File(s)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Scan {files.length} {files.length === 1 ? 'File' : 'Files'} with {ocrEngine}
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
