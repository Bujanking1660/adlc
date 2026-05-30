'use client';

import React from 'react';
import { Plus, Sparkles, Sun, Moon, Monitor, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

export type Theme = 'system' | 'dark' | 'light';

interface HeaderProps {
  onNewPlan?: () => void;
  theme?: Theme;
  onThemeChange?: (t: Theme) => void;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  onGoToLanding?: () => void;
}

const THEME_CYCLE: Theme[] = ['system', 'dark', 'light'];

const THEME_META: Record<Theme, { icon: React.ReactNode; label: string }> = {
  system: { icon: <Monitor size={15} />, label: 'System' },
  dark: { icon: <Moon size={15} />, label: 'Dark' },
  light: { icon: <Sun size={15} />, label: 'Light' },
};

export default function Header({
  onNewPlan,
  theme = 'dark',
  onThemeChange,
  sidebarOpen,
  onSidebarToggle,
  onGoToLanding,
}: HeaderProps) {
  const meta = THEME_META[theme];
  const nextIdx = (THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length;
  const nextTheme = THEME_CYCLE[nextIdx];

  return (
    <header
      className="h-14 md:h-16 w-full flex items-center justify-between px-4 md:px-6 backdrop-blur-md border-b z-30 sticky top-0 transition-all duration-300"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
    >
      {/* Left: sidebar toggle + brand */}
      <div className="flex items-center gap-2">
        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            title={sidebarOpen ? 'Hide Sidebar' : 'Show History'}
            className="p-2 rounded-lg transition-all cursor-pointer hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        )}
        <button
          onClick={onGoToLanding}
          title="Kembali ke Beranda"
          className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-semibold cursor-pointer hover:bg-white/5 transition-all"
          style={{
            borderColor: 'var(--panel-border)',
            background: 'var(--panel-bg)',
            color: 'var(--text-heading)',
          }}
        >
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
            <img
              src="/icon.png"
              alt="Pluto Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(59,130,246,0.45)] transition-transform hover:scale-105 duration-300"
            />
          </div>
          <span className="hidden sm:inline">Pluto Engine</span>
          <span className="sm:hidden">Pluto</span>
        </button>
      </div>

      {/* Right: theme toggle + new plan + logout */}
      <div className="flex items-center gap-2">
        {onThemeChange && (
          <button
            onClick={() => onThemeChange(nextTheme)}
            title={`Theme: ${meta.label} — click for ${THEME_META[nextTheme].label}`}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-all text-xs font-medium cursor-pointer hover:border-blue-500/50 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              color: 'var(--text-muted)',
              borderColor: 'var(--panel-border)',
              background: 'var(--panel-bg)',
            }}
          >
            {meta.icon}
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        )}

        <button
          onClick={onNewPlan}
          className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-blue-950/40 hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Plan</span>
          <span className="sm:hidden">New</span>
        </button>


      </div>
    </header>
  );
}
