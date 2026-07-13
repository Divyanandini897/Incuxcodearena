'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/src/components/AppLayout';
import { ArrowLeft, Check, BookOpen, Terminal, Code, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';

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
    description: 'Master data ingestion pipelines, numerical analytics, classical algorithm models, and deep neural net tuning.',
    startLanguage: 'Python',
    foundations: ['Vector algebra', 'Differential calculus', 'Pandas pipelines', 'TensorFlow/PyTorch arrays'],
    checkpoints: [
      {
        id: 'ml-cp1',
        title: 'Python Numerical Foundations',
        desc: 'Learn numpy matrix manipulations, vector broadcasting, and statistical outliers detection.',
        topics: ['Matrix multiplication', 'Standard deviation', 'Array slicing', 'CSV/JSON Dataframes']
      },
      {
        id: 'ml-cp2',
        title: 'Classical Machine Learning',
        desc: 'Implement linear regression, decision trees, support vector machines, and evaluate cost metrics.',
        topics: ['Gradient descent', 'Overfitting', 'Cross validation', 'Precision & Recall']
      },
      {
        id: 'ml-cp3',
        title: 'Neural Networks & Layers',
        desc: 'Understand feed-forward nets, backpropagation mechanics, activation bounds, and weights initialization.',
        topics: ['Backpropagation', 'Sigmoid/ReLU', 'SGD optimizers', 'Cross entropy loss']
      },
      {
        id: 'ml-cp4',
        title: 'Deep Learning Architectures',
        desc: 'Tune convolution filters, sequence recurrent gates, and transformer self-attention vectors.',
        topics: ['CNN filters', 'LSTM gates', 'Self-attention matrices', 'Fine-tuning models']
      }
    ]
  },
  ai: {
    title: 'AI Analyst',
    description: 'Learn vector search patterns, prompt optimizations, context retrieval databases, and cognitive agent behaviors.',
    startLanguage: 'Python or JavaScript',
    foundations: ['API integrations', 'Semantic embeddings', 'Vector databases', 'Agent tool calls'],
    checkpoints: [
      {
        id: 'ai-cp1',
        title: 'API Integrations & Prompting',
        desc: 'Design clean prompt instructions, system boundaries, and handle JSON parsing results.',
        topics: ['Few-shot prompting', 'System messages', 'JSON output schemas', 'Token limit pricing']
      },
      {
        id: 'ai-cp2',
        title: 'Semantic Vector Databases',
        desc: 'Convert text queries to vectors, index semantic spaces, and retrieve context vectors.',
        topics: ['Cosine similarity', 'Vector indexes', 'Metadata filters', 'Embedding models']
      },
      {
        id: 'ai-cp3',
        title: 'RAG Retrieval Systems',
        desc: 'Build search flows combining keyword retrieval with semantic lookups and response generation.',
        topics: ['Query rewrite', 'Context chunking', 'Reranking tools', 'Hallucinations check']
      },
      {
        id: 'ai-cp4',
        title: 'Autonomous Agent Frameworks',
        desc: 'Implement tool execution loops, scratchpad memory states, and multi-agent group coordination.',
        topics: ['ReAct prompt pattern', 'Tool bindings', 'State recovery', 'Agent conversations']
      }
    ]
  },
  data: {
    title: 'Data Analyst',
    description: 'Master analytical SQL queries, data warehousing pipelines, visualization models, and statistical significance.',
    startLanguage: 'SQL & Python',
    foundations: ['Relational databases', 'Data normalizations', 'Descriptive statistics', 'Visual analytics'],
    checkpoints: [
      {
        id: 'data-cp1',
        title: 'Advanced SQL Query Engines',
        desc: 'Master complex window partition functions, CTE layers, hierarchical queries, and index lookups.',
        topics: ['Window functions', 'Common Table Expressions', 'Inner/Outer joins', 'Index optimizations']
      },
      {
        id: 'data-cp2',
        title: 'Data Processing Pipelines',
        desc: 'Clean transactional databases, resolve missing fields, normalise tables, and merge datasets.',
        topics: ['Null handling', 'Data deduplications', 'Outer bounds', 'Grouping aggregations']
      },
      {
        id: 'data-cp3',
        title: 'Descriptive Analytics & Stats',
        desc: 'Master hypothesis validations, correlation coefficient models, and probability distributions.',
        topics: ['Z-score calculation', 'T-tests validation', 'A/B testing ratios', 'Normal curves']
      },
      {
        id: 'data-cp4',
        title: 'Data Visualization & Reporting',
        desc: 'Build dashboard reporting schemas, coordinate charts visual hierarchy, and export clean metrics.',
        topics: ['Categorical charts', 'KPI scorecards', 'Scatter correlation plots', 'PDF/CSV exports']
      }
    ]
  }
};

