'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!sessionId) {
      router.replace('/opportunities');
      return;
    }
    const timer = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(timer);
          router.push('/portfolio');
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId, router]);

  return (
    <div className="bg-background text-foreground min-h-screen" dir="rtl">
      <Navbar />
      <main className="pt-32 pb-32 px-6 max-w-4xl mx-auto">
        {/* Success Card */}
        <div className="bg-gradient-to-br from-surface-container-high/60 to-surface-container-high/30 backdrop-blur-md border border-primary-container/20 p-12 rounded-3xl relative mb-8 shadow-lg shadow-primary-container/10">
          <div className="absolute inset-0 rounded-3xl">
            <div className="l-bracket-tr"></div>
            <div className="l-bracket-bl"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary-container/20 rounded-full animate-pulse"></div>
                <span className="material-symbols-outlined text-7xl text-primary-container">
                  task_alt
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-headline font-black text-foreground uppercase tracking-tight mb-4">
              تم الاستثمار بنجاح! 🎉
            </h1>

            <p className="text-muted-foreground font-body mb-3">
              تمت معالجة دفعتك وتأكيد استثمارك بنجاح.
            </p>
            <p className="text-muted-foreground font-body text-sm mb-8">
              سيتم إخطارك بأي تحديثات على المشروع مباشرة.
            </p>

            {/* Next Steps */}
            <div className="bg-primary-container/10 border border-primary-container/20 rounded-2xl p-8 mb-8 text-right">
              <h2 className="text-xl font-headline font-black text-foreground mb-6 uppercase tracking-tight">الخطوات التالية:</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-container text-background rounded-full flex items-center justify-center font-headline font-black text-sm">1</div>
                  <div className="text-right flex-1">
                    <p className="font-headline font-bold text-foreground mb-1">متابعة المشروع</p>
                    <p className="text-sm text-muted-foreground">يمكنك متابعة تقدم المشروع من خلال محفظتك الاستثمارية</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-container text-background rounded-full flex items-center justify-center font-headline font-black text-sm">2</div>
                  <div className="text-right flex-1">
                    <p className="font-headline font-bold text-foreground mb-1">التواصل مع المؤسس</p>
                    <p className="text-sm text-muted-foreground">سيتواصل معك صاحب المشروع لشكرك على الاستثمار</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-container text-background rounded-full flex items-center justify-center font-headline font-black text-sm">3</div>
                  <div className="text-right flex-1">
                    <p className="font-headline font-bold text-foreground mb-1">الحصول على التقارير</p>
                    <p className="text-sm text-muted-foreground">ستتلقى تقارير دورية عن أداء استثمارك</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/portfolio')}
                className="bg-primary-container text-background font-black px-10 py-4 rounded-2xl hover:brightness-110 transition-all uppercase tracking-widest font-headline flex items-center gap-3 justify-center"
              >
                <span className="material-symbols-outlined">account_balance_wallet</span>
                عرض محفظتي
              </button>
              <button
                onClick={() => router.push('/messages')}
                className="bg-surface-container-high/40 text-foreground font-black px-10 py-4 border border-primary-container/30 rounded-2xl hover:bg-surface-container-high/60 transition-all uppercase tracking-widest font-headline flex items-center gap-3 justify-center"
              >
                <span className="material-symbols-outlined">mail</span>
                الرسائل
              </button>
            </div>

            <p className="text-muted-foreground text-xs mt-8 font-data">
              سيتم توجيهك تلقائياً إلى محفظتك خلال {countdown} ثوانٍ
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">progress_activity</span>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
