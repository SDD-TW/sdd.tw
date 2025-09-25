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
  title: "SDD.tw | 台灣規格驅動開發 | 水球軟體學院研究組織",
  description: "由水球軟體學院創建的研究組織：台灣規格驅動開發，專注於推動 SDD（規格驅動開發），透過遊戲化的分享活動、讀書會和評鑒機制，一起實現全自動化開發。",
  keywords: "SDD, 規格驅動開發, 台灣規格驅動開發, 水球軟體學院, 研究組織, 自動化開發",
  openGraph: {
    title: "SDD.tw | 台灣規格驅動開發 | 水球軟體學院研究組織",
    description: "由水球軟體學院創建的研究組織：台灣規格驅動開發，專注於推動 SDD（規格驅動開發）。",
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
    <html lang="zh-TW" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KZN5SDRL');` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript dangerouslySetInnerHTML={{ __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KZN5SDRL"
height="0" width="0" style="display:none;visibility:hidden"></iframe>` }} />
        {children}
      </body>
    </html>
  );
}
