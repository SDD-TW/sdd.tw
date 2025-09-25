'use client';

import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// 使用 dynamic import 來避免 SSR 問題
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

const JoinClientPage: NextPage = () => {
  return (
    <div className="min-h-screen grid-bg relative">
      {/* 動畫背景 */}
      <AnimatedBackground />

      {/* Hero 背景效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px]" />
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="pt-24 flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">加入我們</h1>
              <p className="mt-4 text-lg text-gray-300">
                歡迎加入臺灣規格驅動開發社群！
              </p>
            </div>
            
            {/* Google Form */}
            <div className="mt-16 gform-wrap">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSewrtus0F-AgE0KL5fHSulYl0FAnoOm6wtg-sPIMg2smKxZsA/viewform?embedded=true" 
                loading="lazy"
                title="AI 軟工百倍研究組織"
              ></iframe>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default JoinClientPage;
