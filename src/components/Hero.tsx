"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const TypewriterEffect = dynamic(() => import('@/components/TypewriterEffect'), {
  ssr: false,
});

const Hero = () => {
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

  const codeBlockVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        delay: 0.4,
      },
    },
  };

  return (
    <div className="relative min-h-screen xl:min-h-[80vh] 2xl:min-h-[70vh] grid-bg overflow-hidden pt-16">
      {/* 背景效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 md:pt-32 xl:pt-24 2xl:pt-16">
        <motion.div
          ref={ref}
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text glow"
          >
            臺灣規格驅動開發
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 mb-16 max-w-3xl h-16"
          >
            由<span className="gradient-text font-semibold">水球軟體學院</span>創建的研究組織，<br/>致力於在臺推動 SDD（
            <span className="text-blue-400 font-semibold">
              <TypewriterEffect
                texts={[
                  "規格驅動開發：方法論",
                  "100% 全自動化開發準開源技術",
                  "企業 AI/SDD 轉型顧問培訓共享經濟",
                ]}
                typingSpeed={80}
              />
            </span>
            ）來擴大臺灣軟體公司經濟規模百倍。
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="https://waterballs.tw/sdd_dc_onboard" className="btn btn-primary text-lg pulse-glow">
              加入社群
            </Link>
            <Link href="#methodology" className="btn btn-secondary text-lg">
              了解更多
            </Link>
          </motion.div>

          <motion.div
            variants={codeBlockVariants}
            className="w-full max-w-3xl mx-auto bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800 shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs text-gray-400">spec.feature</div>
              <div></div>
            </div>
            <div className="p-4 font-mono text-sm md:text-base text-left overflow-x-auto">
              <pre className="text-gray-300">
                <span className="text-blue-400">Feature:</span> SDD 驅動開發
                <br />
                <br />
                <span className="text-green-400">  Scenario:</span> 自動化程式碼生成
                <br />
                <span className="text-purple-400">    Given</span> 有一個明確的規格文件
                <br />
                <span className="text-purple-400">    When</span> 我使用 SDD 方法論
                <br />
                <span className="text-purple-400">    Then</span> 系統應該自動生成符合規格的程式碼
                <br />
                <span className="text-purple-400">    And</span> 所有測試應該通過
                <br />
                <span className="text-purple-400">    And</span> 開發效率提升 80%
              </pre>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex items-center justify-center"
          >
            <div className="flex items-center animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
