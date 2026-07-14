# Progress Summary

## Goal
Run Judge0 CE 1.13.1 locally via Docker on Windows (WSL2/cgroups v2) and extend the evaluate harness to support linked-list problems (Add Two Numbers) for all four languages.

## Constraints & Preferences
- Must work on Docker Desktop for Windows 11 (WSL2 backend, cgroups v2 only).
- Cannot use the `--cg` flag (isolate cgroups v1 mode); must use rlimit mode instead.
- Node.js requires `enable_per_process_and_thread_* = true` to avoid cgroups, but still crashes (SIGSEGV) under isolate's seccomp filter.
- Java needs elevated `memory_limit` (≥768 MB) plus explicit JVM heap/metaspace/code‑cache flags.
- The wrapper harness must support `ListNode` custom types for linked-list problems.

## Status
**All languages pass both problems:**

| Problem | Language | Status | Runtime |
|---------|----------|--------|---------|
| Two Sum | C++ | ✅ Accepted | 4ms |
| Two Sum | Java | ✅ Accepted | 198ms |
| Two Sum | Python | ✅ Accepted | 104ms |
| Two Sum | JS | ✅ Accepted | 185ms |
| Add Two Numbers | C++ | ✅ Accepted | 5ms |
| Add Two Numbers | Java | ✅ Accepted | 135ms |
| Add Two Numbers | Python | ✅ Accepted | 63ms |
| Add Two Numbers | JS | ✅ Accepted | 150ms |

## Done
- Judge0 containers (db, redis, server, workers) run with `privileged: true` + `/sys/fs/cgroup:ro` mount.
- Workers and server can execute C, C++, Python, Ruby via rlimit mode (no `--cg`).
- Java compiles and runs with: `-J-Xmx64m -J-XX:MaxMetaspaceSize=16m -J-XX:ReservedCodeCacheSize=64m`, submission `memory_limit=768000`.
- Backend updated to send `enable_per_process_and_thread_time_limit: true`, `enable_per_process_and_thread_memory_limit: true`, and `memory_limit: 768000` for Java.
- `judge0.env` corrected to the right env‑var names.
- `JAVA_TOOL_OPTIONS` added to `docker-compose.yml` environment.
- `isolate_job.rb` patched to pass `-E JAVA_TOOL_OPTIONS`.
- Node.js 20.12.2 downloaded/extracted but not needed (JS runs locally via fallback).
- **ListNode support** added to all four wrapper builders in `app/api/evaluate/route.ts`:
  - `toCanonicalType` recognises `ListNode*`, `ListNode`, `Optional[ListNode]`, `number[]`, `number` → canonical types
  - C++ wrapper injects `struct ListNode` if absent outside comments, adds `__makeList`/`__listToStr`
  - Python wrapper injects `class ListNode`, `from typing import List, Optional`, `__makeList`/`__listToStr`
  - Java wrapper injects `static class ListNode`, `__makeList`/`__resultStr`
  - JS wrapper injects `function ListNode` if absent outside JSDoc, `__makeList`/`__listToStr`
- `extractParamTypes` fixed to handle Python type hints and skip `self`/`cls`
- JSDoc regex updated to capture `Type[]` syntax (e.g., `{number[]}`)
- `toCanonicalType` handles `number` → `int` for JS
- JS submissions skip Judge0 entirely (Node.js SIGSEGV in sandbox) — run as local child process

## Blocked
- **Node.js (any version)** under isolate — crashes with `Caught fatal signal 11` (SIGSEGV). JS runs locally as a child process (works fine).

## Key Decisions
- Use rlimit mode instead of cgroups (`--cg`) because Docker Desktop / WSL2 provides cgroups v2.
- Modify Java `compile_cmd` and `run_cmd` in Judge0 DB rather than fighting with per‑process RLIMIT_AS.
- Keep `privileged: true` on both `server` and `workers` containers.
- JS always runs locally (bypassing Judge0); all other languages go through Judge0.
- Inject `from typing import List, Optional` unconditionally for Python.

## Relevant Files
- `H:\leetcode-platform\docker-compose.yml` — Judge0 service definitions
- `H:\leetcode-platform\judge0.env` — Judge0 application config
- `H:\leetcode-platform\app\api\evaluate\route.ts` — Main evaluate endpoint (wrapper generators, Judge0 client, local fallback)
- `H:\leetcode-platform\app\api\evaluate\cache.ts` — Redis caching layer
- `H:\leetcode-platform\.env.local` — Runtime env (points `JUDGE0_API_URL` to `http://localhost:2358`)

## Critical Context
- **Judge0 API** → `http://localhost:2358` (set in `.env.local` as `JUDGE0_API_URL`).
- **cgroups v2** is read‑only — isolate's `--cg` flag fails.
- **Node.js SIGSEGV** — JS runs locally in `runLocal` via `process.execPath`, bypassing Judge0 entirely.
- After `docker compose restart`, the Judge0 DB re-seeds — Java `compile_cmd`/`run_cmd` must be re-applied.
