"use client";

import { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  className?: string;
}

const TypewriterEffect = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenTexts = 1500,
  className = '',
}: TypewriterEffectProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || texts.length === 0) return;

    const currentText = texts[currentIndex];

    const timer = setTimeout(() => {
      if (isDeleting) {
        // 刪除文字
        setDisplayText(currentText.substring(0, displayText.length - 1));

        // 如果已經刪除完畢，切換到下一個文字
        if (displayText.length === 1) {
          setIsDeleting(false);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }
      } else {
        // 添加文字
        setDisplayText(currentText.substring(0, displayText.length + 1));

        // 如果已經完成當前文字，等待一段時間後開始刪除
        if (displayText.length === currentText.length) {
          setTimeout(() => {
            setIsDeleting(true);
          }, delayBetweenTexts);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [isClient, texts, currentIndex, displayText, isDeleting, typingSpeed, deletingSpeed, delayBetweenTexts]);

  // 如果是服務器端渲染，直接返回第一個文字
  if (!isClient) {
    return <span className={className}>{texts[0] || ''}</span>;
  }

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default TypewriterEffect;
