-- Enums for IDEA BUSINESS platform

CREATE TYPE user_role AS ENUM ('founder', 'investor', 'admin');
CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'verified');
CREATE TYPE user_tier AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'funded', 'cancelled');
CREATE TYPE investment_status AS ENUM ('committed', 'paid', 'cancelled');
CREATE TYPE notification_type AS ENUM ('message', 'investment', 'kyc_update', 'project_update');
-- Profiles: extends auth.users with app-level data

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role     NOT NULL DEFAULT 'founder',
  full_name   text,
  avatar_url  text,
  bio         text,
  phone       text,
  kyc_status  kyc_status    NOT NULL DEFAULT 'unverified',
  kyc_data    jsonb,
  tier        user_tier     NOT NULL DEFAULT 'basic',
  interests   text[]        NOT NULL DEFAULT '{}',
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- Auto-create profile on signup, picking up metadata set in auth.signUp options
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'founder')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- Projects posted by founders

CREATE TABLE projects (
  id            uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id    uuid           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         text           NOT NULL,
  description   text,
  category      text,
  funding_goal  numeric(15,2)  NOT NULL DEFAULT 0 CHECK (funding_goal >= 0),
  amount_raised numeric(15,2)  NOT NULL DEFAULT 0 CHECK (amount_raised >= 0),
  min_invest    numeric(15,2)  NOT NULL DEFAULT 0 CHECK (min_invest >= 0),
  roi           text,
  status        project_status NOT NULL DEFAULT 'draft',
  verified      boolean        NOT NULL DEFAULT false,
  img           text,
  created_at    timestamptz    NOT NULL DEFAULT now()
);
-- Investments made by investors into projects

CREATE TABLE investments (
  id          uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id  uuid               NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount      numeric(15,2)      NOT NULL CHECK (amount > 0),
  status      investment_status  NOT NULL DEFAULT 'committed',
  created_at  timestamptz        NOT NULL DEFAULT now()
);

-- Keep projects.amount_raised in sync whenever an investment is inserted/updated/deleted
CREATE OR REPLACE FUNCTION sync_amount_raised()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_project_id uuid;
BEGIN
  target_project_id := COALESCE(NEW.project_id, OLD.project_id);

  UPDATE projects
  SET amount_raised = (
    SELECT COALESCE(SUM(amount), 0)
    FROM investments
    WHERE project_id = target_project_id
      AND status != 'cancelled'
  )
  WHERE id = target_project_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_investment_change
  AFTER INSERT OR UPDATE OR DELETE ON investments
  FOR EACH ROW EXECUTE FUNCTION sync_amount_raised();
-- Direct messages between users, optionally linked to a project

CREATE TABLE messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id  uuid        REFERENCES projects(id) ON DELETE SET NULL,
  content     text        NOT NULL,
  read        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);
-- Investor bookmarks / saved projects

CREATE TABLE saved_opportunities (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, project_id)
);
-- In-app notifications for users

CREATE TABLE notifications (
  id         uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      text              NOT NULL,
  body       text              NOT NULL,
  action_url text,
  read       boolean           NOT NULL DEFAULT false,
  created_at timestamptz       NOT NULL DEFAULT now()
);
-- Performance indexes

-- profiles
CREATE INDEX idx_profiles_role       ON profiles(role);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);

-- projects
CREATE INDEX idx_projects_founder_id ON projects(founder_id);
CREATE INDEX idx_projects_status     ON projects(status);
CREATE INDEX idx_projects_category   ON projects(category);
CREATE INDEX idx_projects_verified   ON projects(verified);

-- investments
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_project_id  ON investments(project_id);
CREATE INDEX idx_investments_status      ON investments(status);

-- messages
CREATE INDEX idx_messages_sender_id   ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_read        ON messages(read);
CREATE INDEX idx_messages_created_at  ON messages(created_at DESC);

-- saved_opportunities
CREATE INDEX idx_saved_user_id    ON saved_opportunities(user_id);
CREATE INDEX idx_saved_project_id ON saved_opportunities(project_id);

-- notifications
CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_read       ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
-- Enable Row-Level Security on all tables

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
-- RLS policies for all tables

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ───────────────────────────────────────────────
-- profiles
-- ───────────────────────────────────────────────
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ───────────────────────────────────────────────
-- projects
-- ───────────────────────────────────────────────
CREATE POLICY "projects_select_active"
  ON projects FOR SELECT
  USING (status = 'active' OR founder_id = auth.uid() OR is_admin());

CREATE POLICY "projects_insert_founder"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() = founder_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'founder')
  );

CREATE POLICY "projects_update_owner"
  ON projects FOR UPDATE
  USING (founder_id = auth.uid() OR is_admin());

CREATE POLICY "projects_delete_owner"
  ON projects FOR DELETE
  USING (founder_id = auth.uid() OR is_admin());

-- ───────────────────────────────────────────────
-- investments
-- ───────────────────────────────────────────────
CREATE POLICY "investments_select_own"
  ON investments FOR SELECT
  USING (
    investor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND founder_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "investments_insert_investor"
  ON investments FOR INSERT
  WITH CHECK (
    auth.uid() = investor_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'investor')
  );

CREATE POLICY "investments_update_own"
  ON investments FOR UPDATE
  USING (investor_id = auth.uid() OR is_admin());

-- ───────────────────────────────────────────────
-- messages
-- ───────────────────────────────────────────────
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_receiver"
  ON messages FOR UPDATE
  USING (receiver_id = auth.uid());

-- ───────────────────────────────────────────────
-- saved_opportunities
-- ───────────────────────────────────────────────
CREATE POLICY "saved_select_own"
  ON saved_opportunities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "saved_insert_own"
  ON saved_opportunities FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_delete_own"
  ON saved_opportunities FOR DELETE
  USING (user_id = auth.uid());

-- ───────────────────────────────────────────────
-- notifications
-- ───────────────────────────────────────────────
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Service role (used by server actions via createClient) can insert notifications for any user
CREATE POLICY "notifications_insert_service"
  ON notifications FOR INSERT
  WITH CHECK (true);
-- Storage buckets used by the app

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',       'avatars',       true,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['image/jpeg','image/png','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- avatars: owner can upload/update/delete; everyone can read (bucket is public)
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- kyc-documents: owner can upload; only admins can read (private bucket)
CREATE POLICY "kyc_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "kyc_select_admin"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND is_admin());
