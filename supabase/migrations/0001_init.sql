create extension if not exists "pgcrypto";

create table public.daily_sets (
  id uuid primary key default gen_random_uuid(),
  quiz_date date not null unique,
  source text not null check (source in ('openai', 'fallback')),
  generation_status text not null default 'ready' check (generation_status in ('ready', 'failed')),
  generation_error text,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.daily_sets(id) on delete cascade,
  position int not null check (position between 1 and 5),
  prompt text not null,
  choices jsonb not null,
  correct_choice int not null check (correct_choice between 0 and 3),
  explanation text not null,
  created_at timestamptz not null default now(),
  unique (set_id, position),
  constraint choices_is_four_strings check (
    jsonb_typeof(choices) = 'array'
    and jsonb_array_length(choices) = 4
    and jsonb_typeof(choices->0) = 'string'
    and jsonb_typeof(choices->1) = 'string'
    and jsonb_typeof(choices->2) = 'string'
    and jsonb_typeof(choices->3) = 'string'
  )
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null,
  player_name text not null,
  set_id uuid not null references public.daily_sets(id) on delete cascade,
  answers jsonb not null,
  score int not null check (score between 0 and 5),
  completed_at timestamptz not null default now(),
  unique (player_id, set_id),
  constraint answers_is_five_ints check (
    jsonb_typeof(answers) = 'array'
    and jsonb_array_length(answers) = 5
  )
);

create index attempts_completed_at_idx on public.attempts (completed_at desc);
create index attempts_player_id_idx on public.attempts (player_id);
create index daily_sets_quiz_date_idx on public.daily_sets (quiz_date desc);
create index questions_set_id_position_idx on public.questions (set_id, position);

alter table public.daily_sets enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;

create policy "daily sets are readable" on public.daily_sets
  for select using (true);

revoke insert, update, delete on public.daily_sets from anon, authenticated;
revoke insert, update, delete on public.questions from anon, authenticated;
revoke insert, update, delete on public.attempts from anon, authenticated;
