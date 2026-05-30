'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Database, 
  Terminal, 
  CheckCircle2, 
  Play,
  Layers,
  Zap,
  Code,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Theme } from './Header';

interface LandingPageProps {
  onGetStarted: () => void;
  onLocalMode: () => void;
  theme?: Theme;
  onThemeChange?: (t: Theme) => void;
  user?: any;
  onGoToWorkspace?: () => void;
}

const THEME_CYCLE: Theme[] = ['system', 'dark', 'light'];

const THEME_META: Record<Theme, { icon: React.ReactNode; label: string }> = {
  system: { icon: <Monitor size={14} />, label: 'System' },
  dark: { icon: <Moon size={14} />, label: 'Dark' },
  light: { icon: <Sun size={14} />, label: 'Light' },
};

export default function LandingPage({ 
  onGetStarted, 
  onLocalMode,
  theme = 'dark',
  onThemeChange,
  user,
  onGoToWorkspace
}: LandingPageProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState('');

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 64; // h-16 is 64px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Animation for mock prompt typing
  useEffect(() => {
    const promptText = "Buatkan rancangan aplikasi marketplace penjualan kopi lokal dengan fitur pembayaran instan...";
    let index = 0;
    const interval = setInterval(() => {
      setTypedPrompt(promptText.slice(0, index));
      index++;
      if (index > promptText.length) {
        // Pause at completion, then restart
        setTimeout(() => {
          index = 0;
        }, 3000);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Animation for sequential agent progress in mockup
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "System Analyst Agent",
      desc: "Merumuskan use-cases, spesifikasi fungsional, dan mendefinisikan ruang lingkup bisnis aplikasi.",
      icon: Cpu,
      color: "text-blue-500 dark:text-blue-400",
      tag: "AGENCY 01",
      details: ["Detail User Stories", "Functional Specs", "Constraint & Limits"]
    },
    {
      title: "UI/UX Frontend Agent",
      desc: "Merancang tata letak navigasi halaman, struktur komponen visual, dan interaksi state.",
      icon: Layers,
      color: "text-sky-500 dark:text-sky-400",
      tag: "AGENCY 02",
      details: ["Wireframe Mapping", "State Flow Diagram", "Component Tree"]
    },
    {
      title: "Database Backend Agent",
      desc: "Membuat skema database PostgreSQL relasional (Supabase-ready!) beserta relasi dan indexing.",
      icon: Database,
      color: "text-blue-600 dark:text-cyan-400",
      tag: "AGENCY 03",
      details: ["Supabase Table SQL", "ERD Connections", "Row-Level Security"]
    },
    {
      title: "QA & DevOps Agent",
      desc: "Menyusun strategi pengujian automated, langkah testing manual, serta rekomendasi deployment.",
      icon: Terminal,
      color: "text-emerald-500 dark:text-emerald-400",
      tag: "AGENCY 04",
      details: ["Automation Tests", "CI/CD Pipeline", "Hosting & Domain Plan"]
    }
  ];

  const faqs = [
    {
      q: "Apa itu Pluto Engine?",
      a: "Pluto Engine adalah AI Development Life Cycle (ADLC) Planner sekuensial yang merancang arsitektur sistem dan database siap bangun menggunakan rantai kolaborasi multi-agent AI."
    },
    {
      q: "Bagaimana cara kerjanya?",
      a: "Anda cukup memasukkan ide aplikasi Anda. Pluto akan membaginya ke 4 agen AI spesialis (Analyst, Frontend, Backend, QA) yang bekerja secara bergantian dan interaktif untuk melahirkan dokumen rencana lengkap."
    },
    {
      q: "Apakah kodenya siap untuk code generator?",
      a: "Ya! Output skema database dan rencana arsitektur dirancang khusus agar siap disalin-tempel ke AI code generator modern seperti Lovable, Bolt.new, v0, Cursor, atau Antigravity."
    },
    {
      q: "Apakah data saya aman?",
      a: "Data Anda sepenuhnya aman. Kami menyediakan 'Mode Lokal' yang menyimpan semua proyek langsung di penyimpanan browser Anda tanpa perlu mendaftar."
    }
  ];

  const meta = THEME_META[theme];
  const nextIdx = (THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length;
  const nextTheme = THEME_CYCLE[nextIdx];

  return (
    <div className="min-h-screen w-full bg-theme-bg text-theme-fg font-sans selection:bg-blue-500/30 selection:text-white relative overflow-hidden transition-colors duration-300">
      
      {/* Modern Grid Background Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Ambient Neon Blue Glowing Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] bg-sky-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* ─── STICKY NAVBAR ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-theme-bg/70 border-b border-theme-panel-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <img src="/icon.png" alt="Pluto Logo" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.55)] transition-transform hover:scale-105 duration-300" />
            </div>
            <span className="text-base font-bold text-theme-heading tracking-tight">Pluto Engine</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-theme-muted">
            <a href="#fitur" onClick={(e) => handleScrollTo(e, 'fitur')} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Fitur Agen</a>
            <a href="#demo" onClick={(e) => handleScrollTo(e, 'demo')} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Simulasi</a>
            <a href="#integrasi" onClick={(e) => handleScrollTo(e, 'integrasi')} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Integrasi</a>
            <a href="#faq" onClick={(e) => handleScrollTo(e, 'faq')} className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            {onThemeChange && (
              <button 
                onClick={() => onThemeChange(nextTheme)}
                title={`Theme: ${meta.label} — click for ${THEME_META[nextTheme].label}`}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-theme-panel-border bg-theme-panel rounded-xl text-xs font-semibold text-theme-muted hover:text-theme-heading hover:border-blue-500/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {meta.icon}
                <span className="hidden sm:inline">{meta.label}</span>
              </button>
            )}
            
            {user ? (
              <button 
                onClick={onGoToWorkspace}
                className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.35)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Buka Workspace
              </button>
            ) : (
              <>
                <button 
                  onClick={onLocalMode}
                  className="text-xs sm:text-sm font-medium text-theme-muted hover:text-theme-heading px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all cursor-pointer hover:bg-theme-panel-active"
                >
                  Mode Lokal
                </button>
                <button 
                  onClick={onGetStarted}
                  className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.35)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  Masuk / Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20 text-center relative z-10">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-500 dark:text-blue-400 mb-8 animate-fadeSlideUp shadow-[0_2px_12px_rgba(59,130,246,0.15)]">
          <Sparkles size={12} className="animate-pulse" />
          <span>Pluto Engine v2.0</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-theme-muted font-normal">Multi-Agent AI Sequential Planner</span>
        </div>

        {/* Catchy Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-theme-heading leading-tight max-w-4xl mx-auto mb-6">
          Rancang Arsitektur Aplikasi{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 font-extrabold relative">
            dalam Hitungan Detik
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg md:text-xl text-theme-muted max-w-2xl mx-auto leading-relaxed mb-10">
          Rencanakan arsitektur aplikasi Anda secara instan menggunakan multi-agent AI sekuensial. 
          Cepat, efisien, hemat token, dan siap disalin ke AI code generator!
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold rounded-2xl transition-all shadow-[0_4px_25px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_30px_rgba(59,130,246,0.6)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Mulai Perencanaan Gratis <ArrowRight size={16} />
          </button>
          
          <button
            onClick={onLocalMode}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-theme-panel hover:bg-theme-panel-active border border-theme-panel-border text-theme-muted hover:text-theme-heading font-semibold rounded-2xl transition-all cursor-pointer active:scale-[0.98]"
          >
            Masuk sebagai Tamu (Mode Lokal)
          </button>
        </div>

        {/* ─── INTERACTIVE WORKSPACE MOCKUP ────────────────────────── */}
        <div id="demo" className="max-w-5xl mx-auto rounded-3xl border border-theme-panel-border bg-theme-panel backdrop-blur-xl p-4 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-300">
          
          {/* Mockup Header Controls */}
          <div className="flex items-center justify-between border-b border-theme-panel-border pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-theme-muted ml-4 font-mono">pluto-engine-canvas.io</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              Live Simulation
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left Box: Prompt Input Demo */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="rounded-2xl p-4 bg-theme-input-bg border border-theme-input-border flex flex-col h-full justify-between">
                <div>
                  <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-2">Input Prompt</h4>
                  <div className="text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-300 min-h-[90px] leading-relaxed bg-theme-bg p-3 rounded-xl border border-theme-panel-border select-none">
                    {typedPrompt}<span className="animate-ping text-blue-500">|</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-theme-panel-border flex items-center justify-between">
                  <span className="text-[10px] text-theme-muted">Status: Aktif</span>
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-not-allowed">
                    <Play size={10} className="fill-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle/Right Box: Sequential Agent Processing */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-2xl p-4 bg-theme-input-bg border border-theme-input-border">
                <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-3">Kolaborasi Agen Sekuensial</h4>
                
                <div className="space-y-3">
                  {features.map((feat, index) => {
                    const isActive = activeStep === index;
                    const isCompleted = index < activeStep;
                    const IconComponent = feat.icon;
                    
                    return (
                      <div 
                        key={index}
                        className={`p-3 rounded-xl border transition-all duration-500 flex items-center gap-4 ${
                          isActive 
                            ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_12px_rgba(59,130,246,0.15)] scale-[1.01]' 
                            : isCompleted 
                              ? 'border-theme-panel-border bg-theme-panel-active/30 opacity-70' 
                              : 'border-theme-panel-border/20 bg-transparent opacity-40'
                        }`}
                      >
                        {/* ENLARGED ICON, NO BACKGROUND CONTAINER */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <IconComponent 
                            className={`w-8 h-8 ${feat.color} transition-all duration-500 ${
                              isActive ? 'scale-110 animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''
                            }`} 
                          />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-theme-heading truncate">{feat.title}</span>
                            <span className="text-[10px] text-theme-muted font-mono">{feat.tag}</span>
                          </div>
                          
                          <p className="text-[11px] text-theme-muted truncate mt-0.5">{feat.desc}</p>
                        </div>

                        <div className="flex-shrink-0">
                          {isActive ? (
                            <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                          ) : isCompleted ? (
                            <CheckCircle2 size={16} className="text-blue-500 dark:text-blue-400" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-theme-panel-border" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Visual Overlay Grid Line Decorator */}
          <div className="absolute top-[20%] right-[-10%] w-60 h-2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rotate-45 pointer-events-none" />
        </div>
      </section>

      {/* ─── FEATURES SECTION ────────────────────────────────────── */}
      <section id="fitur" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-theme-panel-border">
        
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-2">Spesialisasi AI</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-theme-heading tracking-tight">4 Pilar Agen Kolaboratif</h3>
          <p className="text-theme-muted text-sm sm:text-base max-w-xl mx-auto mt-3">
            Pluto mendelegasikan tugas perencanaan ke empat agen cerdas berurutan untuk hasil arsitektur maksimal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => {
            const IconComponent = feat.icon;
            return (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-theme-panel border border-theme-panel-border hover:border-blue-500/30 transition-all duration-300 shadow-md flex flex-col justify-between group hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
              >
                <div>
                  {/* ENLARGED ICON, NO BACKGROUND CONTAINER */}
                  <div className="mb-6 transition-transform duration-300 group-hover:scale-110 flex items-center justify-start">
                    <IconComponent className={`w-12 h-12 ${feat.color} drop-shadow-sm`} />
                  </div>
                  <h4 className="text-base font-bold text-theme-heading group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-2">{feat.title}</h4>
                  <p className="text-xs sm:text-sm text-theme-muted leading-relaxed mb-6">{feat.desc}</p>
                </div>

                <div className="pt-4 border-t border-theme-panel-border">
                  <div className="flex flex-wrap gap-1.5">
                    {feat.details.map((det, dIdx) => (
                      <span 
                        key={dIdx}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-theme-panel border border-theme-panel-border text-theme-muted"
                      >
                        {det}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── INTEGRATION SECTION ─────────────────────────────────── */}
      <section id="integrasi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-theme-panel-border bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-6">
              <Zap size={12} />
              <span>AI Code Generator Ready</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-bold text-theme-heading tracking-tight mb-4">
              Salin Output. Bangun Instan di AI Code Gen Favorit Anda.
            </h3>
            
            <p className="text-theme-muted text-sm sm:text-base leading-relaxed mb-8">
              Rencana pengembangan, mapping tata letak visual, hingga skema SQL Supabase yang disusun Pluto telah distandarisasi agar mudah dipahami oleh asisten pemrograman berbasis AI. Salin hasilnya dan percepat pembuatan kode Anda secara instan.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-1">
                  <CheckCircle2 size={12} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-theme-heading">Full Supabase SQL Code</span>
                  <p className="text-xs text-theme-muted mt-0.5">Skema tabel lengkap dengan Foreign Keys, Type Enums, dan indexing.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-1">
                  <CheckCircle2 size={12} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-theme-heading">UX Wireframe Structure</span>
                  <p className="text-xs text-theme-muted mt-0.5">Penjelasan tata letak antarmuka lengkap per section yang presisi.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-theme-panel-border bg-theme-input-bg p-5 shadow-2xl relative z-10 text-left font-mono text-[11px] sm:text-xs text-theme-muted">
              <div className="flex items-center justify-between border-b border-theme-panel-border pb-3 mb-3">
                <span className="text-theme-muted flex items-center gap-1.5"><Code size={13} /> supabase-schema-pluto.sql</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">SQL</span>
              </div>
              <pre className="text-blue-600 dark:text-blue-300 leading-relaxed overflow-x-auto custom-scrollbar select-none">
{`-- Generated by Database Backend Agent
create table public.farmers (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.products (
    id uuid default gen_random_uuid() primary key,
    farmer_id uuid references public.farmers(id) on delete cascade,
    title text not null,
    price numeric not null,
    stock_kg integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
              </pre>
            </div>
            
            {/* Absolute Decorative Glow behind code block */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
          </div>

        </div>
      </section>

      {/* ─── PLUTO SYSTEM & ARCHITECTURE EXPLANATION ──────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-theme-panel-border bg-gradient-to-b from-transparent via-sky-500/5 to-transparent">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-2">Teknologi & Arsitektur</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-theme-heading tracking-tight">Di Balik Layar Pluto Engine</h3>
          <p className="text-theme-muted text-sm sm:text-base max-w-xl mx-auto mt-3">
            Pluto dirancang menggunakan paradigma AI mutakhir yang menggabungkan kolaborasi multi-agent sekuensial dan model penalaran berkinerja tinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Google Gemini API */}
          <div className="p-6 rounded-3xl border border-theme-panel-border bg-theme-panel backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between hover:scale-[1.01]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6">
                <Cpu size={24} />
              </div>
              <h4 className="text-base font-bold text-theme-heading mb-3">Google Gemini 3.5 Flash</h4>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                Pluto Engine ditenagai oleh model mutakhir <strong>Gemini 3.5 Flash</strong> dari Google DeepMind. Model ini dipilih karena kemampuannya dalam memahami konteks instruksi yang sangat panjang, memformulasikan kode teknis terstruktur (SQL & Shell), serta memproses respons berkecepatan tinggi secara real-time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-theme-panel-border text-[10px] text-theme-muted font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Gemini LLM Integration
            </div>
          </div>

          {/* Card 2: Sequential Multi-Agent */}
          <div className="p-6 rounded-3xl border border-theme-panel-border bg-theme-panel backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between hover:scale-[1.01]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center mb-6">
                <Layers size={24} />
              </div>
              <h4 className="text-base font-bold text-theme-heading mb-3">Sequential Multi-Agent Collaboration</h4>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                Alih-alih mengandalkan satu asisten umum, Pluto mendelegasikan tugas ke <strong>empat agen AI spesialis</strong> (Analyst, Frontend, Backend, QA) yang berjalan secara berurutan. Setiap agen bertindak sebagai filter kualitas, memeriksa output agen sebelumnya, dan menambahkan spesifikasinya untuk melahirkan dokumen blueprint yang komprehensif.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-theme-panel-border text-[10px] text-theme-muted font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Stateful Multi-Agent Flow
            </div>
          </div>

          {/* Card 3: Stateless & Token-Saving Architecture */}
          <div className="p-6 rounded-3xl border border-theme-panel-border bg-theme-panel backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between hover:scale-[1.01]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h4 className="text-base font-bold text-theme-heading mb-3">Stateless & Token-Saving Design</h4>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                Dioptimalkan untuk performa maksimal dengan latensi rendah. Pluto menggunakan <strong>penyimpanan context state terkompresi</strong> yang dialirkan ke agen berikutnya. Arsitektur cerdas ini memotong konsumsi token Gemini hingga <strong>60%</strong> lebih hemat dibandingkan sistem chat tunggal konvensional, tanpa mengurangi kualitas rencana pengembangan yang dihasilkan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-theme-panel-border text-[10px] text-theme-muted font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Optimized API Usage
            </div>
          </div>

        </div>
      </section>

      {/* ─── FAQ SECTION ─────────────────────────────────────────── */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-theme-panel-border">
        
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-theme-heading tracking-tight">Pertanyaan Umum</h3>
          <p className="text-theme-muted text-sm max-w-sm mx-auto mt-2">
            Masih penasaran dengan Pluto Engine? Temukan jawabannya di sini.
          </p>
        </div>

        <div className="space-y-4 text-left">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="p-5 rounded-2xl bg-theme-panel border border-theme-panel-border"
            >
              <h4 className="text-sm sm:text-base font-bold text-theme-heading mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed pl-3.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CALL TO ACTION BOTTOM ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/10 to-sky-950/10 dark:from-blue-950/20 dark:to-sky-950/20 backdrop-blur-xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-4xl font-bold text-theme-heading tracking-tight mb-4">
              Siap untuk Mulai Merancang?
            </h3>
            
            <p className="text-theme-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8">
              Beralihlah dari sekadar ide abstrak ke arsitektur perancangan sistem yang matang dalam hitungan detik. Coba sekarang secara gratis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] cursor-pointer"
              >
                Mulai Rancang Sekarang
              </button>
              
              <button
                onClick={onLocalMode}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-theme-panel hover:bg-theme-panel-active text-theme-muted font-semibold rounded-xl border border-theme-panel-border transition-all cursor-pointer"
              >
                Coba Mode Lokal
              </button>
            </div>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(59,130,246,0.08)_0%,transparent_100%)] pointer-events-none" />
        </div>
      </section>

      {/* ─── SLEEK FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-theme-panel-border bg-theme-panel-active py-8 relative z-10 text-theme-muted text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img src="/icon.png" alt="Pluto Logo" className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(59,130,246,0.45)] transition-transform hover:scale-105 duration-300" />
            </div>
            <span className="font-bold text-theme-heading">Pluto Engine</span>
          </div>

          <p>© {new Date().getFullYear()} Pluto Engine. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

    </div>
  );
}
