# IDEA BUSINESS Infrastructure - Quick Reference Card

**Print this for your desk!**

---

## Files & Locations

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| KYC Table | `supabase/migrations/20260424_add_kyc_table.sql` | 368 | 4-step verification + risk scoring |
| Audit Logs | `supabase/migrations/20260424_create_audit_logs.sql` | 280 | Transaction tracking + compliance |
| Multi-Currency | `supabase/migrations/20260424_multi_currency_support.sql` | 250 | 10 currencies + exchange rates |
| Currency Utils | `lib/currency.ts` | 400 | Convert, format, validate |
| Cache Layer | `lib/cache.ts` | 450 | Redis wrapper + TTL management |
| Config | `next.config.ts` | 80 | Image optimization + headers |

---

## Database Tables

### kyc_data
```
Columns: id, user_id, status, current_step (1-4)
        full_name, date_of_birth, nationality
        national_id_type, national_id_document
        selfie_url, selfie_verified
        is_high_risk_country, risk_score (0-100)
        verification_provider, verification_id
        verified_at, verified_by
Indexes: status, risk_score, country
RLS: Users see own, Admins see all
```

### audit_logs
```
Columns: id, user_id, admin_id
        action (create/update/delete/approve/reject)
        resource_type (investment/project/user/kyc/payout)
        resource_id, old_values, new_values
        ip_address, user_agent, status, error_message
        created_at
Indexes: user_id, resource_type, action, created_at
RLS: Users see own, Admins see all
```

### exchange_rates
```
Columns: from_currency, to_currency, rate, effective_date, source
Unique: (from_currency, to_currency, effective_date)
Indexes: currencies, date DESC
RLS: Public read, Admin write
```

---

## Key Functions

### Currency Utilities (`lib/currency.ts`)

```typescript
fetchExchangeRates(baseCurrency)      // Get rates from API
convertCurrency(amount, from, to)     // Convert amount
formatCurrency(amount, currency)      // Format for display
getCurrencySymbol(currency)           // Get symbol (ر.س, $, €)
getCurrencyName(currency)             // Get Arabic name
isValidCurrency(value)                // Validate currency code
calculateConversionFee(amount, from, to)  // Calculate fee
```

### Cache Manager (`lib/cache.ts`)

```typescript
getCacheManager()                     // Get singleton instance
cache.get(key)                        // Get from cache
cache.set(key, value, {ttl})          // Set with TTL
cache.delete(key)                     // Delete item
cache.invalidatePattern(pattern)      // Delete by pattern
cache.invalidateProject(id)           // Invalidate project cache
cache.invalidateLeaderboard()         // Invalidate leaderboard
```

### SQL Functions

```sql
check_country_risk(country)           // Check if country is high-risk
evaluate_kyc_risk(user_id)            // Calculate risk score (0-100)
get_exchange_rate(from, to, date)     // Get rate for date
convert_currency(amount, from, to)    -- Convert amount between currencies
format_currency(amount, currency)     -- Format for display
get_audit_logs(limit, offset, type, action) -- Query audit logs
```

---

## Environment Variables

**Required for Production:**

```bash
# KYC Provider
JUMIO_API_TOKEN=
JUMIO_API_SECRET=
JUMIO_BASE_URL=https://api.jumio.com

# Currency Exchange
OPENEXCHANGERATES_API_KEY=

# Cache (Vercel KV)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Error Tracking
SENTRY_DSN=

# Other Services
RESEND_API_KEY=
STRIPE_SECRET_KEY=
```

---

## Cache TTLs

| Data | TTL | Notes |
|------|-----|-------|
| Popular projects | 30 min | Invalidate on project update |
| Leaderboard | 30 min | Invalidate nightly |
| User profile | 1 hour | Invalidate on profile update |
| Project details | 1 hour | Invalidate on project update |
| Exchange rates | 1 hour | Update daily at midnight |
| Notifications | 5 min | Real-time updates |

---

## Risk Scoring

| Factor | Points | Notes |
|--------|--------|-------|
| High-risk country | +40 | KP, IR, SY, CU, BI, ZW |
| Multiple failures | +20 | >3 verification attempts |
| Incomplete verify | +15 | No selfie yet |
| Suspicious patterns | +10-25 | Fraud detection |

