'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const STEPS = [
  {
    title: 'سجل حسابك',
    description: 'أنشئ ملفك الشخصي كصاحب فكرة أو مستثمر في أقل من دقيقتين.',
    icon: 'person_add',
    accent: 'text-primary-container',
    glass: 'glass-cyan',
    glow: 'shadow-[0_0_30px_rgba(0,255,209,0.2)]',
    details: 'تحقق فوري من الهوية والبيانات الأساسية',
  },
  {
    title: 'اعرض مشروعك',
    description: 'استخدم أدواتنا المدعومة بالذكاء الاصطناعي لتقديم عرض استثماري متكامل.',
    icon: 'rocket_launch',
    accent: 'text-secondary',
    glass: 'glass-purple',
    glow: 'shadow-[0_0_30px_rgba(104,0,236,0.25)]',
    details: 'تحليل ذكي وتقييم تلقائي للمشروع',
  },
  {
    title: 'تواصل وتفاوض',
    description: 'بيئة دردشة آمنة للتفاوض ومشاركة الملفات الحساسة بخصوصية تامة.',
    icon: 'forum',
    accent: 'text-tertiary-fixed-dim',
    glass: 'glass-gold',
    glow: 'shadow-[0_0_30px_rgba(255,186,58,0.2)]',
    details: 'رسائل مشفرة وحماية كاملة للبيانات',
  },
  {
    title: 'أغلق الصفقة',
    description: 'توثيق العقود إلكترونياً واستلام التمويل عبر بوابات دفع معتمدة.',
    icon: 'handshake',
    accent: 'text-primary-container',
    glass: 'glass-cyan',
    glow: 'shadow-[0_0_30px_rgba(0,255,209,0.2)]',
    details: 'عقود رقمية موثقة وحوالات آمنة',
  },
];

const FAQS = [
  {
    q: 'كيف نضمن جدية المستثمرين؟',
    a: 'نقوم بعملية تحقق صارمة (KYC) تشمل الأهلية المالية والتحقق من الهوية لضمان بيئة استثمارية احترافية.',
    icon: 'verified_user',
  },
  {
    q: 'ما هي نسبة المنصة من التمويل؟',
    a: 'تتقاضى المنصة رسوم نجاح رمزية (1-2% فقط) يتم توضيحها عند إبرام الاتفاقية النهائية. لا توجد رسوم مخفية.',
    icon: 'payments',
  },
  {
    q: 'هل يمكنني حماية فكرتي من السرقة؟',
    a: 'نعم، نوفر اتفاقيات عدم الإفصاح (NDA) رقمية ملزمة يتم توقيعها قبل عرض التفاصيل الدقيقة للمستثمر.',
    icon: 'lock',
  },
  {
    q: 'كم من الوقت يستغرق إغلاق الصفقة؟',
    a: 'من البحث إلى الإغلاق عادة 2-4 أسابيع. منصتنا تسرع العملية بأتمتة جميع الخطوات الإدارية.',
    icon: 'schedule',
  },
  {
    q: 'هل هناك حد أدنى للتمويل المطلوب؟',
    a: 'لا يوجد حد أدنى ثابت - من المشاريع الصغيرة بـ 50 ألف ريال إلى المشاريع الكبرى بملايين الريالات.',
    icon: 'trending_up',
  },
  {
    q: 'هل يمكنني الحصول على استشارات قانونية؟',
    a: 'نعم، نوفر شبكة من المستشارين القانونيين المعتمدين المتخصصين في العقود والاستثمار.',
    icon: 'gavel',
  },
];

const TRENDING_IDEAS = [
  {
    title: 'مشروع زراعة مائية ذكي',
    category: 'الزراعة التكنولوجية',
    amount: '$٢٥٠,٠٠٠',
    tags: ['مؤكد', 'AI'],
    progress: 65,
    investors: 12,
    glass: 'glass-cyan',
    accent: 'text-primary-container',
    bar: 'from-primary-container to-secondary',
  },
  {
    title: 'منصة دفع للعملات الرقمية',
    category: 'FinTech',
    amount: '$١.٢M',
    tags: ['مرخص', 'High-Growth'],
    progress: 85,
    investors: 28,
    glass: 'glass-purple',
    accent: 'text-secondary',
    bar: 'from-secondary to-primary-container',
  },
  {
    title: 'تطبيق توصيل بالدرون',
    category: 'Logistics',
    amount: '$٤٠٠,٠٠٠',
    tags: ['براءة اختراع'],
    progress: 45,
    investors: 8,
    glass: 'glass-gold',
    accent: 'text-tertiary-fixed-dim',
    bar: 'from-tertiary-fixed-dim to-primary-container',
  },
];

