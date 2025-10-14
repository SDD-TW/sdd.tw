"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const stages = [
  { text: "[分析規格...]", duration: 2000 },
  { text: "[生成藍圖...]", duration: 2000 },
  { text: "[編譯程式碼...]", duration: 2500 },
  { text: "[系統上線]", duration: 3000 }
];

const SpecAnalysisAnimation = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const stage = stages[currentStage];
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      if (charIndex < stage.text.length) {
        charIndex++;
        setDisplayedText(stage.text.substring(0, charIndex));
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    const stageTimer = setTimeout(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, stage.duration + stage.text.length * 100);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(stageTimer);
    };
  }, [currentStage]);

  return (
    <div className="bg-black/50 rounded-lg border border-cyan-500/30 shadow-lg w-full h-full p-6 backdrop-blur-sm flex items-center justify-center font-mono text-cyan-300 text-lg sm:text-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 animate-scan"></div>
        <span>{displayedText}</span>
        <motion.div
            className="inline-block w-3 h-6 bg-cyan-300 ml-2"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
        />
    </div>
  );
};

export default SpecAnalysisAnimation;
