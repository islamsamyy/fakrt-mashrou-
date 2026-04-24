import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReadingProgressBar, TableOfContents, ShareButton } from '@/components/blog/BlogInteractions';
import { SystemLog } from '@/components/blog/SystemLog';

export const dynamic = 'force-dynamic';

export default async function BlogPostIdPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*, author:profiles(full_name, avatar_url, bio)')
    .eq('id', id)
    .single();

  if (error || !blog) {
    console.error('Error fetching blog post by ID:', error);
    notFound();
  }

  // Fetch related posts based on category
  const { data: relatedPosts } = await supabase
    .from('blogs')
    .select('title, slug, image_url, category')
    .eq('category', blog.category)
    .neq('id', id)
    .limit(3);

  // If no related posts in same category, just get latest
  const finalRelatedPosts = relatedPosts && relatedPosts.length > 0 
    ? relatedPosts 
    : (await supabase.from('blogs').select('title, slug, image_url, category').neq('id', id).limit(3)).data;

  // Parse content for rendering
  const contentWithIds = blog.content.split('\n\n').map((para: string, i: number) => {
    if (para.startsWith('## ') || para.startsWith('### ')) {
      const level = para.startsWith('### ') ? 3 : 2;
      const text = para.replace(/^#+\s/, '');
      return { type: 'heading', level, text, id: `heading-${i}` };
    }
    return { type: 'paragraph', text: para, id: `para-${i}` };
  });

  const headings = contentWithIds
    .filter((item: any) => item.type === 'heading')
    .map((item: any) => ({ id: item.id, text: item.text }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': blog.title,
    'image': blog.image_url,
    'datePublished': blog.published_at,
    'author': {
      '@type': 'Person',
      'name': blog.author?.full_name || 'Admin',
    },
    'description': blog.excerpt,
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4 md:px-8 relative overflow-hidden" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ReadingProgressBar />
      <TableOfContents headings={headings} />
      <SystemLog />

      {/* Cyber Background & Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 neon-grid opacity-20 dark:opacity-10"></div>
        <div className="absolute inset-0 scanline opacity-30 dark:opacity-20 animate-scanline"></div>
        <div className="absolute top-0 right-0 w-full h-[1000px] bg-gradient-to-b from-primary-container/10 via-transparent to-transparent"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[180px] animate-float"></div>
        <div className="absolute inset-0 noise-bg opacity-[0.03]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Navigation Breadcrumb - Cyber Style */}
        <div className="flex items-center gap-3 mb-16 text-[10px] font-black tracking-[0.2em] uppercase animate-fade-in">
          <Link href="/" className="px-3 py-1 glass border-primary-container/20 text-foreground/40 hover:text-primary-container hover:border-primary-container transition-all rounded-md">MAIN</Link>
          <span className="text-primary-container/30">/</span>
          <Link href="/blog" className="px-3 py-1 glass border-primary-container/20 text-foreground/40 hover:text-primary-container hover:border-primary-container transition-all rounded-md">INTEL_HUB</Link>
          <span className="text-primary-container/30">/</span>
          <span className="text-primary-container font-black drop-shadow-[0_0_10px_rgba(0,255,209,0.3)]">{blog.category?.toUpperCase() || 'GENERAL'}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Content Area */}
          <article className="lg:w-2/3 space-y-16">
            <header className="space-y-12 relative">
              <div className="intel-report-marker"></div>
              <div className="space-y-6">
                <div className="inline-flex items-center gap-4 px-5 py-2 glass-cyber rounded-full text-primary-container text-[11px] font-black tracking-[0.3em] uppercase animate-glow-soft">
                  <span className="w-2.5 h-2.5 bg-primary-container rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,209,1)]"></span>
                  DECRYPTED_INTEL // ID_NODE_{blog.id.substring(0, 8).toUpperCase()}
                </div>
                <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight animate-slide-up text-glitch cursor-default selection:bg-primary-container/30">
                  {blog.title}
                </h1>
                <p className="text-2xl text-foreground/70 font-light leading-relaxed animate-slide-up border-r-4 border-primary-container/30 pr-6" style={{ animationDelay: '0.1s' }}>
                  {blog.excerpt}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-8 py-12 border-y border-primary-container/10 relative glass-cyber px-8 rounded-3xl">
                <div className="absolute left-10 top-0 w-32 h-[1px] bg-gradient-to-r from-primary-container to-transparent"></div>
                <div className="absolute right-10 bottom-0 w-32 h-[1px] bg-gradient-to-l from-primary-container to-transparent"></div>
                
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary-container/30 bg-primary-container/5 flex items-center justify-center p-1.5 group shadow-neon-sm relative hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-primary-container/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img 
                      src={blog.author?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                      alt={blog.author?.full_name || 'Admin'}
                      className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-2xl tracking-tighter hover:text-primary-container transition-colors cursor-default">{blog.author?.full_name || 'أدمن النظام'}</h4>
                    <p className="text-[10px] text-primary-container font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary-container rounded-full animate-ping"></span>
                      Chief Intelligence Officer
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-12">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.3em]">PUBLISHED_DATE</span>
                    <span className="text-base font-bold font-data text-foreground/80">{new Date(blog.published_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.3em]">READ_SYNC_EST</span>
                    <span className="text-base font-bold flex items-center gap-2 font-data text-foreground/80">
                      <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,209,1)]"></span>
                      12:00_MIN
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.3em]">THREAT_LEVEL</span>
                    <span className="text-base font-black text-secondary animate-pulse tracking-widest">CRITICAL_NODE</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-primary-container/20 group shadow-2xl">
              <div className="l-bracket-tr opacity-60 group-hover:scale-110 transition-transform"></div>
              <div className="l-bracket-bl opacity-60 group-hover:scale-110 transition-transform"></div>
              
              <img 
                src={blog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'} 
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute bottom-10 right-10 flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center gap-3 glass-strong px-4 py-2 rounded-lg border-primary-container/30">
                  <div className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-primary-container tracking-widest uppercase">Visual Data Encrypted</span>
                </div>
              </div>
                      <div className="prose prose-invert prose-primary max-w-none prose-xl selection:bg-primary-container/30">
              <div className="text-foreground/80 leading-[1.8] font-light space-y-12 text-justify">
                {contentWithIds.map((item: any, i: number) => {
                   if (item.type === 'heading') {
                     const Tag = item.level === 3 ? 'h3' : 'h2';
                     return (
                       <Tag 
                         key={i} 
                         id={item.id} 
                         className="text-4xl font-black text-primary-container mt-24 mb-10 flex items-center gap-6 scroll-mt-32 group"
                       >
                         <span className="w-12 h-[2px] bg-primary-container/30 group-hover:w-20 transition-all duration-500"></span>
                         <span className="relative">
                           {item.text}
                           <span className="absolute -bottom-3 right-0 w-1/2 h-[1px] bg-gradient-to-l from-primary-container to-transparent"></span>
                         </span>
                       </Tag>
                     );
                   }
                   
                   // Wrap some paragraphs in "Intel Modules" for flair
                   const isIntelModule = i % 4 === 0 && i !== 0;
                   
                   return (
                     <div key={i} className={`relative transition-all duration-500 ${isIntelModule ? 'my-20 p-10 glass-cyber rounded-3xl border-r-4 border-primary-container/40' : 'hover:pr-4 hover:border-r-2 hover:border-primary-container/10'}`}>
                       {isIntelModule && (
                         <div className="absolute top-4 left-6 flex items-center gap-3">
                            <span className="text-[9px] font-black text-primary-container/40 uppercase tracking-[0.4em] font-mono">SECURE_DATA_NODE_0{i}</span>
                            <div className="w-1.5 h-1.5 bg-primary-container/30 rounded-full animate-ping"></div>
                         </div>
                       )}
                       <p className={`text-xl md:text-2xl leading-relaxed ${i === 0 ? 'text-3xl font-medium text-foreground leading-[1.6] opacity-100 pr-6 border-r-4 border-primary-container' : 'opacity-80'}`}>
                         {item.text}
                       </p>
                     </div>
                   );
                 })}
               </div>
               
               <div className="my-28 p-14 glass-cyber border-r-8 border-primary-container rounded-[3rem] relative overflow-hidden group shadow-neon-sm">
                 <div className="absolute top-[-50px] left-[-50px] w-80 h-80 bg-primary-container/10 blur-[120px] group-hover:bg-primary-container/20 transition-all duration-1000"></div>
                 <div className="relative z-10 text-right">
                   <span className="material-symbols-outlined text-primary-container text-8xl mb-10 opacity-30 block animate-glow-soft">format_quote</span>
                   <p className="text-3xl md:text-5xl font-black italic leading-[1.2] text-foreground tracking-tighter">
                     "إن الذكاء الاصطناعي لا يحل محل المستثمر، بل يمنحه مجهراً رقمياً يرى من خلاله فرصاً كانت غير مرئية في السابق."
                   </p>
                 </div>
               </div>

               {/* Enhanced Data Visualization */}
               <div className="my-28 p-12 glass-cyber rounded-[3rem] border border-primary-container/20 relative overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 neon-grid opacity-10 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h4 className="text-2xl font-black text-primary-container mb-16 flex items-center gap-6 uppercase tracking-[0.2em]">
                     <span className="w-4 h-4 bg-primary-container rounded-full animate-pulse shadow-[0_0_15px_rgba(0,255,209,1)]"></span>
                     Strategic Performance Metrics
                     <span className="flex-grow h-[1px] bg-gradient-to-r from-primary-container/20 to-transparent"></span>
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="p-12 glass-cyber rounded-3xl border border-primary-container/30 flex flex-col items-center text-center space-y-8 group hover:scale-[1.02] transition-all duration-500">
                       <span className="text-[11px] font-black text-primary-container uppercase tracking-[0.4em]">Predictive_Accuracy</span>
                       <span className="text-7xl font-black font-data tracking-tighter text-primary-container drop-shadow-[0_0_20px_rgba(0,255,209,0.5)] group-hover:scale-110 transition-transform duration-500">98.4%</span>
                       <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden p-[2px] border border-primary-container/10">
                         <div className="h-full bg-primary-container rounded-full shadow-neon-sm" style={{ width: '98.4%' }}></div>
                       </div>
                     </div>
                     <div className="p-12 glass-cyber rounded-3xl border border-secondary/30 flex flex-col items-center text-center space-y-8 group hover:scale-[1.02] transition-all duration-500">
                       <span className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.4em]">Processing_Latency</span>
                       <span className="text-7xl font-black font-data tracking-tighter text-secondary drop-shadow-[0_0_20px_rgba(255,62,112,0.5)] group-hover:scale-110 transition-transform duration-500">12.5ms</span>
                       <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden p-[2px] border border-secondary/10">
                         <div className="h-full bg-secondary rounded-full shadow-[0_0_10px_#ff3e70]" style={{ width: '85%' }}></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
/div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="pt-16 border-t border-primary-container/10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">SHARE INTEL</span>
                <div className="flex gap-4">
                  <ShareButton />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {(blog.tags || ['استثمار', 'ذكاء_اصطناعي', 'سيادة_رقمية']).map((tag: string) => (
                  <span key={tag} className="px-6 py-2.5 glass border-primary-container/10 rounded-xl text-xs font-black text-foreground/40 hover:text-primary-container hover:border-primary-container hover:shadow-neon-sm cursor-pointer transition-all hover:-translate-y-1">
                    #{tag}
                  </span>
                ))}
              </div>
            </footer>

            {/* Enhanced Comments Section */}
            <section className="pt-32 space-y-16">
              <div className="flex items-center justify-between">
                <h3 className="text-4xl font-black flex items-center gap-5">
                  <span className="material-symbols-outlined text-4xl text-primary-container animate-pulse">forum</span>
                  نقاشات الخبراء
                  <span className="text-sm font-bold text-foreground/30 bg-foreground/5 px-4 py-1.5 rounded-full border border-foreground/5">34</span>
                </h3>
                <div className="flex-grow mx-8 h-[1px] bg-gradient-to-l from-primary-container/20 to-transparent"></div>
              </div>
              
              <div className="space-y-10">
                <div className="p-10 glass rounded-[2.5rem] border border-primary-container/10 space-y-8 relative group overflow-hidden hover:border-primary-container/30 transition-all duration-500 text-right">
                  <div className="absolute top-0 right-0 w-2 h-full bg-primary-container/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl border border-primary-container/30 overflow-hidden shadow-neon-sm">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-xl tracking-tight">م. ليلى السيف</p>
                        <p className="text-[10px] text-primary-container font-black uppercase tracking-[0.2em] mt-1">Strategy Analyst</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-foreground/30 font-black tracking-widest uppercase">3H_AGO</span>
                  </div>
                  <p className="text-xl text-foreground/70 leading-relaxed font-light">
                    هل تعتقد أن دمج تقنيات ZK-Proofs سيؤدي إلى شفافية أعلى في معاملات المزادات دون الكشف عن هوية المستثمر السيادي؟
                  </p>
                  <div className="flex gap-8 pt-6 border-t border-foreground/5">
                    <button className="flex items-center gap-3 text-xs font-black text-primary-container hover:scale-110 transition-all">
                      <span className="material-symbols-outlined text-xl">thumb_up</span>
                      12
                    </button>
                    <button className="flex items-center gap-3 text-xs font-black text-foreground/30 hover:text-primary-container hover:scale-110 transition-all">
                      <span className="material-symbols-outlined text-xl">reply</span>
                      REPLY_TO_THREAD
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-12 glass-strong rounded-[3rem] border border-primary-container/20 space-y-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary-container via-transparent to-transparent"></div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></div>
                  <h4 className="text-2xl font-black uppercase tracking-[0.2em]">INITIATE_RESPONSE_PROTOCOL</h4>
                </div>
                <textarea 
                  className="w-full h-48 bg-background/50 border-2 border-primary-container/10 rounded-3xl p-8 text-xl font-light focus:border-primary-container/40 outline-none transition-all placeholder:text-foreground/20 resize-none shadow-inner text-right"
                  placeholder="أدخل تحليلك الاستراتيجي هنا..."
                ></textarea>
                <button className="w-full md:w-auto bg-primary-container text-background font-black px-16 py-6 rounded-2xl hover:shadow-[0_0_50px_rgba(0,255,209,0.6)] hover:scale-[1.02] transition-all active:scale-95 text-xl uppercase tracking-tighter shadow-neon-sm">
                  SEND_TO_NETWORK
                </button>
              </div>
            </section>
          </article>

          {/* Sidebar - Enhanced */}
          <aside className="lg:w-1/3 space-y-16">
            {/* Intelligence Briefing / Subscription */}
            <div className="p-12 glass-cyber rounded-[3.5rem] border border-primary-container/30 relative overflow-hidden group shadow-2xl sticky top-32">
              <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-primary-container/30 blur-[100px] rounded-full group-hover:bg-primary-container/40 transition-all duration-1000"></div>
              <div className="relative z-10 space-y-10">
                <div className="w-20 h-20 glass-cyber rounded-3xl flex items-center justify-center text-primary-container border-primary-container/40 shadow-neon-sm">
                  <span className="material-symbols-outlined text-5xl animate-pulse">mail</span>
                </div>
                <div className="space-y-6 text-right">
                  <h3 className="text-4xl font-black leading-tight tracking-tight uppercase">Intel_Briefing</h3>
                  <p className="text-xl text-foreground/70 font-light leading-relaxed">
                    انضم إلى النخبة واستقبل التقارير السرية حول تحركات السوق الكبرى مباشرة في شبكتك.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="NETWORK_ID@SECURE_NODE"
                      className="w-full bg-background/80 border-2 border-primary-container/10 rounded-2xl px-8 py-5 text-sm font-black font-data tracking-widest outline-none focus:border-primary-container/50 transition-all placeholder:opacity-30 shadow-inner"
                    />
                  </div>
                  <button className="button-holographic w-full py-6 text-xl uppercase tracking-tighter font-black text-primary-container">
                    AUTHORIZE_ACCESS
                  </button>
                </div>
              </div>
            </div>

            {/* Related Intel Feed */}
            <div className="space-y-10">
              <h4 className="text-xs font-black tracking-[0.5em] text-foreground/30 uppercase flex items-center gap-8">
                RELATED_INTEL
                <span className="flex-grow h-[1px] bg-foreground/5"></span>
              </h4>
              <div className="space-y-8">
                {finalRelatedPosts?.map((post: any) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <div className="flex gap-6 items-start">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-primary-container/20 relative flex-shrink-0 group-hover:border-primary-container transition-colors">
                        <img 
                          src={post.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300'} 
                          alt={post.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                        <div className="absolute inset-0 bg-primary-container/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="space-y-2 text-right">
                        <span className="text-[10px] font-black text-primary-container uppercase tracking-widest">{post.category}</span>
                        <h5 className="font-black leading-tight group-hover:text-primary-container transition-colors line-clamp-2">{post.title}</h5>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Real-time Telemetry */}
            <div className="p-12 glass-strong rounded-[3.5rem] border border-primary-container/10 space-y-12 relative overflow-hidden shadow-2xl">
               <div className="absolute inset-0 scanline opacity-10 pointer-events-none"></div>
               <div className="flex items-center justify-between">
                 <h4 className="text-xs font-black tracking-[0.4em] text-foreground/40 flex items-center gap-4">
                   <span className="material-symbols-outlined text-2xl text-primary-container animate-pulse">sensors</span>
                   REAL_TIME_TELEMETRY
                 </h4>
               </div>
               <div className="space-y-10">
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black tracking-[0.2em]">
                      <span className="text-foreground/40 uppercase">Network Load</span>
                      <span className="text-primary-container uppercase animate-glow-soft">Optimal_85%</span>
                    </div>
                    <div className="w-full h-2.5 bg-background/50 rounded-full overflow-hidden p-[2px] border border-primary-container/5">
                      <div className="h-full bg-primary-container rounded-full shadow-neon-sm animate-pulse" style={{ width: '85%' }}></div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black tracking-[0.2em]">
                      <span className="text-foreground/40 uppercase">Risk Index</span>
                      <span className="text-secondary uppercase">Low_32%</span>
                    </div>
                    <div className="w-full h-2.5 bg-background/50 rounded-full overflow-hidden p-[2px] border border-primary-container/5">
                      <div className="h-full bg-secondary rounded-full" style={{ width: '32%' }}></div>
                    </div>
                 </div>
               </div>

               <div className="pt-8 border-t border-foreground/5">
                 <div className="flex items-center gap-4 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
                   <span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_#ff3e70]"></span>
                   UPLINK_STABLE_V4.2
                 </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
