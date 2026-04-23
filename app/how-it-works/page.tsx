'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

const founderSteps = [
  {
    number: '01',
    title: 'اطرح فكرتك أو مشروعك',
    description: 'قدم وصفاً تفصيلياً لمشروعك مع أهدافك المالية والجدول الزمني',
    icon: 'lightbulb',
  },
  {
    number: '02',
    title: 'اجتاز التحقق',
    description: 'عملية KYC سريعة وآمنة للتحقق من الهوية والمصداقية',
    icon: 'verified_user',
  },
  {
    number: '03',
    title: 'اختر المستثمرين',
    description: 'الذكاء الاصطناعي يقترح المستثمرين الأنسب لمشروعك',
    icon: 'people',
  },
  {
    number: '04',
    title: 'تفاوض وأغلق الصفقة',
    description: 'تواصل مباشر مع المستثمرين من خلال منصتنا الآمنة',
    icon: 'handshake',
  },
  {
    number: '05',
    title: 'احصل على التمويل',
    description: 'استقبل الأموال بشكل آمن ومباشر مع توثيق قانوني كامل',
    icon: 'payments',
  },
  {
    number: '06',
    title: 'نمِّ مشروعك',
    description: 'احصل على الدعم المستمر والإرشادات من الفريق المتخصص',
    icon: 'trending_up',
  },
];

const investorSteps = [
  {
    number: '01',
    title: 'أنشئ ملفك الاستثماري',
    description: 'حدد اهتماماتك والقطاعات والمراحل التي تفضلها',
    icon: 'person',
  },
  {
    number: '02',
    title: 'اكتمل التحقق المالي',
    description: 'التحقق من الأهلية المالية والمركز الاستثماري',
    icon: 'verified',
  },
  {
    number: '03',
    title: 'استكشف الفرص',
    description: 'تصفح الآلاف من المشاريع المعروضة بناءً على معاييرك',
    icon: 'search',
  },
  {
    number: '04',
    title: 'حلل واختر',
    description: 'استخدم أدوات التحليل المتقدمة لتقييم المشاريع',
    icon: 'analytics',
  },
  {
    number: '05',
    title: 'تواصل وتفاوض',
    description: 'التواصل المباشر مع أصحاب المشاريع عبر المنصة',
    icon: 'chat',
  },
  {
    number: '06',
    title: 'استثمر وتابع',
    description: 'أغلق الصفقة واتابع أداء استثمارتك في لوحة التحكم',
    icon: 'dashboard',
  },
];

