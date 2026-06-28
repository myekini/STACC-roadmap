-- ==========================================
-- Schema for Mastery Path - Roadmap Tracker
-- ==========================================

-- 1. Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  avatar_url text,
  xp integer default 100 not null,
  rank text default 'Bronze' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for profiles
alter table public.profiles enable row level security;

create policy "Users can view all profiles" 
  on public.profiles for select 
  using (true);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 2. Create User Paths Table
create table public.user_paths (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  path_id text not null,
  progress integer default 0 not null,
  selected_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user_paths
alter table public.user_paths enable row level security;

create policy "Users can view their own paths" 
  on public.user_paths for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own paths" 
  on public.user_paths for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own paths" 
  on public.user_paths for update 
  using (auth.uid() = user_id);

-- 3. Create Completed Nodes Table
create table public.completed_nodes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  path_id text not null,
  node_id text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, path_id, node_id)
);

-- Enable RLS for completed_nodes
alter table public.completed_nodes enable row level security;

create policy "Users can view their own completed nodes" 
  on public.completed_nodes for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own completed nodes" 
  on public.completed_nodes for insert 
  with check (auth.uid() = user_id);

-- 4. Create User Quests Table
create table public.user_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_title text not null,
  xp_reward integer not null,
  completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user_quests
alter table public.user_quests enable row level security;

create policy "Users can view their own quests" 
  on public.user_quests for select 
  using (auth.uid() = user_id);

create policy "Users can insert/update their own quests" 
  on public.user_quests for all 
  using (auth.uid() = user_id);


-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Trigger to automatically create a profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, xp, rank)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'global_name', new.raw_user_meta_data->>'full_name', 'Scholar'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    100,
    'Bronze'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attach the trigger to auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
