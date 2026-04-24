'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { emitSystemLog } from '@/lib/utils';

export default function BlogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (query) {
      emitSystemLog(`SEARCHING_THE_ARCHIVE: ${query.toUpperCase()}`, 'intel');
    }
    
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('q', query);
        router.push(`/blog?${params.toString()}`);
        emitSystemLog('ARCHIVE_QUERY_SYNCED', 'success');
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        router.push('/blog');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="relative max-w-2xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div className={`relative transition-all duration-700 ${isFocused ? 'scale-[1.05]' : 'scale-100'}`}>
        {/* Cyber Border Effect */}
        <div className={`absolute -inset-[2px] bg-gradient-to-r from-primary-container via-secondary to-primary-container rounded-2xl blur-md transition-opacity duration-700 ${isFocused ? 'opacity-100' : 'opacity-20'}`}></div>
        
        <div className="relative flex items-center glass-strong border-primary-container/20 rounded-2xl overflow-hidden px-8 py-5 shadow-2xl backdrop-blur-3xl group">
          <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <span className={`material-symbols-outlined ml-6 transition-all duration-500 ${isFocused ? 'text-primary-container scale-125' : 'text-foreground/30'}`}>
            terminal
          </span>
          
          <div className="relative flex-grow flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="SEARCH_THE_ARCHIVE..."
              className="w-full bg-transparent border-none outline-none text-foreground font-black tracking-widest placeholder:text-foreground/10 text-xl uppercase caret-primary-container"
              dir="ltr"
            />
            {!query && !isFocused && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-5 bg-primary-container/30 animate-pulse pointer-events-none"></span>
            )}
          </div>
          
          {/* HUD Elements */}
          <div className="flex items-center gap-6 mr-4 border-r border-primary-container/10 pr-6">
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-[9px] font-black text-primary-container tracking-[0.2em] uppercase">{isFocused ? 'SCANNING...' : 'IDLE'}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-sm rotate-45 transition-all duration-500 ${
                      isFocused ? 'bg-primary-container shadow-neon-sm scale-110' : 'bg-foreground/10'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Result HUD (decorative) */}
      {query && (
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center animate-fade-in">
          <span className="text-[10px] font-black text-primary-container tracking-[0.3em] uppercase">
            FILTRATION_PROTOCOL_ACTIVE // QUERY: {query.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
