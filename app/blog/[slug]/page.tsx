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
            <header className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-4 px-4 py-1.5 glass-cyan rounded-full text-primary-container text-[10px] font-black tracking-[0.2em] uppercase animate-glow-soft">
                  <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
                  STRATEGIC ANALYSIS // AUTH_NODE_{blog.id.substring(0, 4)}
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight animate-slide-up text-glitch cursor-default">
                  {blog.title}
                </h1>
                <p className="text-2xl text-foreground/70 font-light leading-relaxed animate-slide-up border-r-4 border-primary-container/30 pr-6" style={{ animationDelay: '0.1s' }}>
                  {blog.excerpt}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-8 py-10 border-y border-primary-container/10 relative">
                <div className="absolute left-0 top-0 w-24 h-[1px] bg-gradient-to-r from-primary-container to-transparent"></div>
                <div className="absolute right-0 bottom-0 w-24 h-[1px] bg-gradient-to-l from-primary-container to-transparent"></div>
                
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary-container/30 bg-primary-container/5 flex items-center justify-center p-1 group shadow-neon-sm relative">
                    <div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img 
                      src={blog.author?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                      alt={blog.author?.full_name || 'Admin'}
                      className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-xl tracking-tight hover:text-primary-container transition-colors cursor-default">{blog.author?.full_name || 'أدمن النظام'}</h4>
                    <p className="text-[10px] text-primary-container font-black uppercase tracking-[0.2em] mt-1">Chief Intelligence Officer</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Published</span>
                    <span className="text-sm font-bold">{new Date(blog.published_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Est. Reading Time</span>
                    <span className="text-sm font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse"></span>
                      {readingTime} دقيقة قراءة
                    </span>
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
                        className="text-4xl font-black text-primary-container mt-20 mb-8 flex items-center gap-4 scroll-mt-32"
                      >
                        <span className="w-8 h-[2px] bg-primary-container/30"></span>
                        {item.text}
                      </Tag>
                    );
                  }
                  return (
                    <p key={i} className={`text-xl md:text-2xl ${i === 0 ? 'text-3xl font-medium text-foreground leading-relaxed' : ''}`}>
                      {item.text}
                    </p>
                  );
                })}
              </div>
            </div>
            <footer className="pt-16 border-t border-primary-container/10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">SHARE INTEL</span>
                <div className="flex gap-4">
                  <ShareButton />
                </div>
              </div>
            </footer>
          </article>

          {/* Sidebar - Enhanced */}
          <aside className="lg:w-1/3 space-y-16">
            {/* Intelligence Briefing / Subscription */}
            <div className="p-12 glass-cyan rounded-[3.5rem] border border-primary-container/30 relative overflow-hidden group shadow-2xl sticky top-32">
              <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-primary-container/30 blur-[100px] rounded-full group-hover:bg-primary-container/40 transition-all duration-700"></div>
              <div className="relative z-10 space-y-10">
                <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-primary-container border-primary-container/40 shadow-neon-sm">
                  <span className="material-symbols-outlined text-5xl animate-pulse">mail</span>
                </div>
                <div className="space-y-6 text-right">
                  <h3 className="text-4xl font-black leading-tight tracking-tight uppercase">Intelligence Briefing</h3>
                  <p className="text-xl text-foreground/70 font-light leading-relaxed">
                    انضم إلى النخبة واستقبل التقارير السرية حول تحركات السوق الكبرى مباشرة في شبكتك.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="NETWORK_ID@DOMAIN"
                      className="w-full bg-background/80 border-2 border-primary-container/20 rounded-2xl px-8 py-5 text-sm font-black tracking-widest outline-none focus:border-primary-container transition-all placeholder:opacity-30 shadow-inner"
                    />
                  </div>
                  <button className="w-full bg-primary-container text-background font-black py-6 rounded-2xl hover:shadow-[0_0_50px_rgba(0,255,209,0.6)] transition-all active:scale-95 text-xl uppercase tracking-tighter shadow-neon-sm">
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

          </aside>
        </div>
      </div>
    </main>
  );
}

