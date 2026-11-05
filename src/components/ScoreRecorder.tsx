"use client";

import { useState, useTransition } from "react";
import { deleteScore, recordScore } from "@/app/record-actions";
import { formatJapaneseDate } from "@/lib/dates";

const DEFAULT_SCORE = 50;

type Props = {
  date: string; // 記録する日（"2026-11-04"）
  savedScore: number | null; // その日に記録済みの点数。まだなら null
};

type Message = { kind: "ok" | "error"; text: string } | null;

/**
 * まだ記録していない日：スライダー＋「記録する」
 * 記録済みの日：点数を見るだけ。「直す」を押したときだけスライダーを出す（うっかり上書きしないように）
 */
export default function ScoreRecorder({ date, savedScore: initialSaved }: Props) {
  const [saved, setSaved] = useState<number | null>(initialSaved);
  const [score, setScore] = useState(initialSaved ?? DEFAULT_SCORE);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [pending, startTransition] = useTransition();
  const day = formatJapaneseDate(date).replace(/（.）$/, ""); // 「11月4日」

  const recorded = saved !== null;
  const showSlider = !recorded || editing;

  function handleRecord() {
    startTransition(async () => {
      const result = await recordScore(date, score);
      if (result.ok) {
        setSaved(result.score);
        setEditing(false);
        setMessage({ kind: "ok", text: `${day}を${result.score}点で記録しました` });
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteScore(date);
      setConfirmingDelete(false);
      if (result.ok) {
        setSaved(null);
        setEditing(false);
        setScore(DEFAULT_SCORE);
        setMessage({ kind: "ok", text: `${day}の記録を消しました` });
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  function startEditing() {
    setScore(saved ?? DEFAULT_SCORE);
    setEditing(true);
    setMessage(null);
  }

  function cancelEditing() {
    setScore(saved ?? DEFAULT_SCORE);
    setEditing(false);
    setConfirmingDelete(false);
    setMessage(null);
  }

  return (
    <section className="flex flex-col gap-6">
      <p className="min-h-5 text-center text-sm text-foreground/60">
        {!recorded ? "まだ記録していません" : editing ? "点数を直しています" : "✓ 記録済み"}
      </p>

      <p className="text-center">
        <output htmlFor="score" className="text-7xl font-bold tabular-nums text-accent">
          {showSlider ? score : saved}
        </output>
        <span className="ml-1 text-xl">点</span>
      </p>

      {showSlider ? (
        <>
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
              aria-label={`${day}の体調（0〜100点）`}
              className="score-slider"
            />
            <div className="flex justify-between text-sm text-foreground/60">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRecord}
              disabled={pending}
              className="h-14 flex-1 rounded-2xl bg-accent text-lg font-bold text-white active:opacity-80 disabled:opacity-50"
            >
              {pending ? "記録中…" : "記録する"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={pending}
                className="btn-quiet h-14 rounded-2xl px-5 disabled:opacity-50"
              >
                やめる
              </button>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="btn-secondary h-14 w-full rounded-2xl text-lg"
        >
          直す
        </button>
      )}

      <p role="status" className={`min-h-6 text-center ${message?.kind === "error" ? "text-red-700" : "text-accent"}`}>
        {message?.text}
      </p>

      {/* 消すのは「直す」の中だけ。ブラウザの確認ダイアログは使わず、その場で確かめる */}
      {editing && (
        <div className="flex flex-col items-center gap-2 text-sm">
          {confirmingDelete ? (
            <>
              <p>{day}の記録を消しますか？</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className="h-11 rounded-xl bg-red-700 px-5 font-bold text-white disabled:opacity-50"
                >
                  消す
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={pending}
                  className="btn-quiet h-11 rounded-xl px-5"
                >
                  やめる
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(true);
                setMessage(null);
              }}
              className="h-11 px-3 text-foreground/60 underline"
            >
              この日の記録を消す
            </button>
          )}
        </div>
      )}
    </section>
  );
}
