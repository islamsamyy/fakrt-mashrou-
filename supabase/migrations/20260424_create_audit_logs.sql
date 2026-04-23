-- Audit Logs Table
-- Tracks all transactions and administrative actions for compliance

CREATE TABLE audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  admin_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,

  -- Action Details
  action          text NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
  resource_type   text NOT NULL, -- 'investment', 'project', 'user', 'kyc', 'payout'
  resource_id     uuid,
  description     text,

  -- Change Tracking
  old_values      jsonb, -- Previous state
  new_values      jsonb, -- New state
  changes         jsonb, -- Specific field changes

  -- Context
  ip_address      inet,
  user_agent      text,
  status          text DEFAULT 'success', -- 'success', 'failure', 'pending'
  error_message   text,

  -- Metadata
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to log investment creation
CREATE OR REPLACE FUNCTION log_investment_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    description
  ) VALUES (
    NEW.investor_id,
    'create',
    'investment',
    NEW.id,
    jsonb_build_object(
      'project_id', NEW.project_id,
      'amount', NEW.amount,
      'status', NEW.status
    ),
    format('Investment of %s SAR created for project %s', NEW.amount, NEW.project_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_investment_created
  AFTER INSERT ON investments
  FOR EACH ROW
  EXECUTE FUNCTION log_investment_creation();

-- Function to log investment status changes
CREATE OR REPLACE FUNCTION log_investment_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      description
    ) VALUES (
      NEW.investor_id,
      'update',
      'investment',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      format('Investment status changed from %s to %s', OLD.status, NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_investment_updated
  AFTER UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION log_investment_update();

-- Function to log KYC status changes
CREATE OR REPLACE FUNCTION log_kyc_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status OR NEW.verified_by IS NOT NULL THEN
    INSERT INTO audit_logs (
      user_id,
      admin_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      description
    ) VALUES (
      NEW.user_id,
      NEW.verified_by,
      CASE WHEN NEW.status = 'verified' THEN 'approve' ELSE 'update' END,
      'kyc',
      NEW.id,
      jsonb_build_object(
        'status', OLD.status,
        'risk_score', OLD.risk_score
      ),
      jsonb_build_object(
        'status', NEW.status,
        'risk_score', NEW.risk_score,
        'verified_at', NEW.verified_at
      ),
      format('KYC status changed from %s to %s (risk score: %s)', OLD.status, NEW.status, NEW.risk_score)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_kyc_data_updated
  AFTER UPDATE ON kyc_data
  FOR EACH ROW
  EXECUTE FUNCTION log_kyc_update();

-- Function to log profile changes (user tier, role, etc.)
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tier != OLD.tier OR NEW.role != OLD.role OR NEW.kyc_status != OLD.kyc_status THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      description
    ) VALUES (
      NEW.id,
      'update',
      'user',
      NEW.id,
      jsonb_build_object(
        'tier', OLD.tier,
        'role', OLD.role,
        'kyc_status', OLD.kyc_status
      ),
      jsonb_build_object(
        'tier', NEW.tier,
        'role', NEW.role,
        'kyc_status', NEW.kyc_status
      ),
      format('User profile updated: tier=%s, role=%s, kyc=%s', NEW.tier, NEW.role, NEW.kyc_status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_changed
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- Function to log project creation
CREATE OR REPLACE FUNCTION log_project_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    new_values,
    description
  ) VALUES (
    NEW.founder_id,
    'create',
    'project',
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'target_amount', NEW.target_amount,
      'status', NEW.status
    ),
    format('Project "%s" created with target %s SAR', NEW.title, NEW.target_amount)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_creation();

-- Helper function to get audit logs for dashboard
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_limit int DEFAULT 100,
  p_offset int DEFAULT 0,
  p_resource_type text DEFAULT NULL,
  p_action text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  admin_id uuid,
  action text,
  resource_type text,
  resource_id uuid,
  description text,
  status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    audit_logs.id,
    audit_logs.user_id,
    audit_logs.admin_id,
    audit_logs.action,
    audit_logs.resource_type,
    audit_logs.resource_id,
    audit_logs.description,
    audit_logs.status,
    audit_logs.created_at
  FROM audit_logs
  WHERE
    (p_resource_type IS NULL OR resource_type = p_resource_type) AND
    (p_action IS NULL OR action = p_action)
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
