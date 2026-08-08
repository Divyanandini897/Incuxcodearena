import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { AnswerEvaluation } from '@/src/lib/interview/types';

interface FeedbackDisplayProps {
  feedback: AnswerEvaluation;
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return 'bg-green-400';
    if (score >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 text-xs font-bold font-mono ${getScoreColor(feedback.score)}`}>
          {feedback.score >= 70 ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          Score: {feedback.score}/100
        </div>
        <div className="flex-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getScoreBarColor(feedback.score)}`}
            style={{ width: `${feedback.score}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Technical', value: feedback.technicalAccuracy },
          { label: 'Completeness', value: feedback.completeness },
          { label: 'Communication', value: feedback.communication },
          { label: 'Confidence', value: feedback.confidence },
        ].map((dim) => (
          <div key={dim.label} className="bg-bg-base/20 border border-border-card/30 rounded-lg p-2.5 flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold uppercase text-text-muted w-20">{dim.label}</span>
            <div className="flex-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getScoreBarColor(dim.value)}`} style={{ width: `${dim.value}%` }} />
            </div>
            <span className={`text-[10px] font-bold font-mono ${getScoreColor(dim.value)}`}>{dim.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-bg-base/30 border border-border-card/40 rounded-lg p-3.5">
        <p className="text-xs text-text-main font-medium leading-relaxed">{feedback.feedback}</p>
      </div>

      {feedback.improvementTips && feedback.improvementTips.length > 0 && (
        <div className="bg-blue-400/5 border border-blue-400/20 rounded-lg p-3.5">
          <h4 className="text-[10px] font-bold font-mono uppercase text-blue-400 mb-2">Tips to Improve</h4>
          <ul className="flex flex-col gap-1.5">
            {feedback.improvementTips.map((tip, i) => (
              <li key={i} className="text-xs text-text-main flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
