import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export default async function FundingProgressPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*, founder:founder_id(id, full_name)')
    .eq('id', id)
    .single()

  if (error || !project) notFound()

  const { data: investments } = await supabase
    .from('investments')
    .select('*, investor:investor_id(avatar_url, full_name)')
    .eq('project_id', id)
    .eq('status', 'paid')
    .limit(10)

  const raised = project.amount_raised || 0
  const target = project.funding_goal || 0
  const percentage = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0
  const investorCount = investments?.length || 0

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex relative overflow-hidden text-right" dir="rtl">
      <div className="fixed inset-0 scanline opacity-5 pointer-events-none" />

      <DashboardSidebar />

      <div className="flex-grow flex flex-col h-screen relative z-10 w-full overflow-y-auto">
        <Navbar />

        <main className="flex-grow p-6 pt-24 max-w-5xl mx-auto w-full">
          <header className="mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              تقدم التمويل
            </h1>
            <p className="text-slate-500">{project.title} - {project.category}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Funding Status */}
            <div className="bg-[#0A1628] border border-white/5 p-8 relative overflow-hidden">
              <div className="l-bracket-tr opacity-20" />
              <h3 className="text-lg font-black text-white mb-8 font-headline uppercase tracking-widest">حالة الجولة الحالية</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-data text-xs uppercase">المبلغ المجموعة</span>
                  <span className="text-primary-container font-data text-3xl font-black">{raised.toLocaleString()} ريال</span>
                </div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container shadow-[0_0_20px_#00ffd1] transition-all" style={{ width: `${percentage}%` }} />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>الهدف: {target.toLocaleString()} ريال</span>
                  <span>{percentage}٪ مجمع</span>
                </div>
              </div>
            </div>

            {/* Investor Count */}
            <div className="bg-[#0A1628] border border-white/5 p-8 relative overflow-hidden">
              <div className="l-bracket-tr opacity-20" />
              <h3 className="text-lg font-black text-white mb-8 font-headline uppercase tracking-widest">تفاصيل المستثمرين</h3>
              <div className="flex items-center gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-data text-3xl font-black">{investorCount}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">مستثمر مشارك</span>
                </div>
                <div className="flex-grow flex flex-row-reverse gap-2">
                  {investments?.slice(0, 5).map((inv, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-[#0A1628] overflow-hidden ring-1 ring-white/5 transition-transform hover:-translate-y-1 shrink-0"
                    >
                      <Image
                        src={inv.investor?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${i}`}
                        alt={inv.investor?.full_name || 'مستثمر'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {investorCount > 5 && (
                    <div className="w-12 h-12 rounded-full border-2 border-[#0A1628] bg-primary-container flex items-center justify-center text-background font-black text-xs shrink-0">
                      +{investorCount - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Investors */}
          {investments && investments.length > 0 && (
            <section className="bg-[#0A1628] border border-white/5 p-8 md:p-12 relative mb-12">
              <h3 className="text-xl font-black text-white mb-8 font-headline uppercase tracking-tight">أحدث المستثمرين</h3>
              <div className="space-y-4">
                {investments.slice(0, 5).map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-primary-container/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <Image
                        src={inv.investor?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${i}`}
                        alt={inv.investor?.full_name || 'مستثمر'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white font-bold text-sm">{inv.investor?.full_name || 'مستثمر'}</p>
                        <p className="text-xs text-slate-500">{new Date(inv.created_at).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <span className="text-primary-container font-data font-black">{inv.amount?.toLocaleString()} ريال</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Project Info */}
          <section className="bg-[#0A1628] border border-white/5 p-8 md:p-12 relative">
            <h3 className="text-xl font-black text-white mb-8 font-headline uppercase tracking-tight">معلومات المشروع</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 text-sm mb-2">المؤسس</p>
                  <p className="text-white font-bold">{project.founder?.full_name || 'غير معروف'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-2">الفئة</p>
                  <p className="text-white font-bold">{project.category || 'عام'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-2">الحالة</p>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${project.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {project.status === 'active' ? 'نشط' : 'مغلق'}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-2">تاريخ الإنشاء</p>
                  <p className="text-white font-bold">{new Date(project.created_at).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/5">
                <p className="text-slate-500 text-sm mb-2">الوصف</p>
                <p className="text-slate-300 leading-relaxed">{project.description || 'لا يوجد وصف'}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
