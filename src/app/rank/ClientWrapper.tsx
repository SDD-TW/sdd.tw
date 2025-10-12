"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const Navbar = dynamic(() => import('@/components/Navbar'), {
  ssr: false,
});

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}
