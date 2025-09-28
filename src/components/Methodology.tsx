"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SpecificationSpectrum from './SpecificationSpectrum'; // This will be created next

const Methodology = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const myths = [
    {
      title: '誤解為「文件驅動」',
      description: '以為只是「撰寫一堆文件」就叫做「規格驅動開發」，那為何不稱之為「文件驅動開發」就好？幹嘛又要發明一個新名詞 SDD？',
    },
    {
      title: '規格無限制：對系統分析專業一知半解',
      description: '對系統分析專業一知半解，無法分清楚業務規格和各種技術規格，把 SDD 變得和一般 Prompt/Context Engineering 沒兩樣。',
    },
    {
      title: '團隊導入與衡量困難',
      description: '難以導入團隊，以為寫一堆 PRD、User Story 就叫 SDD，但對於 AI 開發及 AI 與工程師的共識精度卻毫無計算標準。',
    },
    {
      title: '缺乏工程文化上的信任',
      description: '工程師不想寫文件，總是讓 AI 產文件，卻怠於判斷文件的精度。長久以往，大家對 SDD 半信半疑，燒一堆 AI Tokens 卻燒不出成效。',
    },
  ];

  return (
    <section id="methodology" className="section relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      <div  className="container mx-auto relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* Section 0: What is SDD */}
          <motion.div variants={itemVariants} className="mb-24">
            <div className="text-center mb-16">
                <h2 className="heading gradient-text">什麼是 SDD？</h2>
                <p className="subheading">
                SDD（規格驅動開發 / Spec-Driven Development）是一種 Vibe Coding/ AI Coding 的實踐，希望能夠在 Vibe Coding 的浪潮中撥亂反正，強調以<strong className="text-cyan-400">「規格為核心」</strong>來驅動 AI 盡可能做到<strong className="text-cyan-400">「高精度」</strong>的開發。
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-blue-400">為何要實踐 SDD？</h3>
                  <p className="text-gray-300">
                    SDD 讓你能夠不再需要與 AI 無效率地一來一往地來回下 Prompt 修 Code，而是可以專注於業務邏輯，而不是重複性的 Prompt Engineering 工作。
                  </p>
                  <p className="text-gray-300">
                    我們致力於推廣 SDD 方法論，幫助台灣的開發者及企業快速掌握這項未來技術，提升開發效率和程式碼品質。
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>關注點左移：全力寫好規格，功能便能開發到位 → 企業軟體產值百倍</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>減少大量 Human Error → 減少 90% 的錯誤和 bug</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>DevOps：自動化測試和部署流程</span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-md"></div>
                  <div className="relative bg-gray-900/80 p-6 rounded-lg border border-gray-800">
                    <pre className="text-sm overflow-x-auto">
                      <code className="language-gherkin">
                        <span className="text-pink-400">Feature:</span> 優惠券折扣計算
                        <br />
                        <br />
                        <span className="text-pink-400">Scenario:</span> VIP 會員套用多張優惠券
                        <br />
                        {"  "}
                        <span className="text-pink-400">Given</span>{" "}
                        一位 VIP 會員的購物車內有以下商品:
                        <br />
                        <span className="text-gray-400">
                          {"    "}| 商品 | 價格 | 數量 |
                        </span>
                        <br />
                        <span className="text-gray-400">
                          {"    "}| 筆記型電腦 | 30000 | 1 |
                        </span>
                        <br />
                        <span className="text-gray-400">
                          {"    "}| 滑鼠 | 1500 | 1 |
                        </span>
                        <br />
                        {"  "}
                        <span className="text-pink-400">And</span>{" "}
                        該使用者擁有一張{" "}
                        <span className="text-green-400">"10% 折扣"</span>{" "}
                        的百分比優惠券
                        <br />
                        {"  "}
                        <span className="text-pink-400">And</span>{" "}
                        該使用者擁有一張{" "}
                        <span className="text-green-400">"折抵 500 元"</span>{" "}
                        的固定金額優惠券
                        <br />
                        {"  "}
                        <span className="text-pink-400">When</span>{" "}
                        使用者在訂單上套用這些優惠券
                        <br />
                        {"  "}
                        <span className="text-pink-400">Then</span>{" "}
                        最終總金額應為{" "}
                        <span className="text-yellow-400">27850</span>
                        <br />
                      </code>
                    </pre>
                  </div>
                </div>
            </div>
          </motion.div>

          {/* Section 1: Myths about SDD */}
          <motion.div variants={itemVariants} className="text-center mb-24">
            <h2 className="heading gradient-text">可是，SDD 並不單純，你很有可能犯下以下錯誤</h2>
            <p className="subheading">
              如果無法掌握核心精神，導入 SDD 往往會落入以下陷阱，導致效率不增反減：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
              {myths.map((myth, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-red-900/20 backdrop-blur-sm p-6 rounded-lg border border-red-800/50 text-left transition-all duration-300 hover:border-red-600/80 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105"
                >
                  <div className="flex items-start">
                    <div className="text-4xl font-black text-red-500/80 mr-4 font-mono">{index + 1}.</div>
                    <div>
                      <h3 className="text-xl font-bold text-red-400 mb-2">{myth.title}</h3>
                      <p className="text-gray-300 text-base">{myth.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section 2: The Spectrum of Specifications */}
          <motion.div variants={itemVariants} className="mb-24">
            <div className="text-center mb-12">
                <h2 className="heading gradient-text">方法論的根本：你必須了解「規格的光譜」</h2>
                <p className="subheading">
                要實踐 SDD，你必須先掌握「規格的光譜」。規格是有光譜的，你必須定義清楚「光譜兩端」的規格分別有什麼性質。
                </p>
            </div>
            <SpecificationSpectrum />
          </motion.div>
          
          {/* Section 3: The Future of SDD.TW */}
          <motion.div variants={itemVariants} className="text-center mb-24">
            <h2 className="heading gradient-text">SDD.TW 致力於構建軟體開發的未來</h2>
             <p className="subheading">
               SDD.TW 相信，未來 Vibe Coding / SDD 的趨勢，一定是「DSL-Level 可執行規格」＋「ISA-Level 可執行規格」的組合實踐和技術。
             </p>
            <p className="mt-8 text-2xl font-semibold text-cyan-300 animate-pulse" style={{ textShadow: '0 0 15px rgba(46, 233, 255, 0.6)' }}>
              想像一下，未來產品開發的流程長這樣
            </p>

            <div className="mt-12 w-full max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6">
                
                {/* Step 1: Discovery */}
                <div className="flex flex-col text-left w-full lg:w-1/3">
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold gradient-text">Discovery</span>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-lg border border-gray-800 h-full">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">產品開發產值百倍：全員 SDD 協作</h3>
                      <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>在產品開發生命週期中，透過《Spec by example 工作坊》讓 PM、QA、設計師、工程師等角色共同協作來制定各項 User Story 的「DSL-Level可執行規格」。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>透過技術，直接走查 User Story 每一項 Example 是否符合全體共識及認知，如果沒有，立即同步共識。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>同時，從中收攏業務專用的 DSL，統一團隊在每一份用詞定義及測試意圖的理解，同時凝聚企業及產品願景。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>願意花大量時間溝通和釐清共識，因為一但會議結束，剩下只要部署規格，透過 SDD.OS AI 技術 就可以做到全自動化開發。</span>
                        </li>
                      </ul>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="self-center transform rotate-90 lg:rotate-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-300 animate-pulse [filter:drop-shadow(0_0_6px_#67e8f9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>

                {/* Step 2: Formulation */}
                <div className="flex flex-col text-left w-full lg:w-1/3">
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold gradient-text">Formulation</span>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-lg border border-gray-800 h-full">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">工程師不會被取代，而是轉型</h3>
                      <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>工程師在會議中，透過 SDD.OS 技術，把每一句 DSL-Level 的 Spec 翻譯成「技術實現」，立即讓全體角色看見其實踐上的 AI 成本和技術意義。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>會議後，工程師仍是骨幹，透過「DSL 定義語言」將會後產出的「DSL-Level 可執行規格」瞬間直譯成可被技術實現的「ISA-Level 可執行規格」。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>SDD.OS 提供 dry-run 模式，協助工程師分析開發成本 (e.g., Tokens)，讓工程師持續優化 ISA（指令集架構）。</span>
                        </li>
                      </ul>
                  </div>
                </div>

                {/* Arrow */}
                <div className="self-center transform rotate-90 lg:rotate-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-300 animate-pulse [filter:drop-shadow(0_0_6px_#67e8f9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>

                {/* Step 3: Automation */}
                <div className="flex flex-col text-left w-full lg:w-1/3">
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold gradient-text">Automation</span>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-lg border border-gray-800 h-full">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">規格寫好，交給 SDD.OS AI</h3>
                      <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>SDD.OS AI 會根據規格，產生測試意圖 100% 正確的測試程式。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>測試的程式架構遵循「會尖叫的架構」原則（來自 Clean Architecutre)，實現超高測試程式碼的拓展性。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>既然測試 100% 意圖正確，AI 會持續開發直到通過所有測試，因而實作 100% 功能正確的程式。</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span>在測試保護下，工程師可輕鬆指導 AI 持續重構架構，重構後可持續回歸測試。</span>
                        </li>
                      </ul>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
          {/* Section 4: SDD.OS Technology */}
          <motion.div variants={itemVariants} id="technology" className="text-center pt-24 md:pt-28">
            <h2 className="heading gradient-text">SDD.OS 的技術</h2>
            <p className="subheading max-w-4xl mx-auto">
              <a href="https://waterballsa.tw/" target="_blank" rel="noopener noreferrer" className="text-[#2ee9ff] font-bold underline hover:text-yellow-300 transition-all duration-300 hover:brightness-125">水球軟體學院</a>所推廣的技術原理，能在「功能性需求」上能做到 100% 正確全自動化開發，而我們認為這種<strong className="text-cyan-400">「高精度」</strong>的規格實踐，才是 SDD 的未來。
            </p>
            <p className="mt-4 max-w-3xl mx-auto text-gray-400">
              請看看我們的技術實踐介紹，目前這項技術只開源給研究組織的社群成員（任何人都可以加入），直到技術成熟後，我們才會開放原始碼給所有的企業/個人無償商業使用。
            </p>
            <div className="mt-12 aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl shadow-blue-500/20">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/y3dUVaMTJ4g?si=BEqPWhQng8GdcNlQ"
                title="SDD.OS 初版技術介紹"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Methodology;
