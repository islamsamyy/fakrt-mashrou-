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

  const categories = ['AI', 'FinTech', 'HealthTech', 'CleanEnergy', 'SaaS']

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient()

      let query = supabase
        .from('projects')
        .select(`
          id, title, category, description, funding_goal, amount_raised, status, verified,
          founder:founder_id(full_name, avatar_url)
        `)
        .eq('status', 'active')

      if (selectedCategory) {
        query = query.ilike('category', `%${selectedCategory}%`)
      }

      const { data } = await query.order('created_at', { ascending: false }).limit(12)
      const projects = (data || []).map((p: any) => ({
        ...p,
        founder: Array.isArray(p.founder) ? p.founder[0] : p.founder,
      }))
      setProjects(projects as unknown as Project[])
      setLoading(false)
    }

    loadProjects()
  }, [selectedCategory])

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid opacity-5 pointer-events-none z-0" />
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <header className="mb-16">
          <h1 className="font-headline text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-6">
            اكتشف الفرص
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg mb-8">اختر الفئات التي تهمك وشاهد المشاريع المخصصة لك</p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-lg font-black text-sm uppercase tracking-widest transition-all ${
                !selectedCategory
                  ? 'bg-primary-container text-background shadow-[0_0_20px_rgba(0,255,209,0.3)]'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-lg font-black text-sm uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-container text-background shadow-[0_0_20px_rgba(0,255,209,0.3)]'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined text-5xl text-primary-container animate-spin">progress_activity</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-600 block mb-4">search_off</span>
            <p className="text-slate-400 font-body">لا توجد مشاريع في هذه الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <Link
                key={proj.id}
                href={`/opportunities/${proj.id}`}
                className="group relative bg-[#0A1628] border border-white/5 hover:border-primary-container/30 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black px-3 py-1 bg-primary-container/10 border border-primary-container/20 rounded-full uppercase tracking-widest text-primary-container">
                      {proj.category}
                    </span>
                    {proj.verified && (
                      <span className="material-symbols-outlined text-sm text-secondary-container">verified</span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-white mb-3 font-headline group-hover:text-primary-container transition-colors line-clamp-2">
                    {proj.title}
                  </h3>

                  <p className="text-sm text-slate-400 mb-6 line-clamp-2">{proj.description}</p>

                  {/* Founder */}
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                    <Image
                      src={proj.founder?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${proj.id}`}
                      alt={proj.founder?.full_name || 'مؤسس'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <p className="text-sm font-bold text-white">{proj.founder?.full_name || 'مؤسس'}</p>
                  </div>

                  {/* Funding */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">التمويل المجمع</span>
                      <span className="text-primary-container font-black">
                        {proj.funding_goal > 0 ? Math.round((proj.amount_raised / proj.funding_goal) * 100) : 0}٪
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container shadow-[0_0_10px_#00ffd1]"
                        style={{ width: `${Math.min(100, (proj.amount_raised / proj.funding_goal) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
