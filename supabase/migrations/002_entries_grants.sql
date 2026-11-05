-- entries を使ってよい人を決める（GRANT）
-- 新しい Supabase プロジェクトでは、新しい表に権限が自動では付かないため、はっきり書く
-- Supabase の SQL Editor に貼って実行する

-- ログインしていない人（anon）：何も許さない（1段目で止める）
revoke all on table public.entries from anon;

-- ログインした人（authenticated）：表を使う権限を付ける。どの行を読める・書けるかは RLS（001）が絞る
grant select, insert, update, delete on table public.entries to authenticated;
