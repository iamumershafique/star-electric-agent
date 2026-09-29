import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { LineItem, BrandCategory } from '../types';
import { generateId, normalizeBrand } from '../lib/utils';
import { 
  X, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  Building2, 
  Calendar, 
  User, 
  FileText, 
  AlertCircle,
  Hash
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

const UNIT_OPTIONS = ['Meters', 'Numbers', 'Pcs', 'Feet', 'Lengths', 'Coil', 'Sets', 'Bags'];

export const PREditModal: React.FC = () => {
  const { 
    isPREditOpen, 
    setIsPREditOpen, 
    editingPR, 
    setEditingPR, 
    updateExistingPR,
    sites 
  } = useApp();

  const [prNumber, setPrNumber] = useState('');
  const [date, setDate] = useState('');
  const [siteName, setSiteName] = useState('');
  const [isCustomSite, setIsCustomSite] = useState(false);
  const [customSiteName, setCustomSiteName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingPR) {
      setPrNumber(editingPR.prNumber || '');
      setDate(editingPR.date || new Date().toISOString().split('T')[0]);
      
      const matchedSite = sites.find(s => s.name.toLowerCase() === editingPR.siteName.toLowerCase());
      if (matchedSite) {
        setSiteName(matchedSite.name);
        setIsCustomSite(false);
        setCustomSiteName('');
      } else {
        setSiteName(editingPR.siteName || '');
        setIsCustomSite(true);
        setCustomSiteName(editingPR.siteName || '');
      }

      setContactPerson(editingPR.contactPerson || '');
      setNotes(editingPR.notes || '');
      setItems(editingPR.items.map(item => ({ ...item })));
      setErrorMsg(null);
    }
  }, [editingPR, isPREditOpen, sites]);

  if (!isPREditOpen || !editingPR) return null;

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: generateId('item'),
      name: '',
      brand: 'Pakistan Cables',
      requestedQty: 1,
      fulfilledQty: 0,
      unit: 'Numbers',
      status: 'Pending',
      specifications: ''
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setErrorMsg('A requisition must have at least one line item.');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPRNum = prNumber.trim();
    if (!cleanPRNum) {
      setErrorMsg('PR Number is required.');
      return;
    }

    const finalSite = isCustomSite ? customSiteName.trim() : siteName.trim();
    if (!finalSite) {
      setErrorMsg('Farm Site Location is required.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Please add at least one line item.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].name.trim()) {
        setErrorMsg(`Item #${i + 1} is missing a description/name.`);
        return;
      }
      if (items[i].requestedQty <= 0) {
        setErrorMsg(`Item #${i + 1} (${items[i].name}) must have a requested quantity greater than 0.`);
        return;
      }
    }

    const updatedPR = {
      ...editingPR,
      prNumber: cleanPRNum,
      date,
      siteName: finalSite,
      contactPerson: contactPerson.trim(),
      notes: notes.trim(),
      items: items.map(i => ({
        ...i,
        name: i.name.trim(),
        brand: normalizeBrand(i.brand),
        specifications: i.specifications ? i.specifications.trim() : ''
      }))
    };

    updateExistingPR(updatedPR);
    setIsPREditOpen(false);
    setEditingPR(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Edit Purchase Requisition: <span className="font-mono text-amber-700">{editingPR.prNumber}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Modify requisition details, site location, and electrical line items</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsPREditOpen(false);
              setEditingPR(null);
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

          {/* Primary Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-600" /> PR Tracking Number *
              </label>
              <input
                type="text"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
                placeholder="e.g. PR 01, PR-JAD-2026-613"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Requisition Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Supervisor / Contact
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Engr. Tariq Mahmood"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Destination Jadeed Farm Site Location *
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={isCustomSite ? 'CUSTOM' : siteName}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomSite(true);
                      } else {
                        setIsCustomSite(false);
                        setSiteName(e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold focus:outline-none focus:border-amber-500"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="CUSTOM">+ Custom / Other Farm Location...</option>
                  </select>
                </div>
                {isCustomSite && (
                  <input
                    type="text"
                    value={customSiteName}
                    onChange={(e) => setCustomSiteName(e.target.value)}
                    placeholder="Enter full farm location name..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-amber-300 text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Notes & Instructions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Shed #4 expansion project"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Electrical Line Items ({items.length})
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3 w-8 text-center">#</th>
                      <th className="p-3 min-w-[200px]">Item Description *</th>
                      <th className="p-3 min-w-[150px]">Brand Tag</th>
                      <th className="p-3 w-28 text-center">Req Qty *</th>
                      <th className="p-3 w-28 text-center">Shipped Qty</th>
                      <th className="p-3 w-28 text-center">Unit</th>
                      <th className="p-3 min-w-[150px]">Specifications / Details</th>
                      <th className="p-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            placeholder="Item name / cable / breaker..."
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-bold focus:outline-none focus:border-amber-500"
                            required
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={item.brand}
                            onChange={(e) => handleItemChange(idx, 'brand', e.target.value as BrandCategory)}
                            className="w-full px-2 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
                          >
                            {BRAND_OPTIONS.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQty}
                            onChange={(e) => handleItemChange(idx, 'requestedQty', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                            required
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.fulfilledQty}
                            onChange={(e) => handleItemChange(idx, 'fulfilledQty', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-emerald-700 text-center focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-24 px-2 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-semibold text-center focus:outline-none focus:border-amber-500"
                          >
                            {UNIT_OPTIONS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.specifications || ''}
                            onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                            placeholder="e.g. 600/1000V XLPE, 4-Pole"
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-medium focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Line Item"
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

          {/* Footer Controls */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium">
              Changes will update the master ledger and all connected delivery tracking.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPREditOpen(false);
                  setEditingPR(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
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
