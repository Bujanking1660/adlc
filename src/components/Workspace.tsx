'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Send, Sparkles, PenTool, Database, Code2, Layers,
  AlertTriangle, CheckCircle2, X, Clock, ChevronRight,
  RefreshCw, Trash2, Target, Settings, User, LogOut,
} from 'lucide-react';
import InteractiveModal from './InteractiveModal';
import AgentProgress, { AgentStep } from './AgentProgress';
import PlanCanvas from './PlanCanvas';
import Header, { Theme } from './Header';
import { createClientBrowser } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkspaceProps {
  user: any | null;
  onLogout: () => void;
  theme?: Theme;
  onThemeChange?: (t: Theme) => void;
}

interface HistoryItem {
  id: string;
  title: string;
  prompt: string;
  plan: string;
  schema?: string | null;
  schemaFileName?: string | null;
  hasBackend: boolean;
  createdAt: string;
}

type AgentKey = 'analyst' | 'frontend' | 'backend' | 'qa';

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENT_ORDER: AgentKey[] = ['analyst', 'frontend', 'backend', 'qa'];
const LS_HISTORY = 'pluto_history';
const LS_THEME = 'pluto_theme';

const makeInitialSteps = (): AgentStep[] => [
  { id: '1', name: 'System Analyst Agent', status: 'idle' },
  { id: '2', name: 'UI/UX Frontend Agent', status: 'idle' },
  { id: '3', name: 'Database Backend Agent', status: 'idle' },
  { id: '4', name: 'QA & DevOps Agent', status: 'idle' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Workspace({ 
  user, 
  onLogout,
  theme = 'dark',
  onThemeChange,
}: WorkspaceProps) {
  // Theme state is now managed globally at the root component.

  // ── Sidebar / History ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // ── Account & Settings State ───────────────────────────────────────────────
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.full_name || '');
    }
  }, [user]);

  // ── Core workspace state ───────────────────────────────────────────────────
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>(makeInitialSteps());
  const [finalPlan, setFinalPlan] = useState<string | null>(null);
  const [finalSchema, setFinalSchema] = useState<string | null>(null);
  const [schemaFileName, setSchemaFileName] = useState<string | null>(null);
  const [hasBackend, setHasBackend] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Agent orchestration state
  const [modalQuestions, setModalQuestions] = useState<{ id: string; question: string }[] | null>(null);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [agentContext, setAgentContext] = useState<Record<string, string>>({});

  // Persona focus state
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [updatePrompt, setUpdatePrompt] = useState('');

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(prev => prev?.message === message ? null : prev), 4500);
  }, []);

  // ── Workspace State Resetter ───────────────────────────────────────────────
  const resetWorkspace = useCallback(() => {
    setPrompt('');
    setUpdatePrompt('');
    setSelectedStepId(null);
    setSteps(makeInitialSteps());
    setFinalPlan(null);
    setFinalSchema(null);
    setSchemaFileName(null);
    setHasBackend(false);
    setProjectId(null);
    setHasStarted(false);
    setCurrentAgentIndex(0);
    setAgentContext({});
  }, []);

  // ── Database & History Sync ────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await fetch(`/api/projects?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.projects) {
            const mappedHistory: HistoryItem[] = data.projects.map((proj: any) => {
              const finalPlanObj = proj.final_plan || {};
              return {
                id: proj.id,
                title: proj.title,
                prompt: proj.original_prompt,
                plan: finalPlanObj.plan || '',
                schema: finalPlanObj.schema || null,
                schemaFileName: finalPlanObj.schemaFileName || null,
                hasBackend: !!finalPlanObj.hasBackend,
                createdAt: proj.created_at,
              };
            });
            setHistory(mappedHistory);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load history from DB:', err);
      }
    }

    try {
      const raw = localStorage.getItem(LS_HISTORY);
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    if (user?.id) {
      loadHistory();
      return;
    }

    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 30); // keep latest 30
      localStorage.setItem(LS_HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, [user, loadHistory]);

  const deleteHistoryItem = useCallback(async (id: string) => {
    if (user?.id) {
      try {
        const response = await fetch(`/api/projects?projectId=${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          showToast('Project berhasil dihapus.', 'success');
          loadHistory();
          if (projectId === id) {
            resetWorkspace();
          }
          return;
        } else {
          showToast('Gagal menghapus project.', 'error');
        }
      } catch (err) {
        console.error('Failed to delete project:', err);
        showToast('Gagal menghubungi database.', 'error');
      }
    }

    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem(LS_HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, [user, projectId, loadHistory, resetWorkspace, showToast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || isSavingProfile) return;
    setIsSavingProfile(true);
    const supabase = createClientBrowser();
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: profileName },
        });
        if (error) {
          showToast(error.message, 'error');
        } else {
          showToast('Profil berhasil diperbarui.', 'success');
          setIsSettingsModalOpen(false);
        }
      } catch (err) {
        showToast('Gagal memperbarui profil.', 'error');
      } finally {
        setIsSavingProfile(false);
      }
    }
  };

  // ── Agent orchestration ───────────────────────────────────────────────────
  const runAgent = useCallback(async (
    agentIndex: number,
    contextAcc: Record<string, string>,
    overrideAnswers?: Record<string, string>,
    currentPrompt?: string,
    currentProjectId?: string | null,
  ) => {
    if (agentIndex >= AGENT_ORDER.length) return;

    setIsProcessing(true);
    const agentStep = AGENT_ORDER[agentIndex];

    setSteps(prev => prev.map((s, idx) =>
      idx === agentIndex ? { ...s, status: 'processing', message: 'Sedang menganalisis...' } : s
    ));

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          userId: user?.id,
          additionalContext: overrideAnswers,
          projectId: currentProjectId,
          agentStep,
          previousContext: contextAcc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const raw = errorData.error || '';
        const isQuota = ['quota', 'exhausted', 'limit', '429', 'api_key', 'not configured']
          .some(k => raw.toLowerCase().includes(k));
        const msg = isQuota
          ? 'Token API Gemini telah habis atau limit terlampaui. Silakan coba lagi atau periksa API Key Anda.'
          : raw || 'Terjadi kesalahan pada server.';
        showToast(msg, 'error');
        setSteps(prev => prev.map((s, idx) => idx === agentIndex ? { ...s, status: 'error', message: msg } : s));
        setIsProcessing(false);
        return;
      }

      const data = await response.json();

      if (data.status === 'out_of_scope') {
        showToast(data.message || 'Permintaan di luar lingkup Pluto.', 'info');
        setIsProcessing(false);
        setSteps(makeInitialSteps());
        setHasStarted(false);
        return;
      }

      if (data.status === 'waiting_user_input') {
        setSteps(prev => prev.map((s, idx) =>
          idx === agentIndex ? { ...s, status: 'waiting_user_input', message: 'Membutuhkan klarifikasi.' } : s
        ));
        setModalQuestions(data.questions);
        if (data.projectId) setProjectId(data.projectId);
        setIsProcessing(false);
        return;
      }

      if (data.status === 'completed') {
        if (data.projectId && !currentProjectId) setProjectId(data.projectId);

        setSteps(prev => prev.map((s, idx) =>
          idx === agentIndex ? { ...s, status: 'completed' } : s
        ));

        if (agentStep === 'qa') {
          const plan = data.plan || '';
          const schema = data.schema || null;
          const sfn = data.schemaFileName || null;
          const hb = !!data.hasBackend;

          setFinalPlan(plan);
          setFinalSchema(schema);
          setSchemaFileName(sfn);
          setHasBackend(hb);
          setIsProcessing(false);
          showToast('Project Plan berhasil dirancang! 🎉', 'success');
          // Auto-clear the brief textarea so user can type a refinement update
          setPrompt('');
          setUpdatePrompt('');
          setSelectedStepId(null);

          // Persist to local history
          if (currentPrompt) {
            saveToHistory({
              title: currentPrompt.slice(0, 60) + (currentPrompt.length > 60 ? '…' : ''),
              prompt: currentPrompt,
              plan,
              schema,
              schemaFileName: sfn,
              hasBackend: hb,
            });
          }
        } else {
          const newCtx = { ...contextAcc, [agentStep]: data.output };
          setAgentContext(newCtx);
          setCurrentAgentIndex(agentIndex + 1);
          runAgent(agentIndex + 1, newCtx, undefined, currentPrompt, currentProjectId);
        }
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      const isQuota = ['quota', 'exhausted', 'limit', '429', 'api_key']
        .some(k => msg.toLowerCase().includes(k));
      const displayMsg = isQuota
        ? 'Token API Gemini telah habis atau limit terlampaui.'
        : 'Terjadi kesalahan koneksi atau sistem.';
      showToast(displayMsg, 'error');
      setSteps(prev => prev.map((s, idx) =>
        idx === agentIndex ? { ...s, status: 'error', message: displayMsg } : s
      ));
      setIsProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, showToast, saveToHistory]);

  // ── Start / Reset / Modal ────────────────────────────────────────────────
  const startOrchestration = useCallback((overridePrompt?: string) => {
    const p = overridePrompt ?? prompt;
    if (!p.trim()) return;
    setHasStarted(true);
    setCurrentAgentIndex(0);
    setAgentContext({});
    setSteps(makeInitialSteps());
    setFinalPlan(null);
    setFinalSchema(null);
    setSchemaFileName(null);
    setHasBackend(false);
    setProjectId(null);
    runAgent(0, {}, undefined, p, null);
  }, [prompt, runAgent]);

  const handleModalSubmit = useCallback((answers: Record<string, string>) => {
    setModalQuestions(null);
    runAgent(currentAgentIndex, agentContext, answers, prompt, projectId);
  }, [currentAgentIndex, agentContext, prompt, projectId, runAgent]);

  // Load a history item into the workspace
  const loadHistoryItem = useCallback((item: HistoryItem) => {
    setPrompt(item.prompt);
    setFinalPlan(item.plan);
    setFinalSchema(item.schema ?? null);
    setSchemaFileName(item.schemaFileName ?? null);
    setHasBackend(item.hasBackend);
    setProjectId(item.id);
    setHasStarted(true);
    setSteps(makeInitialSteps().map(s => ({ ...s, status: 'completed' })));
    setSidebarOpen(false);
  }, []);

  // Save edited plan
  const handleSavePlan = useCallback(async (newContent: string, tab: 'plan' | 'schema') => {
    const nextPlan = tab === 'plan' ? newContent : finalPlan;
    const nextSchema = tab === 'schema' ? newContent : finalSchema;

    if (tab === 'plan') setFinalPlan(newContent);
    else setFinalSchema(newContent);

    if (user?.id && projectId) {
      try {
        const response = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            final_plan: {
              plan: nextPlan,
              schema: nextSchema,
              schemaFileName,
              hasBackend,
            },
          }),
        });
        if (response.ok) {
          showToast('Perubahan berhasil disimpan ke database.', 'success');
          loadHistory();
          return;
        } else {
          showToast('Gagal menyimpan perubahan ke database.', 'error');
        }
      } catch (err) {
        console.error('Failed to save to database:', err);
        showToast('Gagal menghubungkan ke database.', 'error');
      }
    }

    showToast('Perubahan berhasil disimpan.', 'success');
    if (finalPlan) {
      setHistory(prev => {
        const idx = prev.findIndex(h => h.plan === finalPlan);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [tab === 'plan' ? 'plan' : 'schema']: newContent };
        localStorage.setItem(LS_HISTORY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [finalPlan, finalSchema, schemaFileName, hasBackend, user, projectId, loadHistory, showToast]);


  // Handle persona step click — toggle focus
  const handleStepClick = useCallback((id: string) => {
    setSelectedStepId(prev => prev === id ? null : id);
  }, []);

  // Map step ID → agent start index
  const stepIdToIndex: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };

  // Send a targeted or general update to re-run from selected agent
  const handleSendUpdate = useCallback(() => {
    const p = updatePrompt.trim();
    if (!p || isProcessing) return;

    const startIndex = selectedStepId ? (stepIdToIndex[selectedStepId] ?? 0) : 0;

    // Reset only the steps from startIndex onwards
    setSteps(prev => prev.map((s, idx) => (
      idx >= startIndex ? { ...s, status: idx === startIndex ? 'processing' : 'idle', message: undefined } : s
    )));
    setFinalPlan(null);
    setFinalSchema(null);
    setSchemaFileName(null);
    setHasBackend(false);
    setCurrentAgentIndex(startIndex);

    // Re-run from the chosen start index, carrying existing context for earlier agents
    runAgent(startIndex, agentContext, undefined, p, projectId);
  }, [updatePrompt, isProcessing, selectedStepId, agentContext, projectId, runAgent]);

  const userName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Guest';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-[2px] z-30 transition-opacity duration-300 cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── History Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out border-r fixed md:static inset-y-0 left-0 z-40 md:z-auto ${
          sidebarOpen ? 'shadow-2xl md:shadow-none' : ''
        }`}
        style={{
          width: sidebarOpen ? '280px' : '0px',
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
        }}
      >
        <div className="w-[280px] h-full flex flex-col">
          {/* Sidebar header */}
          <div
            className="h-14 md:h-16 flex items-center gap-2 px-4 border-b flex-shrink-0"
            style={{ borderColor: 'var(--sidebar-border)' }}
          >
            <Clock size={15} className="text-blue-400 flex-shrink-0" />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
              Project History
            </span>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
            >
              {history.length}
            </span>
          </div>

          {/* History list */}
          <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-2">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <Clock size={28} className="mb-3 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Belum ada history. Buat project plan pertamamu!
                </p>
              </div>
            ) : (
              history.map(item => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onLoad={loadHistoryItem}
                  onDelete={deleteHistoryItem}
                />
              ))
            )}
          </div>

          {/* Clear all */}
          {history.length > 0 && (
            <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem(LS_HISTORY);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs transition-all cursor-pointer hover:bg-rose-500/10 hover:text-rose-400"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 size={13} /> Clear All History
              </button>
            </div>
          )}

          {/* User Account & Settings */}
          <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'var(--sidebar-border)', background: 'var(--sidebar-footer-bg, rgba(255, 255, 255, 0.02))' }}>
            {user ? (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md">
                    {profileName ? profileName.slice(0, 2).toUpperCase() : (user.email ? user.email.slice(0, 2).toUpperCase() : '?')}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate text-[var(--text-heading)]" style={{ color: 'var(--text-heading)' }}>
                      {profileName || 'User'}
                    </span>
                    <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {user.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  title="Profile & Settings"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Settings size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs select-none" style={{ color: 'var(--text-muted)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Local Work Mode
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main Area ───────────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col min-w-0">
        <Header
          onNewPlan={resetWorkspace}
          theme={theme}
          onThemeChange={onThemeChange}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(v => !v)}
        />

        <main className="flex-grow overflow-y-auto w-full flex justify-center custom-scrollbar relative">

          {/* ─── Landing / Prompt Screen ─────────────────────────────── */}
          {!hasStarted ? (
            <div className="w-full max-w-3xl flex flex-col items-center justify-center pt-16 md:pt-24 pb-12 px-4 animate-fadeSlideUp">
              {/* Hero icon */}
              <div className="w-24 h-24 mb-6 relative flex items-center justify-center transition-transform hover:scale-105 duration-300">
                <img
                  src="/icon.png"
                  alt="Pluto Logo"
                  className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_10px_30px_rgba(59,130,246,0.55)]"
                />
              </div>

              <h1 className="text-2xl md:text-4xl font-medium text-center mb-1" style={{ color: 'var(--text-heading)' }}>
                Hi {userName},
              </h1>
              <h2 className="text-2xl md:text-4xl font-medium text-center mb-8 md:mb-10" style={{ color: 'var(--foreground)' }}>
                Ready to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400 font-bold">
                  architect your app?
                </span>
              </h2>

              {/* Prompt textarea */}
              <div
                className="w-full rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all flex flex-col border focus-within:border-blue-500/50 focus-within:shadow-[0_8px_30px_rgba(59,130,246,0.12)]"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
              >
                <textarea
                  className="w-full min-h-[100px] md:min-h-[120px] p-4 md:p-5 bg-transparent resize-none focus:outline-none placeholder:text-slate-500 text-sm md:text-base custom-scrollbar"
                  style={{ color: 'var(--input-text)' }}
                  placeholder="Describe the application you want to build (e.g., A marketplace for local farmers)..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); startOrchestration(); }
                  }}
                />
              </div>

              <div className="flex items-center justify-end mt-3 w-full">
                <button
                  onClick={() => startOrchestration()}
                  disabled={!prompt.trim() || isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-950/40 hover:shadow-blue-600/20 active:scale-[0.98] cursor-pointer"
                >
                  Mulai Rancang Plan <Send size={14} />
                </button>
              </div>

              {/* Example cards */}
              <div className="w-full mt-12 hidden md:block">
                <p className="text-xs font-semibold mb-4 tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                  GET STARTED WITH AN EXAMPLE BELOW
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <ExampleCard title="Buatkan plan UI dashboard admin" icon={<PenTool size={18} />}
                    onClick={() => setPrompt("Tolong buatkan plan pengembangan UI dashboard admin lengkap dengan sidebar, tabel data, dan grafik untuk aplikasi inventory.")} />
                  <ExampleCard title="Desain skema e-commerce" icon={<Database size={18} />}
                    onClick={() => setPrompt("Rancang skema database Supabase lengkap dengan relasi untuk aplikasi e-commerce sederhana.")} />
                  <ExampleCard title="Aplikasi portfolio minimalis" icon={<Code2 size={18} />}
                    onClick={() => setPrompt("Buatkan plan aplikasi portfolio pribadi yang simpel tanpa backend, gunakan animasi framer motion.")} />
                  <ExampleCard title="Sistem kasir (POS) warkop" icon={<Sparkles size={18} />}
                    onClick={() => setPrompt("Saya ingin membuat sistem Point of Sales (Kasir) khusus warkop dengan fitur scan barcode dan database PostgreSQL.")} />
                </div>
              </div>
            </div>

          ) : (
            /* ─── Active Workspace ──────────────────────────────────── */
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row p-4 md:p-8 gap-6 md:gap-8 animate-fadeSlideUp">

              {/* Left column: brief + agent progress */}
              <div className="w-full md:w-[340px] flex-shrink-0 flex flex-col gap-5">
                {/* Interactive Project Brief Update Panel */}
                <div
                  className="rounded-2xl p-5 shadow-lg border"
                  style={{ background: 'var(--panel-active-bg)', borderColor: 'var(--panel-active-border)' }}
                >
                  <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--panel-border)' }}>
                    <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                      <Sparkles size={16} className="text-blue-400" /> Project Brief
                    </h2>
                    <button
                      onClick={resetWorkspace}
                      title="New Plan"
                      className="p-1 rounded-md hover:bg-blue-500/10 transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {/* Focus Mode Badge */}
                  {selectedStepId && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10">
                      <Target size={13} className="text-blue-400 flex-shrink-0 animate-pulse" />
                      <span className="text-xs font-semibold text-blue-300 truncate">
                        Fokus: {steps.find(s => s.id === selectedStepId)?.name ?? 'Agent'}
                      </span>
                      <button
                        onClick={() => setSelectedStepId(null)}
                        className="ml-auto flex-shrink-0 text-blue-400 hover:text-blue-200 transition-colors cursor-pointer"
                        title="Batal fokus"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {/* Textarea for new/update prompt */}
                  <div
                    className="rounded-xl overflow-hidden border transition-all focus-within:border-blue-500/50 focus-within:shadow-[0_0_14px_rgba(59,130,246,0.12)]"
                    style={{ borderColor: 'var(--input-border)', background: 'var(--input-bg)' }}
                  >
                    <textarea
                      className="w-full min-h-[88px] p-3 bg-transparent resize-none focus:outline-none text-sm leading-relaxed custom-scrollbar placeholder:text-slate-500"
                      style={{ color: 'var(--input-text)' }}
                      placeholder={
                        selectedStepId
                          ? `Ketik update khusus untuk ${steps.find(s => s.id === selectedStepId)?.name ?? 'agen ini'}...`
                          : 'Ketik update atau perbaikan untuk plan ini...'
                      }
                      value={updatePrompt}
                      onChange={e => setUpdatePrompt(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendUpdate(); }
                      }}
                      disabled={isProcessing}
                    />
                  </div>

                  <button
                    onClick={handleSendUpdate}
                    disabled={!updatePrompt.trim() || isProcessing}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-950/30 hover:shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
                  >
                    <Send size={13} />
                    {selectedStepId ? 'Kirim Update Terfokus' : 'Kirim Update Plan'}
                  </button>
                </div>

                <div className="flex-grow">
                  <AgentProgress
                    steps={steps}
                    selectedStepId={selectedStepId}
                    onStepClick={handleStepClick}
                  />
                </div>
              </div>

              {/* Right column: plan canvas */}
              <div
                className="flex-grow min-h-[500px] md:min-h-[600px] rounded-3xl border p-0 md:p-6 relative md:shadow-lg"
                style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
              >
                {finalPlan ? (
                  <PlanCanvas
                    content={finalPlan}
                    schema={finalSchema}
                    schemaFileName={schemaFileName}
                    hasBackend={hasBackend}
                    projectTitle="Pluto Project Plan"
                    onSave={handleSavePlan}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8" style={{ color: 'var(--text-muted)' }}>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-6 border border-blue-500/20 bg-blue-500/5 shadow-inner animate-pulse">
                      <Code2 size={28} className="text-blue-400" />
                    </div>
                    <h3 className="text-base md:text-lg font-medium mb-2" style={{ color: 'var(--text-heading)' }}>
                      Memproses Plan...
                    </h3>
                    <p className="text-xs md:text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
                      Agen Pluto sedang bekerja untuk merangkai solusi dan menyusun rencana pengembangan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Interactive Modal ────────────────────────────────────────── */}
      {modalQuestions && (
        <InteractiveModal
          questions={modalQuestions}
          onSubmit={handleModalSubmit}
          agentName={steps[currentAgentIndex]?.name}
          onCancel={() => {
            setModalQuestions(null);
            setSteps(prev => prev.map((s, idx) =>
              idx === currentAgentIndex ? { ...s, status: 'error', message: 'Dibatalkan oleh pengguna.' } : s
            ));
            setIsProcessing(false);
          }}
        />
      )}

      {/* ─── Profile & Settings Modal ───────────────────────────────── */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl relative animate-scaleIn"
            style={{ background: 'var(--panel-active-bg)', borderColor: 'var(--panel-active-border)' }}
          >
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b pb-3" style={{ borderColor: 'var(--panel-border)' }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>
                  Profile & Settings
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Manage your personal details and account access
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white/5 opacity-60 cursor-not-allowed focus:outline-none"
                  style={{ borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white/5 focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ borderColor: 'var(--panel-border)', color: 'var(--text-heading)' }}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t gap-3" style={{ borderColor: 'var(--panel-border)' }}>
                {/* Logout Button in Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    onLogout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut size={14} /> Logout
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile || !profileName.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Toast ───────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-l-4 animate-slideInUp max-w-md ${toast.type === 'error' ? 'border-l-rose-500'
            : toast.type === 'success' ? 'border-l-emerald-500'
              : 'border-l-blue-500'
          }`}
          style={{ background: 'var(--panel-active-bg)', borderColor: 'var(--panel-border)' }}
        >
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${toast.type === 'error' ? 'bg-rose-500/10 text-rose-400'
              : toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-blue-500/10 text-blue-400'
            }`}>
            {toast.type === 'error' ? <AlertTriangle size={18} />
              : toast.type === 'success' ? <CheckCircle2 size={18} />
                : <Sparkles size={18} />}
          </div>
          <p className="flex-grow text-sm font-medium leading-relaxed" style={{ color: 'var(--text-heading)' }}>
            {toast.message}
          </p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 cursor-pointer hover:text-white transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExampleCard({ title, icon, onClick }: { title: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border p-4 rounded-xl cursor-pointer transition-all flex flex-col h-28 md:h-32 justify-between hover:border-blue-500/50"
      style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
    >
      <p className="text-xs md:text-sm font-medium line-clamp-3 leading-relaxed" style={{ color: 'var(--foreground)' }}>
        {title}
      </p>
      <div className="text-blue-400">{icon}</div>
    </div>
  );
}

function HistoryCard({
  item,
  onLoad,
  onDelete,
}: {
  item: HistoryItem;
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}) {
  const date = new Date(item.createdAt).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="group relative p-3 rounded-xl border cursor-pointer transition-all hover:border-blue-500/40"
      style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
      onClick={() => onLoad(item)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-relaxed line-clamp-2 flex-grow" style={{ color: 'var(--text-heading)' }}>
          {item.title}
        </p>
        <button
          onClick={e => { e.stopPropagation(); onDelete(item.id); }}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={12} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{date}</span>
        {item.hasBackend && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Backend
          </span>
        )}
        <ChevronRight size={12} className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
