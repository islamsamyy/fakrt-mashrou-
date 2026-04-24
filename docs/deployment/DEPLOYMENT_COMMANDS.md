# 🚀 Production Deployment - Command Reference

**Quick Reference Guide for 80-Minute Deployment**

---

## STEP 1: Prepare Your Environment Variables

Copy these exact variable names and get values from:

```bash
# Stripe (https://dashboard.stripe.com/apikeys in LIVE MODE)
STRIPE_SECRET_KEY=sk_live_XXX...
STRIPE_PUBLISHABLE_KEY=pk_live_XXX...
STRIPE_WEBHOOK_SECRET=whsec_XXX...

# Supabase (Already have)
NEXT_PUBLIC_SUPABASE_URL=https://gbokhgaymzqqpexvcmzm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Resend (https://resend.com/api-keys)
RESEND_API_KEY=re_XXX...

# Sentry (https://sentry.io - create project)
SENTRY_DSN=https://XXX@XXX.ingest.sentry.io/XXX

# Other
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

---

## STEP 2: Add to Vercel Dashboard

**URL**: https://vercel.com/dashboard/arabicapp/settings/environment-variables

Click "Add New" and fill in each variable:

```
Name: STRIPE_SECRET_KEY
Value: sk_live_...
Environments: Production ✓
```

Repeat for all 8 variables (Supabase, Stripe keys, Resend, Sentry, APP_URL, NODE_ENV)

**Important**: Mark Stripe and Sentry as Production-only

---

## STEP 3: Verify Git Status

```bash
cd "D:\IDEA BUSINESS"

# Check everything is committed
git status

# Should show: "working tree clean"

# If not, commit changes:
git add -A
git commit -m "production: final deployment configuration"
git push origin main
```

---

## STEP 4: (Optional) Create Sentry Project

```bash
# 1. Go to https://sentry.io
# 2. Sign up or login
# 3. Create project → Next.js
# 4. Copy DSN from project settings
# 5. Add to Vercel as SENTRY_DSN
```

---

## STEP 5: Configure Stripe Webhook

```bash
# 1. Go to https://dashboard.stripe.com/webhooks (LIVE MODE)
# 2. Click "Add endpoint"
# 3. URL: https://your-domain.com/api/webhooks/stripe
# 4. Events:
#    ✓ payment_intent.succeeded
#    ✓ payment_intent.payment_failed
# 5. Copy Signing secret
# 6. Update STRIPE_WEBHOOK_SECRET in Vercel
```

---

## STEP 6: Deploy to Vercel

### Option A: Automatic (Recommended)

```bash
cd "D:\IDEA BUSINESS"
git push origin main

# Vercel automatically deploys when code is pushed
# Watch build at: https://vercel.com/dashboard/arabicapp/deployments
```

### Option B: Manual Deploy

```
1. Go to: https://vercel.com/dashboard/arabicapp
2. Click "Deployments" tab
3. Click "Deploy" button (top right)
4. Select branch: main
5. Click "Deploy"
```

---

## STEP 7: Apply Database Migrations

**Option A: Via Supabase Dashboard (Easiest)**

```
1. Go to: https://app.supabase.com/project/gbokhgaymzqqpexvcmzm/sql
2. Create new query
3. Run these 5 migrations (one at a time):
```

### Migration 1: Video URL
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
COMMENT ON COLUMN projects.video_url IS 'YouTube or Vimeo URL for pitch video';
```

### Migration 2: Enhanced Notifications
```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
```

### Migration 3: KYC Verifications
```sql
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_status TEXT DEFAULT 'pending',
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications(user_id);
```

### Migration 4: Audit Logs
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
```

### Migration 5: Exchange Rates
```sql
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(12,6) NOT NULL,
  captured_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_captured ON exchange_rates(captured_at DESC);
```

---

## STEP 8: Test Production Deployment

### Test 1: Homepage
```bash
curl -s https://your-domain.com/ | head -c 100
# Should show HTML with RTL dir="rtl" and Arabic content
```

### Test 2: API Health
```bash
curl -s https://your-domain.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":""}' \
  | jq .
# Should return: {"error":"البريد الإلكتروني مطلوب","statusCode":400}
```

### Test 3: Signup
```bash
curl -s https://your-domain.com/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Test User",
    "email":"test'$(date +%s)'@example.com",
    "password":"TestPassword123",
    "role":"investor"
  }' \
  | jq .
