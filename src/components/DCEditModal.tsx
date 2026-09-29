import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { TransportType } from '../types';
import { 
  X, 
  Truck, 
  Save, 
  Calendar, 
  Building2, 
  Hash, 
  AlertCircle,
  PackageCheck,
  Package,
  Camera,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const DCEditModal: React.FC = () => {
  const { 
    isDCEditOpen, 
    setIsDCEditOpen, 
    editingDC, 
    setEditingDC, 
    updateDC,
    sites,
    setIsBuiltyUploadOpen,
    setTargetBuiltyDC,
    setSelectedBuiltyPreview
  } = useApp();

  const [dcNumber, setDcNumber] = useState('');
  const [date, setDate] = useState('');
  const [siteName, setSiteName] = useState('');
  const [transportType, setTransportType] = useState<TransportType>('Adda / Goods Transport');
  const [addaName, setAddaName] = useState('');
  const [biltyNumber, setBiltyNumber] = useState('');
  const [packagesCount, setPackagesCount] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [freightCharges, setFreightCharges] = useState('0');
  const [isFreightFree, setIsFreightFree] = useState(true);
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [shippedItems, setShippedItems] = useState<
    { itemId: string; itemName: string; brand: string; quantity: number; unit: string }[]
  >([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingDC) {
      setDcNumber(editingDC.dcNumber || '');
      setDate(editingDC.date || new Date().toISOString().split('T')[0]);
      setSiteName(editingDC.siteName || '');
      setTransportType(editingDC.transportType || 'Adda / Goods Transport');
      setAddaName(editingDC.addaName || '');
      setBiltyNumber(editingDC.biltyNumber || '');
      setPackagesCount(editingDC.packagesCount ? String(editingDC.packagesCount) : '');
      setDestinationCity(editingDC.destinationCity || '');
      setFreightCharges(String(editingDC.freightCharges || 0));
      setIsFreightFree(editingDC.isFreightFree ?? true);
      setDriverName(editingDC.driverName || '');
      setVehicleNumber(editingDC.vehicleNumber || '');
      setRemarks(editingDC.remarks || '');
      setShippedItems(editingDC.itemsShipped ? editingDC.itemsShipped.map(i => ({ ...i })) : []);
      setErrorMsg(null);
    }
  }, [editingDC, isDCEditOpen]);

  if (!isDCEditOpen || !editingDC) return null;

  const handleItemQtyChange = (index: number, qty: number) => {
    setShippedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: Math.max(0, qty) };
      return updated;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanDCNumber = dcNumber.trim();
    if (!cleanDCNumber) {
      setErrorMsg('Delivery Challan Number is required.');
      return;
    }

    if (!siteName.trim()) {
      setErrorMsg('Destination Farm Site is required.');
      return;
    }

    const updatedDC = {
      ...editingDC,
      dcNumber: cleanDCNumber,
      invoiceNumber: cleanDCNumber, // strictly unified with DC number
      date,
      siteName: siteName.trim(),
      transportType,
      addaName: transportType === 'Adda / Goods Transport' ? addaName.trim() : undefined,
      biltyNumber: transportType === 'Adda / Goods Transport' ? biltyNumber.trim() : undefined,
      packagesCount: transportType === 'Adda / Goods Transport' && packagesCount ? packagesCount.trim() : editingDC.packagesCount,
      destinationCity: transportType === 'Adda / Goods Transport' && destinationCity ? destinationCity.trim() : editingDC.destinationCity,
      freightCharges: transportType === 'Adda / Goods Transport' ? (isFreightFree ? 0 : parseFloat(freightCharges) || 0) : undefined,
      isFreightFree: transportType === 'Adda / Goods Transport' ? isFreightFree : undefined,
      driverName: transportType === 'Pickup / Driver' ? driverName.trim() : undefined,
      vehicleNumber: transportType === 'Pickup / Driver' ? vehicleNumber.trim() : undefined,
      remarks: remarks.trim(),
      itemsShipped: shippedItems
    };

    updateDC(updatedDC);
    setIsDCEditOpen(false);
    setEditingDC(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-6 max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Edit Delivery Challan: <span className="font-mono text-emerald-700">{editingDC.dcNumber}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Linked Requisition: <span className="font-mono font-bold text-blue-700">PR #{editingDC.prNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsDCEditOpen(false);
              setEditingDC(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto space-y-5 pr-1 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <Hash className="w-3.5 h-3.5 text-emerald-600" /> DC & Invoice Number *
              </label>
              <input
                type="text"
                value={dcNumber}
                onChange={(e) => setDcNumber(e.target.value)}
                placeholder="e.g. DC-613"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Dispatch Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Destination Site *
              </label>
              <input
                type="text"
                list="dc-sites-list"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Jadeed Farm Site..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold focus:outline-none focus:border-emerald-500"
                required
              />
              <datalist id="dc-sites-list">
                {sites.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Transport Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" /> Transport & Carrier Details
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTransportType('Delivered')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    transportType === 'Delivered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ✅ Delivered (Direct)
                </button>
                <button
                  type="button"
                  onClick={() => setTransportType('Adda / Goods Transport')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    transportType === 'Adda / Goods Transport'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🚚 Goods Adda
                </button>
                <button
                  type="button"
                  onClick={() => setTransportType('Pickup / Driver')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    transportType === 'Pickup / Driver'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  🚗 Driver / Truck
                </button>
              </div>
            </div>

            {transportType === 'Delivered' && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                Marked as directly delivered to site. You can switch to Goods Adda or Driver/Truck above if you wish to record specific bilty or carrier details.
              </div>
            )}

            {transportType === 'Adda / Goods Transport' ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Transport Adda Name</label>
                    <input
                      type="text"
                      value={addaName}
                      onChange={(e) => setAddaName(e.target.value)}
                      placeholder="e.g. Rawalpindi Goods Transport"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Bilty Number</label>
                    <input
                      type="text"
                      value={biltyNumber}
                      onChange={(e) => setBiltyNumber(e.target.value)}
                      placeholder="e.g. BL-8412"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600">Freight Charges (PKR)</label>
                      <label className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFreightFree}
                          onChange={(e) => setIsFreightFree(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        Free (مفت)
                      </label>
                    </div>
                    <input
                      type="number"
                      disabled={isFreightFree}
                      value={isFreightFree ? '0' : freightCharges}
                      onChange={(e) => setFreightCharges(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Destination City / Hub</label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      placeholder="e.g. Khanewal / Mankera / Sahiwal"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Number of Packages / Bundles</label>
                    <input
                      type="number"
                      value={packagesCount}
                      onChange={(e) => setPackagesCount(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Driver / Transporter Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Nawaz"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. STS-1500"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Remarks / Notes</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Delivered directly to site supervisor"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Builty Photo Integration */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  Goods Delivered Builty Picture
                </span>

                {editingDC.isBuiltyAttached && editingDC.builtyImage ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-300">
                    Not Attached
                  </span>
                )}
              </div>

              {editingDC.isBuiltyAttached && editingDC.builtyImage ? (
                <div className="mt-2 p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={editingDC.builtyImage} 
                      alt="Builty Thumbnail" 
                      className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {editingDC.biltyNumber ? `Builty #${editingDC.biltyNumber}` : 'Builty Receipt'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {editingDC.addaName || 'Goods Transport'} {editingDC.destinationCity ? `• ${editingDC.destinationCity}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBuiltyPreview({
                        url: editingDC.builtyImage || '',
                        title: `Builty Receipt — ${editingDC.dcNumber}`,
                        biltyNumber: editingDC.biltyNumber,
                        addaName: editingDC.addaName,
                        destinationCity: editingDC.destinationCity,
                        packagesCount: editingDC.packagesCount,
                        freightCharges: editingDC.freightCharges,
                        freightStatus: editingDC.freightStatus,
                        dcNumber: editingDC.dcNumber,
                        siteName: editingDC.siteName,
                        date: editingDC.builtyDate || editingDC.date
                      })}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetBuiltyDC(editingDC);
                        setIsBuiltyUploadOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-3 bg-slate-100/70 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    No builty picture attached yet. You can attach a photo anytime to extract transport details.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetBuiltyDC(editingDC);
                      setIsBuiltyUploadOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" /> + Attach Builty Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Shipped Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" /> Shipped Items & Quantities ({shippedItems.length})
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full min-w-[560px] text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3 text-center w-36">Shipped Quantity</th>
                    <th className="p-3 text-center w-24">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {shippedItems.map((item, idx) => (
                    <tr key={item.itemId || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{item.itemName}</td>
                      <td className="p-3 text-slate-600 font-semibold">{item.brand}</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleItemQtyChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 rounded bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-center text-emerald-700 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-600">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Updating quantities will automatically recalculate fulfillment in PR #{editingDC.prNumber}.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDCEditOpen(false);
                  setEditingDC(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
