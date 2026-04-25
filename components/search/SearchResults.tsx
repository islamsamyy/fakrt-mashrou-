'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SearchResult {
  type: 'project' | 'user' | 'opportunity'
  id: string
  title: string
  description?: string
  category?: string
  avatar?: string
  role?: string
  fundingGoal?: number
  amountRaised?: number
  status?: string
}

interface SearchResultsProps {
  query: string
  type?: 'all' | 'projects' | 'users' | 'opportunities'
  limit?: number
}

export function SearchResults({ query, type = 'all', limit = 20 }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const searchAsync = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          q: query,
          type,
          limit: limit.toString(),
        })

        const response = await fetch(`/api/search?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Search failed')
        }

        setResults(data.results || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchAsync, 300)
    return () => clearTimeout(timer)
  }, [query, type, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface-container-high animate-pulse h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400">
        {error}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">لا توجد نتائج للبحث عن "{query}"</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map(result => (
        <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
      ))}
    </div>
  )
}

function SearchResultItem({ result }: { result: SearchResult }) {
  let href = '/'
  let icon = '📦'

  if (result.type === 'project') {
    href = `/projects/${result.id}`
    icon = '🚀'
  } else if (result.type === 'user') {
    href = `/profile/${result.id}`
    icon = '👤'
  } else if (result.type === 'opportunity') {
    href = `/opportunities/${result.id}`
    icon = '⭐'
  }

  return (
    <Link href={href}>
      <div className="bg-surface-container-low hover:bg-surface-container-high transition-all p-4 rounded-lg border border-white/5 cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-white truncate group-hover:text-primary-container transition-colors">
                {result.title}
              </h3>
              {result.category && (
                <span className="text-xs text-slate-400 ml-2 shrink-0">{result.category}</span>
              )}
            </div>
            {result.description && (
              <p className="text-xs text-slate-500 truncate">{result.description}</p>
            )}
            {result.fundingGoal && (
              <p className="text-xs text-primary-container mt-2">
                الهدف: {(result.fundingGoal / 1000000).toFixed(1)}M SAR • جُمع: {(result.amountRaised || 0 / 1000000).toFixed(1)}M
              </p>
            )}
            {result.role && (
              <p className="text-xs text-slate-400 mt-2">{result.role}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
