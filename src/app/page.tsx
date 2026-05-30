'use client';

import React, { useState, useEffect } from 'react';
import AuthUI from '@/components/AuthUI';
import Workspace from '@/components/Workspace';
import LandingPage from '@/components/LandingPage';
import { createClientBrowser } from '@/lib/supabase';
import { Theme } from '@/components/Header';

export default function Home() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [view, setView] = useState<'landing' | 'auth' | 'workspace'>('landing');
  
  // ── Global Theme State ───────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('pluto_theme') as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('pluto_theme', theme);
  }, [theme]);

  const supabase = createClientBrowser();

  useEffect(() => {
    // Check active session if Supabase is configured
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setView('workspace');
        } else {
          setView('landing');
        }
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          setView('workspace');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // If no supabase, set view to landing, but isLocalMode will be false initially until they opt in.
      setIsLocalMode(false);
      setView('landing');
      setLoading(false);
    }
  }, [supabase]);

  const handleLogout = async () => {
    if (supabase && user) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsLocalMode(false);
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If logged in or guest mode is active, always go to workspace
  if (view === 'workspace' || (isLocalMode && view !== 'landing' && view !== 'auth')) {
    return (
      <Workspace 
        user={user} 
        onLogout={handleLogout} 
        onLogin={() => {
          setIsLocalMode(false);
          setView('auth');
        }}
        onGoToLanding={() => {
          setIsLocalMode(false);
          setView('landing');
        }}
        theme={theme}
        onThemeChange={setTheme}
      />
    );
  }

  // Otherwise, show Landing Page or Auth UI
  if (view === 'auth') {
    return (
      <AuthUI
        onSuccess={(u) => {
          setUser(u);
          setView('workspace');
        }}
        onLocalMode={() => {
          setIsLocalMode(true);
          setView('workspace');
        }}
        onBack={() => setView('landing')}
      />
    );
  }

  // Default is Landing Page
  return (
    <LandingPage
      user={user}
      onGoToWorkspace={() => setView('workspace')}
      onGetStarted={() => {
        if (user) {
          setView('workspace');
        } else {
          setView('auth');
        }
      }}
      onLocalMode={() => {
        setIsLocalMode(true);
        setView('workspace');
      }}
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
