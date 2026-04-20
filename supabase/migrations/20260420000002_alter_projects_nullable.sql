-- Make founder_id nullable to allow projects without a founder
ALTER TABLE projects ALTER COLUMN founder_id DROP NOT NULL;
