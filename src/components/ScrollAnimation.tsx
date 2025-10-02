"use client";

import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ScrollAnimationProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  once?: boolean;
  type?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scale' | 'rotate';
  className?: string;
}

const ScrollAnimation = ({
  children,
  delay = 0,
  duration = 0.8,
  once = true,
  type = 'fadeInUp',
  className = '',
}: ScrollAnimationProps) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: 0.05,
    rootMargin: '0px 0px -10% 0px',
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 不同類型的動畫變體
  const variants: any = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration,
          delay,
        },
      },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    },
  };

  // 如果是服務器端渲染，直接返回子元素
  if (!isClient) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : (once ? 'hidden' : 'hidden')}
      variants={variants[type]}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;
