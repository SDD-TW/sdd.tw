'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// 使用 dynamic import 來避免 SSR 問題
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

const TeamRulesClient = () => {
  return (
    <div className="min-h-screen grid-bg relative">
      {/* 動畫背景 */}
      <AnimatedBackground />

      {/* Hero 背景效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* 頁面標題 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                📖 組隊規則
              </h1>
              <p className="text-xl text-gray-300">
                了解組隊相關規則、計分方式與隊伍管理
              </p>
            </div>

            {/* 內容區域 - Placeholder */}
            <div className="bg-gray-900/60 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🚧</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  內容建置中
                </h2>
                <p className="text-gray-400 mb-8">
                  組隊規則內容正在準備中，敬請期待！
                </p>
                
                {/* 暫時的內容預告 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                      <span>📊</span>
                      <span>計分方式</span>
                    </h3>
                    <p className="text-gray-400 text-sm">
                      詳細說明隊伍積分的計算規則與獎勵機制
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <span>👥</span>
                      <span>隊伍管理</span>
                    </h3>
                    <p className="text-gray-400 text-sm">
                      如何修改隊伍成員、更新隊伍資訊等相關說明
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <span>⏰</span>
                      <span>評鑑機制</span>
                    </h3>
                    <p className="text-gray-400 text-sm">
                      隊伍評鑑的時間安排與評估標準
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                      <span>📜</span>
                      <span>參與規範</span>
                    </h3>
                    <p className="text-gray-400 text-sm">
                      成員參與要求與行為準則
                    </p>
                  </div>
                </div>

                {/* 返回按鈕 */}
                <div className="mt-12">
                  <a
                    href="/rank"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transform hover:scale-105"
                  >
                    返回貢獻榜
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default TeamRulesClient;



