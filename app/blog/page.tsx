import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Blog } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*, author:profiles(full_name, avatar_url)')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
  }

  const featuredBlog = blogs?.[0];
  const otherBlogs = blogs?.slice(1) || [];

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4 md:px-8 relative overflow-hidden" dir="rtl">
      {/* Cyber Background Elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-container/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 blur-[150px]"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center space-y-4">
          <div className="inline-block px-4 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full text-primary-container text-xs font-bold tracking-widest uppercase mb-4 animate-fade-in">
            الرؤى السيادية
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 animate-slide-up">
            مركز <span className="text-primary-container">المعرفة</span> الرقمي
          </h1>
          <p className="text-foreground/60 max-w-2xl mx-auto text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
            استكشف أحدث التحليلات والتقارير حول مستقبل الاستثمار والذكاء الاصطناعي في المنطقة العربية.
          </p>
        </header>

        {/* Featured Post */}
        {featuredBlog && (
          <section className="mb-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link href={`/blog/${featuredBlog.slug}`} className="group relative block rounded-3xl overflow-hidden border border-primary-container/20 bg-surface-container-low/50 backdrop-blur-md transition-all duration-500 hover:border-primary-container/40 hover:shadow-[0_0_50px_rgba(0,255,209,0.15)]">
              <div className="flex flex-col lg:flex-row items-stretch">
                <div className="lg:w-3/5 h-[300px] lg:h-[500px] relative overflow-hidden">
                  <img 
                    src={featuredBlog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'} 
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-background via-transparent to-transparent"></div>
                  <div className="absolute top-6 right-6 px-3 py-1 bg-primary-container text-background font-bold text-xs uppercase tracking-tighter rounded-sm">
                    TOP STORY
                  </div>
                </div>
                <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                  <div className="flex items-center gap-4 text-xs font-bold text-primary-container">
                    <span>{featuredBlog.category}</span>
                    <span className="w-1 h-1 bg-primary-container/40 rounded-full"></span>
                    <span className="text-foreground/40">{new Date(featuredBlog.published_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold leading-tight group-hover:text-primary-container transition-colors">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-foreground/60 leading-relaxed text-lg line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-container/30 bg-primary-container/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-container">person</span>
                      </div>
                      <span className="text-sm font-medium">{featuredBlog.author?.full_name || 'AL-COMMAND AI'}</span>
                    </div>
                    <span className="material-symbols-outlined text-primary-container group-hover:translate-x-[-10px] transition-transform">arrow_back</span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {['الكل', 'الذكاء الاصطناعي', 'تحليل الأسواق', 'تكنولوجيا', 'قصص النجاح'].map((cat) => (
            <button key={cat} className={`px-6 py-2 rounded-lg border text-sm font-bold transition-all duration-300 ${cat === 'الكل' ? 'bg-primary-container text-background border-primary-container' : 'border-primary-container/20 text-foreground/60 hover:border-primary-container/50 hover:text-foreground'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Other Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherBlogs.map((blog, idx) => (
            <Link 
              key={blog.id} 
              href={`/blog/${blog.slug}`}
              className="group flex flex-col h-full bg-surface-container-low/30 backdrop-blur-sm border border-primary-container/10 rounded-2xl overflow-hidden hover:border-primary-container/30 hover:shadow-2xl hover:shadow-primary-container/5 transition-all duration-500 animate-fade-in"
              style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={blog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'} 
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-md border border-primary-container/20 text-primary-container font-bold text-[10px] uppercase rounded-sm">
                  {blog.category}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow space-y-4">
                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                  {new Date(blog.published_at).toLocaleDateString('ar-EG')}
                </div>
                <h3 className="text-xl font-bold leading-snug group-hover:text-primary-container transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-foreground/60 text-sm leading-relaxed line-clamp-3 flex-grow">
                  {blog.excerpt}
                </p>
                <div className="pt-6 border-t border-primary-container/5 flex items-center justify-between group-hover:border-primary-container/20 transition-colors">
                  <span className="text-xs font-bold text-primary-container uppercase tracking-wider">اقرأ المزيد</span>
                  <span className="material-symbols-outlined text-primary-container group-hover:translate-x-[-5px] transition-transform text-sm">arrow_back</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Dummy */}
        <div className="mt-20 flex justify-center items-center gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-primary-container/20 text-foreground/40 hover:border-primary-container hover:text-primary-container transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-12 h-12 flex items-center justify-center rounded-xl border font-bold transition-all ${p === 1 ? 'bg-primary-container text-background border-primary-container' : 'border-primary-container/20 text-foreground/40 hover:border-primary-container hover:text-primary-container'}`}>
                {p}
              </button>
            ))}
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-primary-container/20 text-foreground/40 hover:border-primary-container hover:text-primary-container transition-all">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        </div>
      </div>
    </main>
  );
}
