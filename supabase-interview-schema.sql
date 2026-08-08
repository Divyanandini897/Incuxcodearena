-- AI Voice Interview Module — Complete Schema
-- Paste into Supabase SQL Editor and click Run.

-- ============================================================
-- 1. ai_interview_sessions
-- ============================================================
create table if not exists public.ai_interview_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  category      text not null,
  language      text,
  topics        jsonb not null default '[]',
  difficulty    text not null,
  status        text not null default 'in_progress',
  started_at    timestamptz default now(),
  completed_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- 2. ai_interview_questions
-- ============================================================
create table if not exists public.ai_interview_questions (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references public.ai_interview_sessions(id) on delete cascade not null,
  question_text   text not null,
  question_topic  text not null,
  difficulty      text not null,
  user_answer     text,
  score           numeric(5,2),
  feedback        text,
  model_answer    text,
  improvement_tips jsonb default '[]',
  missed_points    jsonb default '[]',
  strengths        jsonb default '[]',
  order_index     integer not null,
  started_at      timestamptz,
  answered_at     timestamptz,
  created_at      timestamptz default now()
);

-- ============================================================
-- 3. ai_interview_answers
-- ============================================================
create table if not exists public.ai_interview_answers (
  id               uuid primary key default gen_random_uuid(),
  question_id      uuid references public.ai_interview_questions(id) on delete cascade not null,
  user_answer      text,
  score            numeric(5,2),
  feedback         text,
  improvement_tips jsonb default '[]',
  missed_points    jsonb default '[]',
  strengths        jsonb default '[]',
  answered_at      timestamptz default now(),
  created_at       timestamptz default now()
);

-- ============================================================
-- 4. ai_interview_reports
-- ============================================================
create table if not exists public.ai_interview_reports (
  id                      uuid primary key default gen_random_uuid(),
  session_id              uuid references public.ai_interview_sessions(id) on delete cascade not null unique,
  user_id                 uuid references public.profiles(id) on delete cascade not null,
  overall_score           numeric(5,2) not null,
  technical_score         numeric(5,2) not null,
  communication_score     numeric(5,2) not null,
  confidence_score        numeric(5,2) not null,
  accuracy_score          numeric(5,2) not null,
  strengths               jsonb default '[]',
  weaknesses              jsonb default '[]',
  topics_to_improve       jsonb default '[]',
  learning_recommendations jsonb default '[]',
  timeline                jsonb default '[]',
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_ai_sessions_user_id    on public.ai_interview_sessions(user_id);
create index if not exists idx_ai_sessions_status     on public.ai_interview_sessions(status);
create index if not exists idx_ai_sessions_created_at on public.ai_interview_sessions(created_at desc);

create index if not exists idx_ai_questions_session_id on public.ai_interview_questions(session_id);
create index if not exists idx_ai_questions_order      on public.ai_interview_questions(session_id, order_index);

create index if not exists idx_ai_answers_question_id on public.ai_interview_answers(question_id);

create index if not exists idx_ai_reports_user_id     on public.ai_interview_reports(user_id);
create index if not exists idx_ai_reports_session_id  on public.ai_interview_reports(session_id);
create index if not exists idx_ai_reports_created_at  on public.ai_interview_reports(created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.ai_interview_sessions  enable row level security;
alter table public.ai_interview_questions enable row level security;
alter table public.ai_interview_answers   enable row level security;
alter table public.ai_interview_reports   enable row level security;

-- ---- ai_interview_sessions ----
create policy "Users can view own sessions"
  on public.ai_interview_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.ai_interview_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.ai_interview_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.ai_interview_sessions for delete
  using (auth.uid() = user_id);

-- ---- ai_interview_questions ----
create policy "Users can view own questions"
  on public.ai_interview_questions for select
  using (
    exists (
      select 1 from public.ai_interview_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert questions to own sessions"
  on public.ai_interview_questions for insert
  with check (
    exists (
      select 1 from public.ai_interview_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can update questions in own sessions"
  on public.ai_interview_questions for update
  using (
    exists (
      select 1 from public.ai_interview_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete questions from own sessions"
  on public.ai_interview_questions for delete
  using (
    exists (
      select 1 from public.ai_interview_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- ---- ai_interview_answers ----
create policy "Users can view own answers"
  on public.ai_interview_answers for select
  using (
    exists (
      select 1 from public.ai_interview_questions q
      join public.ai_interview_sessions s on s.id = q.session_id
      where q.id = question_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert answers to own questions"
  on public.ai_interview_answers for insert
  with check (
    exists (
      select 1 from public.ai_interview_questions q
      join public.ai_interview_sessions s on s.id = q.session_id
      where q.id = question_id and s.user_id = auth.uid()
    )
  );

create policy "Users can update own answers"
  on public.ai_interview_answers for update
  using (
    exists (
      select 1 from public.ai_interview_questions q
      join public.ai_interview_sessions s on s.id = q.session_id
      where q.id = question_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete own answers"
  on public.ai_interview_answers for delete
  using (
    exists (
      select 1 from public.ai_interview_questions q
      join public.ai_interview_sessions s on s.id = q.session_id
      where q.id = question_id and s.user_id = auth.uid()
    )
  );

-- ---- ai_interview_reports ----
create policy "Users can view own reports"
  on public.ai_interview_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on public.ai_interview_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own reports"
  on public.ai_interview_reports for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Auto-update triggers for updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_ai_sessions_updated_at
  before update on public.ai_interview_sessions
  for each row execute function public.set_updated_at();

create trigger set_ai_reports_updated_at
  before update on public.ai_interview_reports
  for each row execute function public.set_updated_at();

