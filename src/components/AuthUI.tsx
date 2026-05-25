'use client';

import { useState } from 'react';
import { createClientBrowser } from '@/lib/supabase';
import { Mail, Lock, Loader2, User, ArrowLeft } from 'lucide-react';

interface AuthUIProps {
  onSuccess: (user: any) => void;
  onLocalMode: () => void;
  onBack?: () => void;
}

export default function AuthUI({ onSuccess, onLocalMode, onBack }: AuthUIProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClientBrowser();
    if (!supabase) {
      setError("Supabase client not initialized.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) onSuccess(data.user);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (signUpError) throw signUpError;
        if (data.user) onSuccess(data.user);
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('rate limit')) {
        setError('Batas permintaan email tercapai (Rate Limit Supabase). Mohon tunggu beberapa saat atau gunakan "Mode Lokal" untuk mencoba aplikasi sekarang.');
      } else {
        setError(errMsg || 'Terjadi kesalahan saat otentikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg text-theme-fg relative overflow-hidden px-4 transition-colors duration-300">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/5 dark:bg-sky-900/10 rounded-full blur-[120px] pointer-events-none"></div>
 
      <div className="w-full max-w-md p-8 bg-theme-panel/80 dark:bg-theme-panel/85 backdrop-blur-lg border border-theme-panel-border rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative z-10 animate-fadeSlideUp transition-all duration-300">
        
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute left-6 top-6 flex items-center gap-1 text-xs text-theme-muted hover:text-theme-heading transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Beranda
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-8 mt-2">
          <div className="w-24 h-24 relative flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <img src="/icon.png" alt="Pluto Logo" className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_10px_30px_rgba(59,130,246,0.55)]" />
          </div>
        </div>
 
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-theme-heading tracking-tight">
            Welcome to Pluto
          </h2>
          <p className="text-theme-muted mt-2 text-sm">
            {isLogin ? 'Masuk kembali ke ruang kerja Anda' : 'Buat akun untuk memulai perencanaan'}
          </p>
        </div>
 
        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}
 
        {message && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-theme-panel border border-theme-panel-border rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fadeSlideUp text-center">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Mail size={28} />
              </div>
              <h3 className="text-xl font-bold text-theme-heading mb-2 tracking-tight">Periksa Email Anda</h3>
              <p className="text-theme-muted text-sm mb-8 leading-relaxed">
                Kami telah mengirimkan tautan verifikasi ke email Anda. Silakan klik tautan tersebut untuk mengaktifkan akun Anda.
              </p>
              <button 
                onClick={() => setMessage(null)}
                className="w-full bg-theme-panel hover:bg-theme-panel-active border border-theme-panel-border text-theme-heading font-medium py-3 rounded-xl transition-all shadow-sm"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
 
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-theme-muted" size={18} />
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-theme-input-bg border border-theme-input-border text-theme-input-text text-sm rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-theme-muted"
                required
              />
            </div>
          )}
 
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-theme-muted" size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-theme-input-bg border border-theme-input-border text-theme-input-text text-sm rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-theme-muted"
              required
            />
          </div>
 
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-theme-muted" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-theme-input-bg border border-theme-input-border text-theme-input-text text-sm rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-theme-muted"
              required
            />
          </div>
 
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-blue-500/10 dark:shadow-blue-950/40 hover:shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 mt-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
 
        <div className="mt-8 text-center text-sm text-theme-muted flex flex-col gap-3">
          <div>
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors cursor-pointer"
            >
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </div>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-theme-panel-border"></div>
            <span className="flex-shrink-0 mx-4 text-theme-muted text-xs">Atau</span>
            <div className="flex-grow border-t border-theme-panel-border"></div>
          </div>
 
          <button
            onClick={onLocalMode}
            className="text-theme-muted hover:text-theme-heading font-medium transition-colors underline decoration-theme-panel-border hover:decoration-theme-panel-active-border underline-offset-4 cursor-pointer"
          >
            Lanjutkan ke Mode Lokal
          </button>
        </div>
      </div>
    </div>
  );
}
