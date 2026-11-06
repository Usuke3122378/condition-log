# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## プロジェクト概要

うつ病（気分の波がある病気）で通院している人が、毎日の体調を 0〜100 の点数で記録し、折れ線グラフで振り返るアプリ（課題②用）。**仕様の正本は `docs/requirements.md`**。実装前に必ず読み、機能ID（F-01〜F-21）・ページ一覧・権限のルールは要件定義書に合わせる。作業の順番は付録E（S1〜S10 → v1.0 → v2.0）、権限の確認テストは付録F。

公開：https://condition-log-eta.vercel.app（Vercel。GitHub の main に push すると自動で更新）／ https://github.com/Usuke3122378/condition-log。本番のサイトでは、確認用アカウントのパスワードを Claude が入力しない（ログインを伴う本番の確認はユーザーが行う）

## コマンド

```bash
npm run dev     # 開発サーバー（http://localhost:3000）
npm run build   # 本番ビルド（型チェックもここで走る）
npm run lint    # ESLint（flat config: eslint.config.mjs）
```

テストフレームワークはまだ入っていない。

## 技術構成

- Next.js 16（App Router, `src/app/`）＋ React 19 ＋ TypeScript（strict）＋ Tailwind CSS v4
  - Next.js は学習データより新しい版。API を書く前に `node_modules/next/dist/docs/` の該当ガイドを読む（AGENTS.md 参照）
  - `next.config.ts` で `cacheComponents: true` と `partialPrefetching: true` が有効。データ取得・キャッシュの書き方はこの前提でドキュメントを確認する。**ログイン中のユーザーごとに違うデータを、ユーザー間で共有されるキャッシュに入れない**
  - Tailwind は `@tailwindcss/turbopack` ローダー経由（`next.config.ts` の `turbopack.rules`）。`globals.css` で `@import "tailwindcss"`、テーマは `@theme inline`
- パスエイリアス：`@/*` → `src/*`
- 予定（S3 以降で導入）：Supabase Auth（メール・パスワード → Google）＋ Supabase（PostgreSQL・シンガポール `ap-southeast-1`）＋ RLS。グラフは無料のライブラリ（Recharts など）

## 全体アーキテクチャ（要件定義書 §1・§4・§6 より）

```
ブラウザ（スマホ） → Next.js（サーバー側でログイン中の人を確認） → Supabase（RLS で見てよい行だけ返す）
```

権限は**二重の守り**で作る（課題①のフィードバック「URL を隠すことと不正アクセスを防ぐことは別」への対応。ここがこのアプリの中心）：

1. **サーバー側**：データを読み書きするすべての処理で、サーバー側で Supabase に「ログイン中のユーザー」を確かめる。**ユーザー ID をブラウザから受け取らない**
2. **データベース側**：すべての表で RLS を有効にする。本人＝自分の行を読む・書く・消す／共有中の家族＝本人の `entries`（点数）を**読むだけ**／それ以外＝何も読めない

- **ログインの確認は `src/lib/auth.ts` の `getCurrentUser()` を使う**（サーバー側で `getClaims()`。いなければ /login へ）。ページでは `<Suspense>` の中の部品で呼ぶ。`src/proxy.ts`（`src/lib/supabase/proxy.ts`）はログイン情報の更新と目安の移動だけで、権限チェックの代わりにしない
- Supabase の接続：サーバーは `src/lib/supabase/server.ts` の `createClient()`（リクエストごとに作る）
- **表を足すときは RLS と GRANT をセットで書く**（`supabase/migrations/` に番号付きで残す）。新しいプロジェクトは新しい表に権限が自動で付かない。確認は `node --env-file=.env.local scripts/check-rls.mjs`
- 確認テスト用のダミーアカウント（A・C、のちに B）の情報は `.env.test.local`（GitHub に載らない）。チャットや記事にパスワードを書かない。**メールでの新規登録はできない**ので、ダミーは Supabase 管理画面の Authentication → Users →「Add user」（Auto Confirm）で作る（理由は要件定義書 付録B）
- 家族に点数だけ見せるため、**メモ（`memos`）・印（`marks`）は `entries` と別の表**にする（RLS は行単位なので、見せたくない項目は表を分ける）
- 招待コードはハッシュで保存し、1回限り・7日で無効
- Supabase の管理用キー（service role key）はアカウント削除（F-17）でだけ、サーバー側で使う

