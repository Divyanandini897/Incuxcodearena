'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Navigation from '@/src/components/Navigation';
import { ArrowLeft, Check, BookOpen, Terminal, Code, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Checkpoint {
  id: string;
  title: string;
  desc: string;
  topics: string[];
}

interface RoleData {
  title: string;
  startLanguage: string;
  foundations: string[];
  description: string;
  checkpoints: Checkpoint[];
}

const ROADMAPS_DATA: Record<string, RoleData> = {
  system: {
    title: 'System Engineer',
    description: 'Learn to design high-performance, low-latency concurrent backend architectures, Unix environments, and socket listeners.',
    startLanguage: 'C++ or Go',
    foundations: ['POSIX thread pools', 'Unix network sockets', 'File I/O memory descriptors', 'Load balancing & Caching'],
    checkpoints: [
      {
        id: 'sys-cp1',
        title: 'C++/Go Core Syntax & Pointers',
        desc: 'Understand memory models, stack/heap allocations, pointer arithmetic, and standard file handles.',
        topics: ['Pointers', 'Structs', 'Standard streams', 'Garbage collection vs Manual management']
      },
      {
        id: 'sys-cp2',
        title: 'Concurrency & Thread Locks',
        desc: 'Master concurrent execution using threads or goroutines, semaphores, and synchronization locks.',
        topics: ['Mutex locks', 'Semaphores', 'Atomic variables', 'Deadlocks prevention']
      },
      {
        id: 'sys-cp3',
        title: 'Network Socket Programming',
        desc: 'Build client-server endpoints, multiplexing loop listeners, and HTTP protocol parsers.',
        topics: ['TCP/UDP headers', 'Epoll/Select loops', 'Byte arrays parsing', 'Non-blocking I/O']
      },
      {
        id: 'sys-cp4',
        title: 'Distributed System Architecture',
        desc: 'Scale services using load balancers, memory caches, database replication, and sharding.',
        topics: ['Consistent hashing', 'CDN cache invalidation', 'Message queues', 'Horizontal scaling']
      }
    ]
  },
  ml: {
    title: 'ML Engineer',
    description: 'Learn to manipulate large datasets, train classical forecasting structures, and design deep convolutional neural networks.',
    startLanguage: 'Python',
    foundations: ['NumPy arrays & Linear algebra', 'Pandas data frame manipulation', 'Scikit-Learn modeling', 'PyTorch deep networks'],
    checkpoints: [
      {
        id: 'ml-cp1',
        title: 'Python core & Vectorized Math',
        desc: 'Learn python list comprehensions, matrix dot products, and multi-dimensional grid arrays.',
        topics: ['NumPy matrices', 'Vectorization', 'Eigenvalues & Gradients', 'Data files parsing']
      },
      {
        id: 'ml-cp2',
        title: 'Data Cleaning & Wrangling',
        desc: 'Clean noisy databases, handle missing values, merge data sets, and extract key features.',
        topics: ['Pandas pivots', 'Outlier filtering', 'SQL JOIN analytics', 'Feature engineering']
      },
      {
        id: 'ml-cp3',
        title: 'Classical Predictor Training',
        desc: 'Train decision tree classifiers, support vector machines, and linear/logistic predictors.',
        topics: ['Scikit-learn modeling', 'Cross validation', 'F1-score metrics', 'Loss function optimizers']
      },
      {
        id: 'ml-cp4',
        title: 'Deep Learning & Neural Networks',
        desc: 'Build convolutional neural grids, tune backpropagation weights, and deploy Transformer models.',
        topics: ['PyTorch tensors', 'Backpropagation', 'Activation functions', 'LLM fine-tuning']
      }
    ]
  },
  ai: {
    title: 'AI Analyst',
    description: 'Learn prompt engineering structures, vector databases index setups, semantic search pipelines, and multi-agent workflows.',
    startLanguage: 'Python',
    foundations: ['OpenAI / Gemini SDKs', 'Vector database index searches', 'Retrieval Augmented Generation (RAG)', 'Multi-agent frameworks'],
    checkpoints: [
      {
        id: 'ai-cp1',
        title: 'Python Scripting & API Requests',
        desc: 'Learn to request model completions, extract key fields, and process JSON outputs securely.',
        topics: ['HTTP fetch SDKs', 'JSON schema bounds', 'Exception handling', 'Text sanitization']
      },
      {
        id: 'ai-cp2',
        title: 'Semantic Vectors & Indexes',
        desc: 'Understand text embedding grids, cosine similarity computations, and vector store configurations.',
        topics: ['Text embeddings', 'Cosine similarities', 'Pinecone / Milvus setups', 'Metadata filtering']
      },
      {
        id: 'ai-cp3',
        title: 'Context Retrieval & RAG',
        desc: 'Implement text chunking parameters, augment LLM context prompts, and build chat histories.',
        topics: ['Token counting', 'Text chunkers', 'System prompt injection', 'Retrieval parameters']
      },
      {
        id: 'ai-cp4',
        title: 'Multi-Agent Frameworks',
        desc: 'Design stateful tool-calling graphs, agent cycles, planning parameters, and token cost reductions.',
        topics: ['LangChain / LangGraph', 'Tool definitions', 'Cost optimizations', 'System prompt constraints']
      }
    ]
  },
  data: {
    title: 'Data Analyst',
    description: 'Master advanced SQL analytics, pandas transformations, data cleaning pipelines, and interactive BI dashboards.',
    startLanguage: 'SQL & Python',
    foundations: ['Advanced SQL Joins & Windowing', 'Pandas pivot tables & CTEs', 'Statistical hypothesis distributions', 'BI dashboard visuals'],
    checkpoints: [
      {
        id: 'da-cp1',
        title: 'Advanced SQL Analytics',
        desc: 'Write high-performance window partitions, CTEs, self-joins, and database indexes.',
        topics: ['Window functions', 'CTEs', 'Query optimization', 'Aggregations']
      },
      {
        id: 'da-cp2',
        title: 'Pandas Data Cleansing',
        desc: 'Remove duplicate records, normalize columns, pivot summary matrices, and compute rolling stats.',
        topics: ['DataFrame groupbys', 'Outlier filtering', 'Regular expressions', 'Missing values imputation']
      },
      {
        id: 'da-cp3',
        title: 'Statistics & A/B Testing',
        desc: 'Evaluate statistical distributions, run hypothesis tests, trace linear regressions, and calculate variances.',
        topics: ['P-values', 'Confidence intervals', 'A/B testing partitions', 'Correlation metrics']
      },
      {
        id: 'da-cp4',
        title: 'Interactive BI Dashboarding',
        desc: 'Construct clean visual reporting summaries, set up data filters, and design presentation metrics.',
        topics: ['Tableau / PowerBI queries', 'Chart selection', 'Data aggregation', 'KPI design']
      }
    ]
  }
};

export default function JourneyPage() {
  const params = useParams();
  const role = params.role as string;
  const data = ROADMAPS_DATA[role];

  const [completed, setCompleted] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const storageKey = useMemo(() => `leetcode_journey_completed_${role}`, [role]);

  // Load state on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [storageKey]);

  // Save state on change
  const toggleCheckpoint = (id: string) => {
    setCompleted((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-base text-text-main flex flex-col items-center justify-center p-8 font-sans">
        <h2 className="text-xl font-bold">Role Journey Not Found</h2>
        <Link href="/" className="mt-4 text-primary hover:underline font-mono text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Check if checkpoints are completed sequentially
  const line1Filled = mounted && completed.includes(data.checkpoints[0].id);
  const line2Filled = mounted && line1Filled && completed.includes(data.checkpoints[1].id);
  const line3Filled = mounted && line2Filled && completed.includes(data.checkpoints[2].id);

  return (
    <div className="min-h-screen bg-bg-base text-text-main font-sans pb-16">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 mt-8 flex flex-col gap-8">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-mono font-bold text-text-muted hover:text-text-main transition-colors w-fit border border-border-card/50 bg-bg-card px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Arena</span>
        </Link>

        {/* Title Header */}
        <div className="bg-bg-card border border-border-card rounded-xl p-6 glow-border flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary/10 text-primary border-l border-b border-primary/20 px-4 py-1.5 rounded-bl-xl font-mono text-[10px] font-bold uppercase tracking-wider">
            Career Path
          </div>
          <span className="text-[11px] font-mono font-black uppercase text-primary tracking-wider">Roadmap Journey</span>
          <h1 className="text-2xl font-black tracking-tight text-text-main">
            {data.title}
          </h1>
          <p className="text-sm text-text-muted leading-relaxed font-medium max-w-2xl">
            {data.description}
          </p>
        </div>

        {/* Starting Requirements Guide Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Starter */}
          <div className="bg-bg-card border border-border-card rounded-xl p-5 flex gap-4 items-start glow-border">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1.5 leading-snug">
              <span className="text-xs font-mono text-text-muted uppercase tracking-wider font-bold">Start Language</span>
              <span className="text-base font-black text-text-main">{data.startLanguage}</span>
              <p className="text-xs text-text-muted mt-1 leading-relaxed font-medium">
                The recommended syntax environment to begin mastering core libraries and concepts for this role.
              </p>
            </div>
          </div>

          {/* Core Foundations */}
          <div className="bg-bg-card border border-border-card rounded-xl p-5 flex gap-4 items-start glow-border">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1.5 leading-snug">
              <span className="text-xs font-mono text-text-muted uppercase tracking-wider font-bold">Required Foundations</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.foundations.map((f) => (
                  <span key={f} className="text-[10px] font-mono bg-bg-base text-text-muted border border-border-card/45 px-2 py-0.5 rounded font-bold">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Line Graph Checklist */}
        <div className="bg-bg-card border border-border-card rounded-xl p-8 glow-border flex flex-col gap-6">
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card pb-3.5">
            Journey Roadmap Graph
          </h2>

          {/* Timeline Wrapper */}
          <div className="flex flex-col relative pl-4 sm:pl-10 mt-2">
            
            {/* Sequential Connecting Lines (Drawn behind checkpoints) */}
            <div className="absolute left-[31px] sm:left-[55px] top-6 bottom-6 w-1 flex flex-col justify-between items-center z-0 select-none">
              {/* Line segment 1 -> 2 */}
              <div className={`w-full flex-1 transition-colors duration-500 ${line1Filled ? 'bg-primary shadow-[0_0_8px_var(--primary)]' : 'bg-transparent border-l-2 border-dashed border-border-card'}`} />
              
              {/* Node Spacer */}
              <div className="h-10 shrink-0" />
              
              {/* Line segment 2 -> 3 */}
              <div className={`w-full flex-1 transition-colors duration-500 ${line2Filled ? 'bg-primary shadow-[0_0_8px_var(--primary)]' : 'bg-transparent border-l-2 border-dashed border-border-card'}`} />
              
              {/* Node Spacer */}
              <div className="h-10 shrink-0" />

              {/* Line segment 3 -> 4 */}
              <div className={`w-full flex-1 transition-colors duration-500 ${line3Filled ? 'bg-primary shadow-[0_0_8px_var(--primary)]' : 'bg-transparent border-l-2 border-dashed border-border-card'}`} />
            </div>

            {/* Checkpoint Nodes */}
            <div className="flex flex-col gap-10 relative z-10 select-none">
              {data.checkpoints.map((cp, idx) => {
                const isLearned = completed.includes(cp.id);
                
                return (
                  <div key={cp.id} className="flex gap-6 items-start">
                    
                    {/* Node Circle */}
                    <button 
                      onClick={() => toggleCheckpoint(cp.id)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 cursor-pointer ${
                        isLearned 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-105' 
                          : 'bg-bg-card border-border-card text-text-muted hover:border-primary/50'
                      }`}
                      title={isLearned ? "Checkpoint completed! Click to toggle" : "Mark checkpoint as completed"}
                    >
                      {isLearned ? <Check className="w-5 h-5" /> : <span className="font-mono text-xs font-black">{idx + 1}</span>}
                    </button>

                    {/* Step Details Card */}
                    <div className={`flex-1 p-5 rounded-xl border transition-all duration-300 ${
                      isLearned 
                        ? 'bg-bg-base/30 border-primary/20 shadow-sm' 
                        : 'bg-bg-base/60 border-border-card hover:border-border-card/85'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col gap-1 leading-snug">
                          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Checkpoint {idx + 1}</span>
                          <h3 className="text-base font-black text-text-main">{cp.title}</h3>
                        </div>
                        <button
                          onClick={() => toggleCheckpoint(cp.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-mono font-black transition-all cursor-pointer ${
                            isLearned 
                              ? 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20' 
                              : 'bg-neutral-800 border border-border-card text-text-muted hover:text-text-main'
                          }`}
                        >
                          {isLearned ? 'Learned' : 'Mark Learned'}
                        </button>
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed mt-2.5 font-medium">
                        {cp.desc}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {cp.topics.map((t) => (
                          <span key={t} className="text-[10px] font-mono bg-bg-card text-text-muted border border-border-card/50 px-2 py-0.5 rounded font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
