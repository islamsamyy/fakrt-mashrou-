'use client'

import { createClient } from '@/lib/supabase/client'

export interface MatchScore {
  projectId: string
  projectTitle: string
  matchScore: number
  matchReasons: string[]
}

/**
 * Smart matching algorithm for investors to projects
 * Scores based on: category preference, funding range, past investments
 */
export async function getMatchedProjects(
  investorId: string,
  limit: number = 5
): Promise<MatchScore[]> {
  const supabase = createClient()

  // Get investor's investment history
  const { data: investments } = await supabase
    .from('investments')
    .select('project_id, projects(category, funding_goal)')
    .eq('investor_id', investorId)
    .limit(10)

  if (!investments || investments.length === 0) {
    return getTopProjects(limit)
  }

  const categories = investments
    .map(inv => (inv.projects as any)?.category)
    .filter(Boolean)
  const fundingRanges = investments
    .map(inv => (inv.projects as any)?.funding_goal)
    .filter(Boolean)

  const avgFunding =
    fundingRanges.length > 0
      ? fundingRanges.reduce((a, b) => a + b, 0) / fundingRanges.length
      : 5000000

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, category, funding_goal, description')
    .eq('status', 'active')
    .limit(50)

  if (!projects) return []

  const scores = projects
    .map(project => ({
      projectId: project.id,
      projectTitle: project.title,
      matchScore: calculateMatchScore(project, categories, avgFunding),
      matchReasons: getMatchReasons(project, categories, avgFunding),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)

  return scores
}

function calculateMatchScore(
  project: any,
  investorCategories: string[],
  avgFunding: number
): number {
  let score = 0

  if (investorCategories.includes(project.category)) {
    score += 50
  } else {
    score += 10
  }

  const fundingDiff = Math.abs(project.funding_goal - avgFunding)
  const fundingRangePercentage = fundingDiff / avgFunding
  if (fundingRangePercentage <= 0.3) {
    score += 30
  } else if (fundingRangePercentage <= 0.5) {
    score += 15
  }

  score += Math.random() * 10

  return Math.min(100, score)
}

function getMatchReasons(
  project: any,
  investorCategories: string[],
  avgFunding: number
): string[] {
  const reasons: string[] = []

  if (investorCategories.includes(project.category)) {
    reasons.push(`Matches your ${project.category} preference`)
  }

  const fundingDiff = Math.abs(project.funding_goal - avgFunding)
  if (fundingDiff / avgFunding <= 0.3) {
    reasons.push(`Funding goal within your range`)
  }

  return reasons.slice(0, 2)
}

async function getTopProjects(limit: number): Promise<MatchScore[]> {
  const supabase = createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, category, funding_goal')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!projects) return []

  return projects.map(project => ({
    projectId: project.id,
    projectTitle: project.title,
    matchScore: 50,
    matchReasons: ['New project', project.category],
  }))
}
