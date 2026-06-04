create table if not exists public.question_history (
  id uuid primary key default gen_random_uuid(),
  quiz_date date not null,
  set_id uuid references public.daily_sets(id) on delete set null,
  source text not null check (source in ('openai', 'fallback')),
  position int not null check (position between 1 and 5),
  prompt text not null,
  normalized_prompt text not null unique,
  choices jsonb,
  correct_choice int check (correct_choice between 0 and 3),
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists question_history_quiz_date_idx on public.question_history (quiz_date desc);
create index if not exists question_history_set_id_idx on public.question_history (set_id);

alter table public.question_history enable row level security;

revoke all on public.question_history from anon, authenticated;

insert into public.question_history (
  quiz_date,
  set_id,
  source,
  position,
  prompt,
  normalized_prompt,
  choices,
  correct_choice,
  explanation,
  created_at
)
select
  daily_sets.quiz_date,
  questions.set_id,
  daily_sets.source,
  questions.position,
  questions.prompt,
  trim(regexp_replace(regexp_replace(lower(questions.prompt), '[^a-z0-9[:space:]]', ' ', 'g'), '[[:space:]]+', ' ', 'g')),
  questions.choices,
  questions.correct_choice,
  questions.explanation,
  questions.created_at
from public.questions
join public.daily_sets on daily_sets.id = questions.set_id
where daily_sets.generation_status in ('ready', 'pending')
on conflict (normalized_prompt) do nothing;
