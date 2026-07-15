'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Star, BookOpen, Terminal, Cpu } from 'lucide-react';
import AppLayout from '@/src/components/AppLayout';
import { useGameState } from '@/src/lib/gameState';
import { PROBLEMS_DATA } from '@/src/data/data';
import { CURATED_TRACKS } from '@/app/prepare/curatedData';
import Badge from '@/src/components/ui/Badge';

const PROBLEMS_PER_PAGE = 25;

const LANGUAGE_CONFIG: Record<string, { label: string; color: 'easy' | 'medium' | 'hard' }> = {
  python: { label: 'Python', color: 'easy' },
  java: { label: 'Java', color: 'medium' },
  cpp: { label: 'C++', color: 'hard' },
  javascript: { label: 'JavaScript', color: 'easy' },
};

const DIFFICULTY_TIERS: { key: string; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
];

interface ConceptContent {
  title: string;
  explanation: string;
  complexity: { time: string; space: string };
  code: string;
}

const CONCEPT_LIBRARY: Record<string, Record<string, ConceptContent>> = {
  python: {
    basic: {
      title: 'Variables & Control Flow',
      explanation:
        'Python uses dynamic typing — variables can hold any type without explicit declarations. Indentation defines code blocks. Common control structures include if/elif/else, for loops over iterables, and while loops. The print() function is the primary debugging tool.',
      complexity: { time: 'O(n) linear', space: 'O(1) constant' },
      code: `def two_sum(nums, target):
    seen = {}
    for i, val in enumerate(nums):
        complement = target - val
        if complement in seen:
            return [seen[complement], i]
        seen[val] = i
    return []`,
    },
    easy: {
      title: 'List & String Manipulation',
      explanation:
        'Python lists are dynamic arrays supporting append, extend, slicing, and list comprehensions. Strings are immutable — methods like .split(), .join(), .replace() return new strings. Slicing with [start:stop:step] works on both.',
      complexity: { time: 'O(n) linear', space: 'O(n) linear' },
      code: `def reverse_string(s):
    left, right = 0, len(s) - 1
    chars = list(s)
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
    return ''.join(chars)`,
    },
    medium: {
      title: 'Hash Maps & Set Operations',
      explanation:
        'Python dicts and sets provide O(1) average lookups. Use dict for key-value mapping, set for membership tests. Common patterns: Counter for frequencies, defaultdict for grouped data, and set operations like union, intersection, difference.',
      complexity: { time: 'O(n) average', space: 'O(n) auxiliary' },
      code: `from collections import Counter

def most_frequent(nums, k):
    count = Counter(nums)
    return [num for num, _ in count.most_common(k)]`,
    },
    hard: {
      title: 'Advanced Python — Recursion & DP',
      explanation:
        'Dynamic Programming in Python leverages lru_cache for memoization or builds DP tables bottom-up. Python\'s recursion limit (~1000) means iterative DP is often preferred. Use functools.reduce for accumulative logic and generators for lazy evaluation.',
      complexity: { time: 'O(n²) quadratic', space: 'O(n²) table' },
      code: `from functools import lru_cache

def longest_palindrome(s):
    @lru_cache(None)
    def dp(l, r):
        if l >= r:
            return True
        return s[l] == s[r] and dp(l + 1, r - 1)

    start, max_len = 0, 1
    for i in range(len(s)):
        for j in range(i, len(s)):
            if dp(i, j) and j - i + 1 > max_len:
                start, max_len = i, j - i + 1
    return s[start:start + max_len]`,
    },
  },
  java: {
    basic: {
      title: 'Classes & Static Methods',
      explanation:
        'Java is statically typed — every variable must declare its type. Methods belong to classes; static methods can be called without an instance. The main method is the entry point. Use System.out.println() for output.',
      complexity: { time: 'O(n) linear', space: 'O(1) constant' },
      code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
    },
    easy: {
      title: 'Arrays & StringBuilders',
      explanation:
        'Java arrays have fixed length; ArrayList is the dynamic counterpart. StringBuilder is preferred over String concatenation in loops for O(n) vs O(n²) performance. String methods include charAt(), substring(), indexOf(), and toCharArray().',
      complexity: { time: 'O(n) linear', space: 'O(n) linear' },
      code: `class Solution {
    public String mergeAlternately(String word1, String word2) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < word1.length() || i < word2.length()) {
            if (i < word1.length()) sb.append(word1.charAt(i));
            if (i < word2.length()) sb.append(word2.charAt(i));
            i++;
        }
        return sb.toString();
    }
}`,
    },
    medium: {
      title: 'Collections Framework',
      explanation:
        'Java Collections Framework provides List, Set, Queue, and Map interfaces. HashMap offers O(1) put/get. PriorityQueue implements a heap (min by default). TreeMap/TreeSet maintain sorted order. Use Collections.sort() for list sorting.',
      complexity: { time: 'O(n log n)', space: 'O(n) auxiliary' },
      code: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int n : nums) freq.put(n, freq.getOrDefault(n, 0) + 1);
        
        PriorityQueue<Integer> heap = new PriorityQueue<>(
            (a, b) -> freq.get(a) - freq.get(b));
        for (int key : freq.keySet()) {
            heap.offer(key);
            if (heap.size() > k) heap.poll();
        }
        int[] res = new int[k];
        for (int i = 0; i < k; i++) res[i] = heap.poll();
        return res;
    }
}`,
    },
    hard: {
      title: 'Advanced OOP & Recursion',
      explanation:
        'Java recursion requires careful base-case handling. For DP, use arrays or memoization with HashMap<Integer, Integer>. Java\'s Stream API can express functional pipelines. Watch for stack overflow — iterative DP is safer for large inputs.',
      complexity: { time: 'O(2ⁿ) exponential', space: 'O(n) call stack' },
      code: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int[] dp = new int[n + 1];
        dp[1] = 1; dp[2] = 2;
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }
}`,
    },
  },
  cpp: {
    basic: {
      title: 'Functions & Vectors',
      explanation:
        'C++ offers manual memory control via pointers and references. std::vector is the dynamic array of choice. Pass by reference (&) to avoid copies. Use auto for type inference. cout and cin handle I/O. Functions must declare return types.',
      complexity: { time: 'O(n) linear', space: 'O(1) constant' },
      code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
    },
    easy: {
      title: 'Strings & Streams',
      explanation:
        'C++ std::string is mutable and offers find(), substr(), and the + operator. std::stringstream enables tokenization. Character operations via <cctype> (isalpha, isdigit, tolower). Two-pointer techniques are common for in-place string manipulation.',
      complexity: { time: 'O(n) linear', space: 'O(n) linear' },
      code: `class Solution {
public:
    bool isPalindrome(string s) {
        int l = 0, r = s.size() - 1;
        while (l < r) {
            while (l < r && !isalnum(s[l])) l++;
            while (l < r && !isalnum(s[r])) r--;
            if (tolower(s[l]) != tolower(s[r])) return false;
            l++; r--;
        }
        return true;
    }
};`,
    },
    medium: {
      title: 'STL Containers & Algorithms',
      explanation:
        'C++ STL provides containers: unordered_map (hash), map (BST), set, priority_queue (heap), and algorithms: sort, lower_bound, binary_search. std::greater<> changes sort order. Lambda expressions [&](int x){ return x > 0; } enable inline predicates.',
      complexity: { time: 'O(n log n)', space: 'O(n) auxiliary' },
      code: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int n : nums) freq[n]++;
        
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> heap;
        for (auto& [num, count] : freq) {
            heap.push({count, num});
            if (heap.size() > k) heap.pop();
        }
        vector<int> res;
        while (!heap.empty()) {
            res.push_back(heap.top().second);
            heap.pop();
        }
        return res;
    }
};`,
    },
    hard: {
      title: 'Pointers & Dynamic Programming',
      explanation:
        'C++ raw pointers and smart pointers (unique_ptr, shared_ptr) manage dynamic memory. For DP, prefer vector<int> dp(n+1) over recursion to avoid stack overflow. The const keyword and & references are critical for safe, performant code.',
      complexity: { time: 'O(n²) quadratic', space: 'O(n) linear' },
      code: `class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return tails.size();
    }
};`,
    },
  },
  javascript: {
    basic: {
      title: 'Functions & Array Methods',
      explanation:
        'JavaScript is dynamically typed with first-class functions. Array methods like map(), filter(), reduce(), and forEach() enable declarative data manipulation. Use const/let over var. Arrow functions () => {} provide lexical this binding.',
      complexity: { time: 'O(n) linear', space: 'O(1) constant' },
      code: `var twoSum = function(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
};`,
    },
    easy: {
      title: 'String & Object Patterns',
      explanation:
        'JavaScript strings are immutable; common methods: slice(), split(), includes(), trim(). Object literals {} serve as maps/dictionaries (use Map for non-string keys). Spread operator ... and destructuring { a, b } = obj simplify data access.',
      complexity: { time: 'O(n) linear', space: 'O(n) linear' },
      code: `var isPalindrome = function(s) {
    s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let l = 0, r = s.length - 1;
    while (l < r) {
        if (s[l] !== s[r]) return false;
        l++; r--;
    }
    return true;
};`,
    },
    medium: {
      title: 'Closures & Async Patterns',
      explanation:
        'JavaScript closures capture surrounding state. Promises and async/await handle asynchronous flow. Array.sort() with custom comparator (a, b) => a - b sorts numerically. The spread operator ... clones arrays/objects shallowly.',
      complexity: { time: 'O(n log n)', space: 'O(n) auxiliary' },
      code: `var topKFrequent = function(nums, k) {
    const freq = new Map();
    for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
    
    return [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, k)
        .map(entry => entry[0]);
};`,
    },
    hard: {
      title: 'Prototypes & DP Patterns',
      explanation:
        'JavaScript uses prototypal inheritance — every object has a [[Prototype]] chain. For DP, use arrays or memoization closures. BigInt handles large integers past Number.MAX_SAFE_INTEGER. Reduce for accumulations; generator functions for lazy iteration.',
      complexity: { time: 'O(n²) quadratic', space: 'O(n) linear' },
      code: `var longestPalindrome = function(s) {
    let start = 0, maxLen = 1;
    function expand(l, r) {
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            if (r - l + 1 > maxLen) {
                start = l;
                maxLen = r - l + 1;
            }
            l--; r++;
        }
    }
    for (let i = 0; i < s.length; i++) {
        expand(i, i);
        expand(i, i + 1);
    }
    return s.substring(start, start + maxLen);
};`,
    },
  },
};

export default function PracticeArenaPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    }>
      <PracticeArenaContent />
    </Suspense>
  );
}

function PracticeArenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { solvedIds, toggleProblemCompletion } = useGameState();

  const [activeLanguage, setActiveLanguage] = useState<string>('python');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'acceptance' | 'difficulty'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('codenode_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const lang = searchParams.get('lang');
    if (lang && LANGUAGE_CONFIG[lang]) {
      setActiveLanguage(lang);
    }
  }, [searchParams]);

  const handleLanguageChange = (slug: string) => {
    setActiveLanguage(slug);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', slug);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDifficultyChange = (tier: string) => {
    setActiveDifficulty(tier);
    setCurrentPage(1);
  };

  const toggleBookmark = (id: number) => {
    let current = [...bookmarks];
    if (current.includes(id)) {
      current = current.filter(x => x !== id);
    } else {
      current.push(id);
    }
    setBookmarks(current);
    localStorage.setItem('codenode_bookmarks', JSON.stringify(current));
  };

  const solvedProblemIds = useMemo(() => solvedIds || [], [solvedIds]);

  const curatedIds = useMemo(() => {
    const tracks = CURATED_TRACKS[activeLanguage];
    if (!tracks) return null;
    return tracks[activeDifficulty] ?? null;
  }, [activeLanguage, activeDifficulty]);

  const filteredProblems = useMemo(() => {
    let problems = PROBLEMS_DATA;

    if (curatedIds) {
      const idSet = new Set(curatedIds);
      problems = problems.filter(p => idSet.has(p.id));
    }

    return problems.filter((prob) => {
      const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prob.id.toString() === searchTerm.trim();
      const matchesTopic = !selectedTopic || prob.topics.includes(selectedTopic);
      const matchesCategory = selectedCategory === 'All Topics' || prob.category === selectedCategory;

      return matchesSearch && matchesTopic && matchesCategory;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'id') {
        comparison = a.id - b.id;
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'acceptance') {
        comparison = parseFloat(a.acceptance) - parseFloat(b.acceptance);
      } else if (sortBy === 'difficulty') {
        const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        comparison = order[a.difficulty] - order[b.difficulty];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [curatedIds, searchTerm, selectedTopic, selectedCategory, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE));
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
    return filteredProblems.slice(start, start + PROBLEMS_PER_PAGE);
  }, [filteredProblems, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, -1, totalPages];
    if (currentPage >= totalPages - 3) return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages];
  }, [currentPage, totalPages]);

  const handleSort = (field: 'id' | 'title' | 'acceptance' | 'difficulty') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const onSelectProblem = (id: number) => {
    router.push(`/problems/${id}?lang=${activeLanguage}`);
  };

  const langConfig = LANGUAGE_CONFIG[activeLanguage];
  const langDisplay = langConfig?.label ?? activeLanguage;
  const tierLabel = DIFFICULTY_TIERS.find(t => t.key === activeDifficulty)?.label ?? activeDifficulty;
  const concept = CONCEPT_LIBRARY[activeLanguage]?.[activeDifficulty];

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
      <div className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col gap-6 select-none font-sans">

        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold font-mono uppercase text-primary tracking-wider">
            Student Test Arena
          </span>
          <h1 className="text-2xl font-black text-text-main tracking-tight">Practice Arena</h1>
          <p className="text-xs text-text-muted font-semibold">
            Solve curated algorithm and database challenges to level up your engineering skills.
          </p>
        </div>

        {/* Language Pill Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {Object.entries(LANGUAGE_CONFIG).map(([slug, cfg]) => {
            const isActive = activeLanguage === slug;
            return (
              <button
                key={slug}
                onClick={() => handleLanguageChange(slug)}
                className={`px-4 py-2 rounded-[10px] text-[12px] font-bold font-mono tracking-tight border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                    : 'bg-bg-card text-text-muted border-border-card hover:border-primary/40 hover:text-text-main hover:-translate-y-0.5'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5">
          {DIFFICULTY_TIERS.map((tier) => {
            const isActive = activeDifficulty === tier.key;
            return (
              <button
                key={tier.key}
                onClick={() => handleDifficultyChange(tier.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-bg-base text-text-muted border-border-card/70 hover:bg-hover/40 hover:text-text-main'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
          <span className="ml-auto text-[10px] font-mono font-bold text-text-muted">
            {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Concept Quick Read Panel */}
        {concept && (
          <div className="bg-bg-card border border-border-card rounded-xl shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border-card/50">
              {/* Concept Explanation */}
              <div className="lg:col-span-2 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-main">
                    Concept Quick Read
                  </h3>
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-text-main mb-1.5">{concept.title}</h4>
                  <p className="text-[11.5px] text-text-muted leading-relaxed font-medium">
                    {concept.explanation}
                  </p>
                </div>
              </div>

              {/* Complexity Metrics */}
              <div className="lg:col-span-1 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-main">
                    Complexity
                  </h3>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Time</span>
                    <span className="text-[11px] font-mono font-bold text-text-main">{concept.complexity.time}</span>
                  </div>
                  <div className="w-full h-px bg-border-card/40" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Space</span>
                    <span className="text-[11px] font-mono font-bold text-text-main">{concept.complexity.space}</span>
                  </div>
                </div>
              </div>

              {/* Code Preview */}
              <div className="lg:col-span-2 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-main">
                    Code Preview &mdash; {langDisplay}
                  </h3>
                </div>
                <div className="bg-hover/50 border border-border-card/40 rounded-lg overflow-hidden">
                  <pre className="p-4 text-[11px] font-mono leading-relaxed text-text-main overflow-x-auto whitespace-pre">
                    {concept.code}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card p-4 rounded-xl border border-border-card shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {['All Topics', 'Algorithms', 'Data Structures', 'Database'].map((category) => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                className={`text-[11px] font-mono font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-bg-base text-text-muted border-border-card/70 hover:bg-hover/40'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-bg-base border border-border-card focus:border-primary/45 focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-main"
              />
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-bg-card border border-border-card rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-border-card bg-bg-base/20">
            <span className="text-[11px] font-mono font-bold text-text-main">
              {langDisplay} &mdash; {tierLabel} Problems
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-border-card bg-bg-base/30 text-text-muted text-[10px] font-mono font-bold uppercase select-none">
                  <th className="py-3.5 px-4 w-14 text-center">Status</th>
                  <th className="py-3.5 px-4 w-14 text-center">Bookmark</th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort('title')}>Title</th>
                  <th className="py-3.5 px-4 cursor-pointer text-center w-28" onClick={() => handleSort('difficulty')}>Difficulty</th>
                  <th className="py-3.5 px-4 cursor-pointer text-center w-28" onClick={() => handleSort('acceptance')}>Acceptance</th>
                  <th className="py-3.5 px-4 w-28 text-center">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/30">
                {paginatedProblems.length > 0 ? (
                  paginatedProblems.map((prob) => {
                    const isSolved = solvedProblemIds.includes(prob.id);
                    return (
                      <tr
                        key={prob.id}
                        onClick={() => onSelectProblem(prob.id)}
                        className="hover:bg-hover/20 border-b border-border-card/20 last:border-0 transition-all duration-100 group cursor-pointer"
                      >
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProblemCompletion(prob.id);
                          }}
                        >
                          <div className="flex items-center justify-center cursor-pointer">
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-border-card hover:border-primary transition-colors" />
                            )}
                          </div>
                        </td>
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(prob.id);
                          }}
                        >
                          <div className="flex items-center justify-center cursor-pointer">
                            <Star className={`w-4 h-4 transition-colors ${
                              bookmarks.includes(prob.id) ? 'text-yellow-500 fill-yellow-500' : 'text-text-muted hover:text-yellow-500'
                            }`} />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[12.5px] font-bold text-text-main group-hover:text-primary transition-colors">
                            {prob.id}. {prob.title}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard'}>
                            {prob.difficulty}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[11px] text-text-muted">
                          {prob.acceptance}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[9.5px] font-mono font-bold text-text-muted bg-hover/40 px-2 py-0.5 rounded border border-border-card/45">
                            {prob.category}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-text-muted">
                      No challenges found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-card px-4 py-3 bg-bg-base/20 select-none">
              <span className="text-[10px] font-mono text-text-muted font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 rounded border border-border-card bg-bg-card text-text-main hover:bg-hover text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Prev
                </button>
                {pageNumbers.map((num, i) => (
                  <button
                    key={i}
                    disabled={num === -1 || num === -2}
                    onClick={() => num > 0 && setCurrentPage(num)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      num === currentPage
                        ? 'bg-primary text-white border border-primary'
                        : num < 0
                          ? 'text-text-muted border-0 cursor-default'
                          : 'border border-border-card bg-bg-card text-text-main hover:bg-hover cursor-pointer'
                    }`}
                  >
                    {num < 0 ? '...' : num}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1 rounded border border-border-card bg-bg-card text-text-main hover:bg-hover text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
