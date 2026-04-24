# IDEA BUSINESS Infrastructure & Compliance Plan

**Date**: April 24, 2026  
**Version**: 2.0  
**Status**: Production-Ready

## Overview

Complete infrastructure setup, scaling strategies, and compliance framework for IDEA BUSINESS. Covers KYC/AML compliance, audit logging, multi-currency support, caching, CDN optimization, and monitoring.

---

## 1. Current Stack

- **Frontend**: Next.js 16.2.3 on Vercel
- **Backend**: Next.js API routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Email**: Resend
- **Analytics**: Vercel Analytics + Sentry

---

## 2. KYC/AML Compliance Framework

### 2.1 Database Schema

**Table: `kyc_data`** - Complete KYC verification state

**Key Columns:**
- `id` - Unique identifier
- `user_id` - Reference to profiles
- `status` - unverified | pending | verified
- `current_step` - 1-4 (identity → national ID → selfie → verification)
- `full_name`, `date_of_birth`, `nationality`, `country_of_residence`
- `national_id_type` - passport | id_card | driver_license
- `national_id_document` - JSONB: {url, size, uploaded_at, verification_status}
- `selfie_url` - Verified selfie image URL
- `is_high_risk_country` - Boolean risk flag
- `risk_flags` - Array of patterns
- `risk_score` - 0-100 scale
- `verification_provider` - jumio | onfido | sumsub
- `verification_id` - External provider ID
- `verified_at` - Approval timestamp
- `verified_by` - Admin user ID

**Migration**: `20260424_add_kyc_table.sql`

### 2.2 Four-Step KYC Flow

**Step 1: Identity Information**
```
POST /api/kyc/identity
{
  "full_name": "John Smith",
  "date_of_birth": "1990-01-15",
  "nationality": "US",
  "country_of_residence": "SA"
}
```

**Step 2: National ID Upload**
```
POST /api/kyc/identity-document
{
  "document_type": "passport",
  "document_number": "K12345678",
  "file": <binary>
}
```

**Step 3: Selfie Verification**
```
POST /api/kyc/selfie
{
  "file": <binary>
}
```

**Step 4: Provider Verification**
- Automated review + manual approval
- Admin approval at `/admin/kyc`

### 2.3 Compliance Checks

**High-Risk Countries:**
- North Korea (KP)
- Iran (IR)
- Syria (SY)
- Cuba (CU)
- Burundi (BI)
- Zimbabwe (ZW)

**Risk Scoring:**
- High-risk country: +40 points
- Multiple failed attempts: +20 points
- Incomplete verification: +15 points
- Suspicious patterns: +10-25 points

**Actions:**
- 0-30: Approved immediately
- 31-60: Manual review required
- 61-100: Rejection/enhanced verification

### 2.4 Third-Party Providers

**Jumio** (Recommended)
```bash
JUMIO_API_TOKEN=your_token
JUMIO_API_SECRET=your_secret
JUMIO_BASE_URL=https://api.jumio.com
```

**Onfido** (Alternative)
```bash
ONFIDO_API_TOKEN=your_token
ONFIDO_BASE_URL=https://api.onfido.com
```

**Sumsub** (Alternative)
```bash
SUMSUB_API_KEY=your_key
SUMSUB_BASE_URL=https://api.sumsub.com
```

### 2.5 Webhook Handler

**Endpoint**: `/api/webhooks/kyc-verification`

```typescript
POST /api/webhooks/kyc-verification
X-Webhook-Signature: hmac_signature

{
  "verification_id": "ext_123456",
  "user_id": "uuid",
  "status": "verified|rejected",
  "result": {
    "document_verified": true,
    "selfie_verified": true,
    "liveness_verified": true,
    "risk_score": 25
  }
}
```

---

## 3. Audit Logging System

### 3.1 Database Schema

**Table: `audit_logs`** - Complete transaction audit trail

