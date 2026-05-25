'use client';

import React, { useState } from 'react';
import { 
  FileText, Database, LayoutGrid, Milestone, Copy, Check, Download, 
  Sparkles, Terminal, Info, AlertTriangle, Lightbulb 
} from 'lucide-react';

export interface Project {
  id?: string;
  prompt?: string;
  mockMode?: boolean;
  system_analyst_plan?: any;
  frontend_plan?: any;
  backend_plan?: any;
  roadmap_plan?: any;
  [key: string]: any;
}

interface PlanViewerProps {
  project: Project;
}

type TabType = 'summary' | 'backend' | 'frontend' | 'roadmap';

export default function PlanViewer({ project }: PlanViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const sa = project.system_analyst_plan || {};
  const fe = project.frontend_plan || {};
  const be = project.backend_plan || {};
  const rm = project.roadmap_plan || {};

  const handleCopy = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks:', err);
    }
  };

  // Fungsi untuk memformat seluruh rencana pengembangan menjadi format Markdown bersih
  const generateFullMarkdown = () => {
    return `# RENCANA PENGEMBANGAN APLIKASI: ${sa.appName || 'ADLC PLAN'}
*Dihasilkan otomatis oleh ADLC Planner - AI Development Life Cycle*

## 1. RINGKASAN ANALISIS SISTEM (System Analyst)
* **Tujuan Utama**: ${sa.coreGoal || '-'}
* **Target Pengguna**: ${sa.targetAudience || '-'}
* **Arsitektur Makro**: ${sa.systemArchitecture || '-'}
* **Tumpukan Teknologi**: ${Array.isArray(sa.suggestedStack) ? sa.suggestedStack.join(', ') : '-'}

### Kebutuhan yang Dieliminasi (Cost-Reduction):
${Array.isArray(sa.removedBloat) ? sa.removedBloat.map((b: string) => `- ${b}`).join('\n') : '-'}

---

## 2. RANCANGAN UI/UX & FRONTEND (Frontend Developer)
### Desain Visual & Token:
* **Nuansa/Vibes**: ${fe.designTokens?.vibes || '-'}
* **Tipografi**: ${fe.designTokens?.typography || '-'}
* **Skema Warna**:
${Array.isArray(fe.designTokens?.colors) ? fe.designTokens.colors.map((c: string) => `  - ${c}`).join('\n') : '  - Default Dark Mode'}

### Struktur Halaman & Komponen:
${Array.isArray(fe.pages) ? fe.pages.map((p: any) => `
#### Halaman: ${p.name} (Route: \`${p.route}\`)
* **Tujuan**: ${p.purpose}
* **Bagian Antarmuka (Sections)**:
${Array.isArray(p.sections) ? p.sections.map((s: string) => `  - ${s}`).join('\n') : ''}
* **Komponen UI**:
${Array.isArray(p.uiComponents) ? p.uiComponents.map((c: string) => `  - ${c}`).join('\n') : ''}
* **Mikro-Interaksi**:
${Array.isArray(p.interactions) ? p.interactions.map((i: string) => `  - ${i}`).join('\n') : ''}
`).join('\n') : '-'}

### Manajemen State:
* **Global State**: ${Array.isArray(fe.stateManagement?.globalState) ? fe.stateManagement.globalState.join(', ') : '-'}
* **Local State Key**: ${Array.isArray(fe.stateManagement?.localState) ? fe.stateManagement.localState.join(', ') : '-'}

---

## 3. RANCANGAN DATABASE & BACKEND (Backend Developer)
### Skema Tabel Database (Supabase DDL SQL):
\`\`\`sql
${be.supabaseDdlSql || '-- Tidak ada script SQL'}
\`\`\`

### Rancangan Endpoint API:
${Array.isArray(be.apiRoutes) ? be.apiRoutes.map((r: any) => `
* **Endpoint**: \`${r.method}\` \`${r.path}\`
  * *Deskripsi*: ${r.description}
  * *Request Body*: \`${typeof r.requestBody === 'object' ? JSON.stringify(r.requestBody) : r.requestBody}\`
  * *Response Body (Success)*: \`${typeof r.responseBody === 'object' ? JSON.stringify(r.responseBody) : r.responseBody}\`
`).join('\n') : '-'}

