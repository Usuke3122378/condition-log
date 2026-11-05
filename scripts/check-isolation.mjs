// A の記録を、C が読めない・書き換えられない・消せないことを確かめる（付録F の 2・3）
// アプリの画面を通さず、Supabase に直接つないで試す（＝いちばん素直に「データベースの守り」を見る）
// 実行：node --env-file=.env.local --env-file=.env.test.local scripts/check-isolation.mjs
import { createClient } from "@supabase/supabase-js";

const env = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`✗ ${name} がありません（.env.local と .env.test.local を確認してください）`);
    process.exit(1);
  }
  return value;
};

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const key = env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const TEST_DATE = "2000-01-01"; // テスト用の日付（本物の記録とぶつからないように）

async function signIn(label, email, password) {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(`✗ ${label} でログインできませんでした（${error.code}）`);
    process.exit(1);
  }
  return { client, userId: data.user.id };
}

let ok = true;
const check = (passed, text) => {
  console.log(`${passed ? "✓" : "✗"} ${text}`);
  ok &&= passed;
};

const a = await signIn("A", env("TEST_A_EMAIL"), env("TEST_A_PASSWORD"));
const c = await signIn("C", env("TEST_C_EMAIL"), env("TEST_C_PASSWORD"));

// 1. A が自分の記録を入れる
const put = await a.client
  .from("entries")
  .upsert({ user_id: a.userId, date: TEST_DATE, score: 42 }, { onConflict: "user_id,date" })
  .select("id")
  .single();
check(!put.error, `A が自分の記録を入れられる${put.error ? `（${put.error.code}）` : ""}`);
const rowId = put.data?.id;

// 2. C が全件読む → A の記録は見えない
const read = await c.client.from("entries").select("id, user_id");
const seen = (read.data ?? []).filter((r) => r.user_id === a.userId).length;
check(!read.error && seen === 0, `C が読む：A の記録は ${seen} 件見えた`);

// 3. C が A の行を書き換える → 0件しか変わらない
const upd = await c.client.from("entries").update({ score: 0 }).eq("id", rowId).select("id");
check(!upd.error && upd.data.length === 0, `C が A の記録を書き換える：${upd.data?.length ?? "?"} 件変わった`);

// 4. C が「A の記録」として追加する → 断られる
const ins = await c.client.from("entries").insert({ user_id: a.userId, date: "2000-01-02", score: 0 });
check(ins.error?.code === "42501", `C が A になりすまして追加する：${ins.error ? `断られた（${ins.error.code}）` : "追加できてしまった！"}`);

// 5. C が A の行を消す → 0件しか消えない
const del = await c.client.from("entries").delete().eq("id", rowId).select("id");
check(!del.error && del.data.length === 0, `C が A の記録を消す：${del.data?.length ?? "?"} 件消えた`);

// 6. A の記録は元のまま
const after = await a.client.from("entries").select("score").eq("id", rowId).single();
check(after.data?.score === 42, `A の記録は元のまま（${after.data?.score ?? "なし"} 点）`);

// 片付け（テスト用の行を消す）
await a.client.from("entries").delete().eq("id", rowId);

console.log(ok ? "\nC は A の記録を、読めない・書き換えられない・消せない ✓" : "\n想定と違う結果があります");
process.exit(ok ? 0 : 1);
