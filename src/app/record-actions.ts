"use server";

import { revalidatePath } from "next/cache";
import { todayInTokyo } from "@/lib/dates";
import { isValidScore, saveEntry } from "@/lib/entries";

export type RecordResult = { ok: true; score: number } | { ok: false; error: string };

/**
 * 今日の点数を保存する。ブラウザから受け取るのは点数だけ。
 * だれの記録か（ユーザーID）と日付は、サーバー側で決める（偽れないように）
 */
export async function recordScore(score: number): Promise<RecordResult> {
  if (!isValidScore(score)) {
    return { ok: false, error: "点数は0〜100で選んでください" };
  }

  try {
    const saved = await saveEntry(todayInTokyo(), score);
    // ブラウザが覚えている古い画面を捨てる（開き直したときに、保存前の点数が出ないように）
    revalidatePath("/", "layout");
    return { ok: true, score: saved.score };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "保存できませんでした。少し時間をおいて、もう一度押してください" };
  }
}
