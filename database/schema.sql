-- Run this in the Supabase SQL Editor to set up your tables

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

-- Security: entrepreneurs can only see their own surveys
alter table surveys enable row level security;
create policy "Users see own surveys" on surveys for all using (auth.uid() = user_id);

-- Questions are readable by anyone (needed for public survey links)
alter table questions enable row level security;
create policy "Anyone can read questions" on questions for select using (true);
create policy "Only owner can insert questions" on questions for insert with check (
  exists (select 1 from surveys where surveys.id = survey_id and surveys.user_id = auth.uid())
);

-- Responses: anyone can submit, only the owner can read them
alter table responses enable row level security;
create policy "Anyone can insert response" on responses for insert with check (true);
create policy "Owner can read responses" on responses for select using (
  exists (select 1 from surveys where surveys.id = survey_id and surveys.user_id = auth.uid())
);
