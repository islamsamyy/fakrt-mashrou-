import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { HowItWorks, TrendingIdeas, FAQSection } from "@/components/home/InteractiveSections";

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
    const [{ count: projects }, { count: investors }] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true })
    ]);
    const { count: deals } = await supabase
      .from("deals")
      .select("*", { count: "exact", head: true });

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
        value: `${deals || 29}`,
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
        "لديك فكرة متميزة وتبحث عن تمويل أو شريك استراتيجي لت حويل المخطط إلى واقع ملموس.",
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
      className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right"
      dir="rtl"
    >
      <div className="fixed inset-0 hex-grid pointer-events-none z-0 opacity-10"></div>
      <div className="fixed inset-0 scanline pointer-events-none z-0 opacity-10"></div>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-secondary-container/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-primary-container/10 blur-[150px] -z-10 rounded-full"></div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-6 text-center relative overflow-hidden pt-24">
          <div className="mb-8 inline-flex items-center gap-3 px-4 py-1.5 border border-[#00ffd1]/30 bg-[#00ffd1]/5 rounded-full text-[10px] font-bold tracking-widest text-[#00ffd1] shadow-[0_0_15px_rgba(0,255,209,0.1)]">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            المنصة العربية الأذكى 🚀 POWERED BY AI
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-black leading-tight mb-8 max-w-6xl tracking-tighter">
            حوّل فكرتك <span className="text-[#00ffd1]">إلى واقع</span>
            <br />
            <span className="flex items-center justify-center gap-4 flex-wrap">
              أو اكتشف 
              <span className="bg-gradient-to-r from-[#ffbf00] via-[#ff6b6b] to-[#7b2cbf] bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-500">
                فرصتك القادمة
              </span>
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mb-14 font-body leading-relaxed opacity-90">
            IDEA BUSINESS – منصة ذكية آمنة تربط أصحاب الأفكار بالمستثمرين عبر بيئة متميزة ومنظمة بمعايير عالمية.
          </p>
          <div className="flex flex-col md:flex-row gap-6 mb-20">
            <Link
              href="/opportunities"
              className="bg-[#00ffd1] text-black font-black text-xl px-12 py-5 rounded-md hover:brightness-110 transition-all flex items-center gap-3 active:scale-95 shadow-[0_0_40px_rgba(0,255,209,0.3)]"
            >
              استعرض الفرص
              <span className="material-symbols-outlined font-black text-xl">
                search
              </span>
            </Link>
            <Link
              href="/add-idea"
              className="border border-white/20 text-white font-black text-xl px-12 py-5 rounded-md hover:bg-white/5 transition-all flex items-center gap-3 active:scale-95"
            >
              أعلن عن فكرتك
              <span className="material-symbols-outlined font-black text-xl">
                lightbulb
              </span>
            </Link>
          </div>

          <div className="w-full border-y border-white/5 py-8 overflow-hidden bg-black/20 backdrop-blur-sm relative">
            <div className="flex gap-20 animate-scroll-rtl whitespace-nowrap">
              {Array(4)
                .fill([
                  "← ذكاء اصطناعي",
                  "← منصة موثوقة",
                  "← حماية قانونية",
                  "← دفع آمن",
                  "← ثنائية اللغة",
                ])
                .flat()
                .map((text, i) => (
                  <span key={i} className="text-slate-500/60 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                    {text}
                  </span>
                ))}
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="w-full bg-primary-container/[0.04] border-y border-primary-container/20 py-10">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center flex flex-col gap-2">
                <span
                  className={`font-data text-4xl md:text-5xl ${stat.color} font-black`}
                >
                  {stat.value}
                </span>
                <span className="text-slate-500 font-bold font-headline">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Path Selection */}
        <section className="py-24 px-6 container mx-auto">
          <div className="text-right mb-16">
            <h2 className="font-headline text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
              من أنت؟
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {paths.map((path, i) => (
              <div
                key={i}
                className={`group relative bg-[#0A1628] p-10 h-full border border-white/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden ${path.featured ? "border-primary-container/30 shadow-[0_0_40px_rgba(0,255,209,0.1)]" : ""}`}
              >
                <div className="l-bracket-tr opacity-20"></div>
                <div className="l-bracket-bl opacity-20"></div>
                <div
                  className={`absolute inset-0 ${path.bg} opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>
                <div className="relative z-10">
                  <span
                    className={`material-symbols-outlined text-5xl mb-6 text-${path.color}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {path.icon}
                  </span>
                  <h3 className="text-3xl font-black mb-4 text-white font-headline">
                    {path.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed font-body">
                    {path.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-surface-container-lowest relative overflow-hidden">
          <div className="container mx-auto">
            <div className="text-center mb-20">
              <span className="font-data text-xs text-primary-container block mb-4 tracking-[0.3em] uppercase opacity-50">
                ⭐ ميزات نانوية
              </span>
              <h2 className="font-headline text-5xl md:text-6xl font-black text-white uppercase tracking-tight">
                لماذا <span className="text-primary-container">IDEA BUSINESS</span>؟
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="bg-[#0A1628] p-12 relative group overflow-hidden hover:bg-slate-900 transition-colors duration-500"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-container opacity-20 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-primary-container mb-6">
                    <span className="material-symbols-outlined text-4xl font-black group-hover:scale-125 transition-transform duration-500">
                      {feat.icon}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-4 font-headline uppercase leading-tight">
                    {feat.title}
                  </h4>
                  <p className="text-slate-400 font-body leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Interactive Steps */}
        <HowItWorks />

        {/* Global Investor World Section */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center text-right">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-container/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
                <Image
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800"
                  width={800}
                  height={600}
                  alt="Investor Network"
                  className="clip-card grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div>
                <h2 className="text-5xl font-black text-white font-headline leading-tight mb-8">
                  شبكة لا تضاهى من <br /> <span className="text-secondary-fixed-dim italic underline decoration-primary-container decoration-4">رؤوس الأموال الذكية</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-10 font-body">
                  نحن لا نوفر لك تمويلاً فقط، بل نمنحك الدخول إلى نخبة من المستشارين والشركاء الاستراتيجيين الذين ساهموا في بناء أكبر الشركات التقنية في المنطقة.
                </p>
                <ul className="space-y-6 mb-12">
                  {[
                    'وصول مباشر لصناديق الاستثمار الجريء (VCs)',
                    'جلسات إرشاد وتوجيه مجانية للأعضاء',
                    'تقنيات عرض مدعومة بالذكاء الاصطناعي',
                    'عقود استثمارية قياسية جاهزة للتوقيع'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-slate-300 font-bold group">
                      <span className="material-symbols-outlined text-primary-container group-hover:animate-bounce">verified</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="inline-flex items-center gap-3 bg-white text-[#050b14] px-10 py-5 font-black text-xl clip-button hover:bg-primary-container transition-all group active:scale-95">
                  انضم إلينا
                  <span className="material-symbols-outlined group-hover:translate-x-[-10px] transition-transform">west</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Slider */}
        <TrendingIdeas />

        {/* Success Stories */}
        <section className="py-24 px-6 bg-slate-900/40 relative">
          <div className="container mx-auto max-w-6xl text-right">
            <div className="text-center mb-20">
              <h2 className="font-headline text-5xl font-black text-white italic">قصص نجاح من مجتمعنا</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                {
                  name: "م. أحمد الغامدي",
                  role: "مؤسس تطبيق سبل",
                  quote: "بفضل المنصة استطعت تأمين تمويل بذري خلال ٤٥ يوماً فقظ عبر التواصل المباشر مع مستثمرين مهتمين بقطاع الـ SaaS.",
                  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
                },
                {
                  name: "سارة الزهراني",
                  role: "مستثمرة ملائكية",
                  quote: "وجدة مرونة عالية في استعراض الفرص وتصفية المشاريع بناءً على معايير الاستثمار الخاصة بي، مما وفر علي مئات الساعات من البحث.",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
                }
              ].map((story, i) => (
                <div key={i} className="bg-[#0A1628] border border-white/5 p-10 relative group">
                  <span className="material-symbols-outlined text-6xl text-primary-container/10 absolute top-4 left-4">format_quote</span>
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <Image src={story.img} width={80} height={80} alt={story.name} className="rounded-full border-2 border-primary-container/30 ring-8 ring-primary-container/5" />
                    <div>
                      <div className="text-xl font-black text-white font-headline">{story.name}</div>
                      <div className="text-sm text-primary-container font-data uppercase tracking-widest">{story.role}</div>
                    </div>
                  </div>
                  <p className="text-slate-400 font-body leading-relaxed relative z-10 italic">
                    "{story.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* --- NEW SECTIONS --- */}
        
        {/* Section 1: Saudi Arabia Presence */}
        <section className="py-24 px-6 bg-primary-container/[0.02] border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          <div className="container mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1 text-right">
                   <div className="inline-flex items-center gap-2 text-primary-container font-data text-xs mb-6 tracking-widest uppercase">
                      <span className="w-8 h-[1px] bg-primary-container"></span>
                      من قلب الرياض إلى كافة أنحاء المملكة
                   </div>
                   <h2 className="text-4xl md:text-6xl font-black text-white font-headline leading-tight mb-8">
                      رؤية سعودية <br/> <span className="text-primary-container">لطموح عالمي</span>
                   </h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-8 font-body">
                      نحن في IDEA BUSINESS نفخر بأننا منصة سعودية بالكامل، صُممت لتواكب رؤية المملكة ٢٠٣٠ في التحول الرقمي ودعم المنشآت الصغيرة والمتوسطة. نعمل على تمكين الكفاءات الوطنية وربطها بالموارد التي تستحقها.
                   </p>
                   <div className="flex items-center gap-4 text-white font-bold bg-white/5 p-4 border-r-4 border-primary-container max-w-fit">
                      <span className="material-symbols-outlined text-3xl">location_on</span>
                      <span>فخورون بخدمة أكثر من ١٣ منطقة إدارية في المملكة</span>
                   </div>
                </div>
                <div className="order-1 lg:order-2 relative group">
                   <div className="absolute -inset-4 bg-primary-container/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   <Image 
                     src="https://images.unsplash.com/photo-1586724230449-623832c39d89?w=800" 
                     width={800} 
                     height={500} 
                     alt="Saudi Innovation" 
                     className="clip-card relative z-10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
                   />
                </div>
             </div>
          </div>
        </section>

        {/* Section 2: Future Vision */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto text-center">
             <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-7xl font-black text-white font-headline uppercase tracking-tighter mb-12">
                   نبني <span className="bg-gradient-to-r from-tertiary-fixed-dim to-secondary-fixed-dim bg-clip-text text-transparent italic">المستقبل</span> خطوة بخطوة
                </h2>
                <p className="text-slate-400 text-xl leading-relaxed mb-16 font-body">
                   طموحنا لا يتوقف عند الربط المبدئي؛ نحن نعمل على تطوير ميزات ثورية تشمل التقييم الآلي للمشاريع وتحليل المخاطر اللحظي عبر الذكاء الاصطناعي، لنضمن أن تكون رحلتك الاستثمارية هي الأكثر أمناً وذكاءً في المنطقة.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
                   {[
                     { title: "تقييم ذكي", desc: "أدوات متطورة لتحليل جدوى الفكرة تقنياً ومالياً." },
                     { title: "توسع إقليمي", desc: "نبحث دائماً عن فرص لربط مشاريعنا بأسواق الخليج." },
                     { title: "دعم مستمر", desc: "تحديثات دورية تضمن بقاء منصتنا في قمة الهرم التقني." }
                   ].map((item, i) => (
                     <div key={i} className="bg-[#0A1628] p-8 border border-white/5 relative group hover:border-primary-container/30 transition-all">
                        <div className="l-bracket-tr opacity-10"></div>
                        <h4 className="text-primary-container font-black mb-4 font-headline text-xl">{item.title}</h4>
                        <p className="text-slate-500 text-sm font-body leading-relaxed">{item.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </section>

        {/* Section 3: Success for All */}
        <section className="py-24 px-6 bg-[#0A1628] border-y border-white/5 relative overflow-hidden">
          <div className="container mx-auto">
             <div className="flex flex-col lg:flex-row gap-16 items-center justify-between">
                <div className="max-w-2xl text-right">
                   <h2 className="text-4xl md:text-5xl font-black text-white font-headline mb-8">
                      نجاحك هو <span className="text-secondary-fixed-dim">المقياس الوحيد</span> لإنجازنا
                   </h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-10 font-body">
                      في IDEA BUSINESS، نحن لا نبني منصة، بل نبني مجتمعاً. نجاح "صاحب الفكرة" في الحصول على تمويل هو انتصار لـ "المستثمر" في اقتناص الفرصة، وهو مساهمة حقيقية منا في نمو الاقتصاد الوطني. نحن هنا لننجح معاً.
                   </p>
                   <div className="flex gap-4">
                      <div className="px-6 py-3 bg-primary-container/10 border border-primary-container/30 text-primary-container font-bold rounded-lg text-sm">
                         +١٠٠٠ مستخدم نشط
                      </div>
                      <div className="px-6 py-3 bg-secondary-container/10 border border-secondary-container/30 text-secondary-container font-bold rounded-lg text-sm">
                         بيئة آمنة ١٠٠٪
                      </div>
                   </div>
                </div>
                <div className="w-full lg:w-1/3">
                   <div className="p-10 border-2 border-dashed border-white/10 relative">
                      <div className="absolute -top-4 -right-4 bg-primary-container text-background p-2 font-black text-xs uppercase">إحصائية حية</div>
                      <div className="text-7xl font-black text-white font-data mb-4">٩٨٪</div>
                      <div className="text-slate-400 font-headline font-bold">نسبة رضاء مجتمع رواد الأعمال والمستثمرين عن سهولة استخدام المنصة.</div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="relative bg-[#0A1628] p-12 md:p-24 overflow-hidden border border-white/5 shadow-2xl text-center">
              <div className="l-bracket-tr"></div>
              <div className="l-bracket-bl"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-7xl font-black text-white mb-8 font-headline uppercase tracking-tight leading-tight">
                  لا تترك فكرتك <span className="text-primary-container">أسيرة</span> للأوراق
                </h2>
                <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto font-body">
                  انضم إلى آلاف المبدعين والمستثمرين في أكبر بيئة تقنية عربية لتمويل المشاريع.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/register"
                    className="bg-primary-container text-background font-black px-12 py-6 clip-button text-2xl hover:scale-105 transition-all shadow-neon-sm"
                  >
                    ابدأ الآن مجاناً
                  </Link>
                  <Link
                    href="/contact"
                    className="border-2 border-white/20 text-white font-black px-12 py-6 clip-button text-2xl hover:bg-white/5 transition-all"
                  >
                    تواصل معنا
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-20 px-12 grid grid-cols-1 md:grid-cols-3 gap-12 bg-[#050b14] border-t border-primary-container/10 relative z-10">
        <div className="flex flex-col gap-6">
          <div className="font-data text-primary-container font-black text-3xl tracking-tighter">
            IDEA BUSINESS
          </div>
          <p className="font-body text-sm text-slate-500 max-w-xs leading-relaxed">
            المنصة الرائدة في الشرق الأوسط لربط الأفكار الريادية برؤوس الأموال الذكية باستخدام تقنيات الذكاء الاصطناعي.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-4 text-right">
            <h5 className="text-primary-container font-black mb-2 uppercase tracking-widest text-xs">الروابط</h5>
            {[
              { text: "الشروط والأحكام", href: "/terms" },
              { text: "سياسة الخصوصية", href: "/privacy" },
              { text: "اتصل بنا", href: "/contact" },
              { text: "خارطة الطريق", href: "/roadmap" },
            ].map((link, i) => (
              <Link key={i} href={link.href} className="text-slate-500 hover:text-white transition-colors font-body text-sm">
                {link.text}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-4 text-right">
            <h5 className="text-primary-container font-black mb-2 uppercase tracking-widest text-xs">مجالاتنا</h5>
            {["التكنولوجيا المالية", "الطاقة المتجددة", "الذكاء الاصطناعي", "الصحة الرقمية"].map((link, i) => (
              <Link key={i} href="#" className="text-slate-500 hover:text-white transition-colors font-body text-sm">
                {link}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-8 items-end">
          <div className="flex gap-4">
            {["public", "alternate_email", "share"].map((icon, i) => (
              <a key={i} href="#" className="w-12 h-12 border border-white/5 flex items-center justify-center hover:bg-primary-container/10 hover:text-primary-container transition-all">
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </a>
            ))}
          </div>
          <p className="font-data text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            © 2024 IDEA BUSINESS. السيادة المالية الرقمية.
          </p>
        </div>
      </footer>
    </div>
  );
}
