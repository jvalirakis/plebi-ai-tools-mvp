alter table public.tools
  add column if not exists best_for text not null default '';
