-- Multi-Currency Support for IDEA BUSINESS
-- Adds currency tracking to investments and projects

-- Create currency enum
CREATE TYPE currency_code AS ENUM ('SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'OMR', 'JOD', 'BHD');

-- Add currency columns to investments table
ALTER TABLE investments ADD COLUMN currency currency_code NOT NULL DEFAULT 'SAR';
ALTER TABLE investments ADD COLUMN amount_in_original_currency numeric(15,2);
ALTER TABLE investments ADD COLUMN exchange_rate numeric(10,6) DEFAULT 1.0;

-- Add currency columns to projects table
ALTER TABLE projects ADD COLUMN currency currency_code NOT NULL DEFAULT 'SAR';
ALTER TABLE projects ADD COLUMN target_amount_original numeric(15,2);
ALTER TABLE projects ADD COLUMN accepted_currencies currency_code[] DEFAULT ARRAY['SAR'];

-- Add user preferred currency
ALTER TABLE profiles ADD COLUMN preferred_currency currency_code DEFAULT 'SAR';

-- Create exchange rates table for historical tracking
CREATE TABLE exchange_rates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency   currency_code NOT NULL,
  to_currency     currency_code NOT NULL,
  rate            numeric(10,6) NOT NULL,
  source          text, -- 'openexchangerates', 'fixer', 'manual'
  effective_date  date NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency, effective_date)
);

-- Create indexes
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(effective_date DESC);

-- Function to get current exchange rate
CREATE OR REPLACE FUNCTION get_exchange_rate(
  p_from currency_code,
  p_to currency_code,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS numeric AS $$
DECLARE
  rate numeric;
BEGIN
  IF p_from = p_to THEN
    RETURN 1.0;
  END IF;

  -- Get the most recent rate on or before the given date
  SELECT er.rate INTO rate
  FROM exchange_rates er
  WHERE er.from_currency = p_from
    AND er.to_currency = p_to
    AND er.effective_date <= p_date
  ORDER BY er.effective_date DESC
  LIMIT 1;

  RETURN COALESCE(rate, 1.0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to convert amount between currencies
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount numeric,
  p_from currency_code,
  p_to currency_code,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS numeric AS $$
BEGIN
  IF p_from = p_to THEN
    RETURN p_amount;
  END IF;

  RETURN p_amount * get_exchange_rate(p_from, p_to, p_date);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to format currency for display
CREATE OR REPLACE FUNCTION format_currency(
  p_amount numeric,
  p_currency currency_code
)
RETURNS text AS $$
BEGIN
  CASE p_currency
    WHEN 'SAR' THEN RETURN format('%s ر.س', to_char(p_amount, '9,999,999.99'));
    WHEN 'USD' THEN RETURN format('$%s', to_char(p_amount, '9,999,999.99'));
    WHEN 'EUR' THEN RETURN format('€%s', to_char(p_amount, '9,999,999.99'));
    WHEN 'GBP' THEN RETURN format('£%s', to_char(p_amount, '9,999,999.99'));
    WHEN 'AED' THEN RETURN format('%s د.إ', to_char(p_amount, '9,999,999.99'));
    ELSE RETURN format('%s %s', to_char(p_amount, '9,999,999.99'), p_currency::text);
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to store exchange rate when investment is created
CREATE OR REPLACE FUNCTION store_investment_exchange_rate()
RETURNS TRIGGER AS $$
DECLARE
  rate numeric;
BEGIN
  -- If currencies are different, store the exchange rate used
  IF NEW.currency != (SELECT currency FROM projects WHERE id = NEW.project_id LIMIT 1) THEN
    rate := get_exchange_rate(NEW.currency, 'SAR', CURRENT_DATE);
    NEW.exchange_rate := rate;
    NEW.amount_in_original_currency := NEW.amount / rate;
  ELSE
    NEW.amount_in_original_currency := NEW.amount;
    NEW.exchange_rate := 1.0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_investment_currency_conversion
  BEFORE INSERT ON investments
  FOR EACH ROW
  EXECUTE FUNCTION store_investment_exchange_rate();

-- Enable RLS for exchange_rates (read-only for users, write for admins)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exchange rates"
  ON exchange_rates
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage exchange rates"
  ON exchange_rates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- View for investment amounts in different currencies
CREATE OR REPLACE VIEW investment_amounts_by_currency AS
SELECT
  i.id,
  i.investor_id,
  i.project_id,
  i.amount as amount_sar,
  i.currency as investment_currency,
  i.amount_in_original_currency,
  i.exchange_rate,
  convert_currency(i.amount, 'SAR', 'USD', i.created_at::date) as amount_usd,
  convert_currency(i.amount, 'SAR', 'EUR', i.created_at::date) as amount_eur,
  i.created_at
FROM investments i;

-- View for project totals in multiple currencies
CREATE OR REPLACE VIEW project_amounts_by_currency AS
SELECT
  p.id,
  p.title,
  p.currency,
  p.target_amount as target_amount_sar,
  p.amount_raised as amount_raised_sar,
  COALESCE(convert_currency(p.amount_raised, 'SAR', 'USD', CURRENT_DATE), 0) as amount_raised_usd,
  COALESCE(convert_currency(p.amount_raised, 'SAR', 'EUR', CURRENT_DATE), 0) as amount_raised_eur,
  ROUND((p.amount_raised::numeric / p.target_amount) * 100, 2) as funded_percentage
FROM projects p;