const features = [
  {
    icon: 'smart_toy',
    title: 'توصيات الذكاء الاصطناعي',
    description: 'نظام متعلم يقترح أفضل المطابقات بناءً على ملفك والأداء التاريخي',
  },
  {
    icon: 'lock',
    title: 'تشفير عسكري',
    description: 'أعلى معايير الأمان (AES-256) لحماية بيانات المستخدمين',
  },
  {
    icon: 'gavel',
    title: 'معايير قانونية',
    description: 'امتثال كامل للتشريعات السعودية والدولية',
  },
  {
    icon: 'support_agent',
    title: 'دعم متخصص',
    description: 'فريق محترف جاهز للمساعدة 24/7',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="w-full bg-background text-foreground" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[60vh] flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black">كيف يعمل النظام؟</h1>
          <p className="text-2xl text-muted-foreground">
            رحلة سهلة وآمنة من الفكرة إلى التمويل
          </p>
        </div>
      </section>

      {/* For Founders */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-6">للمؤسسين والرواد</h2>
            <p className="text-xl text-muted-foreground">6 خطوات نحو تمويل حلمك</p>
          </div>

          <div className="space-y-12">
            {founderSteps.map((step, i) => (
              <div key={i} className="flex gap-8 items-start relative">
                {/* Timeline Connector */}
                {i < founderSteps.length - 1 && (
                  <div className="absolute right-[38px] top-[100px] w-0.5 h-20 bg-gradient-to-b from-primary-container/40 to-transparent -z-10"></div>
                )}

                {/* Step Number Circle */}
                <div className="w-20 h-20 bg-gradient-to-br from-primary-container/30 to-primary-container/10 border-2 border-primary-container rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                  <span className="font-black text-primary-container text-lg">{step.number}</span>
                </div>

                {/* Content Card */}
                <div className="flex-1 p-8 bg-background border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all group">
                  <div className="flex items-start gap-6">
                    <span className="material-symbols-outlined text-5xl text-primary-container flex-shrink-0 group-hover:scale-125 transition-transform">
                      {step.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-3">{step.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/add-idea"
              className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-primary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
            >
              <span>ابدأ الآن</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* For Investors */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-6">للمستثمرين</h2>
            <p className="text-xl text-muted-foreground">6 خطوات للعثور على فرصتك المثالية</p>
          </div>

          <div className="space-y-12">
            {investorSteps.map((step, i) => (
              <div key={i} className="flex gap-8 items-start relative">
                {/* Timeline Connector */}
                {i < investorSteps.length - 1 && (
                  <div className="absolute right-[38px] top-[100px] w-0.5 h-20 bg-gradient-to-b from-secondary-container/40 to-transparent -z-10"></div>
                )}

                {/* Step Number Circle */}
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-container/30 to-secondary-container/10 border-2 border-secondary-container rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                  <span className="font-black text-secondary-container text-lg">{step.number}</span>
                </div>

                {/* Content Card */}
                <div className="flex-1 p-8 bg-surface-container/50 border border-secondary-container/20 rounded-2xl hover:border-secondary-container/40 transition-all group">
                  <div className="flex items-start gap-6">
                    <span className="material-symbols-outlined text-5xl text-secondary-container flex-shrink-0 group-hover:scale-125 transition-transform">
                      {step.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black mb-3">{step.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-secondary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
            >
              <span>استكشف الفرص</span>
              <span className="material-symbols-outlined">search</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">ما يميزنا</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all group"
              >
                <span className="material-symbols-outlined text-5xl text-primary-container mb-6 block group-hover:scale-125 transition-transform">
                  {feature.icon}
                </span>
                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">أسئلة شائعة</h2>

          <div className="space-y-6">
            {[
              {
                q: 'كم الوقت الذي يستغرقه الحصول على التمويل؟',
                a: 'في المتوسط، من أسبوعين إلى 8 أسابيع حسب تعقيد المشروع ورغبة المستثمرين.',
              },
              {
                q: 'هل هناك رسوم للتسجيل؟',
                a: 'لا، التسجيل مجاني تماماً. نأخذ عمولة صغيرة فقط عند إتمام الاستثمار (بعد نجاح الصفقة).',
              },
              {
                q: 'كيف يتم ضمان أمان البيانات؟',
                a: 'نستخدم تشفير من الطراز العسكري (AES-256) وأحدث معايير الأمان السيبراني.',
              },
              {
                q: 'ما هي متطلبات التحقق (KYC)؟',
                a: 'بطاقة الهوية، إثبات العنوان، والتحقق من الأهلية المالية. العملية تستغرق حوالي 5 دقائق.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-surface-container border border-primary-container/20 rounded-xl hover:border-primary-container/40 transition-all"
              >
                <h3 className="text-lg font-black mb-3">{item.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary-container/20 to-secondary-container/20 border-y border-primary-container/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-black">جاهز للبدء؟</h2>
          <p className="text-xl text-muted-foreground">
            انضم لآلاف الرواد والمستثمرين الذين وجدوا النجاح عبر منصتنا
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              href="/register"
              className="px-8 md:px-12 py-4 bg-primary-container text-background font-black rounded-full hover:scale-105 transition-all"
            >
              إنشاء حساب
            </Link>
            <Link
              href="/contact"
              className="px-8 md:px-12 py-4 border-2 border-primary-container/50 text-foreground font-black rounded-full hover:bg-primary-container/10 transition-all"
            >
              اتصل بنا
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-surface-container/50 border-t border-primary-container/15 text-center text-muted-foreground text-sm">
        <p>© 2024 IDEA BUSINESS. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
