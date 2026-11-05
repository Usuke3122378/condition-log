"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "./form-state";

/** Supabase の英語のエラーを、やわらかい日本語に直す */
function toJapaneseMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "メールアドレスかパスワードが違います";
    case "email_not_confirmed":
      return "このメールアドレスは、まだ確認が済んでいません";
    case "over_request_rate_limit":
      return "少し時間をおいてから、もう一度試してください";
    default:
      return "うまくいきませんでした。少し時間をおいてから、もう一度試してください";
  }
}

/**
 * メールアドレスとパスワードでログインする（新規登録はできない）。
 * 新しく使う人は Google で登録する。メール・パスワードのアカウントは、確認テスト用に管理画面で作ったものだけ
 * （メールアドレスの持ち主を確かめずに登録できると、同じアドレスの Google ログインを乗っ取る下準備ができてしまうため）
 */
export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "メールアドレスとパスワードを入れてください", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: toJapaneseMessage(error.code), email };

  // ブラウザが覚えている画面を捨ててから移る（前にログインしていた人の画面が出ないように）
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Google でログインを始める。Supabase から Google の画面の URL をもらい、そこへ移る。
 * 終わると Google → Supabase → アプリの /auth/callback に戻ってくる
 */
export async function loginWithGoogle(): Promise<void> {
  // 戻り先は、いま開いているアドレス（localhost／MacBook-Air.local／公開後の URL）から作る。
  // Supabase の「Redirect URLs」で許可したアドレスにしか戻らない
  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    console.error(error);
    redirect("/login?error=google");
  }
  redirect(data.url);
}
