const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 記録を付けられる一番古い日 */
export const EARLIEST_DATE = "2000-01-01";

/** 日本時間の「今日」を "2026-11-05" の形で返す（サーバーでもブラウザでも同じ結果になる） */
export function todayInTokyo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "2026-11-05" の n 日後（n がマイナスなら前）を同じ形で返す */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 記録を付けてよい日か（形が正しい・実在する日・2000-01-01 から今日まで） */
export function isValidRecordDate(date: unknown, today: string): date is string {
  if (typeof date !== "string" || !DATE_PATTERN.test(date)) return false;
  if (addDays(date, 0) !== date) return false; // 2026-02-30 のような存在しない日
  return date >= EARLIEST_DATE && date <= today;
}

/** その日の記録画面の URL（今日は "/"） */
export function recordHref(date: string, today: string): string {
  return date === today ? "/" : `/?date=${date}`;
}

/** from から to まで（両方含む）の日付を1日ずつ並べる */
export function datesBetween(from: string, to: string): string[] {
  const dates: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d);
  return dates;
}

/** "2026-11-05" を「11/5」の形にする（グラフの目盛り用） */
export function formatShortDate(date: string): string {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;
}

/** "2026-11-05" を「11月5日（木）」の形にする */
export function formatJapaneseDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}月${d}日（${weekday}）`;
}
