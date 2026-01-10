-- Create insurance_policies table
-- Run with: PGPASSWORD=masheleng_dev_password_2024 psql -h localhost -U masheleng -d masheleng_portal -f database/seeds/create-insurance-policies-table.sql

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE insurance_status AS ENUM ('pending', 'active', 'expired', 'cancelled', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE insurance_type AS ENUM ('life', 'health', 'education', 'disability');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the insurance_policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type insurance_type NOT NULL DEFAULT 'education',
    policy_number VARCHAR(50) UNIQUE,
    status insurance_status NOT NULL DEFAULT 'pending',
    premium DECIMAL(10, 2) NOT NULL,
    coverage_amount DECIMAL(12, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    beneficiaries JSONB,
    medical_info JSONB,
    underwriter_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_type ON insurance_policies(type);

-- Success message
SELECT 'Insurance policies table created successfully!' as result;
