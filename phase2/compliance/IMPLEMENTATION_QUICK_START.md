# Infrastructure Implementation Quick Start

## Overview

This guide walks through implementing KYC/AML compliance, audit logging, multi-currency support, and caching for IDEA BUSINESS.

---

## 1. Apply Database Migrations

### Step 1: Copy Migration Files

All migration files are ready in `supabase/migrations/`:
- `20260424_add_kyc_table.sql` - KYC verification data
- `20260424_create_audit_logs.sql` - Audit trail logging
- `20260424_multi_currency_support.sql` - Multi-currency support

### Step 2: Apply to Supabase

**Option A: Via Supabase Dashboard**
1. Go to SQL Editor
2. Open each migration file
3. Copy and paste content
4. Click "Execute"

**Option B: Via Supabase CLI**
```bash
supabase migration up
```

**Option C: Verify Migration Status**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('kyc_data', 'audit_logs', 'exchange_rates');
```

---

## 2. Set Up KYC Verification Provider

### Choose Your Provider

**Jumio** (Recommended)
- Strongest liveness detection
- Best face matching
- Global coverage
- Pricing: ~$0.50-1.50 per verification

**Onfido**
- Good balance of price/quality
- Excellent document recognition
- Pricing: ~$0.40-1.00 per verification

**Sumsub**
- Most flexible pricing
- Good for high volume
- Pricing: ~$0.30-0.80 per verification

### Integration Steps

1. **Sign up for provider account**
   - Create account at provider website
   - Complete KYC for your company
   - Get API credentials

2. **Add environment variables**
   ```bash
   # .env.local
   JUMIO_API_TOKEN=your_token
   JUMIO_API_SECRET=your_secret
   JUMIO_BASE_URL=https://api.jumio.com
   ```

3. **Add to Vercel**
   - Settings > Environment Variables
   - Add production variables

4. **Test webhook signature verification**
   ```typescript
   // Verify HMAC signature from provider
   import crypto from 'crypto';
   
   const signature = req.headers['x-webhook-signature'];
   const body = req.body;
   const secret = process.env.JUMIO_WEBHOOK_SECRET;
   
   const hash = crypto
     .createHmac('sha256', secret)
     .update(JSON.stringify(body))
     .digest('hex');
   
   if (hash !== signature) {
     throw new Error('Invalid webhook signature');
   }
   ```

---

## 3. Implement KYC Flow Pages

### Create KYC Pages

**File**: `app/kyc/page.tsx`
```typescript
import { KYCForm } from '@/components/kyc/KYCForm';
import { useState } from 'react';

export default function KYCPage() {
  const [step, setStep] = useState(1);
  
  return (
    <div>
      {step === 1 && <IdentityForm onNext={() => setStep(2)} />}
      {step === 2 && <DocumentUpload onNext={() => setStep(3)} />}
      {step === 3 && <SelfieCapture onNext={() => setStep(4)} />}
      {step === 4 && <VerificationInProgress />}
    </div>
  );
}
```

**File**: `app/api/kyc/identity/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  
  const { full_name, date_of_birth, nationality, country_of_residence } = 
    await req.json();
  
  // Check if high-risk country
  const isHighRisk = await supabase.rpc('check_country_risk', {
    country: country_of_residence
  });
  
  // Update KYC data
  const { data, error } = await supabase
    .from('kyc_data')
    .upsert({
      user_id: user.user!.id,
      full_name,
      date_of_birth,
      nationality,
      country_of_residence,
      is_high_risk_country: isHighRisk,
      current_step: 2,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return NextResponse.json(data);
}
```

### Admin Approval Page

**File**: `app/admin/kyc/page.tsx`

Already exists! Just enhance with:
- Risk score display
- Country flag warning
- Document review interface
- Approve/Reject buttons with comments

---

## 4. Set Up Audit Logging

### Verify Audit Log Triggers

After migrations, test that audit logs are created:

```sql
-- Check audit logs are being created
SELECT COUNT(*) FROM audit_logs;

-- View latest audit logs
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Check specific resource type
SELECT * FROM audit_logs 
WHERE resource_type = 'investment' 
ORDER BY created_at DESC;
```

### Create Admin Audit Dashboard

**File**: `app/admin/audit-logs/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { AuditLogTable } from '@/components/admin/AuditLogTable';

export default async function AuditLogsPage() {
  const supabase = await createClient();
  
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  return (
    <div>
      <h1>Audit Logs</h1>
      <AuditLogTable logs={logs || []} />
    </div>
  );
}
```

---

## 5. Implement Multi-Currency Support

### Add Currency to Forms

**Investment Form Enhancement**:
```typescript
import { getSupportedCurrencies, formatCurrency } from '@/lib/currency';

export function InvestmentForm() {
  const currencies = getSupportedCurrencies();
  const [selectedCurrency, setSelectedCurrency] = useState('SAR');
  
  return (
    <form>
      <input type="number" name="amount" placeholder="Amount" />
      
      <select 
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
      >
        {currencies.map(curr => (
          <option key={curr} value={curr}>
            {getCurrencyName(curr)}
          </option>
        ))}
      </select>
    </form>
  );
}
```

### Display Currency

```typescript
import { formatCurrency } from '@/lib/currency';

// Display to user
<p>{formatCurrency(50000, investment.currency)}</p>

// Display in different currencies
<p>Also worth: {formatCurrency(
  convert(50000, 'SAR', 'USD', rates),
  'USD'
)}</p>
```

### Set Up Exchange Rate Updates

**File**: `scripts/update-exchange-rates.sh`
```bash
#!/bin/bash

SUPABASE_URL="$1"
SUPABASE_KEY="$2"
API_KEY="$3"

# Fetch rates from OpenExchangeRates
curl -s "https://openexchangerates.org/api/latest.json?app_id=$API_KEY&base=SAR" \
  | jq '.rates' \
  > /tmp/rates.json

# Insert into Supabase
curl -X POST "$SUPABASE_URL/rest/v1/exchange_rates" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/rates.json
```

**Add to Vercel Cron** (in `vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/exchange-rates",
    "schedule": "0 0 * * *"
  }]
}
```

---

## 6. Configure Redis Caching

### Choose Option

**Development (No Redis needed)**
- Uses in-memory fallback
- Single instance only
- Good for testing

**Production - Vercel KV**
```bash
# In Vercel dashboard:
# Storage > KV Database > Create
# Copy connection string

