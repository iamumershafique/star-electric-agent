import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getStatusBadgeColor, calculatePRTotals } from '../lib/utils';
import { getLinkedDCNumbersForPR, isDCPRMissing } from '../lib/storage';
import { getImageFromMemorySync } from '../lib/imageStorage';
import type { LineItem } from '../types';
import { 
  X, 
  Printer, 
  Truck, 
  Building2, 
  FileText, 
  Zap, 
  Trash2, 
  PackageCheck, 
  Edit3, 
  Eye,
  Image as ImageIcon
} from 'lucide-react';

export const PRDetailModal: React.FC = () => {
  const { 
    isPRDetailOpen, 
    setIsPRDetailOpen, 
    selectedPR, 
    dcs,
    setTargetDC_PR, 
    setIsDCUploadOpen,
    deletePR,
    setQuickDispatchTarget,
    setIsQuickDispatchOpen,
    setEditingPR,
    setIsPREditOpen,
    setSelectedBuiltyPreview,
    updateExistingPR,
    prs,
    updateDC
  } = useApp();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  if (!isPRDetailOpen || !selectedPR) return null;

  const totals = calculatePRTotals(selectedPR);
  const linkedPRDCNumbers = getLinkedDCNumbersForPR(selectedPR, dcs);

  const pendingDCs = dcs
    .filter(dc => isDCPRMissing(dc, prs))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.dcNumber.localeCompare(a.dcNumber, undefined, { numeric: true }));
  const linkDCToPR = (dcId: string) => {
    const dc = dcs.find(d => d.id === dcId);
    if (!dc) return;
    updateDC({ ...dc, prId: selectedPR.id, prNumber: selectedPR.prNumber, noPrRequired: false });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === selectedPR.items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(selectedPR.items.map(i => i.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleOpenQuickDispatch = (targetItems: LineItem[]) => {
    if (targetItems.length === 0) return;
    setQuickDispatchTarget({
      pr: selectedPR,
      items: targetItems
    });
    setIsQuickDispatchOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-6 max-h-[92vh] flex flex-col printable-area text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-mono">
                  {selectedPR.prNumber}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadgeColor(selectedPR.status)}`}>
                  {selectedPR.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> {selectedPR.siteName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Print PR Summary"
            >
              <Printer className="w-4 h-4" /> Print
            </button>

            {(() => {
              const prImg = selectedPR.documentImage || getImageFromMemorySync(`pr_${selectedPR.prNumber}`) || getImageFromMemorySync(`pr_${selectedPR.id}`);
              if (!prImg) return null;
              return (
                <button
                  onClick={() => {
                    setSelectedBuiltyPreview({
                      url: prImg,
                      title: `Requisition Document Scan (${selectedPR.prNumber})`,
                      date: selectedPR.date,
                      siteName: selectedPR.siteName
                    });
                  }}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
                  title="View Requisition Document Scan"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-700" /> View PR Scan
                </button>
              );
            })()}

            <button
              onClick={() => {
                setTargetDC_PR(selectedPR);
                setIsPRDetailOpen(false);
                setIsDCUploadOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Truck className="w-4 h-4" /> Scan DC Image / Upload
            </button>

            <button
              onClick={() => {
                setEditingPR(selectedPR);
                setIsPREditOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Edit Requisition Details & Items"
            >
              <Edit3 className="w-4 h-4" /> Edit Requisition
            </button>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete PR ${selectedPR.prNumber}?`)) {
                  deletePR(selectedPR.id);
                }
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Delete Requisition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>

            <button
              onClick={() => setIsPRDetailOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          
          {/* PR Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Requisition Date</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">{selectedPR.date}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Site Supervisor / Contact</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedPR.contactPerson || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Requisition Items</span>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5 font-mono">
                {totals.totalItemsCount} Line Items ({totals.completedItemsCount} Fulfilled)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
              DCs linked to this PR
            </span>
            {linkedPRDCNumbers.length > 0 ? linkedPRDCNumbers.map(dcNumber => (
              <span
                key={dcNumber}
                className="rounded border border-blue-300 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-blue-900"
              >
                {dcNumber}
              </span>
            )) : (
              <span className="text-[11px] font-medium text-slate-600">
                No verified DC-to-PR reference is available.
              </span>
            )}
            <span className="basis-full text-[10px] text-slate-600">
              An asterisk in the item table means the DC is linked to the PR, but its contents are not verified for that specific item.
            </span>
          </div>

          {pendingDCs.length > 0 && (
            <div className="no-print rounded-xl border border-slate-300 bg-white p-4 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Link a pending DC to {selectedPR.prNumber}</h4>
                <span className="text-[11px] text-slate-500">{pendingDCs.length} DCs have no PR. Click one to link it.</span>
              </div>
              <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                {pendingDCs.map(dc => (
                  <button
                    key={dc.id}
                    type="button"
                    onClick={() => linkDCToPR(dc.id)}
                    title={`${dc.siteName || ''} ${dc.date || ''}`.trim() || 'Link this DC'}
                    className="cursor-pointer rounded-md border border-dashed border-slate-400 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-slate-800 transition-colors hover:border-slate-900 hover:bg-slate-50"
                  >
                    + {dc.dcNumber}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Fulfillment Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Overall Fulfillment Progress</span>
              <span className="font-mono text-amber-700 font-extrabold">{totals.percentage}% Completed</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totals.percentage}%` }}
              />
            </div>
          </div>

          {/* Line Items & Interactive Dispatch Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Line Item Breakdown & Delivery Status
              </h4>

              {selectedItemIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const chosen = selectedPR.items.filter(i => selectedItemIds.includes(i.id));
                    handleOpenQuickDispatch(chosen);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <PackageCheck className="w-4 h-4" />
                  Dispatch Selected ({selectedItemIds.length}) Items (Issue DC)
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full min-w-[720px] text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3 w-10 text-center no-print">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.length === selectedPR.items.length && selectedPR.items.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">DC Number</th>
                    <th className="p-3 text-center">Requested</th>
                    <th className="p-3 text-center">Shipped</th>
                    <th className="p-3 text-center">Remaining</th>
                    <th className="p-3 text-center">Status / Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {selectedPR.items.map((item) => {
                    const remaining = Math.max(0, item.requestedQty - item.fulfilledQty);
                    const isSelected = selectedItemIds.includes(item.id);
                    const itemDCNumbers = Array.from(new Set(
                      (selectedPR.fulfillmentLogs || [])
                        .filter(log =>
                          log.itemId === item.id ||
                          log.itemName.toLowerCase().replace(/[^a-z0-9]/g, '') ===
                            item.name.toLowerCase().replace(/[^a-z0-9]/g, '')
                        )
                        .map(log => log.dcNumber.trim())
                        .filter(Boolean)
                    ));
                    const itemSpecificDCNumbers = itemDCNumbers.length > 0;
                    const linkedDCNumbers = itemSpecificDCNumbers ? itemDCNumbers : linkedPRDCNumbers;

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-amber-50/50' : ''}`}>
                        <td className="p-3 text-center no-print">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectItem(item.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.specifications && (
                            <p className="text-[10px] text-slate-500 font-medium">{item.specifications}</p>
                          )}
                        </td>
                        <td className="p-3">
                          {linkedDCNumbers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {linkedDCNumbers.map(dcNumber => (
                                <span
                                  key={dcNumber}
                                  title={itemSpecificDCNumbers
                                    ? `This DC is recorded for ${item.name}.`
                                    : 'This DC is linked to the PR; its contents are not verified for this specific item.'}
                                  className={`text-[10px] px-2 py-0.5 rounded border font-mono font-semibold ${
                                    itemSpecificDCNumbers
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                      : 'border-blue-300 bg-blue-50 text-blue-900'
                                  }`}
                                >
                                  {dcNumber}{itemSpecificDCNumbers ? '' : '*'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-900">
                          {item.requestedQty} {item.unit}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">
                          {item.fulfilledQty} {item.unit}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-amber-700">
                          {remaining} {item.unit}
                        </td>
                        <td className="p-3 text-center">
                          {item.status === 'Completed' ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold inline-flex items-center gap-1">
                              ✓ Delivered
                            </span>
                          ) : (
                            <div className="relative inline-block no-print">
                              <select
                                value={item.status}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'MarkDelivered') {
                                    handleOpenQuickDispatch([item]);
                                  } else if (val === 'Cancelled') {
                                    const updatedItems = selectedPR.items.map(it =>
                                      it.id === item.id ? { ...it, status: 'Cancelled' as const } : it
                                    );
                                    updateExistingPR({ ...selectedPR, items: updatedItems });
                                  } else if (val === 'Pending' || val === 'Partially Fulfilled') {
                                    const updatedItems = selectedPR.items.map(it =>
                                      it.id === item.id ? { ...it, status: 'Pending' as const } : it
                                    );
                                    updateExistingPR({ ...selectedPR, items: updatedItems });
                                  }
                                }}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  item.status === 'Cancelled'
                                    ? 'bg-slate-200 text-slate-800 border-slate-400 line-through'
                                    : item.status === 'Partially Fulfilled'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-rose-50 text-rose-900 border-rose-300'
                                }`}
                              >
                                {item.status === 'Cancelled' ? (
                                  <option value="Cancelled">❌ Cancelled (Not Available)</option>
                                ) : (
                                  <option value={item.status === 'Partially Fulfilled' ? 'Partially Fulfilled' : 'Pending'}>
                                    {item.status === 'Partially Fulfilled' ? '⏳ Partial' : '🔴 Pending'}
                                  </option>
                                )}
                                <option value="MarkDelivered">
                                  🚚 Mark Delivered (Issue DC)
                                </option>
                                <option value="Cancelled">
                                  ❌ Cancelled (Cannot Provide)
                                </option>
                                {item.status === 'Cancelled' && (
                                  <option value="Pending">
                                    🔄 Reopen Item (Set Pending)
                                  </option>
                                )}
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Challans (DCs) & Transport Log History */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Delivery Challans (DCs), Invoices & Transport History ({selectedPR.fulfillmentLogs?.length || 0})
            </h4>

            {(!selectedPR.fulfillmentLogs || selectedPR.fulfillmentLogs.length === 0) ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                No Delivery Challans have been issued for this PR yet. Select item(s) above and click "Mark Delivered".
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPR.fulfillmentLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                          {log.dcNumber}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-blue-700 font-bold">Invoice #{log.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({log.date})</span>
                      </div>
                      
                      <p className="text-slate-900 font-bold">
                        Item: {log.itemName} ({log.quantityShipped} units shipped)
                      </p>

                      {/* Transport details */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        {log.transportType === 'Adda / Goods Transport' || log.addaName || log.biltyNumber ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1">
                            🚚 Adda: {log.addaName || 'Goods Adda'} | Bilty #{log.biltyNumber || 'N/A'} | Freight: {log.isFreightFree || log.freightCharges === 0 ? 'FREE / مفت' : `PKR ${log.freightCharges}`}
                          </span>
                        ) : log.driverName || log.vehicleNo ? (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold border border-blue-300 flex items-center gap-1">
                            🚗 Driver: {log.driverName || 'N/A'} | Vehicle: {log.vehicleNo || 'N/A'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 flex items-center gap-1">
                            ✅ Delivered to Farm / Site
                          </span>
                        )}

                        {log.builtyImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBuiltyPreview({
                                url: log.builtyImage!,
                                title: `Builty #${log.biltyNumber || 'Receipt'} (${log.addaName || 'Transport'})`,
                                dcNumber: log.dcNumber
                              });
                            }}
                            className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-amber-700" /> View Builty Pic
                          </button>
                        )}

                        {log.notes && (
                          <span className="text-slate-600 font-medium italic">
                            Note: {log.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shrink-0 self-start sm:self-auto">
                      Dispatched & Invoiced
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between shrink-0 no-print">
          <span className="text-[11px] text-slate-500 font-semibold">
            Star Electric Enterprises • Saddar Rawalpindi • Client: Jadeed Group
          </span>
          <button
            onClick={() => setIsPRDetailOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
