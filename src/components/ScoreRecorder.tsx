"use client";

import { useState, useTransition } from "react";
import { recordScore } from "@/app/record-actions";
import { formatJapaneseDate } from "@/lib/dates";

type Props = {
  date: string; // サーバーで決めた日本時間の今日（"2026-11-05"）
  initialScore: number; // 記録済みならその点数、なければ 50
  recorded: boolean; // その日はもう記録済みか
};

type Message = { kind: "ok" | "error"; text: string } | null;

export default function ScoreRecorder({ date, initialScore, recorded: initiallyRecorded }: Props) {
  const [score, setScore] = useState(initialScore);
  const [recorded, setRecorded] = useState(initiallyRecorded);
  const [message, setMessage] = useState<Message>(null);
  const [pending, startTransition] = useTransition();

  function handleRecord() {
    startTransition(async () => {
      const result = await recordScore(score);
      if (result.ok) {
        setRecorded(true);
        setMessage({ kind: "ok", text: `${result.score}点で記録しました` });
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-xl font-bold">{formatJapaneseDate(date)}</h1>
        <p className="min-h-5 text-sm text-foreground/60">
          {recorded ? "記録済みです。直すときは動かして、もう一度押してください" : ""}
        </p>
      </div>

      <p className="text-center">
        <output htmlFor="score" className="text-7xl font-bold tabular-nums text-accent">
          {score}
        </output>
        <span className="ml-1 text-xl">点</span>
      </p>

      <div className="flex flex-col gap-1">
        <input
          id="score"
          type="range"
          min={0}
          max={100}
          step={1}
          value={score}
          onChange={(e) => {
            setScore(Number(e.target.value));
            setMessage(null);
          }}
          aria-label="今日の体調（0〜100点）"
          className="score-slider"
        />
        <div className="flex justify-between text-sm text-foreground/60">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRecord}
        disabled={pending}
        className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-white active:opacity-80 disabled:opacity-50"
      >
        {pending ? "記録中…" : "記録する"}
      </button>

      <p role="status" className={`min-h-6 text-center ${message?.kind === "error" ? "text-red-700" : "text-accent"}`}>
        {message?.text}
      </p>
    </section>
  );
}
