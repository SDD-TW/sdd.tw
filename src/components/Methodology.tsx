"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SpecificationSpectrum from './SpecificationSpectrum'; // This will be created next

const Methodology = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
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
    '以為只是「撰寫一堆文件」就叫做「規格驅動開發」',
    '無法定義到底何謂「規格」，把 SDD 變得和 Prompt Engineering 沒兩樣',
    '無法導入團隊，以為寫一堆 PRD、User Story 就叫 SDD，但其實根本沒有增加效率',
    '總是寫一堆文件，甚至都讓 AI 產文件，卻無法增加開發的精度，燒一堆 AI Tokens 卻燒不出成效',
  ];

  return (
    <section id="methodology" className="section relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto relative z-10">
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
                SDD（Spec 驅動開發）是一種創新的開發方法論。我們是由水球軟體學院創建的研究組織，致力於在台灣推廣此方法論，實現全自動化的程式碼生成和測試。
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-blue-400">為何選擇 SDD？</h3>
                  <p className="text-gray-300">
                    SDD 將開發流程變得更加高效和可靠。開發人員可以專注於業務邏輯，而不是重複性的編碼工作。
                  </p>
                  <p className="text-gray-300">
                    作為水球軟體學院旗下的研究組織，我們致力於推廣 SDD 方法論，幫助台灣的開發者掌握這項未來技術，提升開發效率和程式碼品質。
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>提高開發效率 80%</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>減少 90% 的錯誤和 bug</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>自動化測試和部署流程</span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-md"></div>
                  <div className="relative bg-gray-900/80 p-6 rounded-lg border border-gray-800">
                    <pre className="text-sm overflow-x-auto">
                      <code className="language-typescript">
                        <span className="text-pink-400">interface</span>{" "}
                        <span className="text-blue-400">User</span> {"{"}
                        <br />
                        {"  "}
                        <span className="text-gray-400">id:</span>{" "}
                        <span className="text-yellow-400">string</span>;
                        <br />
                        {"  "}
                        <span className="text-gray-400">name:</span>{" "}
                        <span className="text-yellow-400">string</span>;
                        <br />
                        {"  "}
                        <span className="text-gray-400">role:</span>{" "}
                        <span className="text-yellow-400">UserRole</span>;
                        <br />
                        {"}"}
                        <br />
                        <br />
                        <span className="text-pink-400">enum</span>{" "}
                        <span className="text-blue-400">UserRole</span> {"{"}
                        <br />
                        {"  "}
                        <span className="text-gray-400">ADMIN</span> ={" "}
                        <span className="text-green-400">'admin'</span>,
                        <br />
                        {"  "}
                        <span className="text-gray-400">MEMBER</span> ={" "}
                        <span className="text-green-400">'member'</span>,
                        <br />
                        {"  "}
                        <span className="text-gray-400">GUEST</span> ={" "}
                        <span className="text-green-400">'guest'</span>
                        <br />
                        {"}"}
                      </code>
                    </pre>
                  </div>
                </div>
            </div>
          </motion.div>

          {/* Section 1: Myths about SDD */}
          <motion.div variants={itemVariants} className="text-center mb-24">
            <h2 className="heading gradient-text">大多數人對於 SDD 的迷思</h2>
            <p className="subheading">
              如果無法掌握核心精神，導入 SDD 往往會落入以下陷阱：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
              {myths.map((myth, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 text-left"
                >
                  <p className="text-gray-300">{myth}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section 2: The Spectrum of Specifications */}
          <motion.div variants={itemVariants} className="mb-24">
            <div className="text-center mb-12">
                <h2 className="heading gradient-text">規格的光譜</h2>
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
               SDD.TW 相信，未來 Vibe Coding / SDD 的趨勢，一定是規格光譜中間那一區塊的方法論及技術實踐。
             </p>
             <div className="mt-12 text-left max-w-4xl mx-auto space-y-8">
                <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-lg border border-gray-800">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4">敏捷開發流程整合</h3>
                    <p className="text-gray-300">
                    在敏捷開發的週期中，我們透過 《Spec by example 工作坊》，讓跨職能角色 (PM, BA, QA, 設計師, 工程師,...) 協作、溝通，一同把每個 Sprint 中每個 User Story 的驗收標準寫成「可執行規格」，從中收攏業務專用的 DSL（光譜中間）。
                    </p>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-lg border border-gray-800">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4">高階規格轉譯</h3>
                    <p className="text-gray-300">
                    接著，工程師負責把高階的可執行規格，透過技術直接翻譯成低階的 ISA-Level 的可執行規格，讓規格每一句 DSL 在 Tech Stack 上的測試實踐被明確定義，產出 100% 正確的測試程式。
                    </p>
                </div>
             </div>
          </motion.div>

          {/* Section 4: SDD.OS Technology */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="heading gradient-text">SDD.OS 的技術</h2>
            <p className="subheading max-w-4xl mx-auto">
              我們的技術能做到 100% 正確全自動化的開發，而我們認為這種「高精度」的規格實踐，才是 SDD 的未來。請看看我們的技術實踐介紹，目前這項技術只開源給研究組織的社群成員（任何人都可以加入），直到技術成熟後，我們才會開放原始碼給所有的企業/個人無償商業使用。
            </p>
            <div className="mt-12 aspect-video max-w-4xl mx-auto bg-gray-900/50 rounded-lg border border-gray-800 flex items-center justify-center">
                <p className="text-gray-500">Youtube 影片即將上線</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Methodology;
