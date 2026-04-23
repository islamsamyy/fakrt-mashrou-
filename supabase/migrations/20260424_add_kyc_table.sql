-- KYC (Know Your Customer) Data Table
-- Stores detailed KYC verification information and documents

CREATE TABLE kyc_data (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- KYC Status and Flow
  status                kyc_status NOT NULL DEFAULT 'unverified',
  current_step          integer NOT NULL DEFAULT 1, -- 1: identity info, 2: national ID, 3: selfie, 4: verification

  -- Step 1: Identity Information
  full_name             text,
  date_of_birth         date,
  nationality           text,
  country_of_residence  text,

  -- Risk Assessment
  is_high_risk_country  boolean DEFAULT false,
  risk_flags            text[] DEFAULT '{}',
  risk_score            integer DEFAULT 0, -- 0-100, 0 is lowest risk

  -- Step 2: National ID Document
  national_id_type      text, -- 'passport', 'id_card', 'driver_license'
  national_id_number    text,
  national_id_document  jsonb, -- {url, size, uploaded_at, verification_status}

  -- Step 3: Selfie
  selfie_url            text,
  selfie_verified       boolean DEFAULT false,

  -- Verification Status
  verification_attempts integer DEFAULT 0,
  last_verification_at  timestamptz,
  verified_at           timestamptz,
  verified_by           uuid, -- admin user who verified

  -- Third-party Verification
  verification_provider text, -- 'jumio', 'onfido', 'sumsub', etc.
  verification_id       text, -- external verification ID
  verification_result   jsonb, -- response from verification service

  -- Metadata
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_kyc_data_user_id ON kyc_data(user_id);
CREATE INDEX idx_kyc_data_status ON kyc_data(status);
CREATE INDEX idx_kyc_data_risk_score ON kyc_data(risk_score);
CREATE INDEX idx_kyc_data_country ON kyc_data(country_of_residence);

-- Enable RLS
ALTER TABLE kyc_data ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own KYC data
CREATE POLICY "Users can view own KYC data"
  ON kyc_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC data"
  ON kyc_data
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all KYC data
CREATE POLICY "Admins can view all KYC data"
  ON kyc_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update KYC data for verification
CREATE POLICY "Admins can update KYC data"
  ON kyc_data
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Auto-create KYC data entry when profile is created
CREATE OR REPLACE FUNCTION create_kyc_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO kyc_data (user_id, status)
  VALUES (NEW.id, 'unverified')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kyc_data_on_profile_create ON profiles;
CREATE TRIGGER kyc_data_on_profile_create
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_kyc_data();

-- Update kyc_status in profiles when kyc_data.status changes
CREATE OR REPLACE FUNCTION sync_kyc_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET kyc_status = NEW.status
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_kyc_status_trigger ON kyc_data;
CREATE TRIGGER sync_kyc_status_trigger
  AFTER INSERT OR UPDATE ON kyc_data
  FOR EACH ROW
  EXECUTE FUNCTION sync_kyc_status();

-- High-risk countries list (OFAC, EU, etc.)
-- Update this as regulatory requirements change
CREATE OR REPLACE FUNCTION check_country_risk(country text)
RETURNS boolean AS $$
DECLARE
  high_risk_countries text[] := ARRAY[
    'KP', -- North Korea
    'IR', -- Iran
    'SY', -- Syria
    'CU', -- Cuba
    'BI', -- Burundi
    'ZW'  -- Zimbabwe
  ];
BEGIN
  RETURN country = ANY(high_risk_countries);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to flag suspicious patterns
CREATE OR REPLACE FUNCTION evaluate_kyc_risk(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  risk_score integer := 0;
  kyc kyc_data%ROWTYPE;
BEGIN
  SELECT * INTO kyc FROM kyc_data WHERE user_id = p_user_id;

  IF kyc IS NULL THEN
    RETURN 0;
  END IF;

  -- High-risk country
  IF check_country_risk(kyc.country_of_residence) THEN
    risk_score := risk_score + 40;
  END IF;

  -- Multiple verification attempts
  IF kyc.verification_attempts > 3 THEN
    risk_score := risk_score + 20;
  END IF;

  -- No selfie yet (incomplete verification)
  IF kyc.selfie_verified IS FALSE THEN
    risk_score := risk_score + 15;
  END IF;

  -- Recent suspicious activity detection would go here
  -- (integrate with fraud detection service)

  RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql;
