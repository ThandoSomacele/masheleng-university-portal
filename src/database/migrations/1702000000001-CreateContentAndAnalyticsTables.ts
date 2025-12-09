import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContentAndAnalyticsTables1702000000001
  implements MigrationInterface
{
  name = 'CreateContentAndAnalyticsTables1702000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 9. course_categories table
    await queryRunner.query(`
      CREATE TABLE "course_categories" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "description" TEXT,
        "parent_category_id" uuid REFERENCES "course_categories"("id"),
        "display_order" INTEGER DEFAULT 0,
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_course_categories_slug" ON "course_categories"("slug")`);
    await queryRunner.query(`CREATE INDEX "idx_course_categories_parent" ON "course_categories"("parent_category_id")`);

    // 10. courses table
    await queryRunner.query(`
      CREATE TABLE "courses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(255) UNIQUE NOT NULL,
        "description" TEXT,
        "long_description" TEXT,
        "required_tier_level" INTEGER NOT NULL DEFAULT 1 CHECK (required_tier_level IN (1, 2, 3)),
        "is_published" BOOLEAN DEFAULT FALSE,
        "thumbnail_url" VARCHAR(500),
        "estimated_duration_minutes" INTEGER,
        "difficulty_level" VARCHAR(50) CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
        "category_id" uuid REFERENCES "course_categories"("id"),
        "tags" VARCHAR(100)[],
        "meta_title" VARCHAR(255),
        "meta_description" TEXT,
        "total_enrollments" INTEGER DEFAULT 0,
        "average_rating" DECIMAL(3,2),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "published_at" TIMESTAMP WITH TIME ZONE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_courses_slug" ON "courses"("slug")`);
    await queryRunner.query(`CREATE INDEX "idx_courses_tier_level" ON "courses"("required_tier_level")`);
    await queryRunner.query(`CREATE INDEX "idx_courses_published" ON "courses"("is_published")`);
    await queryRunner.query(`CREATE INDEX "idx_courses_category" ON "courses"("category_id")`);
    await queryRunner.query(`CREATE INDEX "idx_courses_tags" ON "courses" USING GIN("tags")`);

    // 11. course_modules table
    await queryRunner.query(`
      CREATE TABLE "course_modules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "display_order" INTEGER NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_course_modules_course_id" ON "course_modules"("course_id")`);
    await queryRunner.query(`CREATE INDEX "idx_course_modules_order" ON "course_modules"("course_id", "display_order")`);

    // 12. course_lessons table
    await queryRunner.query(`
      CREATE TABLE "course_lessons" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "module_id" uuid NOT NULL REFERENCES "course_modules"("id") ON DELETE CASCADE,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "content_type" VARCHAR(50) NOT NULL CHECK (content_type IN ('VIDEO', 'TEXT', 'QUIZ', 'DOWNLOAD', 'BRIEF')),
        "video_url" VARCHAR(500),
        "video_duration_seconds" INTEGER,
        "video_provider" VARCHAR(50),
        "text_content" TEXT,
        "downloadable_file_url" VARCHAR(500),
        "is_brief" BOOLEAN DEFAULT FALSE,
        "brief_duration_limit_seconds" INTEGER,
        "display_order" INTEGER NOT NULL,
        "is_preview" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_course_lessons_module_id" ON "course_lessons"("module_id")`);
    await queryRunner.query(`CREATE INDEX "idx_course_lessons_course_id" ON "course_lessons"("course_id")`);
    await queryRunner.query(`CREATE INDEX "idx_course_lessons_order" ON "course_lessons"("module_id", "display_order")`);
    await queryRunner.query(`CREATE INDEX "idx_course_lessons_content_type" ON "course_lessons"("content_type")`);

    // 13. user_course_enrollments table
    await queryRunner.query(`
      CREATE TABLE "user_course_enrollments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "status" VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'DROPPED')),
        "progress_percentage" DECIMAL(5,2) DEFAULT 0,
        "completed_lessons_count" INTEGER DEFAULT 0,
        "total_lessons_count" INTEGER,
        "enrolled_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "last_accessed_at" TIMESTAMP WITH TIME ZONE,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "certificate_issued" BOOLEAN DEFAULT FALSE,
        "certificate_url" VARCHAR(500),
        UNIQUE("user_id", "course_id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_enrollments_user_id" ON "user_course_enrollments"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_enrollments_course_id" ON "user_course_enrollments"("course_id")`);
    await queryRunner.query(`CREATE INDEX "idx_enrollments_status" ON "user_course_enrollments"("status")`);

    // 14. user_lesson_progress table
    await queryRunner.query(`
      CREATE TABLE "user_lesson_progress" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "lesson_id" uuid NOT NULL REFERENCES "course_lessons"("id") ON DELETE CASCADE,
        "enrollment_id" uuid NOT NULL REFERENCES "user_course_enrollments"("id") ON DELETE CASCADE,
        "is_completed" BOOLEAN DEFAULT FALSE,
        "completion_percentage" DECIMAL(5,2) DEFAULT 0,
        "watch_time_seconds" INTEGER DEFAULT 0,
        "started_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "last_position_seconds" INTEGER DEFAULT 0,
        UNIQUE("user_id", "lesson_id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_lesson_progress_user_id" ON "user_lesson_progress"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_lesson_progress_lesson_id" ON "user_lesson_progress"("lesson_id")`);
    await queryRunner.query(`CREATE INDEX "idx_lesson_progress_enrollment" ON "user_lesson_progress"("enrollment_id")`);

    // 15. webinars table
    await queryRunner.query(`
      CREATE TABLE "webinars" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "duration_minutes" INTEGER NOT NULL,
        "timezone" VARCHAR(50) DEFAULT 'Africa/Gaborone',
        "required_tier_level" INTEGER NOT NULL DEFAULT 2,
        "max_attendees" INTEGER,
        "meeting_url" VARCHAR(500),
        "meeting_provider" VARCHAR(50),
        "recording_url" VARCHAR(500),
        "status" VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
        "host_name" VARCHAR(255),
        "host_email" VARCHAR(255),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_webinars_scheduled_at" ON "webinars"("scheduled_at")`);
    await queryRunner.query(`CREATE INDEX "idx_webinars_status" ON "webinars"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_webinars_tier_level" ON "webinars"("required_tier_level")`);

    // 16. webinar_registrations table
    await queryRunner.query(`
      CREATE TABLE "webinar_registrations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "webinar_id" uuid NOT NULL REFERENCES "webinars"("id") ON DELETE CASCADE,
        "registration_status" VARCHAR(50) DEFAULT 'REGISTERED' CHECK (registration_status IN ('REGISTERED', 'ATTENDED', 'NO_SHOW', 'CANCELLED')),
        "used_credit" BOOLEAN DEFAULT FALSE,
        "joined_at" TIMESTAMP WITH TIME ZONE,
        "left_at" TIMESTAMP WITH TIME ZONE,
        "attendance_duration_minutes" INTEGER,
        "registered_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE("user_id", "webinar_id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_webinar_registrations_user_id" ON "webinar_registrations"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_webinar_registrations_webinar_id" ON "webinar_registrations"("webinar_id")`);
    await queryRunner.query(`CREATE INDEX "idx_webinar_registrations_status" ON "webinar_registrations"("registration_status")`);

    // 17. digital_tools table
    await queryRunner.query(`
      CREATE TABLE "digital_tools" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "tool_type" VARCHAR(50),
        "required_tier_level" INTEGER NOT NULL DEFAULT 1,
        "tool_url" VARCHAR(500),
        "thumbnail_url" VARCHAR(500),
        "file_size_kb" INTEGER,
        "category" VARCHAR(100),
        "tags" VARCHAR(100)[],
        "download_count" INTEGER DEFAULT 0,
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_digital_tools_tier_level" ON "digital_tools"("required_tier_level")`);
    await queryRunner.query(`CREATE INDEX "idx_digital_tools_type" ON "digital_tools"("tool_type")`);
    await queryRunner.query(`CREATE INDEX "idx_digital_tools_category" ON "digital_tools"("category")`);

    // 18. user_analytics_events table
    await queryRunner.query(`
      CREATE TABLE "user_analytics_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "event_type" VARCHAR(100) NOT NULL,
        "event_category" VARCHAR(50),
        "session_id" VARCHAR(100),
        "ip_address" INET,
        "user_agent" TEXT,
        "device_type" VARCHAR(50),
        "event_metadata" JSONB,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_analytics_events_user_id" ON "user_analytics_events"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_analytics_events_type" ON "user_analytics_events"("event_type")`);
    await queryRunner.query(`CREATE INDEX "idx_analytics_events_created_at" ON "user_analytics_events"("created_at")`);
    await queryRunner.query(`CREATE INDEX "idx_analytics_events_session" ON "user_analytics_events"("session_id")`);

    // 19. subscription_change_logs table
    await queryRunner.query(`
      CREATE TABLE "subscription_change_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "change_type" VARCHAR(50) NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id"),
        "subscription_id" uuid NOT NULL REFERENCES "user_subscriptions"("id"),
        "previous_tier_id" uuid REFERENCES "subscription_tiers"("id"),
        "new_tier_id" uuid REFERENCES "subscription_tiers"("id"),
        "previous_status" VARCHAR(50),
        "new_status" VARCHAR(50),
        "affects_insurance" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_subscription_changes_created_at" ON "subscription_change_logs"("created_at")`);
    await queryRunner.query(`CREATE INDEX "idx_subscription_changes_type" ON "subscription_change_logs"("change_type")`);
    await queryRunner.query(`CREATE INDEX "idx_subscription_changes_insurance" ON "subscription_change_logs"("affects_insurance")`);

    // 20. underwriter_notifications table
    await queryRunner.query(`
      CREATE TABLE "underwriter_notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "trigger_type" VARCHAR(50) NOT NULL,
        "notification_data" JSONB NOT NULL,
        "enrollment_change_percentage" DECIMAL(5,2),
        "baseline_enrollment_count" INTEGER,
        "current_enrollment_count" INTEGER,
        "period_start" TIMESTAMP WITH TIME ZONE,
        "period_end" TIMESTAMP WITH TIME ZONE,
        "sent" BOOLEAN DEFAULT FALSE,
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "delivery_method" VARCHAR(50),
        "acknowledged" BOOLEAN DEFAULT FALSE,
        "acknowledged_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_underwriter_notifications_sent" ON "underwriter_notifications"("sent")`);
    await queryRunner.query(`CREATE INDEX "idx_underwriter_notifications_created" ON "underwriter_notifications"("created_at")`);

    // 21. api_keys table
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key_name" VARCHAR(100) NOT NULL,
        "key_hash" VARCHAR(255) NOT NULL UNIQUE,
        "key_prefix" VARCHAR(20),
        "scope" VARCHAR(50) NOT NULL,
        "allowed_endpoints" TEXT[],
        "rate_limit_per_hour" INTEGER DEFAULT 1000,
        "is_active" BOOLEAN DEFAULT TRUE,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "last_used_at" TIMESTAMP WITH TIME ZONE,
        "created_by" VARCHAR(255),
        "organization" VARCHAR(255),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_api_keys_hash" ON "api_keys"("key_hash")`);
    await queryRunner.query(`CREATE INDEX "idx_api_keys_active" ON "api_keys"("is_active")`);

    // 22. audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id"),
        "actor_type" VARCHAR(50),
        "actor_identifier" VARCHAR(255),
        "action" VARCHAR(100) NOT NULL,
        "resource_type" VARCHAR(100) NOT NULL,
        "resource_id" VARCHAR(100),
        "changes" JSONB,
        "metadata" JSONB,
        "ip_address" INET,
        "user_agent" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_resource" ON "audit_logs"("resource_type", "resource_id")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action")`);

    // Create materialized view for daily user activity
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW "daily_user_activity" AS
      SELECT
        DATE(created_at) as activity_date,
        COUNT(DISTINCT user_id) as daily_active_users,
        COUNT(DISTINCT CASE WHEN event_type = 'LOGIN' THEN user_id END) as login_count,
        COUNT(*) as total_events
      FROM user_analytics_events
      GROUP BY DATE(created_at)
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "idx_daily_user_activity_date" ON "daily_user_activity"("activity_date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop materialized view
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "daily_user_activity"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "api_keys" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "underwriter_notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_change_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_analytics_events" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "digital_tools" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "webinar_registrations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "webinars" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_lesson_progress" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_course_enrollments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_lessons" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_modules" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "courses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_categories" CASCADE`);
  }
}
