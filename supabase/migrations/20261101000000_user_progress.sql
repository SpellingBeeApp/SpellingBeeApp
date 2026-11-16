-- Individual-user accounts and their practice progress.
--
-- Scope: this migration covers a single signed-in user's own data only —
-- the same account type whether they're a self-directed learner or (later)
-- a teacher. Classrooms and the class-code+PIN student login are a
-- separate, additive layer that will come in a later migration once this
-- is live; nothing here assumes a classroom exists.
--
-- Table shapes mirror the existing localStorage `PracticeProgress` object
-- (frontend/types/PracticeWord.ts) as real relational rows rather than
-- JSON blobs, so cross-user queries (e.g. later teacher-facing "which
-- words does my class miss most") can be plain SQL instead of client-side
-- merging. See the spellingbee-backend-auth-plan project notes for why.

-- One row per signed-in user, keyed to Supabase's built-in auth.users.
-- Holds the few plain counters from PracticeProgress that aren't
-- per-word/per-unit rows (sessionsCompleted, wordsMastered).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  sessions_completed integer not null default 0,
  words_mastered integer not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row the moment someone signs up, so the app never
-- has to special-case "user exists in auth but has no profile yet."
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- One row per (user, word) — the Leitner box state. Mirrors
-- PracticeProgress.wordBoxes[word] (frontend/helpers/practiceProgress.ts).
create table public.word_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  word text not null,
  box integer not null default 1,
  due_at timestamptz not null default now(),
  count integer not null default 0,
  last_seen timestamptz not null default now(),
  unique (user_id, word)
);

create index word_progress_due_lookup
  on public.word_progress (user_id, due_at);

-- One row per (user, curriculum unit) completed. Mirrors
-- PracticeProgress.completedUnitIds. unit_id is the same string id the
-- frontend computes in helpers/curriculum.ts (e.g. "3-1") — the curriculum
-- itself isn't stored in the database, only completion state against it.
create table public.completed_units (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  unit_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, unit_id)
);

-- One row per quiz attempt. Mirrors PracticeProgress.history[], kept as
-- full history (no MAX_HISTORY trim like the localStorage version) since a
-- real database doesn't need the same unbounded-growth guardrail.
create table public.attempt_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  word text not null,
  grade integer not null,
  difficulty text not null,
  correct boolean not null,
  mistake_type text,
  created_at timestamptz not null default now()
);

create index attempt_history_user_time
  on public.attempt_history (user_id, created_at desc);

-- Row Level Security: every table is scoped to auth.uid() = user_id (or
-- = id for profiles), so a signed-in user can only ever see or write their
-- own rows. This is the whole reason Supabase was picked over hand-rolling
-- auth checks per endpoint — it holds even as more tables/endpoints get
-- added later for classrooms/teachers.

alter table public.profiles enable row level security;
alter table public.word_progress enable row level security;
alter table public.completed_units enable row level security;
alter table public.attempt_history enable row level security;

create policy "Users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage their own word progress"
  on public.word_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own completed units"
  on public.completed_units for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own attempt history"
  on public.attempt_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
