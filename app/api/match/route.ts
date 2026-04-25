import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sortProjectsByMatch } from '@/lib/matching-enhanced'
import type { Project, Profile, Investment } from '@/lib/types'

const TOP_MATCHES_LIMIT = 5
const PROJECTS_POOL_LIMIT = 100

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [profileResult, investmentsResult, projectsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('investments')
      .select('id, amount, status, created_at, project:projects(*)')
      .eq('investor_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('id, title, description, category, funding_goal, amount_raised, verified, img, video_url, founder_id, status, ai_score')
      .eq('status', 'active')
      .limit(PROJECTS_POOL_LIMIT),
  ])

  if (!profileResult.data) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const projects = projectsResult.data ?? []

  if (projects.length === 0) {
    return NextResponse.json({ matches: [], total: 0, investmentHistoryCount: 0 })
  }

  const matches = sortProjectsByMatch(
    projects as Project[],
    profileResult.data as Profile,
    (investmentsResult.data ?? []) as Investment[]
  )

  const topMatches = matches.slice(0, TOP_MATCHES_LIMIT).map(({ project, matchScore, scoreBreakdown }) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    category: project.category,
    funding_goal: project.funding_goal,
    amount_raised: project.amount_raised,
    verified: project.verified,
    img: project.img,
    video_url: project.video_url,
    founder_id: project.founder_id,
    matchScore,
    scoreBreakdown,
  }))

  return NextResponse.json({
    matches: topMatches,
    total: topMatches.length,
    investmentHistoryCount: investmentsResult.data?.length ?? 0,
  })
}
