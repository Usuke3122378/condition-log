-- 体調の点数の表（F-03・F-07）
-- Supabase の SQL Editor に貼って実行する

create table public.entries (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,                                   -- 日本時間の「その日」
  score smallint not null check (score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)                                -- 1人1日1件
);

-- RLS（行レベルセキュリティ）を有効にする。ルールに当てはまらない行は、読めない・書けない
alter table public.entries enable row level security;

-- 本人だけが読む・書く・直す・消すことができる（ログインしていない人は何もできない）
create policy "本人だけ読める" on public.entries
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "本人だけ追加できる" on public.entries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "本人だけ直せる" on public.entries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "本人だけ消せる" on public.entries
  for delete to authenticated
  using ((select auth.uid()) = user_id);
