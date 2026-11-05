"use client";

import { useActionState, useState } from "react";
import { authenticate } from "./actions";
import { MIN_PASSWORD_LENGTH, type AuthFormState } from "./form-state";

type Mode = "login" | "signup";

const initialState: AuthFormState = { error: null, email: "" };

const TEXT: Record<Mode, { lead: string; passwordLabel: string; submit: string; pending: string }> = {
  login: {
    lead: "登録したメールアドレスとパスワードを入れてください。",
    passwordLabel: "パスワード",
    submit: "ログイン",
    pending: "ログイン中…",
  },
  signup: {
    lead: "はじめての方は、メールアドレスと、これから使うパスワードを決めて登録してください。",
    passwordLabel: `パスワードを決める（${MIN_PASSWORD_LENGTH}文字以上）`,
    submit: "登録してはじめる",
    pending: "登録中…",
  },
};

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="flex flex-col gap-5">
      {/* ログイン／新規登録の切り替え */}
      <div role="tablist" aria-label="ログインか新規登録を選ぶ" className="grid grid-cols-2 rounded-2xl border-2 border-accent/40 bg-accent/15 p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`h-11 rounded-xl font-bold ${mode === m ? "bg-white text-accent shadow" : "text-foreground/70"}`}
          >
            {m === "login" ? "ログイン" : "はじめての方（新規登録）"}
          </button>
        ))}
      </div>

      {/* 切り替えたら入力とエラーを空にするため、key で作り直す */}
      <AuthForm key={mode} mode={mode} />
    </div>
  );
}

function AuthForm({ mode }: { mode: Mode }) {
  const [state, formAction, pending] = useActionState(authenticate, initialState);
  const text = TEXT[mode];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="intent" value={mode} />
      <p className="text-sm text-foreground/80">{text.lead}</p>

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
        <span className="text-sm font-bold">{text.passwordLabel}</span>
        <input
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={MIN_PASSWORD_LENGTH}
          className="h-12 rounded-xl border border-foreground/20 bg-white px-3 text-base"
        />
      </label>

      <p role="alert" className="min-h-6 text-sm text-red-700">
        {pending ? null : state.error}
      </p>

      <button
        disabled={pending}
        className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-white active:opacity-80 disabled:opacity-50"
      >
        {pending ? text.pending : text.submit}
      </button>
    </form>
  );
}
