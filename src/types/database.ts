export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  college: string | null;
  created_at: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: string;
  verdict: 'pending' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded';
  runtime_ms: number | null;
  created_at: string;
}

export interface UserStats {
  total_solved: number;
  solved_easy: number;
  solved_medium: number;
  solved_hard: number;
  total_submissions: number;
  acceptance_rate: number;
}
