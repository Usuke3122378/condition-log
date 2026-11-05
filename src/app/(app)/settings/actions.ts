"use server";

import { revalidatePath } from "next/cache";
import { todayInTokyo } from "@/lib/dates";
import { addSampleEntries, deleteAllEntries } from "@/lib/entries";
import { generateSampleEntries } from "@/lib/sample";

export type CountResult = { ok: true; count: number } | { ok: false; error: string };

/** 自分の全記録を消す（だれの記録かはサーバー側で決める） */
export async function deleteAllRecords(): Promise<CountResult> {
  try {
    const count = await deleteAllEntries();
    revalidatePath("/", "layout");
    return { ok: true, count };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "消せませんでした。少し時間をおいて、もう一度押してください" };
  }
}

/** 記録のない日に、ためしの点数を入れる（付けた記録は上書きしない） */
export async function addSampleData(): Promise<CountResult> {
  try {
    const count = await addSampleEntries(generateSampleEntries(todayInTokyo()));
    revalidatePath("/", "layout");
    return { ok: true, count };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "入れられませんでした。少し時間をおいて、もう一度押してください" };
  }
}
