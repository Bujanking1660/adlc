import React, { useState } from 'react';
import {
  Copy, CheckCircle2, TerminalSquare, Download,
  FileText, Database, Edit3, Save, X,
} from 'lucide-react';

interface PlanCanvasProps {
  content: string;
  schema?: string | null;
  schemaFileName?: string | null;
  hasBackend?: boolean;
  projectTitle: string;
  onSave?: (newContent: string, tab: 'plan' | 'schema') => void;
}

export default function PlanCanvas({
  content,
  schema,
  schemaFileName,
  hasBackend = false,
  projectTitle,
  onSave,
}: PlanCanvasProps) {
  const [activeTab,    setActiveTab]    = useState<'plan' | 'schema'>('plan');
  const [copied,       setCopied]       = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [editDraft,    setEditDraft]    = useState('');

  const activeContent  = activeTab === 'plan' ? content : (schema || '');
  const activeFileName = activeTab === 'plan'
    ? projectTitle.toLowerCase().replace(/\s+/g, '-') + '-plan.md'
    : (schemaFileName || 'schema.sql');

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!activeContent) return;
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeContent) return;
    const mime = activeTab === 'plan' ? 'text/markdown' : 'text/plain';
    const a    = document.createElement('a');
    a.href     = `data:${mime};charset=utf-8,` + encodeURIComponent(activeContent);
    a.download = activeFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const startEdit = () => {
    setEditDraft(activeContent);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditDraft('');
    setIsEditing(false);
  };

  const commitEdit = () => {
    onSave?.(editDraft, activeTab);
    setIsEditing(false);
    setEditDraft('');
  };

  // When switching tabs, leave edit mode
  const switchTab = (tab: 'plan' | 'schema') => {
    if (isEditing) cancelEdit();
    setActiveTab(tab);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col h-full animate-fadeSlideUp">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-4">

        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg border"
            style={{ background: 'var(--icon-container-bg)', borderColor: 'var(--icon-container-border)', color: 'var(--text-muted)' }}
          >
            <TerminalSquare size={22} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Development Plan
            </h2>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
              Siap diekspor ke AI Code Generator
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Edit / Save / Cancel */}
          {onSave && !isEditing && (
            <button
              onClick={startEdit}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] border hover:border-blue-500/50"
              style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
              title="Edit content"
            >
              <Edit3 size={14} /> <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={cancelEdit}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-all cursor-pointer border hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
                style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
              >
                <X size={14} /> Batal
              </button>
              <button
                onClick={commitEdit}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white border border-transparent shadow-md"
              >
                <Save size={14} /> Simpan
              </button>
            </>
          )}

          {!isEditing && (
            <>
              <button
                onClick={handleDownload}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] border hover:border-blue-500/30"
                style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
                title={`Download ${activeFileName}`}
              >
                <Download size={15} /> <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={!activeContent}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                  copied
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border border-transparent shadow-md shadow-blue-900/40 hover:shadow-blue-600/25 disabled:opacity-50'
                }`}
              >
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                {copied ? 'Tersalin!' : activeTab === 'plan' ? 'Copy Plan' : 'Copy Schema'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Editor shell ─────────────────────────────────────────────── */}
      <div
        className="flex-grow rounded-2xl overflow-hidden flex flex-col border shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative"
        style={{ background: '#080c16', borderColor: 'var(--panel-border)' }}
      >
        {/* Tab bar */}
        <div
          className="h-11 border-b flex items-center justify-between px-4 flex-shrink-0"
          style={{ background: '#0e172a', borderColor: 'var(--panel-border)' }}
        >
          <div className="flex items-center gap-1.5 h-full">
            {/* Traffic lights */}
            <div className="w-3 h-3 rounded-full bg-rose-500/70 flex-shrink-0" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70 flex-shrink-0" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70 flex-shrink-0" />

            {/* Tabs */}
            <div className="flex ml-5 h-full">
              <button
                onClick={() => switchTab('plan')}
                className={`px-4 h-full text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'plan'
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent hover:text-slate-200'
                }`}
                style={{ color: activeTab !== 'plan' ? 'var(--text-muted)' : undefined }}
              >
                <FileText size={12} /> plan.md
              </button>

              {hasBackend && schema && (
                <button
                  onClick={() => switchTab('schema')}
                  className={`px-4 h-full text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'schema'
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent hover:text-slate-200'
                  }`}
                  style={{ color: activeTab !== 'schema' ? 'var(--text-muted)' : undefined }}
                >
                  <Database size={12} /> {schemaFileName || 'schema.sql'}
                </button>
              )}
            </div>
          </div>

          {isEditing && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold tracking-wide">
              EDITING
            </span>
          )}
        </div>

        {/* Content area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar" style={{ background: '#080c16' }}>
          {!activeContent ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No content generated.
            </div>
          ) : isEditing ? (
            <textarea
              autoFocus
              className="w-full h-full p-4 md:p-6 font-mono text-xs md:text-sm resize-none focus:outline-none custom-scrollbar"
              style={{ background: 'transparent', color: '#a0b0c8', caretColor: '#3b82f6' }}
              value={editDraft}
              onChange={e => setEditDraft(e.target.value)}
              spellCheck={false}
            />
          ) : (
            <pre className="p-4 md:p-6 font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed text-slate-300">
              {activeContent}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
