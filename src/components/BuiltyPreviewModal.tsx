import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Download, Package, Truck, MapPin, DollarSign, Calendar } from 'lucide-react';
import { getImageFromMemory, resolveScanReference } from '../lib/imageStorage';
import type { BuiltyPreviewInfo } from '../types';

/** Works out which stored scan belongs to this preview, for records whose image link is missing or dead. */
function fallbackScan(preview: BuiltyPreviewInfo): { type: 'pr' | 'dc' | 'builty'; ref: string } | null {
  if (preview.scanType && preview.scanRef) return { type: preview.scanType, ref: preview.scanRef };
  const title = preview.title || '';
  if (/builty|bilty/i.test(title) && preview.dcNumber) return { type: 'builty', ref: preview.dcNumber };
  if (/requisition|\bPR\b/i.test(title)) {
    const ref = preview.prNumber || title.match(/\(([^)]+)\)/)?.[1];
    return ref ? { type: 'pr', ref } : null;
  }
  if (preview.dcNumber) return { type: 'dc', ref: preview.dcNumber };
  return null;
}

export const BuiltyPreviewModal: React.FC = () => {
  const { selectedBuiltyPreview, setSelectedBuiltyPreview } = useApp();
  const [resolvedImage, setResolvedImage] = useState<string | null>(null);
  const [imageUnavailable, setImageUnavailable] = useState(false);

  const [triedFallback, setTriedFallback] = useState(false);

  const loadFallback = React.useCallback(async (isCancelled: () => boolean) => {
    if (!selectedBuiltyPreview) return;
    const target = fallbackScan(selectedBuiltyPreview);
    const image = target ? await getImageFromMemory(target.type, target.ref) : undefined;
    if (isCancelled()) return;
    if (image && image !== selectedBuiltyPreview.url) {
      setResolvedImage(image);
      setImageUnavailable(false);
    } else {
      setImageUnavailable(true);
    }
  }, [selectedBuiltyPreview]);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    setResolvedImage(null);
    setImageUnavailable(false);
    setTriedFallback(false);
    if (!selectedBuiltyPreview) return () => { cancelled = true; };

    resolveScanReference(selectedBuiltyPreview.url).then(image => {
      if (cancelled) return;
      if (image) {
        setResolvedImage(image);
      } else {
        setTriedFallback(true);
        loadFallback(isCancelled);
      }
    }).catch(error => {
      console.error('[ImagePreview] Failed to load stored scan:', error);
      if (!cancelled) { setTriedFallback(true); loadFallback(isCancelled); }
    });

    return () => { cancelled = true; };
  }, [selectedBuiltyPreview, loadFallback]);

  const handleImageError = () => {
    if (triedFallback) { setImageUnavailable(true); return; }
    setTriedFallback(true);
    setResolvedImage(null);
    loadFallback(() => false);
  };

  if (!selectedBuiltyPreview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-3 sm:p-5 shadow-2xl flex flex-col space-y-4 max-h-[92vh] text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex flex-wrap items-center gap-2 break-words">
                {selectedBuiltyPreview.title || 'Goods Transport Builty Picture'}
                {selectedBuiltyPreview.dcNumber && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300">
                    Linked to {selectedBuiltyPreview.dcNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Official delivery proof receipt scanned from transport adda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resolvedImage && (
              <a
                href={resolvedImage}
                download={`${selectedBuiltyPreview.dcNumber || 'builty'}_scan.jpg`}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => setSelectedBuiltyPreview(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transport Metadata Bar */}
        {(selectedBuiltyPreview.biltyNumber || selectedBuiltyPreview.addaName || selectedBuiltyPreview.destinationCity) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
            {selectedBuiltyPreview.biltyNumber && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Builty Number</span>
                <span className="font-mono font-extrabold text-slate-900">{selectedBuiltyPreview.biltyNumber}</span>
              </div>
            )}
            {selectedBuiltyPreview.addaName && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-600" /> Transport Adda
                </span>
                <span className="font-bold text-slate-800 truncate block">{selectedBuiltyPreview.addaName}</span>
              </div>
            )}
            {selectedBuiltyPreview.destinationCity && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" /> Destination
                </span>
                <span className="font-bold text-slate-800">
                  {selectedBuiltyPreview.destinationCity} {selectedBuiltyPreview.packagesCount ? `(${selectedBuiltyPreview.packagesCount})` : ''}
                </span>
              </div>
            )}
            {selectedBuiltyPreview.freightCharges !== undefined && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-600" /> Freight Status
                </span>
                <span className="font-bold text-emerald-800">
                  {selectedBuiltyPreview.freightCharges > 0 
                    ? `PKR ${selectedBuiltyPreview.freightCharges.toLocaleString()} (${selectedBuiltyPreview.freightStatus || 'Paid'})`
                    : 'Free (مفت)'
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {/* Image Display */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 rounded-2xl p-2 min-h-0 sm:min-h-[300px]">
          {resolvedImage && !imageUnavailable ? (
            <img
              src={resolvedImage}
              alt="Delivery document scan"
              onError={handleImageError}
              className="max-h-[55vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-200"
            />
          ) : (
            <div className="max-w-md px-5 py-8 text-center">
              <Package className="w-9 h-9 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-bold text-slate-700">
                {imageUnavailable ? 'This scan is unavailable.' : 'Loading saved scan…'}
              </p>
              {imageUnavailable && (
                <p className="text-xs text-slate-500 mt-1">
                  The stored image may be missing or its source link may have expired. Reattach the scan to restore the preview.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {selectedBuiltyPreview.date ? `Dated: ${selectedBuiltyPreview.date}` : 'Star Electric Enterprises ↔ Jadeed Group Goods Logistics'}
          </span>
          <button
            onClick={() => setSelectedBuiltyPreview(null)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
