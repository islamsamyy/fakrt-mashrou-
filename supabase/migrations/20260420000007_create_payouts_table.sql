-- Create payouts table for founder fund transfers
CREATE TABLE payouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount              numeric NOT NULL,
  currency            varchar(3) NOT NULL DEFAULT 'usd',
  status              varchar(50) NOT NULL DEFAULT 'pending' -- pending, processing, completed, failed, cancelled
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_payout_id    varchar(255),
  arrival_date        timestamptz,
  requested_at        timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Create index for founder lookups
CREATE INDEX idx_payouts_founder_id ON payouts(founder_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created_at ON payouts(created_at DESC);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Founders can see their own payouts
CREATE POLICY "Founders can view own payouts"
  ON payouts FOR SELECT
  USING (
    auth.uid() = founder_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Only admins/system can insert/update payouts
CREATE POLICY "Only admins can insert payouts"
  ON payouts FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Only admins can update payouts"
  ON payouts FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
