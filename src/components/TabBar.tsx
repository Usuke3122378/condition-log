"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "記録", icon: "✎" },
  { href: "/graph", label: "グラフ", icon: "📈" },
  { href: "/settings", label: "設定", icon: "⚙" },
] as const;

/** 画面の下に固定するタブ。今いるタブは色を濃くする */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="画面の切り替え"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-foreground/10 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-sm font-bold ${
                  active ? "text-accent" : "text-foreground/50"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">
                  {tab.icon}
                </span>
                {tab.label}
                <span aria-hidden className={`mt-0.5 h-1 w-8 rounded-full ${active ? "bg-accent" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
