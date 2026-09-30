import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { TransportType } from '../types';
import { 
  X, 
  Truck, 
  Building2, 
  Calendar, 
  Hash, 
  CheckCircle2, 
  PackageCheck,
  AlertCircle,
  Banknote,
  FileText
} from 'lucide-react';

export const QuickDispatchModal: React.FC = () => {
  const { 
    isQuickDispatchOpen, 
    setIsQuickDispatchOpen, 
    quickDispatchTarget, 
    recordDeliveryChallan 
  } = useApp();

  const [dcNumber, setDcNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transportType, setTransportType] = useState<TransportType>('Adda / Goods Transport');

  // Adda / Goods Transport fields
  const [addaName, setAddaName] = useState('Rawalpindi Goods Transport Adda');
  const [biltyNumber, setBiltyNumber] = useState('');
  const [freightCharges, setFreightCharges] = useState<string>('0');
  const [isFreightFree, setIsFreightFree] = useState<boolean>(true);

  // Driver / Pickup fields
  const [driverName, setDriverName] = useState('Nawaz');
  const [vehicleNumber, setVehicleNumber] = useState('STS-1500');
  const [remarks, setRemarks] = useState('');

  // Items quantity map to ship
  const [shippedMap, setShippedMap] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (quickDispatchTarget) {
      const { pr, items } = quickDispatchTarget;
      // Auto-generate DC Number based on PR Number
      const numMatch = pr.prNumber.match(/\d+/g);
      const suffix = numMatch ? numMatch[numMatch.length - 1] : Math.floor(100 + Math.random() * 800);
      setDcNumber(`DC-${suffix}`);
      setBiltyNumber(`BL-${Math.floor(1000 + Math.random() * 9000)}`);

      // Initialize shippedMap with full remaining quantity for selected items
      const initialMap: Record<string, number> = {};
      items.forEach(item => {
        const remaining = Math.max(0, item.requestedQty - item.fulfilledQty);
        initialMap[item.id] = remaining > 0 ? remaining : item.requestedQty;
      });
      setShippedMap(initialMap);
      setErrorMsg(null);
    }
  }, [quickDispatchTarget, isQuickDispatchOpen]);

  if (!isQuickDispatchOpen || !quickDispatchTarget) return null;

  const { pr, items } = quickDispatchTarget;

  const handleQtyChange = (itemId: string, val: number, maxVal: number) => {
    const qty = Math.max(0, Math.min(val, maxVal));
    setShippedMap(prev => ({ ...prev, [itemId]: qty }));
  };

  const handleSubmit = () => {
    setErrorMsg(null);
    if (!dcNumber.trim()) {
      setErrorMsg('Delivery Challan (DC) Number is required.');
      return;
    }

    const hasShippedItems = Object.values(shippedMap).some(q => q > 0);
    if (!hasShippedItems) {
      setErrorMsg('Please specify a dispatch quantity greater than 0 for at least one item.');
      return;
    }

    if (transportType === 'Adda / Goods Transport' && !addaName.trim()) {
      setErrorMsg('Please specify the Adda / Transport Company Name.');
      return;
    }

    const cleanDC = dcNumber.trim().toUpperCase();
    const parsedFreight = isFreightFree ? 0 : (parseFloat(freightCharges) || 0);

    const result = recordDeliveryChallan(
      {
        dcNumber: cleanDC,
        invoiceNumber: cleanDC,
        prNumber: pr.prNumber,
        prId: pr.id,
        date,
        siteName: pr.siteName,
        itemsShipped: [],
        transportType,
        addaName: transportType === 'Adda / Goods Transport' ? addaName.trim() : undefined,
        biltyNumber: transportType === 'Adda / Goods Transport' ? biltyNumber.trim() : undefined,
        freightCharges: parsedFreight,
        isFreightFree,
        driverName: transportType === 'Pickup / Driver' ? driverName.trim() : undefined,
        vehicleNumber: transportType === 'Pickup / Driver' ? vehicleNumber.trim() : undefined,
        remarks: remarks.trim() || (transportType === 'Adda / Goods Transport' ? `Sent via ${addaName} (Bilty #${biltyNumber})` : `Dispatched via ${driverName}`)
      },
      shippedMap
    );

    if (!result.success) {
      setErrorMsg(result.error || `Delivery Challan ${cleanDC} could not be recorded.`);
      return;
    }

    setIsQuickDispatchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Mark Delivered & Issue DC
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  PR #{pr.prNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" /> {pr.siteName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsQuickDispatchOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-5 pr-1 flex-1">

          {/* Selected Items Table */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Items to Dispatch ({items.length})</span>
              <span className="text-[10px] text-emerald-700 font-bold normal-case">Enter partial or full quantity to ship</span>
            </label>

            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs bg-slate-50">
              <table className="w-full min-w-[560px] text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Req. Qty</th>
                    <th className="p-2.5 text-center">Prev. Shipped</th>
                    <th className="p-2.5 text-center">Remaining</th>
                    <th className="p-2.5 w-32 text-center">Dispatch Now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {items.map(item => {
                    const remaining = Math.max(0, item.requestedQty - item.fulfilledQty);
                    const maxAllowed = remaining > 0 ? remaining : item.requestedQty;
                    const currentShipping = shippedMap[item.id] || 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <span className="text-[10px] text-slate-500 font-medium">{item.brand}</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                          {item.requestedQty} {item.unit}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                          {item.fulfilledQty}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-amber-700">
                          {remaining}
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            max={maxAllowed}
                            value={currentShipping}
                            onChange={(e) => handleQtyChange(item.id, parseFloat(e.target.value) || 0, maxAllowed)}
                            className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 text-center font-mono font-extrabold text-xs text-emerald-700 focus:outline-none focus:border-emerald-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DC & Date Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1">
                <Hash className="w-3.5 h-3.5 text-emerald-600" /> Delivery Challan (DC) #
              </label>
              <input
                type="text"
                value={dcNumber}
                onChange={(e) => setDcNumber(e.target.value)}
                placeholder="e.g. DC-612"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                ✓ Unified Rule: Invoice # matches DC # automatically
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Dispatch Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Transport Details Selector */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-600" />
              Goods Transport & Dispatch Details
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransportType('Adda / Goods Transport')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5 ${
                  transportType === 'Adda / Goods Transport'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                🚚 Adda / Goods Transport (اڈا)
              </button>

              <button
                type="button"
                onClick={() => setTransportType('Pickup / Driver')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5 ${
                  transportType === 'Pickup / Driver'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                🚗 Pickup / Driver (پک اپ)
              </button>
            </div>

            {transportType === 'Adda / Goods Transport' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Adda / Transport Name (اڈے کا نام)
                    </label>
                    <input
                      type="text"
                      value={addaName}
                      onChange={(e) => setAddaName(e.target.value)}
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
                      value={biltyNumber}
                      onChange={(e) => setBiltyNumber(e.target.value)}
                      placeholder="e.g. BL-7891"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Freight / Transport Charges (کرایہ):</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                      <input
                        type="checkbox"
                        checked={isFreightFree}
                        onChange={(e) => {
                          setIsFreightFree(e.target.checked);
                          if (e.target.checked) setFreightCharges('0');
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      FREE / مفت کرایہ
                    </label>

                    {!isFreightFree && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-600">PKR</span>
                        <input
                          type="number"
                          min={0}
                          value={freightCharges}
                          onChange={(e) => setFreightCharges(e.target.value)}
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
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
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
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. STS-1500"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Additional Dispatch Remarks / Notes
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional delivery notes or instructions"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setIsQuickDispatchOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> Save & Issue DC {dcNumber}
          </button>
        </div>

      </div>
    </div>
  );
};
