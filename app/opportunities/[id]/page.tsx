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
        <p className="mt-8 text-primary-container font-data tracking-[0.4em] uppercase animate-pulse">Decrypting opportunity data...</p>
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
      {/* Background Effects */}
      <div className="fixed inset-0 neon-grid opacity-[0.15] pointer-events-none z-0" />
      <div className="fixed inset-0 scanline opacity-10 pointer-events-none z-0" />
      <div className="fixed inset-0 data-stream opacity-[0.05] pointer-events-none z-0" />
      
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Main Content */}
          <div className="flex-grow space-y-16">
            <header className="relative">
              <div className="flex items-center gap-4 mb-8">
                <span className="bg-primary-container/10 text-primary-container text-[10px] font-black px-4 py-1.5 border border-primary-container/20 uppercase tracking-[0.2em] clip-button holographic-reflection">
                  {project.category || 'GENERAL_INTEL'}
                </span>
                {project.verified && (
                  <span className="flex items-center gap-1.5 text-secondary text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    SECURITY_VERIFIED
                  </span>
                )}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${project.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-500'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                    {project.status === 'active' ? 'Link_Established' : 'Link_Severed'}
                  </span>
                </div>
              </div>

              <h1 className="font-headline text-5xl md:text-7xl font-black text-white mb-8 leading-tight uppercase tracking-tighter glitch-layers" data-text={project.title}>
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-slate-500 font-data text-[10px] font-bold uppercase tracking-[0.3em] border-y border-white/5 py-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container text-base">calendar_month</span>
                  <span>Established: {new Date(project.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container text-base">fingerprint</span>
                  <span>Entity_ID: {project.id.slice(0, 12).toUpperCase()}</span>
                </div>
              </div>
            </header>

            <section className="relative p-10 bg-[#020406]/60 backdrop-blur-xl border border-white/10 clip-card group">
              <div className="l-bracket-tr" />
              <div className="l-bracket-bl" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <h3 className="text-2xl font-black text-white mb-8 font-headline uppercase tracking-tighter flex items-center gap-3">
                <span className="w-8 h-[2px] bg-primary-container" />
                Executive Summary
              </h3>
              <p className="text-slate-400 leading-relaxed text-xl font-body group-hover:text-slate-300 transition-colors">
                {project.description || 'No detailed intel available for this entity.'}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Market Status', value: project.status === 'active' ? 'HIGH_DEMAND' : 'LOCKED', color: 'text-primary-container', icon: 'monitoring' },
                { label: 'Entry Threshold', value: `${(project.min_invest || 0).toLocaleString()} SAR`, color: 'text-secondary', icon: 'token' },
                { label: 'Projected ROI', value: project.roi || 'ANALYSING...', color: 'text-tertiary', icon: 'show_chart' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#020406]/40 border border-white/5 p-8 text-right rounded-2xl relative overflow-hidden group hover:border-primary-container/30 transition-all">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/5 blur-xl group-hover:bg-primary-container/10 transition-colors" />
                  <span className="material-symbols-outlined text-slate-700 text-3xl mb-4 block">{stat.icon}</span>
                  <span className={`block text-xl font-black font-data mb-2 tracking-tighter uppercase ${stat.color}`}>{stat.value}</span>
                  <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
              ))}
            </div>

            {isOwner && (
              <Link href={`/projects/${id}/edit`} className="inline-flex items-center gap-3 bg-primary-container/10 border border-primary-container text-primary-container font-black px-10 py-5 text-sm uppercase tracking-[0.3em] hover:bg-primary-container hover:text-background transition-all clip-button shadow-neon-sm">
                <span className="material-symbols-outlined text-base">edit_note</span>
                Modify_Entity_Parameters
              </Link>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-[480px] space-y-10 shrink-0">
            <div className="bg-[#020406]/90 border border-primary-container/30 p-10 clip-card relative shadow-[0_0_60px_rgba(0,255,209,0.1)] group">
              <div className="absolute inset-0 scanline-overlay opacity-5 animate-scanline" />
              <div className="l-bracket-tr text-primary-container" />
              
              <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-primary-container via-transparent to-transparent" />

              <h3 className="text-3xl font-black text-white mb-10 font-headline text-center uppercase tracking-tighter">Funding_Protocol</h3>

              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-end px-2">
                  <div className="space-y-1">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Target Capital</p>
                    <p className="text-white font-data text-3xl font-black tabular-nums tracking-tighter">{target.toLocaleString()} SAR</p>
                  </div>
                  <div className="text-left" dir="ltr">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Percentage</p>
                    <span className="text-4xl font-black text-primary-container tabular-nums italic leading-none">{percentage}%</span>
                  </div>
                </div>
                
                <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10">
                  <div className="absolute inset-0 scanline-overlay opacity-20 animate-scanline" />
                  <div
                    className="h-full bg-gradient-to-r from-primary-container via-[#00d9b5] to-secondary rounded-full shadow-[0_0_20px_rgba(0,255,209,0.6)] transition-all duration-1000 ease-out relative"
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </div>
                </div>
                
                <div className="flex justify-between px-2 text-[11px] font-black uppercase tracking-widest">
                  <span className="text-primary-container animate-pulse">Connection_Secure</span>
                  <span className="text-slate-500 italic">Remaining: {remaining.toLocaleString()} SAR</span>
                </div>
              </div>

              <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-2xl flex gap-5 items-start mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-secondary/30" />
                <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  <span className="text-secondary font-black block mb-1">INVESTMENT_DISCLAIMER</span>
                  Minimum participation is {(project.min_invest || 0).toLocaleString()} SAR. 
                  All transactions are encrypted and processed through the secure network node.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {/* Invest Now */}
                {!isOwner && project.status === 'active' && (
                  <button
                    onClick={handleInvest}
                    className="w-full bg-primary-container text-background font-black py-6 text-xl clip-button text-center shadow-neon hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.3em] holographic-reflection"
                  >
                    Initiate_Investment
                  </button>
                )}

                {/* Message Founder */}
                {!isOwner && (
                  <button
                    onClick={handleMessage}
                    disabled={messagePending}
                    className="w-full bg-secondary/10 border border-secondary/30 text-secondary font-black py-6 text-xl clip-button text-center hover:bg-secondary/20 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.2em] holographic-reflection"
                  >
                    {messagePending ? 'INITIALISING...' : 'Message_Entity'}
                  </button>
                )}

                {/* Save */}
                {!isOwner && (
                  <button
                    onClick={handleSave}
                    disabled={savePending}
                    className={`w-full border font-black py-6 text-xl clip-button text-center active:scale-95 transition-all disabled:opacity-50 uppercase tracking-[0.2em] holographic-reflection ${
                      saved
                        ? 'bg-primary-container/10 border-primary-container/50 text-primary-container'
                        : 'border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    {savePending ? 'UPDATING...' : saved ? '✓ ENTITY_SECURED' : 'Archive_intel'}
                  </button>
                )}
              </div>
            </div>

            {/* Founder Card */}
            {founder && (
              <div
                onClick={() => !isOwner && router.push(`/messages?user=${founder.id}`)}
                className="bg-[#020406]/60 backdrop-blur-xl border border-white/10 p-10 relative hover:border-primary-container/40 transition-all cursor-pointer group clip-card"
              >
                <div className="absolute top-0 right-0 w-12 h-[1px] bg-white/20" />
                <div className="absolute top-0 right-0 w-[1px] h-12 bg-white/20" />
                
                <div className="flex gap-8 items-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl border-2 border-white/10 overflow-hidden shrink-0 group-hover:border-primary-container transition-all duration-500 relative z-10">
                      <Image
                        width={96} height={96}
                        src={founder.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${founder.full_name}`}
                        alt={founder.full_name || 'FOUNDER'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute inset-0 bg-primary-container/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-2xl font-black text-white font-headline group-hover:text-primary-container transition-all duration-300 uppercase tracking-tighter truncate">{founder.full_name || 'ANONYMOUS_SOURCE'}</h4>
                    <p className="text-slate-500 text-sm mb-4 font-body line-clamp-2">{founder.bio || 'Entity bios unavailable.'}</p>
                    {founder.kyc_status === 'verified' && (
                      <span className="text-primary-container font-data text-[10px] font-black uppercase tracking-[0.3em] border border-primary-container/30 px-3 py-1 bg-primary-container/5">Rank: Verified_Founder</span>
                    )}
                  </div>
                </div>
                {!isOwner && (
                  <p className="text-[10px] text-slate-600 mt-6 text-center font-data font-black uppercase tracking-[0.4em] group-hover:text-primary-container transition-colors animate-pulse">Request_Direct_Link ←</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
