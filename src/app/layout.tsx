import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "水球軟體學院 | SDD 台灣社群",
  description: "專屬台灣推動 SDD（Spec 驅動開發）的社群，透過遊戲化的分享活動、讀書會和評鑒機制，一起實現全自動化開發",
  keywords: "SDD, Spec 驅動開發, 水球軟體學院, 台灣社群, 自動化開發, 讀書會, 遊戲化學習",
  openGraph: {
    title: "水球軟體學院 | SDD 台灣社群",
    description: "專屬台灣推動 SDD（Spec 驅動開發）的社群，透過遊戲化的分享活動、讀書會和評鑒機制，一起實現全自動化開發",
    url: "https://waterballsa.tw",
    siteName: "水球軟體學院",
    locale: "zh_TW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
