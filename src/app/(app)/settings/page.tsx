import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteAllButton, SampleDataButton } from "@/components/SettingsDataActions";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: "設定｜体調きろく",
};

const CONSULT_URL = "https://www.mhlw.go.jp/mamorouyokokoro/";

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-center text-xl font-bold">設定</h1>
      {/* ログインの確認は「アクセスのたび」にするので、Suspense の中でする */}
      <Suspense fallback={<p className="py-10 text-center text-foreground/60">読みこみ中…</p>}>
        <SettingsScreen />
      </Suspense>
    </main>
  );
}

async function SettingsScreen() {
  // サーバー側でログインを確かめる。ログインしていなければここで /login へ移る
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-4">
      <Card title="アカウント">
        <p className="truncate text-sm text-foreground/70">ログイン中：{user.email}</p>
        <form action={logout}>
          <button className="btn-quiet h-11 w-full rounded-xl">ログアウト</button>
        </form>
      </Card>

      <Card title="記録のデータ">
        {/* ダウンロードはふつうのリンク（サーバーが CSV を返す） */}
        <a href="/settings/export" download className="btn-secondary flex h-11 items-center justify-center rounded-xl">
          記録をダウンロード（CSV）
        </a>
        <p className="text-xs text-foreground/60">表計算ソフト（Excel など）で開けます。</p>
        <DeleteAllButton />
      </Card>

      <Card title="困ったときは">
        <p className="text-sm leading-relaxed">
          つらい気持ちを、だれかに話したいときの窓口がまとまっています。
        </p>
        <a
          href={CONSULT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex h-11 items-center justify-center rounded-xl"
        >
          相談窓口を見る
        </a>
        <p className="text-xs text-foreground/60">厚生労働省「まもろうよ こころ」のページが開きます。</p>
      </Card>

      <Card title="このアプリについて">
        <p className="text-sm leading-relaxed text-foreground/80">
          このアプリは、記録とふり返りのための道具です。診断や治療の代わりにはなりません。
          記録は、あなた本人にしか見えません。
        </p>
        <Link href="/privacy" className="text-sm text-accent underline">
          プライバシーポリシー
        </Link>
      </Card>

      <Card title="ためしに使う">
        <p className="text-sm leading-relaxed text-foreground/80">
          記録のない日に、ためしの点数を入れます（3か月分）。あなたが付けた記録は上書きしません。
          「すべての記録を消す」で消せます。
        </p>
        <SampleDataButton />
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-white p-4 shadow-sm">
      <h2 className="font-bold">{title}</h2>
      {children}
    </section>
  );
}
