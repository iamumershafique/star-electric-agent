import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  X, 
  Eye, 
  Layers, 
  PlusCircle, 
  Building2, 
  Calendar
} from 'lucide-react';

export const DuplicateWarningModal: React.FC = () => {
  const { 
    isDuplicateWarningOpen, 
    setIsDuplicateWarningOpen, 
    duplicateInfo,
    setSelectedPR,
    setIsPRDetailOpen,
    setIsPRReviewOpen,
    pendingExtractedData,
    pendingExtractedDataList,
    setPendingExtractedDataList,
    setPendingExtractedData,
    addNewPR
  } = useApp();

  if (!isDuplicateWarningOpen || !duplicateInfo) return null;

  const existing = duplicateInfo.existingPR;

  const handleViewExisting = () => {
    if (existing) {
      setSelectedPR(existing);
      setIsDuplicateWarningOpen(false);
      setIsPRDetailOpen(true);
    }
  };

  const handleMergeItems = () => {
    if (existing && pendingExtractedData?.lineItems) {
      const newItems = pendingExtractedData.lineItems.map(item => ({
        id: `item-${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        brand: item.brand,
        requestedQty: item.quantity || 100,
        fulfilledQty: 0,
        unit: item.unit || 'Meters',
        status: 'Pending' as const
      }));

      const mergedPR = {
        ...existing,
        items: [...existing.items, ...newItems],
        notes: `${existing.notes || ''} [Merged demand uploaded on ${new Date().toISOString().split('T')[0]}]`
      };

      addNewPR(mergedPR);

      // If there are other PRs in the uploaded batch, continue to review modal for remaining PRs
      const remaining = (pendingExtractedDataList || []).filter(
        p => p.prNumber !== pendingExtractedData.prNumber
      );

      if (remaining.length > 0) {
        setPendingExtractedDataList(remaining);
        setPendingExtractedData(remaining[0]);
        setIsDuplicateWarningOpen(false);
        setIsPRReviewOpen(true);
      } else {
        setSelectedPR(mergedPR);
        setIsDuplicateWarningOpen(false);
        setIsPRDetailOpen(true);
      }
    }
  };

  const handleForceCreateRevision = () => {
    setIsDuplicateWarningOpen(false);
    setIsPRReviewOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-amber-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden text-slate-900">
        
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Duplicate PR Detected!
              </h3>
              <p className="text-xs text-amber-800 font-bold">
                Tracking ID #{duplicateInfo.pendingPrNumber} is already logged.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDuplicateWarningOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
          <p className="text-amber-950 font-medium">
            This Purchase Requisition demand has already been logged in the Star Electric database:
          </p>
          
          {existing && (
            <div className="p-3 rounded-xl bg-white border border-amber-300 space-y-1 mt-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-amber-800">{existing.prNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold">
                  {existing.status}
                </span>
              </div>
              <p className="text-slate-900 font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> {existing.siteName}
              </p>
              <p className="text-slate-600 font-medium flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Logged Date: {existing.date} ({existing.items.length} items)
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleViewExisting}
            className="w-full p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-300 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>View Existing Logged PR Record</span>
            </div>
            <span className="text-slate-600 group-hover:text-slate-900">→</span>
          </button>

          <button
            onClick={handleMergeItems}
            className="w-full p-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>Merge New Items into Existing PR Record</span>
            </div>
            <span className="text-amber-800">→</span>
          </button>

          <button
            onClick={handleForceCreateRevision}
            className="w-full p-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs border border-slate-300 font-bold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-slate-500" />
              <span>Proceed to Review Form</span>
            </div>
            <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
};
