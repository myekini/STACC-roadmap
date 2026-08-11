-- Connected GitHub projects: one repository per learner and specialization.
-- This migration stores stable repository identity and milestone submissions.
-- GitHub App credentials and installation tokens are never stored here.

alter table public.tasks
  add column if not exists project_requirements jsonb;

alter table public.tasks
  add constraint tasks_project_requirements_object_check
  check (project_requirements is null or jsonb_typeof(project_requirements) = 'object');

alter table public.projects
  add column if not exists github_repo_id bigint,
  add column if not exists repo_owner text,
  add column if not exists repo_name text,
  add column if not exists default_branch text not null default 'main',
  add column if not exists github_installation_id bigint,
  add column if not exists connection_status text not null default 'manual',
  add column if not exists connected_at timestamptz,
  add column if not exists last_synced_at timestamptz;

alter table public.projects
  add constraint projects_connection_status_check
  check (connection_status in ('manual', 'active', 'suspended', 'error'));

create unique index if not exists projects_github_repo_id_idx
  on public.projects (github_repo_id)
  where github_repo_id is not null;

create index if not exists projects_installation_idx
  on public.projects (github_installation_id)
  where github_installation_id is not null;

create unique index if not exists projects_id_user_idx
  on public.projects (id, user_id);

create table public.project_submissions (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  task_id         uuid not null references public.tasks (id) on delete cascade,
  commit_sha      text not null,
  commit_url      text not null,
  branch          text not null,
  status          text not null default 'pending',
  checks          jsonb not null default '{}'::jsonb,
  submitted_at    timestamptz not null default now(),
  verified_at     timestamptz,
  unique (user_id, task_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);

alter table public.project_submissions
  add constraint project_submissions_status_check
  check (status in ('pending', 'verified', 'needs_review', 'rejected'));

create index project_submissions_project_idx
  on public.project_submissions (project_id, submitted_at desc);

create index project_submissions_user_idx
  on public.project_submissions (user_id, submitted_at desc);

alter table public.project_submissions enable row level security;

create policy "read own project submissions"
  on public.project_submissions for select
  using (user_id = auth.uid() or public.is_admin());

-- Writes are intentionally service-only. A future GitHub App endpoint verifies
-- repository access and commit ownership, then writes with the service role.
