# Deployment Guide - KYC/AML & Infrastructure

**Status**: Production-Ready  
**Estimated Duration**: 2-3 weeks  
**Risk Level**: Medium (compliance-critical features)

---

## Pre-Deployment Phase (Day 1-3)

### 1. Backup Strategy

```bash
# Full database backup
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h db-xxxx.supabase.co \
  -U postgres \
  -d postgres \
  > backup_20260424_pre_deploy.sql

# Archive backup
aws s3 cp backup_20260424_pre_deploy.sql \
  s3://idea-business-backups/
```

**Retention**: Keep for 30 days

### 2. Environment Setup

**Vercel Configuration:**

1. Go to Project Settings > Environment Variables
2. Add production variables:

```
JUMIO_API_TOKEN=your_token
JUMIO_API_SECRET=your_secret
JUMIO_BASE_URL=https://api.jumio.com
JUMIO_WEBHOOK_SECRET=your_webhook_secret

OPENEXCHANGERATES_API_KEY=your_key

KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

SENTRY_DSN=https://key@id.ingest.sentry.io/project
SENTRY_ENVIRONMENT=production
```

3. Verify each variable is set correctly

### 3. Test on Staging

```bash
# 1. Create staging environment
vercel env pull --environment=staging > .env.staging.local

# 2. Run against staging
VERCEL_ENV=staging npm run build

# 3. Deploy preview
vercel deploy --prebuilt
```

### 4. Run Full Test Suite

```bash
# Unit tests
npm run test -- --coverage

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Security scan
npm run audit
```

**Pass Criteria**:
- All tests pass
- No high/critical vulnerabilities
- Coverage > 80%

---

## Database Migration Phase (Day 4-5)

### 1. Apply Migrations (In Order)

**Option A: Supabase Dashboard**

1. Open Supabase Studio
2. Go to SQL Editor
3. For each migration file:
   ```
   1. Open file from: supabase/migrations/20260424_*.sql
   2. Copy full content
   3. Paste into SQL Editor
   4. Click "Execute"
   5. Wait for completion
   6. Verify no errors
   ```

**Order (IMPORTANT):**
1. `20260424_add_kyc_table.sql` (KYC data structure)
2. `20260424_create_audit_logs.sql` (Audit logging)
3. `20260424_multi_currency_support.sql` (Currency support)

**Option B: CLI**

```bash
# Check current version
supabase migration list

# Push new migrations
supabase db push

# Verify
supabase db --list
```

### 2. Verify Table Creation

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('kyc_data', 'audit_logs', 'exchange_rates');

-- Expected output:
-- kyc_data
-- audit_logs
-- exchange_rates

-- Check indexes
SELECT * FROM pg_indexes
WHERE tablename IN ('kyc_data', 'audit_logs', 'exchange_rates');

-- Check functions
SELECT * FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%kyc%' OR routine_name LIKE '%audit%';
```

### 3. Load Initial Exchange Rates

```bash
# Create script: scripts/load-exchange-rates.sh
#!/bin/bash

# Fetch current rates from OpenExchangeRates
curl -s "https://openexchangerates.org/api/latest.json?app_id=$OPENEXCHANGERATES_API_KEY&base=SAR" \
  | jq '.rates | to_entries | .[] | {
      from_currency: "SAR",
      to_currency: .key,
      rate: .value,
      effective_date: (now | split("T")[0]),
      source: "openexchangerates"
    }' \
  > /tmp/rates.jsonl

# Load into Supabase
while IFS= read -r line; do
  curl -X POST "$SUPABASE_URL/rest/v1/exchange_rates" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "$line"
done < /tmp/rates.jsonl

# Run script
bash scripts/load-exchange-rates.sh
```

### 4. Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('kyc_data', 'audit_logs', 'exchange_rates');

-- Expected: all should show rowsecurity = true

-- Check policies exist
SELECT * FROM pg_policies
WHERE tablename IN ('kyc_data', 'audit_logs', 'exchange_rates');

-- Test RLS (as non-admin user)
SELECT * FROM kyc_data;  -- Should only see own data
SELECT * FROM audit_logs; -- Should only see own data
```

### 5. Test Data Insertion

```sql
-- Test KYC data table
INSERT INTO kyc_data (user_id, status, current_step)
VALUES (auth.uid(), 'unverified', 1)
RETURNING *;

-- Test audit logs
INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
VALUES (auth.uid(), 'create', 'test', 'test-123')
RETURNING *;

-- Test exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_date, source)
VALUES ('SAR', 'USD', 3.75, CURRENT_DATE, 'test')
RETURNING *;

-- Clean up test data
DELETE FROM kyc_data WHERE user_id = auth.uid();
DELETE FROM audit_logs WHERE resource_id = 'test-123';
DELETE FROM exchange_rates WHERE source = 'test';
```

---

## Application Deployment Phase (Day 6-8)

