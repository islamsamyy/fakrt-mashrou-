import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface FilterQuery {
  status?: string
  category?: string
  minGoal?: number
  maxGoal?: number
  minRaised?: number
  maxRaised?: number
  verified?: boolean
  sortBy?: 'recent' | 'funded' | 'trending' | 'goal'
  limit?: number
  offset?: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse filter parameters
    const filters: FilterQuery = {
      status: searchParams.get('status') || 'active',
      category: searchParams.get('category') || undefined,
      minGoal: searchParams.get('minGoal') ? parseInt(searchParams.get('minGoal')!) : undefined,
      maxGoal: searchParams.get('maxGoal') ? parseInt(searchParams.get('maxGoal')!) : undefined,
      minRaised: searchParams.get('minRaised') ? parseInt(searchParams.get('minRaised')!) : undefined,
      maxRaised: searchParams.get('maxRaised') ? parseInt(searchParams.get('maxRaised')!) : undefined,
      verified: searchParams.get('verified') === 'true',
      sortBy: (searchParams.get('sortBy') || 'recent') as 'recent' | 'funded' | 'trending' | 'goal',
      limit: parseInt(searchParams.get('limit') || '20', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
    }

    // Validate limits
    if (filters.limit! > 100) filters.limit = 100
    if (filters.offset! < 0) filters.offset = 0

    const supabase = await createClient()

    // Build query
    let query = supabase.from('projects').select(`
      id,
      title,
      description,
      category,
      funding_goal,
      amount_raised,
      status,
      verified,
      img,
      video_url,
      founder_id,
      created_at,
      founder:profiles (id, full_name, avatar_url, kyc_status)
    `)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.category) {
      query = query.ilike('category', `%${filters.category}%`)
    }

    if (filters.minGoal !== undefined) {
      query = query.gte('funding_goal', filters.minGoal)
    }

    if (filters.maxGoal !== undefined) {
      query = query.lte('funding_goal', filters.maxGoal)
    }

    if (filters.minRaised !== undefined) {
      query = query.gte('amount_raised', filters.minRaised)
    }

    if (filters.maxRaised !== undefined) {
      query = query.lte('amount_raised', filters.maxRaised)
    }

    if (filters.verified) {
      query = query.eq('verified', true)
    }

    // Apply sorting
    const sortConfig: { column: string; ascending: boolean } = {
      column: 'created_at',
      ascending: false,
    }

    if (filters.sortBy === 'funded') {
      sortConfig.column = 'amount_raised'
      sortConfig.ascending = false
    } else if (filters.sortBy === 'goal') {
      sortConfig.column = 'funding_goal'
      sortConfig.ascending = false
    } else if (filters.sortBy === 'trending') {
      // Trending = highest percentage funded
      sortConfig.column = 'created_at'
      sortConfig.ascending = false
    }

    // Get total count
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })

    // Apply pagination and sorting
    const { data: projects, error } = await query
      .order(sortConfig.column, { ascending: sortConfig.ascending })
      .range(filters.offset!, filters.offset! + filters.limit! - 1)

    if (error) {
      console.error('Project filter error:', error)
      return NextResponse.json(
        { error: 'Failed to filter projects', statusCode: 500 },
        { status: 500 }
      )
    }

    // Calculate funding percentage for each project
    const enrichedProjects = (projects || []).map(p => ({
      ...p,
      fundingPercentage: p.funding_goal ? Math.round((p.amount_raised / p.funding_goal) * 100) : 0,
    }))

    // Re-sort by trending if needed
    if (filters.sortBy === 'trending') {
      enrichedProjects.sort((a, b) => b.fundingPercentage - a.fundingPercentage)
    }

    return NextResponse.json({
      success: true,
      data: enrichedProjects,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: count,
        hasMore: (filters.offset! + filters.limit!) < (count || 0),
      },
      statusCode: 200,
    })
  } catch (error) {
    console.error('Projects filter error:', error)
    return NextResponse.json(
      { error: 'Internal server error', statusCode: 500 },
      { status: 500 }
    )
  }
}
