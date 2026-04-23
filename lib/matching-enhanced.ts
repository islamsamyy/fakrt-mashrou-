import type { Project, Profile, Investment } from './types'

/**
 * Category to interests mapping
 * Maps project categories to common investor interests
 */
const CATEGORY_TO_INTERESTS: Record<string, string[]> = {
  fintech: ['التكنولوجيا المالية', 'fintech'],
  ai: ['الذكاء الاصطناعي', 'AI', 'artificial intelligence'],
  realestate: ['العقارات', 'real estate'],
  health: ['الصحة الرقمية', 'digital health', 'healthcare'],
  energy: ['الطاقة المستدامة', 'sustainable energy'],
  cybersecurity: ['الأمن السيبراني', 'cybersecurity'],
  ecommerce: ['التجارة الإلكترونية', 'e-commerce'],
  logistics: ['سلاسل الإمداد', 'logistics', 'supply chain'],
}

/**
 * Enhanced Match Result with detailed scoring
 */
export interface MatchResult {
  project: Project
  matchScore: number
  scoreBreakdown: {
    categoryMatch: number
    investmentHistory: number
    projectQuality: number
    fundingIndicator: number
    investorProfile: number
  }
}

/**
 * Calculate match score between an investor profile and a project
 * Score ranges from 0-100 based on:
 * - Category/interests match (25 points)
 * - Investment history alignment (25 points - +50% boost if exact category match)
 * - Project verification status (20 points)
 * - Funding progress ratio (15 points)
 * - Profile quality signals (15 points)
 */
export function calculateMatchScore(
  project: Project,
  profile: Profile,
  investmentHistory?: Investment[]
): MatchResult {
  let categoryMatch = 0
  let investmentHistoryScore = 0
  let verificationScore = 0
  let fundingScore = 0
  let profileScore = 0

  // Factor 1: Category match with investor interests (max 25 points)
  const projectInterests = CATEGORY_TO_INTERESTS[project.category ?? ''] ?? []
  const investorInterests = profile.interests ?? []

  const hasExactCategoryMatch = projectInterests.some(pi =>
    investorInterests.some(ii => ii.toLowerCase() === pi.toLowerCase())
  )

  const hasPartialMatch = projectInterests.some(pi =>
    investorInterests.some(ii => ii.toLowerCase().includes(pi.toLowerCase()) || pi.toLowerCase().includes(ii.toLowerCase()))
  )

  if (hasExactCategoryMatch) {
    categoryMatch = 25
  } else if (hasPartialMatch) {
    categoryMatch = 15
  } else if (investorInterests.length > 0) {
    categoryMatch = 5
  }

  // Factor 2: Investment history alignment (max 25 points)
  // Check if investor has invested in similar categories
  if (investmentHistory && investmentHistory.length > 0) {
    const pastProjects = investmentHistory.map(inv => inv.project).filter(Boolean) as Project[]

    // Check for category alignment with past investments
    const investedInSimilarCategory = pastProjects.some(p => p.category === project.category)

    if (investedInSimilarCategory) {
      // +50% boost for exact category match in investment history
      investmentHistoryScore = 25 * 1.5 // 37.5, will cap at 25 later
    } else if (pastProjects.some(p => projectInterests.some(pi => p.category?.includes(pi)))) {
      investmentHistoryScore = 15
    } else {
      investmentHistoryScore = 5
    }
  }

  // Factor 3: Project verification status (max 20 points)
  verificationScore = project.verified ? 20 : 5

  // Factor 4: Funding completeness (max 15 points)
  // Projects with progress indicate investor confidence
  const fundingRatio = project.amount_raised / Math.max(project.funding_goal, 1)
  if (fundingRatio >= 0.75) {
    fundingScore = 15
  } else if (fundingRatio >= 0.5) {
    fundingScore = 12
  } else if (fundingRatio >= 0.25) {
    fundingScore = 8
  } else if (fundingRatio > 0) {
    fundingScore = 3
  }

  // Factor 5: Profile quality signals (max 15 points)
  if (profile.kyc_status === 'verified') {
    profileScore += 8
  }
  if (profile.tier === 'premium') {
    profileScore += 4
  } else if (profile.tier === 'enterprise') {
    profileScore += 7
  }
  if (project.description && project.description.length > 50) {
    profileScore += 3
  }

  const totalScore = Math.min(100, categoryMatch + investmentHistoryScore + verificationScore + fundingScore + profileScore)

  return {
    project,
    matchScore: Math.round(totalScore),
    scoreBreakdown: {
      categoryMatch: Math.round(categoryMatch),
      investmentHistory: Math.min(25, Math.round(investmentHistoryScore)),
      projectQuality: Math.round(verificationScore),
      fundingIndicator: Math.round(fundingScore),
      investorProfile: Math.round(profileScore),
    },
  }
}

/**
 * Sort projects by match score relative to an investor profile
 * Returns projects with computed match scores, sorted descending
 */
export function sortProjectsByMatch(
  projects: Project[],
  profile: Profile,
  investmentHistory?: Investment[]
): MatchResult[] {
  return projects
    .map(p => calculateMatchScore(p, profile, investmentHistory))
    .sort((a, b) => b.matchScore - a.matchScore)
}
