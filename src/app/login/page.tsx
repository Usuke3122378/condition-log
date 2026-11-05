import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "ログイン｜体調きろく",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">体調きろく</h1>
        <p className="text-foreground/80">毎日の体調を点数でつけて、グラフでふり返るアプリです。</p>
      </header>

      <LoginForm />

      <p className="text-xs leading-relaxed text-foreground/60">
        このアプリは記録とふり返りのための道具です。診断や治療の代わりにはなりません。
        記録は、あなた本人にしか見えません。
      </p>
    </main>
  );
}
