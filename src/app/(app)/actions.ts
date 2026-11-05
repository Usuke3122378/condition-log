"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // ブラウザが覚えている画面を捨てる（次にログインした人に、前の人の画面が出ないように）
  revalidatePath("/", "layout");
  redirect("/login");
}
