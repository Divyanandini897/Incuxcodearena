/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Category = 'All Topics' | 'Algorithms' | 'Database' | 'Shell' | 'Concurrency';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Testcase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  acceptance: string;
  solved: boolean;
  category: 'Algorithms' | 'Database' | 'Shell' | 'Concurrency';
  topics: string[];
  companies: { name: string; frequency: number }[];
  description: string;
  examples: Example[];
  starterCode: {
    [language: string]: string;
  };
  testcases: Testcase[];
}

export interface EvaluationResult {
  status: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Runtime Error' | 'Time Limit Exceeded';
  compileError?: string;
  passedCount?: number;
  totalCount?: number;
  runtime?: string;
  memory?: string;
  testResults?: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    stdout?: string;
  }[];
}

export interface EditorialResponse {
  approach: string;
  complexity: string;
  codeSolution: string;
}

export interface HintResponse {
  hint: string;
}
