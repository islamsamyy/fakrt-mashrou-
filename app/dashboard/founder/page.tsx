import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function FounderDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch founder's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch founder's projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('founder_id', user.id)
    .order('created_at', { ascending: false });

  const mainProject = projects && projects.length > 0 ? projects[0] : null;
  const projectCount = projects?.length || 0;

  // Fetch recent messages directed to this founder
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles(full_name, avatar_url)')
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch investor interest (saved_opportunities count)
  let interestCount = 0;
  let savedCount = 0;
  if (mainProject) {
    const { count: interest } = await supabase
      .from('saved_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', mainProject.id);
    interestCount = interest || 0;

    // Fetch investments for this project
    const { count: investments } = await supabase
      .from('investments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', mainProject.id);
    savedCount = investments || 0;
  }

  // Fetch KYC documents count
  const { data: kycDocs } = await supabase
    .from('kyc_documents')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);
  const docCount = kycDocs?.length || 0;

  // Calculate funding progress
  const fundingProgress = mainProject ? Math.min(100, Math.round((mainProject.amount_raised / mainProject.funding_goal) * 100)) : 0;
  const amountRaised = mainProject?.amount_raised || 0;

  // Calculate AI recommendation score (based on project metrics)
  let aiScore = 85;
  if (mainProject) {
    if (mainProject.verified) aiScore += 10;
    if (profile?.kyc_status === 'verified') aiScore = Math.min(100, aiScore);
    if (fundingProgress > 50) aiScore = Math.min(100, aiScore + 5);
  }
  aiScore = Math.min(100, aiScore);

  // Get messages count
  const messageCount = messages?.length || 0;

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      {/* Global Background Elements */}
      <div className="fixed inset-0 hex-grid pointer-events-none z-0"></div>
      <div className="fixed inset-0 scanline pointer-events-none z-0 opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-secondary/5 pointer-events-none z-0"></div>

      <Navbar />
      <DashboardSidebar />

      {/* Main Content Canvas */}
      <main className="xl:mr-64 pt-32 pb-32 px-6 max-w-7xl mx-auto z-10 relative">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-right">
            <h2 className="font-headline text-3xl md:text-4xl font-black text-white uppercase tracking-tight">لوحة تحكم صاحب الفكرة</h2>
            <p className="text-slate-400 font-body mt-3 max-w-md">مرحباً بك {profile?.full_name || 'مستخدم'}. إليك نظرة شاملة على أداء مشاريعك والاستثمارات المتلقاة.</p>
          </div>
          <div className="flex gap-4">
            <Link
              href={mainProject ? `/projects/${mainProject.id}/edit` : '/projects/new'}
              className="clip-button bg-surface-container-high/40 backdrop-blur-md px-6 py-3 border border-outline-variant/10 text-primary-container font-headline font-bold flex items-center gap-2 hover:bg-surface-container-high transition-all uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-primary-container/20"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>{mainProject ? 'تعديل المشروع' : 'مشروع جديد'}</span>
            </Link>
            <Link
              href={mainProject ? `/dashboard/founder/analytics` : '#'}
              className={`clip-button ${mainProject ? 'bg-primary-container text-background' : 'bg-slate-700/40 text-slate-400 cursor-not-allowed'} px-6 py-3 font-headline font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_24px_rgba(0,255,209,0.15)] uppercase tracking-widest text-xs`}
            >
              <span className="material-symbols-outlined text-sm">bar_chart</span>
              <span>عرض التقرير</span>
            </Link>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Project Card (Large) */}
          <div className="col-span-12 lg:col-span-8 relative bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-8 border border-outline-variant/20 overflow-hidden group hover:border-primary-container/40 transition-all rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {mainProject ? (
              <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                <div className="w-full md:w-1/3 aspect-square bg-[#0a0e15] border border-primary-container/20 relative overflow-hidden rounded-xl">
                  <Image
                    alt={mainProject.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110"
                    src={mainProject.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 right-4">
                    <span className={`text-[10px] px-3 py-1 border font-headline font-black uppercase tracking-widest rounded-lg ${mainProject.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-primary-container/20 text-primary-container border-primary-container/40'}`}>
                      {mainProject.status === 'active' ? 'نشط' : 'قيد التطوير'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-headline text-3xl font-black text-primary-container mb-2 uppercase tracking-tight">
                    {mainProject.title}
                  </h3>
                  <p className="text-slate-400 font-body leading-relaxed mb-6 text-sm">
                    {mainProject.description || 'لا توجد وصفة للمشروع حالياً'}
                  </p>

                  {/* Funding Progress Bar */}
                  <div className="mb-6 pb-6 border-b border-outline-variant/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-slate-500 font-headline font-bold uppercase">تقدم التمويل</span>
                      <span className="text-sm font-data font-black text-primary-container">{fundingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-primary-container to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${fundingProgress}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-headline font-bold mb-2">التمويل المطلوب</p>
                      <div className="flex items-end justify-end gap-1">
                        <span className="font-data text-lg md:text-xl font-black text-white">${(mainProject.funding_goal / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-headline font-bold mb-2">المبلغ المجمع</p>
                      <div className="flex items-end justify-end gap-1">
                        <span className="font-data text-lg md:text-xl font-black text-primary-container">${(amountRaised / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-headline font-bold mb-2">اهتمام المستثمرين</p>
                      <div className="flex items-end justify-end gap-1">
                        <span className="font-data text-lg md:text-xl font-black text-secondary-container">{interestCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <span className="material-symbols-outlined text-6xl text-slate-600">folder_open</span>
                </div>
                <h3 className="font-headline text-2xl font-black text-white mb-3">لا يوجد مشروع حالي</h3>
                <p className="text-slate-400 font-body mb-6 max-w-md mx-auto">قم بإنشاء مشروعك الأول للبدء في تلقي التمويل والتواصل مع المستثمرين.</p>
                <Link href="/projects/new" className="inline-flex items-center gap-2 bg-primary-container text-background px-6 py-3 font-headline font-black hover:brightness-110 transition-all uppercase tracking-tighter text-sm">
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>إنشاء مشروع</span>
                </Link>
              </div>
            )}
          </div>

          {/* AI Gauge Card */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-surface-container-high/60 to-surface-container-high/30 backdrop-blur-md p-8 border border-outline-variant/20 relative overflow-hidden flex flex-col items-center justify-center group hover:border-secondary/40 transition-all rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h4 className="font-headline text-slate-400 text-sm font-bold mb-8 uppercase tracking-widest relative z-10">تقييم AI</h4>
            <div className="relative w-48 h-48 mb-6 relative z-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle className="text-background" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-secondary-container" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray={`${(aiScore / 100) * 552.92} 552.92`} strokeWidth="8" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 127, 80, 0.6))' }}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-data text-5xl font-black text-secondary-container">{aiScore}%</span>
                <span className="text-[10px] text-slate-500 font-headline font-black uppercase tracking-widest mt-2">
                  {aiScore >= 90 ? 'ممتاز' : aiScore >= 80 ? 'جيد جداً' : aiScore >= 70 ? 'جيد' : 'متوسط'}
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 font-body relative z-10">
              {mainProject ? `تحليل AI يشير إلى جاهزية عالية للتمويل${aiScore > 85 ? ' مع فرصة قوية للنمو' : ''}` : 'قم بإنشاء مشروع لرؤية تقييم AI'}
            </p>
          </div>

          {/* Latest Activity Feed */}
          <div className="col-span-12 lg:col-span-7 bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-6 border border-outline-variant/20 relative rounded-2xl hover:border-primary-container/40 transition-all">
            <div className="flex items-center justify-between mb-6">
              <a className="text-[10px] text-slate-500 hover:text-primary-container underline underline-offset-4 uppercase font-headline font-black" href="/messages">عرض الكل</a>
              <h4 className="font-headline font-bold text-primary-container flex items-center gap-2 uppercase tracking-widest">
                <span className="material-symbols-outlined">history</span>
                الرسائل الأخيرة ({messageCount})
              </h4>
            </div>
            <div className="space-y-3">
              {messages && messages.length > 0 ? (
                messages.map((msg: { id: string; content: string; read: boolean; sender?: any }, i: number) => (
                  <div key={msg.id || i} className="flex items-center gap-4 p-4 bg-surface-container-high/30 hover:bg-surface-container-high/60 transition-all rounded-lg group border border-white/5 hover:border-primary-container/20">
                    <span className="material-symbols-outlined text-slate-600 group-hover:text-primary-container transition-colors text-sm">arrow_forward_ios</span>
                    <div className="flex-1 text-right min-w-0">
                      <p className="font-headline text-sm font-bold text-white uppercase tracking-tight">
                        {msg.sender?.full_name || 'رسالة جديدة'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-body line-clamp-1">{msg.content || 'رسالة جديدة من مستثمر'}</p>
                    </div>
                    <div className={`w-10 h-10 rounded flex items-center justify-center border transition-all flex-shrink-0 ${msg.read ? 'bg-surface-container-high border-white/10' : 'bg-primary-container/10 border-primary-container/30'}`}>
                      <span className={`material-symbols-outlined text-sm ${msg.read ? 'text-slate-500' : 'text-primary-container'}`}>mail</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-4xl text-slate-600 block mb-3">inbox</span>
                  لا توجد رسائل جديدة حالياً.
                </div>
              )}
            </div>
          </div>

          {/* Market Insight Card */}
          <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-surface-container-high/60 to-surface-container-high/30 backdrop-blur-md p-6 relative flex flex-col justify-between group overflow-hidden border border-outline-variant/20 rounded-2xl hover:border-secondary/40 transition-all">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl">trending_up</span>
            </div>
            <div className="text-right relative z-10">
              <span className="bg-secondary-container text-white text-[10px] font-headline font-black px-3 py-1 mb-4 inline-block uppercase tracking-widest rounded-lg">رؤية استثمارية</span>
              <h4 className="font-headline text-xl font-bold text-white mb-3 uppercase tracking-tight">حالة السوق الحالية</h4>
              <p className="text-slate-400 text-sm font-body leading-relaxed mb-6">
                {mainProject?.category === 'real-estate'
                  ? 'نشاط سوق العقار الرقمي في ارتفاع مستمر مع زيادة الطلب من المستثمرين الخليجيين.'
                  : mainProject?.category === 'technology'
                  ? 'قطاع التكنولوجيا يشهد نمواً متسارعاً مع تزايد الاستثمارات المحلية.'
                  : 'السوق يشهد فرصاً متعددة للمشاريع الناشئة والابتكارات التكنولوجية.'}
              </p>
            </div>
            <div className="bg-background/40 backdrop-blur-md p-4 border-r-2 border-secondary-container text-right rounded-lg">
              <p className="text-secondary-container font-black font-data text-2xl mb-1">+18.5%</p>
              <p className="text-[10px] text-slate-500 font-headline font-bold uppercase tracking-widest border-t border-white/5 pt-1">فرصة النمو المتاحة</p>
            </div>
          </div>
        </div>

        {/* Footer Stats Bar */}
        <div className="mt-12 bg-gradient-to-r from-surface-container-lowest/50 to-surface-container-lowest/30 border border-outline-variant/20 p-6 flex flex-wrap justify-between items-center gap-8 backdrop-blur-md rounded-2xl">
          <div className="flex gap-8 order-2 md:order-1">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 mb-1 font-headline font-bold uppercase">عدد المشاريع</p>
              <p className="font-data font-black text-primary-container text-xl">{projectCount}</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 mb-1 font-headline font-bold uppercase">الوثائق المرفوعة</p>
              <p className="font-data font-black text-white text-xl">{docCount}</p>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 mb-1 font-headline font-bold uppercase">إجمالي الرسائل</p>
              <p className="font-data font-black text-white text-xl">{messageCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 order-1 md:order-2 ml-auto">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-sm">schedule</span>
              <span className="font-data text-[10px] text-slate-400">LAST SYNC: {new Date().toLocaleTimeString('ar-SA')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              <span className="font-headline text-[10px] font-black text-slate-400 uppercase tracking-widest">متصل</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
