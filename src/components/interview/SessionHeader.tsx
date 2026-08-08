import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

interface SessionHeaderProps {
  elapsedTime: number;
  duration: number;
}

export default function SessionHeader({ elapsedTime, duration }: SessionHeaderProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remaining = duration - elapsedTime;
  const progress = (elapsedTime / duration) * 100;
  const isLowTime = remaining <= 60;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Voice Interview
          </span>
          <h2 className="text-lg font-black text-text-main tracking-tight">AI Interview Session</h2>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold
          ${isLowTime ? 'bg-red-400/10 border-red-400/30 text-red-400' : 'bg-bg-card border-border-card/60 text-text-main'}`}
        >
          <Clock className={`w-4 h-4 ${isLowTime ? 'animate-pulse' : ''}`} />
          <span className="text-sm">{formatTime(remaining)}</span>
        </div>
      </div>

      <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${isLowTime ? 'bg-red-400' : 'bg-primary'}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </>
  );
}
