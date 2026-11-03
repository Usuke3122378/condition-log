/** 日本時間で「11月3日（月）」の形にする */
export function formatJapaneseDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("month")}月${get("day")}日（${get("weekday")}）`;
}
