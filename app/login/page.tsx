'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { login } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
      // On successful login, the server action redirects via redirect()
      // This client-side handler is just for error display
    });
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary min-h-screen overflow-x-hidden text-right" dir="rtl">
      {/* Global Scanline Texture */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
      
      <main className="flex min-h-screen">
        {/* LEFT COLUMN (Login Form, 45%) */}
        <section className="w-full md:w-[45%] bg-[#050B14] flex flex-col justify-center items-center px-6 lg:px-20 relative z-10">
          <div className="w-full max-w-[400px]">
            {/* Header */}
            <div className="mb-10 text-right">
              <h1 className="text-4xl font-bold font-headline mb-3 text-white leading-tight">مرحباً بعودتك</h1>
              <p className="text-[15px] font-body text-slate-400">سجّل دخولك للمتابعة</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-body text-right">
                {error === 'Invalid login credentials'
                  ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
                  : error === 'Email not confirmed'
                  ? 'يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.'
                  : error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="group relative">
                <label className="block text-xs font-headline text-primary-container uppercase tracking-widest mb-1">البريد الإلكتروني</label>
                <input
                  name="email"
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/30 focus:border-primary-container focus:ring-0 text-white font-data py-3 transition-all placeholder:text-slate-700 placeholder:text-xs text-right"
                  placeholder="user@ideabusiness.com"
                  type="email"
                  required
                  autoComplete="email"
                />
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary-container group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,209,0.8)]"></div>
              </div>
              <div className="group relative">
                <div className="flex justify-between items-center mb-1">
                  <span 
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary-container transition-colors"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                  <label className="block text-xs font-headline text-primary-container uppercase tracking-widest">كلمة المرور</label>
                </div>
                <input
                  name="password"
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant/30 focus:border-primary-container focus:ring-0 text-white font-data py-3 transition-all placeholder:text-slate-700 text-right"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                />
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary-container group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,209,0.8)]"></div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="w-4 h-4 bg-transparent border-primary-container/50 rounded-none checked:bg-primary-container focus:ring-0 focus:ring-offset-0" type="checkbox"/>
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors font-body">تذكرني</span>
                </label>
                <a className="text-sm text-primary-container hover:text-primary-fixed-dim transition-colors font-body" href="/forgot-password">نسيت كلمة المرور؟</a>
              </div>
              <button
                className="w-full bg-primary-container text-background font-headline font-black py-4 text-lg clip-button flex items-center justify-center gap-3 group active:scale-95 transition-transform uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <span className="material-symbols-outlined group-hover:translate-x-[-4px] transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 font-body">
                ليس لديك حساب؟ 
                <a className="text-primary-container font-black hover:underline decoration-primary-container/30 underline-offset-4 mr-2" href="/register">إنشاء حساب جديد</a>
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN (Brand Panel, 55%) */}
        <section className="hidden md:flex w-[55%] relative overflow-hidden bg-gradient-to-br from-[#020409] to-[#0A1628] flex-col justify-between p-12">
          {/* Background Textures */}
          <div className="absolute inset-0 hex-grid opacity-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(104,0,236,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,255,209,0.05),transparent_70%)]"></div>
          
          {/* Top Header */}
          <div className="relative z-10">
            <Image src="/LOGO.svg" alt="IDEA BUSINESS" width={160} height={48} className="h-12 w-auto" />
          </div>

          {/* Central Visual */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-grow py-20">
            <div className="relative w-80 h-80 flex items-center justify-center">
              <div className="absolute inset-0 border-[3px] border-primary-container/20 rotate-45 clip-button animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute inset-4 border-[2px] border-secondary-container/40 -rotate-12 clip-button animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="absolute inset-10 bg-primary-container/5 backdrop-blur-xl border border-primary-container/30 clip-button flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-primary-container text-7xl animate-pulse">hub</span>
              </div>
              <div className="absolute -top-4 -right-12 bg-surface-container-high/40 backdrop-blur-md p-3 border border-white/10 clip-button">
                <p className="font-data text-xs text-primary-container tracking-widest">SYS_LINK: ACTIVE</p>
              </div>
              <div className="absolute -bottom-6 -left-8 bg-surface-container-high/40 backdrop-blur-md p-3 border border-white/10 clip-button">
                <p className="font-data text-xs text-secondary-container tracking-widest">AI_MODEL: V4.2</p>
              </div>
            </div>
            <div className="mt-16 text-center max-w-lg">
              <h2 className="text-5xl font-black font-headline text-white mb-6 leading-tight uppercase tracking-tight">حوّل فكرتك إلى واقع</h2>
              <p className="text-slate-400 text-lg font-body">منصة سيادية لإدارة الاستثمارات والتحليلات المتقدمة المدعومة بالذكاء الاصطناعي.</p>
            </div>
          </div>

          {/* Trust Row */}
          <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center border border-primary-container/30">
                <span className="material-symbols-outlined text-primary-container text-lg">verified_user</span>
              </div>
              <span className="text-xs font-body text-slate-300">آمن ومشفر</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center border border-primary-container/30">
                <span className="material-symbols-outlined text-primary-container text-lg">gavel</span>
              </div>
              <span className="text-xs font-body text-slate-300">معتمد قانونياً</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-container/10 flex items-center justify-center border border-secondary-container/30">
                <span className="material-symbols-outlined text-secondary-container text-lg">auto_awesome</span>
              </div>
              <span className="text-xs font-body text-slate-300">مدعوم بالذكاء الاصطناعي</span>
            </div>
          </div>

          {/* Corner L-Brackets */}
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary-container/20 m-8"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary-container/20 m-8"></div>
        </section>
      </main>
    </div>
  );
}
