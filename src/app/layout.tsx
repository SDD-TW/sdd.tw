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
  title: "台灣規格驅動開發 | 水球軟體學院研究組織",
  description: "由水球軟體學院創建的研究組織：台灣規格驅動開發，專注於推動 SDD（Spec 驅動開發），透過遊戲化的分享活動、讀書會和評鑒機制，一起實現全自動化開發。",
  keywords: "SDD, Spec 驅動開發, 台灣規格驅動開發, 水球軟體學院, 研究組織, 自動化開發",
  openGraph: {
    title: "台灣規格驅動開發 | 水球軟體學院研究組織",
    description: "由水球軟體學院創建的研究組織：台灣規格驅動開發，專注於推動 SDD（Spec 驅動開發）。",
    url: "https://sdd.tw", // 假設一個新的網域
    siteName: "台灣規格驅動開發",
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