**Actions:**
- 0-30: Auto-approve
- 31-60: Manual review
- 61-100: Reject/Enhanced verify

---

## KYC Flow

```
Step 1: Identity Info
├─ Name, DOB, Nationality, Country
└─ Risk Assessment

Step 2: National ID Upload
├─ Document (Passport/ID/License)
└─ File to Supabase Storage

Step 3: Selfie Capture
├─ Liveness Detection
└─ Face Matching

Step 4: Provider Verification
├─ Auto Verification (or)
├─ Admin Review
└─ Status: Verified/Rejected

Webhook → Update Status → Notify User
```

---

## Currencies Supported

| Code | Name | Symbol |
|------|------|--------|
| SAR | الريال السعودي | ر.س |
| USD | الدولار الأمريكي | $ |
| EUR | اليورو | € |
| GBP | الجنيه الإسترليني | £ |
| AED | الدرهم الإماراتي | د.إ |
| KWD | الدينار الكويتي | د.ك |
| QAR | الريال القطري | ر.ق |
| OMR | الريال العماني | ر.ع. |
| JOD | الدينار الأردني | د.ا |
| BHD | الدينار البحريني | د.ب |

---

## API Endpoints

### KYC
```
POST   /api/kyc/identity
POST   /api/kyc/identity-document
POST   /api/kyc/selfie
GET    /api/kyc/status
POST   /api/webhooks/kyc-verification
```

### Admin
```
GET    /admin/kyc
POST   /admin/kyc/approve
POST   /admin/kyc/reject
GET    /admin/audit-logs
```

### Currency
```
GET    /api/currency/rates
GET    /api/currency/convert
POST   /api/currency/rates/update
```

---

## Deployment Checklist

```
Pre-Deploy:
☐ Backup database
☐ Run tests (npm run test)
☐ Build production (npm run build)
☐ Check .env variables

Deploy:
☐ Apply migrations
☐ Deploy to Vercel (vercel deploy --prod)
☐ Run smoke tests (npm run test:smoke)

Post-Deploy:
☐ Verify endpoints
☐ Check KYC flow
☐ Test audit logs
☐ Monitor errors (24h)
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load | < 3s | — |
| API Response | < 500ms | — |
| Cache Hit Rate | > 80% | — |
| Error Rate | < 1% | — |
| Uptime | 99.9% | — |

---

## Common Commands

```bash
# Test
npm run test
npm run test:e2e
npm run test:smoke

# Build
npm run build
npm run analyze        # Bundle size

# Deploy
vercel deploy          # Preview
vercel deploy --prod   # Production

# Database
supabase migration up
supabase db push       # Apply local changes
supabase db pull       # Sync from remote

# Cache
redis-cli info         # Redis stats
redis-cli keys "*"     # All keys
redis-cli flushdb      # Clear cache
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| KYC fails | Check API key, verify webhook URL |
| Cache not working | Check REDIS_URL, verify TTL |
| Currency wrong | Update exchange rates, verify decimal |
| Audit logs missing | Verify triggers, check RLS |
| High error rate | Check Sentry, review logs |
| Slow queries | Add indexes, check query plan |

---

## Key Contacts

- **Slack**: #infrastructure
- **Docs**: `/phase2/compliance/`
- **On-Call**: Rotation in status page
- **Emergency**: Page duty escalation

---

## Useful Links

- KYC Provider: https://jamio.com
- OpenExchangeRates: https://openexchangerates.org
- Vercel KV: https://vercel.com/storage/kv
- Sentry: https://sentry.io
- Supabase: https://supabase.com

---

## Cost Summary

```
Monthly Costs:
├─ Vercel:        $20-50
├─ Supabase:      $25-100
├─ KYC Provider:  $500-1000
├─ Vercel KV:     $5-20
├─ Exchange API:  $10
├─ Sentry:        $29
└─ TOTAL:         ~$600/month

Scales with growth:
├─ 1K users:    ~$50/month
├─ 10K users:   ~$200/month
├─ 50K users:   ~$600/month
└─ 100K+ users: ~$2000+/month
```

---

**Version**: 1.0  
**Last Updated**: April 24, 2026  
**Next Review**: June 24, 2026
