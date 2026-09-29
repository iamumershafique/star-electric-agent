import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  X, 
  KeyRound, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

export const MasterResetModal: React.FC = () => {
  const { 
    isMasterResetOpen, 
    setIsMasterResetOpen, 
    performMasterReset 
  } = useApp();

  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isMasterResetOpen) return null;

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = performMasterReset(passwordInput);

    if (res.success) {
      setSuccessMsg('Master Reset Successful! Database has been wiped to a 100% fresh empty state.');
      setPasswordInput('');
      setTimeout(() => {
        setSuccessMsg(null);
        setIsMasterResetOpen(false);
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Incorrect Security Password (2214 required)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-rose-300 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Master Reset Database
              </h3>
              <p className="text-xs text-rose-800 font-bold">Security Password Authorization Required</p>
            </div>
          </div>

          <button
            onClick={() => setIsMasterResetOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1 font-medium">
          <p className="font-bold text-rose-900">⚠️ Warning: Master Reset Operation</p>
          <p>
            Executing a Master Reset will permanently wipe all Purchase Requisitions, Delivery Challans, and Invoices, leaving a 100% fresh, blank database for live production data.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleExecuteReset} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <KeyRound className="w-4 h-4 text-rose-600" /> Enter Security Password
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password (2214)"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-rose-500 shadow-2xs"
            />
            <span className="text-[10px] text-slate-500 font-bold mt-1 block">
              Authorized Password: <strong className="text-slate-900 font-mono">2214</strong>
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMasterResetOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Confirm Master Reset
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
