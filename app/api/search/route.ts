import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SearchType = 'project' | 'user' | 'opportunity'

interface SearchResult {
  type: SearchType
  id: string
  title: string
  description?: string | null
  category?: string | null
  avatar?: string | null
  role?: string | null
  fundingGoal?: number | null
  amountRaised?: number | null
  status?: string | null
}

const SEARCH_TYPES = ['projects', 'users', 'opportunities', 'all'] as const
const MAX_RESULTS = 50

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')?.trim()
  const type = searchParams.get('type') ?? 'all'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), MAX_RESULTS)

  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'البحث يجب أن يكون حرفين على الأقل', results: [] }, { status: 400 })
  }

  if (!SEARCH_TYPES.includes(type as typeof SEARCH_TYPES[number])) {
    return NextResponse.json({ error: 'نوع البحث غير صحيح', results: [] }, { status: 400 })
  }

  const supabase = await createClient()
  const results: SearchResult[] = []
  const searchPattern = `%${q}%`

  if (type === 'all' || type === 'projects') {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, description, category, funding_goal, amount_raised, status, img')
      .ilike('title', searchPattern)
      .eq('status', 'active')
      .limit(limit)

    if (projects) {
      results.push(
        ...projects.map((p) => ({
          type: 'project' as const,
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category,
          avatar: p.img,
          fundingGoal: p.funding_goal,
          amountRaised: p.amount_raised,
          status: p.status,
        }))
      )
    }
  }

  if (type === 'all' || type === 'users') {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role, bio')
      .ilike('full_name', searchPattern)
      .limit(limit)

    if (users) {
      results.push(
        ...users.map((u) => ({
          type: 'user' as const,
          id: u.id,
          title: u.full_name,
          description: u.bio,
          avatar: u.avatar_url,
          role: u.role,
        }))
      )
    }
  }

  if (type === 'all' || type === 'opportunities') {
    const { data: opportunities } = await supabase
      .from('saved_opportunities')
      .select('id, project:projects(id, title, description, category, status)')
      .limit(limit)

    if (opportunities) {
      results.push(
        ...opportunities
          .map((opp) => {
            const project = Array.isArray(opp.project) ? opp.project[0] : opp.project
            return project
              ? {
                  type: 'opportunity' as const,
                  id: opp.id,
                  title: project.title,
                  description: project.description,
                  category: project.category,
                  status: project.status,
                }
              : null
          })
          .filter((x) => x !== null)
      )
    }
  }

  const filtered = results.slice(0, limit)

  return NextResponse.json({
    query: q,
    results: filtered,
    total: filtered.length,
  })
}
