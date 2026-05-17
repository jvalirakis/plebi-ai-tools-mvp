do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'poll_votes'
      and policyname = 'Users can read own poll votes'
  ) then
    create policy "Users can read own poll votes" on public.poll_votes
      for select to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

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
