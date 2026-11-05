"use client";

import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { loginWithGoogle } from "./actions";

/** 「Googleでログイン」。はじめての方も、これでそのまま登録される */
export function GoogleLoginButton() {
  return (
    <form action={loginWithGoogle}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-foreground/25 bg-white text-lg font-bold shadow-sm active:bg-foreground/5 disabled:opacity-50"
    >
      <GoogleMark />
      {pending ? "Google に移動中…" : "Googleでログイン"}
    </button>
  );
}

/** Google の「G」を4色の文字で表す（ロゴ画像は使わない） */
function GoogleMark() {
  return (
    <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full border border-foreground/15 text-base font-black">
      <span className="bg-[conic-gradient(#ea4335_0_25%,#fbbc05_0_50%,#34a853_0_75%,#4285f4_0)] bg-clip-text text-transparent">G</span>
    </span>
  );
}

/** Google から戻ってきてうまくいかなかったとき（/login?error=google）のお知らせ */
export function GoogleLoginError() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "google") return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
      Google でのログインがうまくいきませんでした。もう一度試してください。
    </p>
  );
}
