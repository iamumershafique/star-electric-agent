import React from 'react';
import { useApp } from '../context/AppContext';
import type { NavigationTab } from '../types';
import { Plus, Settings, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, setIsPRUploadOpen, setIsDCUploadOpen, setIsSettingsOpen, prs, dcs, logout } = useApp();

  const pendingPRsCount = prs.filter(p => p.status === 'Pending').length;
  const unlinkedCount = dcs.filter(d => !d.prId || d.prNumber === 'NO PR').length;

  const tabs: { id: NavigationTab; label: string; count?: number }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'ledger', label: 'Requisitions', count: pendingPRsCount },
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'search', label: 'Search' },
    { id: 'gemini-audit', label: 'Assistant', count: unlinkedCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-300 bg-white">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-2 px-4 py-2 sm:px-6 lg:px-10 xl:h-14 xl:flex-row xl:items-center xl:justify-between xl:py-0">
        <div className="flex shrink-0 items-center gap-3">
          <img
            src="/star-electric-logo.png"
            alt="Star Electric"
            className="h-8 w-auto cursor-pointer object-contain"
            onClick={() => setActiveTab('dashboard')}
          />
          <span className="hidden border-l border-slate-300 pl-3 text-sm font-semibold text-slate-700 sm:inline">Jadeed Group Portal</span>
        </div>

        <nav aria-label="Main navigation" className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-slate-100 text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {!!tab.count && (
                <span className="rounded-full bg-slate-200 px-1.5 text-[10px] font-semibold tabular-nums text-slate-700">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setIsDCUploadOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Record DC</span>
          </button>
          <button
            onClick={() => setIsPRUploadOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New PR</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="cursor-pointer rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={logout}
            className="cursor-pointer rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
