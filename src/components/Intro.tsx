"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ScrollAnimation = dynamic(() => import('@/components/ScrollAnimation'), {
  ssr: false,
});

const Intro = () => {
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

  const itemVariants = {
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

  const features = [
    {
      title: '遊戲化學習',
      description: '透過遊戲化的分享活動，讓學習 SDD 變得更加有趣和互動',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: '社群活動',
      description: '定期舉辦讀書會、分享會等活動，共同探討 SDD 的最新發展和應用',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: '個人評鑒',
      description: '透過個人評鑒機制，了解自己在 SDD 領域的成長和進步',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: '組隊評鑒',
      description: '組隊進行評鑒，一起解決問題，提升團隊協作能力',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="about" className="section relative overflow-hidden">
      {/* 背景效果 */}
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
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="heading gradient-text">什麼是 SDD？</h2>
            <p className="subheading">
              SDD（Spec 驅動開發）是一種創新的開發方法論。我們是由水球軟體學院創建的研究組織，致力於在台灣推廣此方法論，實現全自動化的程式碼生成和測試。
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
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
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>提高開發效率 80%</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>減少 90% 的錯誤和 bug</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-10">社群特色</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <ScrollAnimation
                  key={index}
                  type={index % 2 === 0 ? 'fadeInLeft' : 'fadeInRight'}
                  delay={index * 0.1}
                  once={false}
                >
                  <motion.div
                    className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-300"
                    whileHover={{ y: -5, boxShadow: '0 10px 30px -15px rgba(0, 0, 255, 0.3)' }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-500/20 p-3 rounded-lg mr-4 text-blue-400">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-semibold">{feature.title}</h4>
                    </div>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                </ScrollAnimation>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Intro;
