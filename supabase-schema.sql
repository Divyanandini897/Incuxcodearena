-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- ════════════════════════════════════════════════════════════════
-- Creates profiles and otps tables for the custom auth flow.
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
  otp_hash    text not null,              -- SHA-256 hash of the 6-digit OTP
  type        text not null default 'signup',
  temp_data   jsonb,                       -- { name, password } (plaintext, 5-min TTL)
  expires_at  timestamptz not null,
  used        boolean default false,
  created_at  timestamptz default now()
);

-- Index for fast OTP lookups
create index if not exists idx_otps_email_type on public.otps(email, type);

-- 3. Enable Row-Level Security (default: only service_role can write)
alter table public.profiles enable row level security;
alter table public.otps enable row level security;

-- 4. Allow authenticated users to read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 5. Allow authenticated users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 6. Disable OTP access from the client entirely (only server-side service_role)
create policy "No public OTP access"
  on public.otps for all
  using (false);
