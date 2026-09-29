import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { performSystemAudit, AuditIssue } from '../lib/systemAudit';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Search, 
  ArrowRight, 
  RefreshCw,
  FileWarning,
  Activity
} from 'lucide-react';

export const SystemAuditView: React.FC = () => {
  const { prs, dcs, setActiveTab } = useApp();
  
  const auditResults = useMemo(() => performSystemAudit(prs, dcs), [prs, dcs]);
  const criticalCount = auditResults.filter(i => i.severity === 'CRITICAL').length;
  const warningCount = auditResults.filter(i => i.severity === 'WARNING').length;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-indigo-600" />
            Intelligent System Monitor
          </h2>
          <p className="text-slate-500 font-medium">
            Scanning database integrity, fulfillment gaps, and OCR mismatches.
          </p>
        </div>
        <button 
          onClick={() => {}} // Logic to force refresh if needed
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-Scan System
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">System Health</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {criticalCount === 0 ? 'HEALTHY' : 'ISSUES FOUND'}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {criticalCount === 0 ? 'No critical errors detected' : `${criticalCount} critical issues require attention`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase">Critical Errors</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900">{criticalCount}</div>
          <p className="text-[11px] text-rose-700 font-medium">Immediate fix required</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase">Warnings</span>
            <FileWarning className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{warningCount}</div>
          <p className="text-[11px] text-amber-700 font-medium">Review recommended</p>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Integrity Report</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{auditResults.length} Total Issues</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {auditResults.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-50" />
              <p className="text-slate-500 font-medium">All records are accurate. No inconsistencies found!</p>
            </div>
          ) : (
            auditResults.map((issue) => (
              <div key={issue.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className={`mt-1 p-1 rounded-full ${
                  issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {issue.severity === 'CRITICAL' ? <AlertTriangle className="w-3 h-3" /> : <FileWarning className="w-3 h-3" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{issue.type.replace('_', ' ')}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{issue.message}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {issue.recordType === 'PR' ? 'Purchase Requisition' : 'Delivery Challan'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{issue.affectedRecordId}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (issue.recordType === 'PR') {
                      // Logic to open PR Edit
                    } else {
                      // Logic to open DC Edit
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all flex items-center gap-1"
                >
                  Fix <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
