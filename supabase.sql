-- Выполните в Supabase: SQL Editor -> New query -> Run
create table if not exists quiz_results (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 40),
  score int not null check (score between 0 and 5),
  created_at timestamptz default now()
);

alter table quiz_results enable row level security;

drop policy if exists "anyone can insert" on quiz_results;
drop policy if exists "anyone can read" on quiz_results;

create policy "anyone can insert" on quiz_results
  for insert to anon with check (true);
create policy "anyone can read" on quiz_results
  for select to anon using (true);
