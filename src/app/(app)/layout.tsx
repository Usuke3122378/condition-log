import TabBar from "@/components/TabBar";

/** ログイン後の画面（記録・グラフ…）。下にタブを出す。/login はこのフォルダの外なのでタブは出ない */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* タブに隠れないよう、下に余白を取る */}
      <div className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</div>
      <TabBar />
    </>
  );
}
