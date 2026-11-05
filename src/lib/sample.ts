import { addDays } from "@/lib/dates";
import type { Entry } from "@/lib/entries";

const SAMPLE_DAYS = 90;
const RECORD_RATE = 0.8; // 約8割の日に記録（とびとびの日を作る）
const CYCLE_DAYS = 21; // ゆっくりした上下の周期（約3週間）

/**
 * スクショ・動作確認用の、ためしの点数を作る（今日から90日前まで）。
 * ゆっくりした波＋日ごとの小さなゆれ。0〜100 に収める
 */
export function generateSampleEntries(today: string): Entry[] {
  const phase = Math.random() * Math.PI * 2;
  const entries: Entry[] = [];
  let drift = 0; // 前の日から少しずつ動くゆれ（毎日ばらばらに上下しすぎないように）

  for (let i = 0; i < SAMPLE_DAYS; i++) {
    drift = Math.max(-10, Math.min(10, drift * 0.7 + (Math.random() - 0.5) * 8));
    if (Math.random() > RECORD_RATE) continue;
    const wave = 18 * Math.sin((2 * Math.PI * i) / CYCLE_DAYS + phase);
    const score = Math.round(Math.min(100, Math.max(0, 55 + wave + drift)));
    entries.push({ date: addDays(today, -i), score });
  }
  return entries;
}
