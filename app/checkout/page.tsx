'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { createStripeSession } from './actions';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = searchParams.get('projectId');
  const [amount, setAmount] = useState<number>(50000);
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      toast.error('لم يتم تحديد المشروع');
      setTimeout(() => router.push('/opportunities'), 2000);
    }
    if (searchParams.get('cancelled') === 'true') {
      toast.error('تم إلغاء عملية الدفع');
    }
    setTxId(`TX-${Date.now().toString().slice(-6).toUpperCase()}`);
  }, [projectId, router, searchParams]);

  const fee = amount * 0.015; // 1.5% platform fee
  const total = amount + fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      const msg = 'يجب الموافقة على الشروط والأحكام';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!projectId) {
      const msg = 'معرف المشروع مفقود';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (amount <= 0) {
      const msg = 'يجب أن يكون المبلغ أكبر من صفر';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { url } = await createStripeSession(projectId, amount, message);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('فشل الحصول على رابط الدفع');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في معالجة الاستثمار. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center px-4">
        <Navbar />
        <div className="text-center pt-32">
          <span className="material-symbols-outlined text-6xl text-muted-foreground block mb-4">warning</span>
          <p className="text-xl text-muted-foreground">لم يتم تحديد المشروع. سيتم إعادة توجيهك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-body min-h-screen relative overflow-x-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 neon-grid pointer-events-none z-0 opacity-20"></div>
      <div className="fixed inset-0 scanline pointer-events-none z-0 opacity-5"></div>

      <Navbar />

      <main className="pt-32 pb-32 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="text-right">
            <h1 className="text-4xl md:text-5xl font-headline font-black text-primary-container uppercase tracking-tight">تأكيد الاستثمار</h1>
            <p className="text-muted-foreground font-body text-lg mt-2">الخطوة النهائية لتأمين حصتك في هذا المشروع الواعد</p>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-low/40 backdrop-blur-md p-4 relative border border-primary-container/20">
            <div className="l-bracket-tr"></div>
            <div className="l-bracket-bl"></div>
            <div className="text-right font-data">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">TRANSACTION_ID</div>
              <div className="text-primary-container text-sm">{txId}</div>
            </div>
            <span className="material-symbols-outlined text-primary-container">verified_user</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
            <span className="material-symbols-outlined text-red-400 text-xl flex-shrink-0 mt-1">error</span>
            <div className="flex-1">
              <h3 className="text-red-400 font-headline font-black mb-1 uppercase tracking-tight">خطأ</h3>
              <p className="text-red-400/80 text-sm font-body">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Payment & Legal & Message) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Payment Method Card */}
            <section className="bg-surface-container-low/40 backdrop-blur-md p-8 border border-primary-container/20 relative group">
              <div className="l-bracket-tr"></div>
              <div className="l-bracket-bl"></div>
              <h2 className="text-xl font-headline font-black text-foreground mb-8 flex items-center gap-3 uppercase tracking-tight">
                <span className="material-symbols-outlined text-primary-container">payments</span>
                طريقة الدفع
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'رصيد المحفظة', sub: 'Wallet Balance', icon: 'account_balance_wallet', active: true },
                  { label: 'تحويل بنكي', sub: 'Bank Transfer', icon: 'account_balance' },
                  { label: 'إيداع الضمان', sub: 'Escrow Deposit', icon: 'security' }
                ].map((item, i) => (
                  <label key={i} className="relative cursor-pointer group">
                    <input defaultChecked={item.active} className="peer hidden" name="payment" type="radio"/>
                    <div className="p-6 bg-surface-container-high/40 border-2 border-transparent peer-checked:border-primary-container peer-checked:bg-primary-container/10 transition-all text-center">
                      <span className={`material-symbols-outlined text-3xl mb-3 block ${item.active ? 'text-primary-container' : 'text-muted-foreground'} group-hover:text-primary-container`}>{item.icon}</span>
                      <span className="font-headline font-black text-foreground block text-sm uppercase tracking-widest">{item.label}</span>
                      <span className="font-data text-[10px] text-muted-foreground mt-1 block uppercase">{item.sub}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Legal Consent Card */}
            <section className="bg-surface-container-low/40 backdrop-blur-md p-8 border border-primary-container/20 relative">
              <div className="l-bracket-tr"></div>
              <div className="l-bracket-bl"></div>
              <h2 className="text-xl font-headline font-black text-foreground mb-8 flex items-center gap-3 uppercase tracking-tight">
                <span className="material-symbols-outlined text-primary-container">gavel</span>
                الموافقات القانونية
              </h2>
              <div className="space-y-4">
                <label className="flex items-start gap-4 cursor-pointer p-4 hover:bg-surface-container-high/40 transition-colors">
                  <div className="mt-1">
                    <input
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 bg-background border border-primary-container/30 text-primary-container focus:ring-primary-container/20 rounded cursor-pointer"
                      type="checkbox"
                    />
                  </div>
                  <div className="text-sm font-body text-muted-foreground leading-relaxed text-right">
                    أوافق على <span className="text-primary-container font-black uppercase">اتفاقية الاستثمار</span> و <span className="text-primary-container font-black uppercase">الإفصاح عن المخاطر</span>. أتفهم أن جميع الاستثمارات تحمل مخاطر مالية وقد تتقلب قيمتها.
                  </div>
                </label>
                <div className="p-4 bg-primary-container/10 border-r-2 border-primary-container/30 text-right">
                  <p className="text-sm text-primary-container font-headline font-black mb-1 uppercase tracking-widest">تنبيه الاستثمار:</p>
                  <p className="text-xs text-muted-foreground font-body">تم التحقق من هذا المشروع باستخدام معايير دولية صارمة.</p>
                </div>
              </div>
            </section>

            {/* Message to Founder */}
            <section className="bg-surface-container-low/40 backdrop-blur-md p-8 border border-primary-container/20 relative">
              <div className="l-bracket-tr"></div>
              <div className="l-bracket-bl"></div>
              <h2 className="text-xl font-headline font-black text-foreground mb-8 flex items-center gap-3 uppercase tracking-tight">
                <span className="material-symbols-outlined text-primary-container">mail</span>
                رسالة إلى صاحب المشروع (اختياري)
              </h2>
              <div className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="شارك رؤيتك أو أسئلتك حول هذا المشروع..."
                  disabled={loading}
                  className="w-full bg-background/50 border border-primary-container/20 focus:border-primary-container text-foreground rounded-xl p-4 font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all text-right placeholder:text-muted-foreground/50"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground font-body text-right">
                  ستتم مشاركة هذه الرسالة مع صاحب المشروع مباشرة بعد تأكيد الاستثمار
                </p>
              </div>
            </section>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full group relative disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-primary-container blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-primary-container text-[#050608] dark:text-[#050608] py-6 px-10 flex items-center justify-center gap-4 clip-button hover:brightness-110 transition-all active:scale-[0.98] disabled:hover:brightness-100">
                {loading ? (
                  <>
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xl font-headline font-black uppercase tracking-widest">
                      جاري المعالجة...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl font-black">arrow_forward</span>
                    <span className="text-2xl font-headline font-black uppercase tracking-widest">
                      تأكيد الاستثمار
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Right Column (Order Summary) */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              <div className="bg-surface-container-high/40 backdrop-blur-md p-8 border border-primary-container/20 relative shadow-[0_0_40px_rgba(0,0,0,0.5)] dark:shadow-[0_0_40px_rgba(0,255,209,0.1)]">
                <div className="l-bracket-tr"></div>
                <div className="l-bracket-bl"></div>
                <h2 className="font-headline text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 border-b border-primary-container/20 pb-4 text-right">ملخص العملية الاستثمارية</h2>
                <div className="mb-8 text-right">
                  <div className="text-[10px] text-primary-container mb-2 font-headline font-black uppercase tracking-widest">المشروع</div>
                  <h3 className="text-2xl font-headline font-black text-foreground leading-tight uppercase tracking-tight">استثمار موعود</h3>
                </div>
                <div className="space-y-6">
                  <div className="text-right">
                    <label className="text-[10px] text-muted-foreground mb-3 block font-headline font-black uppercase tracking-widest">مبلغ الاستثمار (USD)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        className="w-full bg-background/50 border-b-2 border-primary-container/30 focus:border-primary-container transition-colors py-4 px-4 font-data text-2xl text-foreground focus:ring-0 outline-none text-right pr-12"
                        disabled={loading}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-container font-data text-sm">$</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-primary-container/20">
                    <span className="font-data text-foreground">{fee.toFixed(2)} <span className="text-[10px] text-muted-foreground uppercase font-black">USD</span></span>
                    <span className="text-muted-foreground font-body text-sm font-bold tracking-widest">رسوم المنصة (1.5%)</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-primary-container/20">
                    <span className="font-data text-foreground">0.00 <span className="text-[10px] text-muted-foreground uppercase font-black">USD</span></span>
                    <span className="text-muted-foreground font-body text-sm font-bold tracking-widest">الضرائب التقديرية</span>
                  </div>
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-primary-container/20">
                    <div className="flex justify-between items-end">
                      <div className="text-left w-full">
                        <div className="text-4xl font-data font-black text-primary-container drop-shadow-[0_0_15px_rgba(0,255,209,0.3)]">
                          {total.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-data mt-1 uppercase font-bold tracking-[0.2em]">USD TOTAL</div>
                      </div>
                      <span className="text-lg font-headline font-black text-foreground uppercase tracking-widest text-right whitespace-nowrap ml-4">الإجمالي</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low/40 backdrop-blur-md p-4 flex items-center gap-3 border border-primary-container/20 text-right justify-end">
                  <span className="text-[10px] text-muted-foreground font-headline font-black uppercase tracking-tight leading-tight">تشفير آمن</span>
                  <span className="material-symbols-outlined text-primary-container">lock</span>
                </div>
                <div className="bg-surface-container-low/40 backdrop-blur-md p-4 flex items-center gap-3 border border-primary-container/20 text-right justify-end">
                  <span className="text-[10px] text-muted-foreground font-headline font-black uppercase tracking-tight leading-tight">موثوق</span>
                  <span className="material-symbols-outlined text-primary-container">verified</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">progress_activity</span>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