### 1. Deploy to Vercel

```bash
# 1. Commit changes
git add -A
git commit -m "feat: add KYC/AML compliance and infrastructure"

# 2. Create feature branch
git checkout -b deploy/kyc-compliance

# 3. Push to trigger preview
git push origin deploy/kyc-compliance

# 4. Verify Vercel preview works
# Wait for deployment, click preview URL
# Check all endpoints load

# 5. Merge to main
git merge deploy/kyc-compliance

# 6. Production deploy (manual)
vercel deploy --prod
```

**Monitor Deployment:**

```bash
# Watch logs
vercel logs --follow

# Check status
curl https://ideabusiness.com/api/health

# Test endpoints
curl https://ideabusiness.com/
curl https://ideabusiness.com/api/kyc/status
curl https://ideabusiness.com/admin/kyc
```

### 2. Verify Application

```bash
# Health check
npm run test:smoke

# KYC endpoints
curl -X POST https://ideabusiness.com/api/kyc/identity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "Test User",
    "date_of_birth": "1990-01-15",
    "nationality": "US",
    "country_of_residence": "SA"
  }'

# Audit logs endpoint
curl https://ideabusiness.com/api/audit/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Currency endpoint
curl https://ideabusiness.com/api/currency/rates
```

### 3. Test Admin Pages

1. Navigate to `https://ideabusiness.com/admin/kyc`
   - Should show KYC approval interface
   - Should be admin-only (redirect if not admin)

2. Navigate to `https://ideabusiness.com/admin/audit-logs`
   - Should show audit log table
   - Should have filters working
   - Should show recent logs

3. Test approving/rejecting KYC
   - Create test KYC submission
   - Test approve flow
   - Test reject flow
   - Verify audit log created

### 4. Test User Flows

**KYC Flow:**
1. Signup as new user
2. Navigate to `/kyc`
3. Complete Step 1 (identity info)
4. Complete Step 2 (document upload)
5. Complete Step 3 (selfie)
6. Wait for webhook (manual trigger in test)
7. Verify status updated to "verified"

**Investment Flow:**
1. Login as investor
2. View project
3. Create investment in USD (test currency)
4. Verify exchange rate applied
5. Check audit log created
6. Verify amount in SAR calculated

---

## Post-Deployment Phase (Day 9-14)

### 1. Monitoring (24 Hours)

**Automated Checks:**

```bash
# Check error rate
curl https://sentryendpoint.io/api/projects/123/stats/ \
  -H "Authorization: Bearer $SENTRY_TOKEN"

# Check API response times
curl https://vercel.com/api/v9/analytics \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Check cache performance
redis-cli info stats
```

**Manual Checks:**

- [ ] Zero KYC-related errors in Sentry
- [ ] Audit logs being created for all actions
- [ ] Currency conversion working correctly
- [ ] Cache hit rate > 80%
- [ ] No database connection issues
- [ ] All admin pages loading

**Dashboard Review:**

1. Sentry Dashboard
   - No new errors
   - Response time < 500ms p95
   - Error rate < 0.5%

2. Vercel Analytics
   - Page load time < 3s
   - No deploy regressions
   - Traffic patterns normal

3. Database Monitoring
   - No slow queries (> 1s)
   - Connection pool healthy
   - No locks/deadlocks

### 2. User Communication

**Announcement:**
```
New security features deployed:

✓ KYC/AML Compliance - Enhanced identity verification
✓ Audit Logging - Full transaction history
✓ Multi-Currency Support - Invest in your preferred currency
✓ Improved Performance - Faster page loads with caching

Learn more: help.ideabusiness.com/kyc-aml
```

### 3. Gradual Rollout

**Option A: Vercel Gradual Rollout**

```
T+0h:   10% of traffic
T+30m:  Check metrics, no errors
T+1h:   50% of traffic
T+2h:   Check metrics again
T+3h:   100% of traffic
T+24h:  Verify stability
```

**Option B: Feature Flags (If Implemented)**

```typescript
// In components
if (featureFlags.kycEnabled) {
  return <KYCFlow />;
} else {
  return <LegacyFlow />;
}
```

### 4. Notification Testing

**Test Webhook Delivery:**

```bash
# Simulate Jumio webhook
curl -X POST https://ideabusiness.com/api/webhooks/kyc-verification \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $(echo -n 'test' | sha256sum)" \
  -d '{
    "verification_id": "test-123",
    "user_id": "uuid",
    "status": "verified",
    "result": {
      "document_verified": true,
      "selfie_verified": true,
      "liveness_verified": true,
      "risk_score": 25
    }
  }'

# Verify user received email notification
# Verify audit log created
# Verify kyc_data status updated
```

### 5. Run Smoke Tests Daily

