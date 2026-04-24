# 🚀 Production Deployment In Progress

**Start Time**: April 24, 2026  
**Status**: DEPLOYMENT SEQUENCE INITIATED  
**Expected Duration**: 80 minutes  

---

## ⏱️ STEP 1: Environment Variables Setup (30 minutes)

### Task 1.1: Gather Required Keys

Before proceeding, you'll need:

**From Stripe Dashboard** (https://dashboard.stripe.com/apikeys):
- [ ] STRIPE_SECRET_KEY (starts with `sk_live_`)
- [ ] STRIPE_PUBLISHABLE_KEY (starts with `pk_live_`)

**From Stripe Webhooks** (https://dashboard.stripe.com/webhooks):
- [ ] STRIPE_WEBHOOK_SECRET (starts with `whsec_`)

**From Resend** (https://resend.com/api-keys):
- [ ] RESEND_API_KEY (starts with `re_`)

**From Sentry** (https://sentry.io):
- [ ] SENTRY_DSN (starts with `https://`)

**From Supabase** (Already have):
- ✅ NEXT_PUBLIC_SUPABASE_URL: `https://gbokhgaymzqqpexvcmzm.supabase.co`
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: (already in .env.local)

### Task 1.2: Set Variables in Vercel

```bash
# Go to: https://vercel.com/dashboard
# Project: arabicapp (or your project name)
# Settings → Environment Variables

# Add these 8 variables:

1. NEXT_PUBLIC_SUPABASE_URL
   Value: https://gbokhgaymzqqpexvcmzm.supabase.co
   Environments: Production, Preview, Development

2. NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [Your anon key from .env.local]
   Environments: Production, Preview, Development

3. STRIPE_SECRET_KEY
   Value: sk_live_[your live secret key]
   Environments: Production ONLY (not Preview/Development!)

4. STRIPE_PUBLISHABLE_KEY
   Value: pk_live_[your live publishable key]
   Environments: Production, Preview, Development

5. STRIPE_WEBHOOK_SECRET
   Value: whsec_[your webhook secret]
   Environments: Production ONLY

6. RESEND_API_KEY
   Value: re_[your resend api key]
   Environments: Production, Preview, Development

7. SENTRY_DSN
   Value: https://[key]@[org].ingest.sentry.io/[id]
   Environments: Production, Preview, Development

8. NODE_ENV
   Value: production
   Environments: Production ONLY

9. NEXT_PUBLIC_APP_URL
   Value: https://your-domain.com (or Vercel preview URL)
   Environments: Production, Preview, Development
```

### Task 1.3: Verify All Variables Are Set

- [ ] All 9 variables appear in Vercel dashboard
- [ ] Production-only variables are NOT set for Preview/Development
- [ ] Values match exactly (no extra spaces, special characters)

**Status**: 🟡 AWAITING USER INPUT  
**Time Estimate**: 30 minutes

---

## ⏱️ STEP 2: Stripe Production Configuration (15 minutes)

### Task 2.1: Activate Live Mode

```
1. Go to: https://dashboard.stripe.com/test/dashboard
2. Click toggle at top: "Viewing test data"
3. Switch to "Live data"
4. Confirm you're in live mode
```

### Task 2.2: Configure Webhook Endpoint

```
1. Go to: https://dashboard.stripe.com/webhooks (live mode)
2. Click "Add endpoint"
3. URL: https://your-domain.com/api/webhooks/stripe
4. Select events:
   ✓ payment_intent.succeeded
   ✓ payment_intent.payment_failed
5. Click "Add endpoint"
6. Copy "Signing secret" → Update STRIPE_WEBHOOK_SECRET in Vercel
```

### Task 2.3: Test Webhook

```
1. In Stripe dashboard, click the endpoint you just created
2. Click "Send test event"
3. Select "payment_intent.succeeded"
4. Watch for green checkmark (event received)
```

**Status**: 🟡 AWAITING USER INPUT  
**Time Estimate**: 15 minutes  
**Blocking**: No - can be done after deployment

---

## ⏱️ STEP 3: Resend Email Configuration (10 minutes)

### Task 3.1: Verify API Key

```
1. Go to: https://resend.com/api-keys
2. Copy your API key (starts with `re_`)
3. Verify it's in Vercel as RESEND_API_KEY
4. Check the key is not restricted to specific domains
```

### Task 3.2: (Optional) Verify Sender Domain

```
1. Go to: https://resend.com/domains
2. If you have a domain, add it
3. Complete DNS verification
4. Mark as default sender domain
```

**Status**: 🟡 AWAITING USER INPUT  
**Time Estimate**: 10 minutes  
**Blocking**: No - default domain works for testing

---

## ⏱️ STEP 4: Sentry Error Tracking (10 minutes)

### Task 4.1: Create Sentry Project

```
1. Go to: https://sentry.io
2. Create new project → Select "Next.js"
3. Create organization if needed
4. Copy DSN (starts with https://)
```

### Task 4.2: Set Sentry DSN

```
1. Add SENTRY_DSN to Vercel environment variables
2. Value: [Your DSN from Sentry]
3. Environments: Production
```

### Task 4.3: Verify Connection

```
Sentry will show "1st Event Received" once you deploy and it starts capturing errors
```

**Status**: 🟡 AWAITING USER INPUT  
**Time Estimate**: 10 minutes  
**Blocking**: No - non-critical for launch

---

## ⏱️ STEP 5: Database Migrations (10 minutes)

### Task 5.1: Apply Migrations to Production

Option A: Via Supabase Dashboard (Recommended for first deployment)

```
1. Go to: https://app.supabase.com/project/gbokhgaymzqqpexvcmzm/sql
2. Create new query
3. Run migrations in order:

# Migration 1: Add Video URL
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
COMMENT ON COLUMN projects.video_url IS 'YouTube or Vimeo URL for pitch video';

# Migration 2: Enhance Notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

# Migration 3: Add KYC Table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_status TEXT DEFAULT 'pending',
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

# Migration 4: Create Audit Logs
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

# Migration 5: Multi-Currency Support
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(12,6) NOT NULL,
  captured_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);
```

4. Verify each migration succeeds (green checkmark)
```

### Task 5.2: Verify Tables Created

```
1. Go to: https://app.supabase.com/project/gbokhgaymzqqpexvcmzm/editor
2. Check these tables exist:
   ✓ projects (with video_url column)
   ✓ notifications (with read_at, clicked_at)
   ✓ kyc_verifications (new)
   ✓ audit_logs (new)
   ✓ exchange_rates (new)
```

**Status**: 🟡 AWAITING USER INPUT  
**Time Estimate**: 10 minutes

---

## ⏱️ STEP 6: Deploy to Vercel (5 minutes)

### Task 6.1: Push to GitHub

```bash
cd "D:\IDEA BUSINESS"
git status  # Should be clean
git push origin main
```

### Task 6.2: Verify Vercel Deployment

```
1. Go to: https://vercel.com/dashboard
2. Watch build progress
3. Expected: Build completes in ~2-3 minutes
4. Status should show: "✓ Ready"
```

### Task 6.3: Check Production URL

```bash
# Visit your production URL
https://your-domain.com

# Should load in < 2 seconds
# Should show Arabic/English UI
# Should have light theme (default)
```

**Status**: 🟡 AWAITING USER INPUT  
**Time Estimate**: 5 minutes

---

## ⏱️ STEP 7: Verify Production (10 minutes)

### Task 7.1: Test Homepage

```
✓ Homepage loads
✓ Navbar displays correctly
✓ Light theme applied
✓ All navigation links work
```

### Task 7.2: Test Signup/Login Flow

```bash
# Test signup
Email: testuser@example.com
Password: TestPassword123
Full Name: Test User 2024
Role: Investor

# Expected: Redirect to dashboard
# Check: User profile created

# Test login
Email: testuser@example.com
Password: TestPassword123

# Expected: Redirect to dashboard
# Check: User session created
```

### Task 7.3: Check Error Tracking

```
1. Go to: https://sentry.io
2. Check for "1st Event Received" in project
3. Any errors should appear here automatically
```

### Task 7.4: Verify Email Works

```
1. Sign up with test email
2. Check Resend dashboard: https://resend.com/emails
3. Should see confirmation email in activity
```

**Status**: 🟡 AWAITING USER INPUT  
**Time Estimate**: 10 minutes

---

## 📊 Deployment Status

| Step | Task | Duration | Status |
|---|---|---|---|
| 1 | Environment Variables | 30 min | 🟡 PENDING |
| 2 | Stripe Configuration | 15 min | 🟡 PENDING |
| 3 | Resend Email Setup | 10 min | 🟡 PENDING |
| 4 | Sentry Error Tracking | 10 min | 🟡 PENDING |
| 5 | Database Migrations | 10 min | 🟡 PENDING |
| 6 | Vercel Deployment | 5 min | 🟡 PENDING |
| 7 | Verification | 10 min | 🟡 PENDING |
| **TOTAL** | **Complete Deployment** | **90 min** | 🟡 **READY** |

---

## ✅ Post-Deployment Checklist

### Hour 1: Critical Checks
- [ ] Homepage loads
- [ ] Signup works
- [ ] Login works
- [ ] No 5xx errors in Sentry
- [ ] Emails sending

### Hours 2-4: Functional Tests
- [ ] Create a test project
- [ ] Create a test investment
- [ ] Verify payment flow
- [ ] Check notifications
- [ ] Test all dashboard pages

### First 24 Hours: Monitoring
- [ ] Monitor Sentry error rate (should be 0%)
- [ ] Check API response times (should be < 500ms)
- [ ] Monitor email delivery (should be > 95%)
- [ ] Check database performance
- [ ] Monitor error logs

---

## 🎯 Success Criteria

✅ **Go-Live Success Requires:**
1. Homepage accessible and loads in < 2 seconds
2. Signup/Login flow working
3. No critical (5xx) errors
4. Error rate < 1%
5. Email notifications sending
6. Stripe webhooks receiving events

If all above are met → **🎉 LAUNCH SUCCESSFUL**

---

## 📞 Support During Deployment

**If you encounter issues:**

1. **Vercel Build Failing**
   - Check Environment Variables (extra spaces?)
   - Check git push succeeded
   - Verify no uncommitted changes

2. **Migrations Won't Run**
   - Check Supabase dashboard is in correct project
   - Verify SQL syntax
   - Check RLS policies aren't blocking

3. **Signup/Login Not Working**
   - Check Supabase credentials in Vercel
   - Verify HTTPS is enforced
   - Check email in database

4. **Emails Not Sending**
   - Check RESEND_API_KEY is correct
   - Check email address is valid
   - Check Resend dashboard for bounces

5. **Stripe Webhooks Not Firing**
   - Verify webhook URL is correct
   - Check signing secret matches
   - Test webhook manually in Stripe dashboard

---

## 📝 Notes

- Total time estimate: 90 minutes (80 min + 10 min buffer)
- Most steps can run in parallel
- You can start with Vercel deployment while setting up Stripe
- Sentry/Resend are optional but recommended
- Can add custom domain after initial launch

---

**Deployment Started**: April 24, 2026  
**Status**: IN PROGRESS  
**Next Action**: Complete Step 1 - Environment Variables  

Ready to proceed? 🚀

---

**Repository**: https://github.com/islamsamyy/fakrt-mashrou-
**Vercel Dashboard**: https://vercel.com/dashboard
**Production URL**: (will be available after deployment)
