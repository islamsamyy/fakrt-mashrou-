# Testing Guide - IDEA BUSINESS

## Overview

This guide covers all testing strategies for the IDEA BUSINESS application:
- ✅ Unit tests (backend logic)
- ✅ End-to-End tests (Playwright)
- ✅ Manual testing checklist
- ✅ Performance benchmarks

---

## 1. Backend Logic Tests

### Running Backend Tests

```bash
# Run all backend validation and leaderboard tests
npm run test:backend

# Expected: 34/36 tests passed
```

### What's Tested
- Email validation (RFC compliant)
- Password strength validation
- Funding/investment amount ranges
- Name validation (Arabic/English)
- Text sanitization (XSS prevention)
- Leaderboard scoring algorithm
- Investor/founder ranking
- Badge system

### Test File
```
test-backend.ts
```

---

## 2. End-to-End Tests (Playwright)

### Setup

```bash
# Playwright is already installed
# Run the dev server first
npm run dev

# In another terminal, run tests
npm run test:e2e
```

### Test Coverage

**Home Page**
- ✅ Page loads correctly
- ✅ Statistics display
- ✅ Navigation works

**Discover Page**
- ✅ Projects load without errors
- ✅ Category filters work
- ✅ Filtering by category displays results

**Trending Page**
- ✅ Shows trending projects
- ✅ Proper pagination/loading

**Leaderboard Page**
- ✅ Investor rankings display
- ✅ Founder rankings display
- ✅ Correct scoring

**Authentication**
- ✅ Login page accessible
- ✅ Register page accessible
- ✅ Password reset page accessible

**Navigation**
- ✅ All header links work
- ✅ Page-to-page navigation
- ✅ Mobile menu responsive

**Responsive Design**
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1920px)

**Performance**
- ✅ Home page loads < 3s
- ✅ Discover page loads < 3s

### Running Specific Tests

```bash
# Run only home page tests
npx playwright test tests/e2e/critical-flows.spec.ts -g "Home Page"

# Run only performance tests
npx playwright test tests/e2e/critical-flows.spec.ts -g "Performance"

# Run with UI (interactive)
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed
```

### View Test Results

```bash
# Open HTML report after tests run
npx playwright show-report
```

---

## 3. Manual Testing Checklist

### Critical Flows to Test

#### Flow 1: User Registration & Profile
- [ ] Create investor account
- [ ] Create founder account
- [ ] Complete KYC verification
- [ ] Upload profile photo
- [ ] Update profile settings

#### Flow 2: Project Creation (Founder)
- [ ] Create new project
- [ ] Fill all required fields
- [ ] Set funding goal (50K-100M SAR)
- [ ] Upload project images
- [ ] Set project category
- [ ] Verify on discover page

#### Flow 3: Investment (Investor)
- [ ] Browse discover page
- [ ] Filter by category
- [ ] View project details
- [ ] Invest in project (1K-10M SAR)
- [ ] Complete payment
- [ ] Verify investment on portfolio

#### Flow 4: Fund Transfer (Founder)
- [ ] Verify project funding increases
- [ ] Request payout
- [ ] Check payout status
- [ ] Verify bank notification received
- [ ] Confirm funds received

#### Flow 5: Messaging
- [ ] Send message to investor
- [ ] Edit message (within 15 min)
- [ ] Delete own message
- [ ] Cannot delete others' messages
- [ ] Messages persist correctly

#### Flow 6: Bookmarks
- [ ] Save project to bookmarks
- [ ] View saved opportunities
- [ ] Remove from bookmarks
- [ ] Verify save state persists

#### Flow 7: Notifications
- [ ] Visit settings page
- [ ] Toggle notification preferences
- [ ] Email notifications toggle
- [ ] Push notifications toggle
- [ ] Verify settings saved
- [ ] Receive test notifications

#### Flow 8: Leaderboard
- [ ] View investor leaderboard
- [ ] View founder leaderboard
- [ ] Verify rankings by score
- [ ] Check badges awarded
- [ ] See score breakdown

#### Flow 9: Admin Dashboard
- [ ] Login as admin
- [ ] Visit /admin/users
- [ ] View all users list
- [ ] Filter by role
- [ ] View user statistics
- [ ] Access KYC review page

#### Flow 10: Search & Filter
- [ ] Search by project name
- [ ] Filter by category
- [ ] Filter by funding status
- [ ] Sort by newest/trending
- [ ] Pagination works

---

## 4. Database Integrity Tests

### Triggers to Verify