const TICKER_ITEMS = [
  { label: 'منصة SaaS للرعاية الصحية', amount: '$٨٠٠K', change: '+٢٤%', icon: 'trending_up', color: 'text-primary-container' },
  { label: 'تطبيق طاقة شمسية ذكية', amount: '$١.٥M', change: '+١٨%', icon: 'trending_up', color: 'text-primary-container' },
  { label: 'منصة تعليم AI', amount: '$٣٥٠K', change: '+٣١%', icon: 'trending_up', color: 'text-primary-container' },
  { label: 'حلول لوجستية ذكية', amount: '$٦٠٠K', change: '+١٢%', icon: 'bar_chart', color: 'text-tertiary-fixed-dim' },
  { label: 'FinTech للمدفوعات', amount: '$٢.١M', change: '+٤٥%', icon: 'trending_up', color: 'text-primary-container' },
  { label: 'منصة عقارية رقمية', amount: '$٩٠٠K', change: '+٨%', icon: 'show_chart', color: 'text-secondary' },
];

// ─────────────────────────────────────────────
// LIVE TICKER
// ─────────────────────────────────────────────
export function LiveTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full overflow-hidden border-y border-primary-container/15 dark:border-white/5 py-6 relative bg-surface-container/30 dark:bg-white/[0.01] backdrop-blur-sm">
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* HUD line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/30 to-transparent" />

      <div className="animate-ticker flex gap-16 whitespace-nowrap py-1">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-4 flex-shrink-0 px-6 py-2 glass rounded-lg border-primary-container/10 hover:border-primary-container/30 transition-all group cursor-pointer holographic-glow">
            <span className={`material-symbols-outlined text-xl ${item.color} group-hover:scale-125 transition-transform data-flicker`}>{item.icon}</span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-data text-muted-foreground uppercase tracking-widest leading-none mb-1">Market Entry</span>
              <span className="text-sm font-headline font-bold text-foreground opacity-90 group-hover:opacity-100 transition-opacity">{item.label}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-data font-black text-sm text-foreground">{item.amount}</span>
              <span className={`font-data text-[10px] font-black ${item.color} flex items-center gap-1`}>
                <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────
