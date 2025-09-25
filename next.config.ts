import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    PORT: "3000",
  },
  // 明確設置端口
  serverRuntimeConfig: {
    port: 3000,
  },
  // 確保在生產環境中也可用
  publicRuntimeConfig: {
    port: 3000,
  },
};

export default nextConfig;