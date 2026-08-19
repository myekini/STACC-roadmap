-- Per-user, per-task cooldown and hourly cap on "Check my work" attempts
-- (docs/ARCHITECTURE.md operational guardrail: "Rate-limit project
-- verification per user and task" — never implemented until now). Protects
-- the GitHub installation-token/commit-fetch path from being hammered by
-- repeated clicks, independent of any platform-level IP rate limiting.

create table if not exists public.verification_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  attempted_at timestamptz not null default now(),
  window_started_at timestamptz not null default now(),
  attempts_in_window int not null default 0,
  primary key (user_id, task_id)
);

alter table public.verification_attempts enable row level security;

create policy "read own verification attempts" on public.verification_attempts
  for select using (user_id = auth.uid() or public.is_admin());
