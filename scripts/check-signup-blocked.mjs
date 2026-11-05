// アプリの画面を通らず、Supabase に直接「メールで新規登録」しても、
// そのアドレスの持ち主が確認しない限りログインできないことを確かめる（乗っ取りの下準備ができない）。
// 前提：Supabase の Authentication → Sign In / Providers → Email の「Confirm email」がオン
// 実行：node --env-file=.env.local scripts/check-signup-blocked.mjs
// ※ 確認されないままの登録が1件残ることがある（管理画面の Users から消してよい）
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("✗ .env.local を確認してください");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const email = `signup-test-${Date.now()}@example.com`;
const password = `Test-${Math.random().toString(36).slice(2)}-${Date.now()}`;
let ok = true;

// 1. 直接メールで新規登録 → ログインした状態（session）にはならないはず
const signUp = await supabase.auth.signUp({ email, password });
if (signUp.error) {
  console.log(`✓ 新規登録：断られた（${signUp.error.code ?? signUp.error.message}）`);
} else if (signUp.data.session) {
  console.log("✗ 新規登録：そのままログインできてしまった！ Confirm email がオンか確認してください");
  ok = false;
} else {
  console.log("✓ 新規登録：確認が済むまでログインした状態にならない");
}

// 2. 同じアドレスとパスワードでログイン → できないはず
const signIn = await supabase.auth.signInWithPassword({ email, password });
if (signIn.data.session) {
  console.log("✗ ログイン：できてしまった！");
  ok = false;
} else {
  console.log(`✓ ログイン：できない（${signIn.error?.code ?? "session なし"}）`);
}

console.log(ok ? "\nメールアドレスの持ち主が確認しない限り、メールで登録したアカウントは使えない ✓" : "\n想定と違う結果があります");
process.exit(ok ? 0 : 1);
