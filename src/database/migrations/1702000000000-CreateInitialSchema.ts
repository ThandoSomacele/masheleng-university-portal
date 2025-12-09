import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1702000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1702000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "first_name" VARCHAR(100) NOT NULL,
        "surname" VARCHAR(100) NOT NULL,
        "country_code" VARCHAR(2) NOT NULL,
        "location" VARCHAR(255),

        -- Premium+ specific fields (nullable)
        "gender" VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
        "date_of_birth" DATE,
        "phone" VARCHAR(20),
        "botswana_id_encrypted" TEXT,
        "encryption_key_id" VARCHAR(50),

        -- Account status
        "is_email_verified" BOOLEAN DEFAULT FALSE,
        "is_active" BOOLEAN DEFAULT TRUE,
        "last_login_at" TIMESTAMP WITH TIME ZONE,
        "failed_login_attempts" INTEGER DEFAULT 0,
        "locked_until" TIMESTAMP WITH TIME ZONE,

        -- Audit fields
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,

        CONSTRAINT "users_country_code_check" CHECK (LENGTH(country_code) = 2)
      )
    `);

    // Create indexes for users
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_country_code" ON "users"("country_code")`);
    await queryRunner.query(`CREATE INDEX "idx_users_is_active" ON "users"("is_active")`);
    await queryRunner.query(`CREATE INDEX "idx_users_created_at" ON "users"("created_at")`);
    await queryRunner.query(`CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at") WHERE deleted_at IS NULL`);

    // 2. refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" VARCHAR(255) NOT NULL UNIQUE,
        "device_id" VARCHAR(255),
        "device_name" VARCHAR(255),
        "ip_address" INET,
        "user_agent" TEXT,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked" BOOLEAN DEFAULT FALSE,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_hash" ON "refresh_tokens"("token_hash")`);
    await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_expires" ON "refresh_tokens"("expires_at")`);

    // 3. subscription_tiers table
    await queryRunner.query(`
      CREATE TABLE "subscription_tiers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tier_code" VARCHAR(50) UNIQUE NOT NULL,
        "tier_name" VARCHAR(100) NOT NULL,
        "price_bwp" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "price_zar" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "billing_period_months" INTEGER NOT NULL DEFAULT 1,
        "requires_botswana_citizenship" BOOLEAN DEFAULT FALSE,

        -- Features
        "access_level" INTEGER NOT NULL,
        "webinar_credits_per_year" INTEGER DEFAULT 0,
        "includes_insurance" BOOLEAN DEFAULT FALSE,
        "funeral_cover_amount" DECIMAL(12,2),
        "life_cover_amount" DECIMAL(12,2),

        "description" TEXT,
        "features_json" JSONB,
        "is_active" BOOLEAN DEFAULT TRUE,

        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Seed subscription tiers
    await queryRunner.query(`
      INSERT INTO "subscription_tiers"
        ("tier_code", "tier_name", "price_bwp", "price_zar", "access_level", "requires_botswana_citizenship", "webinar_credits_per_year", "includes_insurance", "funeral_cover_amount", "life_cover_amount", "description", "features_json")
      VALUES
        ('ENTRY', 'Entry Package', 0, 0, 1, FALSE, 0, FALSE, NULL, NULL,
         'Free tier with access to course briefs, short videos, and digital tools',
         '["Course briefs", "Short videos", "Digital tools (calculators, templates)"]'::jsonb),

        ('PREMIUM', 'Premium Package', 150, 180, 2, FALSE, 4, FALSE, NULL, NULL,
         'Premium access with full courses, webinars, and discounts',
         '["Full video courses", "4 webinars per year", "10% mentorship discount", "10% consultation discount", "15% seminar discount"]'::jsonb),

        ('PREMIUM_PLUS', 'Premium+ Package', 250, 300, 3, TRUE, 4, TRUE, 50000, 250000,
         'Premium+ with insurance coverage (Botswana citizens only)',
         '["Everything in Premium", "Funeral cover (P50,000)", "Life cover (P250,000)", "20% will generation discount"]'::jsonb)
    `);

    // 4. user_subscriptions table
    await queryRunner.query(`
      CREATE TABLE "user_subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "tier_id" uuid NOT NULL REFERENCES "subscription_tiers"("id"),

        -- Subscription lifecycle
        "status" VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'PENDING', 'CANCELLED', 'SUSPENDED', 'EXPIRED')),
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "current_period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
        "current_period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
        "next_billing_date" TIMESTAMP WITH TIME ZONE,
        "cancelled_at" TIMESTAMP WITH TIME ZONE,
        "cancellation_reason" TEXT,

        -- Payment tracking
        "consecutive_failed_payments" INTEGER DEFAULT 0,
        "last_payment_attempt_at" TIMESTAMP WITH TIME ZONE,
        "auto_renew" BOOLEAN DEFAULT TRUE,

        -- Webinar credits (for Premium/Premium+)
        "webinar_credits_remaining" INTEGER DEFAULT 0,
        "webinar_credits_reset_at" TIMESTAMP WITH TIME ZONE,

        -- Insurance status (Premium+ only)
        "insurance_enrollment_id" uuid,

        -- Audit
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_user_subscriptions_user_id" ON "user_subscriptions"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_user_subscriptions_status" ON "user_subscriptions"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_user_subscriptions_next_billing" ON "user_subscriptions"("next_billing_date")`);
    await queryRunner.query(`CREATE INDEX "idx_user_subscriptions_tier_id" ON "user_subscriptions"("tier_id")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_user_active_subscription" ON "user_subscriptions"("user_id") WHERE status = 'ACTIVE'`);

    // 5. beneficiaries table
    await queryRunner.query(`
      CREATE TABLE "beneficiaries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

        -- Beneficiary details
        "first_name" VARCHAR(100) NOT NULL,
        "surname" VARCHAR(100) NOT NULL,
        "relationship" VARCHAR(50),
        "botswana_id_encrypted" TEXT NOT NULL,
        "encryption_key_id" VARCHAR(50),
        "phone" VARCHAR(20) NOT NULL,

        -- Allocation
        "allocation_percentage" DECIMAL(5,2) NOT NULL DEFAULT 100.00 CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
        "is_primary" BOOLEAN DEFAULT TRUE,

        -- Status
        "is_active" BOOLEAN DEFAULT TRUE,
        "verified_at" TIMESTAMP WITH TIME ZONE,

        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_beneficiaries_user_id" ON "beneficiaries"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_beneficiaries_is_active" ON "beneficiaries"("is_active")`);

    // 6. insurance_enrollments table
    await queryRunner.query(`
      CREATE TABLE "insurance_enrollments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "subscription_id" uuid NOT NULL REFERENCES "user_subscriptions"("id"),

        -- Policy details
        "policy_number" VARCHAR(100) UNIQUE,
        "underwriter_id" VARCHAR(100),
        "policy_status" VARCHAR(50) NOT NULL CHECK (policy_status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'CLAIMED')),

        -- Coverage
        "funeral_cover_amount" DECIMAL(12,2),
        "life_cover_amount" DECIMAL(12,2),
        "effective_date" DATE NOT NULL,
        "expiry_date" DATE,

        -- Underwriter sync
        "last_synced_at" TIMESTAMP WITH TIME ZONE,
        "underwriter_status_updated_at" TIMESTAMP WITH TIME ZONE,

        -- Claims
        "has_active_claim" BOOLEAN DEFAULT FALSE,

        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_insurance_enrollments_user_id" ON "insurance_enrollments"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_insurance_enrollments_policy_number" ON "insurance_enrollments"("policy_number")`);
    await queryRunner.query(`CREATE INDEX "idx_insurance_enrollments_status" ON "insurance_enrollments"("policy_status")`);
    await queryRunner.query(`CREATE INDEX "idx_insurance_enrollments_effective_date" ON "insurance_enrollments"("effective_date")`);

    // Add foreign key for insurance_enrollment_id in user_subscriptions
    await queryRunner.query(`
      ALTER TABLE "user_subscriptions"
      ADD CONSTRAINT "fk_user_subscriptions_insurance"
      FOREIGN KEY ("insurance_enrollment_id") REFERENCES "insurance_enrollments"("id")
    `);

    // 7. payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "subscription_id" uuid REFERENCES "user_subscriptions"("id"),

        -- Payment details
        "payment_provider" VARCHAR(50),
        "external_payment_id" VARCHAR(255),
        "payment_method" VARCHAR(50),

        -- Amount
        "amount" DECIMAL(10,2) NOT NULL,
        "currency" VARCHAR(3) NOT NULL CHECK (currency IN ('BWP', 'ZAR')),
        "exchange_rate" DECIMAL(10,6),

        -- Status
        "status" VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'DISPUTED')),
        "failure_reason" TEXT,

        -- Metadata
        "payment_metadata" JSONB,
        "billing_period_start" TIMESTAMP WITH TIME ZONE,
        "billing_period_end" TIMESTAMP WITH TIME ZONE,

        -- Timestamps
        "processed_at" TIMESTAMP WITH TIME ZONE,
        "refunded_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_payments_user_id" ON "payments"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_subscription_id" ON "payments"("subscription_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_status" ON "payments"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_external_id" ON "payments"("external_payment_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_created_at" ON "payments"("created_at")`);

    // 8. payment_webhook_logs table
    await queryRunner.query(`
      CREATE TABLE "payment_webhook_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "payment_provider" VARCHAR(50) NOT NULL,
        "webhook_event_type" VARCHAR(100) NOT NULL,
        "external_event_id" VARCHAR(255),

        -- Request data
        "raw_payload" JSONB NOT NULL,
        "headers" JSONB,

        -- Processing
        "processed" BOOLEAN DEFAULT FALSE,
        "processed_at" TIMESTAMP WITH TIME ZONE,
        "processing_error" TEXT,
        "retry_count" INTEGER DEFAULT 0,

        -- Links
        "payment_id" uuid REFERENCES "payments"("id"),

        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_webhook_logs_provider" ON "payment_webhook_logs"("payment_provider")`);
    await queryRunner.query(`CREATE INDEX "idx_webhook_logs_processed" ON "payment_webhook_logs"("processed")`);
    await queryRunner.query(`CREATE INDEX "idx_webhook_logs_created_at" ON "payment_webhook_logs"("created_at")`);

    // Continue in next part due to length...
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_webhook_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "insurance_enrollments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "beneficiaries" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_subscriptions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_tiers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
