import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart'
import { Timeline, type TimelineEvent } from '@/components/dashboard/Timeline'
import { QuickActions, type QuickAction } from '@/components/dashboard/QuickActions'
import { EnhancedProfile } from '@/components/dashboard/EnhancedProfile'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'create-project', label: 'مشروع جديد', icon: 'add_circle', href: '/projects/new', color: 'primary', description: 'إنشاء مشروع استثماري جديد' },
  { id: 'view-messages', label: 'الرسائل', icon: 'mail', href: '/messages', color: 'secondary', description: 'عرض الرسائل من المستثمرين' },
  { id: 'kyc-upload', label: 'رفع وثائق', icon: 'document_scanner', href: '/kyc', color: 'tertiary', description: 'رفع وثائق التحقق' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings', href: '/settings', color: 'warning', description: 'إدارة حسابك وبيانات ملفك' },
]

function buildFundingChartData(investments: { amount: number; created_at: string }[]) {
  const monthly: Record<string, number> = {}
  for (const inv of investments) {
    const d = new Date(inv.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthly[key] = (monthly[key] ?? 0) + (inv.amount ?? 0)
  }
  return Object.entries(monthly).map(([key, value]) => ({
    month: new Date(`${key}-01`).toLocaleDateString('ar-SA', { month: 'short' }),
    value: Math.round((value / 1_000_000) * 10) / 10,
  }))
}

function buildInterestChartData(saved: { created_at: string }[]) {
  const monthly: Record<string, number> = {}
  for (const opp of saved) {
    const d = new Date(opp.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthly[key] = (monthly[key] ?? 0) + 1
  }
  return Object.entries(monthly).map(([key, value]) => ({
    month: new Date(`${key}-01`).toLocaleDateString('ar-SA', { month: 'short' }),
    value,
  }))
}

export default async function FounderDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, projectsResult, messagesResult, kycResult] = await Promise.all([
    supabase.from('profiles').select('full_name, bio, avatar_url, location, kyc_status').eq('id', user.id).single(),
    supabase.from('projects').select('id, title, description, category, funding_goal, amount_raised, status, image_url, created_at, verified').eq('founder_id', user.id).order('created_at', { ascending: false }),
    supabase.from('messages').select('id, content, read, sender:profiles(full_name, avatar_url)').eq('receiver_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('kyc_documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const profile = profileResult.data
  const projects = projectsResult.data ?? []
  const messages = messagesResult.data ?? []
  const mainProject = projects[0] ?? null

  const [interestResult, investmentCountResult, investmentsChartResult, savedOppsResult] = await Promise.all([
    mainProject
      ? supabase.from('saved_opportunities').select('id', { count: 'exact', head: true }).eq('project_id', mainProject.id)
      : Promise.resolve({ count: 0 }),
    mainProject
      ? supabase.from('investments').select('id', { count: 'exact', head: true }).eq('project_id', mainProject.id)
      : Promise.resolve({ count: 0 }),
    mainProject
      ? supabase.from('investments').select('amount, created_at').eq('project_id', mainProject.id).order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    mainProject
      ? supabase.from('saved_opportunities').select('created_at').eq('project_id', mainProject.id).order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),
  ])

  const interestCount = interestResult.count ?? 0
  const investmentCount = investmentCountResult.count ?? 0
  const fundingProgress = mainProject
    ? Math.min(100, Math.round((mainProject.amount_raised / mainProject.funding_goal) * 100))
    : 0

  const fundingChartData = buildFundingChartData(investmentsChartResult.data ?? [])
  const interestChartData = buildInterestChartData(savedOppsResult.data ?? [])

  const timelineEvents: TimelineEvent[] = mainProject
    ? [{ id: mainProject.id, date: new Date(mainProject.created_at), title: 'إنشاء المشروع', description: `تم إنشاء مشروع "${mainProject.title}"`, type: 'milestone' }]
    : []

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-secondary/5 pointer-events-none z-0" />

      <Navbar />
      <DashboardSidebar />

      <main className="xl:mr-72 pt-20 pb-32 px-6 md:px-8 lg:px-10 max-w-6xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 pb-8 border-b border-border/50">
          <div className="text-right flex-1">
            <h2 className="font-headline text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-2">لوحة تحكم صاحب الفكرة</h2>
            <p className="text-foreground/70 font-body mt-2 max-w-md text-sm leading-relaxed">مرحباً {profile?.full_name ?? 'مستخدم'}. إليك نظرة شاملة على أداء مشاريعك.</p>
          </div>
          <div className="flex gap-4">
            <Link
              href={mainProject ? `/projects/${mainProject.id}/edit` : '/projects/new'}
              className="clip-button bg-surface-container-high/40 backdrop-blur-md px-6 py-3 border border-outline-variant/10 text-primary-container font-headline font-bold flex items-center gap-2 hover:bg-surface-container-high transition-all uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-primary-container/20"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>{mainProject ? 'تعديل المشروع' : 'مشروع جديد'}</span>
            </Link>
          </div>
        </div>

        <div className="mb-16">
          <EnhancedProfile
            profile={{
              id: user.id,
              name: profile?.full_name ?? 'مستخدم',
              role: 'founder',
              avatar: profile?.avatar_url,
              bio: profile?.bio,
              location: profile?.location,
              stats: [
                { label: 'المشاريع', value: projects.length },
                { label: 'الوثائق', value: kycResult.count ?? 0 },
                { label: 'الرسائل', value: messages.length },
                { label: 'الاهتمام', value: interestCount },
              ],
              badges: profile?.kyc_status === 'verified'
                ? [{ label: 'مُتحقق منه', icon: 'verified', color: 'bg-green-500/10 border-green-500/30 text-green-400' }]
                : [],
            }}
          />
        </div>

        <div className="mb-16">
          <QuickActions actions={QUICK_ACTIONS} title="الإجراءات السريعة" />
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Project Card */}
          <div className="col-span-12 lg:col-span-8 relative bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-8 border border-outline-variant/20 overflow-hidden group hover:border-primary-container/40 hover:shadow-lg hover:shadow-primary-container/10 transition-all rounded-3xl">
            {mainProject ? (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 aspect-square bg-[#0a0e15] border border-primary-container/20 relative overflow-hidden rounded-xl">
                  <Image
                    alt={mainProject.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110"
                    src={mainProject.image_url ?? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className="absolute bottom-4 right-4">
                    <span className={`text-[10px] px-3 py-1 border font-headline font-black uppercase tracking-widest rounded-lg ${mainProject.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-primary-container/20 text-primary-container border-primary-container/40'}`}>
                      {mainProject.status === 'active' ? 'نشط' : 'قيد التطوير'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <h3 className="font-headline text-3xl font-black text-primary-container mb-2 uppercase tracking-tight">{mainProject.title}</h3>
                  <p className="text-foreground/85 font-body text-sm leading-relaxed mb-6">{mainProject.description ?? 'لا توجد وصف للمشروع حالياً'}</p>

                  <div className="mb-6 pb-6 border-b border-outline-variant/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-foreground/80 font-headline font-bold uppercase">تقدم التمويل</span>
                      <span className="text-sm font-data font-black text-primary-container">{fundingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-primary-container to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${fundingProgress}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'التمويل المطلوب', value: `${(mainProject.funding_goal / 1_000_000).toFixed(2)}M`, color: 'text-foreground' },
                      { label: 'المبلغ المجمع', value: `${(mainProject.amount_raised / 1_000_000).toFixed(2)}M`, color: 'text-primary-container' },
                      { label: 'اهتمام المستثمرين', value: String(interestCount), color: 'text-secondary-container' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-right">
                        <p className="text-[10px] text-foreground/60 uppercase tracking-widest font-headline font-bold mb-2">{label}</p>
                        <span className={`font-data text-xl font-black ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-foreground/50 block mb-4">folder_open</span>
                <h3 className="font-headline text-2xl font-black text-foreground mb-3">لا يوجد مشروع حالي</h3>
                <p className="text-foreground/85 font-body text-base mb-6 max-w-md mx-auto">قم بإنشاء مشروعك الأول للبدء في تلقي التمويل والتواصل مع المستثمرين.</p>
                <Link href="/projects/new" className="inline-flex items-center gap-2 bg-primary-container text-background px-6 py-3 font-headline font-black hover:brightness-110 transition-all uppercase tracking-tighter text-sm">
                  <span className="material-symbols-outlined text-base">add</span>
                  إنشاء مشروع
                </Link>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-surface-container-high/60 to-surface-container-high/30 backdrop-blur-md p-8 border border-outline-variant/20 rounded-3xl flex flex-col gap-8 hover:border-primary-container/40 hover:shadow-lg hover:shadow-primary-container/10 transition-all">
            {[
              { label: 'عدد الاستثمارات', value: investmentCount, color: 'text-primary-container' },
              { label: 'الاهتمام الكلي', value: interestCount, color: 'text-secondary-container' },
              { label: 'حالة KYC', value: profile?.kyc_status === 'verified' ? 'مُتحقق' : 'في الانتظار', color: profile?.kyc_status === 'verified' ? 'text-green-400' : 'text-yellow-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="border-b border-outline-variant/10 pb-4 last:border-0 last:pb-0">
                <p className="text-xs text-foreground/60 font-headline uppercase tracking-widest mb-1">{label}</p>
                <p className={`font-data text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          {fundingChartData.length > 0 && (
            <div className="col-span-12 lg:col-span-6">
              <AnalyticsChart title="تقدم التمويل" type="line" data={fundingChartData} subtitle="جمع التمويل بالملايين شهرياً" height={300} />
            </div>
          )}
          {interestChartData.length > 0 && (
            <div className="col-span-12 lg:col-span-6">
              <AnalyticsChart title="اهتمام المستثمرين" type="bar" data={interestChartData} subtitle="عدد المهتمين شهرياً" height={300} />
            </div>
          )}

          {/* Messages */}
          <div className="col-span-12 lg:col-span-7 bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-8 border border-outline-variant/20 rounded-3xl hover:border-primary-container/40 hover:shadow-lg hover:shadow-primary-container/10 transition-all">
            <div className="flex items-center justify-between mb-6">
              <Link className="text-[10px] text-foreground/60 hover:text-primary-container underline underline-offset-4 uppercase font-headline font-black" href="/messages">عرض الكل</Link>
              <h4 className="font-headline font-bold text-primary-container flex items-center gap-2 uppercase tracking-widest">
                <span className="material-symbols-outlined">history</span>
                الرسائل الأخيرة ({messages.length})
              </h4>
            </div>
            <div className="space-y-3">
              {messages.length > 0 ? messages.map((msg) => (
                <div key={msg.id} className="flex items-center gap-4 p-4 bg-surface-container-high/30 hover:bg-surface-container-high/60 transition-all rounded-lg group border border-white/5 hover:border-primary-container/20">
                  <span className="material-symbols-outlined text-foreground/50 group-hover:text-primary-container transition-colors text-sm">arrow_forward_ios</span>
                  <div className="flex-1 text-right min-w-0">
                    <p className="font-headline text-sm font-bold text-foreground uppercase tracking-tight">
                      {(msg.sender as { full_name?: string } | null)?.full_name ?? 'رسالة جديدة'}
                    </p>
                    <p className="text-[11px] text-foreground/60 font-body line-clamp-1">{msg.content}</p>
                  </div>
                  <div className={`w-10 h-10 rounded flex items-center justify-center border flex-shrink-0 ${msg.read ? 'bg-surface-container-high border-white/10' : 'bg-primary-container/10 border-primary-container/30'}`}>
                    <span className={`material-symbols-outlined text-sm ${msg.read ? 'text-slate-500' : 'text-primary-container'}`}>mail</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-foreground/60 text-sm">
                  <span className="material-symbols-outlined text-4xl text-foreground/50 block mb-3">inbox</span>
                  لا توجد رسائل جديدة حالياً.
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          {timelineEvents.length > 0 && (
            <div className="col-span-12 bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-8 border border-outline-variant/20 rounded-3xl hover:border-primary-container/40 hover:shadow-lg hover:shadow-primary-container/10 transition-all">
              <Timeline events={timelineEvents} title="سجل الأحداث" />
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-16 bg-gradient-to-r from-surface-container-lowest/50 to-surface-container-lowest/30 border border-outline-variant/20 p-8 flex flex-wrap justify-between items-center gap-8 backdrop-blur-md rounded-3xl hover:border-primary-container/30 hover:shadow-lg hover:shadow-primary-container/5 transition-all">
          <div className="flex gap-8">
            {[
              { label: 'عدد المشاريع', value: projects.length, color: 'text-primary-container' },
              { label: 'الوثائق المرفوعة', value: kycResult.count ?? 0, color: 'text-foreground' },
              { label: 'إجمالي الرسائل', value: messages.length, color: 'text-foreground' },
            ].map(({ label, value, color }, i, arr) => (
              <div key={label} className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-foreground/60 mb-1 font-headline font-bold uppercase">{label}</p>
                  <p className={`font-data font-black text-xl ${color}`}>{value}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-foreground/10" />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="font-headline text-[10px] font-black text-foreground/70 uppercase tracking-widest">متصل</span>
          </div>
        </div>
      </main>
    </div>
  )
}
