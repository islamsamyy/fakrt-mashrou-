import BlogSearch from '@/components/blog/BlogSearch';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { SystemLog } from '@/components/blog/SystemLog';
import { ParallaxCard } from '@/components/ui/ParallaxCard';
import { Navbar } from '@/components/layout/Navbar';
import { emitSystemLog } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function BlogPage({ searchParams }: { searchParams: { q?: string, category?: string, page?: string } }) {
  const params = await searchParams;
  const q = params.q;
  const category = params.category;
  const page = parseInt(params.page || '1');
  const pageSize = 6;
  const supabase = await createClient();
  
  let query = supabase
    .from('blogs')
    .select('*, author:profiles(full_name, avatar_url)', { count: 'exact' })
    .order('published_at', { ascending: false });

  if (category && category !== 'الكل') {
    query = query.eq('category', category);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: blogs, count, error } = await query;

  if (error) {
    console.error('Error fetching blogs:', error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;
  const featuredBlog = page === 1 && !q && !category ? blogs?.[0] : null;
  const displayBlogs = featuredBlog ? blogs?.slice(1) || [] : blogs || [];

  // Fetch unique categories
  const { data: allCategories } = await supabase.from('blogs').select('category');
  const uniqueCategories = Array.from(new Set((allCategories || []).map(c => c.category).filter(Boolean)));
  const categories = ['الكل', ...uniqueCategories];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4 md:px-8 relative overflow-hidden" dir="rtl">
      {/* Cyber Background & Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 neon-grid opacity-20 dark:opacity-10"></div>
        <div className="absolute inset-0 scanline opacity-30 dark:opacity-20 animate-scanline"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-container/20 blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/10 blur-[180px] animate-float"></div>
        
        {/* Floating Cyber Orbs */}
        <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-primary-container/10 rounded-full blur-3xl animate-float-orb"></div>
        <div className="absolute bottom-[20%] left-[5%] w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-float-orb" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 text-center space-y-8 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-primary-container/0 via-primary-container/40 to-transparent"></div>
          
          <div className="inline-flex items-center gap-3 px-6 py-2 glass-cyan rounded-full text-primary-container text-[11px] font-black tracking-[0.3em] uppercase mb-4 animate-fade-in border-primary-container/30 shadow-[0_0_20px_rgba(0,255,209,0.15)]">
            <span className="w-2 h-2 bg-primary-container rounded-full animate-ping"></span>
            SOVEREIGN_KNOWLEDGE_CENTER_V2.0
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 animate-slide-up leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground to-foreground/50 relative">
            بوصلة <span className="text-primary-container drop-shadow-[0_0_20px_rgba(0,255,209,0.4)] text-glitch relative inline-block after:content-['الاستثمار'] after:absolute after:inset-0 after:text-secondary/30 after:-translate-x-[2px] after:animate-glitch-1 before:content-['الاستثمار'] before:absolute before:inset-0 before:text-primary-container/30 before:translate-x-[2px] before:animate-glitch-2">الاستثمار</span> الرقمي
          </h1>
          
          <p className="text-foreground/60 max-w-3xl mx-auto text-2xl font-light animate-slide-up leading-relaxed border-x border-primary-container/10 px-12" style={{ animationDelay: '0.1s' }}>
            رؤى استراتيجية تقود مستقبل الاقتصاد العربي في عصر السيادة التكنولوجية والذكاء الاصطناعي.
          </p>

          <div className="flex justify-center gap-12 mt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-primary-container/40 uppercase tracking-widest">Total_Articles</span>
              <span className="text-2xl font-black tabular-nums">{count || 0}</span>
            </div>
            <div className="w-px h-12 bg-primary-container/10"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-primary-container/40 uppercase tracking-widest">Categories</span>
              <span className="text-2xl font-black tabular-nums">{uniqueCategories.length}</span>
            </div>
            <div className="w-px h-12 bg-primary-container/10"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-primary-container/40 uppercase tracking-widest">Sync_Status</span>
              <span className="text-2xl font-black text-secondary animate-pulse">LIVE</span>
            </div>
          </div>
        </header>

        {/* Intelligence Ticker */}
        <div className="mb-20 glass border-y border-primary-container/20 py-5 overflow-hidden relative group backdrop-blur-md">
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-background via-background/80 to-transparent z-10"></div>
          
          <div className="animate-ticker whitespace-nowrap flex items-center gap-20">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-20">
                {blogs?.map((blog) => (
                  <div key={blog.id} className="flex items-center gap-4">
                    <span className="text-primary-container font-black text-[10px] uppercase tracking-[0.4em] bg-primary-container/5 px-3 py-1 rounded border border-primary-container/10">[{blog.category || 'INTEL'}]</span>
                    <span className="text-foreground/80 text-base font-bold uppercase tracking-tight">{blog.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Suspense fallback={<div className="h-20 animate-pulse bg-primary-container/5 rounded-2xl mb-16"></div>}>
          <BlogSearch />
        </Suspense>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-24 animate-fade-in no-scrollbar overflow-x-auto pb-4" style={{ animationDelay: '0.3s' }}>
          {categories.map((cat) => {
            const isActive = category === cat || (!category && cat === 'الكل');
            return (
              <Link 
                key={cat} 
                href={cat === 'الكل' ? '/blog' : `/blog?category=${cat}${q ? `&q=${q}` : ''}`}
                className={`px-8 py-3 rounded-xl border-2 text-xs font-black tracking-widest transition-all duration-500 uppercase whitespace-nowrap relative group ${
                  isActive 
                    ? 'bg-primary-container text-background border-primary-container shadow-[0_0_30px_rgba(0,255,209,0.5)]' 
                    : 'glass text-foreground/60 border-primary-container/10 hover:border-primary-container/40 hover:text-primary-container hover:shadow-neon-sm'
                }`}
              >
                {isActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse"></span>}
                <span className="relative z-10">{cat}</span>
                {!isActive && (
                  <div className="absolute inset-0 bg-primary-container/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg"></div>
                )}
              </Link>
            );
          })}
        </div>

        {blogs && blogs.length > 0 ? (
          <>
            {/* Featured Post */}
            {featuredBlog && (
              <section className="mb-24 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <ParallaxCard className="relative block rounded-[3rem] overflow-hidden border border-primary-container/20 bg-surface-container-low/40 backdrop-blur-3xl transition-all duration-700 hover:border-primary-container/60 hover:shadow-[0_0_100px_rgba(0,255,209,0.25)] group">
                  <Link href={`/blog/${featuredBlog.slug}`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 blur-[120px] -z-10 group-hover:bg-primary-container/20 transition-all"></div>
                  <div className="l-bracket-tr opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 !w-24 !h-24 border-primary-container/40"></div>
                  <div className="l-bracket-bl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 !w-24 !h-24 border-primary-container/40"></div>
                  
                  <div className="flex flex-col lg:flex-row items-stretch min-h-[650px]">
                    <div className="lg:w-7/12 relative overflow-hidden">
                      <img 
                        src={featuredBlog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'} 
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-background via-background/40 to-transparent"></div>
                      
                      <div className="absolute top-10 right-10 flex flex-col gap-3">
                        <div className="glass-strong px-5 py-2.5 text-primary-container font-black text-xs uppercase tracking-[0.3em] rounded-xl border-primary-container/40 animate-glow-soft">
                          FEATURED_PROTOCOL // {new Date(featuredBlog.published_at).getFullYear()}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 glass-cyan rounded-lg text-primary-container text-[8px] font-black tracking-widest uppercase self-end">
                           <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"></span>
                           VERIFIED_INTEL
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:w-5/12 p-12 lg:p-20 flex flex-col justify-center space-y-10 relative">
                      <div className="flex items-center gap-6 text-[10px] font-black tracking-[0.3em] text-primary-container">
                        <span className="px-4 py-1.5 bg-primary-container/10 border border-primary-container/20 rounded-lg uppercase">{featuredBlog.category}</span>
                        <div className="flex items-center gap-2 text-foreground/40">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          <span>{new Date(featuredBlog.published_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      <h2 className="text-4xl lg:text-6xl font-black leading-[1.1] group-hover:text-primary-container transition-colors duration-500 tracking-tight text-glitch">
                        {featuredBlog.title}
                      </h2>
                      
                      <p className="text-foreground/70 leading-relaxed text-2xl font-light line-clamp-4 border-r-2 border-primary-container/20 pr-6">
                        {featuredBlog.excerpt}
                      </p>
                      
                      <div className="pt-10 flex items-center justify-between border-t border-primary-container/10">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary-container/30 bg-primary-container/10 flex items-center justify-center group-hover:border-primary-container transition-all duration-500 shadow-neon-sm relative">
                            {featuredBlog.author?.avatar_url ? (
                              <img src={featuredBlog.author.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-primary-container text-3xl">shield</span>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-container rounded-full border-4 border-background animate-pulse"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-black tracking-wider uppercase">{featuredBlog.author?.full_name || 'أدمن النظام'}</span>
                            <span className="text-[10px] text-primary-container font-black uppercase tracking-[0.3em]">Chief Intelligence Officer</span>
                          </div>
                        </div>
                        <div className="w-16 h-16 glass-cyan rounded-2xl flex items-center justify-center text-primary-container group-hover:shadow-neon transition-all duration-500 cursor-pointer overflow-hidden relative">
                          <div className="absolute inset-0 bg-primary-container/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                          <span className="material-symbols-outlined text-2xl group-hover:translate-x-[-8px] transition-transform relative z-10 font-black">arrow_back</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Link>
                </ParallaxCard>
              </section>
            )}

            {/* Other Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {displayBlogs.map((blog, idx) => (
                <ParallaxCard key={blog.id} className="group relative flex flex-col h-full rounded-[2.5rem] overflow-hidden border border-primary-container/10 bg-surface-container-low/20 backdrop-blur-xl transition-all duration-700 hover:border-primary-container/40 hover:shadow-[0_0_80px_rgba(0,255,209,0.15)] animate-slide-up" style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}>
                  <Link href={`/blog/${blog.slug}`} className="flex flex-col h-full">
                    <div className="relative aspect-video overflow-hidden border-b border-primary-container/10">
                      <img 
                        src={blog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'} 
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60"></div>
                      
                      <div className="absolute top-6 right-6">
                        <span className="px-4 py-1.5 glass-cyan rounded-lg text-primary-container text-[8px] font-black tracking-widest uppercase border border-primary-container/20">
                          {blog.category}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                    </div>
                    
                    <div className="p-12 flex flex-col flex-grow space-y-8 relative">
                      <div className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-2 h-2 bg-primary-container/30 rounded-full animate-pulse"></span>
                        {new Date(blog.published_at).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <h3 className="text-3xl font-black leading-tight group-hover:text-primary-container transition-colors duration-500 line-clamp-2 tracking-tight">
                        {blog.title}
                      </h3>
                      
                      <p className="text-foreground/60 text-xl font-light leading-relaxed line-clamp-3 flex-grow">
                        {blog.excerpt}
                      </p>
                      
                      <div className="pt-10 border-t border-primary-container/10 flex items-center justify-between group-hover:border-primary-container/40 transition-all duration-500">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary-container uppercase tracking-[0.3em]">Protocol_Initiate</span>
                          <div className="w-1 h-1 bg-primary-container rounded-full animate-pulse"></div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl glass-cyan flex items-center justify-center text-primary-container group-hover:scale-110 transition-all duration-500">
                          <span className="material-symbols-outlined text-lg group-hover:translate-x-[-4px] transition-transform font-black">arrow_back</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ParallaxCard>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-40 flex justify-center items-center gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <Link 
                  href={`/blog?page=${Math.max(1, page - 1)}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}`}
                  className={`w-20 h-20 glass rounded-3xl flex items-center justify-center text-foreground/40 hover:border-primary-container hover:text-primary-container hover:shadow-neon transition-all duration-500 group ${page === 1 ? 'pointer-events-none opacity-20' : ''}`}
                >
                  <span className="material-symbols-outlined text-3xl group-hover:scale-125 transition-transform font-black">chevron_right</span>
                </Link>
                
                <div className="flex gap-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Link 
                      key={p} 
                      href={`/blog?page=${p}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}`}
                      className={`w-20 h-20 rounded-3xl border-2 font-black transition-all duration-700 text-2xl flex items-center justify-center relative overflow-hidden group ${
                        p === page 
                          ? 'bg-primary-container text-background border-primary-container shadow-[0_0_40px_rgba(0,255,209,0.5)]' 
                          : 'glass text-foreground/40 border-primary-container/10 hover:border-primary-container/40 hover:text-primary-container'
                      }`}
                    >
                      {p === page && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                      <span className="relative z-10">{p}</span>
                    </Link>
                  ))}
                </div>

                <Link 
                  href={`/blog?page=${Math.min(totalPages, page + 1)}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}`}
                  className={`w-20 h-20 glass rounded-3xl flex items-center justify-center text-foreground/40 hover:border-primary-container hover:text-primary-container hover:shadow-neon transition-all duration-500 group ${page === totalPages ? 'pointer-events-none opacity-20' : ''}`}
                >
                  <span className="material-symbols-outlined text-3xl group-hover:scale-125 transition-transform font-black">chevron_left</span>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-40 glass border border-primary-container/20 rounded-[4rem] space-y-10 relative overflow-hidden">
            <div className="absolute inset-0 neon-grid opacity-10"></div>
            <div className="relative z-10 space-y-8">
              <div className="w-32 h-32 bg-primary-container/5 rounded-full flex items-center justify-center mx-auto border-2 border-primary-container/10">
                <span className="material-symbols-outlined text-7xl text-primary-container/40 animate-pulse">database_off</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-black text-foreground tracking-tighter uppercase">No_Archive_Found</h3>
                <p className="text-foreground/40 text-2xl font-light max-w-xl mx-auto">
                  The specified query returned zero matching nodes in the network archive.
                </p>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-4 px-16 py-6 bg-primary-container text-background font-black rounded-2xl hover:shadow-[0_0_60px_rgba(0,255,209,0.5)] transition-all uppercase tracking-tighter text-xl group">
                <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-700 font-black">refresh</span>
                Reset Database
              </Link>
            </div>
          </div>
        )}
      </div>

      <SystemLog />
    </main>
    </>
  );
}
