"use server";

import { revalidatePath } from "next/cache";
import { isValidRecordDate, todayInTokyo } from "@/lib/dates";
import { deleteEntry, isValidScore, saveEntry } from "@/lib/entries";

export type RecordResult = { ok: true; score: number } | { ok: false; error: string };
export type DeleteResult = { ok: true } | { ok: false; error: string };

/**
 * その日の点数を保存する。ブラウザから受け取るのは日付と点数だけ。
 * だれの記録か（ユーザーID）はサーバー側で決める（偽れないように）。日付もサーバーで確かめる
 */
export async function recordScore(date: string, score: number): Promise<RecordResult> {
  if (!isValidRecordDate(date, todayInTokyo())) {
    return { ok: false, error: "この日には記録できません" };
  }
  if (!isValidScore(score)) {
    return { ok: false, error: "点数は0〜100で選んでください" };
  }

  try {
    const saved = await saveEntry(date, score);
    // ブラウザが覚えている古い画面を捨てる（開き直したときに、保存前の点数が出ないように）
    revalidatePath("/", "layout");
    return { ok: true, score: saved.score };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "保存できませんでした。少し時間をおいて、もう一度押してください" };
  }
}

/** その日の記録を消す */
export async function deleteScore(date: string): Promise<DeleteResult> {
  if (!isValidRecordDate(date, todayInTokyo())) {
    return { ok: false, error: "この日の記録は消せません" };
  }

  try {
    await deleteEntry(date);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "消せませんでした。少し時間をおいて、もう一度押してください" };
  }
}
