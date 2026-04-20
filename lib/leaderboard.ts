/**
 * Leaderboard Ranking Algorithm
 * Calculates scores for investors and founders based on various metrics
 */

export interface InvestorScore {
  userId: string;
  name: string;
  avatarUrl: string;
  score: number;
  rank: number;
  metrics: {
    totalInvested: number;
    dealCount: number;
    avgInvestment: number;
    portfolioDiversity: number;
    kycStatus: string;
  };
}

export interface FounderScore {
  userId: string;
  name: string;
  avatarUrl: string;
  score: number;
  rank: number;
  metrics: {
    totalRaised: number;
    projectCount: number;
    fundingSuccessRate: number;
    avgFundingProgress: number;
    kycStatus: string;
  };
}

/**
 * Calculate investor score
 *
 * Score based on:
 * - Total amount invested (40%)
 * - Number of deals (30%)
 * - Portfolio diversity (20%)
 * - KYC verification (10%)
 */
export function calculateInvestorScore(
  totalInvested: number,
  dealCount: number,
  projectCategories: string[],
  kycStatus: string
): number {
  let score = 0;

  // Total invested score (max 400 points)
  const investmentScore = Math.min(400, (totalInvested / 10000000) * 400);
  score += investmentScore;

  // Deal count score (max 300 points)
  const dealScore = Math.min(300, (dealCount / 50) * 300);
  score += dealScore;

  // Portfolio diversity score (max 200 points)
  const uniqueCategories = new Set(projectCategories).size;
  const diversityScore = Math.min(200, (uniqueCategories / 6) * 200);
  score += diversityScore;

  // KYC bonus (max 100 points)
  const kycBonus = kycStatus === 'verified' ? 100 : kycStatus === 'pending' ? 50 : 0;
  score += kycBonus;

  return Math.round(score);
}

/**
 * Calculate founder score
 *
 * Score based on:
 * - Total amount raised (40%)
 * - Number of projects (25%)
 * - Funding success rate (25%)
 * - Average funding progress (10%)
 */
export function calculateFounderScore(
  totalRaised: number,
  projectCount: number,
  fundedProjects: number,
  avgProgress: number,
  kycStatus: string
): number {
  let score = 0;

  // Total raised score (max 400 points)
  const raisedScore = Math.min(400, (totalRaised / 50000000) * 400);
  score += raisedScore;

  // Project count score (max 250 points)
  const projectScore = Math.min(250, (projectCount / 20) * 250);
  score += projectScore;

  // Funding success rate (max 250 points)
  const successRate = projectCount > 0 ? fundedProjects / projectCount : 0;
  const successScore = Math.min(250, successRate * 250);
  score += successScore;

  // Average funding progress (max 100 points)
  const progressScore = Math.min(100, avgProgress);
  score += progressScore;

  // KYC bonus (max 100 points) - but lower than investor to encourage founding
  const kycBonus = kycStatus === 'verified' ? 50 : 0;
  score += kycBonus;

  return Math.round(score);
}

/**
 * Rank investors based on scores
 */
export function rankInvestors(investors: (InvestorScore | any)[]): InvestorScore[] {
  // Sort by score descending
  const sorted = [...investors].sort((a, b) => b.score - a.score);

  // Assign ranks (handle ties)
  let currentRank = 1;
  const ranked = sorted.map((investor, index) => {
    if (index > 0 && investor.score < sorted[index - 1].score) {
      currentRank = index + 1;
    }
    return {
      ...investor,
      rank: currentRank,
    };
  });

  return ranked;
}

/**
 * Rank founders based on scores
 */
export function rankFounders(founders: (FounderScore | any)[]): FounderScore[] {
  // Sort by score descending
  const sorted = [...founders].sort((a, b) => b.score - a.score);

  // Assign ranks (handle ties)
  let currentRank = 1;
  const ranked = sorted.map((founder, index) => {
    if (index > 0 && founder.score < sorted[index - 1].score) {
      currentRank = index + 1;
    }
    return {
      ...founder,
      rank: currentRank,
    };
  });

  return ranked;
}

/**
 * Get top investors with ranking
 * This would be called from leaderboard page
 */
export async function getTopInvestors(limit = 10): Promise<InvestorScore[]> {
  // This would fetch from database and calculate scores
  // Placeholder for now
  return [];
}

/**
 * Get top founders with ranking
 * This would be called from leaderboard page
 */
export async function getTopFounders(limit = 10): Promise<FounderScore[]> {
  // This would fetch from database and calculate scores
  // Placeholder for now
  return [];
}

/**
 * Get investor rank change
 * Compares current rank to previous period
 */
export function getRankChange(currentRank: number, previousRank: number): 'up' | 'down' | 'same' {
  if (currentRank < previousRank) return 'up';
  if (currentRank > previousRank) return 'down';
  return 'same';
}

/**
 * Get score breakdown explanation for user
 */
export function getScoreBreakdown(type: 'investor' | 'founder', score: number) {
  if (type === 'investor') {
    return {
      investment: Math.min(400, (score * 0.4) | 0),
      deals: Math.min(300, (score * 0.3) | 0),
      diversity: Math.min(200, (score * 0.2) | 0),
      kyc: Math.min(100, (score * 0.1) | 0),
    };
  } else {
    return {
      raised: Math.min(400, (score * 0.4) | 0),
      projects: Math.min(250, (score * 0.25) | 0),
      successRate: Math.min(250, (score * 0.25) | 0),
      progress: Math.min(100, score * 0.1 | 0),
    };
  }
}

/**
 * Achievement badges based on metrics
 */
export function getInvestorBadges(
  totalInvested: number,
  dealCount: number,
  kycStatus: string
): string[] {
  const badges: string[] = [];

  if (totalInvested >= 100000) badges.push('big_spender');
  if (totalInvested >= 1000000) badges.push('mega_investor');
  if (dealCount >= 10) badges.push('deal_master');
  if (dealCount >= 25) badges.push('portfolio_pro');
  if (kycStatus === 'verified') badges.push('verified');

  return badges;
}

export function getFounderBadges(
  totalRaised: number,
  projectCount: number,
  fundedProjects: number,
  kycStatus: string
): string[] {
  const badges: string[] = [];

  if (totalRaised >= 500000) badges.push('fundraiser');
  if (totalRaised >= 5000000) badges.push('mega_founder');
  if (projectCount >= 3) badges.push('prolific');
  if (fundedProjects > 0) badges.push('successful');
  if (fundedProjects >= 2) badges.push('serial_success');
  if (kycStatus === 'verified') badges.push('verified');

  return badges;
}
