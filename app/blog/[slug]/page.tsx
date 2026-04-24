import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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

  // Fetch related posts
  const { data: relatedPosts } = await supabase
    .from('blogs')
    .select('title, slug, image_url, category')
    .neq('slug', slug)
    .limit(3);

  return (
    <main className="min-h-screen bg-[#020408] text-foreground pt-32 pb-20 px-4 md:px-8 relative overflow-hidden" dir="rtl">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none -z-10"></div>
      <div className="absolute top-0 right-0 w-full h-[800px] bg-gradient-to-b from-primary-container/10 via-transparent to-transparent pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4 mb-12 text-sm font-bold text-foreground/40 animate-fade-in">
          <Link href="/" className="hover:text-primary-container transition-colors">الرئيسية</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_left</span>
          <Link href="/blog" className="hover:text-primary-container transition-colors">المدونة</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_left</span>
          <span className="text-primary-container">{blog.category}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <article className="lg:w-2/3 space-y-12">
            <header className="space-y-6">
              <div className="flex items-center gap-4 text-xs font-black tracking-widest text-primary-container uppercase">
                <span className="px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-sm">تحليل سيادي</span>
                <span className="text-foreground/40 font-bold">{new Date(blog.published_at).toLocaleDateString('ar-EG')}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                {blog.title}
              </h1>
              
              <div className="flex items-center justify-between py-8 border-y border-primary-container/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary-container/30 bg-primary-container/5 flex items-center justify-center p-0.5">
                    <img 
                      src={blog.author?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                      alt={blog.author?.full_name || 'Admin'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{blog.author?.full_name || 'د. كمال السيادي'}</h4>
                    <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest">خبير في الذكاء الاصطناعي</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-foreground/40">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-xs font-bold uppercase tracking-widest">12 دقيقة قراءة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span className="text-xs font-bold tracking-widest">2.4K مشاهدة</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="relative aspect-video rounded-3xl overflow-hidden border border-primary-container/20 group">
              <img 
                src={blog.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'} 
                alt={blog.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 font-data text-[10px] text-primary-container tracking-tighter opacity-50">
                AL_COMMAND_SECURE_NODE: {blog.id.substring(0, 8)}
              </div>
            </div>

            <div className="prose prose-invert prose-primary max-w-none prose-lg">
              <p className="text-xl text-foreground/80 leading-relaxed font-medium">
                {blog.content}
              </p>
              
              <div className="my-12 p-10 bg-primary-container/5 border-r-4 border-primary-container rounded-2xl relative overflow-hidden group">
                <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary-container/10 blur-[80px] group-hover:bg-primary-container/20 transition-all duration-700"></div>
                <span className="material-symbols-outlined text-primary-container text-5xl mb-6 opacity-30">format_quote</span>
                <p className="text-2xl font-black italic relative z-10 leading-snug">
                  "إن الذكاء الاصطناعي لا يحل محل المستثمر، بل يمنحه مجهراً رقمياً يرى من خلاله فرصاً كانت غير مرئية في السابق."
                </p>
              </div>

              {/* Data Visualization Mock */}
              <div className="my-12 p-8 glass rounded-3xl border border-primary-container/20">
                <h4 className="text-lg font-bold text-primary-container mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
                  مؤشرات الأداء الربعي (Q4)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="text-xs font-bold text-foreground/40 uppercase tracking-widest border-b border-primary-container/10">
                        <th className="pb-4">المؤشر</th>
                        <th className="pb-4">الحالي</th>
                        <th className="pb-4">السابق</th>
                        <th className="pb-4">التغيير</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                      <tr className="border-b border-primary-container/5 hover:bg-primary-container/5 transition-colors">
                        <td className="py-4">القدرة التوقعية</td>
                        <td className="py-4 font-bold tracking-tighter">98.4%</td>
                        <td className="py-4 text-foreground/40">94.2%</td>
                        <td className="py-4 text-primary-container font-bold">+4.2%</td>
                      </tr>
                      <tr className="border-b border-primary-container/5 hover:bg-primary-container/5 transition-colors">
                        <td className="py-4">زمن اتخاذ القرار</td>
                        <td className="py-4 font-bold tracking-tighter">12.5ms</td>
                        <td className="py-4 text-foreground/40">45.0ms</td>
                        <td className="py-4 text-secondary font-bold">-72%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <footer className="pt-12 border-t border-primary-container/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low border border-primary-container/10 hover:border-primary-container/50 transition-all">
                  <img src="https://www.svgrepo.com/show/448234/linkedin.svg" alt="LinkedIn" className="w-5 h-5 opacity-60" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-low border border-primary-container/10 hover:border-primary-container/50 transition-all">
                  <img src="https://www.svgrepo.com/show/448251/twitter.svg" alt="Twitter" className="w-5 h-5 opacity-60" />
                </button>
              </div>
              <div className="flex gap-2">
                {['استثمار', 'ذكاء_اصطناعي', 'عقارات', 'سيادة_رقمية'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-foreground/5 rounded-full text-[10px] font-bold text-foreground/40 hover:text-primary-container cursor-pointer transition-colors">#{tag}</span>
                ))}
              </div>
            </footer>

            {/* Comments Section */}
            <section className="pt-20 space-y-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">forum</span>
                نقاشات الخبراء (3)
              </h3>
              
              <div className="space-y-6">
                {[1].map(c => (
                  <div key={c} className="p-6 glass rounded-2xl border border-primary-container/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-primary-container/30 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">م. ليلى السيف</p>
                          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">محلل استراتيجي</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-foreground/40 font-bold">منذ 3 ساعات</span>
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      هل تعتقد أن دمج تقنيات ZK-Proofs سيؤدي إلى شفافية أعلى في معاملات المزادات دون الكشف عن هوية المستثمر السيادي؟
                    </p>
                    <div className="flex gap-4 pt-2">
                      <button className="flex items-center gap-1 text-[10px] font-bold text-primary-container/60 hover:text-primary-container transition-colors">
                        <span className="material-symbols-outlined text-xs">thumb_up</span>
                        12 أعجبهم
                      </button>
                      <button className="flex items-center gap-1 text-[10px] font-bold text-foreground/40 hover:text-primary-container transition-colors">
                        <span className="material-symbols-outlined text-xs">reply</span>
                        رد
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 glass rounded-2xl border border-primary-container/20 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary-container via-transparent to-transparent"></div>
                <h4 className="font-bold">أضف تحليلك الخاص</h4>
                <textarea 
                  className="w-full h-32 bg-background/50 border border-primary-container/10 rounded-xl p-4 text-sm focus:border-primary-container/40 outline-none transition-all placeholder:text-foreground/20"
                  placeholder="اكتب تعليقك هنا..."
                ></textarea>
                <button className="bg-primary-container text-background font-bold px-8 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all active:scale-95 text-sm">
                  نشر التعليق
                </button>
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-1/3 space-y-12">
            {/* Newsletter */}
            <div className="p-8 glass-cyan rounded-3xl border border-primary-container/30 relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary-container/20 blur-[100px] rounded-full group-hover:bg-primary-container/30 transition-all duration-700"></div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black leading-tight">البقاء على اطلاع</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  اشترك في نشرتنا السيادية الدورية لتصلك أحدث تقارير AL-COMMAND قبل الجميع.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="بريدك الإلكتروني"
                    className="w-full bg-background/60 border border-primary-container/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-container transition-all"
                  />
                  <button className="w-full bg-primary-container text-background font-black py-3 rounded-xl hover:shadow-[0_8px_32px_rgba(0,255,209,0.4)] transition-all active:scale-95 text-sm uppercase tracking-tighter">
                    اشتراك الآن
                  </button>
                </div>
              </div>
            </div>

            {/* Trending Insights */}
            <div className="space-y-6">
              <h4 className="text-xs font-black tracking-[0.2em] text-foreground/40 uppercase flex items-center gap-4">
                TRENDING INSIGHTS
                <span className="flex-grow h-[1px] bg-primary-container/10"></span>
              </h4>
              <div className="space-y-8">
                {relatedPosts?.map((post, idx) => (
                  <Link key={idx} href={`/blog/${post.slug}`} className="group flex gap-4">
                    <div className="w-24 h-20 rounded-xl overflow-hidden border border-primary-container/10 flex-shrink-0">
                      <img src={post.image_url || ''} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-primary-container uppercase tracking-tighter">{post.category}</span>
                      <h5 className="font-bold text-sm leading-snug group-hover:text-primary-container transition-colors line-clamp-2">
                        {post.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Market Indicators */}
            <div className="p-6 border border-primary-container/10 rounded-3xl space-y-6">
               <div className="flex items-center justify-between">
                 <h4 className="text-xs font-black tracking-widest text-foreground/40 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">monitoring</span>
                   حالة السوق الحالية
                 </h4>
                 <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
               </div>
               <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                      <span>مستوى النشاط</span>
                      <span className="text-primary-container uppercase">HIGH</span>
                    </div>
                    <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-primary-container"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                      <span>كثافة المزايدة</span>
                      <span className="text-secondary uppercase">LOW_RISK</span>
                    </div>
                    <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="w-[32%] h-full bg-secondary"></div>
                    </div>
                 </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
