-- Add edited_at column to messages table to track edits
ALTER TABLE messages ADD COLUMN edited_at timestamptz;
