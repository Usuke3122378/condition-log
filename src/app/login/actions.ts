"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MIN_PASSWORD_LENGTH, type AuthFormState } from "./form-state";

/** Supabase の英語のエラーを、やわらかい日本語に直す */
function toJapaneseMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "メールアドレスかパスワードが違います";
    case "user_already_exists":
    case "email_exists":
      return "このメールアドレスはもう登録されています。上の「ログイン」に切り替えてください";
    case "weak_password":
      return `パスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください`;
    case "email_address_invalid":
      return "このメールアドレスは使えません";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "少し時間をおいてから、もう一度試してください";
    default:
      return "うまくいきませんでした。少し時間をおいてから、もう一度試してください";
  }
}

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function validate(email: string, password: string): string | null {
  if (!email || !password) return "メールアドレスとパスワードを入れてください";
  if (password.length < MIN_PASSWORD_LENGTH) return `パスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください`;
  return null;
}

/** 「ログイン」「新規登録」どちらのボタンで送られたかを見て、振り分ける */
export async function authenticate(prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  return formData.get("intent") === "signup" ? signup(prev, formData) : login(prev, formData);
}

async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readForm(formData);
  const invalid = validate(email, password);
  if (invalid) return { error: invalid, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: toJapaneseMessage(error.code), email };

  redirect("/");
}

async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readForm(formData);
  const invalid = validate(email, password);
  if (invalid) return { error: invalid, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: toJapaneseMessage(error.code), email };

  // 確認メールをオフにしているので、登録するとそのままログインした状態になる。
  // 同じメールで登録し直した場合、Supabase はエラーを返さず session が空になることがある
  if (!data.session) {
    return { error: toJapaneseMessage("user_already_exists"), email };
  }

  redirect("/");
}
