import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // 優化字體加載，防止 FOIT
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "SDD.tw | 臺灣規格驅動開發 | 水球軟體學院",
  description: "由水球軟體學院創建的研究組織：臺灣規格驅動開發，專注於推動 SDD（規格驅動開發），透過遊戲化的分享活動、讀書會和評鑒機制，一起實現全自動化開發。",
  keywords: "SDD, 規格驅動開發, 臺灣規格驅動開發, 台灣規格驅動開發, 水球軟體學院, 研究組織, 自動化開發, Spec-Driven Development, BDD, 測試驅動開發, AI 開發",
  authors: [{ name: "水球軟體學院", url: "https://waterballsa.tw" }],
  creator: "水球軟體學院",
  publisher: "臺灣規格驅動開發",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SDD.tw | 臺灣規格驅動開發 | 水球軟體學院",
    description: "由水球軟體學院創建的研究組織：臺灣規格驅動開發，專注於推動 SDD（規格驅動開發）。",
    url: "https://sdd.tw",
    siteName: "臺灣規格驅動開發",
    locale: "zh_TW",
    type: "website",
    images: [
      {
        url: "https://sdd.tw/og-image.png",
        width: 1200,
        height: 630,
        alt: "臺灣規格驅動開發 - 致力於在臺推動 SDD（100% 全自動化開發準開源技術）來擴大臺灣軟體公司經濟規模百倍",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SDD.tw | 臺灣規格驅動開發",
    description: "專注於推動 SDD（規格驅動開發），實現全自動化開發。",
    images: ["https://sdd.tw/og-image.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://sdd.tw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning={true}>
      <head>
        {/* 顯式添加 meta description 以確保 SEO */}
        <meta name="description" content="由水球軟體學院創建的研究組織：臺灣規格驅動開發，專注於推動 SDD（規格驅動開發），透過遊戲化的分享活動、讀書會和評鑒機制，一起實現全自動化開發。" />
        <meta name="keywords" content="SDD, 規格驅動開發, 臺灣規格驅動開發, 台灣規格驅動開發, 水球軟體學院, 研究組織, 自動化開發, Spec-Driven Development, BDD, 測試驅動開發, AI 開發" />
        
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TSHD5WVV');` }} />
        
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TSHD5WVV"
height="0" width="0" style="display:none;visibility:hidden"></iframe>` }} />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
