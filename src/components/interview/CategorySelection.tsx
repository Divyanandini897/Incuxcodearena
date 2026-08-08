import React from 'react';
import { Check, Code2 } from 'lucide-react';
import { InterviewCategory } from '@/src/lib/interview/types';
import { categoryLabels } from '@/src/lib/interview/data';
import {
  Code2 as Code2Icon,
  GitBranch,
  Brain,
  Monitor,
  Database,
  Globe,
  Sigma,
  Calculator,
  Users,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Code2: Code2Icon,
  GitBranch,
  Brain,
  Monitor,
  Database,
  Globe,
  Sigma,
  Calculator,
  Users,
};

interface CategoryProps {
  categories: { id: InterviewCategory; icon: string; desc: string }[];
  selectedCategory: InterviewCategory | null;
  onSelect: (id: InterviewCategory) => void;
}

export default function CategorySelection({ categories, selectedCategory, onSelect }: CategoryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon] || Code2;
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none
              ${isSelected
                ? 'bg-primary/10 border-primary/30 shadow-[0_0_16px_-6px_var(--color-primary)]'
                : 'bg-bg-card border-border-card/60 hover:border-border-card hover:bg-bg-card/80'
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${isSelected ? 'bg-primary/20' : 'bg-bg-base/60'}`}>
              <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                {categoryLabels[cat.id]}
                {isSelected && <Check className="w-3.5 h-3.5 inline ml-1.5" />}
              </span>
              <span className="text-[10px] text-text-muted font-semibold">{cat.desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
