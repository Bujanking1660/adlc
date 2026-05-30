# =============================================================================
# Dockerfile — Pluto Project Planner (Next.js → Google Cloud Run)
# Multi-stage build: deps → builder → runner
# Requires: output: "standalone" di next.config.ts
# =============================================================================

# ---- Stage 1: Install dependencies ------------------------------------------
FROM node:22-alpine AS deps

# Install libc compat untuk binary native di alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files dan install HANYA production deps yang dibutuhkan saat build
COPY package.json package-lock.json ./
RUN npm ci


# ---- Stage 2: Build aplikasi Next.js ----------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Salin node_modules dari stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Env vars yang dibutuhkan saat BUILD (bukan runtime secret)
# NEXT_PUBLIC_* harus di-embed saat build karena diakses di client-side browser.
# Keduanya WAJIB di-pass via --build-arg, tanpanya Supabase client = null!
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Nonaktifkan telemetri Next.js
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ---- Stage 3: Runner — image produksi yang minimal --------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Nonaktifkan telemetri
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Cloud Run menggunakan PORT env var (default 8080) — Next.js standalone menghormati ini
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Jalankan sebagai user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Salin aset publik
COPY --from=builder /app/public ./public

# Salin output standalone Next.js (jauh lebih kecil dari full node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

# Entrypoint standalone Next.js — tidak butuh `next start`
CMD ["node", "server.js"]
