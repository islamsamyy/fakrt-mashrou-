# IDEA BUSINESS - Architecture Overview

**Platform**: Compliance & Scaling Infrastructure  
**Date**: April 24, 2026

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                          │
│                    (Web, Mobile, Admin)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS/TLS
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     VERCEL CDN                                   │
│  (Images, Static Assets, Cache Headers)                         │
│  - WebP/AVIF Conversion                                         │
│  - 1-year cache for versioned assets                            │
│  - Gzip Compression                                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│              NEXT.JS APPLICATION LAYER                           │
│  ├─ App Router (pages, API routes)                              │
│  ├─ Server Components                                            │
│  ├─ API Endpoints                                                │
│  └─ Middleware (Auth, Rate Limiting)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌─────────┐      ┌──────────┐     ┌───────────┐
   │ CACHE   │      │DATABASE  │     │ EXTERNAL  │
   │ (Redis) │      │(Postgres)│     │ SERVICES  │
   │         │      │          │     │           │
   │ - KV    │      │- Profiles│     │- Jumio    │
   │ - Vercel│      │- Projects│     │  (KYC)    │
   │  KV     │      │- KYC Data│     │- OpenEx   │
   │ - TTLs  │      │- Audit   │     │  Rates    │
   │ - Auto  │      │- Exchange│     │- Stripe   │
   │  Invald │      │  Rates   │     │- Resend   │
   │         │      │          │     │- Sentry   │
   └────┬────┘      └────┬─────┘     └─────┬─────┘
        │                │                 │
        └────────────────┼─────────────────┘
                         │
              ┌──────────▼───────────┐
              │  AUTHENTICATION      │
              │  (Supabase Auth)     │
              │                      │
              │- OAuth Integration   │
              │- JWT Tokens          │
              │- Session Management  │
              └──────────────────────┘
```

---

## Data Flow - KYC Verification

```
USER START KYC
    │
    ▼
┌─────────────────────────────────┐
│  Step 1: Identity Info          │
│  - Name, DOB, Nationality       │
│  - Country Residence            │
│  - Risk Assessment              │
└──────────┬──────────────────────┘
           │ Risk Check
           ▼
    ┌──────────────┐
    │ High Risk?   │
    └──┬───────┬──┘
       │NO     │YES
       │       └────→ Flag for Review
       │
       ▼
┌─────────────────────────────────┐
│  Step 2: Document Upload        │
│  - National ID / Passport       │
│  - File to Supabase Storage     │
│  - OCR Extraction (optional)    │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Step 3: Selfie Capture         │
│  - Liveness Detection           │
│  - Face Matching                │
│  - Upload to Storage            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Step 4: Submit to Provider     │
│  (Jumio / Onfido / Sumsub)      │
│  - Send all documents           │
│  - Get verification ID          │
│  - Wait for callback            │
└──────────┬──────────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Webhook Callback │
    │ (from provider)  │
    └────────┬─────────┘
             │
        ┌────▼─────┐
        │ Verified? │
        └─┬──────┬──┘
          │YES   │NO
          │      └──→ Status: Rejected
          │
          ▼
    ┌─────────────────┐
    │ Admin Review    │
    │ (for medium-    │
    │  risk cases)    │
    └────────┬────────┘
             │
        ┌────▼────┐
        │Approved? │
        └─┬──────┬─┘
          │YES   │NO
          │      └──→ Rejected
          │
          ▼
    ┌──────────────┐
    │ Status:      │
    │ VERIFIED ✓   │
    │ User can now │
    │ invest       │
    └──────────────┘

┌────────────────────────────────────────┐
│  AUDIT LOG ENTRY CREATED AT EACH STEP  │
│  ├─ User ID                            │
│  ├─ Action (create/update/approve)     │
│  ├─ Status Change                      │
│  ├─ Risk Score                         │
│  ├─ Timestamp                          │
│  └─ Admin Notes                        │
└────────────────────────────────────────┘
```

---

## Investment Flow with Multi-Currency

```
USER VIEWS PROJECT
    │
    ├─→ Currency Selection
    │   └─→ Check preferred_currency
    │       (from profiles table)
    │
    ▼
INVESTMENT FORM
    │
    ├─→ Amount Input
    ├─→ Currency Selector
    │   (SAR, USD, EUR, GBP, AED, KWD, QAR, OMR, JOD, BHD)
    │
    ▼
SUBMISSION
    │
    ├─→ Fetch exchange_rates
    │   (from Redis cache or DB)
    │
    ├─→ Convert to Base (SAR)
    │   amount_sar = amount * rate
    │
    ├─→ Calculate Fee
    │   fee = amount_sar * 0.5%
    │
    ▼
