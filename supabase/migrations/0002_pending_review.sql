alter table public.daily_sets
  drop constraint daily_sets_generation_status_check;

alter table public.daily_sets
  add constraint daily_sets_generation_status_check
  check (generation_status in ('ready', 'pending', 'failed'));
