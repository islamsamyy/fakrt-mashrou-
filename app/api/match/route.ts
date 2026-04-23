import { createClient } from '@/lib/supabase/server'
import { sortProjectsByMatch } from '@/lib/matching-enhanced'
import type { Project, Profile, Investment } from '@/lib/types'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch investor profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch investor's investment history
    const { data: investments } = await supabase
      .from('investments')
      .select(`
        id,
        amount,
        status,
        created_at,
        project:projects (*)
      `)
      .eq('investor_id', user.id)
      .order('created_at', { ascending: false })

    // Fetch all active projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .limit(100)

    if (!projects) {
      return NextResponse.json({
        matches: [],
        total: 0,
      })
    }

    // Calculate matches
    const matches = sortProjectsByMatch(
      projects as Project[],
      profile as Profile,
      investments as any[]
    )

    // Return top 5 matches
    const topMatches = matches.slice(0, 5)

    return NextResponse.json({
      matches: topMatches.map(match => ({
        id: match.project.id,
        title: match.project.title,
        description: match.project.description,
        category: match.project.category,
        funding_goal: match.project.funding_goal,
        amount_raised: match.project.amount_raised,
        verified: match.project.verified,
        img: match.project.img,
        video_url: match.project.video_url,
        founder_id: match.project.founder_id,
        matchScore: match.matchScore,
        scoreBreakdown: match.scoreBreakdown,
      })),
      total: topMatches.length,
      investmentHistoryCount: investments?.length || 0,
    })
  } catch (error) {
    console.error('Match API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
