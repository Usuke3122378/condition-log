import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleLoginButton, GoogleLoginError } from "./GoogleLogin";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "ログイン｜体調きろく",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">体調きろく</h1>
        <p className="text-foreground/80">毎日の体調を点数でつけて、グラフでふり返るアプリです。</p>
      </header>

      {/* URL の ?error=google を読むので Suspense の中に置く（この版の Next.js のきまり） */}
      <Suspense fallback={null}>
        <GoogleLoginError />
      </Suspense>

      <div className="flex flex-col gap-2">
        <GoogleLoginButton />
        <p className="text-center text-sm text-foreground/70">はじめての方も、このボタンから登録できます。</p>
      </div>

      <p className="text-xs leading-relaxed text-foreground/60">
        このアプリは記録とふり返りのための道具です。診断や治療の代わりにはなりません。
        記録は、あなた本人にしか見えません。
      </p>

      {/* いちばん下に小さく。確認テスト・スクショ用のダミーアカウントだけが使う */}
      <div className="mt-auto flex flex-col">
        <LoginForm />
      </div>
    </main>
  );
}
