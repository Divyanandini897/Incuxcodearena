-- ════════════════════════════════════════════════════════════════
-- Run this in your Supabase project's SQL Editor:
--   https://supabase.com/dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════
-- Creates / updates the profiles and otps tables.
-- ════════════════════════════════════════════════════════════════

-- 1. Profiles table (app-level user data, linked to auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text not null,
  username    text unique,
  avatar_url  text,
  bio         text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. OTPs table (short-lived verification codes)
create table if not exists public.otps (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  otp_hash    text not null,
  type        text not null default 'signup',
  temp_data   jsonb,
  expires_at  timestamptz not null,
  used        boolean default false,
  created_at  timestamptz default now()
);

create index if not exists idx_otps_email_type on public.otps(email, type);

-- 3. Enable Row-Level Security
alter table public.profiles enable row level security;
alter table public.otps enable row level security;

-- 4. RLS policies for profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Allow service_role to bypass RLS (needed for OAuth and OTP flows)
drop policy if exists "Service role full access" on public.profiles;
create policy "Service role full access"
  on public.profiles for all
  using (true)
  with check (true);

-- 5. No public OTP access
drop policy if exists "No public OTP access" on public.otps;
create policy "No public OTP access"
  on public.otps for all
  using (false);

-- 6. Auto-update updated_at on profile changes
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();
