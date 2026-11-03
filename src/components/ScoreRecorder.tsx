"use client";

import { useState } from "react";
import { formatJapaneseDate } from "@/lib/dates";
import { useIsClient } from "@/lib/use-is-client";

const INITIAL_SCORE = 50;

export default function ScoreRecorder() {
  const isClient = useIsClient();
  const [score, setScore] = useState(INITIAL_SCORE);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-6">
      {/* 今日の日付は、ブラウザで動き出してから決める（前もって作るページに古い日付が残らないように） */}
      <h1 className="text-center text-xl font-bold min-h-7">
        {isClient ? formatJapaneseDate(new Date()) : ""}
      </h1>

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
        onClick={() => setMessage(`${score}点で記録しました`)}
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
