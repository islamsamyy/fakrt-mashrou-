-- Add read/unread state and event type to notifications table
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'investment',
  ADD COLUMN IF NOT EXISTS related_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for real-time queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_event_type
  ON notifications(event_type, created_at DESC);
