"use client";

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Methodology from '@/components/Methodology'; // Import the new component
import ContactForm from '@/components/ContactForm';
import Trust from '@/components/Trust';
import Footer from '@/components/Footer';

// 使用 dynamic import 來避免 SSR 問題
const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 動畫背景 */}
      <AnimatedBackground />
      
      <Navbar />
      <main>
        <Hero />
        <Methodology /> {/* Use the new component */}
        {/* <Trust /> */}
        {/* <ContactForm /> */}
      </main>
      <Footer />
    </div>
  );
}
