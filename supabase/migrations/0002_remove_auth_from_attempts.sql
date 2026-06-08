alter table public.attempts
  add column if not exists player_id uuid,
  add column if not exists player_name text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attempts'
      and column_name = 'user_id'
  ) then
    update public.attempts
    set
      player_id = coalesce(player_id, user_id),
      player_name = coalesce(player_name, 'Guest ' || upper(left(coalesce(user_id::text, id::text), 4)))
    where player_id is null or player_name is null;
  else
    update public.attempts
    set
      player_id = coalesce(player_id, id),
      player_name = coalesce(player_name, 'Guest ' || upper(left(coalesce(player_id::text, id::text), 4)))
    where player_id is null or player_name is null;
  end if;
end $$;

alter table public.attempts
  alter column player_id set not null,
  alter column player_name set not null;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'attempts_user_id_set_id_key'
  ) then
    alter table public.attempts drop constraint attempts_user_id_set_id_key;
  end if;
end $$;


do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'attempts_user_id_fkey'
  ) then
    alter table public.attempts drop constraint attempts_user_id_fkey;
  end if;
end $$;

drop index if exists public.attempts_user_id_idx;

alter table public.attempts
  drop column if exists user_id;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_player_id_set_id_key'
  ) then
    alter table public.attempts
      add constraint attempts_player_id_set_id_key unique (player_id, set_id);
  end if;
end $$;

create index if not exists attempts_player_id_idx on public.attempts (player_id);

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles;
