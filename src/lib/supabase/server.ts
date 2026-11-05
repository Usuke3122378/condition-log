import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバー用の Supabase 接続。リクエストごとに新しく作る（他の人のログイン情報と混ざらないように）。
 * ログイン情報は cookie から読む。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // ページ（サーバー部品）の表示中は cookie を書けない。
            // ログイン情報の更新は proxy（src/proxy.ts）が毎回やっているので、ここでは何もしない
          }
        },
      },
    },
  );
}
