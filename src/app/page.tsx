"use client";

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Methodology from '@/components/Methodology';
import Footer from '@/components/Footer';

// 只對非關鍵的動畫背景使用 dynamic import
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

export default function Home() {
  // 結構化數據（JSON-LD）提升 SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '臺灣規格驅動開發',
    alternateName: 'SDD.tw',
    url: 'https://sdd.tw',
    logo: 'https://sdd.tw/logo.png',
    description: '由水球軟體學院創建的研究組織，專注於推動 SDD（規格驅動開發），實現全自動化開發。',
    foundingDate: '2024',
    founder: {
      '@type': 'Organization',
      name: '水球軟體學院',
      url: 'https://waterballsa.tw',
    },
    sameAs: [
      'https://www.facebook.com/groups/waterballsa.tw',
      'https://github.com/SDD-TW',
      'https://discord.gg/Ymjz7NmZXn',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@waterballsa.tw',
      contactType: 'Customer Service',
    },
  };

  return (
    <>
      {/* 添加結構化數據 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen">
        {/* 動畫背景 */}
        <AnimatedBackground />
        
        <Navbar />
        <main>
          <Hero />
          <Methodology />
        </main>
        <Footer />
      </div>
    </>
  );
}
