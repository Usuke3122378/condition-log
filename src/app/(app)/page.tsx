import { Suspense } from "react";
import DateNav from "@/components/DateNav";
import ScoreRecorder from "@/components/ScoreRecorder";
import { getCurrentUser } from "@/lib/auth";
import { isValidRecordDate, todayInTokyo } from "@/lib/dates";
import { getEntry } from "@/lib/entries";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6">
      {/* ログインの確認や URL の日付は「アクセスのたび」に読むので、Suspense の中でする（この版の Next.js のきまり） */}
      <Suspense fallback={<p className="py-10 text-center text-foreground/60">読みこみ中…</p>}>
        <RecordScreen searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function RecordScreen({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  // サーバー側でログインを確かめる。ログインしていなければここで /login へ移る
  const user = await getCurrentUser();
  const today = todayInTokyo();

  // URL の ?date=2026-11-04 を確かめる。おかしな値・未来の日は今日として扱う
  const requested = (await searchParams).date;
  const date = isValidRecordDate(requested, today) ? requested : today;
  const entry = await getEntry(date);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DateNav date={date} today={today} />

      {/* 人や日付が変わったら作り直す（前の人・前の日の点数が残らないように。課題①の反省） */}
      <ScoreRecorder key={`${user.id}:${date}`} date={date} savedScore={entry?.score ?? null} />
    </div>
  );
}
