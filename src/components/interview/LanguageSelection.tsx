import React from 'react';
import { Check } from 'lucide-react';
import { InterviewCategory, ProgrammingLanguage } from '@/src/lib/interview/types';

interface LanguageSelectionProps {
  selectedCategory: InterviewCategory | null;
  programmingLanguages: { id: ProgrammingLanguage; label: string; icon: string }[];
  selectedLanguage: ProgrammingLanguage | null;
  onSelect: (id: ProgrammingLanguage) => void;
}

export default function LanguageSelection({
  selectedCategory,
  programmingLanguages,
  selectedLanguage,
  onSelect,
}: LanguageSelectionProps) {
  if (selectedCategory !== 'programming-languages') {
    return (
      <div className="bg-bg-card border border-border-card/60 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
        <Check className="w-10 h-10 text-primary" />
        <p className="text-sm text-text-main font-bold">No language selection needed for this category.</p>
        <p className="text-xs text-text-muted">Click &quot;Topics&quot; above to continue.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {programmingLanguages.map((lang) => {
        const isSelected = selectedLanguage === lang.id;
        return (
          <button
            key={lang.id}
            onClick={() => onSelect(lang.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none
              ${isSelected
                ? 'bg-primary/10 border-primary/30 shadow-[0_0_16px_-6px_var(--color-primary)]'
                : 'bg-bg-card border-border-card/60 hover:border-border-card hover:bg-bg-card/80'
              }`}
          >
            <span className="text-2xl">{lang.icon}</span>
            <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-text-main'}`}>{lang.label}</span>
            {isSelected && <Check className="w-3 h-3 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
