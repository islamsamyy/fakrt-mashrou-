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
      <div className="bg-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 neon-grid opacity-10" />
        <Navbar />
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary-container/20 rounded-full" />
          <div className="absolute inset-0 border-t-4 border-primary-container rounded-full animate-spin shadow-[0_0_20px_#00ffd1]" />
        </div>
        <p className="mt-8 text-primary-container font-data tracking-[0.4em] uppercase animate-pulse">... جاري فك تشفير بيانات الفرصة</p>
      </div>
    )
  }

  if (!project) return null

  // Arabic translations
  const t = {
    established: 'تأسس في',
    entityId: 'معرّف الكيان',
    summary: 'الملخص التنفيذي',
    marketStatus: 'حالة السوق',
    highDemand: 'طلب عالي',
    locked: 'مُقفل',
    entryThreshold: 'الحد الأدنى للاستثمار',
    projectedRoi: 'العائد المتوقع',
    analysing: 'قيد التحليل',
    fundingProtocol: 'بروتوكول التمويل',
    targetCapital: 'رأس المال المستهدف',
    percentage: 'النسبة',
    connectionSecure: 'الاتصال آمن',
    remaining: 'المتبقي',
    disclaimer: 'إخلاء المسؤولية',
    minParticipation: 'الحد الأدنى للمشاركة',
    initiateInvestment: 'بدء الاستثمار',
    messageEntity: 'راسل المؤسس',
    archiveIntel: 'حفظ',
    entitySecured: '✓ تم الحفظ',
    updating: 'جاري التحديث',
    initialising: 'جاري التهيئة',
    verifiedFounder: 'مؤسس موثق',
    requestLink: 'طلب الاتصال ←',
    editEntity: 'تعديل المشروع',
    noData: 'بيانات غير متاحة',
    encrypted: 'جميع المعاملات مشفرة وآمنة',
    active: 'نشط',
    inactive: 'غير نشط',
    verified: 'مُتحقّق'
  }

  const founder = Array.isArray(project.founder) ? project.founder[0] : project.founder
  const raised = project.amount_raised || 0
  const target = project.funding_goal || 0
  const percentage = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0
  const remaining = Math.max(0, target - raised)
  const isOwner = currentUserId === project.founder_id

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 neon-grid opacity-[0.15] pointer-events-none z-0" />
      <div className="fixed inset-0 scanline opacity-10 pointer-events-none z-0" />
      <div className="fixed inset-0 data-stream opacity-[0.05] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-secondary/5 pointer-events-none z-0" />

      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Main Content */}
          <div className="flex-grow space-y-16">
            <header className="relative">
              <div className="flex items-center gap-4 mb-8 flex-wrap">
                <span className="bg-gradient-to-r from-primary-container/20 to-primary-container/5 text-primary-container text-[11px] font-black px-5 py-2 border border-primary-container/30 rounded-lg clip-button holographic-reflection shadow-lg shadow-primary-container/10">
                  {project.category || 'عام'}
                </span>
                {project.verified && (
                  <span className="flex items-center gap-2 text-secondary text-[11px] font-black px-4 py-2 bg-secondary/5 border border-secondary/20 rounded-lg">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    {t.verified}
                  </span>
                )}
                <div className="flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${project.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-500'}`} />
                  <span className="text-[11px] font-black text-green-400 uppercase tracking-widest leading-none">
                    {project.status === 'active' ? t.active : t.inactive}
                  </span>
                </div>
              </div>

              <h1 className="font-headline text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-container to-white mb-8 leading-tight tracking-tighter" data-text={project.title}>
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-slate-400 font-data text-[11px] font-bold tracking-[0.2em] border-y border-white/10 py-8 backdrop-blur-sm bg-white/5 px-8 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container text-base">calendar_month</span>
                  <span>{t.established}: {new Date(project.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container text-base">fingerprint</span>
                  <span>{t.entityId}: {project.id.slice(0, 12).toUpperCase()}</span>
                </div>
              </div>
            </header>

            <section className="relative p-12 bg-gradient-to-br from-[#020406]/80 to-[#0a0e1a]/60 backdrop-blur-xl border border-primary-container/20 rounded-2xl group overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-container/10 blur-3xl rounded-full group-hover:blur-2xl transition-all duration-700" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 blur-3xl rounded-full group-hover:blur-2xl transition-all duration-700" />

              <h3 className="text-2xl font-black text-white mb-8 font-headline uppercase tracking-tighter flex items-center gap-3 relative z-10">
                <span className="w-8 h-[3px] bg-gradient-to-r from-primary-container to-secondary rounded-full" />
                {t.summary}
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg font-body group-hover:text-slate-200 transition-colors relative z-10 text-justify">
                {project.description || t.noData}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: t.marketStatus, value: project.status === 'active' ? t.highDemand : t.locked, color: 'from-primary-container to-cyan-400', icon: 'trending_up' },
                { label: t.entryThreshold, value: `${(project.min_invest || 0).toLocaleString('ar-SA')} ر.س`, color: 'from-secondary to-emerald-400', icon: 'savings' },
                { label: t.projectedRoi, value: project.roi || t.analysing, color: 'from-tertiary to-violet-400', icon: 'show_chart' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br from-[#020406]/60 to-[#0a0e1a]/40 border border-white/10 p-8 text-right rounded-2xl relative overflow-hidden group hover:border-primary-container/40 transition-all hover:shadow-2xl hover:shadow-primary-container/20 backdrop-blur-sm`}>
                  <div className={`absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br ${stat.color} blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full`} />
                  <span className={`material-symbols-outlined text-4xl mb-6 block bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>{stat.icon}</span>
                  <span className={`block text-2xl font-black font-data mb-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>{stat.value}</span>
                  <span className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
              ))}
            </div>

            {isOwner && (
              <Link href={`/projects/${id}/edit`} className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-container/20 to-primary-container/10 border border-primary-container/50 text-primary-container font-black px-10 py-5 text-sm uppercase tracking-[0.3em] hover:from-primary-container/30 hover:to-primary-container/20 hover:border-primary-container/80 transition-all rounded-lg shadow-lg shadow-primary-container/20 hover:shadow-xl hover:shadow-primary-container/40">
                <span className="material-symbols-outlined text-base">edit_note</span>
                {t.editEntity}
              </Link>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-[500px] space-y-10 shrink-0">
            <div className="bg-gradient-to-br from-[#020406]/95 to-[#0a0e1a]/80 border border-primary-container/40 p-12 rounded-2xl relative shadow-2xl shadow-primary-container/20 group overflow-hidden">
              <div className="absolute inset-0 scanline-overlay opacity-5 animate-scanline pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-container/10 blur-3xl rounded-full group-hover:blur-2xl transition-all duration-700" />

              <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary-container via-cyan-500 to-transparent" />

              <h3 className="text-3xl font-black text-white mb-10 font-headline text-center uppercase tracking-tighter relative z-10">{t.fundingProtocol}</h3>

              <div className="space-y-8 mb-12 relative z-10">
                <div className="flex justify-between items-end px-2 bg-white/5 p-6 rounded-xl border border-white/10">
                  <div className="space-y-2">
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">{t.targetCapital}</p>
                    <p className="text-white font-data text-3xl font-black tabular-nums tracking-tighter">{target.toLocaleString('ar-SA')} ر.س</p>
                  </div>
                  <div className="text-left" dir="ltr">
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">{t.percentage}</p>
                    <span className="text-4xl font-black bg-gradient-to-r from-primary-container to-cyan-400 bg-clip-text text-transparent tabular-nums italic leading-none">{percentage}%</span>
                  </div>
                </div>

                <div className="relative h-5 w-full bg-white/5 rounded-full overflow-hidden p-[3px] border border-primary-container/30 shadow-lg shadow-primary-container/10">
                  <div className="absolute inset-0 scanline-overlay opacity-20 animate-scanline pointer-events-none" />
                  <div
                    className="h-full bg-gradient-to-r from-primary-container via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_30px_rgba(0,255,209,0.8)] transition-all duration-1000 ease-out relative"
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                  </div>
                </div>

                <div className="flex justify-between px-2 text-[11px] font-black uppercase tracking-widest">
                  <span className="text-primary-container animate-pulse font-headline">{t.connectionSecure}</span>
                  <span className="text-slate-400">{t.remaining}: {remaining.toLocaleString('ar-SA')} ر.س</span>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-secondary/10 to-cyan-500/5 border border-secondary/30 rounded-xl flex gap-4 items-start mb-12 relative overflow-hidden group/disclaimer">
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-secondary to-transparent" />
                <span className="material-symbols-outlined text-secondary text-2xl shrink-0 group-hover/disclaimer:scale-110 transition-transform">shield_alert</span>
                <p className="text-xs text-slate-300 leading-relaxed font-body">
                  <span className="text-secondary font-black block mb-2">{t.disclaimer}</span>
                  {t.minParticipation}: {(project.min_invest || 0).toLocaleString('ar-SA')} ر.س. {t.encrypted}
                </p>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                {/* Invest Now */}
                {!isOwner && project.status === 'active' && (
                  <button
                    onClick={handleInvest}
                    className="w-full bg-gradient-to-r from-primary-container to-cyan-400 hover:from-cyan-400 hover:to-primary-container text-background font-black py-6 text-lg rounded-lg text-center shadow-lg shadow-primary-container/40 hover:shadow-xl hover:shadow-primary-container/60 active:scale-95 transition-all uppercase tracking-[0.3em] holographic-reflection"
                  >
                    {t.initiateInvestment}
                  </button>
                )}

                {/* Message Founder */}
                {!isOwner && (
                  <button
                    onClick={handleMessage}
                    disabled={messagePending}
                    className="w-full bg-secondary/10 border-2 border-secondary/40 text-secondary font-black py-5 text-lg rounded-lg text-center hover:bg-secondary/20 hover:border-secondary/60 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.2em]"
                  >
                    {messagePending ? t.initialising : t.messageEntity}
                  </button>
                )}

                {/* Save */}
                {!isOwner && (
                  <button
                    onClick={handleSave}
                    disabled={savePending}
                    className={`w-full border-2 font-black py-5 text-lg rounded-lg text-center active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.2em] ${
                      saved
                        ? 'bg-primary-container/10 border-primary-container/60 text-primary-container hover:bg-primary-container/20'
                        : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                    }`}
                  >
                    {savePending ? t.updating : saved ? t.entitySecured : t.archiveIntel}
                  </button>
                )}
              </div>
            </div>

            {/* Founder Card */}
            {founder && (
              <div
                onClick={() => !isOwner && router.push(`/messages?user=${founder.id}`)}
                className="bg-gradient-to-br from-[#020406]/80 to-[#0a0e1a]/60 backdrop-blur-xl border border-white/10 p-10 relative hover:border-primary-container/50 transition-all cursor-pointer group rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary-container/20"
              >
                <div className="absolute top-0 right-0 w-16 h-[2px] bg-gradient-to-l from-primary-container to-transparent" />
                <div className="absolute top-0 right-0 w-[2px] h-16 bg-gradient-to-b from-primary-container to-transparent" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-container/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />

                <div className="flex gap-8 items-center relative z-10">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-xl border-3 border-primary-container/30 overflow-hidden shrink-0 group-hover:border-primary-container/80 transition-all duration-500 relative z-10 shadow-lg shadow-primary-container/20 group-hover:shadow-xl group-hover:shadow-primary-container/40">
                      <Image
                        width={112} height={112}
                        src={founder.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${founder.full_name}`}
                        alt={founder.full_name || 'مؤسس'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-2xl font-black text-white font-headline group-hover:text-primary-container transition-all duration-300 uppercase tracking-tighter truncate">{founder.full_name || 'مؤسس'}</h4>
                    <p className="text-slate-400 text-sm mb-4 font-body line-clamp-2 group-hover:text-slate-300 transition-colors">{founder.bio || t.noData}</p>
                    {founder.kyc_status === 'verified' && (
                      <span className="text-emerald-400 font-data text-[11px] font-black uppercase tracking-[0.3em] border border-emerald-400/40 px-3 py-1.5 bg-emerald-400/5 rounded-lg inline-block">✓ {t.verifiedFounder}</span>
                    )}
                  </div>
                </div>
                {!isOwner && (
                  <p className="text-[11px] text-slate-500 mt-6 text-center font-data font-black uppercase tracking-[0.4em] group-hover:text-primary-container transition-colors animate-pulse">{t.requestLink}</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