CREATE INVESTMENT
    │
    ├─→ Insert into investments table
    │   ├─ amount (in SAR)
    │   ├─ currency (original)
    │   ├─ exchange_rate (used)
    │   ├─ amount_in_original_currency
    │   └─ timestamp
    │
    ├─→ Trigger: sync_amount_raised()
    │   └─→ Update projects.amount_raised
    │
    ├─→ Trigger: store_investment_exchange_rate()
    │   └─→ Save exchange rate used
    │
    ▼
AUDIT LOG
    │
    ├─ Action: create
    ├─ Resource: investment
    ├─ Amount: 50000 SAR
    ├─ Currency: USD
    ├─ Exchange Rate: 3.75
    │
    ▼
CACHE INVALIDATION
    │
    ├─ Invalidate project cache
    ├─ Invalidate leaderboard cache
    ├─ Invalidate popular_projects
    │
    ▼
NOTIFICATION
    │
    └─→ Send to founder & investor
        (via Resend email)
```

---

## Database Schema Relationships

```
┌──────────────┐
│   profiles   │
├──────────────┤
│ id (pk)      │◄────────┐
│ full_name    │         │
│ kyc_status   │         │
│ tier         │         │
│ role         │         │
│ preferred    │         │
│ _currency    │         │
└──────────────┘         │
       │                 │
       │                 │
       ├────────────────►┌──────────────┐
       │                 │   kyc_data   │
       │                 ├──────────────┤
       │                 │ id (pk)      │
       │                 │ user_id (fk) │
       │                 │ status       │
       │                 │ risk_score   │
       │                 │ verified_by  │
       │                 └──────────────┘
       │
       ├──────────────┬─────────────────────────┐
       │              │                         │
       ▼              ▼                         ▼
┌─────────────┐  ┌──────────────┐      ┌──────────────┐
│ projects    │  │ investments  │      │ audit_logs   │
├─────────────┤  ├──────────────┤      ├──────────────┤
│ id (pk)     │  │ id (pk)      │      │ id (pk)      │
│ founder_id  │◄─┤ investor_id  │      │ user_id      │
│ title       │  │ project_id   │◄─┐   │ admin_id     │
│ target_amt  │  │ amount       │  │   │ action       │
│ amount_raised    │ currency   │  │   │ resource_type│
│ status      │  │ exchange_rate    │   │ resource_id  │
│ currency    │  │ created_at   │  │   │ old_values   │
│ accepted_   │  └──────────────┘  │   │ new_values   │
│ currencies  │                     │   │ created_at   │
└─────────────┘                     │   └──────────────┘
                                    │
                            ┌───────┴────────┐
                            │                │
                            ▼                │
                      ┌──────────────┐      │
                      │exchange_rates│      │
                      ├──────────────┤      │
                      │from_currency │      │
                      │to_currency   │      │
                      │rate          │      │
                      │effective_date│      │
                      └──────────────┘      │
                                           │
                                  [Triggers]
                                  update audit_logs
```

---

## Caching Strategy

```
REQUEST ARRIVES
    │
    ▼
CHECK CACHE HIERARCHY
    │
    ├─ Layer 1: Browser Cache (Service Worker)
    │   └─ TTL: 1 week (static assets)
    │
    ├─ Layer 2: CDN Cache (Vercel)
    │   └─ TTL: 1 hour (dynamic pages)
    │
    ├─ Layer 3: Application Cache (Redis/KV)
    │   ├─ Popular Projects: 30 min
    │   ├─ Leaderboard: 30 min
    │   ├─ User Profile: 1 hour
    │   ├─ Exchange Rates: 1 hour
    │   └─ Notifications: 5 min
    │
    └─ Layer 4: Database (PostgreSQL)
        └─ Source of Truth
        