```bash
# Daily smoke test script: scripts/daily-smoke-test.sh
#!/bin/bash

echo "Running daily smoke tests..."

# KYC endpoints
curl -f https://ideabusiness.com/api/kyc/status || exit 1
echo "✓ KYC endpoint"

# Audit logs
curl -f https://ideabusiness.com/api/audit/count || exit 1
echo "✓ Audit logs endpoint"

# Currency rates
curl -f https://ideabusiness.com/api/currency/rates || exit 1
echo "✓ Currency endpoint"

# Admin pages
curl -f https://ideabusiness.com/admin/kyc || exit 1
echo "✓ Admin KYC page"

curl -f https://ideabusiness.com/admin/audit-logs || exit 1
echo "✓ Admin audit logs page"

echo "All smoke tests passed!"
```

**Schedule:** Run at 6am, 12pm, 6pm UTC

---

## Rollback Plan (If Needed)

### Rollback Steps

```bash
# 1. Immediate action: Revert Vercel deployment
vercel rollback

# 2. Disable features via feature flag
# (if implemented)
UPDATE feature_flags SET enabled = false
WHERE feature = 'kyc_verification';

# 3. Restore from backup if data corrupted
PGPASSWORD=$DB_PASSWORD psql \
  -h db-xxxx.supabase.co \
  -U postgres \
  -d postgres \
  < backup_20260424_pre_deploy.sql

# 4. Clear cache
redis-cli flushdb

# 5. Monitor for 2 hours
# Check error rates return to normal
```

### Rollback Criteria

Trigger rollback if:
- Error rate > 5% (10x increase)
- KYC flow failing (> 20% failure rate)
- Database corruption detected
- Security issue discovered
- Performance degradation (> 2s page load)

---

## Success Criteria

### Immediate (Day 1)
- [x] All migrations applied successfully
- [x] No database errors
- [x] KYC endpoints responding
- [x] Admin pages loading

### 24 Hours
- [x] Zero critical errors
- [x] KYC flow working for users
- [x] Audit logs populated
- [x] Cache performing well

### 1 Week
- [x] 100+ KYC submissions processed
- [x] No security issues
- [x] Performance metrics stable
- [x] User feedback positive

### 1 Month
- [x] 1000+ KYC verified
- [x] Full compliance audit passed
- [x] Multi-currency working for all projects
- [x] Cache hit rate > 85%

---

## Communication Plan

### Stakeholders

| Role | Frequency | Method |
|------|-----------|--------|
| Admins | Real-time | Slack #incidents |
| Users | Major issues | Email notification |
| Team | Daily | Standup meeting |
| Leadership | Weekly | Status report |

### Issue Escalation

```
Issue Detected
    ↓
P1: Customer-facing, error rate > 5%
    └─→ Page on-call, notify leadership immediately
P2: Partial service, error rate 1-5%
    └─→ Notify #infrastructure, fix within 4 hours
P3: Minor issue, error rate < 1%
    └─→ Log ticket, fix within 24 hours
```

---

## Post-Deployment Tasks (Week 2)

### 1. Documentation Updates

- [x] Update README with new features
- [x] Create user guide for KYC
- [x] Create admin guide for approvals
- [x] Document API changes

### 2. Team Training

- [ ] Train support team on KYC process
- [ ] Train admins on approval workflow
- [ ] Brief engineers on audit logging
- [ ] Update runbooks

### 3. Customer Communication

- [ ] Announce new features
- [ ] Create FAQ for KYC
- [ ] Update help center
- [ ] Send welcome emails to users

### 4. Monitoring Optimization

- [ ] Adjust alerting thresholds
- [ ] Create custom dashboards
- [ ] Set up reporting
- [ ] Review logs and optimize

---

## Maintenance Tasks (Ongoing)

### Daily
- [ ] Monitor error rates
- [ ] Check cache health
- [ ] Verify webhooks received

### Weekly
- [ ] Review audit logs for patterns
- [ ] Check slow query logs
- [ ] Test disaster recovery
- [ ] Update exchange rates

### Monthly
- [ ] Generate compliance report
- [ ] Review performance trends
- [ ] Update security policies
- [ ] Plan for next release

---

## Support Resources

**During Deployment:**
- Chat: #infrastructure-deployment (Slack)
- On-Call: Page duty rotation
- Docs: `/phase2/compliance/`
- Incidents: `incidents.slack.com`

**Contact:**
- Lead: @infrastructure-lead
- On-Call: Check status page
- Emergency: Page escalation

---

## Sign-Off

**Pre-Deployment Review:**
- [ ] PM approved
- [ ] Security reviewed
- [ ] QA tested
- [ ] Ops ready
- [ ] Leadership briefed

**Post-Deployment:**
- [ ] Deployment completed
- [ ] Monitoring active
- [ ] Team notified
- [ ] Documentation updated
- [ ] Metrics reviewed

---

**Deployment Date**: [To be scheduled]  
**Estimated Duration**: 2-3 weeks  
**Risk Level**: Medium  
**Rollback Time**: < 15 minutes
