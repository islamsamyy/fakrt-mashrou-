import Link from 'next/link';

export function Footer() {
  const SOCIALS = [
    { label: 'Twitter', href: 'https://twitter.com/ideabusiness', icon: 'language' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/ideabusiness', icon: 'business' },
    { label: 'YouTube', href: 'https://youtube.com/@ideabusiness', icon: 'smart_display' },
    { label: 'GitHub', href: 'https://github.com/ideabusiness', icon: 'code' },
  ];

  return (
    <footer className="relative pt-32 pb-12 px-6 border-t border-primary-container/15 bg-background dark:bg-[#050b14] overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 scanline opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/40 to-transparent" />
      
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24 relative z-10">
        <div className="space-y-8 animate-fade-in flex flex-col items-center md:items-start text-center md:text-right">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 border border-primary-container/30 corner-bracket flex items-center justify-center interactive-glow rounded-xl bg-primary-container/5 group-hover:border-primary-container transition-all duration-500">
              <span className="material-symbols-outlined text-primary-container text-2xl animate-pulse-gentle">filter_tilt_shift</span>
            </div>
            <span className="text-3xl font-black font-data tracking-tighter text-foreground group-hover:animate-glitch-skew">
              IDEA <span className="text-primary-container">BUSINESS</span>
            </span>
          </div>
          <p className="text-muted-foreground font-body leading-relaxed max-w-sm text-sm hover:text-foreground transition-colors duration-300">
            المنصة العربية الرائدة التي تجمع بين العقول المبدعة والمستثمرين الطموحين لتحويل الأفكار إلى واقع اقتصادي ملموس ومستدام باستخدام تقنيات الذكاء الاصطناعي.
          </p>
          <div className="flex gap-4">
            {SOCIALS.map((social) => (
              <a 
                key={social.label} 
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={social.label} 
                className="w-12 h-12 border border-primary-container/20 flex items-center justify-center hover:border-primary-container hover:text-primary-container hover:bg-primary-container/10 transition-all duration-500 rounded-xl interactive-glow holographic-reflection overflow-hidden relative group"
              >
                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="animate-fade-in flex flex-col items-center md:items-start text-center md:text-right" style={{ animationDelay: '0.1s' }}>
          <h5 className="text-primary-container font-black mb-8 text-xs uppercase tracking-[0.3em] font-data">الملاحة المركزية</h5>
          <ul className="space-y-5 text-foreground/70 font-body text-sm">
            <li><Link href="/" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">الرئيسية<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
            <li><Link href="/opportunities" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">تصفح الفرص<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
            <li><Link href="/discover" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">اكتشف المشاريع<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
            <li><Link href="/trending" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">المشاريع الشائعة<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
          </ul>
        </div>

        <div className="animate-fade-in flex flex-col items-center md:items-start text-center md:text-right" style={{ animationDelay: '0.2s' }}>
          <h5 className="text-primary-container font-black mb-8 text-xs uppercase tracking-[0.3em] font-data">مركز الدعم</h5>
          <ul className="space-y-5 text-foreground/70 font-body text-sm">
            <li><Link href="/trust" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">الأسئلة الشائعة<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
            <li><Link href="/privacy" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">سياسة الخصوصية<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
            <li><Link href="/terms" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">الشروط والأحكام<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
            <li><Link href="/contact" className="hover:text-primary-container transition-all duration-300 hover:translate-x-[-8px] inline-block relative group">تواصل معنا<span className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-container rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_8px_#00ffd1]" /></Link></li>
          </ul>
        </div>

        <div className="animate-fade-in flex flex-col items-center md:items-start text-center md:text-right" style={{ animationDelay: '0.3s' }}>
          <h5 className="text-primary-container font-black mb-8 text-xs uppercase tracking-[0.3em] font-data">النشرة البريدية</h5>
          <p className="text-muted-foreground text-xs font-body mb-6 leading-relaxed">
            اشترك لتصلك أحدث الفرص الاستثمارية والتقارير الاقتصادية الحصرية.
          </p>
          <div className="w-full flex gap-2">
            <input 
              type="email" 
              placeholder="بريدك الإلكتروني" 
              className="flex-1 bg-primary-container/5 border border-primary-container/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary-container/50 transition-all text-right"
            />
            <button className="bg-primary-container text-background font-black text-[10px] px-5 py-3 rounded-xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,255,209,0.2)]">
              ارسل
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto pt-10 border-t border-primary-container/10 text-center text-muted-foreground font-data text-[10px] tracking-[0.3em] flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <span className="hover:text-foreground transition-colors duration-300 uppercase">© ٢٠٢٦ IDEA BUSINESS. ALL SYSTEMS OPERATIONAL</span>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 hover:text-foreground transition-colors duration-300 group">
            SECURE ACCESS
            <span className="material-symbols-outlined text-[14px] text-primary-container group-hover:rotate-12 transition-transform">lock_open</span>
          </span>
          <span className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
            MADE IN SAUDI ARABIA
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
          </span>
        </div>
      </div>
    </footer>
  );
}
