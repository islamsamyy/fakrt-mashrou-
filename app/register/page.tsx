'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { register } from '@/app/auth/actions';

export default function RegisterPage() {
  const [role, setRole] = useState<'founder' | 'investor'>('founder');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('role', role);
    setSuccessMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.message) {
        setSuccessMessage(result.message);
        // After successful registration, user will be redirected to onboarding
      }
      // On successful registration with session, server action redirects to onboarding
    });
  }

  return (
    <div 
      className="bg-[#020409] text-on-surface font-body min-h-screen flex items-center justify-center p-6 overflow-x-hidden relative" 
      dir="rtl"
      suppressHydrationWarning
    >
      {/* Background Textures */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%2300ffd1' stroke-width='0.5' fill='none' /%3E%3C/svg%3E")`
      }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(0, 255, 209, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 209, 0.03) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <main className="relative z-10 w-full max-w-[560px]">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2 font-data font-bold text-primary-container text-2xl tracking-tighter">
            IDEA BUSINESS
          </div>
          <Link href="/login" className="text-xs font-data text-outline tracking-widest uppercase opacity-50 hover:opacity-100 hover:text-primary-container transition-all">
            تسجيل الدخول ←
          </Link>
        </div>

        {/* Role Selector */}
        <div className="mb-8">
          <p className="text-xs font-headline text-primary-container uppercase tracking-widest mb-4">نوع الحساب</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('founder')}
              className={`p-4 border text-right transition-all ${role === 'founder' ? 'border-primary-container bg-primary-container/10 shadow-[0_0_15px_rgba(0,255,209,0.2)]' : 'border-outline-variant/20 bg-surface-container-low hover:border-primary-container/40'}`}
            >
              <span className="material-symbols-outlined text-primary-container block mb-2">rocket_launch</span>
              <p className="font-headline font-bold text-white text-sm">مؤسس</p>
              <p className="text-xs text-slate-500 font-body">أطرح فكرتي وأجد مستثمرين</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('investor')}
              className={`p-4 border text-right transition-all ${role === 'investor' ? 'border-primary-container bg-primary-container/10 shadow-[0_0_15px_rgba(0,255,209,0.2)]' : 'border-outline-variant/20 bg-surface-container-low hover:border-primary-container/40'}`}
            >
              <span className="material-symbols-outlined text-secondary-container block mb-2">account_balance</span>
              <p className="font-headline font-bold text-white text-sm">مستثمر</p>
              <p className="text-xs text-slate-500 font-body">أستثمر في أفضل المشاريع</p>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <section className="bg-[#050B14] relative p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-outline-variant/10 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-container/40"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-container/40"></div>

          <header className="mb-8">
            <h1 className="text-3xl font-headline font-bold text-white mb-2 leading-tight">إنشاء حساب جديد</h1>
            <p className="text-on-surface-variant text-sm font-body">
              {role === 'founder' ? 'انضم كمؤسس وابدأ رحلتك نحو التمويل.' : 'انضم كمستثمر واكتشف أفضل الفرص.'}
            </p>
          </header>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-100 text-sm font-body text-right">
              {error}
            </div>
          )}

          {/* Success */}
          {successMessage && !error && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-body text-right">
              {successMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="relative group">
              <label className="block text-xs font-headline text-primary-container uppercase tracking-widest mb-1">الاسم الكامل</label>
              <input
                name="fullName"
                className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary-container px-4 py-3 text-white focus:ring-0 transition-all outline-none font-body text-right"
                placeholder="محمد الساير"
                type="text"
                required
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <label className="block text-xs font-headline text-primary-container uppercase tracking-widest mb-1">البريد الإلكتروني</label>
              <input
                name="email"
                className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary-container px-4 py-3 text-white font-data focus:ring-0 transition-all outline-none text-left placeholder:text-right"
                placeholder="user@domain.com"
                type="email"
                required
                autoComplete="email"
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label className="block text-xs font-headline text-primary-container uppercase tracking-widest mb-1">كلمة المرور</label>
              <input
                name="password"
                className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary-container px-4 py-3 text-white focus:ring-0 transition-all outline-none font-data"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••  (8 أحرف على الأقل)"
              />
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input className="mt-1 h-4 w-4 bg-surface-container-high border-outline-variant text-primary-container focus:ring-0" type="checkbox" required/>
              <span className="text-xs text-on-surface-variant leading-relaxed font-body">
                أوافق على <Link href="#" className="text-primary-container underline underline-offset-4 font-bold">شروط الاستخدام</Link> و <Link href="#" className="text-primary-container underline underline-offset-4 font-bold">سياسة الخصوصية</Link> المتعلقة بالمنصة.
              </span>
            </label>

            {/* Submit */}
            <div className="pt-2">
              <button
                className="w-full bg-gradient-to-r from-primary-container to-[#00e0b7] py-4 flex items-center justify-center gap-3 text-on-primary font-headline font-extrabold text-lg shadow-[0_0_20px_rgba(0,255,209,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                ) : (
                  <>
                    <span>إنشاء الحساب</span>
                    <span className="material-symbols-outlined scale-x-[-1]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center relative z-10">
          <p className="text-sm text-slate-500 font-body">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary-container font-black hover:underline decoration-primary-container/30 underline-offset-4">
              تسجيل الدخول
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
