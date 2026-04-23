'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';

const testimonials = [
  {
    name: 'أحمد السعيد',
    role: 'مؤسس تيكنولوجي',
    text: 'وجدت المستثمر المناسب في غضون 3 أسابيع. البنية التحتية للمنصة احترافية وآمنة تماماً.',
    image: '🚀',
  },
  {
    name: 'فاطمة الأحمد',
    role: 'مستثمرة ملاك',
    text: 'الفرص المقترحة تطابق محفظتي بدقة. الذكاء الاصطناعي هنا يعمل بفعالية حقيقية.',
    image: '💡',
  },
  {
    name: 'محمد الفايز',
    role: 'رائد أعمال',
    text: 'من الفكرة إلى التمويل في وقت قياسي. الدعم المحترف جعل العملية سلسة جداً.',
    image: '⭐',
  },
];

const stats = [
  { number: '124+', label: 'مشروع مُمول', color: 'from-primary-container' },
  { number: '47', label: 'مستثمر معتمد', color: 'from-secondary-container' },
  { number: '68M', label: 'ريال مستثمَر', color: 'from-accent' },
  { number: '29', label: 'صفقة مُنجزة', color: 'from-tertiary-fixed' },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden" dir="rtl">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container/10 blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 border border-primary-container/40 bg-primary-container/10 backdrop-blur-sm rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
            </span>
            <span className="font-data text-xs tracking-widest uppercase text-primary-container">
              منصة حية • AI Powered
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]">
            من الفكرة إلى <span className="text-primary-container">المليون</span>
            <br />
            <span className="text-4xl md:text-5xl font-light opacity-80">في رحلة استثمارية محترفة</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            المنصة الأولى في الشرق الأوسط التي تربط الأفكار الريادية برؤوس الأموال الذكية باستخدام الذكاء الاصطناعي المتقدم والتحقق البشري الدقيق.
          </p>

          {/* Dual CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
            <Link
              href="/opportunities"
              className="group px-8 md:px-12 py-4 bg-gradient-to-r from-primary-container to-accent text-background font-black text-lg rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_8px_24px_rgba(0,255,209,0.3)]"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="material-symbols-outlined">search</span>
                اكتشف الفرص
              </span>
            </Link>
            <Link
              href="/add-idea"
              className="group px-8 md:px-12 py-4 border-2 border-primary-container/50 bg-primary-container/10 text-foreground font-black text-lg rounded-full hover:bg-primary-container/20 active:scale-95 transition-all"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="material-symbols-outlined">add</span>
                اطرح فكرتك
              </span>
            </Link>
          </div>

          {/* Email Signup */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Email signup:', email);
            }}
            className="mt-16 flex gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-3 bg-surface-container border border-primary-container/30 rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary-container transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary-container text-background font-black rounded-full hover:bg-primary-container/90 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">الأرقام تتحدث</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-8 bg-gradient-to-br from-surface-container-high to-surface-container border border-primary-container/20 rounded-2xl hover:border-primary-container/40 transition-all group cursor-default"
              >
                <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-black text-5xl mb-4 group-hover:scale-110 transition-transform`}>
                  {stat.number}
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">المميزات الأساسية</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              كل الأدوات التي تحتاجها للنجاح في رحلتك الاستثمارية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'smart_toy',
                title: 'ذكاء اصطناعي ذكي',
                description: 'نظام توصيات متقدم يربط أفكارك بالمستثمرين الأنسب',
              },
              {
                icon: 'verified_user',
                title: 'بيئة آمنة',
                description: 'تحقق متقدم من الهوية والأهلية المالية',
              },
              {
                icon: 'payments',
                title: 'دفع آمن',
                description: 'بوابة دفع موثوقة مع توثيق إلكتروني للعقود',
              },
              {
                icon: 'speed',
                title: 'سرعة التنفيذ',
                description: 'من الفكرة للتمويل في أسابيع، لا أشهر',
              },
              {
                icon: 'support_agent',
                title: 'دعم محترف',
                description: 'فريق متخصص يساعدك طوال رحلتك',
              },
              {
                icon: 'language',
                title: 'ثنائية اللغة',
                description: 'دعم كامل للعربية والإنجليزية',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 bg-surface-container border border-primary-container/20 rounded-2xl hover:border-primary-container/40 hover:bg-surface-container-high transition-all group"
              >
                <span className="material-symbols-outlined text-5xl text-primary-container mb-6 block group-hover:scale-125 transition-transform">
                  {feature.icon}
                </span>
                <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 bg-surface-container/50 border-y border-primary-container/15">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20">كيف يعمل النظام</h2>

          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'اختر هويتك',
                description: 'حدد ما إذا كنت مؤسس أم مستثمر',
              },
              {
                step: '02',
                title: 'أكمل التحقق',
                description: 'عملية KYC سريعة وآمنة',
              },
              {
                step: '03',
                title: 'اطرح فكرتك أو استثمر',
                description: 'قم بإنشاء مشروعك أو استثمر في فرصة',
              },
              {
                step: '04',
                title: 'تواصل وأغلق الصفقة',
                description: 'نظام الذكاء الاصطناعي يجمعك بالشريك المناسب',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 items-start">
                <div className="text-6xl font-black text-primary-container/30 min-w-[100px]">
                  {item.step}
                </div>
                <div className="flex-1 pt-4">
                  <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20">أصوات المستخدمين</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-8 bg-surface-container border border-primary-container/20 rounded-2xl hover:border-primary-container/40 hover:shadow-[0_0_30px_rgba(0,255,209,0.1)] transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-black text-lg">{testimonial.name}</div>
                    <div className="text-sm text-primary-container">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-primary-container text-xl">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-gradient-to-r from-primary-container/20 to-secondary-container/20 border-y border-primary-container/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-black">
            هل أنت جاهز <span className="text-primary-container">للبدء؟</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            انضم لآلاف الرواد والمستثمرين الذين وجدوا الفرصة الذهبية عبر IDEA BUSINESS
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link
              href="/register"
              className="px-8 md:px-12 py-4 bg-primary-container text-background font-black text-lg rounded-full hover:scale-105 active:scale-95 transition-all"
            >
              إنشاء حساب جديد
            </Link>
            <Link
              href="/opportunities"
              className="px-8 md:px-12 py-4 border-2 border-primary-container/50 text-foreground font-black text-lg rounded-full hover:bg-primary-container/10 transition-all"
            >
              استكشف الفرص
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-surface-container/50 border-t border-primary-container/15">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-black text-primary-container mb-6">IDEA BUSINESS</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              المنصة السيادية للاستثمار والتمويل في الشرق الأوسط
            </p>
          </div>

          <div>
            <h4 className="font-black mb-4 uppercase text-sm tracking-widest">الروابط السريعة</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/opportunities" className="hover:text-primary-container transition-colors">
                  الفرص
                </Link>
              </li>
              <li>
                <Link href="/add-idea" className="hover:text-primary-container transition-colors">
                  اطرح فكرتك
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-container transition-colors">
                  عن المنصة
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-4 uppercase text-sm tracking-widest">سياساتنا</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary-container transition-colors">
                  الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-container transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-container transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-4 uppercase text-sm tracking-widest">تابعنا</h4>
            <div className="flex gap-4">
              {['public', 'alternate_email', 'share'].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 border border-primary-container/30 rounded-lg flex items-center justify-center hover:bg-primary-container/20 transition-colors"
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-container/15 text-center text-sm text-muted-foreground">
          <p>© 2024 IDEA BUSINESS. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
