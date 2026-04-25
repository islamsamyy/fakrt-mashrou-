'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { SearchResults } from '@/components/search/SearchResults'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialType = (searchParams.get('type') || 'all') as 'all' | 'projects' | 'users' | 'opportunities'

  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState<'all' | 'projects' | 'users' | 'opportunities'>(initialType)

  useEffect(() => {
    const url = new URL(window.location.toString())
    if (query) {
      url.searchParams.set('q', query)
    } else {
      url.searchParams.delete('q')
    }
    if (type !== 'all') {
      url.searchParams.set('type', type)
    } else {
      url.searchParams.delete('type')
    }
    window.history.replaceState({}, '', url)
  }, [query, type])

  return (
    <div className="bg-background text-on-surface font-body min-h-screen relative overflow-x-hidden text-right" dir="rtl">
      <div className="fixed inset-0 hex-grid pointer-events-none z-0 opacity-10"></div>
      <div className="fixed inset-0 scanline pointer-events-none z-0 opacity-10"></div>

      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24 relative z-10 max-w-4xl">
        <header className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            البحث المتقدم
          </h1>
          <p className="text-slate-400 mb-8">
            ابحث عن المشاريع والمستثمرين والفرص الاستثمارية
          </p>
        </header>

        {/* Search Bar */}
        <div className="bg-surface-container-low/40 p-6 rounded-lg border border-white/5 mb-8">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="ابحث عن مشروع أو مستثمر..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-primary-container focus:outline-none"
                autoFocus
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: 'الكل' },
                { value: 'projects' as const, label: 'المشاريع' },
                { value: 'users' as const, label: 'المستثمرون' },
                { value: 'opportunities' as const, label: 'الفرص' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setType(filter.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    type === filter.value
                      ? 'bg-primary-container text-background'
                      : 'bg-surface-container-highest text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {query ? (
          <SearchResults query={query} type={type} limit={30} />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">ابدأ البحث عن المشاريع والفرص الاستثمارية</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
