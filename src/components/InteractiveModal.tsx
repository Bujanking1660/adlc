import React, { useState } from 'react';
import { Send, Sparkles, X, BrainCircuit } from 'lucide-react';

interface Question {
  id: string;
  question: string;
}

interface InteractiveModalProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  onCancel: () => void;
  agentName?: string;
}

export default function InteractiveModal({ questions, onSubmit, onCancel, agentName }: InteractiveModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const handleNext = () => {
    if (isLast) {
      onSubmit(answers);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeSlideUp">
      <div className="w-full max-w-2xl glass-panel-active rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(59,130,246,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-panel-border bg-theme-panel/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <BrainCircuit size={20} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-heading)' }}>{agentName || 'System Analyst Agent'}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Butuh klarifikasi untuk prompt Anda ({currentIdx + 1}/{questions.length})</p>
            </div>
          </div>
          <button onClick={onCancel} className="transition-colors cursor-pointer hover:text-blue-400" style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-xl mb-6 font-medium leading-relaxed drop-shadow-md" style={{ color: 'var(--text-heading)' }}>
            {currentQ.question}
          </h2>
          
          <div className="relative group rounded-xl overflow-hidden border border-theme-input-border bg-theme-input-bg">
            <textarea
              autoFocus
              className="w-full bg-transparent p-5 min-h-[120px] resize-none focus:outline-none custom-scrollbar"
              style={{ color: 'var(--input-text)' }}
              placeholder="Tuliskan detail atau jawaban Anda di sini..."
              value={answers[currentQ.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleNext();
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-theme-panel-border bg-theme-panel/70">
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Sparkles size={12} className="text-blue-400" /> Vibe AI Dynamic Query
          </span>
          <button
            onClick={handleNext}
            disabled={!answers[currentQ.id] || answers[currentQ.id].trim() === ''}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLast ? 'Kirim ke Agent' : 'Selanjutnya'} <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