**Key Columns:**
- `id`, `user_id`, `admin_id`
- `action` - create | update | delete | approve | reject
- `resource_type` - investment | project | user | kyc | payout
- `resource_id` - Affected resource ID
- `old_values`, `new_values` - JSONB state tracking
- `ip_address`, `user_agent` - Context
- `status` - success | failure | pending
- `created_at` - Timestamp

**Migration**: `20260424_create_audit_logs.sql`

### 3.2 Automated Logging

**Investment Creation:**
```
Action: create
Description: "Investment of 50000 SAR created for project..."
```

**KYC Status Change:**
```
Action: approve
Description: "KYC verified (risk score: 25)"
```

**User Profile Changes:**
```
Action: update
Description: "User tier=premium, role=investor, kyc=verified"
```

### 3.3 Admin Dashboard

**Location**: `/admin/audit-logs`

**Features:**
- Timeline view of all actions
- Filters by resource type, action, user, date
- Full change history
- Export to CSV/JSON
- Monthly compliance reports

### 3.4 Query Helper

```sql
SELECT * FROM get_audit_logs(
  p_limit := 100,
  p_offset := 0,
  p_resource_type := 'investment',
  p_action := 'create'
);
```

---

## 4. Multi-Currency Support

### 4.1 Database Changes

**New Enum:**
```sql
CREATE TYPE currency_code AS ENUM ('SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'OMR', 'JOD', 'BHD');
```

**New Columns:**
- `investments.currency` - Currency of investment
- `investments.exchange_rate` - Rate at time of investment
- `investments.amount_in_original_currency`
- `projects.currency` - Primary currency
- `projects.accepted_currencies` - Array
- `profiles.preferred_currency` - User preference

**Exchange Rates Table:**
```sql
CREATE TABLE exchange_rates (
  from_currency currency_code,
  to_currency currency_code,
  rate numeric(10,6),
  effective_date date,
  source text
);
```

**Migration**: `20260424_multi_currency_support.sql`

### 4.2 Exchange Rate Provider

**OpenExchangeRates API:**
```bash
OPENEXCHANGERATES_API_KEY=your_api_key
```

**Pricing:**
- Free: 1,000 req/month, USD base only
- Paid: $99+/month, multiple bases

**Implementation**: `lib/currency.ts`

**Functions:**
```typescript
fetchExchangeRates(baseCurrency)      // Fetch from API
convertCurrency(amount, from, to, rates)
formatCurrency(amount, currency)
getCurrencySymbol(currency)
isValidCurrency(value)
calculateConversionFee(amount, from, to)
```

### 4.3 Daily Updates

**Cron Job:**
```
0 0 * * * /scripts/update-exchange-rates.sh
```

### 4.4 Display Format

```typescript
// Arabic: "٥٠٬٠٠٠٫٠٠ ر.س"
formatCurrency(50000, 'SAR', 'ar-SA')

// English: "SAR 50,000.00"
formatCurrency(50000, 'SAR', 'en-US')
```

---

## 5. Redis Caching Setup

### 5.1 Configuration Options

**Option A: Vercel KV** (Recommended)
```bash
npm install @vercel/kv
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
```

**Option B: Railway Redis**
```bash
npm install redis
REDIS_URL="redis://user:password@host:port"
```

**Option C: Self-Hosted**
```bash
docker run -d -p 6379:6379 redis:latest
REDIS_URL="redis://localhost:6379"
```

### 5.2 Cache Strategy

**Cache Hierarchy:**
1. Browser Cache (Service Worker) - 1 week
2. CDN Cache (Vercel) - 1 hour
3. Application Cache (Redis) - 30 min-1 hour
4. Database - Source of truth

**Cached Data:**

| Data | TTL | Invalidation |
|------|-----|--------------|
| Popular projects | 30 min | On update |
| Leaderboard | 30 min | Nightly |
| User profile | 1 hour | On update |
| Project details | 1 hour | On update |
| Exchange rates | 1 hour | Daily |
| Notifications | 5 min | On new |

### 5.3 Cache Functions

**File**: `lib/cache.ts`