### Aturan Logika Bisnis (Business Rules):
${Array.isArray(be.businessRules) ? be.businessRules.map((br: string) => `- ${br}`).join('\n') : '-'}

---

## 4. TAHAPAN IMPLEMENTASI (Roadmap & QA)
${Array.isArray(rm.steps) ? rm.steps.map((step: any, idx: number) => `
### ${step.phase}
${Array.isArray(step.tasks) ? step.tasks.map((t: any) => `
#### Tugas ${t.id}: ${t.task}
* **Pelaksana**: ${t.targetRole}
* **Instruksi Detail**: ${t.instructions}
* **Cara Verifikasi**: ${t.validation}
`).join('\n') : ''}
`).join('\n') : '-'}

### Tips Hemat Biaya Pengembangan (Cost-Saving):
${Array.isArray(rm.costSavingTips) ? rm.costSavingTips.map((tip: string) => `- ${tip}`).join('\n') : '-'}
`;
  };

  const handleExportMarkdown = () => {
    const mdContent = generateFullMarkdown();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sa.appName ? sa.appName.toLowerCase().replace(/\s+/g, '-') : 'development'}-plan.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-[#0b1220]/50 backdrop-blur-md rounded-2xl border border-white/8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] overflow-hidden">
      
      {/* Top Banner App Info */}
      <div className="p-6 border-b border-white/8 bg-gradient-to-r from-blue-950/30 via-transparent to-sky-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
              Project Plan
            </span>
            {project.mockMode && (
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Info size={10} />
                <span>Mock Mode Active</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">{sa.appName || 'Aplikasi Rencana'}</h2>
          <p className="text-xs text-slate-400 max-w-2xl line-clamp-2 leading-relaxed">
            <span className="text-blue-400 font-medium">Prompt Awal: </span>"{project.prompt}"
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          <button
            onClick={() => handleCopy(generateFullMarkdown(), 'all')}
            className="flex items-center gap-2 py-2 px-4 bg-white/4 hover:bg-white/8 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-white/8 transition-all duration-200"
          >
            {copiedSection === 'all' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedSection === 'all' ? 'Tersalin!' : 'Salin Semua Plan'}</span>
          </button>
          
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={14} />
            <span>Ekspor .MD</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/8 bg-[#070b13]/60 px-4 overflow-x-auto scrollbar-none">
        {[
          { id: 'summary', name: 'Ringkasan', icon: FileText },
          { id: 'frontend', name: 'UI/UX Frontend', icon: LayoutGrid },
          { id: 'backend', name: 'Database & API', icon: Database },
          { id: 'roadmap', name: 'Tahapan Roadmap', icon: Milestone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 py-4 px-5 border-b-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-blue-500 text-white bg-white/2'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-blue-400' : ''} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar bg-[#080d17]/30">
        
        {/* ======================================= */}
        {/* TAB 1: SUMMARY (SYSTEM ANALYST) */}
        {/* ======================================= */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white/2 border border-white/6 space-y-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Tujuan Utama</span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">{sa.coreGoal || '-'}</p>
              </div>
              <div className="p-5 rounded-xl bg-white/2 border border-white/6 space-y-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">Target Pengguna</span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">{sa.targetAudience || '-'}</p>
              </div>
            </div>

            {/* Suggested Stack */}
            <div className="p-5 rounded-xl bg-white/2 border border-white/6 space-y-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Rekomendasi Tumpukan Teknologi</span>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(sa.suggestedStack) ? (
                  sa.suggestedStack.map((tech: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Tidak dispesifikasi</span>
                )}
              </div>
            </div>

            {/* Removed Bloat (Cost Savings Highlight) */}
            <div className="p-5 rounded-xl bg-blue-950/10 border border-blue-500/20 space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Token Cost Savings (Fitur Dieliminasi)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Untuk meminimalkan penggunaan token API/biaya pengerjaan pada AI code generator (Lovable/Bolt), fitur berikut direkomendasikan untuk ditunda/dihapus pada fase pertama:
              </p>
              <ul className="space-y-2 pl-1">
                {Array.isArray(sa.removedBloat) ? (
                  sa.removedBloat.map((bloat: string, i: number) => (
                    <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{bloat}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">-</li>
                )}
              </ul>
            </div>

            {/* System Architecture */}
            <div className="p-5 rounded-xl bg-white/2 border border-white/6 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Arsitektur Tingkat Tinggi</span>
              <p className="text-xs text-slate-300 leading-relaxed">{sa.systemArchitecture || '-'}</p>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: UI/UX FRONTEND */}
        {/* ======================================= */}
        {activeTab === 'frontend' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Design Tokens Callout */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/10 to-sky-950/10 border border-blue-500/20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">Visual Vibes</span>
                <span className="text-xs text-slate-200 font-semibold">{fe.designTokens?.vibes || '-'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider block">Tipografi</span>
                <span className="text-xs text-slate-200 font-semibold">{fe.designTokens?.typography || '-'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">Warna Kunci</span>
                <span className="text-xs text-slate-300 line-clamp-2 leading-tight">
                  {Array.isArray(fe.designTokens?.colors) ? fe.designTokens.colors.join(', ') : '-'}
                </span>
              </div>
            </div>

            {/* Sitemap/Pages Routing */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rancangan Halaman & Komponen</span>
              
              <div className="space-y-4">
                {Array.isArray(fe.pages) ? (
                  fe.pages.map((page: any, i: number) => (
                    <div key={i} className="p-5 rounded-xl bg-white/2 border border-white/6 space-y-4 hover:border-white/12 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/4 pb-2">
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                            {page.name}
                          </span>
                        </h4>
                        <code className="text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded font-mono self-start sm:self-center">
                          {page.route}
                        </code>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tujuan</span>
                          <p className="text-slate-300 leading-relaxed">{page.purpose}</p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Komponen UI</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(page.uiComponents) && page.uiComponents.map((c: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-white/4 text-slate-300 font-mono text-[10px]">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Interaksi UI/UX</span>
                          <ul className="space-y-1">
                            {Array.isArray(page.interactions) && page.interactions.map((inter: string, idx: number) => (
                              <li key={idx} className="text-slate-400 flex items-start gap-1">
                                <span className="text-sky-500 font-semibold shrink-0">•</span>
                                <span className="line-clamp-2 leading-relaxed">{inter}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Tidak ada data halaman.</p>
                )}
              </div>
            </div>

            {/* State Management */}
            <div className="p-5 rounded-xl bg-white/2 border border-white/6 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">State Management</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">State Global (Context/Redux)</span>
                  <ul className="space-y-1 pl-1">
                    {Array.isArray(fe.stateManagement?.globalState) ? (
                      fe.stateManagement.globalState.map((gs: string, idx: number) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>{gs}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">-</li>
                    )}
                  </ul>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">State Lokal Kunci</span>
                  <ul className="space-y-1 pl-1">
                    {Array.isArray(fe.stateManagement?.localState) ? (
                      fe.stateManagement.localState.map((ls: string, idx: number) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <span className="text-sky-400">•</span>
                          <span>{ls}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">-</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: DATABASE & API */}
        {/* ======================================= */}
        {activeTab === 'backend' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Supabase SQL DDL Terminal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Terminal size={14} className="text-emerald-400" />
                  <span className="font-mono">Supabase SQL DDL Script (SQL Editor)</span>
                </div>
                <button
                  onClick={() => handleCopy(be.supabaseDdlSql || '', 'sql')}
                  className="flex items-center gap-1 text-[10px] bg-white/4 hover:bg-white/8 border border-white/8 hover:text-white text-slate-300 py-1 px-2.5 rounded-lg transition-all"
                >
                  {copiedSection === 'sql' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedSection === 'sql' ? 'Tersalin' : 'Salin DDL'}</span>
                </button>
              </div>

              <div className="relative group rounded-xl overflow-hidden border border-white/8 bg-slate-950/90">
                <pre className="p-4 overflow-x-auto text-[11px] font-mono text-emerald-400/90 leading-relaxed max-h-[300px] custom-scrollbar">
                  {be.supabaseDdlSql || '-- Database Schema tidak tersedia'}
                </pre>
              </div>
            </div>

            {/* Database Tables Summary */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Skema Tabel Database</span>
              <div className="space-y-3">
                {Array.isArray(be.databaseTables) ? (
                  be.databaseTables.map((table: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white/2 border border-white/6 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-white/4 pb-1.5">
                        <span className="font-bold text-xs text-white font-mono flex items-center gap-1.5">
                          <Database size={12} className="text-blue-400" />
                          <span>{table.tableName}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{table.description}</span>
                      </div>
                      
                      {/* Table Column Detail List */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="border-b border-white/4 text-slate-500 font-bold">
                              <th className="py-1 px-2 font-mono">Nama Kolom</th>
                              <th className="py-1 px-2 font-mono">Tipe</th>
                              <th className="py-1 px-2 font-mono">Constraints</th>
                              <th className="py-1 px-2">Fungsi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(table.columns) && table.columns.map((c: any, cidx: number) => (
                              <tr key={cidx} className="border-b border-white/4 hover:bg-white/2 text-slate-300">
                                <td className="py-1.5 px-2 font-mono font-semibold text-blue-300">{c.name}</td>
                                <td className="py-1.5 px-2 font-mono text-slate-400">{c.type}</td>
                                <td className="py-1.5 px-2 font-mono text-sky-400/80">{c.constraints || '-'}</td>
                                <td className="py-1.5 px-2 text-slate-400">{c.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Tidak ada ringkasan skema tabel.</p>
                )}
              </div>
            </div>

            {/* Business Rules */}
            <div className="p-5 rounded-xl bg-white/2 border border-white/6 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Aturan Logika Bisnis (Business Rules)</span>
              <ul className="space-y-2 pl-1">
                {Array.isArray(be.businessRules) ? (
                  be.businessRules.map((br: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                      <span>{br}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">-</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: ROADMAP STEP-BY-STEP */}
        {/* ======================================= */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cost Saving Tips */}
            <div className="p-5 rounded-xl bg-blue-950/15 border border-blue-500/20 space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Lightbulb size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Tips Pengembangan Efisien (Hemat Token)</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {Array.isArray(rm.costSavingTips) ? (
                  rm.costSavingTips.map((tip: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500">-</li>
                )}
              </ul>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-6 relative border-l-2 border-white/8 pl-6 ml-4">
              {Array.isArray(rm.steps) ? (
                rm.steps.map((step: any, stepIdx: number) => (
                  <div key={stepIdx} className="relative space-y-4">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[35px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] flex items-center justify-center" />
                    
                    <h4 className="font-bold text-sm text-white tracking-wide">{step.phase}</h4>

                    {/* Step Tasks */}
                    <div className="space-y-3">
                      {Array.isArray(step.tasks) && step.tasks.map((task: any, taskIdx: number) => (
                        <div key={taskIdx} className="p-4 bg-white/2 hover:bg-white/4 border border-white/6 rounded-xl space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-bold text-xs text-blue-400 font-mono">Tugas {task.id}: {task.task}</span>
                            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/15 text-[9px] font-bold uppercase tracking-wider">
                              {task.targetRole}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Instruksi Pengerjaan (Untuk Code Generator)</span>
                              <p className="text-slate-300 leading-relaxed">{task.instructions}</p>
                            </div>
                            <div className="space-y-1 border-t border-white/4 pt-2">
                              <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider block">Cara Validasi Hasil</span>
                              <p className="text-slate-400 leading-relaxed font-mono">{task.validation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Tidak ada roadmap yang tersedia.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