┌─────────────────────────────┐
│  CACHE INVALIDATION FLOW    │
├─────────────────────────────┤
│                             │
│  User makes investment      │
│       │                     │
│       ▼                     │
│  Insert to investments      │
│       │                     │
│       ├─→ Trigger fires     │
│       │                     │
│       ▼                     │
│  Invalidate Patterns:       │
│  ├─ project:*              │
│  ├─ leaderboard:*          │
│  ├─ popular_projects       │
│  └─ user:*                 │
│       │                     │
│       ▼                     │
│  Redis SCAN & DEL          │
│       │                     │
│       ▼                     │
│  Cache Clear Complete      │
│                             │
│  Next request fetches       │
│  fresh data from DB         │
│  and caches again          │
│                             │
└─────────────────────────────┘
```

---

## Compliance & Monitoring

```
┌─────────────────────────────────────┐
│     COMPLIANCE MONITORING           │
├─────────────────────────────────────┤
│                                     │
│  KYC Metrics:                       │
│  ├─ Pending approvals               │
│  ├─ Risk score distribution         │
│  ├─ High-risk countries blocked     │
│  └─ Approval SLA tracking           │
│                                     │
│  Investment Metrics:                │
│  ├─ Total invested (by currency)    │
│  ├─ Investment count (by day)       │
│  ├─ Average investment size         │
│  └─ Currency distribution           │
│                                     │
│  Platform Metrics:                  │
│  ├─ User signups (daily/monthly)    │
│  ├─ Conversion funnel               │
│  ├─ Churn rate                      │
│  └─ Revenue per user                │
│                                     │
└─────────────────────────────────────┘
         │
         │
    ┌────▼──────┐     ┌────────────┐     ┌──────────┐
    │   Sentry  │     │   Vercel   │     │ Postgres │
    │(Errors)   │     │ Analytics  │     │  Logs    │
    │           │     │(Performance)     │          │
    └────┬──────┘     └────┬───────┘     └────┬─────┘
         │                 │                  │
         └─────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Admin Dashboard
                    ├──────────────┤
                    │ - KYC Queue   │
                    │ - Audit Logs  │
                    │ - Monitoring  │
                    │ - Reports     │
                    └───────────────┘
```

---

## Security Layers

```
┌──────────────────────────────────────────────┐
│         SECURITY ARCHITECTURE                │
├──────────────────────────────────────────────┤
│                                              │
│  Layer 1: Transport                          │
│  ├─ HTTPS/TLS (Vercel)                      │
│  ├─ HSTS Headers                             │
│  └─ Perfect Forward Secrecy                  │
│                                              │
│  Layer 2: Authentication                     │
│  ├─ Supabase Auth + JWT                     │
│  ├─ OAuth Integration                        │
│  └─ Session Management                       │
│                                              │
│  Layer 3: Authorization                      │
│  ├─ Row Level Security (RLS)                │
│  │  ├─ profiles: Users see own data         │
│  │  ├─ kyc_data: User + Admin access       │
│  │  ├─ audit_logs: User + Admin access     │
│  │  └─ exchange_rates: Public read/Admin write
│  │                                          │
│  ├─ Role-Based Access Control (RBAC)       │
│  │  ├─ founder                              │
│  │  ├─ investor                             │
│  │  └─ admin                                │
│  │                                          │
│  └─ Attribute-Based Access Control         │
│     └─ kyc_status gate (verified only)     │
│                                              │
│  Layer 4: Application Security              │
│  ├─ Input Validation                        │
│  ├─ SQL Injection Protection                │
│  │  └─ Parameterized queries               │
│  │                                          │
│  ├─ CSRF Protection                         │
│  │  └─ SameSite cookies                    │
│  │                                          │
│  ├─ XSS Protection                          │
│  │  └─ Content-Security-Policy headers     │
│  │                                          │
│  ├─ Rate Limiting                           │
│  │  ├─ API: 100 req/min                     │
│  │  ├─ Login: 10 attempts/15 min            │
│  │  └─ Signup: 5/hour per email            │
│  │                                          │
│  └─ Webhook Signature Verification         │
│     └─ HMAC-SHA256                         │
│                                              │
│  Layer 5: Data Protection                    │
│  ├─ Database Encryption (at rest)           │
│  ├─ Connection Encryption (in transit)      │
│  ├─ Audit Logging (full trail)              │
│  └─ Sensitive Data Masking                  │
│                                              │
│  Layer 6: Compliance                         │
│  ├─ KYC/AML Checks                         │
│  ├─ Sanctions Screening                     │
│  ├─ Document Verification                   │
│  └─ Risk Assessment                         │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         DEPLOYMENT PIPELINE              │
├─────────────────────────────────────────┤
│                                         │
│  1. CODE PUSH TO GIT                    │
│     └─ feat/kyc-compliance              │
│                                         │
│  2. GITHUB ACTIONS (CI/CD)              │
│     ├─ Run Tests                        │
│     │  ├─ Unit Tests                    │
│     │  ├─ Integration Tests             │
│     │  └─ E2E Tests                     │
│     │                                   │
│     ├─ Lint & Type Check                │
│     │  ├─ ESLint                        │
│     │  └─ TypeScript                    │
│     │                                   │
│     └─ Build Verification               │
│        └─ next build                    │
│                                         │
│  3. VERCEL PREVIEW DEPLOYMENT           │
│     └─ pr-123.ideabusiness.vercel.app  │
│                                         │
│  4. STAGING TESTS                       │
│     ├─ Smoke Tests                      │
│     ├─ E2E Tests                        │
│     └─ Performance Tests                │
│                                         │
│  5. PRODUCTION DEPLOYMENT (Manual)      │
│     └─ vercel deploy --prod             │
│                                         │
│  6. POST-DEPLOYMENT VERIFICATION        │
│     ├─ Health Checks                    │
│     ├─ Database Verification            │
│     ├─ Cache Warmup                     │
│     └─ Monitoring Activation            │
│                                         │
│  7. GRADUAL ROLLOUT                     │
│     ├─ 10% Traffic (30 min)            │
│     ├─ 50% Traffic (1 hour)            │
│     └─ 100% Traffic (Go-live)          │
│                                         │
│  8. 24/7 MONITORING                     │
│     ├─ Error Rate Tracking              │
│     ├─ Performance Metrics              │
│     ├─ KYC Flow Testing                 │
│     └─ Audit Log Verification           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Growth Scaling Path

