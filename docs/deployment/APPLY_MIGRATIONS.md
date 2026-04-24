# 🗄️ Apply Database Migrations to Production Supabase

**Database**: dqszxefplefuuovdrnru  
**Migrations**: 5 total  
**Estimated Time**: 10 minutes  

---

## 📋 Quick Steps

1. Open Supabase SQL Editor: https://app.supabase.com/project/dqszxefplefuuovdrnru/sql
2. Create new query
3. Copy and run **Migration 1** below
4. Verify success (green checkmark)
5. Repeat for Migrations 2-5
6. Done! ✓

---

## 🚀 Migration 1: Video URL Column

**Purpose**: Add pitch video URL support to projects  
**Duration**: < 1 minute

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
COMMENT ON COLUMN projects.video_url IS 'YouTube or Vimeo URL for pitch video';
```

**Expected Result**: ✓ Success - Column added

**Verify**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name='projects' AND column_name='video_url';
```

---

## 🚀 Migration 2: Enhanced Notifications

**Purpose**: Add read tracking and click timestamps  
**Duration**: < 1 minute

```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
```

**Expected Result**: ✓ Success - Columns and index added

**Verify**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name='notifications' AND column_name IN ('read_at', 'clicked_at');
```

---

## 🚀 Migration 3: KYC Verifications Table

**Purpose**: Store KYC/AML verification status and risk scoring  
**Duration**: < 1 minute

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
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications(verification_status);
```

**Expected Result**: ✓ Success - Table and indexes created

**Verify**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'kyc_verifications';
```

---

## 🚀 Migration 4: Audit Logs Table

**Purpose**: Compliance and transaction audit trail  
**Duration**: < 1 minute

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

**Expected Result**: ✓ Success - Table and indexes created

**Verify**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'audit_logs';
```

---

## 🚀 Migration 5: Exchange Rates Table

**Purpose**: Multi-currency support with real-time rates  
**Duration**: < 1 minute

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

**Expected Result**: ✓ Success - Table and indexes created

**Verify**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'exchange_rates';
```

---

## ✅ Post-Migration Verification

After applying all 5 migrations, run this to verify all tables exist:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**You should see these new/modified tables**:
- ✓ projects (with video_url column)
- ✓ notifications (with read_at, clicked_at columns)
- ✓ kyc_verifications (new)
- ✓ audit_logs (new)
- ✓ exchange_rates (new)

---

## 🔍 Troubleshooting

### If Migration Fails

**Error**: "Relation does not exist"
- **Cause**: Table doesn't exist yet
- **Solution**: Check table name spelling, run migrations in order

**Error**: "Column already exists"
- **Cause**: Column was added in previous deployment
- **Solution**: Normal - the `IF NOT EXISTS` prevents duplicates

**Error**: "Permission denied"
- **Cause**: Missing database permissions
- **Solution**: Use Supabase service role, not anon key

### If Index Creation Fails

**Error**: "Index already exists"
- **Cause**: Index was created previously
- **Solution**: Normal - the `IF NOT EXISTS` prevents duplicates

---

## 📊 Migration Status Tracker

| Migration | Table/Column | Status | Time |
|-----------|-------------|--------|------|
| 1 | projects.video_url | ⏳ Pending | < 1 min |
| 2 | notifications.read_at, clicked_at | ⏳ Pending | < 1 min |
| 3 | kyc_verifications (new) | ⏳ Pending | < 1 min |
| 4 | audit_logs (new) | ⏳ Pending | < 1 min |
| 5 | exchange_rates (new) | ⏳ Pending | < 1 min |

---

## 🎯 What These Migrations Enable

### Migration 1: Video Pitches
- Founders can upload/link pitch videos
- Investors can watch before investing
- Platform supports YouTube/Vimeo embeds

### Migration 2: Notification Analytics
- Track notification read rates
- Measure user engagement
- Improve notification timing

### Migration 3: KYC Compliance
- Store verification status (pending/approved/rejected)
- Risk scoring for compliance
- AML/KYC verification workflow

### Migration 4: Audit Trail
- Log all important actions
- Compliance reporting
- Fraud detection
- Transaction history

### Migration 5: Multi-Currency
- Support 10+ currencies
- Real-time exchange rates
- Global investment support
- Currency conversion tracking

---

## ⏭️ After Migrations Are Applied

1. ✅ All 5 migrations complete
2. ✅ All new tables verified
3. ✅ All indexes created
4. → Proceed to Vercel deployment
5. → Final verification testing

---

## 📝 SQL Files Reference

All migrations are in: `migrations/production_migrations.sql`

You can also:
- Apply via Supabase Dashboard (recommended for first deployment)
- Apply via CLI: `supabase db push`
- Apply via migration files in version control

---

**Status**: Ready to apply  
**Next Step**: Copy migrations to Supabase SQL editor and run  
**Time Estimate**: 10 minutes total  

