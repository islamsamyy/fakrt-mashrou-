/**
 * Backend Logic Test Suite
 * Tests all critical business logic
 */

import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateFundingAmount,
  validateInvestmentAmount,
  sanitizeText,
} from './lib/validation';

import {
  calculateInvestorScore,
  calculateFounderScore,
  rankInvestors,
  rankFounders,
  getInvestorBadges,
  getFounderBadges,
} from './lib/leaderboard';

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, passed: boolean, details?: string) {
  if (passed) {
    console.log(`${GREEN}✓${RESET} ${name}`);
    testsPassed++;
  } else {
    console.log(`${RED}✗${RESET} ${name}`);
    if (details) console.log(`  ${details}`);
    testsFailed++;
  }
}

console.log(`\n${YELLOW}=== BACKEND LOGIC TEST SUITE ===${RESET}\n`);

// ==================== VALIDATION TESTS ====================
console.log(`${YELLOW}1. VALIDATION TESTS${RESET}`);

// Email validation
let isValid = validateEmail('test@example.com');
test('Valid email accepted', isValid === true);

isValid = validateEmail('invalid-email');
test('Invalid email rejected', isValid === false);

isValid = validateEmail('test@example.co');
test('Email with valid TLD accepted', isValid === true);

// Password validation
let result = validatePassword('StrongPass123');
test('Strong password accepted', result.valid);

result = validatePassword('weak');
test('Weak password rejected', !result.valid);

result = validatePassword('NoNumbers');
test('Password without numbers rejected', !result.valid);

// Full name validation
result = validateFullName('أحمد محمد');
test('Arabic name accepted', result.valid);

result = validateFullName('John Doe');
test('English name accepted', result.valid);

result = validateFullName('A');
test('Single character name rejected', !result.valid);

// Funding amount validation (SAR)
result = validateFundingAmount(100000);
test('Valid funding amount (100k SAR) accepted', result.valid);

result = validateFundingAmount(1000000);
test('Valid funding amount (1M SAR) accepted', result.valid);

result = validateFundingAmount(10000);
test('Low funding amount (10k SAR) rejected', !result.valid);

result = validateFundingAmount(200000000);
test('Very high funding amount rejected', !result.valid);

// Investment amount validation
result = validateInvestmentAmount(5000);
test('Valid investment amount (5k SAR) accepted', result.valid);

result = validateInvestmentAmount(100000);
test('Valid investment amount (100k SAR) accepted', result.valid);

result = validateInvestmentAmount(500);
test('Low investment amount (500 SAR) rejected', !result.valid);

result = validateInvestmentAmount(20000000);
test('Very high investment amount rejected', !result.valid);

// Text sanitization
let sanitized = sanitizeText('<script>alert("xss")</script>');
test(
  'XSS attempts sanitized',
  !sanitized.includes('<script>') && !sanitized.includes('alert')
);

sanitized = sanitizeText('Normal text with émojis 🎉');
test('Normal text preserved', sanitized === 'Normal text with émojis 🎉');

// ==================== LEADERBOARD TESTS ====================
console.log(`\n${YELLOW}2. LEADERBOARD RANKING TESTS${RESET}`);

// Investor scoring
let investorScore = calculateInvestorScore(
  1000000, // total invested
  25, // deal count
  ['AI', 'FinTech', 'SaaS'], // categories
  'verified' // kyc status
);
test('Investor score calculated', investorScore > 0 && investorScore <= 1000);
console.log(`  Score: ${investorScore}/1000`);

// Founder scoring
let founderScore = calculateFounderScore(
  5000000, // total raised
  3, // project count
  2, // funded projects
  75, // avg progress
  'verified' // kyc status
);
test('Founder score calculated', founderScore > 0 && founderScore <= 1000);
console.log(`  Score: ${founderScore}/1000`);

// Investor ranking
const investors = [
  {
    userId: '1',
    name: 'Investor A',
    avatarUrl: '',
    score: 850,
    metrics: {},
  },
  {
    userId: '2',
    name: 'Investor B',
    avatarUrl: '',
    score: 920,
    metrics: {},
  },
  {
    userId: '3',
    name: 'Investor C',
    avatarUrl: '',
    score: 920,
    metrics: {},
  },
];

const rankedInvestors = rankInvestors(investors);
test('Investors ranked correctly', rankedInvestors[0].rank === 1);
test('Tie-breaking works', rankedInvestors[1].rank === 2 && rankedInvestors[2].rank === 2);
test('All investors ranked', rankedInvestors.length === 3);

// Founder ranking
const founders = [
  {
    userId: '1',
    name: 'Founder A',
    avatarUrl: '',
    score: 700,
    metrics: {},
  },
  {
    userId: '2',
    name: 'Founder B',
    avatarUrl: '',
    score: 850,
    metrics: {},
  },
];

const rankedFounders = rankFounders(founders);
test('Founders ranked correctly', rankedFounders[0].rank === 1);
test('Highest score ranked first', rankedFounders[0].score > rankedFounders[1].score);

// Badges
const investorBadges = getInvestorBadges(2000000, 15, 'verified');
test('Investor badges awarded', investorBadges.includes('mega_investor'));
test('Verified badge awarded', investorBadges.includes('verified'));
console.log(`  Badges: ${investorBadges.join(', ')}`);

const founderBadges = getFounderBadges(10000000, 5, 3, 'verified');
test('Founder badges awarded', founderBadges.includes('mega_founder'));
test('Prolific badge awarded', founderBadges.includes('prolific'));
console.log(`  Badges: ${founderBadges.join(', ')}`);

// ==================== DATA INTEGRITY TESTS ====================
console.log(`\n${YELLOW}3. DATA STRUCTURE TESTS${RESET}`);

// Validate scoring formula constraints
test('Investor score capped at 1000', investorScore <= 1000);
test('Founder score capped at 1000', founderScore <= 1000);

// Test score components
test('Investment component (40%)', calculateInvestorScore(10000000, 0, [], 'pending') > 300);
test('Deal count component (30%)', calculateInvestorScore(0, 50, [], 'pending') > 200);
test('Diversity component (20%)', calculateInvestorScore(0, 0, ['AI', 'FinTech', 'SaaS'], 'pending') > 50);
test('KYC bonus component (10%)', calculateInvestorScore(0, 0, [], 'verified') === 100);

// ==================== SUMMARY ====================
console.log(`\n${YELLOW}=== TEST SUMMARY ===${RESET}`);
console.log(
  `${GREEN}Passed: ${testsPassed}${RESET} | ${testsFailed > 0 ? RED + 'Failed: ' + testsFailed + RESET : GREEN + 'Failed: 0' + RESET}`
);

if (testsFailed === 0) {
  console.log(`\n${GREEN}✓ All tests passed!${RESET}\n`);
  process.exit(0);
} else {
  console.log(`\n${RED}✗ Some tests failed${RESET}\n`);
  process.exit(1);
}
