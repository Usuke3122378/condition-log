"use client";

import { useState } from "react";
import { formatJapaneseDate } from "@/lib/dates";
import { useIsClient } from "@/lib/use-is-client";

export default function ScoreRecorder() {
  const isClient = useIsClient();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-6">
      {/* 今日の日付は、ブラウザで動き出してから決める（前もって作るページに古い日付が残らないように） */}
      <h1 className="text-center text-xl font-bold min-h-7">
        {isClient ? formatJapaneseDate(new Date()) : ""}
      </h1>

      <button
        type="button"
        onClick={() => setMessage("記録しました")}
        className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-white active:opacity-80"
      >
        記録する
      </button>

      <p role="status" className="min-h-6 text-center text-accent">
        {message}
      </p>
    </section>
  );
}
