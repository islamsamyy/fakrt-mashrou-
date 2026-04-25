import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { HowItWorks, TrendingIdeas, FAQSection, LiveTicker } from "@/components/home/InteractiveSections";
import { ParallaxCard } from "@/components/ui/ParallaxCard";

interface Stat {
  value: string;
  label: string;
  color: string;
}

async function getStats(): Promise<Stat[]> {
  const fallbackStats: Stat[] = [
    { value: "+١٢٤", label: "فكرة ومشروع", color: "text-primary-container" },
    { value: "٤٧", label: "مستثمر معتمد", color: "text-secondary-fixed-dim" },
    { value: "٢٩", label: "صفقة مُنجزة", color: "text-tertiary-fixed-dim" },
    {
      value: "٦٨M",
      label: "ريال تمويل مُوجَّه",
      color: "text-primary-container",
    },
  ];

  try {
    const supabase = await createClient();
    const [{ count: projects }, { count: investors }, { count: investments }] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "investor"),
      supabase.from("investments").select("*", { count: "exact", head: true }).eq("status", "paid")
    ]);

    return [
      {
        value: `+${projects || 124}`,
        label: "فكرة ومشروع",
        color: "text-primary-container",
      },
      {
        value: `${investors || 47}`,
        label: "مستثمر معتمد",
        color: "text-secondary-fixed-dim",
      },
      {
        value: `${investments || 29}`,
        label: "صفقة مُنجزة",
        color: "text-tertiary-fixed-dim",
      },
      {
        value: "٦٨M",
        label: "ريال تمويل مُوجَّه",
        color: "text-primary-container",
      },
    ];
  } catch (error) {
    console.log("DB not ready, using fallback stats", error);
    return fallbackStats;
  }
}

