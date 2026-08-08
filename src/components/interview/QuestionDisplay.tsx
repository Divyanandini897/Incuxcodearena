import React from 'react';
import { InterviewQuestion } from '@/src/lib/interview/types';

interface QuestionDisplayProps {
  currentQuestion: InterviewQuestion;
  currentIndex: number;
}

export default function QuestionDisplay({ currentQuestion, currentIndex }: QuestionDisplayProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-[10px] font-bold font-mono uppercase text-text-muted">
        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
          Q{currentIndex + 1}
        </span>
        <span>{currentQuestion.question.topic}</span>
        <span className={`px-2 py-0.5 rounded-md
          ${currentQuestion.question.difficulty === 'easy' ? 'bg-green-400/10 text-green-400' : ''}
          ${currentQuestion.question.difficulty === 'medium' ? 'bg-yellow-400/10 text-yellow-400' : ''}
          ${currentQuestion.question.difficulty === 'hard' ? 'bg-red-400/10 text-red-400' : ''}
        `}>
          {currentQuestion.question.difficulty}
        </span>
      </div>

      <div className="bg-bg-base/40 border border-border-card/40 rounded-xl p-5">
        <p className="text-sm text-text-main font-semibold leading-relaxed">
          {currentQuestion.question.text}
        </p>
      </div>
    </>
  );
}
