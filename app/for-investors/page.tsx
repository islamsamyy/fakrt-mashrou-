'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

const features = [
  {
    icon: 'search',
    title: 'اكتشف الفرص',
    description: 'تصفح آلاف المشاريع والأفكار المعروضة بسهولة',
  },
  {
    icon: 'smart_toy',
    title: 'توصيات ذكية',
    description: 'نظام AI يقترح الفرص الأنسب لملفك الاستثماري',
  },
  {
    icon: 'analytics',
    title: 'تحليلات متقدمة',
    description: 'أدوات تحليل شاملة لتقييم جودة الاستثمار',
  },
  {
    icon: 'people',
    title: 'تواصل مباشر',
    description: 'نظام آمن للتواصل مع أصحاب المشاريع',
  },
  {
    icon: 'dashboard',
    title: 'محفظة استثمارية',
    description: 'لوحة تحكم كاملة لمتابعة استثماراتك',
  },
  {
    icon: 'trending_up',
    title: 'تقارير الأداء',
    description: 'تحديثات دورية عن أداء استثماراتك',
  },
];

const benefits = [
  {
    title: 'عائد استثماري عالي',
    description: 'فرص استثمارية في مراحل مبكرة برقم عائد محتمل عالي',
  },
  {
    title: 'تنويع المحفظة',
    description: 'استثمر في قطاعات ومراحل متعددة لتقليل المخاطر',
  },
  {
    title: 'شفافية وموثوقية',
    description: 'تحقق كامل من جميع المشاريع والمؤسسين',
  },
  {
    title: 'دعم مستمر',
    description: 'فريق استشاري جاهز للمساعدة في كل خطوة',
  },
];

const investmentSizes = [
  {
    amount: 'الملاك',
    range: '50,000 - 500,000 ريال',
    description: 'استثمارات شخصية في مراحل مبكرة',
  },
  {
    amount: 'الصناديق الصغيرة',
    range: '500,000 - 2 مليون ريال',
    description: 'صناديق استثمارية متخصصة',
  },
  {
    amount: 'صناديق رأس المال',
    range: '2 - 10 ملايين ريال',
    description: 'صناديق متعددة المحافظ',
  },
  {
    amount: 'المستثمرون المؤسسيون',
    range: 'أكثر من 10 ملايين ريال',
    description: 'شركات استثمارية كبرى',
  },
];

