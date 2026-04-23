'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

/**
 * BUG #13 FIX: Sync search/filter/pagination to URL
 * Updates URL when search term, filters, or page changes
 * Allows browser back/forward to work correctly
 */

interface SearchParams {
  search?: string
  category?: string
  minFunding?: number
  maxFunding?: number
  sortBy?: 'newest' | 'trending' | 'mostFunded'
  page?: number
  status?: 'active' | 'completed' | 'failed'
  [key: string]: string | number | undefined
}

export function useSearchParamsSync() {
  const router = useRouter()
  const searchParams = useSearchParams()

  /**
   * Update URL with new search parameters
   * Usage: updateParams({ search: 'تطبيق', category: 'AI', page: 1 })
   */
  const updateParams = useCallback(
    (newParams: SearchParams) => {
      const params = new URLSearchParams(searchParams.toString())

      // Update or remove each parameter
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      // Create new URL with updated params
      const newUrl = params.toString()
      const pathname = window.location.pathname
      router.push(`${pathname}${newUrl ? '?' + newUrl : ''}`)
    },
    [router, searchParams]
  )

  /**
   * Get current search parameter
   */
  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key)
    },
    [searchParams]
  )

  /**
   * Get current search parameter as number
   */
  const getNumberParam = useCallback(
    (key: string): number | null => {
      const value = searchParams.get(key)
      return value ? parseInt(value, 10) : null
    },
    [searchParams]
  )

  /**
   * Clear all search parameters
   */
  const clearParams = useCallback(() => {
    router.push(window.location.pathname)
  }, [router])

  /**
   * Update search term specifically
   */
  const setSearch = useCallback(
    (search: string) => {
      const newParams = new URLSearchParams(searchParams.toString())
      if (search) {
        newParams.set('search', search)
        newParams.set('page', '1') // Reset to first page on new search
      } else {
        newParams.delete('search')
      }
      router.push(`${window.location.pathname}?${newParams.toString()}`)
    },
    [router, searchParams]
  )

  /**
   * Update category filter
   */
  const setCategory = useCallback(
    (category: string | null) => {
      const newParams = new URLSearchParams(searchParams.toString())
      if (category) {
        newParams.set('category', category)
        newParams.set('page', '1') // Reset to first page on filter change
      } else {
        newParams.delete('category')
      }
      router.push(`${window.location.pathname}?${newParams.toString()}`)
    },
    [router, searchParams]
  )

  /**
   * Update page number
   */
  const setPage = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(searchParams.toString())
      if (page > 1) {
        newParams.set('page', String(page))
      } else {
        newParams.delete('page')
      }
      router.push(`${window.location.pathname}?${newParams.toString()}`)
    },
    [router, searchParams]
  )

  /**
   * Update sort order
   */
  const setSort = useCallback(
    (sortBy: 'newest' | 'trending' | 'mostFunded' | null) => {
      const newParams = new URLSearchParams(searchParams.toString())
      if (sortBy) {
        newParams.set('sortBy', sortBy)
      } else {
        newParams.delete('sortBy')
      }
      router.push(`${window.location.pathname}?${newParams.toString()}`)
    },
    [router, searchParams]
  )

  return {
    updateParams,
    getParam,
    getNumberParam,
    clearParams,
    setSearch,
    setCategory,
    setPage,
    setSort,
    searchParams,
  }
}

/**
 * Example usage in a component:
 *
 * export function DiscoverPage() {
 *   const { setSearch, setCategory, setPage, getParam, getNumberParam } = useSearchParamsSync()
 *   const [projects, setProjects] = useState([])
 *
 *   // Load projects based on current URL params
 *   useEffect(() => {
 *     const search = getParam('search') || ''
 *     const category = getParam('category') || ''
 *     const page = getNumberParam('page') || 1
 *
 *     loadProjects({ search, category, page })
 *   }, [getParam, getNumberParam])
 *
 *   return (
 *     <div>
 *       {/* Search input */}
 *       <input
 *         onChange={(e) => setSearch(e.target.value)}
 *         value={getParam('search') || ''}
 *         placeholder="ابحث عن مشاريع..."
 *       />
 *
 *       {/* Category filter */}
 *       <select onChange={(e) => setCategory(e.target.value)}>
 *         <option value="">جميع الفئات</option>
 *         <option value="AI">AI</option>
 *         <option value="FinTech">FinTech</option>
 *       </select>
 *
 *       {/* Pagination */}
 *       <button onClick={() => setPage((getNumberParam('page') || 1) + 1)}>
 *         الصفحة التالية
 *       </button>
 *     </div>
 *   )
 * }
 */
