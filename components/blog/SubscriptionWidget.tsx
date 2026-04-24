'use client';

import React, { useState } from 'react';
import { emitSystemLog } from '@/lib/utils';

export function SubscriptionWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'granted'>('idle');

  const handleAuthorize = async () => {
    if (!email || !email.includes('@')) {
      emitSystemLog('ERROR: INVALID_IDENTITY_PROTOCOL', 'danger');
      return;
    }

    setStatus('authorizing');
    emitSystemLog(`INITIATING_AUTHORIZATION_SEQUENCE_FOR: ${email.toUpperCase()}`, 'info');
    
    // Simulate multi-stage authorization
    setTimeout(() => {
      emitSystemLog('VERIFYING_CREDENTIALS_AGAINST_MAINNET...', 'intel');
    }, 800);

    setTimeout(() => {
      emitSystemLog('ENCRYPTING_BIO_METRIC_UPLINK...', 'intel');
    }, 1600);

    setTimeout(() => {
      setStatus('granted');
      emitSystemLog('ACCESS_GRANTED: WELCOME_TO_THE_NETWORK', 'success');
      setEmail('');
    }, 2500);
  };

  return (
    <div className="p-12 glass-cyber rounded-[3.5rem] border border-primary-container/30 relative overflow-hidden group shadow-2xl sticky top-32">
      <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-primary-container/30 blur-[100px] rounded-full group-hover:bg-primary-container/40 transition-all duration-1000"></div>
      
      {status === 'granted' && (
        <div className="absolute inset-0 bg-primary-container/10 backdrop-blur-md z-20 flex flex-col items-center justify-center p-10 text-center animate-fade-in">
          <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center text-background mb-6 shadow-neon">
            <span className="material-symbols-outlined text-5xl font-bold">check</span>
          </div>
          <h3 className="text-3xl font-black text-primary-container uppercase tracking-widest mb-2">ACCESS_GRANTED</h3>
          <p className="text-foreground/60 text-sm font-bold tracking-tight">ENCRYPTED_INTEL_STREAM_ACTIVE</p>
          <button 
            onClick={() => setStatus('idle')}
            className="mt-8 text-[10px] font-black text-foreground/40 hover:text-primary-container transition-colors uppercase tracking-[0.3em]"
          >
            Reset_Protocol
          </button>
        </div>
      )}

      <div className="relative z-10 space-y-10">
        <div className="w-20 h-20 glass-cyber rounded-3xl flex items-center justify-center text-primary-container border-primary-container/40 shadow-neon-sm">
          <span className={`material-symbols-outlined text-5xl ${status === 'authorizing' ? 'animate-spin' : 'animate-pulse'}`}>
            {status === 'authorizing' ? 'sync' : 'mail'}
          </span>
        </div>
        
        <div className="space-y-6 text-right">
          <h3 className="text-4xl font-black leading-tight tracking-tight uppercase">Intel_Briefing</h3>
          <p className="text-xl text-foreground/70 font-light leading-relaxed">
            انضم إلى النخبة واستقبل التقارير السرية حول تحركات السوق الكبرى مباشرة في شبكتك.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'authorizing'}
              placeholder="NETWORK_ID@SECURE_NODE"
              className="w-full bg-background/80 border-2 border-primary-container/10 rounded-2xl px-8 py-5 text-sm font-black font-data tracking-widest outline-none focus:border-primary-container/50 transition-all placeholder:opacity-30 shadow-inner disabled:opacity-50"
            />
          </div>
          <button 
            onClick={handleAuthorize}
            disabled={status === 'authorizing'}
            className="button-holographic w-full py-6 text-xl uppercase tracking-tighter font-black text-primary-container disabled:opacity-50"
          >
            {status === 'authorizing' ? 'AUTHORIZING...' : 'AUTHORIZE_ACCESS'}
          </button>
        </div>
      </div>
    </div>
  );
}
