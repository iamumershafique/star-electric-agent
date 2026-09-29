import React, { useState } from 'react';
import { X, Download, FileText, Building2, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { convertPRsToCSV, convertDCsToCSV, downloadCSV } from '../lib/exportUtils';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const { prs, dcs, sites } = useApp();
  const [exportType, setExportType] = useState<'PR' | 'DC'>('PR');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleExport = () => {
    const options = {
      siteFilter: selectedSite === 'ALL' ? undefined : selectedSite,
    };

    if (exportType === 'PR') {
      const csv = convertPRsToCSV(prs, options);
      downloadCSV(`PR_Fulfillment_Report_${new Date().toISOString().split('T')[0]}`, csv);
    } else {
      const csv = convertDCsToCSV(dcs, options);
      downloadCSV(`DC_Delivery_Report_${new Date().toISOString().split('T')[0]}`, csv);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-800">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Export Reports</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Report Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportType('PR')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  exportType === 'PR' 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                PR Fulfillment
              </button>
              <button
                onClick={() => setExportType('DC')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  exportType === 'DC' 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                DC Delivery
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Filter by Site
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-indigo-500 shadow-sm appearance-none"
              >
                <option value="ALL">All Sites (Global Report)</option>
                {sites.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download .CSV Report
        </button>
      </div>
    </div>
  );
};
