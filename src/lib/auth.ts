import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
};

/**
 * いまログインしている人を、サーバー側で確かめて返す（ログインの確認はここ1か所に集める）。
 * ログインしていなければ /login へ移す。
 * getClaims() は cookie の中身をそのまま信じず、署名を確かめてから読む。
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  // ログインの確認は「アクセスのたび」にする処理。前もってページを作る段階では動かさない
  // （中でログイン情報の有効期限を時刻で調べるため。ないと Next.js が Date.now() の警告を出す）
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect("/login");
  }

  // 画面に渡すのは必要な分だけ
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
}
