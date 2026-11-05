import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 開発中に、同じ Wi-Fi のスマホから開いても画面が動くようにする
  // （http://192.168.x.x:3000 と、番号が変わらないパソコンの名前 http://MacBook-Air.local:3000）
  allowedDevOrigins: ["192.168.*.*", "*.local"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
