'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  category: string
  description: string
  funding_goal: number
  amount_raised: number
  status: string
  verified: boolean
  founder?: { full_name: string; avatar_url: string }
}

export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categories = ['AI', 'FinTech', 'HealthTech', 'CleanEnergy', 'SaaS']

  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = createClient()

        let query = supabase
          .from('projects')
          .select('*')
          .eq('status', 'active')

        if (selectedCategory) {
          query = query.ilike('category', `%${selectedCategory}%`)
        }

        const { data, error: err } = await query.order('created_at', { ascending: false }).limit(12)

        if (err) {
          console.error('Supabase error:', err)
          setError(err.message)
          setLoading(false)
          return
        }

        setProjects((data || []) as Project[])
        setLoading(false)
      } catch (err) {
        console.error('Load projects error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setLoading(false)
      }
    }

    loadProjects()
  }, [selectedCategory])

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 neon-grid opacity-[0.15] pointer-events-none z-0" />
      <div className="fixed inset-0 scanline opacity-10 pointer-events-none z-0" />
      <div className="fixed inset-0 data-stream opacity-[0.05] pointer-events-none z-0" />
      
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <header className="mb-16 relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-container/10 blur-[100px] rounded-full" />
          
          <h1 className="font-headline text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 glitch-layers" data-text="اكتشف الفرص">
            اكتشف الفرص
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-l from-primary-container/50 to-transparent" />
            <p className="text-slate-400 font-data text-lg tracking-wide uppercase">System status: active // browsing_opportunities</p>
            <div className="h-2 w-2 bg-primary-container rounded-full animate-pulse shadow-[0_0_10px_#00ffd1]" />
          </div>

          <p className="text-slate-400 max-w-2xl text-lg mb-10 leading-relaxed">
            استكشف الجيل القادم من الشركات الناشئة والمشاريع التقنية. 
            محرك البحث مدعوم بالذكاء الاصطناعي لاختيار أفضل الفرص الاستثمارية.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`relative px-8 py-4 font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 clip-button holographic-reflection ${
                !selectedCategory
                  ? 'bg-primary-container text-background shadow-neon'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-8 py-4 font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 clip-button holographic-reflection ${
                  selectedCategory === cat
                    ? 'bg-primary-container text-background shadow-neon'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-2 border-primary-container/20 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-primary-container rounded-full animate-spin shadow-[0_0_15px_#00ffd1]" />
              <div className="absolute inset-4 border border-secondary/30 rounded-full animate-pulse" />
            </div>
            <p className="text-primary-container font-data tracking-[0.3em] uppercase animate-pulse">Initialising scanning protocols...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-xl">
            <span className="material-symbols-outlined text-6xl text-red-500 block mb-4 animate-bounce">error</span>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Connection Error</h3>
            <p className="text-slate-400 font-body mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-black rounded-lg transition-all"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-32 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 scanline opacity-5" />
            <span className="material-symbols-outlined text-7xl text-slate-700 block mb-6 transition-transform group-hover:scale-110 duration-500">search_off</span>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">No Data Found</h3>
            <p className="text-slate-400 font-body">لا توجد مشاريع تتوافق مع معايير البحث الحالية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(proj => (
              <Link
                key={proj.id}
                href={`/opportunities/${proj.id}`}
                className="group relative bg-[#020406]/80 border border-white/10 hover:border-primary-container/50 transition-all duration-700 hover:-translate-y-3 clip-card cyber-border-animated"
              >
                {/* Visual Flair */}
                <div className="l-bracket-tr opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="l-bracket-bl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-pulse shadow-[0_0_8px_#00ffd1]" />
                      <span className="text-[10px] font-black px-4 py-1.5 bg-primary-container/10 border border-primary-container/20 rounded-full uppercase tracking-[0.2em] text-primary-container holographic-reflection">
                        {proj.category}
                      </span>
                    </div>
                    {proj.verified && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-md">
                        <span className="material-symbols-outlined text-xs text-secondary">verified</span>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Verified</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 font-headline group-hover:text-primary-container transition-all duration-500 line-clamp-2 leading-tight uppercase">
                    {proj.title}
                  </h3>

                  <p className="text-sm text-slate-400 mb-8 line-clamp-3 leading-relaxed font-body group-hover:text-slate-300 transition-colors">
                    {proj.description}
                  </p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-8 py-6 border-y border-white/5 bg-white/[0.02] -mx-8 px-8">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Status</p>
                      <p className="text-xs font-black text-primary-container uppercase tracking-tight">Active_funding</p>
                    </div>
                    <div className="space-y-1 text-left" dir="ltr">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Founder ID</p>
                      <p className="text-xs font-black text-white truncate">AUTH_USR_{proj.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Amount Raised</p>
                        <p className="text-lg font-black text-white tabular-nums">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR', maximumSignificantDigits: 3 }).format(proj.amount_raised)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary-container tabular-nums italic">
                          {proj.funding_goal > 0 ? Math.round((proj.amount_raised / proj.funding_goal) * 100) : 0}
                          <span className="text-xs not-italic ml-0.5">%</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                      <div className="absolute inset-0 scanline-overlay opacity-20 animate-scanline" />
                      <div
                        className="h-full bg-gradient-to-r from-primary-container to-[#00d9b5] rounded-full shadow-[0_0_15px_rgba(0,255,209,0.5)] transition-all duration-1000 ease-out relative"
                        style={{ width: `${Math.min(100, (proj.amount_raised / proj.funding_goal) * 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