export default function JourneyRolePage() {
  const params = useParams();
  const role = Array.isArray(params?.role) ? params.role[0] : params?.role;
  const decodedRole = role ? decodeURIComponent(role) : 'system';

  const data = ROADMAPS_DATA[decodedRole] || ROADMAPS_DATA.system;

  const [completed, setCompleted] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(`roadmap-${decodedRole}-completed`);
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [decodedRole]);

  const toggleCheckpoint = (id: string) => {
    const nextCompleted = completed.includes(id)
      ? completed.filter((c) => c !== id)
      : [...completed, id];
    setCompleted(nextCompleted);
    localStorage.setItem(`roadmap-${decodedRole}-completed`, JSON.stringify(nextCompleted));
  };

  // Check if checkpoints are completed sequentially
  const line1Filled = mounted && completed.includes(data.checkpoints[0].id);
  const line2Filled = mounted && line1Filled && completed.includes(data.checkpoints[1].id);
  const line3Filled = mounted && line2Filled && completed.includes(data.checkpoints[2].id);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-main transition-colors w-fit border border-border-card bg-bg-card px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Arena</span>
        </Link>

        {/* Title Header */}
        <Card className="flex flex-col gap-2 relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 bg-primary/10 text-primary border-l border-b border-border-card px-3 py-1 rounded-bl-lg font-mono text-[9px] font-bold uppercase tracking-wider">
            Career Path
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider">Roadmap Journey</span>
          <h1 className="text-lg font-bold tracking-tight text-text-main">
            {data.title}
          </h1>
          <p className="text-xs text-text-muted leading-relaxed font-semibold">
            {data.description}
          </p>
        </Card>

        {/* Starting Requirements Guide Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language Starter */}
          <Card className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-lg bg-hover border border-border-card/45 text-text-muted flex items-center justify-center shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1 leading-snug">
              <span className="text-[9.5px] font-mono text-text-muted uppercase tracking-wider font-bold">Start Language</span>
              <span className="text-sm font-bold text-text-main">{data.startLanguage}</span>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed font-semibold">
                The recommended syntax environment to begin mastering core libraries and concepts for this role.
              </p>
            </div>
          </Card>

          {/* Core Foundations */}
          <Card className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-lg bg-hover border border-border-card/45 text-text-muted flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1 leading-snug">
              <span className="text-[9.5px] font-mono text-text-muted uppercase tracking-wider font-bold">Required Foundations</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {data.foundations.map((f) => (
                  <span key={f} className="text-[9px] font-mono bg-hover border border-border-card/45 px-1.5 py-0.5 rounded text-text-muted">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Roadmap Line Graph Checklist */}
        <Card className="flex flex-col gap-5">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-text-main border-b border-border-card/50 pb-2">
            Journey Roadmap Graph
          </h2>

          {/* Timeline Wrapper */}
          <div className="flex flex-col relative pl-4 sm:pl-8 mt-1.5 select-none">
            
            {/* Sequential Connecting Lines (Flat styling) */}
            <div className="absolute left-[23px] sm:left-[39px] top-6 bottom-6 w-0.5 flex flex-col justify-between items-center z-0 select-none">
              {/* Line segment 1 -> 2 */}
              <div className={`w-full flex-1 transition-colors duration-500 ${line1Filled ? 'bg-primary' : 'bg-transparent border-l border-dashed border-border-card'}`} />
              
              {/* Node Spacer */}
              <div className="h-10 shrink-0" />
              
              {/* Line segment 2 -> 3 */}
              <div className={`w-full flex-1 transition-colors duration-500 ${line2Filled ? 'bg-primary' : 'bg-transparent border-l border-dashed border-border-card'}`} />
              
              {/* Node Spacer */}
              <div className="h-10 shrink-0" />

              {/* Line segment 3 -> 4 */}
              <div className={`w-full flex-1 transition-colors duration-500 ${line3Filled ? 'bg-primary' : 'bg-transparent border-l border-dashed border-border-card'}`} />
            </div>

            {/* Checkpoint Nodes */}
            <div className="flex flex-col gap-10 relative z-10 select-none">
              {data.checkpoints.map((cp, idx) => {
                const isLearned = completed.includes(cp.id);
                
                return (
                  <div key={cp.id} className="flex gap-4 items-start">
                    
                    {/* Node Circle */}
                    <button 
                      onClick={() => toggleCheckpoint(cp.id)}
                      className={`w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 cursor-pointer ${
                        isLearned 
                          ? 'bg-primary border-primary text-white font-bold' 
                          : 'bg-bg-card border-border-card text-text-muted hover:border-primary/50'
                      }`}
                      title={isLearned ? "Checkpoint completed! Click to toggle" : "Mark checkpoint as completed"}
                    >
                      {isLearned ? <Check className="w-4 h-4" /> : <span className="font-mono text-[11px] font-bold">{idx + 1}</span>}
                    </button>

                    {/* Step Details Card */}
                    <div className={`flex-1 p-4 rounded-xl border transition-all duration-300 ${
                      isLearned 
                        ? 'bg-hover border-primary/20' 
                        : 'bg-bg-card border-border-card hover:border-border-card/85'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col gap-0.5 leading-snug">
                          <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">Checkpoint {idx + 1}</span>
                          <h3 className="text-xs font-bold text-text-main">{cp.title}</h3>
                        </div>
                        <Button
                          variant={isLearned ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => toggleCheckpoint(cp.id)}
                          className="h-7 px-3 text-[10px]"
                        >
                          {isLearned ? 'Learned' : 'Mark Learned'}
                        </Button>
                      </div>

                      <p className="text-[11px] text-text-muted leading-relaxed mt-2 font-semibold">
                        {cp.desc}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {cp.topics.map((t) => (
                          <span key={t} className="text-[9px] font-mono bg-bg-base/70 border border-border-card/50 px-1.5 py-0.5 rounded text-text-muted">
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
        </Card>
      </div>
    </AppLayout>
  );
}
