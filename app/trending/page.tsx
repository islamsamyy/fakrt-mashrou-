import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Trending - IDEA BUSINESS',
}

export default async function TrendingPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, title, description, category, funding_goal, amount_raised, status, created_at, verified,
      founder:founder_id(id, full_name, avatar_url),
      investments(amount)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20)

  const trendingProjects = (projects || []).map((p: any) => {
    const raised = p.amount_raised || 0
    const target = p.funding_goal || 0
    const percentage = target > 0 ? Math.round((raised / target) * 100) : 0
    const investorCount = p.investments?.length || 0
    const momentum = investorCount > 0 ? Math.random() * 100 : 0 // Simulated momentum score

    return {
      ...p,
      founder: Array.isArray(p.founder) ? p.founder[0] : p.founder,
      percentage,
      momentum: Math.round(momentum),
      trend: 'up' as const,
      investorCount,
    }
  }).sort((a, b) => b.momentum - a.momentum)

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid opacity-5 pointer-events-none z-0" />
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <header className="mb-16 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-4">
            اتجاهات شائعة
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">المشاريع الأكثر نموّاً والأسرع جذباً للاستثمارات</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProjects.map((proj, i) => (
            <Link
              key={proj.id}
              href={`/opportunities/${proj.id}`}
              className="group relative bg-[#0A1628] border border-white/5 hover:border-primary-container/30 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
            >
              {/* Trend Badge */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-primary-container/20 backdrop-blur-sm border border-primary-container/30 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-sm text-primary-container">trending_up</span>
                <span className="text-xs font-black text-primary-container">+{proj.momentum}٪</span>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full uppercase tracking-widest text-primary-container">
                    <span>{proj.category}</span>
                    {proj.verified && <span className="material-symbols-outlined text-sm">verified</span>}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2 font-headline group-hover:text-primary-container transition-colors line-clamp-2">
                  {proj.title}
                </h3>

                <p className="text-sm text-slate-400 mb-6 line-clamp-2">{proj.description}</p>

                {/* Founder */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <Image
                    src={proj.founder?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${proj.id}`}
                    alt={proj.founder?.full_name || 'مؤسس'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{proj.founder?.full_name}</p>
                    <p className="text-xs text-slate-500">{proj.investorCount} مستثمر</p>
                  </div>
                </div>

                {/* Funding Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">تقدم التمويل</span>
                    <span className="text-primary-container font-black">{proj.percentage}٪</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-container to-secondary-container shadow-[0_0_10px_#00ffd1]"
                      style={{ width: `${proj.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {(proj.amount_raised || 0).toLocaleString()} / {proj.funding_goal.toLocaleString()} ريال
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {trendingProjects.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-600 block mb-4">trending_up</span>
            <p className="text-slate-400 font-body">لا توجد مشاريع نشطة في الوقت الحالي</p>
          </div>
        )}
      </main>
    </div>
  )
}
