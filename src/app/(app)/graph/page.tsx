import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ScoreChart, { type ChartPoint } from "@/components/ScoreChart";
import { getCurrentUser } from "@/lib/auth";
import { addDays, datesBetween, todayInTokyo } from "@/lib/dates";
import { getEntriesBetween } from "@/lib/entries";

export const metadata: Metadata = {
  title: "グラフ｜体調きろく",
};

const RANGES = [
  { days: 7, label: "1週間" },
  { days: 30, label: "1か月" },
  { days: 90, label: "3か月" },
] as const;
const DEFAULT_DAYS = 30;

export default function GraphPage({ searchParams }: PageProps<"/graph">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      {/* ログインの確認や URL の期間は「アクセスのたび」に読むので、Suspense の中でする */}
      <Suspense fallback={<p className="py-10 text-center text-foreground/60">読みこみ中…</p>}>
        <GraphScreen searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function GraphScreen({ searchParams }: { searchParams: PageProps<"/graph">["searchParams"] }) {
  // サーバー側でログインを確かめる。ログインしていなければここで /login へ移る
  await getCurrentUser();

  // URL の ?range=7|30|90 を確かめる。おかしな値は 1か月
  const requested = Number((await searchParams).range);
  const days = RANGES.some((r) => r.days === requested) ? requested : DEFAULT_DAYS;

  const today = todayInTokyo();
  const from = addDays(today, -(days - 1));
  const entries = await getEntriesBetween(from, today);

  // 記録のない日は null にして、線を途切れさせる（0点と区別する）
  const byDate = new Map(entries.map((e) => [e.date, e.score]));
  const points: ChartPoint[] = datesBetween(from, today).map((date) => ({ date, score: byDate.get(date) ?? null }));
  const average = entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length) : null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-center text-xl font-bold">体調のグラフ</h1>

      {/* 期間の切り替え */}
      <nav aria-label="期間を選ぶ" className="grid grid-cols-3 gap-2">
        {RANGES.map((r) => {
          const active = r.days === days;
          return (
            <Link
              key={r.days}
              href={r.days === DEFAULT_DAYS ? "/graph" : `/graph?range=${r.days}`}
              aria-current={active ? "page" : undefined}
              className={`flex h-11 items-center justify-center rounded-xl ${
                active ? "bg-accent font-bold text-white" : "btn-secondary"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </nav>

      {average === null ? (
        <p className="py-10 text-center text-foreground/70">
          この期間はまだ記録がありません。
          <br />
          記録すると、ここに線が出ます。
        </p>
      ) : (
        <>
          <p className="text-center">
            <span className="text-sm text-foreground/70">平均 </span>
            <span className="text-4xl font-bold tabular-nums text-accent">{average}</span>
            <span className="text-sm">点</span>
            <span className="ml-2 text-sm text-foreground/60">
              （{days}日中 {entries.length}日記録）
            </span>
          </p>
          <ScoreChart points={points} />
          <p className="text-center text-xs text-foreground/60">点を押すと、その日の点数が出ます。点線の所は、記録がない日をまたいでいます。</p>
        </>
      )}
    </div>
  );
}
