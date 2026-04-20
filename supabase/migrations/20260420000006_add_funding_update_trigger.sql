-- Create trigger to auto-update project funding when investment is paid
CREATE OR REPLACE FUNCTION update_project_funding_on_investment()
RETURNS TRIGGER AS $$
BEGIN
  -- When investment status changes to 'paid' from a different status
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE projects 
    SET amount_raised = amount_raised + NEW.amount
    WHERE id = NEW.project_id;
  -- When investment is cancelled or reverted
  ELSIF NEW.status = 'cancelled' AND OLD.status = 'paid' THEN
    UPDATE projects 
    SET amount_raised = amount_raised - NEW.amount
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS investment_funding_update_trigger ON investments;

-- Create trigger
CREATE TRIGGER investment_funding_update_trigger
AFTER INSERT OR UPDATE ON investments
FOR EACH ROW
EXECUTE FUNCTION update_project_funding_on_investment();
