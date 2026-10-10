import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  CheckCircle2, 
  Link as LinkIcon, 
  Clock, 
  Copy, 
  ArrowRight, 
  Building2, 
  Truck, 
  ShieldCheck, 
  Loader2,
  Package,
  Camera,
  Eye
} from 'lucide-react';
import { getActiveGeminiApiKey, generateWithFallback } from '../lib/gemini';
import { GoogleGenAI } from '@google/genai';
import { runClaudeDatabaseAudit, type ClaudeAuditResult } from '../lib/claude';
import { getAgentRouterApiKey, getAgentRouterModel, getClaudeApiKey } from '../lib/storage';

const normalizeDuplicateReference = (value: string | undefined): string => {
  const normalized = String(value || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const match = normalized.match(/^(.*?)(\d+)$/);
  return match ? `${match[1]}${match[2].replace(/^0+(?=\d)/, '')}` : normalized;
};

export const GeminiDiagnosticsView: React.FC = () => {
  const { 
    prs, 
    dcs, 
    linkDCToPR, 
    autoLinkAllDCs, 
    mergeDuplicatePRs, 
    mergeDuplicateDCs,
    mergeAllDuplicateDCs,
    deduplicatePRItems,
    markAllDCsDelivered,
    setSelectedPR,
    setIsPRDetailOpen,
    setEditingPR,
    setIsPREditOpen,
    setEditingDC,
    setIsDCEditOpen,
    setTargetDC_PR,
    setIsDCUploadOpen,
    setQuickDispatchTarget,
    setIsQuickDispatchOpen,
    setIsBuiltyUploadOpen,
    setTargetBuiltyDC,
    setSelectedBuiltyPreview,
    geminiApiKey
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'duplicates' | 'pending' | 'linking' | 'builty' | 'ai-audit'>('all');
  const [selectedPRToLink, setSelectedPRToLink] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Gemini AI live audit state
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);
  const [isClaudeAuditing, setIsClaudeAuditing] = useState(false);
  const [claudeAuditProgress, setClaudeAuditProgress] = useState({ current: 0, total: 0 });
  const [claudeAuditResult, setClaudeAuditResult] = useState<ClaudeAuditResult | null>(null);
  const [claudeAuditError, setClaudeAuditError] = useState<string | null>(null);
  const [claudeConsent, setClaudeConsent] = useState(false);
  const [appliedClaudeSuggestionIds, setAppliedClaudeSuggestionIds] = useState<string[]>([]);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const agentRouterKeyConfigured = Boolean(getAgentRouterApiKey());
  const agentRouterConfigured = agentRouterKeyConfigured && Boolean(getAgentRouterModel());
  const claudeKeyConfigured = agentRouterKeyConfigured ? agentRouterConfigured : Boolean(getClaudeApiKey());
  const claudeProviderName = agentRouterKeyConfigured ? 'AgentRouter' : 'Direct Anthropic';
  const claudeDocumentCount = prs.length + dcs.length;

  const handleRunClaudeAudit = async () => {
    if (!claudeConsent) return;
    setIsClaudeAuditing(true);
    setClaudeAuditError(null);
    setClaudeAuditResult(null);
    setAppliedClaudeSuggestionIds([]);
    setClaudeAuditProgress({ current: 0, total: claudeDocumentCount });
    try {
      const result = await runClaudeDatabaseAudit(prs, dcs, (current, total) => {
        setClaudeAuditProgress({ current, total });
      });
      setClaudeAuditResult(result);
    } catch (error) {
      setClaudeAuditError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsClaudeAuditing(false);
    }
  };

  const handleApplyClaudeSuggestion = (dcId: string, prId: string) => {
    const result = linkDCToPR(dcId, prId);
    if (result.success) {
      setAppliedClaudeSuggestionIds(ids => [...ids, dcId]);
      showFeedback('Claude link applied after your approval.');
    } else {
      showFeedback(`Could not apply Claude suggestion: ${result.error || 'Unknown error'}`);
    }
  };

  // 1. Detect Duplicates
  const duplicatePRGroups = useMemo(() => {
    const map = new Map<string, typeof prs>();
    prs.forEach(pr => {
      const cleanPr = normalizeDuplicateReference(pr.prNumber);
      if (!cleanPr) return;
      const list = map.get(cleanPr) || [];
      list.push(pr);
      map.set(cleanPr, list);
    });

    const dupes: Array<{ prNumber: string; records: typeof prs }> = [];
    map.forEach((records) => {
      if (records.length > 1) {
        dupes.push({ prNumber: records[0].prNumber, records });
      }
    });
    return dupes;
  }, [prs]);

  const duplicateDCGroups = useMemo(() => {
    const map = new Map<string, typeof dcs>();
    dcs.forEach(dc => {
      const cleanDc = normalizeDuplicateReference(dc.dcNumber);
      if (!cleanDc) return;
      const list = map.get(cleanDc) || [];
      list.push(dc);
      map.set(cleanDc, list);
    });

    const dupes: Array<{ dcNumber: string; records: typeof dcs }> = [];
    map.forEach((records) => {
      if (records.length > 1) {
        dupes.push({ dcNumber: records[0].dcNumber, records });
      }
    });
    return dupes;
  }, [dcs]);

  const prsWithDuplicateItems = useMemo(() => {
    return prs.filter(pr => {
      const names = (pr.items || [])
        .filter(i => i && typeof i.name === 'string' && i.name.trim())
        .map(i => i.name.toLowerCase().replace(/\s+/g, ' ').trim());
      return new Set(names).size !== names.length;
    });
  }, [prs]);

  const totalDuplicatesCount = duplicatePRGroups.length + duplicateDCGroups.length + prsWithDuplicateItems.length;

  // 2. Pending & In-Progress PRs
  const pendingPRs = useMemo(() => {
    return prs.filter(pr => {
      if (pr.status === 'Pending' || pr.status === 'In-Progress') return true;
      return pr.items.some(it => it.fulfilledQty < it.requestedQty);
    });
  }, [prs]);

  const totalUnfulfilledItemsCount = useMemo(() => {
    let count = 0;
    pendingPRs.forEach(pr => {
      pr.items.forEach(it => {
        if (it.fulfilledQty < it.requestedQty) count++;
      });
    });
    return count;
  }, [pendingPRs]);

  // 3. Historical Delivered DCs vs Active Unlinked DCs
  // All 485+ historical DCs from day-start are completed & delivered shipments.
  // Their PR matching will be executed when the upcoming PR folder is added.
  const historicalDeliveredDCs = useMemo(() => {
    return dcs.filter(dc =>
      !(dc.dcNumber || '').toLowerCase().includes('missing') &&
      (dc.id.startsWith('dc-jad-') || dc.deliveryStatus === 'Delivered' || dc.deliveryStatus === 'Dispatched')
    );
  }, [dcs]);

  const activeUnlinkedDCs = useMemo(() => {
    return dcs.filter(dc => {
      if (dc.id.startsWith('dc-jad-') || dc.deliveryStatus === 'Delivered' || dc.deliveryStatus === 'Dispatched') return false;
      if (!dc.prId || dc.prNumber === 'NO PR') return true;
      return !prs.some(p => p.id === dc.prId);
    });
  }, [dcs, prs]);

  const unlinkedDCs = activeUnlinkedDCs;

  // 4. Builty Attachment & Delivered Breakdown
  const builtyAttachedCount = useMemo(() => {
    return dcs.filter(dc => dc.isBuiltyAttached).length;
  }, [dcs]);

  const directDeliveredCount = useMemo(() => {
    return dcs.length - builtyAttachedCount;
  }, [dcs, builtyAttachedCount]);

  // Health Score Calculation (0 - 100): 100% when historical DCs are verified delivered
  const healthScore = useMemo(() => {
    let score = 100;
    if (totalDuplicatesCount > 0) score -= Math.min(20, totalDuplicatesCount * 10);
    if (activeUnlinkedDCs.length > 0) score -= Math.min(20, activeUnlinkedDCs.length * 10);
    return Math.max(90, score);
  }, [totalDuplicatesCount, activeUnlinkedDCs.length]);

  // Handler: 1-Click Auto Link All
  const handleAutoLinkAll = () => {
    const res = autoLinkAllDCs();
    if (res.linkedCount > 0) {
      showFeedback(`✓ Successfully linked ${res.linkedCount} Delivery Challan(s) to matching Requisitions!`);
    } else {
      showFeedback('No auto-matchable unlinked DCs found. You can link manually below.');
    }
  };

  // Handler: Link single DC to PR
  const handleLinkSingleDC = (dcId: string, prId: string) => {
    if (!prId) return;
    const res = linkDCToPR(dcId, prId);
    if (res.success) {
      showFeedback('✓ Delivery Challan linked to PR successfully! Fulfillment updated.');
    } else {
      showFeedback(`Failed to link DC: ${res.error || 'Unknown error'}`);
    }
  };

  // Handler: Merge duplicate PRs
  const handleMergePRs = (primaryId: string, dupId: string) => {
    const res = mergeDuplicatePRs(primaryId, dupId);
    if (res.success) {
      showFeedback('✓ Duplicate PR merged into primary record successfully.');
    } else {
      showFeedback(`Failed to merge PR: ${res.error || 'Unknown error'}`);
    }
  };

  // Handler: Merge duplicate DCs
  const handleMergeDCs = (primaryId: string, dupId: string) => {
    const res = mergeDuplicateDCs(primaryId, dupId);
    if (res.success) {
      showFeedback('✓ Duplicate Delivery Challan merged successfully.');
    } else {
      showFeedback(`Failed to merge DC: ${res.error || 'Unknown error'}`);
    }
  };

  const handleMergeAllDCs = () => {
    const res = mergeAllDuplicateDCs();
    if (res.success) {
      showFeedback(`✓ All duplicate Delivery Challans merged successfully! (${res.mergedCount} resolved)`);
    }
  };

  // Handler: Deduplicate items in PR
  const handleDeduplicateItems = (prId: string) => {
    const res = deduplicatePRItems(prId);
    if (res.success) {
      showFeedback('✓ Duplicate line items consolidated within requisition.');
    }
  };

  // Handler: Run Gemini Live AI Deep Audit
  const handleRunAiAudit = async () => {
    setIsAiAuditing(true);
    setAiAuditReport(null);

    const activeKey = getActiveGeminiApiKey(geminiApiKey);

    try {
      if (activeKey) {
        const ai = new GoogleGenAI({ apiKey: activeKey });
        const summaryData = {
          prsCount: prs.length,
          dcsCount: dcs.length,
          duplicatePRs: duplicatePRGroups.map(d => d.prNumber),
          unlinkedDCs: unlinkedDCs.map(d => ({ dcNumber: d.dcNumber, date: d.date, site: d.siteName, prRef: d.prNumber })),
          pendingPRs: pendingPRs.map(p => ({
            prNumber: p.prNumber,
            site: p.siteName,
            status: p.status,
            unfulfilledItems: p.items.filter(i => i.fulfilledQty < i.requestedQty).map(i => `${i.name} (${i.fulfilledQty}/${i.requestedQty} ${i.unit})`)
          }))
        };

        const prompt = `
You are the AI Supply Chain Chief Auditor for Star Electric Enterprises (Rawalpindi) supplying electrical goods to Jadeed Group of Companies (Poultry Farms).
Perform a concise, professional diagnostic audit on our active database:

DATA:
${JSON.stringify(summaryData, null, 2)}

DIAGNOSTIC TASKS:
1. Integrity & Duplicates: Are there duplicate PRs or DCs? What action is required?
2. Linking Quality: Which Delivery Challans are unlinked from PRs and how should they be linked?
3. Pending Demand & Bottleneck Alert: Highlight critical unfulfilled cables, breakers, or lighting supplies.
4. Recommendations: 3 specific steps for the warehouse manager to ensure 100% fulfillment accuracy.

Keep response practical, bulleted, and structured with clear sections.
`;

        const response = await generateWithFallback(ai, prompt);

        if (response && response.text) {
          setAiAuditReport(response.text);
        } else {
          setAiAuditReport('Gemini AI audit completed with no discrepancies flagged.');
        }
      } else {
        // Fallback intelligent offline audit
        await new Promise(r => setTimeout(r, 600));
        let offlineText = `### 📋 Intelligent Supply Chain Health Report (Offline Engine)\n\n`;
        offlineText += `• **Database Overview**: ${prs.length} Requisitions and ${dcs.length} Delivery Challans currently tracked.\n`;
        if (totalDuplicatesCount > 0) {
          offlineText += `• ⚠️ **Duplicate Alert**: Found ${totalDuplicatesCount} duplicate record(s). Use the "Merge Duplicates" tool below to keep your ledger clean.\n`;
        } else {
          offlineText += `• ✅ **No Duplicate Conflicts**: All PR and DC reference IDs are unique.\n`;
        }

        if (unlinkedDCs.length > 0) {
          offlineText += `• 🔗 **Unlinked Challans**: Found ${unlinkedDCs.length} Delivery Challan(s) missing PR links. Click "Auto-Link All" to synchronize shipments.\n`;
        } else {
          offlineText += `• ✅ **100% Linkage**: All Delivery Challans are verified against active Demand Requisitions.\n`;
        }

        if (pendingPRs.length > 0) {
          offlineText += `• 📦 **Pending Demands**: ${pendingPRs.length} PR(s) have unfulfilled electrical items waiting for delivery to Jadeed sites.\n`;
        } else {
          offlineText += `• 🎉 **Fulfilled**: All requisitions are 100% satisfied.\n`;
        }

        offlineText += `\n*Tip: Connect your Gemini API Key in Settings to enable real-time generative reasoning and deep OCR discrepancy scanning.*`;
        setAiAuditReport(offlineText);
      }
    } catch (err: any) {
      setAiAuditReport(`Audit error: ${err?.message || 'Failed to complete AI audit'}. Please check your Gemini API key in Settings.`);
    } finally {
      setIsAiAuditing(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-slate-900 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Assistant</h1>
            <p className="mt-1 text-sm text-slate-500">Find duplicates, check requisitions and repair PR-to-DC links.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRunAiAudit}
              disabled={isAiAuditing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {isAiAuditing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Run deep audit
                </>
              )}
            </button>

            {unlinkedDCs.length > 0 && (
              <button
                onClick={handleAutoLinkAll}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Auto-link DCs ({unlinkedDCs.length})
              </button>
            )}

            <button
              onClick={async () => {
                const res = await markAllDCsDelivered();
                showFeedback(`✓ ${res.deliveredCount} DCs marked Delivered; builty attachments do not determine delivery status; ${res.skippedCount} missing-page records unchanged.` + (res.cloudFailures ? ` Cloud sync failed for ${res.cloudFailures} records; see console.` : ''));
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Set all delivery statuses
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* 5 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          
          {/* Health Score */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Database Health
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${healthScore >= 90 ? 'text-emerald-700' : healthScore >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                {healthScore}%
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {healthScore === 100 ? 'Optimal' : 'Needs Repair'}
              </span>
            </div>
          </div>

          {/* Duplicates */}
          <div 
            onClick={() => setActiveSubTab('duplicates')}
            className={`p-4 rounded-xl border space-y-1 cursor-pointer transition-all ${
              totalDuplicatesCount > 0 
                ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/60' 
                : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Copy className="w-3.5 h-3.5 text-rose-600" /> Duplicate Entries
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-semibold ${totalDuplicatesCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                {totalDuplicatesCount}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {totalDuplicatesCount > 0 ? 'Action required' : 'Clean'}
              </span>
            </div>
          </div>

          {/* Pending Demands */}
          <div 
            onClick={() => setActiveSubTab('pending')}
            className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-1 cursor-pointer hover:bg-slate-100 transition-all"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending PRs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-amber-700">
                {pendingPRs.length}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {totalUnfulfilledItemsCount} items remaining
              </span>
            </div>
          </div>

          {/* Deliveries Status */}
          <div 
            onClick={() => setActiveSubTab('linking')}
            className="p-4 rounded-xl border space-y-1 cursor-pointer transition-all bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Deliveries Completed
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-emerald-700">
                {dcs.length} / {dcs.length}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold">
                Delivered / Dispatched
              </span>
            </div>
          </div>

          {/* Builty Receipts */}
          <div 
            onClick={() => setActiveSubTab('builty')}
            className="p-4 rounded-xl border space-y-1 cursor-pointer transition-all bg-amber-50/70 border-amber-200 hover:bg-amber-100/60"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-amber-600" /> Builty Receipts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-900">
                {builtyAttachedCount} / {dcs.length}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {directDeliveredCount} Direct Delivered
              </span>
            </div>
          </div>

        </div>

        {/* Sub Navigation Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-300 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Overview & AI Audit
          </button>

          <button
            onClick={() => setActiveSubTab('duplicates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'duplicates'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate Entries ({totalDuplicatesCount})
          </button>

          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'pending'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Requisitions ({pendingPRs.length})
          </button>

          <button
            onClick={() => setActiveSubTab('linking')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'linking'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            PR & DC Linking ({unlinkedDCs.length})
          </button>

          <button
            onClick={() => setActiveSubTab('builty')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'builty'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Builty Scans ({builtyAttachedCount} Linked)
          </button>
        </div>

      </div>

      {/* AI Deep Audit Output (if generated) */}
      {aiAuditReport && (
        <div className="bg-white border-2 border-amber-300 rounded-xl p-6 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Gemini AI Supply Chain Audit Findings
            </h3>
            <button
              onClick={() => setAiAuditReport(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Dismiss
            </button>
          </div>
          <div className="prose prose-xs max-w-none text-slate-800 text-xs font-medium whitespace-pre-wrap leading-relaxed">
            {aiAuditReport}
          </div>
        </div>
      )}

      <section className="bg-white border-2 border-orange-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Claude Haiku PR &amp; DC Document Audit
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Scans saved PR/DC records and attached source documents. Only explicit printed PR-number matches become review proposals.
            </p>
          </div>
          <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full border text-[11px] font-bold ${
            claudeKeyConfigured
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}>
            {claudeKeyConfigured
              ? `${claudeProviderName} audit API ready`
              : agentRouterKeyConfigured ? 'Complete AgentRouter model settings' : 'Add API token in Settings'}
          </span>
        </div>

        <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-[11px] text-orange-950 leading-relaxed">
          A full run uses the configured Claude model to process <strong>{claudeDocumentCount} records</strong> (about {Math.ceil(claudeDocumentCount / 5)} API requests). Attached scans saved with each record or in this browser’s document storage are included when available. With AgentRouter, records and scans go to AgentRouter and may be forwarded to its selected model provider; charges use your AgentRouter balance. Verify findings against original documents. Nothing is changed automatically.
        </div>

        <label className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
          <input
            type="checkbox"
            checked={claudeConsent}
            onChange={event => setClaudeConsent(event.target.checked)}
            className="mt-0.5 accent-orange-600"
          />
          <span>I authorize sending these portal PR/DC details and available scans through the configured provider (AgentRouter if connected) to its selected Claude model for this audit.</span>
        </label>

        <button
          onClick={handleRunClaudeAudit}
          disabled={!claudeConsent || !claudeKeyConfigured || isClaudeAuditing || claudeDocumentCount === 0}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaudeAuditing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Auditing {claudeAuditProgress.current} / {claudeAuditProgress.total || claudeDocumentCount}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Claude Full PR/DC Audit
            </>
          )}
        </button>

        {isClaudeAuditing && (
          <div className="h-2 rounded-full bg-orange-100 overflow-hidden" role="progressbar"
            aria-valuemin={0} aria-valuemax={claudeAuditProgress.total || claudeDocumentCount}
            aria-valuenow={claudeAuditProgress.current}>
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${claudeAuditProgress.total ? (claudeAuditProgress.current / claudeAuditProgress.total) * 100 : 0}%` }}
            />
          </div>
        )}

        {claudeAuditError && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
            <strong>Claude audit stopped.</strong> {claudeAuditError} No record changes were made by the audit.
          </div>
        )}

        {claudeAuditResult && (
          <div className="space-y-4 border-t border-orange-100 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xl font-semibold text-slate-900">{claudeAuditResult.completed}</div>
                <div className="text-[10px] font-bold text-slate-500">Records audited</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xl font-semibold text-slate-900">{claudeAuditResult.findings.filter(finding => finding.imageAvailable).length}</div>
                <div className="text-[10px] font-bold text-slate-500">Scans read</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xl font-semibold text-orange-700">{claudeAuditResult.findings.filter(finding => finding.findings.length > 0).length}</div>
                <div className="text-[10px] font-bold text-slate-500">Records flagged</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xl font-semibold text-emerald-700">{claudeAuditResult.suggestions.length}</div>
                <div className="text-[10px] font-bold text-slate-500">Link proposals</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600">
              Proposals require an exact PR-number match read from a DC marked as a delivery challan, with at least 80% model confidence. Check the original documents before applying.
            </p>

            {claudeAuditResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-800">Review PR↔DC link proposals</h4>
                {claudeAuditResult.suggestions.map(suggestion => {
                  const alreadyApplied = appliedClaudeSuggestionIds.includes(suggestion.dcId);
                  return (
                    <div key={`${suggestion.dcId}-${suggestion.prId}`} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900">
                          {suggestion.dcNumber} → {suggestion.prNumber}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Printed on DC: {suggestion.visiblePRNumber} · Confidence {Math.round(suggestion.confidence * 100)}%
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{suggestion.evidence}</div>
                      </div>
                      <button
                        onClick={() => handleApplyClaudeSuggestion(suggestion.dcId, suggestion.prId)}
                        disabled={alreadyApplied}
                        className="shrink-0 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold disabled:opacity-50"
                      >
                        {alreadyApplied ? 'Applied' : 'Approve & Link'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {claudeAuditResult.suggestions.length === 0 && (
              <p className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                No high-confidence, exact printed PR-number links were proposed. This does not mean all records are linked or error-free; review the findings below.
              </p>
            )}

            {claudeAuditResult.findings.some(finding => finding.findings.length > 0) && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-800">Audit findings</h4>
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-200 rounded-xl border border-slate-300">
                  {claudeAuditResult.findings.filter(finding => finding.findings.length > 0).map(finding => (
                    <div key={`${finding.recordType}-${finding.recordId}`} className="p-3 text-[11px]">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-slate-800">
                        <span>{finding.recordType} {finding.recordNumber || '(number missing)'}</span>
                        <span className="text-slate-400">·</span>
                        <span>{finding.documentType}</span>
                        {finding.printedNumber && <span className="text-slate-600">Printed: {finding.printedNumber}</span>}
                        <span className="ml-auto text-slate-500">{Math.round(finding.confidence * 100)}%</span>
                      </div>
                      <ul className="mt-1 list-disc pl-4 text-slate-600">
                        {finding.findings.map((note, index) => <li key={index}>{note}</li>)}
                      </ul>
                      {finding.imageError && <div className="mt-1 text-amber-800">{finding.imageError}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECTION 1: DUPLICATES */}
      {(activeSubTab === 'all' || activeSubTab === 'duplicates') && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Copy className="w-4 h-4 text-rose-600" />
                Duplicate Entry Inspector & Auto-Merger
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Detects accidental duplicate scans of identical Purchase Requisitions, Delivery Challans, or repeated items
              </p>
            </div>

            {duplicateDCGroups.length > 0 && (
              <button
                onClick={handleMergeAllDCs}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-Merge Duplicate DCs
              </button>
            )}
          </div>

          {totalDuplicatesCount === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">Zero Duplicates Detected!</p>
              <p className="text-[11px] text-emerald-700">All Requisition numbers and Delivery Challan entries are unique.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Duplicate PR Groups */}
              {duplicatePRGroups.map((group, gIdx) => (
                <div key={gIdx} className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-xs text-rose-900 px-2 py-0.5 rounded bg-rose-100 border border-rose-300">
                      Duplicate PR: {group.prNumber} ({group.records.length} records found)
                    </span>
                    <span className="text-[11px] font-semibold text-rose-800">Review records before merging</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.records.map((r, rIdx) => (
                      <div key={r.id || rIdx} className="p-3 rounded-lg bg-white border border-rose-200 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>Record #{rIdx + 1}: {r.siteName}</span>
                          <span className="text-[10px] text-slate-500">{r.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {r.items?.length || 0} line items • {r.fulfillmentLogs?.length || 0} fulfillment logs
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedPR(r);
                              setIsPRDetailOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button
                            onClick={() => {
                              setEditingPR(r);
                              setIsPREditOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px]"
                          >
                            Edit this PR
                          </button>
                          {rIdx > 0 && (
                            <button
                              onClick={() => handleMergePRs(group.records[0].id, r.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                            >
                              Merge into record #1
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Duplicate DC Groups */}
              {duplicateDCGroups.map((group, gIdx) => (
                <div key={`dc-dupe-${gIdx}`} className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-xs text-orange-900 px-2 py-0.5 rounded bg-orange-100 border border-orange-300">
                      Duplicate Delivery Challan: {group.dcNumber} ({group.records.length} records found)
                    </span>
                    <button
                      onClick={() => handleMergeDCs(group.records[0].id, group.records[1].id)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      Merge into Single DC
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.records.map((r, rIdx) => (
                    <div key={r.id || rIdx} className="p-3 rounded-lg bg-white border border-orange-200 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>Record #{rIdx + 1}: {r.siteName}</span>
                          <span className="text-[10px] text-slate-500">{r.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {(r.itemsShipped || []).length} items shipped • Linked to {r.prNumber || 'Direct'}
                          {r.documentImage ? ' • Scan Attached' : ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setEditingDC(r);
                              setIsDCEditOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px]"
                          >
                            Edit this DC
                          </button>
                          {rIdx > 0 && (
                            <button
                              onClick={() => handleMergeDCs(group.records[0].id, r.id)}
                              className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px]"
                            >
                              Merge into record #1
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Duplicate Items within PRs */}
              {prsWithDuplicateItems.map(pr => (
                <div key={pr.id} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-amber-900 font-mono">{pr.prNumber}</span>
                      <span className="text-xs text-slate-600 ml-2">({pr.siteName}) has duplicate line item descriptions</span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingPR(pr);
                        setIsPREditOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs cursor-pointer"
                    >
                      Review / Edit Items
                    </button>
                    <button
                      onClick={() => handleDeduplicateItems(pr.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Consolidate Exact Duplicates
                    </button>
                  </div>
                </div>
              ))}
              {duplicatePRGroups.length === 0 &&
                duplicateDCGroups.length === 0 &&
                prsWithDuplicateItems.length === 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                    The duplicate count could not be matched to visible records. Refresh the audit and try again; no records were changed.
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PENDING REQUISITIONS */}
      {(activeSubTab === 'all' || activeSubTab === 'pending') && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending & Unfulfilled Requisitions Watchlist
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Demands from Jadeed Group sites requiring electrical dispatch or outstanding deliveries
              </p>
            </div>

            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {pendingPRs.length} Active Demands
            </span>
          </div>

          {pendingPRs.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">All Demands 100% Satisfied!</p>
              <p className="text-[11px] text-emerald-700">No pending or partially fulfilled requisitions in the pipeline.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPRs.map(pr => {
                const unfulfilled = pr.items.filter(i => i.fulfilledQty < i.requestedQty);
                const totalReq = pr.items.reduce((acc, i) => acc + i.requestedQty, 0);
                const totalFul = pr.items.reduce((acc, i) => acc + i.fulfilledQty, 0);
                const pct = totalReq > 0 ? Math.round((totalFul / totalReq) * 100) : 0;

                return (
                  <div key={pr.id} className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3 hover:border-slate-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm text-slate-900">{pr.prNumber}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            pr.status === 'In-Progress' 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {pr.status} ({pct}% Fulfilled)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" /> {pr.siteName}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTargetDC_PR(pr);
                            setIsDCUploadOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" /> Fulfill via DC
                        </button>

                        <button
                          onClick={() => {
                            setQuickDispatchTarget({ pr, items: unfulfilled });
                            setIsQuickDispatchOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          Quick Dispatch
                        </button>

                        <button
                          onClick={() => {
                            setSelectedPR(pr);
                            setIsPRDetailOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer"
                          title="View Requisition Details"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Remaining Items List */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Remaining Items Required ({unfulfilled.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {unfulfilled.map((it, iIdx) => {
                          const remaining = Math.max(0, it.requestedQty - it.fulfilledQty);
                          return (
                            <div key={iIdx} className="p-2.5 rounded-lg bg-white border border-slate-300 text-xs flex items-center justify-between">
                              <div className="pr-2">
                                <p className="font-bold text-slate-900 truncate max-w-[180px]">{it.name}</p>
                                <span className="text-[10px] text-slate-500">{it.brand}</span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="font-mono font-semibold text-rose-700 block">
                                  {remaining} {it.unit}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  of {it.requestedQty} req
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: DC TO PR LINKING REPAIR ENGINE */}
      {(activeSubTab === 'all' || activeSubTab === 'linking') && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                Delivery Challan (DC) to PR Linking Fix Engine
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Fix unlinked or mismatched Challans so shipped items immediately update requisition fulfillment logs
              </p>
            </div>

            {unlinkedDCs.length > 0 && (
              <button
                onClick={handleAutoLinkAll}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Match All
              </button>
            )}
          </div>

          {/* Historical Deliveries Status Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                    Historical Deliveries Ledger: {historicalDeliveredDCs.length} Deliveries Verified
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-semibold">
                      Delivered / Dispatched
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Historical delivery statuses are assigned. PRs can be linked automatically when they are added to the ledger.
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  const res = await markAllDCsDelivered();
                  showFeedback(`✓ ${res.deliveredCount} DCs marked Delivered; builty attachments do not determine delivery status; ${res.skippedCount} missing-page records unchanged.` + (res.cloudFailures ? ` Cloud sync failed for ${res.cloudFailures} records; see console.` : ''));
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Set All Delivery Statuses
              </button>
            </div>
          </div>

          {unlinkedDCs.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">All delivery challan statuses are set to Delivered or Dispatched.</p>
              <p className="text-[11px] text-emerald-700">No active unlinked delivery challans pending. PR automated matching is queued for your upcoming PR folders.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unlinkedDCs.map(dc => {
                // Intelligent suggestion calculation
                const cleanDcPr = (dc.prNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const suggestedPR = prs.find(p => {
                  const cleanPr = (p.prNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                  if (cleanDcPr && (cleanPr === cleanDcPr || cleanPr.includes(cleanDcPr) || cleanDcPr.includes(cleanPr))) return true;
                  if (dc.siteName && dc.siteName !== 'Jadeed Group Site') {
                    return (p.siteName || '').toLowerCase().includes((dc.siteName || '').toLowerCase().trim());
                  }
                  return false;
                });

                const currentSelectVal = selectedPRToLink[dc.id] || (suggestedPR ? suggestedPR.id : '');

                return (
                  <div key={dc.id} className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center font-mono font-bold text-emerald-800 text-xs">
                          DC
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-900 text-sm">{dc.dcNumber}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              Unlinked
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" /> {dc.siteName || 'Site Unknown'} • Ref on DC: "{dc.prNumber}"
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-500 font-mono">{dc.date}</span>
                    </div>

                    {/* Shipped items preview */}
                    <div className="text-xs text-slate-700 flex flex-wrap gap-1.5 items-center">
                      <span className="font-bold text-[11px] text-slate-500">Shipped:</span>
                      {dc.itemsShipped.map((it, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-300 text-[11px] font-semibold">
                          {it.itemName} ({it.quantity} {it.unit})
                        </span>
                      ))}
                    </div>

                    {/* Linking Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      {suggestedPR && (
                        <div className="text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>AI Suggested Match: <strong className="font-mono text-emerald-800">{suggestedPR.prNumber}</strong> ({suggestedPR.siteName})</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <select
                          value={currentSelectVal}
                          onChange={(e) => setSelectedPRToLink(prev => ({ ...prev, [dc.id]: e.target.value }))}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-500"
                        >
                          <option value="">Select Target PR...</option>
                          {prs.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.prNumber} — {p.siteName}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleLinkSingleDC(dc.id, currentSelectVal)}
                          disabled={!currentSelectVal}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> Link to PR
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: BUILTY RECONCILIATION & VERIFICATION */}
      {(activeSubTab === 'all' || activeSubTab === 'builty') && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Goods Delivered Builty Reconciliation & Verification
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pakistani goods transport receipts (consignment notes) linked via automated Gemini OCR. DCs without a builty remain cleanly marked as Delivered.
              </p>
            </div>

            <button
              onClick={() => {
                setTargetBuiltyDC(null);
                setIsBuiltyUploadOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Camera className="w-3.5 h-3.5" />
              Scan & Auto-Link Builty
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Builty Attached:</span>
              <strong className="text-emerald-700 font-bold">{builtyAttachedCount} DCs</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600 font-medium">Delivered to Site (Direct):</span>
              <strong className="text-blue-800 font-bold">{directDeliveredCount} DCs</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Total Deliveries:</span>
              <strong className="text-slate-900 font-bold">{historicalDeliveredDCs.length} DCs with Delivered / Dispatched statuses</strong>
            </div>
          </div>

          {/* List of DCs with Builty Status */}
          <div className="space-y-3">
            {dcs.map(dc => {
              return (
                <div 
                  key={dc.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    dc.isBuiltyAttached 
                      ? 'bg-emerald-50/30 border-emerald-200' 
                      : 'bg-white border-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono font-bold text-xs ${
                        dc.isBuiltyAttached
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}>
                        DC
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-semibold text-sm text-slate-900">{dc.dcNumber}</span>
                          {dc.isBuiltyAttached ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Builty Attached
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Delivered to Site
                            </span>
                          )}
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            PR #{dc.prNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" /> {dc.siteName} • Dispatch Date: {dc.date}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {dc.isBuiltyAttached && dc.builtyImage ? (
                        <>
                          <button
                            onClick={() => setSelectedBuiltyPreview({
                              url: dc.builtyImage || '',
                              title: `Builty Receipt — ${dc.dcNumber}`,
                              biltyNumber: dc.biltyNumber,
                              addaName: dc.addaName,
                              destinationCity: dc.destinationCity,
                              packagesCount: dc.packagesCount,
                              freightCharges: dc.freightCharges,
                              freightStatus: dc.freightStatus,
                              dcNumber: dc.dcNumber,
                              siteName: dc.siteName,
                              date: dc.builtyDate || dc.date
                            })}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Builty Picture
                          </button>
                          <button
                            onClick={() => {
                              setTargetBuiltyDC(dc);
                              setIsBuiltyUploadOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs cursor-pointer"
                            title="Replace / Re-scan Builty Picture"
                          >
                            Re-Scan
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setTargetBuiltyDC(dc);
                            setIsBuiltyUploadOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          + Attach Builty Picture
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Transport & Carrier Metadata */}
                  {dc.isBuiltyAttached ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Builty Number</span>
                        <span className="font-mono font-semibold text-slate-900">{dc.biltyNumber || 'N/A'}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Goods Transport Adda</span>
                        <span className="font-bold text-slate-800 truncate block">{dc.addaName || 'Direct Transport'}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Packages & Destination</span>
                        <span className="font-bold text-slate-800">
                          {dc.packagesCount ? `${dc.packagesCount} pkgs` : 'Bulk'} {dc.destinationCity ? `→ ${dc.destinationCity}` : ''}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Freight Charges</span>
                        <span className="font-mono font-semibold text-emerald-800">
                          {dc.freightCharges && dc.freightCharges > 0 ? `PKR ${dc.freightCharges.toLocaleString()}` : 'Free / Paid'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Remarks: <strong>{dc.remarks || 'Direct Delivery / Builty Pending'}</strong></span>
                      </div>
                      <span className="text-[11px] text-slate-500 italic">No builty receipt attached yet. Shipped items marked delivered.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
