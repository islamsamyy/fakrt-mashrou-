import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReadingProgressBar, TableOfContents, ShareButton } from '@/components/blog/BlogInteractions';
import { SystemLog } from '@/components/blog/SystemLog';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*, author:profiles(full_name, avatar_url, bio)')
    .eq('slug', slug)
    .single();

  if (error || !blog) {
    console.error('Error fetching blog post:', error);
    notFound();
  }

  // Fetch related posts based on category
  const { data: relatedPosts } = await supabase
    .from('blogs')
    .select('title, slug, image_url, category')
    .eq('category', blog.category)
    .neq('slug', slug)
    .limit(3);

  // If no related posts in same category, just get latest
  const finalRelatedPosts = relatedPosts && relatedPosts.length > 0
    ? relatedPosts
    : (await supabase.from('blogs').select('title, slug, image_url, category').neq('slug', slug).limit(3)).data;

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
    'image': blog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000',
    'datePublished': blog.published_at,
    'author': {
      '@type': 'Person',
      'name': blog.author?.full_name || 'أدمن النظام',
    },
    'description': blog.excerpt,
  };

  // Calculate dynamic reading time
  const wordsPerMinute = 200;
  const wordCount = blog.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4 md:px-8 relative overflow-hidden" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgressBar />
      <TableOfContents headings={headings} />
      <SystemLog />

      {/* Enhanced Cyber Background & Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 neon-grid opacity-20 dark:opacity-10"></div>
        <div className="absolute inset-0 scanline opacity-30 dark:opacity-20 animate-scanline"></div>
        <div className="absolute top-0 right-0 w-full h-[1200px] bg-gradient-to-b from-primary-container/15 via-transparent to-transparent"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-secondary/5 blur-[180px] animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute inset-0 noise-bg opacity-[0.03]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Navigation Breadcrumb - Enhanced */}
        <div className="flex items-center gap-3 mb-16 text-[10px] font-black tracking-[0.2em] uppercase animate-fade-in">
          <Link href="/" className="px-4 py-2 glass border border-primary-container/20 text-foreground/60 hover:text-primary-container hover:border-primary-container/60 transition-all rounded-lg hover:shadow-lg hover:shadow-primary-container/20">MAIN</Link>
          <span className="text-primary-container/30">/</span>
          <Link href="/blog" className="px-4 py-2 glass border border-primary-container/20 text-foreground/60 hover:text-primary-container hover:border-primary-container/60 transition-all rounded-lg hover:shadow-lg hover:shadow-primary-container/20">INTEL_HUB</Link>
          <span className="text-primary-container/30">/</span>
          <span className="text-primary-container font-black drop-shadow-[0_0_10px_rgba(0,255,209,0.3)] px-4 py-2 bg-primary-container/5 border border-primary-container/20 rounded-lg">{blog.category?.toUpperCase() || 'GENERAL'}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Main Content Area */}
          <article className="lg:w-2/3 space-y-20">
            <header className="space-y-12">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 glass-cyan rounded-full text-primary-container text-[10px] font-black tracking-[0.2em] uppercase animate-glow-soft border border-primary-container/30 shadow-lg shadow-primary-container/10">
                  <span className="w-2.5 h-2.5 bg-primary-container rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,209,0.6)]"></span>
                  STRATEGIC ANALYSIS // AUTH_NODE_{blog.id.substring(0, 4)}
                </div>
                <h1 className="text-5xl md:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight animate-slide-up text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-container to-white cursor-default">
                  {blog.title}
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 font-light leading-relaxed animate-slide-up border-r-4 border-primary-container/40 pr-6 hover:border-primary-container/60 transition-colors" style={{ animationDelay: '0.1s' }}>
                  {blog.excerpt}
                </p>
              </div>

              <div className="flex flex-col md:flex-row flex-wrap items-center justify-between gap-8 py-12 border-y border-primary-container/15 relative bg-gradient-to-r from-primary-container/5 to-secondary/5 px-8 rounded-xl">
                <div className="absolute left-0 top-0 w-24 h-[2px] bg-gradient-to-r from-primary-container to-transparent"></div>
                <div className="absolute right-0 bottom-0 w-24 h-[2px] bg-gradient-to-l from-primary-container to-transparent"></div>

                <div className="flex items-center gap-6 group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary-container/30 bg-primary-container/5 flex items-center justify-center p-1 shadow-neon-sm relative hover:border-primary-container/60 transition-all duration-500">
                    <div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={blog.author?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                      alt={blog.author?.full_name || 'Admin'}
                      className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-xl tracking-tight hover:text-primary-container transition-colors cursor-default group-hover:translate-x-1">{blog.author?.full_name || 'أدمن النظام'}</h4>
                    <p className="text-[10px] text-primary-container font-black uppercase tracking-[0.2em] mt-1">Chief Intelligence Officer</p>
                    <p className="text-xs text-foreground/50 mt-2">{blog.author?.bio || 'تحليل الأسواق'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-10">
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">تم النشر في</span>
                    <span className="text-sm font-bold text-primary-container">{new Date(blog.published_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right border-r border-primary-container/20 pr-10">
                    <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">وقت القراءة</span>
                    <span className="text-sm font-bold flex items-center gap-2 justify-end">
                      <span className="text-primary-container">{readingTime} دقيقة</span>
                      <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,209,0.8)]"></span>
                    </span>
                  </div>
                </div>
              </div>
            </header>

            <div className="relative aspect-video rounded-3xl overflow-hidden border border-primary-container/25 group shadow-2xl hover:shadow-3xl hover:shadow-primary-container/40 transition-all duration-500">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary-container/20 blur-2xl group-hover:w-24 group-hover:h-24 transition-all duration-700"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/20 blur-2xl group-hover:w-24 group-hover:h-24 transition-all duration-700"></div>

              <img
                src={blog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'}
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-50"></div>

              <div className="absolute bottom-8 right-8 flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center gap-3 glass-strong px-5 py-3 rounded-lg border border-primary-container/40 shadow-lg shadow-primary-container/20">
                  <div className="w-2.5 h-2.5 bg-primary-container rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-primary-container tracking-widest uppercase">بيانات مشفرة</span>
                </div>
              </div>
            </div>

            <div className="prose prose-invert prose-primary max-w-none prose-xl selection:bg-primary-container/30">
              <div className="text-foreground/85 leading-[1.9] font-light space-y-14 text-justify">
                {contentWithIds.map((item: any, i: number) => {
                  if (item.type === 'heading') {
                    const Tag = item.level === 3 ? 'h3' : 'h2';
                    return (
                      <div key={i} className="relative">
                        <div className="absolute -right-4 top-0 w-1 h-12 bg-gradient-to-b from-primary-container to-transparent"></div>
                        <Tag
                          id={item.id}
                          className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-cyan-400 mt-20 mb-8 flex items-center gap-4 scroll-mt-32 tracking-tight"
                        >
                          <span className="w-1 h-10 bg-gradient-to-b from-primary-container to-secondary rounded-full"></span>
                          {item.text}
                        </Tag>
                      </div>
                    );
                  }
                  return (
                    <p key={i} className={`transition-colors hover:text-foreground ${i === 0 ? 'text-2xl md:text-3xl font-medium text-foreground leading-relaxed first-letter:text-primary-container first-letter:text-4xl first-letter:font-black first-letter:ml-3' : 'text-xl md:text-xl'}`}>
                      {item.text}
                    </p>
                  );
                })}
              </div>
            </div>

            <footer className="pt-16 border-t border-primary-container/15 flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-r from-primary-container/5 to-secondary/5 px-8 py-8 rounded-xl">
              <div className="flex items-center gap-8">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">شارك المعلومات</span>
                <div className="flex gap-4">
                  <ShareButton />
                </div>
              </div>
              <div className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">
                آخر تحديث: {new Date(blog.published_at).toLocaleDateString('ar-EG')}
              </div>
            </footer>
          </article>

          {/* Enhanced Sidebar */}
          <aside className="lg:w-1/3 space-y-12">
            {/* Intelligence Briefing / Subscription - Enhanced */}
            <div className="p-10 md:p-12 glass-cyan rounded-3xl border border-primary-container/40 relative overflow-hidden group shadow-2xl hover:shadow-3xl hover:shadow-primary-container/40 transition-all duration-500 sticky top-32">
              <div className="absolute top-[-30%] right-[-20%] w-96 h-96 bg-primary-container/25 blur-[120px] rounded-full group-hover:bg-primary-container/35 transition-all duration-700"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-secondary/15 blur-[100px] rounded-full group-hover:blur-[80px] transition-all duration-700"></div>

              <div className="relative z-10 space-y-10">
                <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center text-primary-container border-2 border-primary-container/40 shadow-neon-sm group-hover:shadow-neon transition-all">
                  <span className="material-symbols-outlined text-6xl animate-pulse">mail_outline</span>
                </div>
                <div className="space-y-6 text-right">
                  <h3 className="text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase bg-gradient-to-r from-white via-primary-container to-cyan-400 bg-clip-text text-transparent">الإحاطة الاستخبارية</h3>
                  <p className="text-lg text-foreground/75 font-light leading-relaxed">
                    انضم إلى النخبة واستقبل التقارير السرية حول تحركات السوق الكبرى مباشرة في شبكتك.
                  </p>
                </div>
                <div className="space-y-5">
                  <div className="relative group/input">
                    <input
                      type="email"
                      placeholder="NETWORK_ID@DOMAIN"
                      className="w-full bg-background/60 border-2 border-primary-container/25 rounded-2xl px-6 py-4 text-sm font-black tracking-widest outline-none focus:border-primary-container/80 focus:shadow-lg focus:shadow-primary-container/30 transition-all placeholder:opacity-40 placeholder:text-primary-container/40 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-container/10 to-secondary/10 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-primary-container to-cyan-400 hover:from-cyan-400 hover:to-primary-container text-background font-black py-5 rounded-2xl hover:shadow-[0_0_60px_rgba(0,255,209,0.8)] transition-all active:scale-95 text-lg uppercase tracking-tighter shadow-neon-lg group-hover:shadow-neon-xl">
                    تفعيل الوصول
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 glass border border-primary-container/20 rounded-2xl text-center hover:border-primary-container/40 transition-all hover:shadow-lg hover:shadow-primary-container/20">
                <div className="text-2xl font-black text-primary-container mb-2">{readingTime}</div>
                <p className="text-xs text-foreground/60 font-black uppercase tracking-widest">دقيقة قراءة</p>
              </div>
              <div className="p-6 glass border border-primary-container/20 rounded-2xl text-center hover:border-primary-container/40 transition-all hover:shadow-lg hover:shadow-primary-container/20">
                <div className="text-2xl font-black text-secondary mb-2">{wordCount}</div>
                <p className="text-xs text-foreground/60 font-black uppercase tracking-widest">كلمة</p>
              </div>
            </div>

            {/* Related Intel Feed - Enhanced */}
            <div className="space-y-10">
              <h4 className="text-xs font-black tracking-[0.5em] text-foreground/40 uppercase flex items-center gap-6 px-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
                  المقالات ذات الصلة
                </span>
                <span className="flex-grow h-[1px] bg-gradient-to-l from-primary-container/30 to-transparent"></span>
              </h4>
              <div className="space-y-8">
                {finalRelatedPosts?.map((post: any) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <div className="flex gap-6 items-start p-6 rounded-2xl border border-primary-container/15 hover:border-primary-container/40 bg-gradient-to-br from-primary-container/5 to-secondary/5 hover:from-primary-container/10 hover:to-secondary/10 transition-all hover:shadow-lg hover:shadow-primary-container/20">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-primary-container/20 relative flex-shrink-0 group-hover:border-primary-container/60 transition-all duration-500 shadow-neon-sm group-hover:shadow-neon">
                        <img
                          src={post.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300'}
                          alt={post.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-primary-container/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="space-y-3 text-right flex-1">
                        <span className="text-[10px] font-black text-primary-container uppercase tracking-widest inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-lg">{post.category}</span>
                        <h5 className="font-black leading-tight group-hover:text-primary-container transition-colors line-clamp-2 text-lg">{post.title}</h5>
                        <p className="text-xs text-foreground/50 line-clamp-1">اقرأ المزيد →</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags Widget */}
            {blog.category && (
              <div className="p-8 glass rounded-2xl border border-primary-container/20 hover:border-primary-container/40 transition-all">
                <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-4">الفئات</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-primary-container/10 border border-primary-container/30 text-primary-container font-black text-[10px] rounded-lg cursor-pointer hover:bg-primary-container/20 transition-all">#{blog.category}</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
