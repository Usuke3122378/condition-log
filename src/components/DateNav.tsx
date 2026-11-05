"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MonthCalendar from "@/components/MonthCalendar";
import { EARLIEST_DATE, addDays, formatJapaneseDate, recordHref } from "@/lib/dates";

type Props = {
  date: string; // いま表示している日（"2026-11-04"）
  today: string; // サーバーで決めた日本時間の今日
};

/**
 * ‹ 日付▾ › の形。日付を押すとアプリのカレンダーが開く（日にちを1回押せば移る）。
 * 昨日へは ‹ を1回。今日以外を見ているときだけ「今日にもどる」を出す
 */
export default function DateNav({ date, today }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const prev = addDays(date, -1);
  const isToday = date === today;

  return (
    <nav aria-label="記録する日を選ぶ" className="flex flex-col items-center gap-1">
      <div className="flex w-full items-center justify-between gap-2">
        <ArrowLink href={prev >= EARLIEST_DATE ? recordHref(prev, today) : null} label="前の日へ">
          ‹
        </ArrowLink>

        {/* 日付を押すと、アプリのカレンダーが開く。日にちを1回押せばその日へ移る */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`${formatJapaneseDate(date)}。押すとカレンダーが開きます`}
            className="btn-secondary flex h-12 items-center gap-1 rounded-xl px-3"
          >
            <span className="text-xl font-bold text-foreground">{formatJapaneseDate(date)}</span>
            {/* 押せることが分かるように、はっきり見える下向きの印 */}
            <svg aria-hidden viewBox="0 0 20 20" className="h-6 w-6 shrink-0 text-accent" fill="currentColor">
              <path d="M5.2 7.5a1 1 0 0 1 1.4 0L10 10.9l3.4-3.4a1 1 0 1 1 1.4 1.4l-4.1 4.1a1 1 0 0 1-1.4 0L5.2 8.9a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>
          {open && (
            <MonthCalendar
              selected={date}
              today={today}
              onClose={() => setOpen(false)}
              onPick={(picked) => {
                setOpen(false);
                if (picked !== date) router.push(recordHref(picked, today));
              }}
            />
          )}
        </div>

        <ArrowLink href={isToday ? null : recordHref(addDays(date, 1), today)} label="次の日へ">
          ›
        </ArrowLink>
      </div>

      <div className="flex min-h-11 items-center">
        {isToday ? (
          <span className="text-sm text-foreground/60">今日</span>
        ) : (
          <Link href="/" className="flex h-11 items-center px-3 text-sm font-bold text-accent underline">
            今日にもどる
          </Link>
        )}
      </div>
    </nav>
  );
}

function ArrowLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  const base = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl";
  if (!href) {
    return (
      <span aria-hidden className={`${base} text-foreground/20`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={`${base} btn-secondary`}>
      {children}
    </Link>
  );
}
