alter table public.tools
  add column if not exists last_verified_at date,
  add column if not exists freshness_status text not null default 'seed_only',
  add column if not exists evidence_status text not null default 'manual_seed';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tools_freshness_status_check'
  ) then
    alter table public.tools
      add constraint tools_freshness_status_check
      check (freshness_status in ('current', 'needs_review', 'stale', 'seed_only'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'tools_evidence_status_check'
  ) then
    alter table public.tools
      add constraint tools_evidence_status_check
      check (evidence_status in ('source_verified', 'partially_verified', 'manual_seed', 'insufficient_evidence'));
  end if;
end $$;

alter table public.source_observations
  add column if not exists evidence_url text;

alter table public.score_snapshots
  add column if not exists snapshot_date date;

update public.score_snapshots
set snapshot_date = captured_at
where snapshot_date is null;

alter table public.score_snapshots
  alter column snapshot_date set default current_date,
  alter column snapshot_date set not null;