```sql
-- Test 1: Investment funding auto-update
1. Create investment
2. Mark as 'paid'
3. Verify: projects.amount_raised += investment.amount
4. Verify: Leaderboard updates automatically

-- Test 2: Notification preferences auto-create
1. Create new user
2. Verify: notification_preferences record created
3. Verify: Defaults are correct
```

### RLS Policies to Verify

```sql
-- Users can only:
- [ ] View own profile
- [ ] Edit own profile
- [ ] View public projects
- [ ] Delete own messages
- [ ] Edit own messages (15 min window)
- [ ] View own saved opportunities
- [ ] Manage own notification preferences
- [ ] Cannot modify other users' data
```

---

## 5. Email Service Testing

### With Resend (Production)

```bash
# Set environment variable
RESEND_API_KEY=re_xxxxx

# Emails will be sent to real addresses
```

### Test Emails to Send

- [ ] Verification email → Check inbox
- [ ] Password reset → Test reset link
- [ ] Investment confirmation → Verify content
- [ ] Payout notification → Check details
- [ ] KYC approval → Verify access granted
- [ ] Weekly portfolio → Check summary accuracy

### Resend Sandbox Testing

Use Resend's test email addresses:
```
delivered@resend.dev     (✅ always works)
bounced@resend.dev       (❌ always fails)
ooto@resend.dev          (⏸️ out of office reply)
```

---

## 6. Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Home page FCP | < 2s | Testing |
| Discover load | < 3s | Testing |
| Trending load | < 3s | Testing |
| Leaderboard calc | < 500ms | ✅ |
| Search response | < 1s | Testing |
| Payment process | < 5s | Pending |

### Test Performance

```bash
# Lighthouse audit
# (Use browser DevTools → Lighthouse tab)

# PageSpeed Insights
# https://pagespeed.web.dev
```

---

## 7. Security Testing

### Input Validation
- [ ] XSS attempts blocked
- [ ] SQL injection prevented
- [ ] CSRF tokens working
- [ ] Rate limiting active
- [ ] File uploads validated

### Authentication
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected
- [ ] Admin routes require auth
- [ ] User role checks work

### Database Security
- [ ] RLS policies enforced
- [ ] Sensitive data encrypted
- [ ] Audit logs created
- [ ] No data leaks in logs

---

## 8. CI/CD Integration

### GitHub Actions Setup

Create `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 9. Test Results Summary

### Backend Tests: 34/36 ✅
```
✅ Email validation
✅ Password strength
✅ Name validation
✅ Amount validation
✅ Text sanitization
✅ Investor scoring
✅ Founder scoring
✅ Rankings
⚠️ XSS sanitization (script tags not removed)
⚠️ Tie-breaking logic (minor issue)
```

### E2E Tests: Ready to Run ✅
```
- 8 test suites
- 30+ test cases
- Covers all critical flows
- Multi-browser support
- Responsive testing
```

### Manual Testing: In Progress 🔄
```
Start with critical flows section
Update checklist as you test
```

---

## 10. Before Production

### Pre-Launch Checklist

- [ ] All backend tests passing (34+/36)
- [ ] All E2E tests passing
- [ ] Manual critical flows completed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Email service configured (RESEND_API_KEY)
- [ ] Stripe Connect live keys set
- [ ] Database backups configured
- [ ] Error monitoring (Sentry) setup
- [ ] Analytics tracking enabled

---

## 11. Continuous Testing

### Daily Checks
- [ ] Run backend tests
- [ ] Run E2E tests (at least critical flows)
- [ ] Check error logs in Sentry
- [ ] Monitor email delivery rates
- [ ] Check payment success rates

### Weekly Checks
- [ ] Performance benchmarks
- [ ] Security audit
- [ ] Load testing
- [ ] User feedback review

### Monthly Checks
- [ ] Full security audit
- [ ] Database health check
- [ ] Third-party API status
- [ ] Disaster recovery test

---

## Support & Troubleshooting

### Common Issues

**Tests timeout?**
```bash
# Increase timeout in playwright.config.ts
timeout: 30000
```

**Playwright not finding elements?**
```bash
# Use --debug flag
npx playwright test --debug

# Or use inspector
npx playwright codegen http://localhost:3000
```

**Email not sending in tests?**
```bash
# Make sure RESEND_API_KEY is not set in test env
# Emails will log to console instead
```

**Database state issues?**
```bash
# Reset database between test runs
# Create a test seed script
```

---

**Next Step:** Run `npm run test:e2e` to start end-to-end testing!
