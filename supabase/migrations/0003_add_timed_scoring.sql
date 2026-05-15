alter table public.attempts
  add column if not exists correct_count int,
  add column if not exists duration_seconds int,
  add column if not exists total_score int;

update public.attempts
set
  correct_count = coalesce(correct_count, score),
  duration_seconds = coalesce(duration_seconds, 0),
  total_score = coalesce(total_score, score * 1000)
where correct_count is null
   or duration_seconds is null
   or total_score is null;

alter table public.attempts
  alter column correct_count set not null,
  alter column duration_seconds set not null,
  alter column total_score set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_correct_count_check'
  ) then
    alter table public.attempts
      add constraint attempts_correct_count_check check (correct_count between 0 and 5);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_duration_seconds_check'
  ) then
    alter table public.attempts
      add constraint attempts_duration_seconds_check check (duration_seconds >= 0 and duration_seconds <= 3600);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_total_score_check'
  ) then
    alter table public.attempts
      add constraint attempts_total_score_check check (total_score >= 0);
  end if;
end $$;

create index if not exists attempts_total_score_idx on public.attempts (total_score desc);
