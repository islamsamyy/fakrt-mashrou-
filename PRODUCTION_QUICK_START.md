# Production Deployment Quick Start Guide

**Goal**: Go live in 80 minutes with zero downtime.

---

## ⏱️ Timeline

| Task | Time | Owner |
|---|---|---|
| Environment Setup | 30 min | DevOps |
| Stripe Configuration | 15 min | Finance |
| Resend Setup | 10 min | Marketing |
| Sentry Configuration | 10 min | DevOps |
| Database Migrations | 10 min | DBA |
| Vercel Deployment | 5 min | DevOps |
| Verification | 10 min | QA |
| **Total** | **80 min** | - |

---

## 🔧 Step-by-Step Instructions

### STEP 1: Vercel Environment Variables (30 min)

1. Go to: https://vercel.com/dashboard/arabicapp
2. Click **Settings** → **Environment Variables**
3. Add all variables from `.env.local`:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://gbokhgaymzqqpexvcmzm.supabase.co
Environments: Production

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: Production

Name: NEXT_PUBLIC_APP_URL
Value: https://ideabusiness.app
Environments: Production

Name: STRIPE_SECRET_KEY
Value: sk_live_... (from https://dashboard.stripe.com/apikeys)
Environments: Production

Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_... (from https://dashboard.stripe.com/apikeys)
Environments: Production

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_... (from https://dashboard.stripe.com/webhooks)
Environments: Production

Name: RESEND_API_KEY
Value: re_... (from https://resend.com/api-keys)
Environments: Production

Name: SENTRY_DSN
Value: https://...@sentry.io/... (from https://sentry.io)
Environments: Production

Name: NODE_ENV
Value: production
Environments: Production
```

✅ **Verification**: All 8 variables appear in Vercel dashboard

---

### STEP 2: Stripe Live Mode (15 min)

1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Secret Key** (starts with `sk_live_`)
3. Copy **Publishable Key** (starts with `pk_live_`)
4. Go to: https://dashboard.stripe.com/webhooks
5. Click **Add Endpoint**
6. URL: `https://ideabusiness.app/api/webhooks/stripe`
7. Events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
8. Copy **Signing secret** (starts with `whsec_`)
9. Update Vercel environment variables with live keys

✅ **Verification**: Test webhook with `curl` from Stripe dashboard

---

### STEP 3: Resend Email API (10 min)

1. Go to: https://resend.com/api-keys
2. Copy API key (starts with `re_`)
3. Add to Vercel as `RESEND_API_KEY`
4. (Optional) Add sender domain in Resend dashboard

✅ **Verification**: Send test email via Resend dashboard

---

### STEP 4: Sentry Error Tracking (10 min)

1. Go to: https://sentry.io/organizations/
2. Create new project → Select **Next.js**
3. Copy DSN (starts with `https://`)
4. Add to Vercel as `SENTRY_DSN`

✅ **Verification**: Check project settings in Sentry

---

### STEP 5: Database Migrations (10 min)

**Option A: Via Supabase Dashboard**
1. Go to: https://app.supabase.com/project/gbokhgaymzqqpexvcmzm/sql
2. Run migrations in order (already applied in dev)

**Option B: Via CLI**
```bash
npm install -g supabase
supabase link --project-ref gbokhgaymzqqpexvcmzm
supabase db push --remote
```

**Migrations applied:**
- `20260424_add_kyc_table.sql` - KYC verification
- `20260424_create_audit_logs.sql` - Transaction audit trail
- `20260424_multi_currency_support.sql` - Currency history
- `20260423000010_add_video_url_to_projects.sql` - Video pitch
- `20260423000011_enhance_notifications_realtime.sql` - Notifications

✅ **Verification**: Check tables in Supabase dashboard

---

### STEP 6: Deploy to Vercel (5 min)

**Option A: Auto-deploy (recommended)**
```bash
git push origin main
# Vercel auto-deploys on push
```

**Option B: Manual deploy**
1. Go to: https://vercel.com/dashboard/arabicapp
2. Click **Deployments**
3. Click **Deploy** (top right)
4. Select **main** branch

✅ **Verification**: Deployment succeeds (green checkmark)

---

### STEP 7: Verify Production (10 min)

1. **Visit homepage**: https://ideabusiness.app
   - Should load in < 2 seconds
   - Light theme displays correctly
   - All navigation links work

2. **Test signup/login**:
   ```
   Email: test@example.com
   Password: TestPass123
   Role: Investor
   ```
   - Should redirect to dashboard
   - Token stored in cookies

3. **Check error tracking**: https://sentry.io
   - Should see "firstEvent" timestamp

4. **Monitor metrics**: https://vercel.com/dashboard/arabicapp
   - Response time < 500ms
   - No 5xx errors

5. **Test email**: https://resend.com/emails
   - Should see test email in activity

✅ **Verification**: All checks pass

---

## 🎯 Success Criteria

✅ Production URL is live  
✅ Users can signup/login  
✅ Investment flow works (test transaction)  
✅ Email notifications sending  
✅ Payments processing on Stripe  
✅ No critical errors in Sentry  
✅ API response time < 500ms  

---

## 🆘 Troubleshooting

### Build fails on deploy
- Check: `.next` folder exists locally (`npm run build`)
- Check: All environment variables are set in Vercel
- Solution: Push to main again

### Stripe webhooks not firing
- Check: Webhook URL is accessible
- Check: Signing secret is correct
- Solution: Test in Stripe dashboard → Webhooks → Send test event

### Email not sending
- Check: RESEND_API_KEY is set
- Check: Sender domain is verified
- Solution: Test from Resend dashboard

### Database errors
- Check: Migrations applied successfully
- Check: RLS policies are enabled
- Solution: Check Supabase logs

---

## 📞 Support

- **Vercel Issues**: https://vercel.com/support
- **Stripe Issues**: https://stripe.com/docs
- **Resend Issues**: https://resend.com/docs
- **Sentry Issues**: https://sentry.io/support

---

**Status**: Ready to deploy  
**Date**: April 24, 2026  
**Approval**: Awaiting product owner sign-off
