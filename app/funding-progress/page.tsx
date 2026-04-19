import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export default async function FundingProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get projects with funding info
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, title, funding_goal, amount_raised, status, created_at,
      investments(amount, status, investor_id)
    `)
    .eq('founder_id', user.id)
    .order('created_at', { ascending: false })

  const projectsData = (projects || []).map(p => ({
    ...p,
    investmentCount: p.investments?.filter((i: any) => i.status === 'paid').length || 0,
    totalInvested: p.investments?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0,
    percentage: p.funding_goal > 0 ? Math.min(100, Math.round((p.amount_raised / p.funding_goal) * 100)) : 0,
  }))

  const totalFunded = projectsData.reduce((sum, p) => sum + p.totalInvested, 0)
  const totalProjects = projectsData.length
  const activeProjects = projectsData.filter(p => p.status === 'active').length

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid pointer-events-none z-0" />
      <div className="fixed inset-0 scanline pointer-events-none z-0" />

      <Navbar />
      <DashboardSidebar />

      <main className="xl:mr-64 pt-32 pb-32 px-6 max-w-7xl mx-auto z-10 relative">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-white mb-4">تقدم التمويل</h1>
          <p className="text-slate-400 max-w-xl">مراقبة حية لتدفقات رأس المال والتزامات المستثمرين في مشاريعك.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'إجمالي المشاريع', value: totalProjects.toString(), icon: 'inventory_2' },
            { label: 'المشاريع النشطة', value: activeProjects.toString(), icon: 'check_circle' },
            { label: 'إجمالي التمويل المجمع', value: `${totalFunded.toLocaleString()} ريال`, icon: 'account_balance' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0A1628] border border-white/5 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-bold">{stat.label}</p>
                <span className="material-symbols-outlined text-primary-container text-2xl">{stat.icon}</span>
              </div>
              <p className="text-2xl font-black text-white font-data">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        {projectsData.length === 0 ? (
          <div className="bg-[#0A1628] border border-white/5 p-16 text-center rounded-lg">
            <span className="material-symbols-outlined text-6xl text-slate-600 block mb-4">inventory_2</span>
            <p className="text-slate-400 font-body mb-6">لم تنشئ أي مشروع بعد.</p>
            <a href="/add-idea" className="bg-primary-container text-background font-black px-8 py-3 text-sm uppercase tracking-widest hover:brightness-110 transition-all inline-block">
              إنشاء مشروع
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {projectsData.map((proj) => (
              <div key={proj.id} className="bg-[#0A1628] border border-white/5 p-8 rounded-lg hover:border-primary-container/20 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white font-headline mb-2">{proj.title}</h3>
                    <p className="text-slate-500 text-sm">
                      {proj.investmentCount} مستثمر • {new Date(proj.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <span className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${proj.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {proj.status === 'active' ? 'نشط' : 'مغلق'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 text-sm">التمويل المجمع</span>
                    <span className="text-primary-container font-data font-black">
                      {proj.totalInvested.toLocaleString()} / {proj.funding_goal.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container shadow-[0_0_10px_#00ffd1] transition-all" style={{ width: `${proj.percentage}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{proj.percentage}٪ مكتمل</span>
                    <span>متبقي: {Math.max(0, proj.funding_goal - proj.totalInvested).toLocaleString()} ريال</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                  <a
                    href={`/projects/${proj.id}/funding`}
                    className="flex-1 bg-primary-container/10 border border-primary-container/30 text-primary-container font-black py-3 text-sm rounded-lg hover:bg-primary-container/20 transition-all text-center uppercase tracking-widest"
                  >
                    عرض التفاصيل
                  </a>
                  <a
                    href={`/projects/${proj.id}/edit`}
                    className="flex-1 bg-white/5 border border-white/10 text-white font-black py-3 text-sm rounded-lg hover:bg-white/10 transition-all text-center uppercase tracking-widest"
                  >
                    تعديل
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
