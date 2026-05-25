import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy, CheckCircle2, TerminalSquare, Download,
  FileText, Database, Edit3, Save, X,
  Code, Play, Check, HelpCircle,
  Laptop, ExternalLink, ShieldCheck, Terminal,
  Folder, FolderOpen, ChevronDown, ChevronRight
} from 'lucide-react';

interface PlanCanvasProps {
  content: string;
  schema?: string | null;
  schemaFileName?: string | null;
  hasBackend?: boolean;
  projectTitle: string;
  onSave?: (newContent: string, tab: 'plan' | 'schema' | 'readme' | 'boilerplate') => void;
  readme?: string | null;
  boilerplate?: string | null;
  projectId?: string | null;
  originalPrompt?: string;
}

type TabType = 'plan' | 'schema' | 'readme' | 'boilerplate' | 'guide';

export default function PlanCanvas({
  content,
  schema,
  schemaFileName,
  hasBackend = false,
  projectTitle,
  onSave,
  readme,
  boilerplate,
  projectId,
  originalPrompt,
}: PlanCanvasProps) {
  const [activeTab, setActiveTab] = useState<TabType>('plan');
  const [copied, setCopied] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [isModified, setIsModified] = useState(false);

  // AI Generation States
  const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
  const [isGeneratingBoilerplate, setIsGeneratingBoilerplate] = useState(false);

  // Folder collapse states for Sidebar
  const [foldersOpen, setFoldersOpen] = useState({
    plans: true,
    code: true,
    guides: true,
  });

  const toggleFolder = (key: 'plans' | 'code' | 'guides') => {
    setFoldersOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync editorValue when activeTab or underlying content changes
  useEffect(() => {
    const rawContent = (() => {
      switch (activeTab) {
        case 'plan':
          return content;
        case 'schema':
          return schema || '';
        case 'readme':
          return readme || '';
        case 'boilerplate':
          return boilerplate || '';
        default:
          return '';
      }
    })();
    setEditorValue(rawContent);
    setIsModified(false);
  }, [activeTab, content, schema, readme, boilerplate]);

  const activeFileName = useMemo(() => {
    const sanitizedTitle = projectTitle.toLowerCase().replace(/\s+/g, '-');
    switch (activeTab) {
      case 'plan':
        return `${sanitizedTitle}-plan.md`;
      case 'schema':
        return schemaFileName || 'schema.sql';
      case 'readme':
        return 'README.md';
      case 'boilerplate':
        return 'setup.sh';
      default:
        return 'download.txt';
    }
  }, [activeTab, projectTitle, schemaFileName]);

  const handleCopy = () => {
    if (!editorValue) return;
    navigator.clipboard.writeText(editorValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!editorValue) return;
    const mime = (activeTab === 'plan' || activeTab === 'readme') ? 'text/markdown' : 'text/plain';
    const a = document.createElement('a');
    a.href = `data:${mime};charset=utf-8,` + encodeURIComponent(editorValue);
    a.download = activeFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSave = () => {
    if (activeTab === 'plan' || activeTab === 'schema' || activeTab === 'readme' || activeTab === 'boilerplate') {
      onSave?.(editorValue, activeTab);
      setIsModified(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorValue(e.target.value);
    setIsModified(true);
  };

  const switchTab = (tab: TabType) => {
    if (isModified) {
      if (confirm('Apakah Anda ingin membatalkan perubahan yang belum disimpan?')) {
        setActiveTab(tab);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const generateExtraContent = async (type: 'readme' | 'boilerplate') => {
    if (type === 'readme') setIsGeneratingReadme(true);
    else setIsGeneratingBoilerplate(true);

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: originalPrompt || 'Aplikasi Web',
          projectId: projectId || null,
          agentStep: type,
          previousContext: { plan: content },
        }),
      });

      if (!res.ok) throw new Error('Gagal menghubungi AI');

      const data = await res.json();
      if (data.status === 'completed' && data.output) {
        onSave?.(data.output, type);
      } else {
        throw new Error(data.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghubungi server AI. Silakan coba lagi.');
    } finally {
      if (type === 'readme') setIsGeneratingReadme(false);
      else setIsGeneratingBoilerplate(false);
    }
  };

  const hasContent = !!editorValue;
  const isEditable = activeTab !== 'guide';

  return (
    <div className="w-full flex flex-col h-full animate-fadeSlideUp select-none"
         style={{ background: 'var(--panel-bg)', color: 'var(--foreground)' }}>
      
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 border-b flex-shrink-0 gap-4"
           style={{ borderColor: 'var(--panel-border)', background: 'var(--panel-active-bg)' }}>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl"
               style={{ background: 'var(--icon-container-bg)', border: '1px solid var(--icon-container-border)', color: 'var(--text-muted)' }}>
            <TerminalSquare size={20} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold tracking-tight"
                style={{ color: 'var(--text-heading)' }}>
              Developer Workspace
            </h2>
            <p className="text-[10px] md:text-xs" style={{ color: 'var(--text-muted)' }}>
              Edit dan tinjau berkas arsitektur proyek, skema database, dan panduan kode secara langsung
            </p>
          </div>
        </div>

        {/* Global actions */}
        {isEditable && (
          <div className="flex items-center gap-2">
            {isModified && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-md font-semibold"
              >
                <Save size={13} /> Simpan Perubahan
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={!hasContent}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl transition-all cursor-pointer border hover:bg-white/5 font-semibold disabled:opacity-40"
              style={{ borderColor: 'var(--panel-border)', color: 'var(--text-muted)' }}
            >
              <Download size={13} /> Export File
            </button>

            <button
              onClick={handleCopy}
              disabled={!hasContent}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl transition-all cursor-pointer font-semibold ${
                copied
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow disabled:opacity-40'
              }`}
            >
              {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {copied ? 'Tersalin' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile Selector ────────────────────────────────────────── */}
      <div className="block lg:hidden px-4 py-2 border-b"
           style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
        <select
          value={activeTab}
          onChange={(e) => switchTab(e.target.value as TabType)}
          className="w-full border rounded-lg p-2 text-xs focus:outline-none transition-colors"
          style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
        >
          <option value="plan">plan.md (Rencana Pengembangan)</option>
          {hasBackend && schema && <option value="schema">{schemaFileName || 'schema.sql'}</option>}
          <option value="readme">README.md (Dokumentasi)</option>
          <option value="boilerplate">setup.sh (Script Inisialisasi)</option>
          <option value="guide">Panduan Penggunaan</option>
        </select>
      </div>

      {/* ── Split Layout Container ──────────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden min-h-0 relative">
        
        {/* Left Explorer Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-[230px] border-r flex-shrink-0 flex-col"
               style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
          
          <div className="h-10 flex items-center justify-between px-4 border-b"
               style={{ borderColor: 'var(--sidebar-border)' }}>
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              PROJECT FILES
            </span>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-4">
            
            {/* Group 1: Specifications */}
            <div className="space-y-1">
              <div 
                onClick={() => toggleFolder('plans')}
                className="flex items-center gap-1.5 px-2 py-1 cursor-pointer select-none transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {foldersOpen.plans ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                {foldersOpen.plans ? <FolderOpen size={11} className="text-yellow-500" /> : <Folder size={11} className="text-yellow-500" />}
                <span className="text-[9px] font-bold uppercase tracking-wider">Specifications</span>
              </div>

              {foldersOpen.plans && (
                <div className="pl-4 space-y-0.5">
                  <button
                    onClick={() => switchTab('plan')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      activeTab === 'plan' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                    style={activeTab !== 'plan' ? { color: 'var(--text-muted)' } : undefined}
                  >
                    <FileText size={12} className={activeTab === 'plan' ? 'text-blue-500' : ''} />
                    <span className="truncate">plan.md</span>
                  </button>

                  <button
                    onClick={() => switchTab('readme')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      activeTab === 'readme' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                    style={activeTab !== 'readme' ? { color: 'var(--text-muted)' } : undefined}
                  >
                    <FileText size={12} className={activeTab === 'readme' ? 'text-blue-500' : ''} />
                    <span className="truncate">README.md</span>
                  </button>
                </div>
              )}
            </div>

            {/* Group 2: SQL & Shell code */}
            <div className="space-y-1">
              <div 
                onClick={() => toggleFolder('code')}
                className="flex items-center gap-1.5 px-2 py-1 cursor-pointer select-none transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {foldersOpen.code ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                {foldersOpen.code ? <FolderOpen size={11} className="text-cyan-500" /> : <Folder size={11} className="text-cyan-500" />}
                <span className="text-[9px] font-bold uppercase tracking-wider">Source Code & DDL</span>
              </div>

              {foldersOpen.code && (
                <div className="pl-4 space-y-0.5">
                  {hasBackend && schema && (
                    <button
                      onClick={() => switchTab('schema')}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                        activeTab === 'schema' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                      style={activeTab !== 'schema' ? { color: 'var(--text-muted)' } : undefined}
                    >
                      <Database size={12} className={activeTab === 'schema' ? 'text-emerald-500' : ''} />
                      <span className="truncate">{schemaFileName || 'schema.sql'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => switchTab('boilerplate')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      activeTab === 'boilerplate' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                    style={activeTab !== 'boilerplate' ? { color: 'var(--text-muted)' } : undefined}
                  >
                    <Code size={12} className={activeTab === 'boilerplate' ? 'text-amber-500' : ''} />
                    <span className="truncate">setup.sh</span>
                  </button>
                </div>
              )}
            </div>

            {/* Group 3: Help guides */}
            <div className="space-y-1">
              <div 
                onClick={() => toggleFolder('guides')}
                className="flex items-center gap-1.5 px-2 py-1 cursor-pointer select-none transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {foldersOpen.guides ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                {foldersOpen.guides ? <FolderOpen size={11} className="text-purple-500" /> : <Folder size={11} className="text-purple-500" />}
                <span className="text-[9px] font-bold uppercase tracking-wider">Instruction Guides</span>
              </div>

              {foldersOpen.guides && (
                <div className="pl-4 space-y-0.5">
                  <button
                    onClick={() => switchTab('guide')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all cursor-pointer ${
                      activeTab === 'guide' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                    style={activeTab !== 'guide' ? { color: 'var(--text-muted)' } : undefined}
                  >
                    <HelpCircle size={12} className={activeTab === 'guide' ? 'text-purple-500' : ''} />
                    <span className="truncate">Panduan Penggunaan</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* Right main Editor / Viewer area */}
        <main className="flex-grow flex flex-col min-w-0" style={{ background: 'var(--background)' }}>
          
          {isEditable ? (
            /* ─── REAL TEXT EDITOR VIEW ───────────────────────────────── */
            <div className="flex-grow flex flex-col h-full p-4 md:p-6">
              
              {/* Check if files that require generation actually exist */}
              {((activeTab === 'readme' && !readme) || (activeTab === 'boilerplate' && !boilerplate)) ? (
                // AI generator welcome view
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center rounded-2xl border animate-fadeIn"
                     style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                       style={{ background: 'var(--icon-container-bg)', border: '1px solid var(--icon-container-border)', color: 'var(--text-muted)' }}>
                    {activeTab === 'readme' ? <FileText size={20} className="text-blue-500" /> : <Code size={20} className="text-amber-500" />}
                  </div>
                  
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                    Hasilkan berkas {activeTab === 'readme' ? 'README.md' : 'setup.sh'}
                  </h3>
                  <p className="text-xs max-w-sm mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {activeTab === 'readme' 
                      ? 'AI akan menyusun berkas dokumentasi proyek profesional berdasarkan analisis dan rencana pengembangan.'
                      : 'AI akan menyusun script shell inisialisasi folder komputer otomatis sesuai dengan rancangan struktur proyek.'}
                  </p>

                  <button
                    onClick={() => generateExtraContent(activeTab as 'readme' | 'boilerplate')}
                    disabled={isGeneratingReadme || isGeneratingBoilerplate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer font-sans"
                  >
                    {(isGeneratingReadme || isGeneratingBoilerplate) ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Play size={12} className="fill-white" />
                    )}
                    { (isGeneratingReadme || isGeneratingBoilerplate) ? 'Sedang Menyusun...' : `Hasilkan berkas ${activeTab === 'readme' ? 'README.md' : 'setup.sh'}` }
                  </button>
                </div>
              ) : (
                // Real Editor Code View
                <div className="flex-grow flex flex-col rounded-2xl border overflow-hidden h-full animate-fadeIn"
                     style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}>
                  
                  {/* Editor Info Topbar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b text-[10px] font-mono select-none"
                       style={{ borderColor: 'var(--panel-border)', background: 'var(--icon-container-bg)', color: 'var(--text-muted)' }}>
                    <span className="font-semibold text-blue-500">src/{activeTab === 'plan' ? 'docs/plan.md' : activeTab === 'readme' ? 'docs/README.md' : activeTab === 'schema' ? `db/${schemaFileName || 'schema.sql'}` : 'scripts/setup.sh'}</span>
                    {isModified && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans font-semibold tracking-wide">
                        BELUM DISIMPAN
                      </span>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="flex-grow p-4 relative font-mono text-xs md:text-sm">
                    <textarea
                      className="w-full h-full min-h-[300px] font-mono text-xs md:text-sm bg-transparent resize-none focus:outline-none custom-scrollbar select-text leading-relaxed"
                      style={{ color: 'var(--input-text)', caretColor: '#3b82f6' }}
                      value={editorValue}
                      onChange={handleTextareaChange}
                      spellCheck={false}
                      placeholder="Tulis kode di sini..."
                    />
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* ─── READ-ONLY INSTRUCTIONS GUIDE VIEW ────────────────────── */
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 max-w-4xl mx-auto text-left animate-fadeIn">
              
              {/* Header card */}
              <div className="p-6 rounded-2xl border space-y-1"
                   style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">
                  Step-by-Step Blueprint Manual
                </span>
                <h3 className="text-base md:text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                  Panduan Penggunaan Aset Pluto
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Seluruh aset yang telah dirancang Pluto siap diintegrasikan. Ikuti langkah sederhana berikut untuk menyusun aplikasi Anda secara nyata menggunakan asisten AI Anda.
                </p>
              </div>

              {/* Steps grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* step 1 */}
                <div className="p-5 rounded-xl border flex flex-col justify-between space-y-4"
                     style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-500">
                      <FileText size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                        1. Gunakan plan.md (Prioritas: Antigravity)
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Rencana pengembangan ini adalah instruksi menyeluruh untuk asisten AI code generator.
                    </p>
                    <div className="p-3 rounded-lg border space-y-1.5"
                         style={{ background: 'var(--icon-container-bg)', borderColor: 'var(--panel-border)' }}>
                      <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                        <Laptop size={12} /> ALUR UTAMA (Direkomendasikan)
                      </span>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        Salin isi berkas <code className="px-1 py-0.5 rounded font-mono text-[10px] text-blue-500 bg-slate-950/60 border border-white/5">plan.md</code> dan masukkan ke asisten AI <strong>Antigravity</strong> di lingkungan pemrograman Anda untuk menyusun source code secara otomatis.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => switchTab('plan')}
                    className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-500/20 transition-all cursor-pointer text-center"
                  >
                    Buka plan.md
                  </button>
                </div>

                {/* step 2 */}
                {hasBackend && (
                  <div className="p-5 rounded-xl border flex flex-col justify-between space-y-4"
                       style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Database size={16} />
                        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                          2. Eksekusi SQL di Supabase
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Eksekusi DDL SQL otomatis untuk membuat seluruh tabel database Supabase Anda.
                      </p>
                      <div className="p-3 rounded-lg border space-y-2"
                           style={{ background: 'var(--icon-container-bg)', borderColor: 'var(--panel-border)' }}>
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <Terminal size={12} /> SQL Editor Setup
                        </span>
                        <ol className="list-decimal pl-4 text-[11px] space-y-1.5 leading-normal" style={{ color: 'var(--foreground)' }}>
                          <li>Salin skrip SQL di tab <code className="px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-500 bg-slate-950/60 border border-white/5">{schemaFileName || 'schema.sql'}</code>.</li>
                          <li>Masuk ke dashboard <strong>Supabase</strong> Anda.</li>
                          <li>Buka <strong>SQL Editor</strong>, klik <strong>New Query</strong>, tempelkan skrip, lalu tekan <strong>Run</strong>.</li>
                        </ol>
                      </div>
                    </div>
                    <button
                      onClick={() => switchTab('schema')}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20 transition-all cursor-pointer text-center"
                    >
                      Buka schema.sql
                    </button>
                  </div>
                )}

                {/* step 3 */}
                <div className="p-5 rounded-xl border flex flex-col justify-between space-y-4"
                     style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Code size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                        3. Inisiasi dengan setup.sh
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Skrip shell untuk mengotomatiskan pembuatan struktur folder awal kosong secara instan di komputer lokal Anda.
                    </p>
                    <div className="p-3 rounded-lg border space-y-2"
                         style={{ background: 'var(--icon-container-bg)', borderColor: 'var(--panel-border)' }}>
                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                        <Terminal size={12} /> Terminal Execution
                      </span>
                      <ol className="list-decimal pl-4 text-[11px] space-y-1.5 leading-normal" style={{ color: 'var(--foreground)' }}>
                        <li>Download skrip <code className="px-1.5 py-0.5 rounded font-mono text-[10px] text-amber-500 bg-slate-950/60 border border-white/5">setup.sh</code> ke direktori kosong proyek Anda.</li>
                        <li>Buka <strong>Terminal</strong> atau <strong>Git Bash</strong>.</li>
                        <li>Jalankan perintah berikut:
                          <pre className="mt-1.5 p-2 rounded text-emerald-400 font-mono text-[10px] bg-slate-950/80 border border-white/5 select-all">bash setup.sh</pre>
                        </li>
                      </ol>
                    </div>
                  </div>
                  <button
                    onClick={() => switchTab('boilerplate')}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-500/20 transition-all cursor-pointer text-center"
                  >
                    Buka setup.sh
                  </button>
                </div>

                {/* step 4 */}
                <div className="p-5 rounded-xl border flex flex-col justify-between space-y-4"
                     style={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-500">
                      <FileText size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                        4. Pasang Dokumentasi Proyek
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      README.md premium untuk meningkatkan kredibilitas proyek di repositori GitHub Anda.
                    </p>
                    <div className="p-3 rounded-lg border space-y-2"
                         style={{ background: 'var(--icon-container-bg)', borderColor: 'var(--panel-border)' }}>
                      <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                        <ShieldCheck size={12} /> GitHub Publication
                      </span>
                      <ol className="list-decimal pl-4 text-[11px] space-y-1.5 leading-normal" style={{ color: 'var(--foreground)' }}>
                        <li>Unduh berkas <code className="px-1.5 py-0.5 rounded font-mono text-[10px] text-rose-500 bg-slate-950/60 border border-white/5">README.md</code>.</li>
                        <li>Tempatkan berkas di root folder proyek Anda.</li>
                        <li>Push kode ke GitHub untuk menampilkan dokumentasi.</li>
                      </ol>
                    </div>
                  </div>
                  <button
                    onClick={() => switchTab('readme')}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-rose-500/20 transition-all cursor-pointer text-center"
                  >
                    Buka README.md
                  </button>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
