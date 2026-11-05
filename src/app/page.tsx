import { Suspense } from "react";
import ScoreRecorder from "@/components/ScoreRecorder";
import { getCurrentUser } from "@/lib/auth";
import { todayInTokyo } from "@/lib/dates";
import { getEntry } from "@/lib/entries";
import { logout } from "./actions";

const DEFAULT_SCORE = 50;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      {/* ログインの確認は cookie を読むので、Suspense の中でする（この版の Next.js のきまり） */}
      <Suspense fallback={<p className="py-10 text-center text-foreground/60">読みこみ中…</p>}>
        <RecordScreen />
      </Suspense>
    </main>
  );
}

async function RecordScreen() {
  // サーバー側でログインを確かめる。ログインしていなければここで /login へ移る
  const user = await getCurrentUser();
  const today = todayInTokyo();
  const entry = await getEntry(today);

  return (
    <div className="flex flex-col gap-6">
      {/* 設定画面（S8）ができたら、ここから移す */}
      <div className="flex items-center justify-between gap-2 text-sm text-foreground/60">
        <span className="truncate">ログイン中：{user.email}</span>
        <form action={logout}>
          <button className="h-11 shrink-0 rounded-xl px-3 underline">ログアウト</button>
        </form>
      </div>
      {/* 人や日付が変わったら作り直す（前の人の点数が残らないように。課題①の反省） */}
      <ScoreRecorder
        key={`${user.id}:${today}`}
        date={today}
        initialScore={entry?.score ?? DEFAULT_SCORE}
        recorded={entry !== null}
      />
    </div>
  );
}
