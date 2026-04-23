# Infrastructure & Scaling Plan

## Current Stack
- **Frontend**: Next.js 16.2.3 on Vercel
- **Backend**: Next.js API routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Email**: Resend
- **Analytics**: Vercel Analytics + Sentry

---

## Phase 2: Scaling Infrastructure

### 1. Caching Layer (Redis)

**Purpose**: Reduce database load for frequently accessed data

**Implementation**:
```bash
# Option A: Use Vercel KV (integrated with Vercel)
npm install @vercel/kv

# Option B: Use Redis Cloud or Railway
REDIS_URL=redis://...
```

**What to cache**:
- Popular projects (1 hour TTL)
- Leaderboard data (30 minute TTL)
- User profiles (1 hour TTL)
- Investment statistics (hourly TTL)

**Cache invalidation triggers**:
- New investment → invalidate project leaderboard
- User profile update → invalidate user cache
- Milestone completion → invalidate founder cache

---

### 2. Content Delivery Network (CDN)

**Current**: Vercel includes automatic CDN (good!)

**Optimization**:
- Enable Next.js Image Optimization
- Compress static assets
- Set aggressive cache headers
- Gzip compression in next.config.ts

**Configuration**:
```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  compress: true,
  headers: async () => [
    {
      source: '/:path*.(png|jpg|jpeg|gif|webp)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
})
```

---

### 3. Database Scaling

**Current**: Supabase shared database

**Scaling roadmap**:
- **1-1000 users**: Use included Supabase database ✅
- **1000-10k users**: Upgrade to Supabase paid plan
- **10k+ users**: Dedicated PostgreSQL instance + read replicas

**Performance optimization**:
- Add indexes on frequently queried columns
- Archive old investment records
- Partition large tables by date
- Monitor slow queries with pg_stat_statements

**Query optimization**:
```sql
-- Check slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Add missing indexes
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
```

---

### 4. Monitoring & Observability

**Error Tracking**: Sentry (configured)
- Automatic error capture
- Performance monitoring
- Release tracking

**Application Metrics**:
- API response times
- Database query duration
- Authentication success/failure rates
- Investment conversion funnel

**Infrastructure Metrics**:
- CPU/Memory on Vercel
- Database connection count
- API rate limit status
- Error rate by endpoint

**Dashboard**:
Create /admin/monitoring page showing:
- Last 24h error rate
- P95 response time
- Database connection health
- Email delivery rate

---

### 5. Audit Logging

**Create migrations**:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

**Log events**:
- User signup/login
- Investment creation/update
- Fund transfers
- Admin actions
- KYC status changes

---

### 6. Security Hardening

**HTTPS/TLS**: Vercel handles automatically ✅

**Environment variables**:
- All secrets in Vercel Environment Variables
- Never commit .env.production
- Rotate keys quarterly

**Rate Limiting**: Supabase handles ✅
- Email signup: 5/hour
- Login attempts: 10/15 min
- API requests: 100/minute (upgrade plan)

**CORS**: Configured in Vercel ✅

**HTTPS headers**:
```typescript
// next.config.ts
headers: async () => [
  {
    source: '/:path*',
    headers: [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
    ],
  },
]
```

---

### 7. KYC/AML Compliance

**Phases**:
1. **Phase 2B**: Manual KYC (admin reviews documents)
2. **Phase 2C**: Automated verification (third-party service)
3. **Phase 3**: Continuous monitoring (AML rules)

**Implementation**:
```sql
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  document_type VARCHAR(50), -- 'national_id', 'passport', 'selfie'
  file_url TEXT,
  verification_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  uploaded_at TIMESTAMP,
  verified_at TIMESTAMP
);
```

---

## Scaling Timeline

| Stage | Users | Infrastructure | Cost | Timeline |
|---|---|---|---|---|
| Current | 0-1K | Vercel + Supabase Free | ~$0 | Now |
| Phase 2A | 1K-5K | Vercel Pro + Supabase Pro | ~$50/mo | Week 4 |
| Phase 2B | 5K-50K | Dedicated + Redis | ~$500/mo | Month 3 |
| Phase 3 | 50K+ | Multi-region + replicas | ~$5K/mo | Month 6+ |

---

## Deployment Checklist

- [ ] Enable Sentry error tracking
- [ ] Configure Vercel environment variables
- [ ] Set up monitoring dashboard
- [ ] Enable database slow query logging
- [ ] Configure Redis (if using)
- [ ] Set up CDN cache headers
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Test failover/rollback plan
- [ ] Set up uptime monitoring (StatusPage.io)

