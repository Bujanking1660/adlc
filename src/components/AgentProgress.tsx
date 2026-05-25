import React from 'react';
import { BrainCircuit, PenTool, Database, ShieldCheck, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

export type AgentStatus = 'idle' | 'processing' | 'waiting_user_input' | 'completed' | 'error';

export interface AgentStep {
  id: string;
  name: string;
  status: AgentStatus;
  message?: string;
}

interface AgentProgressProps {
  steps: AgentStep[];
  selectedStepId?: string | null;
  onStepClick?: (id: string) => void;
}

const getIconForAgent = (name: string, status: AgentStatus) => {
  if (status === 'completed') return <CheckCircle2 className="text-emerald-400" size={24} />;
  if (status === 'error') return <AlertTriangle className="text-rose-400" size={24} />;
  
  if (name.toLowerCase().includes('analyst')) return <BrainCircuit size={24} className={status === 'processing' ? 'text-blue-400' : 'text-theme-muted'} />;
  if (name.toLowerCase().includes('frontend') || name.toLowerCase().includes('ui')) return <PenTool size={24} className={status === 'processing' ? 'text-sky-400' : 'text-theme-muted'} />;
  if (name.toLowerCase().includes('database') || name.toLowerCase().includes('backend')) return <Database size={24} className={status === 'processing' ? 'text-cyan-400' : 'text-theme-muted'} />;
  if (name.toLowerCase().includes('qa') || name.toLowerCase().includes('devops')) return <ShieldCheck size={24} className={status === 'processing' ? 'text-emerald-400' : 'text-theme-muted'} />;
  
  return <BrainCircuit size={24} className="text-theme-muted" />;
};

export default function AgentProgress({ steps, selectedStepId, onStepClick }: AgentProgressProps) {
  return (
    <div className="w-full space-y-4">
      {steps.map((step, idx) => {
        const isActive = step.status === 'processing' || step.status === 'waiting_user_input';
        const isCompleted = step.status === 'completed';
        const isFocused = selectedStepId === step.id;
        const isClickable = (isCompleted || isActive) && !!onStepClick;

        return (
          <div
            key={step.id}
            onClick={isClickable ? () => onStepClick!(step.id) : undefined}
            className={`relative flex items-start gap-4 p-5 rounded-2xl transition-all duration-500 ${
              isFocused
                ? 'border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[1.02]'
                : isActive
                  ? 'glass-panel-active transform scale-[1.02]'
                  : isCompleted
                    ? 'glass-panel opacity-100'
                    : 'glass-panel opacity-50'
            } ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:border-blue-500/50' : ''}`}
            style={isFocused ? { background: 'var(--panel-active-bg)' } : undefined}
            title={isClickable ? `Fokus ke ${step.name}` : undefined}
          >
            {/* Focused badge */}
            {isFocused && (
              <span className="absolute top-2 right-3 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                Fokus
              </span>
            )}

            {/* Connecting line to next step */}
            {idx < steps.length - 1 && (
              <div className="absolute left-8 top-12 bottom-[-16px] w-0.5 bg-theme-panel-border z-0">
                <div
                  className="w-full bg-gradient-to-b from-blue-500 to-sky-500 transition-all duration-1000"
                  style={{ height: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}

            <div className="relative z-10 flex-shrink-0">
              <div className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isFocused
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-[0_0_18px_rgba(59,130,246,0.3)]'
                  : isActive
                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-theme-icon-bg border border-theme-icon-border'
              }`}
                style={!isActive && !isFocused ? { color: 'var(--text-muted)' } : undefined}
              >
                {getIconForAgent(step.name, step.status)}
              </div>
            </div>

            <div className="flex-grow pt-2">
              <div className="flex items-center justify-between mb-1">
                <h4
                  className="font-semibold transition-colors duration-300"
                  style={{ color: isActive || isFocused ? 'var(--text-heading)' : 'var(--text-muted)' }}
                >
                  {step.name}
                </h4>
                {step.status === 'processing' && (
                  <Loader2 className="animate-spin text-blue-500" size={16} />
                )}
              </div>
              <p
                className="text-sm leading-relaxed transition-colors duration-300"
                style={{
                  color: isActive || isFocused ? 'var(--text-heading)' : 'var(--text-muted)',
                  opacity: isActive || isFocused ? 0.95 : 0.6,
                }}
              >
                {step.message || (
                  step.status === 'idle' ? 'Menunggu antrean...' :
                  step.status === 'processing' ? 'Sedang memproses data dan menghasilkan output...' :
                  step.status === 'waiting_user_input' ? 'Membutuhkan input tambahan dari Anda.' :
                  step.status === 'completed'
                    ? isFocused ? 'Klik lagi untuk batal fokus.' : 'Tugas selesai. Klik untuk fokus update di sini.'
                    : 'Terjadi kesalahan.'
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