# Should return: {"success":true,...} OR {"error":"محاولات كثيرة...","statusCode":429}
# (429 = rate limited, which is OK - means security is working)
```

---

## STEP 9: Monitor First Hour

### Check Vercel Metrics
```
URL: https://vercel.com/dashboard/arabicapp/analytics
- Check: Response time < 500ms
- Check: Error rate < 1%
- Check: No 5xx errors
```

### Check Sentry Errors
```
URL: https://sentry.io/organizations/your-org/issues/
- Should see: "1st Event Received" message
- Should see: 0 errors (or only expected errors)
- Watch: Error rate over time
```

### Check Resend Emails
```
URL: https://resend.com/emails
- Should see: Any test emails sent
- Status: Delivered (green checkmark)
```

### Check Stripe Webhooks
```
URL: https://dashboard.stripe.com/webhooks (LIVE MODE)
- Should see: Webhook events in activity log
- Status: All green checkmarks (200 responses)
```

---

## STEP 10: Declare Go-Live Success

When all of these are true:

- ✅ Homepage loads in < 2 seconds
- ✅ Signup/Login working
- ✅ Error rate < 1%
- ✅ No 5xx errors in Sentry
- ✅ Emails sending via Resend
- ✅ Stripe webhooks receiving events
- ✅ API response times < 500ms

**THEN: DEPLOYMENT SUCCESSFUL** 🎉

---

## Troubleshooting Commands

### If Build Fails
```bash
# Check for uncommitted changes
git status

# Check for TypeScript errors
npm run build

# Check environment variables (must be set in Vercel, not .env.local)
```

### If Signup Not Working
```bash
# Test API directly
curl https://your-domain.com/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","password":"Pass123","role":"investor"}'

# Check Sentry for specific error
# Check Supabase logs for auth issues
```

### If Emails Not Sending
```bash
# Verify RESEND_API_KEY is set in Vercel
# Check Resend dashboard for bounced emails
# Check email address format is valid
# Try sending test email from Resend dashboard
```

### If Stripe Webhooks Not Firing
```bash
# Verify webhook URL in Stripe dashboard
# Check URL matches: https://your-domain.com/api/webhooks/stripe
# Check webhook secret matches STRIPE_WEBHOOK_SECRET
# Test webhook manually in Stripe dashboard
```

---

## Quick Status Check

```bash
# Is the site up?
curl -s -o /dev/null -w "%{http_code}" https://your-domain.com

# Is API responding?
curl -s https://your-domain.com/api/auth/login | jq .

# Are we in production?
curl -s https://your-domain.com | grep -i "production"

# Check deployment status
# URL: https://vercel.com/dashboard/arabicapp/deployments
```

---

## Files for Reference

- **DEPLOYMENT_IN_PROGRESS.md** - Detailed step-by-step guide
- **PRODUCTION_QUICK_START.md** - 80-minute timeline
- **PRODUCTION_READY.md** - Approval & checklist
- **BACKEND_FIX_SUMMARY.md** - Backend fixes applied
- **testsprite_tests/FINAL_TEST_REPORT.md** - Test results

---

## Timeline

| Step | Duration | Status |
|---|---|---|
| 1. Environment Variables | 30 min | 🔴 |
| 2. Stripe Config | 15 min | 🔴 |
| 3. Resend Setup | 10 min | 🔴 |
| 4. Sentry Setup | 10 min | 🔴 |
| 5. Migrations | 10 min | 🔴 |
| 6. Vercel Deploy | 5 min | 🔴 |
| 7. Verification | 10 min | 🔴 |
| **TOTAL** | **90 min** | 🔴 **NOT STARTED** |

---

## Get Help

**Issues during deployment?**

1. Check the error message in Sentry
2. Check Vercel build logs
3. Check console output for specific errors
4. Review DEPLOYMENT_IN_PROGRESS.md for detailed steps

**Repository**: https://github.com/islamsamyy/fakrt-mashrou-

---

**Deployment Status**: Ready  
**Current Time**: April 24, 2026  
**Estimated Completion**: April 24, 2026 (80 minutes after start)

🚀 Ready to launch! Start with Step 1.