```typescript
// Popular projects
const projects = await cachePopularProjects(
  async () => fetchPopularProjects(),
  { ttl: 1800 }
);

// Leaderboard
const leaderboard = await cacheLeaderboard(
  'month',
  async () => fetchMonthlyLeaderboard(),
  { ttl: 1800 }
);

// User profile
const profile = await cacheUserProfile(
  userId,
  async () => fetchUserProfile(userId),
  { ttl: 3600 }
);
```

### 5.4 Cache Invalidation

```typescript
// When project updated
await cache.invalidateProject(projectId);
// Invalidates: project, popular_projects, leaderboard

// When user updated
await cache.invalidateUser(userId);

// When investment made
await cache.invalidateProject(projectId);
await cache.invalidateLeaderboard();
```

---

## 6. CDN & Asset Optimization

### 6.1 Next.js Configuration

**File**: `next.config.ts`

```typescript
images: {
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 31536000, // 1 year
},

compress: true,

async headers() {
  return [
    {
      source: '/_next/static/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }]
    }
  ];
}
```

### 6.2 Image Optimization

```jsx
import Image from 'next/image';

<Image
  src="/images/project.jpg"
  alt="Project"
  width={1200}
  height={600}
  priority
  quality={75}
/>
```

**Benefits:**
- WebP/AVIF conversion
- Responsive sizes
- Lazy loading
- Format optimization

### 6.3 Security Headers

```typescript
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
},
{
  key: 'X-Frame-Options',
  value: 'DENY'
},
{
  key: 'X-XSS-Protection',
  value: '1; mode=block'
}
```

### 6.4 Vercel Analytics

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function RootLayout() {
  return <>
    <Analytics />
    <SpeedInsights />
  </>;
}
```

**Metrics:** LCP, FID, CLS, FCP, TTI

---

## 7. Monitoring & Alerting

### 7.1 Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
SENTRY_DSN=https://key@id.ingest.sentry.io/project
```

### 7.2 Performance Thresholds

- Page load: < 3s
- API response: < 500ms
- Error rate: < 1%

### 7.3 Business Metrics

**Investment:**
- Total invested amount
- Average investment
- Conversion rate
- Churn rate

**KYC:**
- Pending approvals
- Approval rate
- Average approval time
- Risk distribution

**Platform:**
- Daily active users
- API uptime (99.9%+)
- Cache hit rate (>80%)

---

## 8. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...

# KYC (Jumio)
JUMIO_API_TOKEN=xxx
JUMIO_API_SECRET=xxx

# Currency
OPENEXCHANGERATES_API_KEY=xxx

# Cache (Vercel KV)
KV_URL=redis://xxx
KV_REST_API_URL=https://xxx
KV_REST_API_TOKEN=xxx

# Error Tracking
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Email
RESEND_API_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 9. Deployment Checklist

### Pre-Production
- [ ] KYC migrations applied
- [ ] Audit logs tested
- [ ] Currency conversion working
- [ ] Redis cache configured
- [ ] Image optimization enabled
- [ ] Analytics enabled
- [ ] Error tracking configured
- [ ] RLS policies verified

### Production
```bash
pg_dump $DATABASE_URL > backup_20260424.sql
./supabase/apply-migrations.sh
vercel deploy --prod
npm run test:smoke
```

### Post-Deployment
- [ ] All endpoints working
- [ ] KYC admin page accessible
- [ ] Audit logs populated
- [ ] Analytics flowing
- [ ] Monitor errors 48h

---

## 10. Scaling Timeline

| Stage | Users | Cost | Timeline |
|---|---|---|---|
| Current | 0-1K | ~$0 | Now |
| Phase 2A | 1K-5K | ~$50/mo | Week 4 |
| Phase 2B | 5K-50K | ~$500/mo | Month 3 |
| Phase 3 | 50K+ | ~$5K/mo | Month 6+ |

---

**Version**: 2.0  
**Last Updated**: April 24, 2026  
**Review Date**: June 24, 2026

