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
  
  // 性能優化配置
  compress: true, // 啟用 gzip 壓縮
  poweredByHeader: false, // 移除 X-Powered-By header
  
  // 圖片優化
  images: {
    formats: ['image/avif', 'image/webp'], // 使用現代圖片格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  
  // 實驗性功能優化
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-syntax-highlighter'],
  },
  
  // URL rewrites
  async rewrites() {
    return [
      {
        source: '/sitemap-20251008.xml',
        destination: '/api/sitemap-20251008',
      },
    ];
  },
  
  // 301 重定向：www.sdd.tw -> sdd.tw
  // 
  // ✅ 選項 A：在 Zeabur Dashboard 配置（當前方案）
  // 
  // 重定向已移至 Zeabur Dashboard 平台層面配置：
  // 1. 登入 https://dash.zeabur.com
  // 2. 選擇 "sdd-tw" 專案
  // 3. 進入「域名」設定
  // 4. 找到 "www.sdd.tw" 並設定為「重定向到主域名」
  //
  // 優點：
  // - 在平台層面處理，更有效率
  // - 避免 Next.js 層面和平台層面的重定向衝突
  // - 符合最佳實踐
  //
  // 如果需要恢復 Next.js 重定向，取消下面註釋：
  // async redirects() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       has: [
  //         {
  //           type: 'host',
  //           value: 'www.sdd.tw',
  //         },
  //       ],
  //       destination: 'https://sdd.tw/$1',
  //       permanent: true,
  //     },
  //   ];
  // },
  
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
      {
        source: '/sitemap-20251008.xml',
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
      {
        // 為靜態資源添加緩存
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/(.*)\\.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;