"use client";

import { useState } from "react";
import { EARLIEST_DATE } from "@/lib/dates";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  selected: string; // いま表示している日（"2026-11-04"）
  today: string; // 日本時間の今日
  onPick: (date: string) => void; // 日にちを押したとき
  onClose: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** 月のカレンダー。日にちを1回押すとその日へ移る（スマホ標準の「完了」を押す手間をなくすため自前で作る） */
export default function MonthCalendar({ selected, today, onPick, onClose }: Props) {
  const [year, setYear] = useState(Number(selected.slice(0, 4)));
  const [month, setMonth] = useState(Number(selected.slice(5, 7))); // 1〜12

  const monthKey = `${year}-${pad(month)}`;
  const canGoPrev = monthKey > EARLIEST_DATE.slice(0, 7);
  const canGoNext = monthKey < today.slice(0, 7);

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${monthKey}-${pad(i + 1)}`),
  ];

  function moveMonth(diff: number) {
    const d = new Date(Date.UTC(year, month - 1 + diff, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth() + 1);
  }

  return (
    <>
      {/* 外側を押したら閉じる */}
      <button type="button" aria-label="カレンダーを閉じる" onClick={onClose} className="fixed inset-0 z-10 cursor-default" />

      <div
        role="dialog"
        aria-label="日付を選ぶ"
        className="absolute left-1/2 top-full z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-foreground/10 bg-white p-3 shadow-lg"
      >
        <div className="mb-2 flex items-center justify-between">
          <MonthButton disabled={!canGoPrev} onClick={() => moveMonth(-1)} label="前の月">
            ‹
          </MonthButton>
          <p className="font-bold">
            {year}年{month}月
          </p>
          <MonthButton disabled={!canGoNext} onClick={() => moveMonth(1)} label="次の月">
            ›
          </MonthButton>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-foreground/60">
          {WEEKDAYS.map((w, i) => (
            <span key={w} className={`py-1 ${i === 0 ? "text-red-700" : i === 6 ? "text-blue-700" : ""}`}>
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <span key={`empty-${i}`} />;
            const day = Number(date.slice(8));
            const disabled = date > today || date < EARLIEST_DATE;
            const isSelected = date === selected;
            const isToday = date === today;
            return (
              <button
                key={date}
                type="button"
                disabled={disabled}
                onClick={() => onPick(date)}
                aria-label={`${month}月${day}日`}
                aria-current={isSelected ? "date" : undefined}
                className={[
                  "flex h-11 items-center justify-center rounded-xl text-base tabular-nums",
                  isSelected ? "bg-accent font-bold text-white" : "",
                  !isSelected && isToday ? "border-2 border-accent font-bold text-accent" : "",
                  !isSelected && !disabled ? "active:bg-accent/15" : "",
                  disabled ? "text-foreground/20" : "",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function MonthButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="btn-secondary flex h-11 w-11 items-center justify-center rounded-full text-2xl disabled:border-foreground/10 disabled:text-foreground/20 disabled:shadow-none"
    >
      {children}
    </button>
  );
}
