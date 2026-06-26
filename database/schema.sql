-- DemandQ database schema
-- Run this in the Supabase SQL Editor
-- This is the consolidated final version after RLS/grant fixes made during build

create table surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  created_at timestamp default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id) on delete cascade not null,
  question_text text not null,
  question_type text not null check (question_type in ('yes_no', 'multiple_choice', 'short_text')),
  options jsonb,
  position integer not null
);

create table responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id) on delete cascade not null,
  answers jsonb not null,
  submitted_at timestamp default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (controls WHICH ROWS a role can touch)
-- =========================================================

-- surveys: owner has full control, but EVERYONE can read (needed so the
-- public survey link works for logged-out respondents)
alter table surveys enable row level security;

create policy "Anyone can read surveys" on surveys
  for select using (true);

create policy "Users can insert own surveys" on surveys
  for insert with check (auth.uid() = user_id);

create policy "Users can update own surveys" on surveys
  for update using (auth.uid() = user_id);

create policy "Users can delete own surveys" on surveys
  for delete using (auth.uid() = user_id);

-- questions: anyone can read (needed for public survey link),
-- only the survey owner can insert new questions
alter table questions enable row level security;

create policy "Anyone can read questions" on questions
  for select using (true);

create policy "Only owner can insert questions" on questions
  for insert with check (
    exists (select 1 from surveys where surveys.id = survey_id and surveys.user_id = auth.uid())
  );

-- responses: anyone (including anonymous respondents) can insert a response,
-- only the survey owner can read the responses to their own survey
alter table responses enable row level security;

create policy "Anyone can insert response" on responses
  for insert with check (true);

create policy "Owner can read responses" on responses
  for select using (
    exists (select 1 from surveys where surveys.id = survey_id and surveys.user_id = auth.uid())
  );

-- =========================================================
-- GRANTS (controls WHETHER a role can touch the table at all)
-- RLS policies above are not enough on their own — Postgres also
-- requires an explicit GRANT per role, especially for the `anon` role
-- used by logged-out / public respondents.
-- =========================================================

-- anon = logged-out visitors (public survey page)
grant select on public.surveys   to anon;
grant select on public.questions to anon;
grant insert on public.responses to anon;

-- authenticated = the logged-in entrepreneur
grant select, insert, update, delete on public.surveys   to authenticated;
grant select, insert                 on public.questions to authenticated;
grant insert                         on public.responses to authenticated;
-- note: authenticated deliberately does NOT get update/delete on responses —
-- nobody should be able to edit or remove a submitted response, including the owner