create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.favorite_cards (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null,
  favorite boolean not null default true,
  changed_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create table if not exists public.study_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  study_date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, study_date)
);

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_lesson_id text,
  last_lesson_changed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists lesson_completions_completed_at_idx
  on public.lesson_completions (user_id, completed_at desc);
create index if not exists quiz_attempts_answered_at_idx
  on public.quiz_attempts (user_id, answered_at desc);
create index if not exists favorite_cards_changed_at_idx
  on public.favorite_cards (user_id, changed_at desc);
create index if not exists study_days_created_at_idx
  on public.study_days (user_id, created_at desc);
alter table public.profiles enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.favorite_cards enable row level security;
alter table public.study_days enable row level security;
alter table public.user_state enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists lesson_completions_select_own on public.lesson_completions;
create policy lesson_completions_select_own
  on public.lesson_completions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists lesson_completions_insert_own on public.lesson_completions;
create policy lesson_completions_insert_own
  on public.lesson_completions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists lesson_completions_update_own on public.lesson_completions;
create policy lesson_completions_update_own
  on public.lesson_completions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists lesson_completions_delete_own on public.lesson_completions;
create policy lesson_completions_delete_own
  on public.lesson_completions
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists quiz_attempts_select_own on public.quiz_attempts;
create policy quiz_attempts_select_own
  on public.quiz_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists quiz_attempts_insert_own on public.quiz_attempts;
create policy quiz_attempts_insert_own
  on public.quiz_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists quiz_attempts_update_own on public.quiz_attempts;
create policy quiz_attempts_update_own
  on public.quiz_attempts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists quiz_attempts_delete_own on public.quiz_attempts;
create policy quiz_attempts_delete_own
  on public.quiz_attempts
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists favorite_cards_select_own on public.favorite_cards;
create policy favorite_cards_select_own
  on public.favorite_cards
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists favorite_cards_insert_own on public.favorite_cards;
create policy favorite_cards_insert_own
  on public.favorite_cards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists favorite_cards_update_own on public.favorite_cards;
create policy favorite_cards_update_own
  on public.favorite_cards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists favorite_cards_delete_own on public.favorite_cards;
create policy favorite_cards_delete_own
  on public.favorite_cards
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists study_days_select_own on public.study_days;
create policy study_days_select_own
  on public.study_days
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists study_days_insert_own on public.study_days;
create policy study_days_insert_own
  on public.study_days
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists study_days_update_own on public.study_days;
create policy study_days_update_own
  on public.study_days
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists study_days_delete_own on public.study_days;
create policy study_days_delete_own
  on public.study_days
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_state_select_own on public.user_state;
create policy user_state_select_own
  on public.user_state
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_state_insert_own on public.user_state;
create policy user_state_insert_own
  on public.user_state
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists user_state_update_own on public.user_state;
create policy user_state_update_own
  on public.user_state
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_state_delete_own on public.user_state;
create policy user_state_delete_own
  on public.user_state
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

revoke all on table
  public.profiles,
  public.lesson_completions,
  public.quiz_attempts,
  public.favorite_cards,
  public.study_days,
  public.user_state
from public, anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table
  public.profiles,
  public.lesson_completions,
  public.quiz_attempts,
  public.favorite_cards,
  public.study_days,
  public.user_state
to authenticated;