# Add to environment variables
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### Test Cache

```typescript
import { getCacheManager } from '@/lib/cache';

async function testCache() {
  const cache = getCacheManager();
  
  // Set value
  await cache.set(
    { type: 'project', id: 'test-123' },
    { title: 'Test Project' },
    { ttl: 60 }
  );
  
  // Get value
  const cached = await cache.get({ type: 'project', id: 'test-123' });
  console.log('Cached:', cached);
  
  // Delete value
  await cache.delete({ type: 'project', id: 'test-123' });
}
```

---

## 7. Enable CDN Optimization

### Verify next.config.ts Changes

The file has been updated with:
- Image optimization settings
- Compression enabled
- Long-term caching headers
- Security headers

**Test compression:**
```bash
# Build production
npm run build

# Check bundle size
npm run analyze
```

### Test Image Optimization

```jsx
// Good - uses Next.js Image component
import Image from 'next/image';
<Image src="/project.jpg" width={800} height={600} />

// Not optimized - avoid using
<img src="/project.jpg" />
```

---

## 8. Enable Monitoring

### Sentry Configuration

```bash
# Install
npm install @sentry/nextjs

# Add to .env.local
SENTRY_DSN=https://key@id.ingest.sentry.io/project
SENTRY_ENVIRONMENT=production
```

### Vercel Analytics

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Add to RootLayout
export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 9. Testing Checklist

### Unit Tests

```bash
# Test currency conversion
npm run test -- currency.test.ts

# Test cache manager
npm run test -- cache.test.ts

# Test KYC validation
npm run test -- kyc.test.ts
```

### Integration Tests

```bash
# Test KYC flow end-to-end
npm run test:e2e -- kyc.spec.ts

# Test audit logging
npm run test -- audit-logs.spec.ts

# Test currency display
npm run test -- currency-display.spec.ts
```

### Manual Testing

- [ ] Create investment in different currencies
- [ ] View audit logs in admin
- [ ] Complete full KYC flow
- [ ] Verify cache is working (check Redis metrics)
- [ ] Test image optimization (check waterfall in DevTools)

---

## 10. Deployment

### 1. Pre-Deploy

```bash
# Run tests
npm run test
npm run test:e2e

# Build production
npm run build

# Check for errors
npm run lint
```

### 2. Deploy to Vercel

```bash
# Automatic deploy on git push
git push origin main

# Or manual deploy
vercel deploy --prod
```

### 3. Post-Deploy Verification

```bash
# Check health
curl https://ideabusiness.com/api/health

# Verify KYC page loads
curl https://ideabusiness.com/kyc

# Check audit logs exist
curl https://ideabusiness.com/api/audit/count \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## 11. Monitoring Dashboard

Create a simple monitoring page at `/admin/monitoring`:

**Features:**
- KYC approvals pending
- Audit log count (last 24h)
- Cache hit rate
- Error rate
- Average response time

**Query examples:**
```sql
-- KYC pending
SELECT COUNT(*) FROM kyc_data WHERE status = 'pending';

-- Audit logs (24h)
SELECT COUNT(*) FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 day';

-- High-risk KYC
SELECT COUNT(*) FROM kyc_data 
WHERE risk_score > 60;
```

---

## 12. Troubleshooting

### KYC Provider Not Responding

1. Check API token in `.env.local`
2. Verify webhook URL is publicly accessible
3. Test webhook signature verification
4. Check provider's status page

### Cache Not Working

1. Verify Redis/KV connection
2. Check TTL configuration
3. Review invalidation triggers
4. Check Redis memory usage

### Currency Conversion Inaccurate

1. Update exchange rates manually
2. Verify API provider accuracy
3. Check decimal precision
4. Review fee calculations

### Audit Logs Not Appearing

1. Verify triggers were created
2. Check RLS policies
3. Test direct insert
4. Check for SQL errors

---

## Next Steps

1. Apply migrations
2. Set up KYC provider
3. Test KYC flow
4. Configure Redis
5. Deploy to production
6. Monitor for 24 hours
7. Roll out to users

**Estimated Time**: 2-3 weeks full implementation
