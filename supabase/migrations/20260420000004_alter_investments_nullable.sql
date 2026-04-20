-- Make investor_id nullable
ALTER TABLE investments ALTER COLUMN investor_id DROP NOT NULL;
