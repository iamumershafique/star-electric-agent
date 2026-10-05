import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PRRecord, LineItem, BrandCategory } from '../types';
import { generateId, normalizeBrand } from '../lib/utils';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Building2, 
  Calendar, 
  Hash, 
  Save, 
  AlertTriangle,
  Layers,
  CheckCircle2
} from 'lucide-react';

const BRAND_OPTIONS: BrandCategory[] = [
  'Pakistan Cables',
  'Amer Cables',
  'Schneider Electric',
  'Terasaki',
  'Philips / Pak Lighting',
  'Conduit & Accessories',
  'Switches & Sockets',
  'General Electrical'
];

interface DraftPRItem {
  id: string;
  prNumber: string;
  date: string;
  siteName: string;
  items: LineItem[];
  confidence?: number;
  documentImage?: string;
  /** True when the scan returned no line items at all, so the reviewer must type them. */
  needsManualItems?: boolean;
}

export const PRReviewModal: React.FC = () => {
  const { 
    isPRReviewOpen, 
    setIsPRReviewOpen, 
    pendingExtractedData,
    pendingExtractedDataList, 
    addNewPR,
    addMultiplePRs,
    sites,
    verifyAndCheckDuplicate
  } = useApp();

  const [drafts, setDrafts] = useState<DraftPRItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const listToProcess = (pendingExtractedDataList && pendingExtractedDataList.length > 0)
      ? pendingExtractedDataList
      : (pendingExtractedData ? [pendingExtractedData] : []);

    if (listToProcess.length > 0) {
      const initialDrafts: DraftPRItem[] = listToProcess.map((data, idx) => {
        const rawPr = data.prNumber ? data.prNumber.trim() : '';
        const prNum = rawPr || 'NO PR';

        // When the scan produced no rows the sheet stays empty and the reviewer is warned;
        // it used to be filled with a made-up cable row that then went into the ledger.
        const mappedItems: LineItem[] = (data.lineItems && data.lineItems.length > 0)
          ? data.lineItems.map(item => ({
              id: generateId('item'),
              name: item.name,
              brand: normalizeBrand(item.brand || item.name),
              requestedQty: item.quantity || 1,
              fulfilledQty: 0,
              unit: item.unit || 'Meters',
              status: 'Pending',
              specifications: item.specifications || ''
            }))
          : [
              {
                id: generateId('item'),
                name: '',
                brand: 'General Electrical',
                requestedQty: 1,
                fulfilledQty: 0,
                unit: 'Numbers',
                status: 'Pending'
              }
            ];

        return {
          id: `draft-${idx}-${Date.now()}`,
          prNumber: prNum,
          date: data.date || new Date().toISOString().split('T')[0],
          siteName: data.siteName || (sites[0] ? sites[0].name : 'Jadeed Group Farm Location'),
          items: mappedItems,
          confidence: data.confidence,
          documentImage: data.documentImage,
          needsManualItems: !(data.lineItems && data.lineItems.length > 0)
        };
      });

      setDrafts(initialDrafts);
      setActiveIndex(0);
    }
  }, [pendingExtractedData, pendingExtractedDataList]);

  if (!isPRReviewOpen || drafts.length === 0) return null;

  const currentDraft = drafts[activeIndex] || drafts[0];
  // Derived from the draft on screen: the old state was only refreshed while typing, so
  // switching tabs showed the previous requisition's duplicate status.
  const duplicateWarning = Boolean(
    currentDraft?.prNumber.trim()
    && currentDraft.prNumber.trim().toUpperCase() !== 'NO PR'
    && verifyAndCheckDuplicate(currentDraft.prNumber).isDuplicate
  );

  const updateCurrentDraft = (fields: Partial<DraftPRItem>) => {
    setDrafts(prev => {
      const updated = [...prev];
      updated[activeIndex] = { ...updated[activeIndex], ...fields };
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: generateId('item'),
      name: '',
      brand: 'Pakistan Cables',
      requestedQty: 100,
      fulfilledQty: 0,
      unit: 'Meters',
      status: 'Pending'
    };
    updateCurrentDraft({ items: [...currentDraft.items, newItem] });
  };

  const handleUpdateItem = (itemIndex: number, key: keyof LineItem, value: any) => {
    const updatedItems = [...currentDraft.items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], [key]: value };
    updateCurrentDraft({ items: updatedItems });
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (currentDraft.items.length <= 1) return;
    const updatedItems = currentDraft.items.filter((_, i) => i !== itemIndex);
    updateCurrentDraft({ items: updatedItems });
  };

  const handleDiscardCurrentDraft = () => {
    if (drafts.length <= 1) {
      setIsPRReviewOpen(false);
      return;
    }
    const updated = drafts.filter((_, i) => i !== activeIndex);
    setDrafts(updated);
    setActiveIndex(prev => Math.min(prev, updated.length - 1));
  };

  /** A requisition must name at least one real item and carry a positive quantity. */
  const validateDraft = (draft: DraftPRItem): string | null => {
    const named = draft.items.filter(item => item.name.trim() !== '');
    if (named.length === 0) {
      return 'Add at least one line item description before saving this requisition.';
    }
    const badQuantity = named.find(item => !(item.requestedQty > 0));
    if (badQuantity) {
      return `Enter a requested quantity greater than 0 for "${badQuantity.name}".`;
    }
    return null;
  };

  const handleSaveCurrentPR = () => {
    try {
      const invalid = validateDraft(currentDraft);
      if (invalid) {
        setSaveError(invalid);
        return;
      }
      setSaveError(null);
      const cleanPRNum = currentDraft.prNumber.trim() || 'NO PR';

      const prRecord: PRRecord = {
        id: generateId('pr'),
        prNumber: cleanPRNum,
        date: currentDraft.date,
        siteName: currentDraft.siteName,
        status: 'Pending',
        contactPerson: 'Engr. Subhan (Site Lead)',
        notes: '',
        items: currentDraft.items,
        documentImage: currentDraft.documentImage,
        fulfillmentLogs: [],
        createdTimestamp: Date.now()
      };

      const success = addNewPR(prRecord);

      if (success) {
        if (drafts.length <= 1) {
          setIsPRReviewOpen(false);
        } else {
          handleDiscardCurrentDraft();
        }
      }
    } catch (err: any) {
      console.error('Failed to save current PR:', err);
    }
  };

  const handleSaveAllPRs = () => {
    try {
      for (let index = 0; index < drafts.length; index++) {
        const invalid = validateDraft(drafts[index]);
        if (invalid) {
          setSaveError(`Requisition #${index + 1} (${drafts[index].prNumber}): ${invalid}`);
          setActiveIndex(index);
          return;
        }
      }
      setSaveError(null);
      const recordsToSave: PRRecord[] = drafts.map(d => {
        const cleanPRNum = d.prNumber.trim() || 'NO PR';
        return {
          id: generateId('pr'),
          prNumber: cleanPRNum,
          date: d.date,
          siteName: d.siteName,
          status: 'Pending',
          contactPerson: 'Engr. Subhan (Site Lead)',
          notes: '',
          items: d.items,
          documentImage: d.documentImage,
          fulfillmentLogs: [],
          createdTimestamp: Date.now()
        };
      });

      addMultiplePRs(recordsToSave);
      setIsPRReviewOpen(false);
    } catch (err: any) {
      console.error('Failed to save all requisitions:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Review & Confirm PR Data
                {drafts.length > 1 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-700" />
                    {drafts.length} Separate Requisitions Detected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verify AI-extracted demand data before logging into Star Electric Database
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPRReviewOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-PR Tabs & Jump Selector (Optimized for 95+ PRs) */}
        {drafts.length > 1 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-2 flex-shrink-0 border-b border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-[62%]">
              <span className="text-[11px] font-bold text-slate-500 mr-1 flex-shrink-0">Requisitions ({drafts.length}):</span>
              {drafts.slice(0, 15).map((d, idx) => (
                <button
                  key={d.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${
                    activeIndex === idx
                      ? 'bg-amber-500 text-slate-950 shadow-xs border border-amber-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>#{idx + 1}</span>
                  <span className="font-mono bg-white/70 px-1 py-0.2 rounded text-[10px]">
                    {d.prNumber}
                  </span>
                </button>
              ))}
              {drafts.length > 15 && (
                <span className="text-[11px] text-slate-400 font-semibold flex-shrink-0">
                  +{drafts.length - 15} more
                </span>
              )}
            </div>

            {/* Quick Next / Prev & Dropdown Jump for 95+ PRs */}
            <div className="flex items-center gap-1.5 flex-shrink-0 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 font-bold text-slate-700 transition-colors"
                title="Previous PR"
              >
                ◀ Prev
              </button>
              
              <select
                value={activeIndex}
                onChange={(e) => setActiveIndex(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-800 text-xs focus:outline-none focus:border-amber-500 max-w-[160px] truncate"
              >
                {drafts.map((d, idx) => (
                  <option key={d.id} value={idx}>
                    #{idx + 1}: {d.prNumber} ({d.items.length} items)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setActiveIndex(prev => Math.min(drafts.length - 1, prev + 1))}
                disabled={activeIndex === drafts.length - 1}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 font-bold text-slate-700 transition-colors"
                title="Next PR"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {currentDraft.needsManualItems && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                The scan returned no line items for this document. Type the rows below (or re-scan with a
                higher scan quality in Settings) — nothing is saved until you do.
              </span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Warning:</strong> PR Number "{currentDraft.prNumber}" already exists in the database.
              </span>
            </div>
          )}

          {/* Key Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-600" /> PR Number (Tracking ID)
              </label>
              <input
                type="text"
                value={currentDraft.prNumber}
                onChange={(e) => updateCurrentDraft({ prNumber: e.target.value })}
                placeholder="e.g. PR-JAD-2026-613 or NO PR"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                Extracted from doc. If missing on doc, set to <strong className="text-slate-900">NO PR</strong>.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Requisition Date
              </label>
              <input
                type="date"
                value={currentDraft.date}
                onChange={(e) => updateCurrentDraft({ date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Jadeed Farm Location
              </label>
              <input
                type="text"
                value={currentDraft.siteName}
                onChange={(e) => updateCurrentDraft({ siteName: e.target.value })}
                placeholder="e.g. Jadeed Farm - Khanewal Site B"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                list="existing-sites-list"
              />
              <datalist id="existing-sites-list">
                {sites.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Requisition Line Items ({currentDraft.items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full min-w-[720px] text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Brand Tag</th>
                    <th className="p-3 w-24 text-center">Req Qty</th>
                    <th className="p-3 w-24 text-center">Unit</th>
                    <th className="p-3 w-10 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {currentDraft.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                          placeholder="e.g. 95mm 4-Core Copper Cable"
                          className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={item.brand}
                          onChange={(e) => handleUpdateItem(idx, 'brand', e.target.value as BrandCategory)}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 text-xs"
                        >
                          {BRAND_OPTIONS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={item.requestedQty}
                          onChange={(e) => handleUpdateItem(idx, 'requestedQty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 text-center font-mono font-bold focus:outline-none focus:border-amber-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 text-center font-bold focus:outline-none focus:border-amber-500"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete item row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardCurrentDraft}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Discard this extracted PR entry"
            >
              <Trash2 className="w-3.5 h-3.5" /> Discard This PR Entry
            </button>

            <button
              type="button"
              onClick={() => setIsPRReviewOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2">
            {drafts.length > 1 && (
              <button
                type="button"
                onClick={handleSaveAllPRs}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Save All ({drafts.length}) Requisitions
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveCurrentPR}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" /> Save Current PR to Database
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
