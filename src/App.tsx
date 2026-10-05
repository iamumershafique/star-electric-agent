import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LedgerView } from './components/LedgerView';
import { DeliveriesView } from './components/DeliveriesView';
import { BrandAnalytics } from './components/BrandAnalytics';
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
import { ExportReportModal } from './components/ExportReportModal';
import { BuiltyUploadModal } from './components/BuiltyUploadModal';
import { BuiltyPreviewModal } from './components/BuiltyPreviewModal';
import { MobileAccessModal } from './components/MobileAccessModal';
import { GeminiDiagnosticsView } from './components/GeminiDiagnosticsView';
import { SystemAuditView } from './components/SystemAuditView';
import { LoginView } from './components/LoginView';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="w-full flex-1 flex flex-col px-4 sm:px-6 lg:px-10 py-4 max-w-[1920px] mx-auto">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'search' && <SearchAuditView />}
      {activeTab === 'ledger' && <LedgerView />}
      {activeTab === 'deliveries' && <DeliveriesView />}
      {activeTab === 'brands' && <BrandAnalytics />}
      {activeTab === 'gemini-audit' && <GeminiDiagnosticsView />}
      {activeTab === 'system-audit' && <SystemAuditView />}
    </main>
  );
};

const MainPortalLayout: React.FC = () => {
  const { isAuthenticated, isAuthLoading, isExportOpen, setIsExportOpen } = useApp();

  if (isAuthLoading) {
    return (
      <main className="min-h-dvh grid place-items-center bg-slate-50 text-slate-700">
        <p role="status" className="font-semibold">Checking secure sign-in…</p>
      </main>
    );
  }
  if (!isAuthenticated) {
    return <LoginView />;
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
          Dedicated Supply Chain Portal for <strong className="text-blue-700 font-bold">Jadeed Group Poultry Farms Pakistan</strong> • Powered by Google Gemini AI
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
      <ExportReportModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)} 
      />
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
