import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "体調きろく",
  description: "毎日の体調を点数で記録して、グラフでふり返るアプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
