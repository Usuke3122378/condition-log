import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜体調きろく",
};

const CONTACT_URL = "https://github.com/Usuke3122378/condition-log/issues";
const UPDATED = "2026年11月6日";

/** プライバシーポリシー。ログインしていなくても読める（Google ログインの公開にも必要） */
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10 leading-relaxed">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
        <p className="text-sm text-foreground/60">体調きろく／最終更新：{UPDATED}</p>
      </header>

      <p>
        「体調きろく」（以下、このアプリ）は、毎日の体調を点数で記録してふり返るためのアプリです。
        個人が学習の一環として作り、運営しています。体調の記録はとても繊細な情報なので、取り扱いを次のように定めます。
      </p>

      <Section title="1. 受け取る情報">
        <ul className="list-disc space-y-1 pl-5">
          <li>Google でログインしたときに Google から受け取る、メールアドレス・名前・プロフィール画像の URL（ログインのために保存します。名前と画像は画面に表示していません）</li>
          <li>あなたが記録した、日付と体調の点数（0〜100）</li>
          <li>ログインの状態を保つための cookie</li>
        </ul>
      </Section>

      <Section title="2. 使い道">
        <p>あなた本人であることを確かめることと、あなたが付けた記録をあなたに表示すること（グラフ・ダウンロードを含む）だけに使います。</p>
      </Section>

      <Section title="3. だれが見られるか">
        <ul className="list-disc space-y-1 pl-5">
          <li>記録を見られるのは、あなた本人だけです。データベースの設定（行レベルセキュリティ）で、ほかの利用者からは読めないようにしています</li>
          <li>第三者に提供・販売することはありません</li>
          <li>広告や、利用状況を調べる解析ツールは使っていません</li>
        </ul>
      </Section>

      <Section title="4. 保存する場所">
        <p>
          データは、データベースのサービス Supabase に保存します（サーバーはシンガポールにあります）。
          アプリの画面は Vercel というサービスから配信しています。どちらも通信は暗号化されています。
        </p>
      </Section>

      <Section title="5. 記録の削除">
        <ul className="list-disc space-y-1 pl-5">
          <li>記録は、設定画面の「すべての記録を消す」で、いつでも自分で消せます。記録をダウンロード（CSV）することもできます</li>
          <li>アカウントそのものの削除は、今後アプリの中でできるようにする予定です。それまでは、下の問い合わせ先からご連絡ください</li>
        </ul>
      </Section>

      <Section title="6. 医療について">
        <p>このアプリは記録とふり返りのための道具です。診断や治療の代わりにはなりません。</p>
      </Section>

      <Section title="7. 変更と問い合わせ">
        <p>
          この内容を変えるときは、このページでお知らせします。問い合わせは、
          <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" className="text-accent underline">
            GitHub の問い合わせ窓口（Issues）
          </a>
          へお願いします。体調などの個人的な内容は書き込まないでください。
        </p>
      </Section>

      <Link href="/login" className="btn-secondary flex h-11 items-center justify-center rounded-xl">
        ログイン画面へ
      </Link>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-bold">{title}</h2>
      <div className="text-sm text-foreground/85">{children}</div>
    </section>
  );
}
