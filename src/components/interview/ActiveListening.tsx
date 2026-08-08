import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ActiveListeningProps {
  transcript: string;
  interimTranscript: string;
}

export default function ActiveListening({ transcript, interimTranscript }: ActiveListeningProps) {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono uppercase text-primary">
        <MessageSquare className="w-3 h-3" />
        <span>Your Answer (speaking...)</span>
        <span className="ml-auto flex gap-1">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
      <div className="bg-bg-base/30 border border-primary/20 rounded-lg p-3.5 min-h-[80px]">
        {transcript && (
          <p className="text-sm text-text-main font-medium">{transcript}</p>
        )}
        {interimTranscript && (
          <p className="text-sm text-text-muted/60 italic mt-1">{interimTranscript}</p>
        )}
        {!transcript && !interimTranscript && (
          <p className="text-xs text-text-muted/40 italic">Listening...</p>
        )}
      </div>
    </div>
  );
}
