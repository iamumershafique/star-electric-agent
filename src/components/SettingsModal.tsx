import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  X, 
  Key, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Smartphone,
  QrCode,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import {
  getGeminiApiKey,
  getOllamaSettings,
  saveOllamaSettings,
  DEFAULT_OLLAMA_SETTINGS,
  type OllamaSettings
} from '../lib/storage';
import { validateGeminiApiKey } from '../lib/gemini';
import { testOllamaConnection, warmUpOllama } from '../lib/ollama';
import { cleanApiKey } from '../lib/utils';
import { SCAN_QUALITY_HELP, SCAN_QUALITY_LABEL, SCAN_QUALITY_ORDER, normalizeScanQuality } from '../lib/scanQuality';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    geminiApiKey, 
    updateGeminiApiKey, 
    exportBackupJSON,
    importBackupJSON,
    setIsMasterResetOpen,
    setIsMobileAccessOpen,
    publicUrl
  } = useApp();

  const [inputKey, setInputKey] = useState(geminiApiKey || '');
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>(() => getOllamaSettings());
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [showOllamaSetup, setShowOllamaSetup] = useState(false);
  const [ollamaTestResult, setOllamaTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    model?: string;
  }>({ status: 'idle', message: '' });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const currentPortalUrl = publicUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://star-agent-jpf.web.app');

  // Sync input whenever modal opens or geminiApiKey state changes
  useEffect(() => {
    if (isSettingsOpen) {
      setInputKey('');
      setOllamaSettings(getOllamaSettings());
      setTestResult({ status: 'idle', message: '' });
      setOllamaTestResult({ status: 'idle', message: '' });
      setImportStatus(null);
    }
  }, [isSettingsOpen, geminiApiKey]);

  if (!isSettingsOpen) return null;

  const handleSaveAndTest = async () => {
    const cleaned = cleanApiKey(inputKey);
    if (!cleaned) {
      setTestResult({
        status: 'error',
        message: 'Please paste your Google Gemini API key first.'
      });
      return;
    }

    // Save immediately so state & local storage are updated
    updateGeminiApiKey(cleaned);
    setInputKey('');
    setIsTesting(true);
    setTestResult({ status: 'idle', message: '' });

    try {
      const res = await validateGeminiApiKey(cleaned);
      if (res.valid) {
        setTestResult({
          status: 'success',
          message: `API Key verified & linked! Gemini is ready for live OCR scanning.`,
          model: res.model || 'gemini-3.6-flash'
        });
      } else {
        setTestResult({
          status: 'error',
          message: res.error || 'Connection failed. Please check the API key format and permissions.'
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err?.message || 'Unable to reach Google Gemini API. Check your internet connection.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestOnly = async () => {
    const keyToTest = cleanApiKey(inputKey) || geminiApiKey || getGeminiApiKey();
    if (!keyToTest) {
      setTestResult({
        status: 'error',
        message: 'No API key provided to test. Please enter a Gemini API key.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: 'idle', message: '' });

    try {
      const res = await validateGeminiApiKey(keyToTest);
      if (res.valid) {
        setTestResult({
          status: 'success',
          message: `Connection successful! Active model: ${res.model || 'gemini-3.6-flash'}`,
          model: res.model
        });
      } else {
        setTestResult({
          status: 'error',
          message: res.error || 'Connection failed. Please check your API key.'
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err?.message || 'Failed to connect to Google Gemini API.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearKey = () => {
    updateGeminiApiKey('');
    setInputKey('');
    setTestResult({
      status: 'idle',
      message: 'Gemini API key disconnected. Ollama remains active if enabled.'
    });
  };

  const updateOllama = (patch: Partial<OllamaSettings>) => {
    setOllamaSettings(current => ({ ...current, ...patch }));
    setOllamaTestResult({ status: 'idle', message: '' });
  };

  const handleSaveAndTestOllama = async () => {
    const next: OllamaSettings = {
      ...ollamaSettings,
      baseUrl: ollamaSettings.baseUrl.trim().replace(/\/+$/, '') || DEFAULT_OLLAMA_SETTINGS.baseUrl,
      visionModel: ollamaSettings.visionModel.trim() || DEFAULT_OLLAMA_SETTINGS.visionModel,
      timeoutSeconds: Math.max(30, Math.round(ollamaSettings.timeoutSeconds) || DEFAULT_OLLAMA_SETTINGS.timeoutSeconds)
    };
    setIsTestingOllama(true);
    setOllamaTestResult({ status: 'idle', message: '' });
    const result = await testOllamaConnection(next);
    setOllamaModels(result.models || []);
    saveOllamaSettings({ ...next, enabled: next.enabled && result.valid });
    setOllamaSettings({ ...next, enabled: next.enabled && result.valid });
    if (result.valid) {
      // Start loading the model now so the next scan does not pay for the model load.
      void warmUpOllama(next);
    }
    setOllamaTestResult(result.valid
      ? {
          status: 'success',
          message: next.enabled
            ? `Connected to Ollama ${result.version || ''}. PR, DC and builty OCR will use ${next.visionModel} at ${SCAN_QUALITY_LABEL[next.scanQuality]}${hasLinkedKey ? ', with Gemini as fallback' : ''}.`
            : `Connected to Ollama ${result.version || ''} and ${next.visionModel} is installed. Tick "Use Ollama" to switch OCR to it.`
        }
      : { status: 'error', message: result.error || 'Ollama connection failed.' });
    setIsTestingOllama(false);
  };

  const handleDisableOllama = () => {
    const next = { ...ollamaSettings, enabled: false };
    saveOllamaSettings(next);
    setOllamaSettings(next);
    setOllamaTestResult({ status: 'idle', message: 'Ollama disabled. OCR uses Gemini if its key is saved.' });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus('Database imported successfully!');
        } else {
          setImportStatus('Failed to import backup file. Invalid format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const hasLinkedKey = Boolean(geminiApiKey && geminiApiKey.trim());
  const maskedKey = hasLinkedKey 
    ? `${geminiApiKey.substring(0, 6)}••••••••••••${geminiApiKey.slice(-4)}`
    : '';
  const ollamaActive = ollamaSettings.enabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden text-slate-900 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Settings & API Configuration
              </h3>
              <p className="text-xs text-slate-500 font-medium">AI OCR provider & data management</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini API Key Section */}
        <div className="space-y-4 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Google Gemini API Key
            </label>

            {hasLinkedKey ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {ollamaActive ? 'Linked (fallback to Ollama)' : 'Linked & Active'}
              </span>
            ) : ollamaActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                Ollama OCR Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                Offline Simulator Mode
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Gemini is the cloud fallback. When Ollama is enabled it reads documents first, and Gemini is only used if Ollama is off, times out, or cannot read a scan.
          </p>

          {/* Current saved status banner */}
          {hasLinkedKey && (
            <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-medium font-mono text-[11px]">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>{maskedKey}</span>
              </div>
              <button
                onClick={handleClearKey}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline"
                title="Disconnect API Key"
              >
                <Trash2 className="w-3 h-3" /> Disconnect
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="space-y-2">
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestResult({ status: 'idle', message: '' });
                }}
                placeholder={hasLinkedKey ? 'Saved key available; paste to replace' : 'AIzaSy...'}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                title={showKey ? 'Hide Key' : 'Show Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndTest}
                disabled={isTesting || !inputKey.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Linking & Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    Save & Link API Key
                  </>
                )}
              </button>

              <button
                onClick={handleTestOnly}
                disabled={isTesting || (!inputKey.trim() && !hasLinkedKey)}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                title="Test Gemini API Connection"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                )}
                Test
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {testResult.status === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium space-y-1 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                API Key Linked & Verified!
              </div>
              <p className="text-[11px] text-emerald-700">
                {testResult.message}
              </p>
            </div>
          )}

          {testResult.status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-medium space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                API Connection Issue
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed font-mono">
                {testResult.message}
              </p>
              <div className="pt-1 text-[10px] text-rose-600 border-t border-rose-200">
                Tip: Make sure the Generative Language API is enabled for your key in Google AI Studio or Google Cloud Console.
              </div>
            </div>
          )}

          {/* Helper Link */}
          <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Need a free Gemini API key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 font-bold hover:text-amber-950 flex items-center gap-1 hover:underline"
            >
              Get Key from Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Local Ollama (OCR + document audit) */}
        <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Local Ollama (this PC)
            </label>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              ollamaActive
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
              {ollamaActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
              {ollamaActive ? 'Primary OCR & audit' : 'Disabled'}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Reads PR, DC and builty scans and runs the PR/DC document audit with a vision model on this computer. Documents never leave the PC. On a CPU-only machine expect roughly 40–90 seconds per scan.
          </p>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={ollamaSettings.enabled}
              onChange={event => updateOllama({ enabled: event.target.checked })}
              className="accent-emerald-600"
            />
            Use Ollama for OCR and audit
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="text-[11px] font-bold text-slate-700 space-y-1">
              <span>Ollama URL</span>
              <input
                type="url"
                value={ollamaSettings.baseUrl}
                onChange={event => updateOllama({ baseUrl: event.target.value })}
                placeholder={DEFAULT_OLLAMA_SETTINGS.baseUrl}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <label className="text-[11px] font-bold text-slate-700 space-y-1">
              <span>Vision model</span>
              <input
                list="ollama-models"
                value={ollamaSettings.visionModel}
                onChange={event => updateOllama({ visionModel: event.target.value })}
                placeholder={DEFAULT_OLLAMA_SETTINGS.visionModel}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="ollama-models">
                {ollamaModels.map(model => <option key={model} value={model} />)}
              </datalist>
            </label>
            <label className="text-[11px] font-bold text-slate-700 space-y-1">
              <span>Timeout per scan (seconds)</span>
              <input
                type="number"
                min={30}
                step={30}
                value={ollamaSettings.timeoutSeconds}
                onChange={event => updateOllama({ timeoutSeconds: Number(event.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <label className="text-[11px] font-bold text-slate-700 space-y-1">
              <span>Scan read quality (speed)</span>
              <select
                value={ollamaSettings.scanQuality}
                onChange={event => updateOllama({ scanQuality: normalizeScanQuality(event.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SCAN_QUALITY_ORDER.map(quality => (
                  <option key={quality} value={quality}>{SCAN_QUALITY_LABEL[quality]}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
            {SCAN_QUALITY_HELP[ollamaSettings.scanQuality]}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSaveAndTestOllama}
              disabled={isTestingOllama}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isTestingOllama ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Save &amp; Test Connection
            </button>
            {ollamaActive && (
              <button
                onClick={handleDisableOllama}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
              >
                Disable
              </button>
            )}
          </div>

          {ollamaTestResult.status !== 'idle' && (
            <div className={`p-3 rounded-lg border text-xs ${
              ollamaTestResult.status === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {ollamaTestResult.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {ollamaTestResult.status === 'success' ? 'Ollama connected' : 'Ollama connection issue'}
              </div>
              <p className="text-[11px] mt-1">{ollamaTestResult.message}</p>
            </div>
          )}
          {ollamaTestResult.status === 'idle' && ollamaTestResult.message && (
            <p className="text-[11px] text-slate-600">{ollamaTestResult.message}</p>
          )}

          <div className="pt-1 border-t border-emerald-200">
            <button
              onClick={() => setShowOllamaSetup(!showOllamaSetup)}
              className="text-[11px] font-bold text-emerald-800 hover:underline"
            >
              {showOllamaSetup ? 'Hide setup steps' : 'First-time setup on this PC'}
            </button>
            {showOllamaSetup && (
              <ol className="mt-2 list-decimal pl-4 space-y-1.5 text-[11px] text-slate-700">
                <li>Install Ollama for Windows from ollama.com and let it start.</li>
                <li>
                  In PowerShell, download the vision model:
                  <code className="block mt-1 p-1.5 rounded bg-slate-900 text-emerald-200 font-mono select-all">ollama pull {ollamaSettings.visionModel || DEFAULT_OLLAMA_SETTINGS.visionModel}</code>
                </li>
                <li>
                  Allow this portal to call Ollama, then quit Ollama from the tray and start it again:
                  <code className="block mt-1 p-1.5 rounded bg-slate-900 text-emerald-200 font-mono select-all break-all">setx OLLAMA_ORIGINS "{currentPortalUrl},http://localhost:5173"</code>
                </li>
                <li>If Chrome asks to allow access to devices on your local network, click Allow.</li>
                <li>Tick "Use Ollama", then Save &amp; Test Connection.</li>
              </ol>
            )}
          </div>
        </div>

        {/* Mobile Access & Tablet Link Section (Moved from Navbar) */}
        <div className="space-y-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              Mobile &amp; Remote Tablet Access
            </label>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
              Live Cloud Access
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Open Star Electric Portal on mobile phones, tablets, or warehouse devices without installation.
          </p>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
            <div className="flex-1 truncate font-mono text-[11px] text-slate-700 font-semibold pl-1 select-all">
              {currentPortalUrl}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentPortalUrl);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2500);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              title="Copy Portal URL to Clipboard"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              setIsSettingsOpen(false);
              setIsMobileAccessOpen(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Mobile QR Code &amp; Scanner Screen</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
          </button>
        </div>

        {/* Database Backup Section */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            Database Backup &amp; Portability
          </label>
          <p className="text-[11px] text-slate-600 font-medium">
            Export database JSON for offline archiving or restore data from a previous backup file.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportBackupJSON}
              className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" /> Export JSON
            </button>

            <label className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-blue-600" /> Import JSON
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>

          {importStatus && (
            <div className="text-[11px] text-amber-800 font-bold">
              {importStatus}
            </div>
          )}
        </div>

        {/* Master Reset Danger Zone (Moved from Navbar) */}
        <div className="space-y-3 bg-rose-50/70 p-4 rounded-xl border border-rose-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Master Database Reset
            </label>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
              Password: 2214
            </span>
          </div>

          <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
            Permanently wipes all Purchase Requisitions, Delivery Challans, and Invoices back to a 100% clean slate for live production data.
          </p>

          <button
            onClick={() => {
              setIsSettingsOpen(false);
              setIsMasterResetOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Execute Master Reset (Wipe All Records)</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-200 flex justify-end items-center">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
