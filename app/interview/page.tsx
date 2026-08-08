'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Check, ChevronRight } from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';
import { InterviewCategory, ProgrammingLanguage } from '@/src/lib/interview/types';
import {
  programmingLanguages,
  categoryTopics,
  languageTopics,
} from '@/src/lib/interview/data';
import CategorySelection from '@/src/components/interview/CategorySelection';
import LanguageSelection from '@/src/components/interview/LanguageSelection';
import TopicSelection from '@/src/components/interview/TopicSelection';
import DifficultySelection from '@/src/components/interview/DifficultySelection';

const categories: { id: InterviewCategory; icon: string; desc: string }[] = [
  { id: 'programming-languages', icon: 'Code2', desc: 'Test your language proficiency' },
  { id: 'dsa', icon: 'GitBranch', desc: 'Data structures & algorithms' },
  { id: 'machine-learning', icon: 'Brain', desc: 'ML concepts & techniques' },
  { id: 'operating-systems', icon: 'Monitor', desc: 'OS fundamentals' },
  { id: 'dbms', icon: 'Database', desc: 'Database systems & SQL' },
  { id: 'computer-networks', icon: 'Globe', desc: 'Networking concepts' },
  { id: 'algorithms', icon: 'Sigma', desc: 'Algorithm design & analysis' },
  { id: 'aptitude', icon: 'Calculator', desc: 'Quantitative & logical reasoning' },
  { id: 'hr', icon: 'Users', desc: 'Behavioral & HR interview' },
];

export default function InterviewDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState<'category' | 'language' | 'topics' | 'difficulty'>('category');
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const currentTopics = selectedCategory === 'programming-languages' && selectedLanguage
    ? languageTopics[selectedLanguage]
    : selectedCategory
      ? categoryTopics[selectedCategory]
      : [];

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  const handleCategorySelect = (id: InterviewCategory) => {
    setSelectedCategory(id);
    setSelectedTopics([]);
    setSelectedLanguage(null);
  };

  const handleLanguageSelect = (id: ProgrammingLanguage) => {
    setSelectedLanguage(id);
    setSelectedTopics([]);
  };

  const canProceedFromCategory = selectedCategory;
  const canProceedFromLanguage = selectedCategory !== 'programming-languages' || !!selectedLanguage;
  const canProceedFromTopics = selectedTopics.length > 0;
  const canStart = selectedCategory && canProceedFromLanguage && selectedTopics.length > 0 && selectedDifficulty;

  const handleStart = () => {
    if (!canStart) return;
    const params = new URLSearchParams({
      category: selectedCategory!,
      topics: selectedTopics.join(','),
      difficulty: selectedDifficulty!,
    });
    if (selectedLanguage) params.set('language', selectedLanguage);
    router.push(`/interview/session?${params.toString()}`);
  };

  if (!isMounted) {
    return (
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col gap-6 select-none font-sans pb-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Voice Interview
          </span>
          <h1 className="text-3xl font-black text-text-main tracking-tight">AI Coding Interview</h1>
          <p className="text-sm text-text-muted font-semibold max-w-[600px]">
            Simulate a real technical interview with AI. Speak your answers naturally — just like a real interview.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
          {(['category', 'language', 'topics', 'difficulty'] as const).map((s, i) => {
            const isActive = step === s;
            const isDone = ['category', 'language', 'topics', 'difficulty'].indexOf(step) > i;
            return (
              <React.Fragment key={s}>
                {i > 0 && <ChevronRight className={`w-3.5 h-3.5 ${isDone ? 'text-primary' : 'text-text-muted/40'}`} />}
                <button
                  onClick={() => setStep(s)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none
                    ${isActive ? 'bg-primary/15 text-primary border border-primary/25' : ''}
                    ${isDone ? 'text-primary/60' : 'text-text-muted/60'}
                  `}
                >
                  {isDone ? <Check className="w-3 h-3 inline mr-1" /> : null}
                  {s === 'category' ? 'Category' : s === 'language' ? 'Language' : s === 'topics' ? 'Topics' : 'Difficulty'}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        {step === 'category' && (
          <CategorySelection
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        )}

        {step === 'language' && (
          <LanguageSelection
            selectedCategory={selectedCategory}
            programmingLanguages={programmingLanguages}
            selectedLanguage={selectedLanguage}
            onSelect={handleLanguageSelect}
          />
        )}

        {step === 'topics' && (
          <TopicSelection
            currentTopics={currentTopics}
            selectedTopics={selectedTopics}
            selectedCategory={selectedCategory}
            selectedLanguage={selectedLanguage}
            onToggleTopic={toggleTopic}
          />
        )}

        {step === 'difficulty' && (
          <DifficultySelection
            selectedDifficulty={selectedDifficulty}
            onSelect={setSelectedDifficulty}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {step !== 'category' && (
              <button
                onClick={() => {
                  if (step === 'language') setStep('category');
                  else if (step === 'topics') setStep(selectedCategory === 'programming-languages' ? 'language' : 'category');
                  else if (step === 'difficulty') setStep('topics');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-text-muted border border-border-card/60 hover:border-border-card transition-all cursor-pointer select-none"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {step !== 'difficulty' && (
              <button
                onClick={() => {
                  if (step === 'category' && canProceedFromCategory) setStep('language');
                  else if (step === 'language' && canProceedFromLanguage) setStep('topics');
                  else if (step === 'topics') setStep('difficulty');
                }}
                disabled={
                  (step === 'category' && !canProceedFromCategory) ||
                  (step === 'language' && !canProceedFromLanguage) ||
                  (step === 'topics' && currentTopics.length > 0 && !canProceedFromTopics)
                }
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-black transition-all cursor-pointer select-none
                  disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-6 border-t border-border-card/30">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`group relative flex items-center gap-3 px-12 py-4 rounded-2xl text-sm font-black tracking-wide uppercase font-mono transition-all duration-300 cursor-pointer select-none
              ${canStart
                ? 'bg-primary text-black shadow-[0_8px_32px_-8px_rgba(0,234,100,0.35)] hover:shadow-[0_8px_40px_-6px_rgba(0,234,100,0.5)] hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-bg-card/50 text-text-muted/40 border border-border-card/40 cursor-not-allowed'
              }`}
          >
            {canStart ? (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Start Voice Interview</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              <span>Complete All Selections to Begin</span>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
