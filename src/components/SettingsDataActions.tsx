"use client";

import { useState, useTransition } from "react";
import { addSampleData, deleteAllRecords } from "@/app/(app)/settings/actions";

type Message = { kind: "ok" | "error"; text: string } | null;

/** 「すべての記録を消す」（その場で確かめる） */
export function DeleteAllButton() {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAllRecords();
      setConfirming(false);
      setMessage(
        result.ok
          ? { kind: "ok", text: result.count > 0 ? `${result.count}件の記録を消しました` : "消す記録はありませんでした" }
          : { kind: "error", text: result.error },
      );
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {confirming ? (
        <div className="flex flex-col gap-2 rounded-xl bg-red-50 p-3">
          <p className="text-sm font-bold text-red-800">すべての記録を消しますか？元に戻せません。</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="h-11 flex-1 rounded-xl bg-red-700 font-bold text-white disabled:opacity-50"
            >
              {pending ? "消しています…" : "すべて消す"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="btn-quiet h-11 flex-1 rounded-xl disabled:opacity-50"
            >
              やめる
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setConfirming(true);
            setMessage(null);
          }}
          className="h-11 rounded-xl border-2 border-red-700 bg-white font-bold text-red-700 shadow-sm active:bg-red-50"
        >
          すべての記録を消す
        </button>
      )}
      <Status message={message} />
    </div>
  );
}

/** 「サンプルを入れる」 */
export function SampleDataButton() {
  const [message, setMessage] = useState<Message>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const result = await addSampleData();
      setMessage(
        result.ok
          ? { kind: "ok", text: result.count > 0 ? `${result.count}日分を入れました。グラフで見られます` : "入れられる日がありませんでした" }
          : { kind: "error", text: result.error },
      );
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAdd}
        disabled={pending}
        className="btn-secondary h-11 rounded-xl disabled:opacity-50"
      >
        {pending ? "入れています…" : "サンプルを入れる"}
      </button>
      <Status message={message} />
    </div>
  );
}

function Status({ message }: { message: Message }) {
  return (
    <p role="status" className={`min-h-5 text-sm ${message?.kind === "error" ? "text-red-700" : "text-accent"}`}>
      {message?.text}
    </p>
  );
}
