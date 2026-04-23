# Production Deployment Checklist

## Phase 2: Full Rollout

### ✅ Pre-Deployment (This Week)
- [ ] Final security audit passed
- [ ] Load test results: p95 < 500ms
- [ ] All npm vulnerabilities fixed
- [ ] Production build passes: `npm run build`
- [ ] Environment variables configured in Vercel
- [ ] Stripe production keys ready
- [ ] Resend API key activated
- [ ] Sentry project created and DSN obtained

### 🚀 Deployment Steps
1. **Build**: `npm run build && npm run start` (test locally)
2. **Deploy to Vercel**: Push to main branch or manual deploy
3. **Verify**: Check production URL loads correctly
4. **Test Auth Flow**: Signup/login on production
5. **Test Investment**: Create test investment transaction
6. **Monitor**: Check Sentry for errors in first hour

### 📊 Post-Deployment Monitoring (24/48 hours)
- [ ] Error rate < 1% (check Sentry)
- [ ] API response time p95 < 500ms
- [ ] Database connection pool healthy
- [ ] Email notifications working (check Resend dashboard)
- [ ] Webhook events receiving properly
- [ ] No rate limiting issues

### 🔒 Security Verification
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS headers correct
- [ ] Sensitive env vars not exposed
- [ ] Rate limiting working
- [ ] Input validation blocking XSS/SQL injection

### 📈 Initial Metrics Baseline
- [ ] DAU tracking working
- [ ] Conversion funnel visible
- [ ] Payment success rate tracking
- [ ] Email delivery rate > 95%

### 🚨 Rollback Plan
- Database migrations: Can rollback 1 version
- Code: Previous version at git tag `production-v1`
- Stripe: No production data yet, safe to test

---

## Configuration Files Needed

### .env.production
```
NEXT_PUBLIC_SUPABASE_URL=https://gbokhgaymzqqpexvcmzm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
RESEND_API_KEY=<your-resend-key>
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-public>
SENTRY_DSN=<your-sentry-dsn>
NODE_ENV=production
```

### Vercel Environment Variables
Set all of above in Vercel dashboard under Settings → Environment Variables

---

## Success Criteria
✅ Production URL is live
✅ Users can signup/login
✅ Investment flow complete (test transaction)
✅ No critical errors in Sentry
✅ Email notifications sending
✅ Payments processing on Stripe
