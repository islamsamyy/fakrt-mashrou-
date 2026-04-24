'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* Scanning Line */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] bg-primary-container shadow-[0_0_20px_#00ffd1] transition-all duration-300 ease-out z-50"
        style={{ transform: `translateY(${progress}vh)` }}
      >
        <div className="absolute right-4 -top-6 text-[10px] font-black text-primary-container uppercase tracking-widest bg-background/80 px-2 py-0.5 rounded border border-primary-container/30">
          UPLINKING_DATA: {Math.round(progress)}%
        </div>
      </div>

      {/* Grid Overlay during load */}
      <div className={`absolute inset-0 bg-background/20 backdrop-blur-[2px] transition-opacity duration-500 ${progress < 100 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 neon-grid opacity-20"></div>
        <div className="absolute inset-0 scanline opacity-30 animate-scanline"></div>
      </div>
    </div>
  );
}
