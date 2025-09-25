"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const Trust = () => {
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

  const stats = [
    { value: '500+', label: '社群成員' },
    { value: '50+', label: '成功專案' },
    { value: '30+', label: '社群活動' },
    { value: '80%', label: '效率提升' },
  ];

  const testimonials = [
    {
      content: 'SDD 方法論徹底改變了我的開發方式，讓我能夠更專注於解決業務問題，而不是糾結於重複性的編碼工作。',
      author: '張小明',
      role: '資深軟體工程師',
      avatar: '/next.svg', // 替換為實際頭像
    },
    {
      content: '臺灣規格驅動開發的評鑒機制幫助我找到了自己的不足之處，並且提供了清晰的改進路徑。',
      author: '李小華',
      role: '前端開發者',
      avatar: '/next.svg', // 替換為實際頭像
    },
    {
      content: '組隊評鑒是一個非常棒的體驗，我們團隊通過這種方式解決了許多困難的問題，並且建立了更緊密的合作關係。',
      author: '王大明',
      role: '技術主管',
      avatar: '/next.svg', // 替換為實際頭像
    },
  ];

  const partners = [
    { name: '合作夥伴 1', logo: '/next.svg' },
    { name: '合作夥伴 2', logo: '/next.svg' },
    { name: '合作夥伴 3', logo: '/next.svg' },
    { name: '合作夥伴 4', logo: '/next.svg' },
    { name: '合作夥伴 5', logo: '/next.svg' },
    { name: '合作夥伴 6', logo: '/next.svg' },
  ];

  return (
    <section id="evaluation" className="section relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 to-transparent" />
        <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="heading gradient-text">社群成就</h2>
            <p className="subheading">
              我們的社群成員通過 SDD 方法論取得了顯著的成果，一起來看看我們的成就
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mb-20">
            <h3 className="text-2xl font-bold text-center mb-10">評鑒機制</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg mr-4 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold">個人評鑒</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  個人評鑒機制幫助您了解自己在 SDD 領域的技能水平，並提供個性化的學習路徑和建議。
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">技能評估與反饋</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">個性化學習路徑</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">專家一對一指導</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg mr-4 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold">組隊評鑒</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  組隊評鑒讓您與其他社群成員一起解決實際問題，提升團隊協作能力和 SDD 實踐經驗。
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">真實專案實踐</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">團隊協作與溝通</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">集體問題解決能力</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-20">
            <h3 className="text-2xl font-bold text-center mb-10">社群成員心得</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-800">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.author}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-10">合作夥伴</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-4 bg-gray-900/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                >
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={80}
                    height={40}
                    className="object-contain h-10 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Trust;
