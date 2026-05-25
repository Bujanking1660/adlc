'use client';

import React, { useState } from 'react';
import { Send, Sparkles, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  generationStep: number; // 0: Idle, 1: Analyst, 2: Frontend, 3: Backend, 4: Roadmap, 5: Saving
}

const TEMPLATES = [
  {
    title: "Pencatatan Barang Keluar Masuk",
    prompt: "Buatkan aplikasi pencatatan barang keluar masuk sederhana untuk toko kelontong. Perlu ada data barang (stok, nama, sku) dan pencatatan transaksi masuk dan keluar oleh admin.",
    badge: "Gudang"
  },
  {
    title: "Manajemen Rumah Kos & Sewa",
    prompt: "Sistem informasi manajemen sewa kamar kos. Pemilik bisa mencatat kamar (kosong/isi, harga), data penyewa, dan mencatat tagihan serta pembayaran bulanan.",
    badge: "Properti"
  },
  {
    title: "Sistem Antrean Barber Shop",
    prompt: "Aplikasi pemesanan antrean barber shop online. Pengguna bisa memilih layanan rambut, memilih kapster (barber), memilih tanggal/jam, serta melihat status antrean saat ini secara live.",
    badge: "Booking"
  },
  {
    title: "E-Commerce Produk Digital",
    prompt: "Toko online sederhana untuk menjual ebook dan template desain. Pengguna bisa browsing produk, checkout via transfer bank (upload bukti), dan mendapatkan link download otomatis setelah diverifikasi admin.",
    badge: "Sales"
  }
];

export default function PromptInput({ onSubmit, isGenerating, generationStep }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt);
    }
  };

  const selectTemplate = (text: string) => {
    if (!isGenerating) {
      setPrompt(text);
    }
  };

  const getStepMessage = () => {
    switch (generationStep) {
      case 1:
        return { title: "1. System Analyst Agent", desc: "Mengekstrak kebutuhan inti, membuang bloat ide, merancang arsitektur makro..." };
      case 2:
        return { title: "2. Frontend Developer Agent", desc: "Merancang struktur halaman (routing), visual UI/UX, state global/lokal..." };
      case 3:
        return { title: "3. Backend Developer Agent", desc: "Menyusun skema database Supabase DDL SQL, rancangan API, dan business rules..." };
      case 4:
        return { title: "4. Sequential Roadmap Agent", desc: "Menyatukan semua data menjadi modul tutorial langkah-demi-langkah siap coding..." };
      case 5:
        return { title: "5. Sinkronisasi Data", desc: "Menyimpan seluruh rencana ke database riwayat Supabase Cloud..." };
      default:
        return { title: "Memulai Proses", desc: "Mempersiapkan pipeline Multi-Agent..." };
    }
  };

  const progressPercent = Math.min((generationStep / 5) * 100, 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Sparkles size={12} className="animate-spin" />
          <span>Multi-Agent AI Code Planning</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
          Rancang Aplikasi Anda Instan
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Masukkan ide aplikasi kasar Anda. AI kami akan memprosesnya lewat tim virtual guna menyusun rencana kerja terstruktur, hemat token, dan siap disalin ke AI code generator.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-[#0b1220]/80 backdrop-blur-md rounded-2xl border border-white/8 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Decorative background lights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-sky-600/10 blur-[80px]" />

        {isGenerating ? (
          /* Multi-Agent Loading Interface */
          <div className="py-8 px-4 flex flex-col items-center justify-center space-y-6 relative z-10">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              {/* Inner reverse spin */}
              <div className="absolute w-16 h-16 rounded-full border-4 border-sky-500/10 border-b-sky-500 animate-[spin_1.5s_linear_infinite_reverse]" />
              {/* Core Icon */}
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400 shadow-lg">
                <Sparkles size={18} className="animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-2 max-w-md">
              <h3 className="font-bold text-white text-base tracking-wide">
                {getStepMessage().title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed min-h-8">
                {getStepMessage().desc}
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full max-w-md space-y-1">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/4">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Mulai</span>
                <span>Analyst</span>
                <span>UI/UX</span>
                <span>Database</span>
                <span>Roadmap</span>
                <span>Selesai</span>
              </div>
            </div>
          </div>
        ) : (
          /* Input Field */
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="relative group">
              {/* Textarea Glow Shadow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-sky-600/30 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Buatkan aplikasi pencatatan barang keluar masuk sederhana dengan dashboard admin..."
                maxLength={1000}
                className="w-full min-h-36 p-4 rounded-xl bg-[#070b13] hover:bg-[#080d16] focus:bg-[#070b13] border border-white/8 focus:border-blue-500/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 text-sm leading-relaxed transition-all duration-200 resize-none relative z-10"
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-medium">
                {prompt.length}/1000 karakter
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <HelpCircle size={14} className="text-blue-400" />
                <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/8 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/8 text-[10px]">Enter</kbd> untuk generate</span>
              </div>
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="inline-flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-950/20 disabled:shadow-none hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Mulai Rancang Plan</span>
                <Send size={14} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Suggested Templates */}
      {!isGenerating && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-bold tracking-wide">
            <BookOpen size={16} className="text-blue-400" />
            <span>Pilih Template Ide Cepat</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((item, idx) => (
              <div
                key={idx}
                onClick={() => selectTemplate(item.prompt)}
                className="p-4 bg-[#090f1d]/50 hover:bg-[#0a1122]/90 border border-white/4 hover:border-blue-500/30 rounded-xl cursor-pointer transition-all duration-200 group flex items-start justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/15">
                      {item.badge}
                    </span>
                    <h4 className="font-semibold text-slate-200 group-hover:text-white text-xs transition-colors duration-150">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200 self-center" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
