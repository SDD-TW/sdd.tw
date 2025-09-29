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
  // 確保 sitemap 可以被正確訪問
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;