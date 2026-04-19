'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { use } from 'react'

interface Project {
  id: string
  title: string
  description: string | null
  category: string | null
  funding_goal: number
  amount_raised: number
  min_invest: number
  roi: string | null
  status: string
  verified: boolean
  created_at: string
  founder_id: string
  founder?: {
    id: string
    full_name: string | null
    bio: string | null
    avatar_url: string | null
    kyc_status: string | null
  } | null
}

export default function OpportunityDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const router = useRouter()
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [savePending, startSaveTransition] = useTransition()
  const [messagePending, startMessageTransition] = useTransition()

  useEffect(() => {
    async function load() {
      const [{ data: { user } }, { data: proj, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('projects')
          .select('*, founder:profiles!founder_id(id, full_name, bio, avatar_url, kyc_status)')
          .eq('id', id)
          .single(),
      ])

      if (error || !proj) {
        router.replace('/opportunities')
        return
      }

      setProject(proj as Project)
      setCurrentUserId(user?.id ?? null)

      if (user) {
        const { data: saved } = await supabase
          .from('saved_opportunities')
          .select('id')
          .eq('user_id', user.id)
          .eq('project_id', id)
          .maybeSingle()
        setSaved(!!saved)
      }

      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (!currentUserId) { toast.error('سجّل دخولك أولاً'); return }
    startSaveTransition(async () => {
      if (saved) {
        await supabase.from('saved_opportunities').delete().eq('user_id', currentUserId).eq('project_id', id)
        setSaved(false)
        toast.success('تم إلغاء الحفظ')
      } else {
        await supabase.from('saved_opportunities').insert({ user_id: currentUserId, project_id: id })
        setSaved(true)
        toast.success('تم حفظ الفرصة')
      }
    })
  }

  const handleMessage = () => {
    if (!currentUserId) { toast.error('سجّل دخولك أولاً'); return }
    if (!project?.founder_id) return
    startMessageTransition(() => {
      router.push(`/messages?user=${project.founder_id}`)
    })
  }

  const handleInvest = () => {
    if (!currentUserId) { toast.error('سجّل دخولك أولاً'); router.push('/login'); return }
    router.push(`/checkout?projectId=${id}`)
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Navbar />
        <span className="material-symbols-outlined text-5xl text-primary-container animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!project) return null

  const founder = Array.isArray(project.founder) ? project.founder[0] : project.founder
  const raised = project.amount_raised || 0
  const target = project.funding_goal || 0
  const percentage = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0
  const remaining = Math.max(0, target - raised)
  const isOwner = currentUserId === project.founder_id

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid opacity-5 pointer-events-none" />
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main Content */}
          <div className="flex-grow space-y-12">
            <header>
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-primary-container/10 text-primary-container text-[10px] font-black px-3 py-1 border border-primary-container/20 uppercase tracking-widest">
                  {project.category || 'عام'}
                </span>
                {project.verified && (
                  <span className="flex items-center gap-1 text-secondary-container text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    مُتحقق
                  </span>
                )}
                <span className={`text-[10px] font-black px-3 py-1 border uppercase tracking-widest ${project.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {project.status === 'active' ? 'نشط' : 'مغلق'}
                </span>
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tight">{project.title}</h1>
              <div className="flex flex-wrap gap-8 text-slate-500 font-data text-xs uppercase tracking-widest border-y border-white/5 py-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  نشر: {new Date(project.created_at).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </header>

            <section className="bg-white/5 p-8 rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="l-bracket-tr opacity-10" />
              <h3 className="text-xl font-black text-white mb-6 font-headline uppercase tracking-tight">ملخص الفكرة</h3>
              <p className="text-slate-400 leading-relaxed text-lg font-body">{project.description || 'لم يتم تقديم وصف تفصيلي.'}</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'الحالة', value: project.status === 'active' ? 'نشط' : 'مغلق', color: 'text-primary-container' },
                { label: 'الحد الأدنى', value: `${(project.min_invest || 0).toLocaleString()} ريال`, color: 'text-secondary-fixed-dim' },
                { label: 'العائد المتوقع', value: project.roi || 'غير محدد', color: 'text-tertiary-fixed-dim' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-6 text-center rounded-xl">
                  <span className={`block text-2xl font-black font-data mb-2 ${stat.color}`}>{stat.value}</span>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* If owner, show edit button */}
            {isOwner && (
              <Link href={`/projects/${id}/edit`} className="inline-flex items-center gap-2 border border-primary-container/30 text-primary-container font-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-primary-container/10 transition-all">
                <span className="material-symbols-outlined text-sm">edit</span>
                تعديل المشروع
              </Link>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-[450px] space-y-8 shrink-0">
            <div className="bg-[#0A1628] border border-primary-container/20 p-8 clip-button relative shadow-[0_0_50px_rgba(0,255,209,0.05)]">
              <div className="l-bracket-tr" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-primary-container to-secondary-container" />

              <h3 className="text-2xl font-black text-white mb-8 font-headline text-center uppercase">بيانات التمويل</h3>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 text-xs font-black uppercase tracking-widest">إجمالي التمويل المستهدف</span>
                  <span className="text-white font-data text-2xl font-black">{target.toLocaleString()} ريال</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container shadow-[0_0_10px_#00ffd1] transition-all duration-700" style={{ width: `${percentage}%` }} />
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-primary-container">تم جمع {percentage}٪</span>
                  <span className="text-slate-500">متبقي {remaining.toLocaleString()} ريال</span>
                </div>
              </div>

              <div className="p-4 bg-secondary-container/5 border border-secondary-container/20 rounded-xl flex gap-4 items-start mb-10">
                <span className="material-symbols-outlined text-secondary-container">shield_with_heart</span>
                <p className="text-[11px] text-slate-400 leading-tight">
                  * الحد الأدنى للاستثمار: {(project.min_invest || 0).toLocaleString()} ريال. هذا المشروع قد يكون خاضعًا لاتفاقية سرية.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Invest Now */}
                {!isOwner && project.status === 'active' && (
                  <button
                    onClick={handleInvest}
                    className="w-full bg-primary-container text-background font-black py-5 text-xl clip-button text-center shadow-[0_0_30px_rgba(0,255,209,0.2)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    استثمر الآن
                  </button>
                )}

                {/* Message Founder */}
                {!isOwner && (
                  <button
                    onClick={handleMessage}
                    disabled={messagePending}
                    className="w-full bg-secondary-container/20 border border-secondary-container/30 text-white font-black py-5 text-xl clip-button text-center hover:bg-secondary-container/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {messagePending ? '...' : 'تواصل مع المؤسس'}
                  </button>
                )}

                {/* Save */}
                {!isOwner && (
                  <button
                    onClick={handleSave}
                    disabled={savePending}
                    className={`w-full border font-black py-5 text-xl clip-button text-center active:scale-95 transition-all disabled:opacity-50 ${
                      saved
                        ? 'bg-primary-container/10 border-primary-container/50 text-primary-container'
                        : 'border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    {savePending ? '...' : saved ? '✓ تم الحفظ' : 'حفظ الفرصة الاستثمارية'}
                  </button>
                )}
              </div>
            </div>

            {/* Founder Card */}
            {founder && (
              <div
                onClick={() => !isOwner && router.push(`/messages?user=${founder.id}`)}
                className="bg-[#0A1628] border border-white/5 p-8 relative hover:border-primary-container/30 transition-all cursor-pointer group"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-full border-2 border-white/10 overflow-hidden shrink-0 group-hover:border-primary-container transition-colors">
                    <Image
                      width={80} height={80}
                      src={founder.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${founder.full_name}`}
                      alt={founder.full_name || 'مؤسس'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white font-headline group-hover:text-primary-container transition-colors">{founder.full_name || 'مؤسس غير معروف'}</h4>
                    <p className="text-slate-500 text-sm mb-2 font-body">{founder.bio || 'مؤسس مشروع'}</p>
                    {founder.kyc_status === 'verified' && (
                      <span className="text-primary-container font-data text-[10px] font-black uppercase tracking-widest border border-primary-container/30 px-2 py-0.5">Verified Founder</span>
                    )}
                  </div>
                </div>
                {!isOwner && (
                  <p className="text-xs text-slate-600 mt-4 text-center font-data uppercase tracking-widest group-hover:text-primary-container transition-colors">اضغط للتواصل ←</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
