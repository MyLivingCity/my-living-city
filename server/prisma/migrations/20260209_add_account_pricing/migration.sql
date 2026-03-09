-- 1. Create enum for account pricing type (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'pricing_account_type'
    ) THEN
        CREATE TYPE pricing_account_type AS ENUM (
            'ENHANCED_REGULAR',
            'COMMUNITY',
            'BUSINESS'
        );
    END IF;
END$$;

-- 2. Create account_pricing table (if not exists)
CREATE TABLE IF NOT EXISTS account_pricing (
    id SERIAL PRIMARY KEY,
    account_type pricing_account_type NOT NULL UNIQUE,
    yearly_price_cents INTEGER NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by_user_id TEXT
);

-- 3. Insert default yearly pricing
INSERT INTO account_pricing (account_type, yearly_price_cents)
VALUES
    ('ENHANCED_REGULAR', 2000),
    ('COMMUNITY', 5000),
    ('BUSINESS', 10000)
ON CONFLICT (account_type) DO NOTHING;