export default async function HomePage() {
  const stats = await getStats();

  const paths = [
    {
      icon: "account_balance_wallet",
      title: "مستثمر",
      description:
        "اكتشف فرصاً استثمارية واعدة ومُتحقق منها في السوق العربي عبر أدوات تقييم ذكية.",
      color: "secondary-fixed-dim",
      bg: "bg-secondary-container/5",
    },
    {
      icon: "business_center",
      title: "صاحب مشروع",
      description:
        "مشروع قائم يحتاج توسيع، شريك، أو استثمار إضافي لرفع كفاءة العمليات التشغيلية.",
      color: "primary-container",
      bg: "bg-primary-container/5",
      featured: true,
    },
    {
      icon: "emoji_objects",
      title: "صاحب فكرة",
      description:
        "لديك فكرة متميزة وتبحث عن تمويل أو شريك استراتيجي لتحويل المخطط إلى واقع ملموس.",
      color: "tertiary-fixed-dim",
      bg: "bg-tertiary-fixed-dim/5",
    },
  ];

  const features = [
    {
      icon: "bolt",
      title: "رحلة سلسة وسريعة",
      description:
        "نقلص الفجوة الزمنية بين الفكرة والتنفيذ عبر إجراءات رقمية مؤتمتة بالكامل.",
    },
    {
      icon: "verified_user",
      title: "بيئة آمنة وموثوقة",
      description:
        "نظام تحقق متقدم من الهوية والأهلية المالية لضمان جدية كافة الأطراف.",
    },
    {
      icon: "smart_toy",
      title: "ذكاء اصطناعي متكامل",
      description:
        "محرك تحليل ذكي يربط الأفكار بالمستثمرين الأكثر ملاءمة بناءً على التاريخ الاستثمارية.",
    },
    {
      icon: "language",
      title: "ثنائية اللغة",
      description:
        "دعم كامل للغتين العربية والإنجليزية لفتح آفاق الاستثمار الإقليمي والدولي.",
    },
    {
      icon: "monitoring",
      title: "تحليلات لحظية",
      description:
        "لوحة تحكم شاملة تعرض أداء استثماراتك وتفاعل السوق مع فكرتك لحظة بلحظة.",
    },
    {
      icon: "payments",
      title: "دفع آمن ومنظم",
      description:
        "بوابة دفع معتمدة تضمن شفافية التحويلات المالية وتوثيق العقود إلكترونياً.",
    },
  ];

  return (
    <div
      className="bg-background text-foreground font-body min-h-screen relative overflow-x-hidden text-right"
      dir="rtl"
      suppressHydrationWarning
    >
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-secondary-container/5 dark:bg-secondary-container/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary-container/5 dark:bg-primary-container/10 blur-[150px] -z-10 rounded-full"></div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-6 text-center relative overflow-hidden pt-32 pb-20">
          {/* Cyber Grid Perspective Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-full cyber-grid-perspective -z-10"></div>
          
          {/* Futuristic Status Badge */}
          <div className="mb-12 inline-flex items-center gap-3 px-6 py-2 border border-primary-container/40 bg-primary-container/10 dark:bg-black/40 backdrop-blur-md rounded-full text-[11px] font-data tracking-[0.3em] uppercase text-primary-container animate-fade-in shadow-[0_0_15px_rgba(0,255,209,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
            </span>
            Platform Status: Operational // AI Powered
          </div>


          <div className="py-4">
            <h1 className="font-headline text-6xl md:text-9xl font-semibold leading-[1.1] mb-10 max-w-7xl tracking-[-0.04em] text-foreground relative">
              اصنع <span className="text-primary-container font-light italic neon-flicker">مستقبلك</span> الاستثماري
              <br />
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 dark:from-white dark:via-white/80 dark:to-white/60 bg-clip-text text-transparent">في قلب رؤية 2030</span>
            </h1>
          </div>

          <p className="text-muted-foreground text-lg md:text-2xl max-w-4xl mb-16 font-body leading-relaxed opacity-80 dark:opacity-70 font-light">
            بيئة سيادية آمنة تجمع بين طموح الرواد وذكاء المستثمرين. نوظف تقنيات الذكاء الاصطناعي لاختيار الفرص الأكثر نمواً وتأثيراً في الاقتصاد الجديد.
          </p>

          <div className="flex flex-col md:flex-row gap-8 mb-24 relative z-20">
            <Link
              href="/opportunities"
              className="group relative px-14 py-6 bg-gradient-to-r from-primary-container to-accent text-foreground font-semibold text-xl rounded-full transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-[0_8px_24px_rgba(0,255,209,0.3)] holographic-reflection clip-button"
            >
              <span className="relative z-10 flex items-center gap-3 transition-colors">
                اكتشف الفرص الحالية
                <span className="material-symbols-outlined font-black text-2xl">arrow_outward</span>
              </span>
            </Link>
            <Link
              href="/add-idea"
              className="group relative px-14 py-6 border-2 border-primary-container/50 bg-primary-container/10 dark:bg-white/5 backdrop-blur-sm text-foreground dark:text-white font-semibold text-xl rounded-full transition-all hover:border-primary-container hover:bg-primary-container/20 active:scale-95 holographic-reflection"
            >
              <span className="flex items-center gap-3">
                اطرح مشروعك الآن
                <span className="material-symbols-outlined font-black text-2xl text-primary-container">add_circle</span>
              </span>
            </Link>
          </div>

          {/* Interactive Tech Bar with Animation */}
          <div className="w-full max-w-7xl border-y border-primary-container/20 dark:border-white/5 py-10 group">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
              {[
                { label: "AI Verification", val: "Active", icon: "smart_toy" },
                { label: "Legal Framework", val: "KSA Standard", icon: "gavel" },
                { label: "Data Encryption", val: "AES-256", icon: "lock" },
                { label: "Matchmaking", val: "Real-time", icon: "favorite_border" },
                { label: "Support", val: "24/7 Elite", icon: "support_agent" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-3 items-center md:items-start p-4 rounded-lg hover:bg-primary-container/5 dark:hover:bg-white/5 transition-all group cursor-pointer">
                  <span className="material-symbols-outlined text-3xl text-primary-container opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    {item.icon}
                  </span>
                  <span className="text-sm font-data tracking-widest uppercase text-primary-container font-bold">{item.label}</span>
                  <span className="text-base font-black text-foreground group-hover:text-primary-container transition-colors tracking-wide">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Section */}
        <section className="py-24 border-t border-primary-container/10 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <div className="flex items-center justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary-container/10 blur-3xl rounded-full scale-150" />
                  <img src="/LOGO.svg" alt="فكرة مشروع" className="relative w-48 h-48 object-contain drop-shadow-[0_0_40px_rgba(0,255,209,0.4)] group-hover:drop-shadow-[0_0_60px_rgba(0,255,209,0.6)] transition-all duration-700 group-hover:scale-105" />
                </div>
              </div>
              <div className="flex flex-col gap-6 text-right">
                <div className="inline-flex items-center gap-3 px-4 py-2 border border-primary-container/30 bg-primary-container/10 rounded-full font-data text-[11px] text-primary-container tracking-[0.3em] uppercase w-fit self-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                  هويتنا البصرية
                </div>
                <h2 className="font-headline text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
                  فكرة <span className="text-primary-container italic neon-flicker">مشروع</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed font-light">
                  شعار يجمع بين الأصالة العربية والتصميم العصري — معبّراً عن رؤيتنا في ربط الأفكار بالاستثمار وبناء مستقبل اقتصادي مستدام.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground font-body">
                  {['منصة سيادية عربية 100%','تقنيات الذكاء الاصطناعي لاختيار الفرص','بيئة آمنة للمستثمرين والرواد','متوافقة مع رؤية 2030'].map((item) => (
                    <li key={item} className="flex items-center gap-3 justify-end">
                      <span>{item}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container flex-shrink-0" />
                    </li>
                  ))}
                </ul>
                <div className="flex gap-4 justify-end pt-2">
                  <Link href="/register" className="px-8 py-4 bg-primary-container text-background font-black rounded-full hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,255,209,0.3)]">ابدأ الآن</Link>
                  <Link href="/opportunities" className="px-8 py-4 border border-primary-container/40 text-foreground font-black rounded-full hover:bg-primary-container/10 transition-all">استعرض الفرص</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Market Ticker */}
        <LiveTicker />

        {/* Live Performance Stats - Enhanced */}
        <section className="w-full border-b border-primary-container/15 dark:border-white/5 py-20 bg-surface-container/50 dark:bg-white/[0.01] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary-container/3 dark:bg-secondary-container/5 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-tertiary-fixed-dim/2 dark:bg-tertiary-fixed-dim/3 blur-[100px] rounded-full"></div>
          </div>
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {stats.map((stat, i) => (
              <ParallaxCard key={i} className="h-full">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-surface-container-high dark:from-white/[0.05] to-surface-container-highest dark:to-white/[0.02] border border-primary-container/20 dark:border-white/10 hover:border-primary-container/40 dark:hover:border-white/30 transition-all hover:bg-surface-container-highest dark:hover:bg-white/[0.08] group h-full">
                  <div className="flex flex-col items-start gap-4">
                    <div className="relative">
                      <span className={`font-data text-5xl md:text-6xl ${stat.color} font-black tracking-tighter group-hover:scale-115 transition-transform duration-500 origin-left`}>
                        {stat.value}
                      </span>
                      <div className={`absolute -inset-4 ${stat.color} opacity-10 dark:opacity-20 blur-xl group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity -z-10 rounded-full`}></div>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium font-headline tracking-wide text-sm block opacity-80 dark:opacity-70 group-hover:opacity-100 transition-opacity">
                        {stat.label}
                      </span>
                      <span className="text-xs text-muted-foreground font-data uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Updated Live
                      </span>
                    </div>
                  </div>
                </div>
              </ParallaxCard>
            ))}
          </div>
        </section>

        {/* Professional Path Gate - Enhanced Role Selection Terminal */}
        <section className="py-40 px-6 container mx-auto relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/3 -left-20 w-80 h-80 bg-primary-container/5 dark:bg-primary-container/5 blur-[150px] rounded-full"></div>
            <div className="absolute inset-0 noise-bg opacity-[0.03] pointer-events-none"></div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8 relative z-10">
            <div className="max-w-2xl text-right">
              <div className="inline-block px-4 py-1 border border-primary-container/40 bg-primary-container/15 dark:bg-primary-container/5 rounded-lg font-data text-[10px] text-primary-container tracking-[0.3em] uppercase mb-6">
                IDENTITY_UPLINK // SELECT_ROLE
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-semibold text-foreground dark:text-white tracking-tight mb-6">
                بوابتك نحو <span className="text-primary-container text-glitch after:content-['التأثير'] after:absolute after:inset-0 after:text-secondary/30 after:-translate-x-[2px] after:animate-glitch-1 before:content-['التأثير'] before:absolute before:inset-0 before:text-primary-container/30 before:translate-x-[2px] before:animate-glitch-2 relative">التأثير.</span>
              </h2>
              <p className="text-xl text-muted-foreground font-light border-r-2 border-primary-container/20 pr-6">اختر هويتك الاستثمارية في الشبكة لنرشدك إلى المسار الأكثر كفاءة وموثوقية.</p>
            </div>
            <div className="flex flex-col items-end gap-2 font-data text-primary-container text-[10px] tracking-[0.4em] uppercase opacity-50">
              <span>System_Core: V3.4.2</span>
              <span>Identity_Sync: STABLE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {paths.map((path, i) => (
              <ParallaxCard key={i} className="h-full">
                <Link
                  href={path.featured ? "/add-idea" : i === 0 ? "/opportunities" : "/"}
                  className={`group relative overflow-hidden rounded-[2.5rem] transition-all duration-700 h-full flex flex-col border ${
                    path.featured 
                      ? "border-primary-container/40 shadow-[0_0_50px_rgba(0,255,209,0.15)]" 
                      : "border-primary-container/10"
                  }`}
                >
                  <div className={`h-full p-12 backdrop-blur-3xl flex flex-col transition-all duration-700 h-full relative ${
                    path.featured
                      ? "bg-gradient-to-br from-primary-container/15 to-transparent"
                      : "bg-surface-container-low/20"
                  }`}>
                    {/* Terminal Overlay */}
                    
                    <div className="relative z-10 flex flex-col h-full text-right">
                      {/* Role Header */}
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] font-black text-primary-container/40 uppercase tracking-widest">Active_Nodes</span>
                          <span className="text-lg font-black tabular-nums">{i === 0 ? '1,204' : i === 1 ? '4,832' : '12,401'}</span>
                        </div>
                        <div className={`w-20 h-20 rounded-2xl ${path.bg} flex items-center justify-center border border-primary-container/20 group-hover:scale-110 group-hover:shadow-neon-sm transition-all duration-500 relative`}>
                          <span className={`material-symbols-outlined text-4xl text-${path.color} group-hover:animate-pulse`}>
                            {path.icon}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-3xl font-black mb-6 text-foreground font-headline group-hover:text-primary-container transition-colors duration-500">
                        {path.title}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed font-body text-lg opacity-85 mb-12 group-hover:text-foreground transition-colors flex-grow">
                        {path.description}
                      </p>

                      {/* Status Bar */}
                      <div className="space-y-3 mb-10">
                        <div className="flex justify-between text-[8px] font-black tracking-widest uppercase">
                          <span className="text-primary-container">Sync_Status</span>
                          <span className="opacity-40">Operational</span>
                        </div>
                        <div className="h-1 bg-background/50 rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full transition-all duration-1000 group-hover:w-full bg-${path.color}/40`} style={{ width: i === 0 ? '94%' : i === 1 ? '98%' : '92%' }}></div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-8 border-t border-primary-container/10 group-hover:border-primary-container/30 transition-colors">
                        <div className="flex justify-between items-center group-hover:translate-x-[-10px] transition-transform duration-500">
                          <span className="material-symbols-outlined text-primary-container -rotate-180 font-black">arrow_forward</span>
                          <span className="text-[10px] font-black text-primary-container tracking-[0.3em] uppercase">INITIATE_PATH</span>
                        </div>
                        {path.featured && (
                          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 glass-strong rounded-full border border-primary-container/30">
                            <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-ping"></span>
                            <span className="text-[8px] font-black text-primary-container uppercase tracking-widest">Priority_Node</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </ParallaxCard>
            ))}
          </div>
        </section>

        {/* Core Ecosystem Features - Enhanced */}
        <section className="py-40 px-6 bg-surface-container/30 dark:bg-white/[0.01] relative overflow-hidden border-y border-primary-container/15 dark:border-white/5">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary-container/3 dark:bg-secondary-container/5 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary-container/2 dark:bg-primary-container/3 blur-[150px] rounded-full opacity-20 dark:opacity-30"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
              <div className="max-w-2xl text-right">
                <div className="inline-block px-4 py-1 border border-primary-container/40 bg-primary-container/15 dark:bg-primary-container/5 rounded-lg font-data text-[10px] text-primary-container tracking-[0.3em] uppercase mb-6">
                  Capabilities // System Core
                </div>
                <h2 className="font-headline text-5xl md:text-7xl font-semibold text-foreground dark:text-white tracking-tight mb-6">
                  التميز <span className="opacity-60 dark:opacity-40 italic neon-flicker">التقني.</span>
                </h2>
                <p className="text-xl text-muted-foreground font-light">بنية تحتية متطورة تضمن كفاءة الربط بين الموارد والطموح والفرص الحقيقية.</p>
              </div>
              <div className="font-data text-primary-container text-xs tracking-[0.4em] uppercase opacity-50">System Core // v3.0</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feat, i) => (
                <ParallaxCard key={i} className="h-full">
                  <div className="p-12 rounded-2xl bg-gradient-to-br from-surface-container dark:from-white/[0.05] to-surface-container-high dark:to-white/[0.02] border border-primary-container/20 dark:border-white/10 h-full flex flex-col text-right group group-hover:border-primary-container/40 dark:group-hover:border-primary-container/30 group-hover:bg-surface-container-highest dark:group-hover:bg-white/[0.08] transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,255,209,0.1)] relative overflow-hidden">
                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary-container opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-br-3xl"></div>

                    {/* Icon */}
                    <div className="mb-8 relative z-10">
                      <span className={`material-symbols-outlined text-7xl font-light text-primary-container opacity-90 group-hover:opacity-100 group-hover:scale-125 group-hover:drop-shadow-[0_0_20px_rgba(0,255,209,0.4)] transition-all duration-500`}>
                        {feat.icon}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-3xl font-black text-foreground dark:text-white mb-6 font-headline tracking-tight group-hover:text-primary-container transition-colors duration-500 relative z-10">
                      {feat.title}
                    </h4>

                    {/* Description */}
                    <p className="text-muted-foreground font-body leading-relaxed text-lg opacity-85 dark:opacity-80 group-hover:text-foreground dark:group-hover:text-slate-300 transition-all duration-500 relative z-10 flex-grow">
                      {feat.description}
                    </p>

                    {/* Bottom CTA - Hidden by default */}
                    <div className="mt-8 pt-8 border-t border-primary-container/20 dark:border-white/5 group-hover:border-primary-container/40 dark:group-hover:border-primary-container/30 transition-colors opacity-0 group-hover:opacity-100 duration-500 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-data text-primary-container uppercase tracking-widest animate-fade-in">اكتشف المزيد</span>
                        <span className="material-symbols-outlined text-primary-container group-hover:translate-x-2 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </ParallaxCard>
              ))}
            </div>

            {/* Extra Feature Highlight */}
            <div className="mt-20 p-12 bg-gradient-to-r from-primary-container/10 dark:from-primary-container/10 via-transparent to-secondary-container/10 dark:to-secondary-container/10 border border-primary-container/30 dark:border-primary-container/20 rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:border-primary-container/50 dark:hover:border-primary-container/40 hover:shadow-[0_0_40px_rgba(0,255,209,0.2)] dark:hover:shadow-[0_0_40px_rgba(0,255,209,0.15)]">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/20 dark:bg-primary-container/20 blur-[80px] rounded-full"></div>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="text-right flex-1">
                  <h3 className="text-3xl font-black text-foreground dark:text-white font-headline mb-3 group-hover:text-primary-container transition-colors">
                    خصوصية من المستوى العسكري
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    تشفير من الطراز العالمي (AES-256) لجميع البيانات والمعاملات مع امتثال كامل للمعايير الدولية والسعودية.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-7xl text-primary-container opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                    shield_lock
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Interactive Steps */}
        <HowItWorks />

        {/* Strategic Saudi Hub Section - Enhanced */}
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/5 blur-[140px] rounded-full"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10 text-right">
                <div className="inline-block px-4 py-1 border border-primary-container/40 bg-primary-container/15 dark:bg-primary-container/5 rounded-lg font-data text-[10px] text-primary-container tracking-[0.3em] uppercase">
                  Future Vision // 2030 Strategy
                </div>
                <h2 className="text-5xl md:text-7xl font-headline font-semibold leading-tight text-foreground">
                  نحن لا نبني منصة،
                  <br />
                  <span className="text-primary-container animate-pulse neon-flicker">بل نصمم اقتصاد الغد.</span>
                </h2>
                <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl ml-auto hover:text-foreground transition-colors">
                  تلتزم IDEA BUSINESS بتمكين العقول السعودية وربطها بالموارد التي تحتاجها للنمو. من قلب الرياض، نفتح آفاقاً جديدة للاستثمار الجريء والنمو المستدام وفق معايير عالمية مرموقة.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="group p-6 bg-surface-container dark:bg-white/5 border border-primary-container/20 dark:border-white/10 rounded-xl hover:border-primary-container/40 hover:bg-primary-container/10 transition-all cursor-default">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-primary-container text-2xl group-hover:scale-125 transition-transform">
                        public
                      </span>
                      <span className="text-4xl font-data text-foreground font-bold group-hover:text-primary-container transition-colors">100%</span>
                    </div>
                    <span className="text-muted-foreground text-sm font-headline tracking-wider uppercase opacity-80 block">Saudi DNA</span>
                  </div>

                  <div className="group p-6 bg-surface-container dark:bg-white/5 border border-secondary/20 dark:border-white/10 rounded-xl hover:border-secondary/40 hover:bg-secondary/10 transition-all cursor-default">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-125 transition-transform">
                        groups
                      </span>
                      <span className="text-4xl font-data text-foreground font-bold group-hover:text-secondary transition-colors">Elite</span>
                    </div>
                    <span className="text-muted-foreground text-sm font-headline tracking-wider uppercase opacity-80 block">Network</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary-container/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem]"></div>
                <div className="relative p-12 border border-primary-container/20 dark:border-white/10 group-hover:border-primary-container/40 dark:group-hover:border-primary-container/30 rounded-[3rem] bg-gradient-to-br from-surface-container-high dark:from-black/60 to-surface-container dark:to-black/40 backdrop-blur-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,255,209,0.1)] hologram-effect">
                  {/* Animated Corner */}
                  <div className="absolute top-0 right-0 p-8">
                    <div className="relative">
                      <span className="text-[40px] font-data text-primary-container/20 leading-none group-hover:text-primary-container/40 transition-colors">01</span>
                    </div>
                  </div>

                  <div className="space-y-8 text-right">
                    {/* Live Badge */}
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-data text-[10px] text-primary-container tracking-widest uppercase font-black">System Message</span>
                      <div className="h-2 w-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_var(--color-primary-container)]"></div>
                    </div>

                    {/* Quote */}
                    <p className="text-3xl font-light text-foreground leading-snug italic font-headline hover:text-primary-container transition-colors">
                      "هدفنا هو جعل المملكة العربية السعودية الوجهة الأولى عالمياً للاستثمار في الأفكار الريادية والذكاء الاصطناعي."
                    </p>

                    {/* Authority Badge */}
                    <div className="flex items-center justify-end gap-6 pt-6 border-t border-primary-container/15 dark:border-white/10">
                      <div className="text-right">
                        <div className="text-foreground text-lg font-bold tracking-wide">القيادة الاستراتيجية</div>
                        <div className="text-muted-foreground text-xs font-data uppercase tracking-[0.2em] mt-1">Vision 2030 Alignment</div>
                      </div>
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-container/20 to-primary-container/5 border border-primary-container/30 flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,209,0.3)] transition-all">
                        <span className="material-symbols-outlined text-primary-container text-3xl font-light">verified_user</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Hub Final Call - Enhanced */}
        <section className="py-48 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/5 blur-[150px] rounded-full"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/5 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary-fixed-dim/3 blur-[100px] rounded-full opacity-50"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="max-w-5xl mx-auto space-y-16">
              <div className="inline-block px-6 py-2 border border-primary-container/30 bg-primary-container/10 rounded-full font-data text-[11px] text-primary-container tracking-[0.5em] uppercase font-black animate-fade-in shadow-[0_0_20px_rgba(0,255,209,0.2)]">
                Global Network // Saudi Innovation Hub
              </div>

              <div className="space-y-6">
                <h2 className="text-6xl md:text-8xl font-headline font-black text-foreground leading-tight tracking-tight">
                  العالم ينتظر
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container via-primary-container to-secondary animate-pulse neon-flicker">
                    فكرتك القادمة.
                  </span>
                </h2>
                <p className="text-2xl text-muted-foreground font-light leading-relaxed opacity-90 max-w-3xl mx-auto">
                  انضم إلى أكبر تجمع استثماري في الشرق الأوسط وابدأ رحلة التحول الرقمي والمالي اليوم. مع آلاف الرواد والمستثمرين المنتظرين لأفكارك.
                </p>
              </div>

              {/* Dual CTA */}
              <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href="/opportunities"
                  className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-primary-container to-accent text-foreground font-black text-xl rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_8px_30px_rgba(0,255,209,0.3)] overflow-hidden holographic-reflection clip-button"
                >
                  <span className="relative flex items-center gap-3">
                    <span className="material-symbols-outlined font-black text-2xl group-hover:scale-125 transition-transform">search</span>
                    اكتشف الفرص
                  </span>
                </Link>

                <Link
                  href="/add-idea"
                  className="group relative inline-flex items-center gap-4 px-12 py-6 border-2 border-primary-container/50 bg-primary-container/10 dark:bg-transparent text-foreground dark:text-white font-black text-xl rounded-full hover:bg-primary-container/20 dark:hover:bg-white/10 hover:border-primary-container active:scale-95 transition-all holographic-reflection"
                >
                  <span className="relative flex items-center gap-3">
                    <span className="material-symbols-outlined font-black text-2xl text-primary-container group-hover:rotate-180 transition-transform">add_circle</span>
                    اطرح فكرتك
                  </span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="p-6 border border-primary-container/20 dark:border-white/10 rounded-xl bg-surface-container dark:bg-white/[0.02] hover:bg-primary-container/10 dark:hover:bg-white/[0.05] hover:border-primary-container/40 dark:hover:border-primary-container/30 transition-all group cursor-default hologram-effect">
                  <span className="material-symbols-outlined text-3xl text-primary-container mb-3 block group-hover:scale-110 transition-transform">shield_verified</span>
                  <h4 className="text-foreground font-black mb-2 text-lg">موثوق ومأمون</h4>
                  <p className="text-muted-foreground text-sm">معايير أمان عالمية</p>
                </div>
                <div className="p-6 border border-secondary/20 dark:border-white/10 rounded-xl bg-surface-container dark:bg-white/[0.02] hover:bg-secondary/10 dark:hover:bg-white/[0.05] hover:border-secondary/40 transition-all group cursor-default hologram-effect">
                  <span className="material-symbols-outlined text-3xl text-secondary mb-3 block group-hover:scale-110 transition-transform">speed</span>
                  <h4 className="text-foreground font-black mb-2 text-lg">سريع وفعال</h4>
                  <p className="text-muted-foreground text-sm">من الفكرة للصفقة في أسابيع</p>
                </div>
                <div className="p-6 border border-primary-container/20 dark:border-white/10 rounded-xl bg-surface-container dark:bg-white/[0.02] hover:bg-primary-container/10 dark:hover:bg-white/[0.05] hover:border-primary-container/40 transition-all group cursor-default hologram-effect">
                  <span className="material-symbols-outlined text-3xl text-primary-container mb-3 block group-hover:scale-110 transition-transform">support_agent</span>
                  <h4 className="text-foreground font-black mb-2 text-lg">دعم متكامل</h4>
                  <p className="text-muted-foreground text-sm">فريق متخصص يساعدك دائماً</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t border-white/5">
          <TrendingIdeas />
        </section>

        <section className="py-20 border-t border-white/5">
          <FAQSection />
        </section>

      </main>

      <footer className="w-full py-20 px-12 grid grid-cols-1 md:grid-cols-3 gap-12 bg-[#050b14] border-t border-primary-container/10 relative z-10">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 border border-primary-container/30 rounded-xl overflow-hidden bg-primary-container/5 group-hover:border-primary-container transition-colors">
              <Image src="/LOGO.svg" alt="فكرة مشروع" width={40} height={40} className="object-contain p-1" />
            </div>
            <span className="font-headline text-primary-container font-black text-2xl tracking-tight neon-flicker">
              فكرة مشروع
            </span>
          </Link>
          <p className="font-body text-base text-muted-foreground max-w-xs leading-relaxed">
            المنصة الرائدة في الشرق الأوسط لربط الأفكار الريادية برؤوس الأموال الذكية باستخدام تقنيات الذكاء الاصطناعي.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4 text-right">
            <h5 className="text-primary-container font-black mb-2 uppercase tracking-widest text-sm">الروابط</h5>
            {[
              { text: "الشروط والأحكام", href: "/terms" },
              { text: "سياسة الخصوصية", href: "/privacy" },
              { text: "اتصل بنا", href: "/contact" },
              { text: "خارطة الطريق", href: "/roadmap" },
            ].map((link, i) => (
              <Link key={i} href={link.href} className="text-muted-foreground hover:text-primary-container transition-colors font-body text-base">
                {link.text}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-4 text-right">
            <h5 className="text-primary-container font-black mb-2 uppercase tracking-widest text-sm">مجالاتنا</h5>
            {["التكنولوجيا المالية", "الطاقة المتجددة", "الذكاء الاصطناعي", "الصحة الرقمية"].map((link, i) => (
              <Link key={i} href="#" className="text-muted-foreground hover:text-primary-container transition-colors font-body text-base">
                {link}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-8 items-end">
          <div className="flex gap-4">
            {["public", "alternate_email", "share"].map((icon, i) => (
              <a key={i} href="#" className="w-14 h-14 border border-foreground/10 flex items-center justify-center hover:bg-primary-container/20 hover:text-primary-container transition-all text-foreground/60">
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </a>
            ))}
          </div>
          <p className="font-data text-sm text-muted-foreground uppercase tracking-[0.2em]">
            © 2024 فكرة مشروع. السيادة المالية الرقمية.
          </p>
        </div>
      </footer>
    </div>
  );
}
