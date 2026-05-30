# 🪐 Pluto Project Planner

> **AI-powered software project planner** yang menggunakan sistem **Multi-Agent** berbasis Google Gemini untuk menganalisis kebutuhan dan menghasilkan rencana pengembangan secara otomatis dan terstruktur.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🤖 **Multi-Agent AI** | 4 agen AI Gemini bekerja secara berurutan: Analyst → Frontend → Backend → QA |
| 💬 **Dynamic Clarification** | AI akan bertanya terlebih dahulu jika kebutuhan proyek belum jelas |
| 👤 **Guest Mode** | Coba tanpa daftar akun — riwayat disimpan di localStorage |
| 🌗 **Dark / Light Mode** | Tema adaptif yang nyaman di mata |
| 🗺️ **Database Visualizer** | Visualisasi interaktif tabel & relasi skema database yang dihasilkan AI |
| 📡 **Real-time Agent Tracker** | Pantau langkah kerja setiap agen AI secara live |
| 🔑 **API Key Rotation** | Rotasi acak Gemini API Key untuk efisiensi kuota |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.2.6](https://nextjs.org/) (App Router) + React 19
- **Language**: TypeScript & JavaScript
- **Styling**: TailwindCSS v4 + Lucide React (icons)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`)
- **AI Engine**: [Google Generative AI](https://ai.google.dev/) — model `gemini-2.5-flash`

---

## 🚀 Cara Menjalankan Lokal

### 1. Clone Repositori

```bash
git clone https://github.com/Bujanking1660/adlc.git
cd adlc
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Setup Environment Variables

Salin file contoh dan isi dengan kredensial kamu:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Supabase — dapatkan dari https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Google Gemini API — dapatkan dari https://aistudio.google.com/app/apikey
GEMINI_API_KEY_1=your-primary-api-key
GEMINI_API_KEY_2=your-secondary-api-key   # opsional, untuk rotasi kuota
GEMINI_API_KEY=your-fallback-api-key      # opsional, fallback jika KEY_1 & KEY_2 kosong
```

### 4. Setup Database Supabase

Jalankan SQL berikut di **Supabase SQL Editor** (Project → SQL Editor):

```bash
# Salin dan jalankan isi file ini:
supabase/schema.sql
```

File tersebut akan membuat:
- Tabel `projects` & `agent_logs`
- Row Level Security (RLS) policies
- Index performa
- Trigger `updated_at` otomatis

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser kamu.

---

## 🤖 Alur Kerja Multi-Agent

Setiap kali kamu menginput prompt proyek, sistem menjalankan **4 agen AI secara berurutan**:

```
[ Prompt Pengguna ]
        │
        ▼
┌─────────────────────┐
│  1. System Analyst  │  → Menganalisis kelayakan & kebutuhan sistem
└─────────┬───────────┘
          │  (Jika ambigu → tanya klarifikasi)
          ▼
┌─────────────────────┐
│  2. UI/UX Frontend  │  → Merancang halaman, layout, & komponen UI
└─────────┬───────────┘
          │  (Jika detail desain kurang → tanya klarifikasi)
          ▼
┌─────────────────────┐
│  3. DB/Backend      │  → Menentukan arsitektur data & API
└─────────┬───────────┘
          │  (Jika tidak butuh backend → skip otomatis)
          ▼
┌─────────────────────┐
│  4. QA & DevOps     │  → Menggabungkan semua rencana menjadi
└─────────┬───────────┘     plan.md + schema.sql / NoSQL model
          │
          ▼
  [ Hasil: Plan & Schema ]
```

---

## 🗂️ Struktur Proyek

```
adlc/
├── .env.local.example          # Template environment variables
├── supabase/
│   └── schema.sql              # DDL SQL: tabel, RLS, index, trigger
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── orchestrate/    # Endpoint logika multi-agent Gemini AI
    │   │   └── projects/       # Endpoint CRUD manajemen proyek (Supabase)
    │   ├── layout.tsx           # Root layout & tema global
    │   ├── page.tsx             # Entry point — manajemen state auth & view
    │   └── globals.css          # Global styles TailwindCSS v4 + CSS variables
    ├── lib/
    │   └── supabase.ts          # Inisialisasi Supabase client (Browser & Admin)
    └── components/
        ├── Header.tsx           # Header navigasi, user status, toggle tema
        ├── LandingPage.tsx      # Landing page pemasaran modern & premium
        ├── AuthUI.tsx           # Form login/register + tombol Guest Mode
        ├── Workspace.tsx        # Workspace utama manajemen proyek
        ├── PromptInput.tsx      # Input prompt + rekomendasi cepat
        ├── AgentProgress.tsx    # Visualisasi langkah & status agen AI (live)
        ├── InteractiveModal.tsx # Modal jawab pertanyaan klarifikasi agen
        ├── PlanViewer.tsx       # Render Markdown rencana pengembangan
        └── PlanCanvas.tsx       # Kanvas visualisasi skema database interaktif
```

---

## 🗄️ Skema Database

### Tabel `projects`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | ID unik proyek |
| `user_id` | UUID (FK) | Referensi ke `auth.users` |
| `title` | TEXT | Judul proyek |
| `original_prompt` | TEXT | Prompt awal dari pengguna |
| `final_plan` | JSONB | Output QA Agent: `{ plan, schema, schemaFileName, hasBackend, dbType }` |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu terakhir diperbarui (auto-trigger) |

### Tabel `agent_logs`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID (PK) | ID unik log |
| `project_id` | UUID (FK) | Referensi ke `projects` |
| `agent_name` | TEXT | Nama agen (e.g. `"System Analyst Agent"`) |
| `status` | TEXT | `processing` / `completed` / `waiting_user_input` / `error` |
| `output_data` | JSONB | Output sementara atau pertanyaan klarifikasi |
| `created_at` | TIMESTAMPTZ | Waktu log dibuat |

> **Row Level Security (RLS)** diaktifkan — pengguna hanya bisa mengakses data miliknya sendiri.

---

## 🔑 Manajemen API Key Gemini

Sistem mendukung **rotasi API Key secara acak** untuk menghindari rate limit:

```
GEMINI_API_KEY_1  ──┐
GEMINI_API_KEY_2  ──┼──► Random Selection per Request
GEMINI_API_KEY    ──┘     (fallback jika KEY_1 & KEY_2 kosong)
```

Minimal hanya butuh **satu** key. Tambahkan lebih banyak untuk meningkatkan kapasitas kuota.

---

## 📜 Scripts

```bash
npm run dev      # Jalankan development server (localhost:3000)
npm run build    # Build untuk production
npm run start    # Jalankan production server
npm run lint     # Jalankan ESLint
```

---

## 🤝 Kontribusi

Kontribusi sangat disambut! Silakan buka *issue* atau kirim *pull request*.

---

<div align="center">
  <sub>Dibuat dengan ❤️ untuk JuaraVibesCoding 2026</sub>
</div>
