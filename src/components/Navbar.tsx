import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileUp, 
  Truck, 
  Settings, 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  Search, 
  LogOut 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsPRUploadOpen, 
    setIsDCUploadOpen, 
    setIsSettingsOpen,
    prs,
    dcs,
    logout
  } = useApp();

  const pendingPRsCount = prs.filter(p => p.status === 'Pending').length;
  const unlinkedCount = dcs.filter(d => !d.prId || d.prNumber === 'NO PR').length;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 w-full shadow-2xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 xl:h-14 flex flex-col xl:flex-row xl:items-center justify-between gap-2 xl:gap-3">
        
        {/* 1. Left: Logo & Minimal Brand Tag */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <img 
            src="/star-electric-logo.png" 
            alt="Star Electric" 
            className="h-8 w-auto object-contain cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => setActiveTab('dashboard')}
          />
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-xs font-black text-slate-900 tracking-tight">STAR ELECTRIC</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-semibold">Jadeed Group Portal</span>
          </div>
        </div>

        {/* 2. Center: Minimal Clean Navigation Tabs (One-Liner) */}
        <nav aria-label="Main navigation" className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 min-w-0 w-full xl:w-auto xl:justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'ledger' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Requisitions</span>
            {pendingPRsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] rounded-full font-black bg-rose-500 text-white">
                {pendingPRsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deliveries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'deliveries'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className={`w-3.5 h-3.5 ${activeTab === 'deliveries' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>Deliveries</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${activeTab === 'search' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'brands' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini-audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              activeTab === 'gemini-audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'gemini-audit' ? 'text-amber-400' : 'text-amber-500'}`} />
            <span>AI Assistant</span>
            {unlinkedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] rounded-full font-black bg-amber-500 text-white">
                {unlinkedCount}
              </span>
            )}
          </button>
        </nav>

        {/* 3. Right: Stretched One-Liner Actions (Minimalist) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Action 1: Upload Delivery Challan */}
          <button
            onClick={() => setIsDCUploadOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Scan or record a Delivery Challan (DC)"
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Record DC</span>
          </button>

          {/* Action 2: Upload Demand PR */}
          <button
            onClick={() => setIsPRUploadOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#fd2729] hover:bg-[#e0191b] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Upload Demand Purchase Requisition (PR)"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ New PR</span>
          </button>

          {/* Settings & Logout Controls */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Settings (AI Configuration, Mobile Link & Master Reset)"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Log out of Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
