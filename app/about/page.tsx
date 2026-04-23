'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

const team = [
  {
    name: 'محمد العبدالله',
    role: 'المؤسس والرئيس التنفيذي',
    bio: 'خبرة 15 سنة في الاستثمار والتمويل',
    icon: '👨‍💼',
  },
  {
    name: 'فاطمة السعيد',
    role: 'نائبة الرئيس - التطوير التقني',
    bio: 'متخصصة في الذكاء الاصطناعي والتعلم الآلي',
    icon: '👩‍💻',
  },
  {
    name: 'أحمد الرويلي',
    role: 'مدير الامتثال والقانون',
    bio: 'قانوني متخصص في اللوائح المالية السعودية',
    icon: '⚖️',
  },
  {
    name: 'نور الشمري',
    role: 'مدير الشراكات والتسويق',
    bio: 'خبيرة في بناء العلاقات الاستثمارية',
    icon: '👩‍💼',
  },
];

const values = [
  {
    icon: 'verified_user',
    title: 'الأمان والموثوقية',
    description: 'أعلى معايير الأمان المالي والبيانات',
  },
  {
    icon: 'equalizer',
    title: 'تكافؤ الفرص',
    description: 'منصة عادلة لجميع الرواد والمستثمرين',
  },
  {
    icon: 'trending_up',
    title: 'النمو المستدام',
    description: 'دعم المشاريع ذات التأثير الاجتماعي',
  },
  {
    icon: 'psychology',
    title: 'الابتكار المستمر',
    description: 'استخدام أحدث تقنيات الذكاء الاصطناعي',
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-background text-foreground" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black">من نحن؟</h1>
          <p className="text-2xl text-muted-foreground">
            نحن نبني جسور الثقة بين الأفكار الريادية والموارد المالية الذكية
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-right">
              <div>
                <h2 className="text-4xl font-black mb-6">رسالتنا</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  تمكين المبتكرين والرواد السعوديين والخليجيين من تحويل أفكارهم إلى واقع بقيمة حقيقية، من خلال توصيلهم برؤوس أموال ذكية وشركاء استراتيجيين.
                </p>
              </div>
            </div>
            <div className="p-12 bg-gradient-to-br from-primary-container/20 to-secondary-container/20 border border-primary-container/30 rounded-3xl">
              <span className="text-7xl block mb-4">🎯</span>
              <p className="font-black text-xl">نحول الأحلام إلى استثمارات</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="p-12 bg-gradient-to-br from-secondary-container/20 to-tertiary-fixed-dim/20 border border-secondary-container/30 rounded-3xl">
              <span className="text-7xl block mb-4">🚀</span>
              <p className="font-black text-xl">نسرع المسار نحو النجاح</p>
            </div>
            <div className="space-y-8 text-right">
              <div>
                <h2 className="text-4xl font-black mb-6">رؤيتنا</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  أن تصبح IDEA BUSINESS الوجهة الأولى عالمياً لأصحاب الأفكار والمستثمرين في الشرق الأوسط، حيث يتم تمويل المشاريع ذات التأثير الحقيقي في أسرع وقت وبأفضل الشروط.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">قيمنا الأساسية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div
                key={i}
                className="p-8 bg-surface-container border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all group"
              >
                <span className="material-symbols-outlined text-5xl text-primary-container mb-4 block group-hover:scale-125 transition-transform">
                  {value.icon}
                </span>
                <h3 className="text-2xl font-black mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">فريق القيادة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div
                key={i}
                className="p-8 bg-background border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all text-center"
              >
                <div className="text-6xl mb-6">{member.icon}</div>
                <h3 className="text-xl font-black mb-2">{member.name}</h3>
                <p className="text-primary-container font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">رحلتنا</h2>

          <div className="space-y-16">
            {[
              {
                year: '2022',
                title: 'البداية',
                description: 'تأسيس IDEA BUSINESS برؤية واضحة لتحويل الاستثمار في الشرق الأوسط',
              },
              {
                year: '2023',
                title: 'الإطلاق الرسمي',
                description: 'إطلاق المنصة بـ 50 مشروع و 30 مستثمر، تمويلات بقيمة 15 مليون ريال',
              },
              {
                year: '2024',
                title: 'النمو المتسارع',
                description: 'وصول النظام الأساسي إلى 124+ مشروع و 47 مستثمر معتمد',
              },
              {
                year: '2025',
                title: 'التوسع الإقليمي',
                description: 'خطط توسيع إلى دول الخليج وعرض الذكاء الاصطناعي المتقدم',
              },
            ].map((milestone, i) => (
              <div key={i} className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary-container/20 border-2 border-primary-container rounded-full flex items-center justify-center font-black text-lg text-primary-container">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-2xl font-black mb-3">{milestone.title}</h3>
                  <p className="text-muted-foreground text-lg">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary-container/20 to-secondary-container/20 border-y border-primary-container/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-20">لماذا تختار IDEA BUSINESS؟</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-6xl text-primary-container">verified</span>
              <h3 className="text-2xl font-black">موثوق عالمياً</h3>
              <p className="text-muted-foreground">تم اختبار البنية التحتية من قبل خبراء أمان عالميين</p>
            </div>

            <div className="space-y-4">
              <span className="material-symbols-outlined text-6xl text-secondary-container">people</span>
              <h3 className="text-2xl font-black">شبكة نخبة</h3>
              <p className="text-muted-foreground">أكثر من 1000 مستثمر وريادي معتمد</p>
            </div>

            <div className="space-y-4">
              <span className="material-symbols-outlined text-6xl text-accent">trending_up</span>
              <h3 className="text-2xl font-black">نتائج مثبتة</h3>
              <p className="text-muted-foreground">معدل نجاح 78% في تمويل المشاريع المعروضة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-black">لديك أسئلة؟</h2>
          <p className="text-xl text-muted-foreground">
            فريقنا جاهز للإجابة على جميع أسئلتك حول المنصة والخدمات
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              href="/contact"
              className="px-8 md:px-12 py-4 bg-primary-container text-background font-black rounded-full hover:scale-105 transition-all"
            >
              اتصل بنا
            </Link>
            <Link
              href="/opportunities"
              className="px-8 md:px-12 py-4 border-2 border-primary-container/50 text-foreground font-black rounded-full hover:bg-primary-container/10 transition-all"
            >
              استكشف الفرص
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
