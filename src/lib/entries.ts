import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * 体調の点数（entries 表）の読み書きは、ここを通す（データの入口を1か所に）。
 * - だれの記録かは、必ずサーバー側で確かめた本人（getCurrentUser）で決める。外から受け取らない
 * - .eq("user_id", ...) を付けて自分の行だけにする。データベースの RLS でも同じ制限がかかる（二重）
 */

export type Entry = {
  date: string; // "2026-11-05"
  score: number; // 0〜100
};

export const MIN_SCORE = 0;
export const MAX_SCORE = 100;

export function isValidScore(score: unknown): score is number {
  return Number.isInteger(score) && (score as number) >= MIN_SCORE && (score as number) <= MAX_SCORE;
}

/** その日の自分の記録を読む。なければ null */
export async function getEntry(date: string): Promise<Entry | null> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("date, score")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (error) throw new Error(`記録を読めませんでした（${error.code}）`);
  return data;
}

/** その日の自分の記録を保存する（なければ追加、あれば上書き） */
export async function saveEntry(date: string, score: number): Promise<Entry> {
  if (!isValidScore(score)) throw new Error("点数は0〜100の整数にしてください");

  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .upsert(
      { user_id: user.id, date, score, updated_at: new Date().toISOString() },
      { onConflict: "user_id,date" },
    )
    .select("date, score")
    .single();

  if (error) throw new Error(`記録を保存できませんでした（${error.code}）`);
  return data;
}

/** その日の自分の記録を消す */
export async function deleteEntry(date: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.from("entries").delete().eq("user_id", user.id).eq("date", date);

  if (error) throw new Error(`記録を消せませんでした（${error.code}）`);
}
