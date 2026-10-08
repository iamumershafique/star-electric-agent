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
  ShieldAlert,
  Cloud
} from 'lucide-react';
import {
  getAgentRouterApiKey,
  getAgentRouterModel,
  getClaudeApiKey,
  getGeminiApiKey,
  getOpenAIApiKey,
  saveAgentRouterApiKey,
  saveAgentRouterModel,
  saveClaudeApiKey,
  saveOpenAIApiKey
} from '../lib/storage';
import { validateGeminiApiKey } from '../lib/gemini';
import { validateOpenAIApiKey } from '../lib/openai';
import { validateAgentRouterApiKey, validateClaudeApiKey } from '../lib/claude';
import { cleanApiKey } from '../lib/utils';

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
    publicUrl,
    pushAllToCloud
  } = useApp();

  const [inputKey, setInputKey] = useState(geminiApiKey || '');
  const [inputOpenAIKey, setInputOpenAIKey] = useState('');
  const [savedOpenAIKey, setSavedOpenAIKey] = useState(() => getOpenAIApiKey());
  const [inputClaudeKey, setInputClaudeKey] = useState('');
  const [savedClaudeKey, setSavedClaudeKey] = useState(() => getClaudeApiKey());
  const [inputAgentRouterKey, setInputAgentRouterKey] = useState('');
  const [savedAgentRouterKey, setSavedAgentRouterKey] = useState(() => getAgentRouterApiKey());
  const [agentRouterModel, setAgentRouterModel] = useState(() => getAgentRouterModel());
  const [showKey, setShowKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showAgentRouterKey, setShowAgentRouterKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [isTestingClaude, setIsTestingClaude] = useState(false);
  const [isPushingData, setIsPushingData] = useState(false);
  const [isTestingAgentRouter, setIsTestingAgentRouter] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    model?: string;
  }>({ status: 'idle', message: '' });
  const [openAITestResult, setOpenAITestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [claudeTestResult, setClaudeTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [agentRouterTestResult, setAgentRouterTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const currentPortalUrl = publicUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://star-agent-jpf.web.app');

  // Sync input whenever modal opens or geminiApiKey state changes
  useEffect(() => {
    if (isSettingsOpen) {
      setInputKey('');
      const activeOpenAIKey = getOpenAIApiKey();
      setInputOpenAIKey('');
      setSavedOpenAIKey(activeOpenAIKey);
      const activeClaudeKey = getClaudeApiKey();
      setInputClaudeKey('');
      setSavedClaudeKey(activeClaudeKey);
      const activeAgentRouterKey = getAgentRouterApiKey();
      setInputAgentRouterKey('');
      setSavedAgentRouterKey(activeAgentRouterKey);
      setAgentRouterModel(getAgentRouterModel());
      setTestResult({ status: 'idle', message: '' });
      setOpenAITestResult({ status: 'idle', message: '' });
      setClaudeTestResult({ status: 'idle', message: '' });
      setAgentRouterTestResult({ status: 'idle', message: '' });
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
      message: 'Gemini API key disconnected. OpenAI remains active if its key is saved.'
    });
  };

  const handleSaveAndTestOpenAI = async () => {
    const cleaned = cleanApiKey(inputOpenAIKey);
    if (!cleaned) {
      setOpenAITestResult({ status: 'error', message: 'Please enter an OpenAI API key first.' });
      return;
    }

    setIsTestingOpenAI(true);
    setOpenAITestResult({ status: 'idle', message: '' });

    try {
      const result = await validateOpenAIApiKey(cleaned);
      if (result.valid) {
        saveOpenAIApiKey(cleaned);
        setSavedOpenAIKey(cleaned);
        setInputOpenAIKey('');
        setOpenAITestResult({
          status: 'success',
          message: `OpenAI access verified for ${result.model}. OCR will use OpenAI instead of Gemini.`
        });
      } else {
        setOpenAITestResult({ status: 'error', message: result.error || 'OpenAI key verification failed.' });
      }
    } catch (error) {
      setOpenAITestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to reach OpenAI API.'
      });
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const handleTestOpenAIOnly = async () => {
    const key = cleanApiKey(inputOpenAIKey) || savedOpenAIKey || getOpenAIApiKey();
    if (!key) {
      setOpenAITestResult({ status: 'error', message: 'Enter an OpenAI API key to test.' });
      return;
    }

    setIsTestingOpenAI(true);
    setOpenAITestResult({ status: 'idle', message: '' });
    try {
      const result = await validateOpenAIApiKey(key);
      setOpenAITestResult(result.valid
        ? {
            status: 'success',
            message: `OpenAI access verified for ${result.model}. API usage and quota are checked during OCR.`
          }
        : { status: 'error', message: result.error || 'OpenAI key verification failed.' });
    } catch (error) {
      setOpenAITestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to reach OpenAI API.'
      });
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const handleClearOpenAIKey = () => {
    saveOpenAIApiKey('');
    setSavedOpenAIKey('');
    setInputOpenAIKey('');
    setOpenAITestResult({
      status: 'idle',
      message: 'OpenAI key disconnected. Gemini will be used if its key is configured.'
    });
  };

  const handleSaveAndTestClaude = async () => {
    const cleaned = cleanApiKey(inputClaudeKey);
    if (!cleaned) {
      setClaudeTestResult({ status: 'error', message: 'Please enter an Anthropic API key first.' });
      return;
    }
    setIsTestingClaude(true);
    setClaudeTestResult({ status: 'idle', message: '' });
    try {
      const result = await validateClaudeApiKey(cleaned);
      if (result.valid) {
        saveClaudeApiKey(cleaned);
        setSavedClaudeKey(cleaned);
        setInputClaudeKey('');
        setClaudeTestResult({
          status: 'success',
          message: `Claude API access verified. Document audit will use ${result.model}.`
        });
      } else {
        setClaudeTestResult({ status: 'error', message: result.error || 'Claude API key verification failed.' });
      }
    } catch (error) {
      setClaudeTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to reach Anthropic Claude API.'
      });
    } finally {
      setIsTestingClaude(false);
    }
  };

  const handleTestClaudeOnly = async () => {
    const key = cleanApiKey(inputClaudeKey) || savedClaudeKey || getClaudeApiKey();
    if (!key) {
      setClaudeTestResult({ status: 'error', message: 'Enter a Claude API key to test.' });
      return;
    }
    setIsTestingClaude(true);
    setClaudeTestResult({ status: 'idle', message: '' });
    try {
      const result = await validateClaudeApiKey(key);
      setClaudeTestResult(result.valid
        ? { status: 'success', message: `Anthropic API access verified. Audit model: ${result.model}.` }
        : { status: 'error', message: result.error || 'Claude API key verification failed.' });
    } catch (error) {
      setClaudeTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to reach Anthropic Claude API.'
      });
    } finally {
      setIsTestingClaude(false);
    }
  };

  const handleClearClaudeKey = () => {
    saveClaudeApiKey('');
    setSavedClaudeKey('');
    setInputClaudeKey('');
    setClaudeTestResult({ status: 'idle', message: 'Claude API key disconnected.' });
  };

  const handleSaveAndTestAgentRouter = async () => {
    const key = cleanApiKey(inputAgentRouterKey);
    const model = agentRouterModel.trim();
    if (!key && !savedAgentRouterKey) {
      setAgentRouterTestResult({ status: 'error', message: 'Enter an AgentRouter API token first.' });
      return;
    }
    if (!model) {
      setAgentRouterTestResult({ status: 'error', message: 'Enter the exact vision-capable Claude model ID shown by AgentRouter.' });
      return;
    }
    setIsTestingAgentRouter(true);
    setAgentRouterTestResult({ status: 'idle', message: '' });
    try {
      const result = await validateAgentRouterApiKey(key || savedAgentRouterKey, model);
      if (result.valid) {
        if (key) {
          saveAgentRouterApiKey(key);
          setSavedAgentRouterKey(key);
          setInputAgentRouterKey('');
        }
        saveAgentRouterModel(model);
        setAgentRouterTestResult({
          status: 'success',
          message: 'AgentRouter connection verified. Claude audit requests will use this model and AgentRouter balance.'
        });
      } else {
        setAgentRouterTestResult({ status: 'error', message: result.error || 'AgentRouter verification failed.' });
      }
    } catch (error) {
      setAgentRouterTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to reach AgentRouter API.'
      });
    } finally {
      setIsTestingAgentRouter(false);
    }
  };

  const handleClearAgentRouterKey = () => {
    saveAgentRouterApiKey('');
    saveAgentRouterModel('');
    setSavedAgentRouterKey('');
    setInputAgentRouterKey('');
    setAgentRouterModel('');
    setAgentRouterTestResult({ status: 'idle', message: 'AgentRouter disconnected. The direct Claude key, if configured, can be used instead.' });
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
  const hasLinkedOpenAIKey = Boolean(savedOpenAIKey);
  const hasLinkedClaudeKey = Boolean(savedClaudeKey);
  const hasLinkedAgentRouterKey = Boolean(savedAgentRouterKey);
  const maskedKey = hasLinkedKey 
    ? `${geminiApiKey.substring(0, 6)}••••••••••••${geminiApiKey.slice(-4)}`
    : '';
  const maskedOpenAIKey = hasLinkedOpenAIKey
    ? `${savedOpenAIKey.substring(0, 6)}••••••••••••${savedOpenAIKey.slice(-4)}`
    : '';
  const maskedClaudeKey = hasLinkedClaudeKey
    ? `${savedClaudeKey.substring(0, 6)}••••••••••••${savedClaudeKey.slice(-4)}`
    : '';
  const maskedAgentRouterKey = hasLinkedAgentRouterKey
    ? `${savedAgentRouterKey.substring(0, 6)}••••••••••••${savedAgentRouterKey.slice(-4)}`
    : '';

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
                {hasLinkedOpenAIKey ? 'Linked (OpenAI is active)' : 'Linked & Active'}
              </span>
            ) : hasLinkedOpenAIKey ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                OpenAI OCR Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                Offline Simulator Mode
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Paste a Gemini API key as an alternative OCR provider. OpenAI takes precedence whenever its key is saved.
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

        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-300">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700" />
              OpenAI API Key
            </label>
            {hasLinkedOpenAIKey ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                OpenAI OCR Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                Gemini remains active
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Saving an OpenAI key routes PR, DC, and builty OCR to OpenAI instead of Gemini. ChatGPT Plus does not include API credits; OpenAI API usage is billed separately.
          </p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            The key is stored in this browser’s local storage and sent directly to OpenAI for OCR. Do not save it on shared devices or paste it into chat.
          </p>

          {hasLinkedOpenAIKey && (
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium font-mono text-[11px]">
                <Key className="w-3.5 h-3.5 text-slate-600" />
                <span>{maskedOpenAIKey}</span>
              </div>
              <button
                onClick={handleClearOpenAIKey}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline"
                title="Disconnect OpenAI API Key"
              >
                <Trash2 className="w-3 h-3" /> Disconnect
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type={showOpenAIKey ? 'text' : 'password'}
                value={inputOpenAIKey}
                onChange={(event) => {
                  setInputOpenAIKey(event.target.value);
                  setOpenAITestResult({ status: 'idle', message: '' });
                }}
                placeholder={hasLinkedOpenAIKey ? 'Saved key available; paste to replace' : 'sk-...'}
                autoComplete="off"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-medium focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
              />
              <button
                type="button"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                title={showOpenAIKey ? 'Hide Key' : 'Show Key'}
              >
                {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndTestOpenAI}
                disabled={isTestingOpenAI || !inputOpenAIKey.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isTestingOpenAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save &amp; Use OpenAI
              </button>
              <button
                onClick={handleTestOpenAIOnly}
                disabled={isTestingOpenAI || (!inputOpenAIKey.trim() && !hasLinkedOpenAIKey)}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isTestingOpenAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Test
              </button>
            </div>
          </div>

          {openAITestResult.status !== 'idle' && (
            <div className={`p-3 rounded-xl border text-xs font-medium ${
              openAITestResult.status === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="font-bold">
                {openAITestResult.status === 'success' ? 'OpenAI API key verified' : 'OpenAI API connection issue'}
              </div>
              <p className="text-[11px] mt-1">{openAITestResult.message}</p>
            </div>
          )}

          <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Need an OpenAI API key?</span>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-800 font-bold hover:text-black flex items-center gap-1 hover:underline"
            >
              OpenAI Platform <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* AgentRouter Claude Provider */}
        <div className="space-y-4 bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              AgentRouter Claude API
            </label>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              hasLinkedAgentRouterKey
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
              {hasLinkedAgentRouterKey ? 'Preferred audit provider' : 'Not connected'}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Add your AgentRouter token and the exact Claude vision model ID from its Model Status/API page. When connected, audit requests use AgentRouter before the direct Anthropic key.
          </p>
          <p className="text-[10px] text-indigo-950 leading-relaxed">
            Audit records and scans are sent to AgentRouter and may be forwarded to the selected model provider. API costs use your AgentRouter balance. The endpoint is https://agentrouter.org/v1/chat/completions. Token is stored in this browser only.
          </p>

          {hasLinkedAgentRouterKey && (
            <div className="p-2.5 rounded-lg bg-white border border-indigo-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium font-mono text-[11px]">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>{maskedAgentRouterKey}</span>
              </div>
              <button
                onClick={handleClearAgentRouterKey}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline"
                title="Disconnect AgentRouter API Token"
              >
                <Trash2 className="w-3 h-3" /> Disconnect
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type={showAgentRouterKey ? 'text' : 'password'}
                value={inputAgentRouterKey}
                onChange={event => {
                  setInputAgentRouterKey(event.target.value);
                  setAgentRouterTestResult({ status: 'idle', message: '' });
                }}
                placeholder={hasLinkedAgentRouterKey ? 'Saved token available; paste to replace' : 'AgentRouter API token'}
                autoComplete="off"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowAgentRouterKey(!showAgentRouterKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                title={showAgentRouterKey ? 'Hide Token' : 'Show Token'}
              >
                {showAgentRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type="text"
              value={agentRouterModel}
              onChange={event => {
                setAgentRouterModel(event.target.value);
                setAgentRouterTestResult({ status: 'idle', message: '' });
              }}
              placeholder="Exact vision-capable Claude model ID"
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleSaveAndTestAgentRouter}
              disabled={isTestingAgentRouter || (!inputAgentRouterKey.trim() && !hasLinkedAgentRouterKey) || !agentRouterModel.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isTestingAgentRouter ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Save &amp; Verify AgentRouter
            </button>
          </div>

          {agentRouterTestResult.status !== 'idle' && (
            <div role="status" className={`p-3 rounded-xl border text-xs font-medium ${
              agentRouterTestResult.status === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="font-bold">
                {agentRouterTestResult.status === 'success' ? 'AgentRouter API verified' : 'AgentRouter API connection issue'}
              </div>
              <p className="text-[11px] mt-1">{agentRouterTestResult.message}</p>
            </div>
          )}

          <a
            href="https://agentrouter.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-800 font-bold text-[11px] hover:underline inline-flex items-center gap-1"
          >
            Open AgentRouter <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Claude Database Audit Key */}
        <div className="space-y-4 bg-orange-50/60 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-700" />
              Anthropic Claude API Key
            </label>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              hasLinkedClaudeKey
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
              {hasLinkedClaudeKey ? 'Ready for database audit' : 'Not connected'}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Claude audits saved PR and DC entries and attached scans in AI Diagnostics. It proposes exact printed PR-number matches; no link is changed until you approve it.
          </p>
          <p className="text-[10px] text-orange-900 leading-relaxed">
            Audit content and attached documents are sent directly to Anthropic, and API usage may incur charges. The key is stored in this browser’s local storage; avoid shared devices.
          </p>

          {hasLinkedClaudeKey && (
            <div className="p-2.5 rounded-lg bg-white border border-orange-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-medium font-mono text-[11px]">
                <Key className="w-3.5 h-3.5 text-orange-600" />
                <span>{maskedClaudeKey}</span>
              </div>
              <button
                onClick={handleClearClaudeKey}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline"
                title="Disconnect Claude API Key"
              >
                <Trash2 className="w-3 h-3" /> Disconnect
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type={showClaudeKey ? 'text' : 'password'}
                value={inputClaudeKey}
                onChange={(event) => {
                  setInputClaudeKey(event.target.value);
                  setClaudeTestResult({ status: 'idle', message: '' });
                }}
                placeholder={hasLinkedClaudeKey ? 'Saved key available; paste to replace' : 'sk-ant-...'}
                autoComplete="off"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => setShowClaudeKey(!showClaudeKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                title={showClaudeKey ? 'Hide Key' : 'Show Key'}
              >
                {showClaudeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndTestClaude}
                disabled={isTestingClaude || !inputClaudeKey.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isTestingClaude ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save &amp; Verify Claude
              </button>
              <button
                onClick={handleTestClaudeOnly}
                disabled={isTestingClaude || (!inputClaudeKey.trim() && !hasLinkedClaudeKey)}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-orange-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isTestingClaude ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-600" />}
                Test
              </button>
            </div>
          </div>

          {claudeTestResult.status !== 'idle' && (
            <div className={`p-3 rounded-xl border text-xs font-medium ${
              claudeTestResult.status === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="font-bold">
                {claudeTestResult.status === 'success' ? 'Claude API key verified' : 'Claude API connection issue'}
              </div>
              <p className="text-[11px] mt-1">{claudeTestResult.message}</p>
            </div>
          )}

          <div className="pt-1 border-t border-orange-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Need an Anthropic API key?</span>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-800 font-bold hover:text-orange-950 flex items-center gap-1 hover:underline"
            >
              Anthropic Console <ExternalLink className="w-3 h-3" />
            </a>
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

        {/* Cloud Migration Section */}
        <div className="space-y-3 bg-purple-50 p-4 rounded-xl border border-purple-200">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-purple-700" />
            Cloud Synchronization
          </label>
          <p className="text-[11px] text-slate-600 font-medium">
            Push all locally stored PRs and Delivery Challans to Firebase. Use this if your records are missing on other devices.
          </p>
          <button
            onClick={async () => {
              setIsPushingData(true);
              try {
                await pushAllToCloud();
                alert('Successfully pushed all local data to Firebase!');
              } catch (e) {
                alert('Error pushing data to Firebase. Make sure you are logged in.');
              } finally {
                setIsPushingData(false);
              }
            }}
            disabled={isPushingData}
            className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            {isPushingData ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing to Firebase...</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>Push All Data to Firebase</span>
              </>
            )}
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
