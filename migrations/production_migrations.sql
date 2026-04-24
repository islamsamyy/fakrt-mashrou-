-- ============================================================================
-- IDEA BUSINESS - Production Database Migrations
-- Applied: April 24, 2026
-- ============================================================================

-- ==========================
-- Migration 1: Video URL Column
-- ==========================
-- Purpose: Add video pitch URL support for projects
-- Status: Ready to apply

ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
COMMENT ON COLUMN projects.video_url IS 'YouTube or Vimeo URL for pitch video';

-- ==========================
-- Migration 2: Enhanced Notifications
-- ==========================
-- Purpose: Add read tracking and interaction timestamps to notifications
-- Status: Ready to apply

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- ==========================
-- Migration 3: KYC Verifications Table
-- ==========================
-- Purpose: Store KYC/AML verification data with risk scoring
-- Status: Ready to apply

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

-- ==========================
-- Migration 4: Audit Logs Table
-- ==========================
-- Purpose: Compliance and transaction audit trail
-- Status: Ready to apply

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

-- ==========================
-- Migration 5: Exchange Rates Table
-- ==========================
-- Purpose: Multi-currency support with real-time exchange rates
-- Status: Ready to apply

CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(12,6) NOT NULL,
  captured_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_captured ON exchange_rates(captured_at DESC);

-- ============================================================================
-- END OF MIGRATIONS
-- ============================================================================
-- All migrations are ready to apply to production Supabase database
-- Run each migration in order in the Supabase SQL editor
-- ============================================================================
