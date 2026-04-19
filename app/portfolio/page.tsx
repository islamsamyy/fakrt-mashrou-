import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import Link from 'next/link'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch investments with project details
  const { data: investments } = await supabase
    .from('investments')
    .select(`
      id, amount, status, created_at,
      projects ( id, title, category, funding_goal, amount_raised, status )
    `)
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false })

  const inv = investments ?? []

  const totalInvested = inv.reduce((sum, i) => sum + (i.amount ?? 0), 0)
  const activeCount = inv.filter(i => i.status === 'paid' || i.status === 'committed').length
  const paidCount = inv.filter(i => i.status === 'paid').length

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid pointer-events-none z-0 opacity-10" />
      <div className="fixed inset-0 scanline pointer-events-none z-0 opacity-10" />

      <Navbar />
      <DashboardSidebar />

      <main className="xl:mr-64 pt-32 pb-20 px-8 min-h-screen z-10 relative">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h1 className="font-headline text-4xl font-bold text-white mb-2 tracking-tight">محفظتي الاستثمارية</h1>
              <p className="text-on-surface-variant max-w-md">نظرة شاملة على استثماراتك النشطة وأداء أصولك.</p>
            </div>
            <div className="bg-surface-container-high px-6 py-3 border border-outline-variant/30 flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-data">Status</span>
              <span className="flex items-center gap-2 text-primary-container font-data">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                CONNECTED
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'إجمالي المبالغ المستثمرة', value: `$${totalInvested.toLocaleString()}`, icon: 'account_balance' },
              { label: 'الاستثمارات المكتملة', value: paidCount.toString(), icon: 'task_alt' },
              { label: 'المشاريع النشطة', value: activeCount.toString(), icon: 'inventory_2' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface-container-low p-8 relative overflow-hidden group border border-white/5">
                <div className="l-bracket-tr" />
                <div className="l-bracket-bl" />
                <div className="relative z-10">
                  <p className="font-headline text-on-surface-variant text-sm mb-4">{stat.label}</p>
                  <h2 className="font-data text-4xl text-white font-black tracking-tighter text-primary-container">{stat.value}</h2>
                </div>
                <div className="absolute -bottom-4 -left-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-9xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Investments Table */}
          <div className="mb-12">
            <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-primary-container" />
              استثماراتي
            </h3>

            {inv.length === 0 ? (
              <div className="bg-surface-container-low border border-outline-variant/10 p-16 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-600 block mb-4">account_balance_wallet</span>
                <p className="text-on-surface-variant font-body mb-6">لم تقم بأي استثمار بعد.</p>
                <Link href="/opportunities" className="bg-primary-container text-background font-black px-8 py-3 text-sm uppercase tracking-widest hover:brightness-110 transition-all">
                  تصفح الفرص
                </Link>
              </div>
            ) : (
              <div className="bg-surface-container overflow-x-auto border border-outline-variant/10">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest/50 border-b border-outline-variant/20">
                      <th className="px-6 py-4 font-headline text-xs text-slate-400 uppercase tracking-tighter">المشروع</th>
                      <th className="px-6 py-4 font-headline text-xs text-slate-400 uppercase tracking-tighter">القطاع</th>
                      <th className="px-6 py-4 font-headline text-xs text-slate-400 uppercase tracking-tighter">المبلغ</th>
                      <th className="px-6 py-4 font-headline text-xs text-slate-400 uppercase tracking-tighter">الحالة</th>
                      <th className="px-6 py-4 font-headline text-xs text-slate-400 uppercase tracking-tighter">التاريخ</th>
                      <th className="px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {inv.map((investment) => {
                      const project = investment.projects as unknown as { id: string; title: string; category: string; funding_goal: number; amount_raised: number; status: string } | null
                      const statusMap: Record<string, { label: string; cls: string }> = {
                        paid: { label: 'مكتمل', cls: 'bg-primary-container/10 text-primary-container border-primary-container/30' },
                        committed: { label: 'معلّق', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
                        cancelled: { label: 'ملغى', cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
                      }
                      const s = statusMap[investment.status] ?? { label: investment.status, cls: 'bg-slate-500/10 text-slate-400 border-slate-500/30' }
                      return (
                        <tr key={investment.id} className="hover:bg-surface-container-high/50 transition-colors group">
                          <td className="px-6 py-5 font-headline font-bold text-white group-hover:text-primary-container transition-colors">
                            {project?.title ?? '—'}
                          </td>
                          <td className="px-6 py-5 text-sm text-on-surface-variant font-body">{project?.category ?? '—'}</td>
                          <td className="px-6 py-5 font-data text-sm text-primary-container">${investment.amount?.toLocaleString()}</td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 text-[10px] font-bold border ${s.cls}`}>{s.label}</span>
                          </td>
                          <td className="px-6 py-5 font-data text-xs text-slate-500">
                            {new Date(investment.created_at).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="px-6 py-5">
                            {project?.id && (
                              <Link href={`/opportunities/${project.id}`} className="text-xs text-primary-container hover:underline font-data uppercase tracking-widest">
                                عرض
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link href="/opportunities" className="inline-flex items-center gap-2 bg-primary-container text-background font-black px-10 py-4 uppercase tracking-widest hover:brightness-110 transition-all">
              <span className="material-symbols-outlined">add</span>
              استثمار جديد
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
