import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** ログインしていなくても開けるページ（/auth/callback は Google ログインの戻り先、/privacy はプライバシーポリシー） */
const PUBLIC_PATHS = ["/login", "/auth/callback", "/privacy"];

/**
 * すべてのページの前で動く処理（src/proxy.ts から呼ぶ）。
 * 1. 期限が近いログイン情報を更新して cookie に書き戻す
 * 2. ログインしていなければ /login へ、ログイン済みで /login に来たら / へ（目安の確認）
 * ※ 本当の確認は、各ページでサーバー側の getCurrentUser()（src/lib/auth.ts）がする
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          // ログイン情報を書き換えた返事は、途中でキャッシュされないようにする（他の人に配られないように）
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // ここで署名を確かめながらログイン情報を読む（期限が近ければ更新される）
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isLoggedIn && !isPublic) {
    return redirectWithCookies(request, response, "/login");
  }
  if (isLoggedIn && pathname === "/login") {
    return redirectWithCookies(request, response, "/");
  }
  return response;
}

/** 移動させるときも、更新したログイン情報の cookie は引き継ぐ */
function redirectWithCookies(request: NextRequest, from: NextResponse, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  // キャッシュ禁止のヘッダーも引き継ぐ（Next.js 内部用の x-middleware-* と cookie 本体は除く）
  from.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k !== "set-cookie" && !k.startsWith("x-middleware")) redirect.headers.set(key, value);
  });
  return redirect;
}
