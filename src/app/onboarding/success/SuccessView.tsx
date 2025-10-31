'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, MessageCircle, UserPlus, BookOpen, Trophy } from 'lucide-react';

// 使用 dynamic import 來避免 SSR 問題
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

// 定義步驟狀態型別
type StepStatus = 'completed' | 'pending' | 'skipped' | 'coming-soon';

// 定義步驟介面
interface Step {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: StepStatus;
}

const SuccessView = () => {
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState<string>('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [isPaidMember, setIsPaidMember] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [userProgress, setUserProgress] = useState({
    discordJoined: false,
    newbieTaskStarted: false,
    newbieTaskCompleted: false,
    lastVisit: ''
  });

  useEffect(() => {
    const id = searchParams?.get('studentId');
    const paidMember = searchParams?.get('isPaidMember');
    
    if (id) {
      setStudentId(id);
    }
    
    if (paidMember === 'true') {
      setIsPaidMember(true);
    }
    
    setIsHydrated(true);
    
    // 觸發成功動畫
    setTimeout(() => setShowAnimation(true), 100);
  }, [searchParams]);

  // 學員狀態追蹤 useEffect
  useEffect(() => {
    if (!isHydrated) return;

    // 從 localStorage 載入學員進度
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setUserProgress(parsedProgress);
        
        // 更新最後訪問時間（只在客戶端）
        const updatedProgress = {
          ...parsedProgress,
          lastVisit: new Date().toISOString()
        };
        localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
      } catch (error) {
        console.error('❌ 載入學員進度失敗:', error);
        
        // 如果載入失敗，至少更新訪問時間
        const defaultProgress = {
          discordJoined: false,
          newbieTaskStarted: false,
          newbieTaskCompleted: false,
          lastVisit: new Date().toISOString()
        };
        localStorage.setItem('userProgress', JSON.stringify(defaultProgress));
      }
    } else {
      // 如果沒有儲存的進度，建立新的
      const newProgress = {
        discordJoined: false,
        newbieTaskStarted: false,
        newbieTaskCompleted: false,
        lastVisit: new Date().toISOString()
      };
      setUserProgress(newProgress);
      localStorage.setItem('userProgress', JSON.stringify(newProgress));
    }
  }, [isHydrated]);

  // 追蹤用戶行為的函數
  const trackUserAction = (action: keyof typeof userProgress, value: boolean = true) => {
    const updatedProgress = {
      ...userProgress,
      [action]: value,
      lastVisit: new Date().toISOString()
    };
    setUserProgress(updatedProgress);
    localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
    
    console.log(`📊 學員行為追蹤: ${action} = ${value}`);
  };

  const steps: Step[] = isPaidMember ? [
    {
      number: 1,
      icon: MessageCircle,
      title: '檢查 Discord 歡迎通知',
      description: '我們已經在 Discord 發送歡迎訊息，請查看並確認收到通知',
      status: 'completed' as const,
    },
    {
      number: 2,
      icon: UserPlus,
      title: '檢查 GitHub 協作邀請',
      description: '我們已經發送 GitHub repo 協作邀請到你的信箱，請檢查並接受邀請',
      status: 'completed' as const,
    },
    {
      number: 3,
      icon: BookOpen,
      title: '開始參與開源專案',
      description: '接受邀請後，你將擁有 triage 權限，可以開始參與 SDD.os 專案開發',
      status: 'pending' as const,
    },
    {
      number: 4,
      icon: Trophy,
      title: '享受課金玩家專屬資源',
      description: '你現在可以參與所有課金玩家專屬的學習資源和活動',
      status: 'pending' as const,
    },
    {
      number: 5,
      icon: CheckCircle,
      title: '新手任務（已跳過）',
      description: '課金玩家身份讓你直接跳過新手任務階段，享受完整權限',
      status: 'skipped' as const,
    },
  ] : [
    {
      number: 1,
      icon: MessageCircle,
      title: '加入 Discord 社群',
      description: '點擊下方按鈕加入我們的 Discord 社群，與其他成員交流學習',
      status: 'completed' as const,
    },
    {
      number: 2,
      icon: BookOpen,
      title: '完成新手任務',
      description: '完成任務 0-4 後提交審核表單，獲得正式成員資格和專屬新手獎勵 Prompt',
      status: 'pending' as const,
    },
    {
      number: 3,
      icon: UserPlus,
      title: '成為正式成員',
      description: '完成新手任務後，成為臺灣規格驅動開發社群的正式成員，獲得 SDD.os repo 權限，一起為社群貢獻',
      status: 'pending' as const,
    },
    {
      number: 4,
      icon: Trophy,
      title: '開始學習 SDD',
      description: '參與讀書會、分享會，與其他成員共同實踐全自動化開發',
      status: 'pending' as const,
    },
  ];

  return (
    <div className="min-h-screen grid-bg relative">
      {/* 動畫背景 */}
      <AnimatedBackground />

      {/* Hero 背景效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="pt-24 flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-32">
            {/* 成功動畫和標題 */}
            <div className={`text-center mb-16 transition-all duration-700 ${isHydrated && showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <CheckCircle className="w-24 h-24 text-[#00FF9F] animate-scale-in" />
                  <div className="absolute inset-0 animate-ping">
                    <CheckCircle className="w-24 h-24 text-[#00FF9F] opacity-20" />
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
                {isPaidMember ? '🏆 課金玩家報名成功！' : '🎉 報名成功！'}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6">
                {isPaidMember 
                  ? '歡迎加入臺灣規格驅動開發研究組織！' 
                  : '歡迎加入臺灣規格驅動開發社群！'
                }
              </p>

              {studentId && (
                <div className="inline-block bg-[#00F0FF]/10 border-2 border-[#00F0FF] rounded-lg px-6 py-3 animate-fade-in">
                  <p className="text-[#00F0FF] font-mono text-lg">
                    你的學號：<span className="font-bold">{studentId}</span>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    （課金玩家專屬 - 已發送 GitHub 協作邀請）
                  </p>
                </div>
              )}
            </div>

            {/* 後續流程說明 */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 md:p-12 border border-gray-800 mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                  接下來該做什麼？
                </h2>

                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <div
                      key={step.number}
                      className={`flex items-start space-x-4 transition-all duration-500 ${
                        isHydrated && showAnimation ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                      }`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      {/* 步驟圖示 */}
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                          step.status === 'coming-soon'
                            ? 'bg-gray-700/50 border-gray-600'
                            : step.status === 'completed'
                            ? 'bg-green-500/20 border-green-500'
                            : step.status === 'skipped'
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-[#00F0FF]/10 border-[#00F0FF]'
                        }`}>
                          <step.icon className={`w-8 h-8 ${
                            step.status === 'coming-soon' 
                              ? 'text-gray-500' 
                              : step.status === 'completed'
                              ? 'text-green-400'
                              : step.status === 'skipped'
                              ? 'text-purple-400'
                              : 'text-[#00F0FF]'
                          }`} />
                        </div>
                      </div>

                      {/* 步驟內容 */}
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-gray-500 font-bold">步驟 {step.number}</span>
                          <h3 className={`text-xl font-bold ${
                            step.status === 'coming-soon' 
                              ? 'text-gray-500' 
                              : step.status === 'completed'
                              ? 'text-green-400'
                              : step.status === 'skipped'
                              ? 'text-purple-400'
                              : 'text-white'
                          }`}>
                            {step.title}
                          </h3>
                          {step.status === 'coming-soon' && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                              即將推出
                            </span>
                          )}
                          {step.status === 'completed' && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                              已完成
                            </span>
                          )}
                          {step.status === 'skipped' && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                              已跳過
                            </span>
                          )}
                        </div>
                        <p className={`${
                          step.status === 'coming-soon' 
                            ? 'text-gray-600' 
                            : step.status === 'completed'
                            ? 'text-green-300'
                            : step.status === 'skipped'
                            ? 'text-purple-300'
                            : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>

                        {/* Discord 按鈕 - 只對非課金玩家顯示 */}
                        {step.number === 1 && !isPaidMember && (
                          <div className="mt-4">
                            {/* Discord 按鈕已移除 */}
                          </div>
                        )}

                        {/* 新手任務按鈕 - 只對非課金玩家顯示 */}
                        {step.number === 2 && !isPaidMember && (
                          <div className="mt-6">
                            {/* 主要 CTA 按鈕 */}
                            <div className="text-center mb-6">
                              <a
                                href="https://waterballs.tw/5w1b1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-green-400/30 cursor-pointer"
                                onClick={() => trackUserAction('newbieTaskStarted')}
                              >
                                <div className="flex items-center space-x-3">
                                  <span>開始新手任務</span>
                                </div>
                              </a>
                              <p className="text-gray-400 text-sm mt-2">
                                點擊上方按鈕前往入會任務頁面
                              </p>
                            </div>

                            {/* 重要提醒和獎勵說明 */}
                            <div className="space-y-3">
                              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-yellow-300 text-sm font-medium mb-1">⚠️ 重要提醒</p>
                                <p className="text-yellow-200 text-xs mb-2">
                                  無課玩家請務必在 <span className="font-bold">30 天內</span> 完成任務，否則將會失去資格。
                                </p>
                                <p className="text-yellow-200 text-xs">
                                  若任務失敗，再次報名需繳交 <span className="font-bold text-red-300">300 元</span> 才能重新參與。
                                </p>
                              </div>
                              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-blue-300 text-sm font-medium mb-1">🎁 完成任務獎勵</p>
                                <p className="text-blue-200 text-xs">
                                  完成新手任務後，將獲得專屬的 <span className="font-bold">新手獎勵 Prompt</span>，幫助你更好地學習 SDD！
                                </p>
                              </div>
                              {isHydrated && userProgress.newbieTaskStarted && (
                                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                  <p className="text-green-300 text-sm font-medium mb-1">✅ 已開始新手任務</p>
                                  <p className="text-green-200 text-xs">
                                    記得完成任務後提交審核表單，並在 Discord 發送通知！
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 正式成員說明 - 只對非課金玩家顯示 */}
                        {step.number === 3 && !isPaidMember && (
                          <div className="mt-4 space-y-3">
                            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-4">
                              <p className="text-green-300 text-sm font-medium mb-2">🎯 成為正式成員的使命</p>
                              <p className="text-green-200 text-xs mb-2">
                                你將成為 <span className="font-bold text-green-300">臺灣規格驅動開發社群</span> 的正式成員，
                                與其他開發者一起推動全自動化開發的實踐！
                              </p>
                              <p className="text-green-200 text-xs">
                                完成任務，你將獲得免費存取完整全自動規格驅動開發的原始碼權限，可以使用這個 repo 來學習和優化SDD技術。
                               
                              </p>
                            </div>
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                              <p className="text-purple-300 text-sm font-medium mb-1">💎 正式成員專屬權益</p>
                              <div className="text-purple-200 text-xs space-y-1">
                                <p>• 獲得 SDD.os GitHub repo 協作權限</p>
                                <p>• 參與內部技術討論和 Code Review</p>
                                <p>• 優先參與讀書會和分享會</p>
                                <p>• 獲得專屬新手獎勵 Prompt</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 視覺化流程圖 */}
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-6 text-center">
                  你的學習旅程
                </h3>
                
                <div className="flex items-center justify-center">
                  {(isPaidMember ? [
                    { stage: '課金玩家', emoji: '💰', description: '永久成員身份' },
                    { stage: '水球軟體學院', emoji: 'logo', description: 'AI x BDD 全自動規格驅動開發 課程' },
                    { stage: 'SDD 專家', emoji: '🚀', description: '透過課程和研究組織交流晉升' }
                  ] : [
                    { stage: '新手成員', emoji: '👋', description: '當前階段' },
                    { stage: '正式成員', emoji: '🎓', description: '完成任務後' },
                    { stage: 'SDD 專家', emoji: '🚀', description: '進階階段' }
                  ]).map((stage, index) => (
                    <div key={stage.stage} className="flex items-center">
                      {stage.stage === '水球軟體學院' ? (
                        <a
                          href="https://world.waterballsa.tw/ai-bdd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center hover:scale-105 transition-transform duration-200 cursor-pointer"
                        >
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 mb-2 mx-auto ${
                            index === 0
                              ? 'bg-[#00F0FF]/20 border-[#00F0FF]'
                              : 'bg-gray-700/20 border-gray-600'
                          } hover:border-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all duration-200`}>
                            {stage.emoji === 'logo' ? (
                              <Image 
                                src="/logo_wsa.png" 
                                alt="水球軟體學院" 
                                width={48}
                                height={48}
                                className="object-contain flex-shrink-0"
                              />
                            ) : (
                              <span className="text-2xl flex items-center justify-center">{stage.emoji}</span>
                            )}
                          </div>
                          <p className={`text-sm font-medium ${
                            index === 0 ? 'text-[#00F0FF]' : 'text-gray-500'
                          } hover:text-[#00F0FF] transition-colors duration-200`}>
                            {stage.stage}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 hover:text-gray-400 transition-colors duration-200">
                            {stage.description}
                          </p>
                        </a>
                      ) : (
                        <div className="text-center">
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 mb-2 mx-auto ${
                            index === 0
                              ? 'bg-[#00F0FF]/20 border-[#00F0FF]'
                              : 'bg-gray-700/20 border-gray-600'
                          }`}>
                            {stage.emoji === 'logo' ? (
                              <Image 
                                src="/logo_wsa.png" 
                                alt="水球軟體學院" 
                                width={48}
                                height={48}
                                className="object-contain flex-shrink-0"
                              />
                            ) : (
                              <span className="text-2xl flex items-center justify-center">{stage.emoji}</span>
                            )}
                          </div>
                          <p className={`text-sm font-medium ${
                            index === 0 ? 'text-[#00F0FF]' : 'text-gray-500'
                          }`}>
                            {stage.stage}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {stage.description}
                          </p>
                        </div>
                      )}
                      {index < (isPaidMember ? 2 : 2) && (
                        <div className="w-16 h-1 bg-gray-700 mx-4" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    當前階段：<span className="text-[#00F0FF] font-bold">
                      {isPaidMember ? '課金玩家' : '新手成員'}
                    </span>
                  </p>
                  {isPaidMember && (
                    <p className="text-gray-500 text-xs mt-2">
                      課金玩家身份 • 永久成員 • 透過課程和研究組織交流晉升為 SDD 專家
                    </p>
                  )}
                </div>
              </div>

              {/* 課金玩家專屬按鈕 */}
              {isPaidMember && (
                <div className="mt-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Discord 研究員交流區按鈕 */}
                    <a
                      href="https://discord.com/channels/1295275227848249364/1384107447018590372"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg text-center transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>進入研究員交流區</span>
                    </a>
                    
                    {/* 排行榜按鈕 */}
                    <Link
                      href="/rank"
                      className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg text-center transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                    >
                      <Trophy className="w-5 h-5" />
                      <span>查看排行榜</span>
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default SuccessView;
