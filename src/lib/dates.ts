const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 日本時間の「今日」を "2026-11-05" の形で返す（サーバーでもブラウザでも同じ結果になる） */
export function todayInTokyo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "2026-11-05" を「11月5日（木）」の形にする */
export function formatJapaneseDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}月${d}日（${weekday}）`;
}
