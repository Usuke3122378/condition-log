import { todayInTokyo } from "@/lib/dates";
import { getAllEntries } from "@/lib/entries";

/**
 * 自分の全記録を CSV でダウンロードする（F-08）。
 * だれの記録かはサーバー側で決める（getAllEntries の中で getCurrentUser）。ログインしていなければ /login へ
 */
export async function GET() {
  const entries = await getAllEntries();

  // 先頭の ﻿（BOM）は、Excel で開いたときに日本語が文字化けしないための印
  const lines = ["日付,体調", ...entries.map((e) => `${e.date},${e.score}`)];
  const csv = "﻿" + lines.join("\r\n") + "\r\n";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="taichou-kiroku-${todayInTokyo()}.csv"`,
      // 体調の記録なので、途中のサーバーやブラウザに残さない
      "Cache-Control": "private, no-store",
    },
  });
}