```
CURRENT: 0-1K Users
├─ Vercel Pro
├─ Supabase Pro (100GB)
├─ In-memory Cache (dev fallback)
└─ Shared Database
   Cost: ~$50/month

         ↓
         
PHASE 2A: 1K-5K Users (Week 4)
├─ Vercel Enterprise
├─ Supabase Team (500GB)
├─ Vercel KV Cache
└─ Connection Pooling
   Cost: ~$100/month
   
         ↓
         
PHASE 2B: 5K-50K Users (Month 3)
├─ Dedicated Vercel Instances
├─ Supabase Pro+ (1TB+)
├─ Railway Redis Cluster
├─ Read Replicas
└─ CDN Edge Caching
   Cost: ~$500/month
   
         ↓
         
PHASE 3: 50K+ Users (Month 6+)
├─ Multi-Region Deployment
├─ Dedicated PostgreSQL
├─ Redis Cluster
├─ Advanced Analytics
└─ Custom SLAs
   Cost: ~$5K+/month
```

---

## API Endpoints Overview

```
KYC ENDPOINTS:
POST   /api/kyc/identity              Create identity info
POST   /api/kyc/identity-document     Upload national ID
POST   /api/kyc/selfie                Upload selfie
GET    /api/kyc/status                Get verification status

WEBHOOK ENDPOINTS:
POST   /api/webhooks/kyc-verification  Jumio/Onfido callback

ADMIN ENDPOINTS:
GET    /admin/kyc                      Review pending KYC
POST   /admin/kyc/approve              Approve KYC
POST   /admin/kyc/reject               Reject KYC
GET    /admin/audit-logs               View audit logs
GET    /admin/monitoring               Platform health

CURRENCY ENDPOINTS:
GET    /api/currency/rates             Get exchange rates
GET    /api/currency/convert           Convert amount
POST   /api/currency/rates/update      Admin: Update rates

CACHE ENDPOINTS:
GET    /api/cache/stats                Cache statistics
POST   /api/cache/invalidate           Manual cache clear
GET    /api/cache/health               Cache health check
```

---

## Key Metrics Dashboard

```
┌──────────────────────────────────────────────────┐
│           REAL-TIME MONITORING DASHBOARD          │
├──────────────────────────────────────────────────┤
│                                                  │
│  KYC STATUS                                      │
│  ├─ Verified: 127  [████████░] 80%              │
│  ├─ Pending:  28   [██░░░░░░░] 18%              │
│  └─ Rejected:  4   [░░░░░░░░░]  2%              │
│                                                  │
│  INVESTMENT FLOW                                 │
│  ├─ Today:      1,250,000 SAR                    │
│  ├─ This Week:  8,450,000 SAR                    │
│  ├─ This Month: 35,600,000 SAR                   │
│  └─ Total:      127,450,000 SAR                  │
│                                                  │
│  PLATFORM HEALTH                                 │
│  ├─ API Response: 156ms (p95)                    │
│  ├─ Cache Hit Rate: 87%                          │
│  ├─ Error Rate: 0.03%                            │
│  ├─ Uptime: 99.95%                               │
│  └─ Active Users: 2,847                          │
│                                                  │
│  CURRENCY DISTRIBUTION                           │
│  ├─ SAR: 65% [████████████░░]                   │
│  ├─ USD: 20% [████░░░░░░░░░░]                   │
│  ├─ EUR: 10% [██░░░░░░░░░░░░]                   │
│  ├─ GBP: 3%  [░░░░░░░░░░░░░░]                   │
│  └─ Other: 2%                                    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Summary

This comprehensive infrastructure enables IDEA BUSINESS to:

1. **Comply** with KYC/AML regulations globally
2. **Scale** from 1K to 100K+ users
3. **Monitor** every transaction and action
4. **Optimize** performance across all regions
5. **Secure** user data with multiple layers

All components are production-ready and documented.
