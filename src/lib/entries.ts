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

/** from から to まで（両方含む）の自分の記録を、日付の古い順に読む */
export async function getEntriesBetween(from: string, to: string): Promise<Entry[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("date, score")
    .eq("user_id", user.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });

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

/** 自分の全記録を、日付の古い順に読む（CSV 用） */
export async function getAllEntries(): Promise<Entry[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("date, score")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) throw new Error(`記録を読めませんでした（${error.code}）`);
  return data;
}

/** 自分の全記録を消す。消した件数を返す */
export async function deleteAllEntries(): Promise<number> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("entries").delete().eq("user_id", user.id).select("id");

  if (error) throw new Error(`記録を消せませんでした（${error.code}）`);
  return data.length;
}

/** サンプルの記録を入れる。すでに記録がある日は上書きしない。入れた件数を返す */
export async function addSampleEntries(entries: Entry[]): Promise<number> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const rows = entries.filter((e) => isValidScore(e.score)).map((e) => ({ user_id: user.id, ...e }));
  const { data, error } = await supabase
    .from("entries")
    .upsert(rows, { onConflict: "user_id,date", ignoreDuplicates: true })
    .select("id");

  if (error) throw new Error(`サンプルを入れられませんでした（${error.code}）`);
  return data.length;
}

/** その日の自分の記録を消す */
export async function deleteEntry(date: string): Promise<void> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { error } = await supabase.from("entries").delete().eq("user_id", user.id).eq("date", date);

  if (error) throw new Error(`記録を消せませんでした（${error.code}）`);
}
