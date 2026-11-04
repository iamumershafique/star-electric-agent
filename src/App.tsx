import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LedgerView } from './components/LedgerView';
import { DeliveriesView } from './components/DeliveriesView';
import { PRUploadModal } from './components/PRUploadModal';
import { PRReviewModal } from './components/PRReviewModal';
import { DCUploadModal } from './components/DCUploadModal';
import { DuplicateWarningModal } from './components/DuplicateWarningModal';
import { PRDetailModal } from './components/PRDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { MasterResetModal } from './components/MasterResetModal';
import { QuickDispatchModal } from './components/QuickDispatchModal';
import { SearchAuditView } from './components/SearchAuditView';
import { PREditModal } from './components/PREditModal';
import { DCEditModal } from './components/DCEditModal';
import { BuiltyUploadModal } from './components/BuiltyUploadModal';
import { BuiltyPreviewModal } from './components/BuiltyPreviewModal';
import { MobileAccessModal } from './components/MobileAccessModal';
import { GeminiDiagnosticsView } from './components/GeminiDiagnosticsView';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="w-full flex-1 flex flex-col px-4 sm:px-6 lg:px-10 py-4 max-w-[1920px] mx-auto">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'search' && <SearchAuditView />}
      {activeTab === 'ledger' && <LedgerView />}
      {activeTab === 'deliveries' && <DeliveriesView />}
      {activeTab === 'gemini-audit' && <GeminiDiagnosticsView />}
    </main>
  );
};

const MainPortalLayout: React.FC = () => {
  const { isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <main className="min-h-dvh grid place-items-center bg-slate-50 text-slate-700">
        <p role="status" className="font-semibold">Loading portal...</p>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-clip">
      <Navbar />
      <MainContent />

      {/* Full-width Light Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-600">
        <p className="font-semibold text-slate-700">
          © {new Date().getFullYear()} STAR ELECTRIC ENTERPRISES — Saddar, Rawalpindi.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
          Supply chain portal for Jadeed Group Poultry Farms Pakistan
        </p>
      </footer>

      {/* All Modals */}
      <PRUploadModal />
      <PRReviewModal />
      <DCUploadModal />
      <DuplicateWarningModal />
      <PRDetailModal />
      <SettingsModal />
      <MasterResetModal />
      <QuickDispatchModal />
      <PREditModal />
      <DCEditModal />
      <BuiltyUploadModal />
      <BuiltyPreviewModal />
      <MobileAccessModal />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainPortalLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