### ページ

| URL | 内容 |
|---|---|
| `/login` | Google でログイン・新規登録／メール・パスワードはログインだけ（新規登録なし）。`/auth/callback` は Google ログインの戻り先（Route Handler） |
| `/`（`?date=YYYY-MM-DD`） | 記録：‹ 日付▾ ›（日付を押すと月カレンダー）＋スライダー（0〜100、最初は50）。記録済みの日は見るだけで「直す」で上書き・消す。「くわしく」で追加の点数・メモ・印（v1.0〜） |
| `/graph` | 折れ線グラフ（1週間／1か月／3か月）・平均・印 |
| `/report` | 通院用まとめ（前回の「通院」の印から今日まで） |
| `/settings`（`/settings/sharing`） | ログアウト・CSV・全削除・アカウント削除・相談窓口・サンプルデータ／共有の管理 |
| `/invite/[招待コード]`・`/shared/[共有ID]` | 家族が招待を受ける・点数のグラフを見る（見るだけ） |

ログイン後の画面は `src/app/(app)/` にまとめ、`(app)/layout.tsx` の下のタブ（`src/components/TabBar.tsx`）で行き来する。今は記録・グラフ・設定の3つ。まとめ（v1.0）を足して4つにする。CSV は `src/app/(app)/settings/export/route.ts`。サンプルデータは `src/lib/sample.ts`（スクショはサンプルで撮る）。`/login` はタブなし。

## 設計の芯（UI・文言で間違えやすい所）

- **軽さ最優先**：記録は「点数を選ぶ → 記録する」で終わる。追加の点数・メモ・印は任意で、最初は閉じておく
- **責めない**：連続記録の日数（ストリーク）・催促の通知は作らない。付け忘れた日はグラフで薄い点線にする（0点と区別する。`ScoreChart.tsx`）
- **評価しない**：点数が低くても励まし・診断めいた文言を出さない。相談窓口は設定画面に静かに置く
- 「医療アプリではない（診断や治療の代わりではない）」と明記する
- 「1日」は日本時間で数える。夜中の記録の扱いは自動にせず、ユーザーが日付を選ぶ

## プロジェクト固有ルール

- **返答・説明はすべて日本語**。ユーザーは初心者なので、専門用語には短い説明を付ける（例：「RLS（データベース自体に『自分の行しか読めない』ルールを付ける仕組み）」）
- **仕様は `docs/requirements.md` が正**。決まったこと・変えたことは、要件定義書の更新履歴・付録B に随時書き足す。「作って見てから変える」方針なので、変更は歓迎
- **小さく作る**：付録E の1ステップずつ実装 → 画面で動作確認 → コミット。MVP は「ボタンひとつ」から積み上げる
- 開発の進め方：Plan Mode で設計 → ユーザー確認 → 実装
- **有料 API・有料サービスは使わない**（Vercel・Supabase とも無料プラン）
- **本名・本物のメールアドレス・本物の体調記録をコード・スクショ・記事・README に入れない**。ダミーのアカウント（例：`a@example.com`）とサンプルデータ（F-11）を使う
- **秘密の値は `.env.local`／Vercel の環境変数だけ**。`NEXT_PUBLIC_` を付けてよいのは Supabase の URL と公開用キーだけ。管理用キー（service role key）には絶対に付けない。秘密の値の入力・Supabase 管理画面の操作はユーザーが自分でやる
- **スマホ（横幅 375px）優先、ボタンは 44px 以上**

## 課題①から引き継ぐ注意

- この版の Next.js は、ページを移動しても前の画面の状態を残す。**ユーザーや日付が切り替わる画面は `key` で作り直す**（課題①で、名前を切り替えると前の人のデータが一瞬出た）
- **データを書き換える処理・ログイン・ログアウトの Server Action では `revalidatePath("/", "layout")` を呼ぶ**。この版の Next.js はブラウザ側で表示したページを覚えて使い回すため、呼ばないと保存前の点数や、前にログインしていた人の画面が出る（S5 で発生）
- 2つの画面・2人が同じデータを触る場合（例：家族が見ている間に本人が直す、共有を止める）は、画面を開いたままでも最新の状態に読み直すしくみを考える
