'use client';

import React, { useEffect, useState, useRef } from 'react';
import { emitSystemLog } from '@/lib/utils';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  const milestonesReached = useRef<Set<number>>(new Set());
  
  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentProgress = (window.scrollY / scrollHeight) * 100;
        setProgress(currentProgress);
        
        // Log milestones
        [25, 50, 75, 100].forEach(m => {
          if (currentProgress >= m && !milestonesReached.current.has(m)) {
            milestonesReached.current.add(m);
            if (m === 100) {
              emitSystemLog(`INTEL_REPORT_FULLY_DECRYPTED`, 'success');
            } else {
              emitSystemLog(`INTEL_SYNC_PROGRESS: ${m}%`, 'intel');
            }
          }
        });
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-2 z-[100] pointer-events-none overflow-hidden bg-background/20 backdrop-blur-sm border-b border-primary-container/10">
      <div 
        className="h-full bg-gradient-to-r from-secondary via-primary-container to-secondary shadow-[0_0_20px_rgba(0,255,209,0.8)] transition-all duration-300 relative bg-[length:200%_100%] animate-gradient-shift"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-0 h-full w-1 bg-white shadow-[0_0_15px_white] animate-pulse"></div>
        {/* Scanning flare */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
        
        {/* Dynamic percentage label following the bar */}
        <div 
          className="absolute right-0 top-6 glass-cyber px-3 py-1 rounded-sm border border-primary-container/40 text-[9px] font-black text-primary-container animate-fade-in whitespace-nowrap shadow-neon-sm"
          style={{ opacity: progress > 1 ? 1 : 0 }}
        >
          <span className="animate-pulse mr-1">●</span>
          INTEL_SYNC_PROTOCOL: {Math.round(progress)}%
        </div>
      </div>
      {/* Decorative background grid elements in progress bar */}
      <div className="absolute top-0 right-0 h-full w-full opacity-10 pointer-events-none">
        <div className="h-full w-full neon-grid"></div>
      </div>
    </div>
  );
}

export function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden 2xl:block fixed right-8 top-1/2 -translate-y-1/2 w-72 space-y-6 animate-fade-in z-50">
      <div className="flex items-center gap-3 mb-8 border-r-2 border-primary-container/20 pr-4">
        <div className="w-2 h-2 bg-primary-container rounded-full animate-ping"></div>
        <span className="text-[10px] font-black text-primary-container tracking-[0.4em] uppercase drop-shadow-[0_0_8px_rgba(0,255,209,0.5)]">INTEL_MATRIX</span>
      </div>
      
      <div className="space-y-4 border-r border-primary-container/10 pr-6 relative">
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-primary-container/0 via-primary-container/20 to-primary-container/0"></div>
        
        {headings.map((heading, i) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`block py-3 text-right text-sm transition-all duration-500 relative group ${
                isActive 
                  ? 'text-primary-container font-black translate-x-[-10px]' 
                  : 'text-foreground/30 hover:text-foreground/70'
              }`}
            >
              <div className="flex items-center justify-end gap-4">
                <span className={`text-[9px] font-mono opacity-30 ${isActive ? 'opacity-100 text-secondary' : ''}`}>0{i + 1}</span>
                <span className="line-clamp-1 tracking-tight">{heading.text}</span>
                
                {/* HUD Marker */}
                <div className={`w-1.5 h-1.5 rounded-sm rotate-45 border border-primary-container/40 transition-all duration-500 ${
                  isActive ? 'bg-primary-container scale-125 shadow-neon-sm' : 'group-hover:border-primary-container/60'
                }`}></div>
              </div>

              {isActive && (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-primary-container animate-pulse"></div>
              )}
              
              {/* Scanning background for active item */}
              {isActive && (
                <div className="absolute inset-0 bg-primary-container/5 rounded-lg -z-10 animate-pulse overflow-hidden">
                  <div className="absolute inset-0 scanline opacity-20"></div>
                </div>
              )}
            </a>
          );
        })}
      </div>

      <div className="pt-8 border-r border-primary-container/10 pr-6">
        <div className="flex flex-col gap-2 text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em]">
          <div className="flex justify-between">
            <span>UPLINK_STATUS</span>
            <span className="text-primary-container/40">SECURE</span>
          </div>
          <div className="w-full h-1 bg-background/50 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container/20 w-3/4"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    emitSystemLog('INTEL_URL_COPIED_TO_CLIPBOARD', 'success');
    emitSystemLog('INITIATING_NETWORK_BROADCAST', 'intel');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="button-holographic flex items-center gap-4 px-8 py-4 group"
    >
      <div className={`absolute inset-0 bg-primary-container/20 transition-transform duration-700 ${copied ? 'translate-x-0' : '-translate-x-full'}`}></div>
      <span className="material-symbols-outlined text-xl text-primary-container group-hover:rotate-12 transition-transform relative z-10">
        {copied ? 'verified' : 'share_reviews'}
      </span>
      <span className="text-xs font-black tracking-[0.2em] uppercase relative z-10 text-primary-container/80 group-hover:text-primary-container transition-colors">
        {copied ? 'BROADCAST_AUTHORIZED' : 'SHARE_INTELLIGENCE_NODE'}
      </span>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-container/40"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-container/40"></div>
    </button>
  );
}
