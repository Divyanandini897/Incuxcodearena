import React from 'react';
import { Check } from 'lucide-react';

export const difficulties = [
  { id: 'easy', label: 'Easy', color: 'text-green-400', bar: 'bg-green-400' },
  { id: 'medium', label: 'Medium', color: 'text-yellow-400', bar: 'bg-yellow-400' },
  { id: 'hard', label: 'Hard', color: 'text-red-400', bar: 'bg-red-400' },
  { id: 'mixed', label: 'Mixed', color: 'text-blue-400', bar: 'bg-blue-400' },
];

interface DifficultySelectionProps {
  selectedDifficulty: string | null;
  onSelect: (id: string) => void;
}

export default function DifficultySelection({
  selectedDifficulty,
  onSelect,
}: DifficultySelectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      {difficulties.map((d) => {
        const isSelected = selectedDifficulty === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-200 cursor-pointer select-none
              ${isSelected
                ? 'bg-primary/10 border-primary/30 shadow-[0_0_16px_-6px_var(--color-primary)]'
                : 'bg-bg-card border-border-card/60 hover:border-border-card hover:bg-bg-card/80'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${d.bar}`} />
            <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-text-main'}`}>{d.label}</span>
            <span className="text-[10px] text-text-muted font-semibold text-center">
              {d.id === 'easy' ? 'Basic concepts & fundamentals' : ''}
              {d.id === 'medium' ? 'Intermediate problems' : ''}
              {d.id === 'hard' ? 'Advanced & complex topics' : ''}
              {d.id === 'mixed' ? 'Random difficulty mix' : ''}
            </span>
            {isSelected && <Check className="w-4 h-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
