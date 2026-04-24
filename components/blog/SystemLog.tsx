'use client';

import React, { useEffect, useState, useRef } from 'react';

type LogType = 'info' | 'warn' | 'success' | 'danger' | 'intel';

export function SystemLog() {
  const [isOpen, setIsOpen] = useState(true);
  const [logs, setLogs] = useState<{ id: number; time: string; msg: string; type: LogType }[]>([
    { id: 1, time: '08:42:12', msg: 'INITIALIZING_NEURAL_SYNC...', type: 'info' },
    { id: 2, time: '08:42:13', msg: 'WARNING: MARKET_VOLATILITY_DETECTED', type: 'warn' },
    { id: 3, time: '08:42:15', msg: 'FETCHING_SOVEREIGN_DATA_NODES...', type: 'info' },
    { id: 4, time: '08:42:18', msg: 'ENCRYPTION_LAYER_STABLE', type: 'success' },
  ]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('system_log_open');
    if (saved !== null) {
      setIsOpen(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('system_log_open', String(isOpen));
  }, [isOpen]);

  // Listen for external log events
  useEffect(() => {
    const handleExternalLog = (event: Event) => {
      const customEvent = event as CustomEvent<{ msg: string; type: LogType }>;
      if (customEvent.detail) {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        setLogs(prev => {
          const newLogs = [...prev, { id: Date.now(), time, msg: customEvent.detail.msg, type: customEvent.detail.type }];
          return newLogs.slice(-15);
        });
      }
    };

    window.addEventListener('system-log', handleExternalLog);
    return () => window.removeEventListener('system-log', handleExternalLog);
  }, []);

  useEffect(() => {
    const messages: { msg: string; type: LogType }[] = [
      { msg: 'SCANNING_GLOBAL_SENTIMENT...', type: 'info' },
      { msg: 'PROTOCOL_BETA_V2_ACTIVE', type: 'intel' },
      { msg: 'UPDATING_ARCHIVE_INDEX...', type: 'info' },
      { msg: 'SIGNAL_STRENGTH_OPTIMAL', type: 'success' },
      { msg: 'NODES_SYNCHRONIZED', type: 'success' },
      { msg: 'UNAUTHORIZED_PING_DETECTED', type: 'danger' },
      { msg: 'DECRYPTING_MARKET_PATTERNS...', type: 'intel' },
      { msg: 'BUFFER_OVERFLOW_MITIGATED', type: 'warn' },
      { msg: 'COMPILING_INTEL_REPORT...', type: 'info' },
      { msg: 'CROSS_DOMAIN_SYNC_COMPLETE', type: 'success' },
    ];

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const { msg, type } = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => {
        const newLogs = [...prev, { id: Date.now(), time, msg, type }];
        return newLogs.slice(-15);
      });
    }, 12000); // Increased interval to allow for more external events

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on log update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`fixed bottom-8 left-8 w-85 hidden xl:block z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[calc(100%-48px)]'}`}>
      <div className="glass-strong border-primary-container/20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-primary-container/40 hover:shadow-[0_0_50px_rgba(0,255,209,0.2)]">
        {/* Terminal Header */}
        <div 
          className="bg-primary-container/10 px-5 py-3.5 border-b border-primary-container/20 flex items-center justify-between cursor-pointer group select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,209,0.5)] ${isOpen ? 'bg-primary-container animate-ping' : 'bg-foreground/20'}`}></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.4em] text-primary-container uppercase group-hover:text-primary-container transition-colors leading-none">
                SYSTEM_LOG
              </span>
              <span className="text-[6px] font-black text-foreground/40 tracking-[0.2em] mt-1">SECURE_UPLINK_TERMINAL_V4.2.0</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center px-2 py-0.5 glass rounded border-primary-container/10">
              <span className="w-1 h-1 bg-primary-container rounded-full animate-pulse"></span>
              <span className="text-[7px] text-primary-container/60 font-black">ACTIVE</span>
            </div>
            <button className="text-primary-container/40 group-hover:text-primary-container transition-all transform group-hover:scale-110">
              <span className={`material-symbols-outlined text-lg transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                keyboard_arrow_down
              </span>
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          ref={logContainerRef}
          className="p-6 space-y-3 font-mono text-[10px] h-72 overflow-y-auto no-scrollbar scroll-smooth relative bg-background/40 backdrop-blur-md"
        >
          <div className="absolute inset-0 scanline opacity-5 pointer-events-none"></div>
          <div className="absolute inset-0 noise-bg opacity-[0.02] pointer-events-none"></div>
          
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 animate-fade-in group/item leading-relaxed">
              <span className="text-foreground/20 tabular-nums shrink-0 select-none">[{log.time}]</span>
              <span className={`
                transition-all duration-300
                ${log.type === 'warn' ? 'text-yellow-400 font-bold drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]' : ''}
                ${log.type === 'success' ? 'text-primary-container font-bold drop-shadow-[0_0_5px_rgba(0,255,209,0.3)]' : ''}
                ${log.type === 'danger' ? 'text-secondary font-black drop-shadow-[0_0_8px_rgba(255,62,112,0.4)] animate-pulse' : ''}
                ${log.type === 'intel' ? 'text-blue-400 italic' : ''}
                ${log.type === 'info' ? 'text-primary-container/60' : ''}
                group-hover/item:text-foreground group-hover/item:pl-1
              `}>
                <span className="mr-1 opacity-40">❯</span>
                {log.msg}
              </span>
            </div>
          ))}
          
          <div className="flex gap-4 items-center">
             <span className="text-foreground/20 tabular-nums shrink-0 select-none">[{new Date().toLocaleTimeString('en-GB', { hour12: false })}]</span>
             <div className="flex items-center gap-1">
               <span className="text-primary-container/30 italic">LISTENING...</span>
               <span className="w-1.5 h-3 bg-primary-container/40 animate-pulse inline-block ml-1"></span>
             </div>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-primary-container/5 px-5 py-3 flex items-center justify-between border-t border-primary-container/10">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-[6px] font-black text-foreground/40 uppercase tracking-widest">CPU_LOAD</span>
              <div className="w-16 h-1 bg-background/50 rounded-full overflow-hidden p-[0.5px]">
                <div className="h-full bg-primary-container rounded-full shadow-[0_0_5px_rgba(0,255,209,0.5)]" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[6px] font-black text-foreground/40 uppercase tracking-widest">NETWORK_LATENCY</span>
              <span className="text-[9px] font-black text-secondary tabular-nums">12ms</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-4 w-[1px] bg-primary-container/10"></div>
             <span className="text-[8px] font-black tracking-[0.2em] text-primary-container/60 uppercase">SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

