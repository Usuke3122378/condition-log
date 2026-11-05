"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";
import type { AuthFormState } from "./form-state";

const initialState: AuthFormState = { error: null, email: "" };

/**
 * 確認用アカウント（管理画面で作ったダミー）のための、メールアドレスでのログイン。
 * ふつうに使う人は Google だけなので、最初は閉じておき、押したときだけ開く。
 * 残している理由：確認テスト（付録F）に複数のアカウントが要る／スクショに本物のメールアドレスを写さないため
 */
export default function LoginForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(login, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto h-11 px-3 text-sm text-foreground/60 underline"
      >
        確認用アカウントでログイン
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-white p-4">
      <p className="text-sm font-bold">確認用アカウントでログイン</p>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-bold">メールアドレス</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          className="h-12 rounded-xl border border-foreground/20 bg-white px-3 text-base"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-bold">パスワード</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-xl border border-foreground/20 bg-white px-3 text-base"
        />
      </label>

      <p role="alert" className="min-h-6 text-sm text-red-700">
        {pending ? null : state.error}
      </p>

      <div className="flex gap-2">
        <button disabled={pending} className="btn-secondary h-12 flex-1 rounded-2xl disabled:opacity-50">
          {pending ? "ログイン中…" : "ログイン"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="btn-quiet h-12 rounded-2xl px-5 disabled:opacity-50"
        >
          閉じる
        </button>
      </div>
    </form>
  );
}
