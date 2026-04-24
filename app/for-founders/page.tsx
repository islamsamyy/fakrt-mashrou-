'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

const features = [
  {
    icon: 'lightbulb',
    title: 'عرض مشروعك',
    description: 'واجهة سهلة لتقديم فكرتك مع جميع التفاصيل المطلوبة',
  },
  {
    icon: 'trending_up',
    title: 'تتبع الأداء',
    description: 'لوحة تحكم كاملة لمراقبة تقدم مشروعك والعروض الواردة',
  },
  {
    icon: 'people',
    title: 'اتصل بالمستثمرين',
    description: 'نظام تواصل آمن للتفاوض مباشرة مع المستثمرين المهتمين',
  },
  {
    icon: 'verified_user',
    title: 'أدوات التحقق',
    description: 'عملية تحقق آمنة وموثوقة لبناء الثقة مع المستثمرين',
  },
  {
    icon: 'payments',
    title: 'استقبال الأموال',
    description: 'تحويلات آمنة مع توثيق قانوني كامل للعقود',
  },
  {
    icon: 'support_agent',
    title: 'دعم متخصص',
    description: 'فريق استشاري يساعدك في كل خطوة من رحلتك',
  },
];

const benefits = [
  {
    title: 'الوصول إلى رأس مال متعدد',
    description: 'ملايين الريالات متاحة من مستثمرين معتمدين ومتحققين',
  },
  {
    title: 'عملية سريعة وسهلة',
    description: 'من التقديم إلى التمويل في غضون أسابيع قليلة',
  },
  {
    title: 'شفافية كاملة',
    description: 'معرفة بالضبط من يبحث عن مشروعك والشروط المعروضة',
  },
  {
    title: 'حماية قانونية',
    description: 'عقود رسمية وتوثيق كامل تحت إشراف فريق قانوني',
  },
];

const fundingStages = [
  { stage: 'Pre-Seed', amount: 'أقل من 250,000 ريال', description: 'للأفكار الأولية والنماذج الأولية' },
  { stage: 'Seed', amount: '250,000 - 1 مليون ريال', description: 'لإطلاق المنتج والعمليات التجريبية' },
  { stage: 'Series A', amount: '1 - 5 ملايين ريال', description: 'لتوسيع السوق والنمو التشغيلي' },
  { stage: 'Series B+', amount: 'فوق 5 ملايين ريال', description: 'لتوسيع إقليمي وتوسع عالمي' },
];

