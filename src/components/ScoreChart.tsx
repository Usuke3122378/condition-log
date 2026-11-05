"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatJapaneseDate, formatShortDate } from "@/lib/dates";

export type ChartPoint = {
  date: string; // "2026-11-05"
  score: number | null; // 記録のない日は null（線を途切れさせる）
};

const ACCENT = "#2f8f83";

/** 体調の点数の折れ線グラフ。良い悪いの色分けはしない（評価しない） */
export default function ScoreChart({ points }: { points: ChartPoint[] }) {
  // スマホ幅で日付が重ならないよう、目盛りはおよそ6つに間引く
  const step = Math.max(1, Math.ceil(points.length / 6));
  const ticks = points.filter((_, i) => (points.length - 1 - i) % step === 0).map((p) => p.date);
  // 期間が長いときは点を小さくする（ただし必ず出す。前後に記録がない1日だけの点が消えないように）
  const dotRadius = points.length <= 31 ? 4 : 2.5;

  return (
    <div className="h-64 w-full" role="img" aria-label="体調の点数の折れ線グラフ">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 24, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#e3ebe9" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={formatShortDate}
            tick={{ fontSize: 12, fill: "#5b6664" }}
            tickLine={false}
            axisLine={{ stroke: "#cfd8d6" }}
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fontSize: 12, fill: "#5b6664" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value}点`, "体調"]}
            labelFormatter={(label) => formatJapaneseDate(String(label))}
            contentStyle={{ borderRadius: 12, borderColor: "#cfd8d6" }}
          />
          {/* 下に敷く細い点線：記録のない日をまたいでつなぐ（波を読み取れるように。0点とは区別できる） */}
          <Line
            type="monotone"
            dataKey="score"
            stroke={ACCENT}
            strokeOpacity={0.45}
            strokeWidth={1.5}
            strokeDasharray="3 4"
            connectNulls
            dot={false}
            activeDot={false}
            tooltipType="none"
            isAnimationActive={false}
          />
          {/* 上に重ねる太い線：記録のある日どうし（記録のない日で途切れる） */}
          <Line
            type="monotone"
            dataKey="score"
            stroke={ACCENT}
            strokeWidth={3}
            connectNulls={false}
            dot={{ r: dotRadius, fill: ACCENT, stroke: "white", strokeWidth: dotRadius > 3 ? 2 : 1 }}
            activeDot={{ r: 7, fill: ACCENT, stroke: "white", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
