import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { PortfolioBreakdownChart } from '@/components/dashboard/AnalyticsChart'
import { Timeline, type TimelineEvent } from '@/components/dashboard/Timeline'
import { QuickActions, type QuickAction } from '@/components/dashboard/QuickActions'
import { EnhancedProfile } from '@/components/dashboard/EnhancedProfile'
import { FilteredOpportunities } from '@/components/dashboard/FilteredOpportunities'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'discover', label: 'اكتشف الفرص', icon: 'search', href: '/discover', color: 'primary', description: 'البحث عن فرص استثمارية جديدة' },
  { id: 'portfolio', label: 'المحفظة', icon: 'account_balance_wallet', href: '/portfolio', color: 'secondary', description: 'عرض وإدارة محفظتك الاستثمارية' },
  { id: 'messages', label: 'الرسائل', icon: 'mail', href: '/messages', color: 'tertiary', description: 'تواصل مع المؤسسين' },
  { id: 'profile', label: 'ملفك الشخصي', icon: 'person', href: '/profile', color: 'success', description: 'إدارة بيانات ملفك الشخصي' },
]

type CategoryData = { amount: number; count: number }

export default async function InvestorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [investmentsResult, savedOppsResult, unreadResult, activeProjectsResult] = await Promise.all([
    supabase
      .from('investments')
      .select('amount, project_id, projects(category)')
      .eq('investor_id', user.id),
    supabase
      .from('saved_opportunities')
      .select('id, created_at, project:projects(id, title, category, status)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false),
    supabase
      .from('projects')
      .select('id, title, description, category, funding_goal, ai_score')
      .eq('status', 'active')
      .limit(3),
  ])

  const investments = investmentsResult.data ?? []
  const savedOpps = savedOppsResult.data ?? []
  const totalPortfolio = investments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)

  const categoryMap: Record<string, CategoryData> = {}
  for (const inv of investments) {
    const category = (inv.projects as { category?: string } | null)?.category ?? 'غير مصنف'
    if (!categoryMap[category]) categoryMap[category] = { amount: 0, count: 0 }
    categoryMap[category].amount += inv.amount ?? 0
    categoryMap[category].count += 1
  }

  const portfolioBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    percentage: totalPortfolio > 0 ? Math.round((data.amount / totalPortfolio) * 100) : 0,
    amount: data.amount,
  }))

  const timelineEvents: TimelineEvent[] = [
    { id: 'join', date: new Date(), title: 'الانضمام إلى المنصة', description: 'مرحباً بك في منصتنا الاستثمارية', type: 'milestone' },
    ...(savedOpps.length > 0 ? [{ id: 'saved', date: new Date(savedOpps[savedOpps.length - 1].created_at), title: 'أول فرصة محفوظة', description: `عثرت على ${savedOpps.length} فرصة استثمارية`, type: 'update' as const }] : []),
    ...(totalPortfolio > 0 ? [{ id: 'invested', date: new Date(), title: 'أول استثمار', description: `إجمالي المحفظة: ${(totalPortfolio / 1_000_000).toFixed(2)}M SAR`, type: 'funding' as const }] : []),
  ]

  const savedOpportunities = savedOpps.map((op) => {
    const project = Array.isArray(op.project) ? op.project[0] : op.project
    return {
      id: project?.id?.slice(0, 4)?.toUpperCase() ?? 'NA',
      title: project?.title ?? 'غير معروف',
      fullname: project?.title ?? 'غير معروف',
      date: new Date(op.created_at).toLocaleDateString('ar-SA'),
      category: project?.category ?? 'عام',
      round: 'تأسيس',
      status: project?.status ?? 'متاح',
      color: 'primary-container',
    }
  })

  const recommendations = (activeProjectsResult.data ?? []).map((project) => ({
    title: project.title,
    description: project.description,
    category: project.category ?? 'عام',
    match: `${project.ai_score ?? 85}%`,
    target: `${(project.funding_goal / 1_000_000).toFixed(1)}M SAR`,
    color: 'primary-container',
  }))

  const stats = [
    { label: 'إجمالي المحفظة', value: totalPortfolio.toLocaleString('ar-SA'), unit: 'SAR', border: 'border-primary-container' },
    { label: 'فرص مهتم بها', value: String(savedOpps.length), border: 'border-secondary-container' },
    { label: 'اجتماعات قادمة', value: '0', border: 'border-tertiary-fixed-dim' },
    { label: 'رسائل جديدة', value: String(unreadResult.count ?? 0), border: 'border-primary-container' },
  ]

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid pointer-events-none z-0 opacity-10" />

      <Navbar />
      <DashboardSidebar />

      <main className="xl:mr-72 pt-20 pb-20 px-6 md:px-8 lg:px-10 min-h-screen z-10 relative">
        <div className="mb-16 pb-8 border-b border-border/50">
          <h2 className="font-headline text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight text-right mb-2">لوحة تحكم المستثمر</h2>
          <p className="text-foreground/70 font-body text-sm text-right max-w-2xl leading-relaxed">مرحباً بك. إليك نظرة شاملة على محفظتك الاستثمارية والفرص المتاحة.</p>
        </div>

        <div className="mb-16">
          <EnhancedProfile
            profile={{
              id: user.id,
              name: 'المستثمر',
              role: 'investor',
              stats: [
                { label: 'إجمالي المحفظة', value: `${(totalPortfolio / 1_000_000).toFixed(2)}M SAR` },
                { label: 'الفرص المحفوظة', value: savedOpps.length },
                { label: 'الاستثمارات النشطة', value: investments.length },
                { label: 'العائد المتوقع', value: '+8.5%' },
              ],
            }}
          />
        </div>

        <div className="mb-16">
          <QuickActions actions={QUICK_ACTIONS} title="الإجراءات السريعة" />
        </div>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className={`bg-surface-container-low/80 backdrop-blur-sm p-6 relative border-r-4 ${stat.border} shadow-[0_0_24px_rgba(0,255,209,0.05)] rounded-2xl hover:shadow-[0_0_32px_rgba(0,255,209,0.1)] hover:bg-surface-container-low transition-all`}>
                <div className="text-foreground/70 text-sm mb-2 font-headline">{stat.label}</div>
                <div className="text-3xl font-data text-foreground flex items-baseline gap-2">
                  {stat.unit && <span className="text-sm text-primary-container">{stat.unit}</span>}
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {portfolioBreakdown.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black font-headline border-r-4 border-primary-container pr-4 mb-8 text-foreground uppercase tracking-tight">تحليل المحفظة الاستثمارية</h2>
            <PortfolioBreakdownChart data={portfolioBreakdown} />
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black font-headline border-r-4 border-primary-container pr-4 text-foreground uppercase tracking-tight">توصيات الذكاء الاصطناعي</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-surface-container-high p-1 relative overflow-hidden group rounded-3xl hover:shadow-lg hover:shadow-primary-container/10 transition-all">
                  <div className="p-6 bg-surface-container-high/80 backdrop-blur-md h-full rounded-[calc(1.5rem-4px)]">
                    <div className="flex justify-between mb-4">
                      <span className="bg-primary-container/10 text-primary-container text-[10px] px-2 py-1 font-data">{rec.category}</span>
                      <span className="font-data text-lg text-white">{rec.match}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-headline text-foreground">{rec.title}</h3>
                    <p className="text-sm text-foreground/70 mb-6 font-body leading-relaxed">{rec.description}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] text-slate-500 font-data uppercase tracking-widest">Target</div>
                        <div className="font-data text-sm text-primary-container">{rec.target}</div>
                      </div>
                      <button className="bg-primary-container text-slate-950 px-4 py-2 text-xs font-bold hover:bg-white transition-all active:scale-95">عرض الفرصة</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black font-headline border-r-4 border-primary-container pr-4 text-foreground uppercase tracking-tight">الفرص المحفوظة</h2>
          </div>
          <FilteredOpportunities
            opportunities={savedOpportunities}
            onEmpty={() => <div className="text-center py-8 text-foreground/60 font-body">لا يوجد فرص محفوظة حالياً.</div>}
          />
        </section>

        <section className="mb-12">
          <div className="bg-gradient-to-br from-surface-container-low/60 to-surface-container-low/30 backdrop-blur-md p-8 border border-outline-variant/20 rounded-3xl hover:border-primary-container/40 hover:shadow-lg hover:shadow-primary-container/10 transition-all">
            <Timeline events={timelineEvents} title="رحلتك الاستثمارية" />
          </div>
        </section>
      </main>
    </div>
  )
}