export default function ForFoundersPage() {
  return (
    <div className="w-full bg-background text-foreground" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[60vh] flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black">للمؤسسين والرواد</h1>
          <p className="text-2xl text-muted-foreground">
            منصة شاملة لتمويل فكرتك وتنمية مشروعك
          </p>
          <Link
            href="/add-idea"
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-primary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
          >
            <span>اطرح فكرتك الآن</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">الميزات الأساسية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all group"
              >
                <span className="material-symbols-outlined text-5xl text-primary-container mb-6 block group-hover:scale-125 transition-transform">
                  {feature.icon}
                </span>
                <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">لماذا تختار IDEA BUSINESS؟</h2>

          <div className="space-y-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex gap-8 items-start p-8 bg-surface-container border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all">
                <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-black text-primary-container">✓</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Stages */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">مراحل التمويل المدعومة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fundingStages.map((item, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all"
              >
                <div className="text-sm font-data text-primary-container tracking-widest uppercase mb-4">
                  المرحلة {i + 1}
                </div>
                <h3 className="text-2xl font-black mb-3">{item.stage}</h3>
                <p className="text-lg font-semibold text-primary-container mb-4">{item.amount}</p>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">نجاح المؤسسين على منصتنا</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-surface-container border border-primary-container/20 rounded-2xl text-center">
              <div className="text-5xl font-black text-primary-container mb-4">78%</div>
              <p className="text-muted-foreground text-lg">معدل نجاح التمويل</p>
            </div>
            <div className="p-8 bg-surface-container border border-secondary-container/20 rounded-2xl text-center">
              <div className="text-5xl font-black text-secondary-container mb-4">4.5</div>
              <p className="text-muted-foreground text-lg">متوسط أسابيع التمويل</p>
            </div>
            <div className="p-8 bg-surface-container border border-accent/20 rounded-2xl text-center">
              <div className="text-5xl font-black text-accent mb-4">68M</div>
              <p className="text-muted-foreground text-lg">إجمالي التمويلات</p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary-container/20 to-secondary-container/20 border-y border-primary-container/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-4xl font-black mb-6">جاهز للبدء؟</h2>
            <p className="text-xl text-muted-foreground">
              فقط 3 خطوات بسيطة تفصلك عن عالم من الفرص الاستثمارية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-background border border-primary-container/30 rounded-2xl">
              <div className="text-4xl font-black text-primary-container mb-4">1</div>
              <h3 className="text-xl font-black mb-3">أنشئ حسابك</h3>
              <p className="text-muted-foreground">بريد إلكتروني + كلمة مرور آمنة</p>
            </div>
            <div className="p-8 bg-background border border-primary-container/30 rounded-2xl">
              <div className="text-4xl font-black text-primary-container mb-4">2</div>
              <h3 className="text-xl font-black mb-3">أكمل التحقق</h3>
              <p className="text-muted-foreground">عملية KYC سريعة (5 دقائق)</p>
            </div>
            <div className="p-8 bg-background border border-primary-container/30 rounded-2xl">
              <div className="text-4xl font-black text-primary-container mb-4">3</div>
              <h3 className="text-xl font-black mb-3">اطرح مشروعك</h3>
              <p className="text-muted-foreground">وابدأ استقبال العروض</p>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-primary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
          >
            <span>ابدأ الآن</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">قصص نجاح</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                company: 'تطبيق درايف',
                founder: 'علي الحمادي',
                result: 'جمع 500,000 ريال في 3 أسابيع',
                icon: '📱',
              },
              {
                company: 'منصة التجارة',
                founder: 'فاطمة السعود',
                result: 'توسيع إلى 3 دول عربية',
                icon: '🏪',
              },
              {
                company: 'تحليل البيانات',
                founder: 'محمد العتيبي',
                result: 'Series A بـ 2 مليون ريال',
                icon: '📊',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 bg-surface-container border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-black mb-2">{item.company}</h3>
                <p className="text-primary-container font-medium mb-4">من: {item.founder}</p>
                <p className="text-muted-foreground">{item.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">أسئلة متكررة</h2>

          <div className="space-y-6">
            {[
              {
                q: 'كم المبلغ الذي يمكنني طلبه؟',
                a: 'يمكنك طلب أي مبلغ من 50,000 ريال فما فوق. لا حد أقصى للتمويل.',
              },
              {
                q: 'هل سأخسر السيطرة على شركتي؟',
                a: 'لا، أنت تحتفظ بكامل السيطرة. تحدد أنت نسبة الملكية التي تود مشاركتها.',
              },
              {
                q: 'هل هناك رسوم خفية؟',
                a: 'لا، لا توجد رسوم. نحصل على عمولة صغيرة فقط عند إتمام الاستثمار.',
              },
              {
                q: 'كم الوقت المطلوب لعرض مشروعي؟',
                a: 'حوالي 15-20 دقيقة فقط. كلما كنت تفصيلياً، كلما حصلت على عروض أفضل.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-background border border-primary-container/20 rounded-xl hover:border-primary-container/40 transition-all"
              >
                <h3 className="text-lg font-black mb-3">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-black">لا تضيع فرصتك</h2>
          <p className="text-xl text-muted-foreground">
            آلاف المستثمرين ينتظرون فكرتك. ابدأ اليوم وغيّر حياتك.
          </p>
          <Link
            href="/add-idea"
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-primary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
          >
            <span>اطرح فكرتك</span>
            <span className="material-symbols-outlined">lightbulb</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-surface-container/50 border-t border-primary-container/15 text-center text-muted-foreground text-sm">
        <p>© 2024 IDEA BUSINESS. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
