// ログインしていない人が entries を読めない・書けないことを確かめる（付録F の「ログインしていない人」版）
// 実行：node --env-file=.env.local scripts/check-rls.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("✗ .env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY を入れてください");
  process.exit(1);
}

// 公開用キーだけで接続する（＝ログインしていない人と同じ立場）
const supabase = createClient(url, key, { auth: { persistSession: false } });
let ok = true;

// 1. 読む → 「権限がない」で断られる（1段目の GRANT で止まる）か、0件（2段目の RLS で何も返らない）になるはず
const read = await supabase.from("entries").select("*");
if (read.error) {
  const denied = read.error.code === "42501";
  console.log(`${denied ? "✓" : "?"} 読む：断られた（${read.error.code} ${read.error.message}）`);
  ok &&= denied;
} else {
  console.log(`${read.data.length === 0 ? "✓" : "✗"} 読む：${read.data.length}件`);
  ok &&= read.data.length === 0;
}

// 2. 書く → RLS で断られるはず（user_id は適当な ID を入れて試す）
const write = await supabase
  .from("entries")
  .insert({ user_id: "00000000-0000-0000-0000-000000000000", date: "2026-01-01", score: 50 });
if (write.error) {
  // 42501＝権限・RLS で断られた。ほかのエラー（URL の間違いなど）は「守り」の確認にならないので不合格にする
  const denied = write.error.code === "42501";
  console.log(`${denied ? "✓" : "?"} 書く：断られた（${write.error.code} ${write.error.message}）`);
  ok &&= denied;
} else {
  console.log("✗ 書く：書けてしまった！ RLS を確認してください");
  ok = false;
}

console.log(ok ? "\nログインしていない人は、読めない・書けない ✓" : "\n想定と違う結果があります");
process.exit(ok ? 0 : 1);