export default function ForInvestorsPage() {
  return (
    <div className="w-full bg-background text-foreground" dir="rtl">
      <Navbar />

      {/* Hero */}
      <section className="min-h-[60vh] flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/10 blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black">للمستثمرين</h1>
          <p className="text-2xl text-muted-foreground">
            اكتشف فرص استثمارية عالية العائد في الشرق الأوسط
          </p>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-secondary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
          >
            <span>استكشف الفرص</span>
            <span className="material-symbols-outlined">search</span>
          </Link>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">منصة استثمارية شاملة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-secondary-container/20 rounded-2xl hover:border-secondary-container/40 transition-all group"
              >
                <span className="material-symbols-outlined text-5xl text-secondary-container mb-6 block group-hover:scale-125 transition-transform">
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
          <h2 className="text-4xl font-black text-center mb-20">لماذا تختار منصتنا؟</h2>

          <div className="space-y-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex gap-8 items-start p-8 bg-surface-container border border-secondary-container/20 rounded-2xl hover:border-secondary-container/40 transition-all">
                <div className="w-16 h-16 bg-secondary-container/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-black text-secondary-container">✓</span>
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

      {/* Investment Sizes */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">أحجام الاستثمار المرنة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {investmentSizes.map((item, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-secondary-container/20 rounded-2xl hover:border-secondary-container/40 transition-all"
              >
                <div className="text-sm font-data text-secondary-container tracking-widest uppercase mb-4">
                  الفئة {i + 1}
                </div>
                <h3 className="text-xl font-black mb-3">{item.amount}</h3>
                <p className="text-lg font-semibold text-secondary-container mb-4">{item.range}</p>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Metrics */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">أداء المستثمرين</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-surface-container border border-secondary-container/20 rounded-2xl text-center">
              <div className="text-5xl font-black text-secondary-container mb-4">15.3x</div>
              <p className="text-muted-foreground text-lg">متوسط العائد</p>
            </div>
            <div className="p-8 bg-surface-container border border-primary-container/20 rounded-2xl text-center">
              <div className="text-5xl font-black text-primary-container mb-4">34</div>
              <p className="text-muted-foreground text-lg">شركة خرجت بنجاح</p>
            </div>
            <div className="p-8 bg-surface-container border border-accent/20 rounded-2xl text-center">
              <div className="text-5xl font-black text-accent mb-4">92%</div>
              <p className="text-muted-foreground text-lg">معدل رضا المستثمرين</p>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Categories */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">القطاعات المتاحة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '💻', name: 'التكنولوجيا', count: '34+ مشروع' },
              { icon: '🏦', name: 'التكنولوجيا المالية', count: '18+ مشروع' },
              { icon: '🏥', name: 'الصحة الرقمية', count: '12+ مشروع' },
              { icon: '⚡', name: 'الطاقة المتجددة', count: '15+ مشروع' },
              { icon: '🛍️', name: 'التجارة الإلكترونية', count: '22+ مشروع' },
              { icon: '📚', name: 'التعليم التقني', count: '11+ مشروع' },
            ].map((sector, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all text-center group"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">{sector.icon}</div>
                <h3 className="text-xl font-black mb-2">{sector.name}</h3>
                <p className="text-secondary-container font-semibold">{sector.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Management */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">إدارة المخاطر</h2>

          <div className="space-y-8">
            {[
              {
                title: 'تقييم شامل',
                description: 'فريق متخصص يقيم كل مشروع على أساس معايير صارمة',
              },
              {
                title: 'تنويع المحفظة',
                description: 'استثمر في عدة مشاريع وقطاعات لتقليل التعرض للمخاطر',
              },
              {
                title: 'عقود قانونية',
                description: 'جميع الاستثمارات مغطاة بعقود قانونية موثقة',
              },
              {
                title: 'تقارير منتظمة',
                description: 'احصل على تحديثات شهرية عن أداء الشركات',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 items-start p-8 bg-surface-container border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all">
                <div className="w-12 h-12 bg-primary-container/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-black text-primary-container">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-24 px-6 bg-gradient-to-r from-secondary-container/20 to-primary-container/20 border-y border-primary-container/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-4xl font-black mb-6">ابدأ الاستثمار اليوم</h2>
            <p className="text-xl text-muted-foreground">
              تسجيل بسيط، تحقق سريع، فرص لا حصر لها
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-background border border-secondary-container/30 rounded-2xl">
              <div className="text-4xl font-black text-secondary-container mb-4">1</div>
              <h3 className="text-xl font-black mb-3">أنشئ حسابك</h3>
              <p className="text-muted-foreground">بريد إلكتروني + معلومات الملف</p>
            </div>
            <div className="p-8 bg-background border border-secondary-container/30 rounded-2xl">
              <div className="text-4xl font-black text-secondary-container mb-4">2</div>
              <h3 className="text-xl font-black mb-3">التحقق المالي</h3>
              <p className="text-muted-foreground">تأكيد الأهلية والمركز المالي</p>
            </div>
            <div className="p-8 bg-background border border-secondary-container/30 rounded-2xl">
              <div className="text-4xl font-black text-secondary-container mb-4">3</div>
              <h3 className="text-xl font-black mb-3">ابدأ الاستثمار</h3>
              <p className="text-muted-foreground">اكتشف وستثمر في فرصك الأولى</p>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-secondary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
          >
            <span>ابدأ الاستثمار</span>
            <span className="material-symbols-outlined">trending_up</span>
          </Link>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">قصص نجاح المستثمرين</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                investor: 'صندوق الثروة السعودي',
                return: '12x العائد',
                company: 'في شركة تكنولوجيا',
                icon: '🚀',
              },
              {
                investor: 'مستثمر ملاك فردي',
                return: '8x العائد',
                company: 'في شركة تجارة إلكترونية',
                icon: '💰',
              },
              {
                investor: 'صندوق متخصص',
                return: '15x العائد',
                company: 'في شركة تكنولوجيا مالية',
                icon: '📈',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 bg-surface-container border border-secondary-container/20 rounded-2xl hover:border-secondary-container/40 transition-all"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-black mb-2">{item.investor}</h3>
                <p className="text-secondary-container font-bold mb-4 text-lg">{item.return}</p>
                <p className="text-muted-foreground">{item.company}</p>
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
                q: 'كم الحد الأدنى للاستثمار؟',
                a: 'الحد الأدنى 50,000 ريال. لا حد أقصى للاستثمار.',
              },
              {
                q: 'كيف أتخارج من الاستثمار؟',
                a: 'يمكنك البقاء طويل الأمد أو البحث عن مشترين. الشركة قد تقدم خيارات خروج.',
              },
              {
                q: 'هل هناك رسوم إدارية؟',
                a: 'رسوم إدارية بسيطة 2-3% على الأرباح فقط، بدون رسوم أخرى.',
              },
              {
                q: 'هل يمكنني الاستثمار بدون خبرة سابقة؟',
                a: 'نعم، فريقنا يوفر إرشادات كاملة وأدوات لمساعدة المبتدئين.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-background border border-secondary-container/20 rounded-xl hover:border-secondary-container/40 transition-all"
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
          <h2 className="text-4xl font-black">لا تترك أموالك معطلة</h2>
          <p className="text-xl text-muted-foreground">
            استثمر في المستقبل، واكتشف فرصاً حقيقية في الشركات الناشئة الواعدة
          </p>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-secondary-container text-background font-black text-lg rounded-full hover:scale-105 transition-all"
          >
            <span>استكشف الفرص الآن</span>
            <span className="material-symbols-outlined">search</span>
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
