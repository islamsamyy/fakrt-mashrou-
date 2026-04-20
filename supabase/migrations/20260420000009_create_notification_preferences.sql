-- Notification preferences table
CREATE TABLE notification_preferences (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_on_investment   boolean DEFAULT true,
  email_on_message      boolean DEFAULT true,
  email_on_kyc_update   boolean DEFAULT true,
  email_on_milestone    boolean DEFAULT true,
  email_weekly_summary  boolean DEFAULT false,
  push_on_investment    boolean DEFAULT true,
  push_on_message       boolean DEFAULT true,
  push_on_kyc_update    boolean DEFAULT true,
  in_app_notifications  boolean DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
  ON notification_preferences
  USING (auth.uid() = user_id);

-- Auto-create preferences on user creation
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_on_profile_create
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences();
