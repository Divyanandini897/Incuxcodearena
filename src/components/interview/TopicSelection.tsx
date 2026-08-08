import React from 'react';
import { Check } from 'lucide-react';
import { Topic, InterviewCategory, ProgrammingLanguage } from '@/src/lib/interview/types';

interface TopicSelectionProps {
  currentTopics: Topic[];
  selectedTopics: string[];
  selectedCategory: InterviewCategory | null;
  selectedLanguage: ProgrammingLanguage | null;
  onToggleTopic: (id: string) => void;
}

export default function TopicSelection({
  currentTopics,
  selectedTopics,
  selectedCategory,
  selectedLanguage,
  onToggleTopic,
}: TopicSelectionProps) {
  if (currentTopics.length === 0) {
    return (
      <div className="bg-bg-card border border-border-card/60 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-text-muted font-semibold">
          {selectedCategory === 'programming-languages' && !selectedLanguage
            ? 'Please select a programming language first.'
            : 'No specific topics available. Leave empty for general questions.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {currentTopics.map((topic) => {
        const isSelected = selectedTopics.includes(topic.id);
        return (
          <button
            key={topic.id}
            onClick={() => onToggleTopic(topic.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none border
              ${isSelected
                ? 'bg-primary/15 text-primary border-primary/40 shadow-[0_0_12px_-4px_var(--color-primary)]'
                : 'bg-bg-card text-text-muted border-border-card/60 hover:border-border-card hover:text-text-main'
              }`}
          >
            {topic.label}
            {isSelected && <Check className="w-3 h-3 inline ml-1.5" />}
          </button>
        );
      })}
    </div>
  );
}
