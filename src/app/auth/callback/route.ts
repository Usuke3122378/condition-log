import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Google ログインの戻り先。?code=…（一回きりの引換券）をログイン情報に交換して cookie に保存する。
 * 引換券は、ログインを始めたブラウザでしか使えない（PKCE。@supabase/ssr が自動でやる）
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // ブラウザが覚えている画面を捨ててから移る（前にログインしていた人の画面が出ないように）
      revalidatePath("/", "layout");
      return NextResponse.redirect(new URL("/", request.url));
    }
    console.error(error);
  }

  return NextResponse.redirect(new URL("/login?error=google", request.url));
}