export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => setActiveStep(p => (p + 1) % STEPS.length), 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const step = STEPS[activeStep];

  return (
    <section className="py-40 px-6 container mx-auto relative overflow-hidden">
      {/* HUD Brackets */}
      <div className="absolute top-10 right-10 w-32 h-32 border-t-2 border-r-2 border-primary-container/20 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-32 h-32 border-b-2 border-l-2 border-primary-container/20 rounded-bl-3xl pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full animate-float-orb" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-container/5 blur-[100px] rounded-full animate-float-orb" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="relative z-10 text-right mb-24">
        <div className="inline-flex items-center gap-3 px-5 py-2 glass-cyan rounded-full font-data text-[11px] text-primary-container tracking-[0.4em] uppercase mb-8 border border-primary-container/30 shadow-neon-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
          </span>
          Protocol Architecture // v4.0
        </div>
        <h2 className="font-headline text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-none mb-6">
          مسارك نحو <span className="text-primary-container italic">الريادة</span>
        </h2>
        <p className="text-muted-foreground text-xl mt-4 max-w-2xl ml-auto font-light leading-relaxed">هيكل تنظيمي متطور يضمن تدفق الأفكار والسيولة بكفاءة عالية وفق أعلى معايير الحوكمة الرقمية.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* Steps list */}
        <div className="space-y-6" onMouseLeave={() => setAutoPlay(true)}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              onMouseEnter={() => { setActiveStep(i); setAutoPlay(false); }}
              className={`group relative p-8 border-r-4 transition-all duration-500 cursor-pointer overflow-hidden ${
                activeStep === i
                  ? `${s.glass} border-primary-container -translate-x-4 shadow-neon`
                  : 'glass border-transparent hover:border-primary-container/40 hover:-translate-x-2'
              } rounded-2xl`}
            >
              
              <div className="flex items-start gap-8 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 border border-primary-container/20 ${activeStep === i ? 'bg-primary-container/20 scale-110 shadow-neon-sm' : 'glass group-hover:bg-primary-container/10'}`}>
                  <span className={`material-symbols-outlined text-4xl ${activeStep === i ? s.accent : 'text-muted-foreground'} transition-all duration-500`}>
                    {s.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-2xl font-black font-headline transition-colors duration-500 ${activeStep === i ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/70'}`}>{s.title}</h3>
                    <span className={`text-xs font-data font-black tracking-[0.2em] ${activeStep === i ? s.accent : 'text-muted-foreground opacity-50'}`}>STEP_0{i + 1}</span>
                  </div>
                  <p className={`font-body text-lg leading-relaxed transition-colors duration-500 ${activeStep === i ? 'text-foreground/90' : 'text-muted-foreground group-hover:text-foreground/60'}`}>{s.description}</p>
                  
                  {activeStep === i && (
                    <div className="mt-4 pt-4 border-t border-primary-container/20 flex items-center gap-3 animate-fade-in">
                      <span className="material-symbols-outlined text-primary-container text-sm">verified</span>
                      <span className="text-[11px] font-data font-black text-primary-container uppercase tracking-widest">{s.details}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual panel - HUD Style */}
        <div className={`relative aspect-square rounded-[3rem] overflow-hidden group transition-all duration-1000 ${step.glow} border border-primary-container/20`}>
          <div className="absolute inset-0 bg-[#050b14]" />
          
          
          
          {/* Animated rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary-container/5 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-secondary/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-16 text-center">
            <div className={`absolute inset-0 bg-gradient-to-br ${step.accent.replace('text-', 'from-')}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
            
            <div className="relative mb-12">
              <div className={`absolute -inset-10 ${step.glass} rounded-full blur-[60px] opacity-40 animate-pulse`} />
              <span
                key={activeStep}
                className={`material-symbols-outlined text-[160px] ${step.accent} drop-shadow-[0_0_40px_rgba(0,255,209,0.4)] animate-count-up relative z-10`}
              >
                {step.icon}
              </span>
            </div>
            
            <div className="space-y-4 relative z-10">
              <h3 className="text-4xl font-black text-white font-headline animate-count-up" style={{ animationDelay: '0.1s' }}>{step.title}</h3>
              <p className="text-slate-400 font-body text-xl max-w-sm mx-auto leading-relaxed animate-count-up" style={{ animationDelay: '0.2s' }}>{step.description}</p>
            </div>
            
            {/* HUD Data Tags */}
            <div className="absolute top-8 left-8 flex flex-col items-start gap-2">
              <div className="px-3 py-1 glass-cyan rounded font-data text-[9px] text-primary-container uppercase tracking-widest border border-primary-container/30">System: Ready</div>
              <div className="px-3 py-1 glass rounded font-data text-[9px] text-slate-500 uppercase tracking-widest border border-white/10">Lat: 24.7136</div>
            </div>
            
            <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2">
              <div className="px-3 py-1 glass rounded font-data text-[9px] text-slate-500 uppercase tracking-widest border border-white/10">Lng: 46.6753</div>
              <div className={`px-3 py-1 ${step.glass} rounded font-data text-[9px] ${step.accent} uppercase tracking-widest border border-primary-container/30`}>Process_Id: 0x{activeStep + 1}F9A</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// TRENDING IDEAS
// ─────────────────────────────────────────────
export function TrendingIdeas() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-40 px-6 relative overflow-hidden bg-surface-container/20 dark:bg-black/20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary-container/5 blur-[150px] rounded-full animate-float-orb" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full animate-float-orb" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-10">
          <div className="text-right space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 glass-cyan rounded-full font-data text-[11px] text-primary-container tracking-[0.4em] uppercase border border-primary-container/30 shadow-neon-sm">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              Live Feed // Priority Targets
            </div>
            <h2 className="font-headline text-6xl md:text-8xl font-black text-foreground tracking-tighter">أهداف <span className="text-primary-container">استراتيجية.</span></h2>
            <p className="text-muted-foreground text-xl max-w-2xl font-light">أكثر المشاريع تفاعلاً وجذباً للسيولة في المنظومة الرقمية خلال الـ 24 ساعة الماضية.</p>
          </div>
          <Link href="/opportunities" className="group flex items-center gap-4 bg-primary-container/10 hover:bg-primary-container px-8 py-4 rounded-2xl border border-primary-container/30 hover:border-primary-container text-primary-container hover:text-background transition-all duration-500 font-black tracking-widest text-sm uppercase">
            استعراض المنظومة
            <span className="material-symbols-outlined text-2xl group-hover:translate-x-[-10px] transition-transform">west</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {TRENDING_IDEAS.map((idea, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredId(i)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group relative glass rounded-[2.5rem] p-10 overflow-hidden transition-all duration-700 cursor-pointer flex flex-col h-full holographic-glow border-2 ${
                hoveredId === i ? `-translate-y-4 border-primary-container/50 shadow-neon scale-[1.02]` : 'border-white/5 hover:border-white/20'
              }`}
            >
              {/* Card Corner HUD */}
              <div className={`absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 ${hoveredId === i ? 'border-primary-container opacity-100' : 'border-transparent opacity-0'} transition-all duration-700 rounded-tl-[2.5rem]`} />
              
              <div className="relative z-10 flex justify-between items-start mb-10">
                <div className="space-y-3">
                  <span className={`text-[10px] font-data font-black uppercase tracking-[0.3em] block ${idea.accent} opacity-80`}>{idea.category} // CAT_ID_{i}</span>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map(tag => (
                      <span key={tag} className={`text-[9px] px-4 py-1.5 rounded-lg font-black transition-all border ${hoveredId === i ? `${idea.accent} border-primary-container/30 bg-primary-container/10` : 'glass text-muted-foreground border-white/5'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${hoveredId === i ? 'bg-primary-container/20 scale-125' : 'glass'}`}>
                  <span className={`material-symbols-outlined text-2xl transition-all ${hoveredId === i ? idea.accent : 'text-muted-foreground'}`}>
                    verified
                  </span>
                </div>
              </div>

              <h3 className={`text-3xl font-black mb-8 font-headline relative z-10 leading-tight transition-colors duration-500 ${hoveredId === i ? idea.accent : 'text-foreground'}`}>{idea.title}</h3>

              {/* Progress HUD */}
              <div className="mb-8 relative z-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground font-data uppercase tracking-[0.2em] mb-1">Funding Progress</span>
                    <span className={`text-2xl font-black font-data transition-colors ${hoveredId === i ? idea.accent : 'text-foreground'}`}>{idea.progress}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-muted-foreground font-data uppercase tracking-[0.2em] mb-1">Backers</span>
                    <span className="text-xl font-black font-data text-foreground block">{idea.investors}</span>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 p-[2px]">
                  <div
                    className={`bg-gradient-to-r ${idea.bar} h-full transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(0,255,209,0.5)]`}
                    style={{ width: `${idea.progress}%` }}
                  >
                    <div className="w-full h-full animate-shimmer" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-white/10 relative z-10 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-data uppercase tracking-[0.3em] block">Required Liquidity</span>
                  <span className={`font-data text-4xl font-black ${hoveredId === i ? 'text-white' : 'text-foreground'} tracking-tighter`}>{idea.amount}</span>
                </div>
                <Link
                  href={`/opportunities?featured=${i}`}
                  className={`relative overflow-hidden px-8 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs ${
                    hoveredId === i
                      ? 'bg-primary-container text-background scale-110 shadow-neon'
                      : 'glass text-primary-container border border-primary-container/20 hover:border-primary-container/50'
                  }`}
                >
                  <span className="relative z-10">Access Data</span>
                  {hoveredId === i && <div className="absolute inset-0 bg-white/20 animate-shimmer" />}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FAQ SECTION
// ─────────────────────────────────────────────
export function FAQSection() {
  const [open, setOpen] = useState(-1);

  return (
    <section className="py-32 px-6 container mx-auto max-w-5xl relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/6 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-primary-container/5 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-cyan rounded-full font-data text-[10px] text-primary-container tracking-[0.3em] uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
          FAQs // Support Center
        </div>
        <h2 className="font-headline text-5xl md:text-7xl font-black text-foreground mb-6">أسئلة شائعة</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">نجيب على جميع استفسارات الرواد والمستثمرين</p>
      </div>

      <div className="space-y-4 relative z-10">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className={`glass rounded-2xl overflow-hidden transition-all duration-400 ${open === i ? 'glass-cyan shadow-[0_4px_24px_rgba(0,255,209,0.12)]' : 'hover:border-primary-container/25'}`}
          >
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full p-7 flex justify-between items-center text-right gap-6 group"
            >
              <span className="text-xl font-black text-foreground font-headline flex-1 group-hover:text-primary-container transition-colors">
                {faq.q}
              </span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`material-symbols-outlined text-2xl transition-all duration-400 ${open === i ? 'text-primary-container rotate-180' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  expand_more
                </span>
              </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${open === i ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-7 pb-7 text-foreground/80 font-body leading-relaxed border-t border-primary-container/15 pt-5 text-lg">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary-container mt-0.5 flex-shrink-0">check_circle</span>
                  <p>{faq.a}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 p-12 glass-cyan rounded-3xl text-center relative z-10 gradient-border">
        <h3 className="text-3xl font-black text-foreground font-headline mb-4">لم تجد إجابتك؟</h3>
        <p className="text-muted-foreground mb-8 text-lg">فريقنا متوفر 24/7 للإجابة على جميع استفساراتك</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-3 px-10 py-4 bg-primary-container text-background font-black text-lg rounded-2xl hover:shadow-[0_0_24px_rgba(0,255,209,0.4)] hover:scale-105 transition-all uppercase tracking-widest"
        >
          <span className="material-symbols-outlined">mail</span>
          تواصل معنا الآن
        </Link>
      </div>
    </section>
  );
}
