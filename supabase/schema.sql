create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  subcategories text[] not null default '{}',
  signal text not null default '',
  benchmark text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  subcategory text not null,
  tagline text not null,
  summary text not null,
  best_for text not null default '',
  website text not null,
  pricing text not null,
  founded text not null,
  stage text not null check (stage in ('Emerging', 'Scaling', 'Established')),
  last_verified_at date,
  freshness_status text not null default 'seed_only' check (freshness_status in ('current', 'needs_review', 'stale', 'seed_only')),
  evidence_status text not null default 'manual_seed' check (evidence_status in ('source_verified', 'partially_verified', 'manual_seed', 'insufficient_evidence')),
  metrics jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('benchmark', 'review', 'community', 'pricing', 'security')),
  url text not null,
  weight numeric not null check (weight >= 0 and weight <= 1),
  credibility integer not null check (credibility >= 0 and credibility <= 100),
  created_at timestamptz not null default now()
);

create table if not exists public.source_observations (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  title text not null,
  observed_at date not null,
  score integer not null check (score >= 0 and score <= 100),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  metric_impacts jsonb not null default '{}',
  evidence_url text,
  notes text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.score_snapshots (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete cascade,
  captured_at date not null,
  snapshot_date date not null default current_date,
  score integer not null check (score >= 0 and score <= 100),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null unique references public.tools(id) on delete cascade,
  votes_for integer not null default 0 check (votes_for >= 0),
  votes_against integer not null default 0 check (votes_against >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  vote text not null check (vote in ('for', 'against')),
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'analyst' check (role in ('admin', 'analyst')),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.tools enable row level security;
alter table public.sources enable row level security;
alter table public.source_observations enable row level security;
alter table public.score_snapshots enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.admin_profiles enable row level security;

create policy "Public read categories" on public.categories for select using (true);
create policy "Public read tools" on public.tools for select using (true);
create policy "Public read sources" on public.sources for select using (true);
create policy "Public read observations" on public.source_observations for select using (true);
create policy "Public read score snapshots" on public.score_snapshots for select using (true);
create policy "Public read polls" on public.polls for select using (true);

create policy "Authenticated users can vote" on public.poll_votes
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own poll votes" on public.poll_votes
  for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.apply_poll_vote_to_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.vote = 'for' then
    update public.polls set votes_for = votes_for + 1 where id = new.poll_id;
  else
    update public.polls set votes_against = votes_against + 1 where id = new.poll_id;
  end if;

  return new;
end;
$$;

drop trigger if exists poll_votes_update_poll_counts on public.poll_votes;
create trigger poll_votes_update_poll_counts
  after insert on public.poll_votes
  for each row execute function public.apply_poll_vote_to_counts();

create policy "Admins manage categories" on public.categories
  for all to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'));

create policy "Admins manage tools" on public.tools
  for all to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'));

create policy "Admins manage sources" on public.sources
  for all to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'));

create policy "Admins manage observations" on public.source_observations
  for all to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'));

create policy "Admins manage snapshots" on public.score_snapshots
  for all to authenticated
  using (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin'));
