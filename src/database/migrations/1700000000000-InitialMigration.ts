import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
	name = 'InitialMigration1700000000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Create enum types
		await queryRunner.query(`
      CREATE TYPE "role_enum" AS ENUM('dev', 'super_monitor', 'monitor');
      CREATE TYPE "activity_type_enum" AS ENUM('service', 'recreational', 'conference');
      CREATE TYPE "payment_status_enum" AS ENUM('pending', 'partial', 'completed');
      CREATE TYPE "notification_channel_enum" AS ENUM('email', 'whatsapp', 'both');
      CREATE TYPE "notification_status_enum" AS ENUM('pending', 'sent', 'failed');
      CREATE TYPE "recipient_type_enum" AS ENUM('monitor', 'parent');
      CREATE TYPE "participation_reason_enum" AS ENUM('normal', 'age_promotion', 'conditional');
      CREATE TYPE "attendee_type_enum" AS ENUM('child', 'parent');
    `);

		// Create tables
		await queryRunner.query(`
      CREATE TABLE "towns" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE "age_groups" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL UNIQUE,
        "min_age" int NOT NULL,
        "max_age" int,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE "monitors" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "phone" varchar NOT NULL,
        "whatsapp_number" varchar,
        "role" role_enum DEFAULT 'monitor',
        "town_id" uuid,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        FOREIGN KEY ("town_id") REFERENCES "towns"("id")
      );

      CREATE TABLE "children" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "date_of_birth" date NOT NULL,
        "current_age_group_id" uuid NOT NULL,
        "town_id" uuid NOT NULL,
        "parent_name" varchar NOT NULL,
        "parent_email" varchar,
        "parent_phone" varchar NOT NULL,
        "parent_whatsapp" varchar,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        FOREIGN KEY ("current_age_group_id") REFERENCES "age_groups"("id"),
        FOREIGN KEY ("town_id") REFERENCES "towns"("id")
      );

      CREATE TABLE "activities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar NOT NULL,
        "activity_type" activity_type_enum NOT NULL,
        "town_id" uuid NOT NULL,
        "start_date" timestamp NOT NULL,
        "end_date" timestamp NOT NULL,
        "location" varchar,
        "description" text,
        "participant_list_generated" boolean DEFAULT false,
        "participant_list_generated_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        FOREIGN KEY ("town_id") REFERENCES "towns"("id")
      );

      CREATE TABLE "activity_target_groups" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "activity_id" uuid NOT NULL,
        "age_group_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now(),
        FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE,
        FOREIGN KEY ("age_group_id") REFERENCES "age_groups"("id")
      );

      CREATE TABLE "participants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "activity_id" uuid NOT NULL,
        "child_id" uuid NOT NULL,
        "meets_requirements" boolean DEFAULT true,
                "reason_for_inclusion" participation_reason_enum DEFAULT 'normal',
        "notes" text,
        "invited_at" timestamp DEFAULT now(),
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        FOREIGN KEY ("activity_id") REFERENCES "activities"("id"),
        FOREIGN KEY ("child_id") REFERENCES "children"("id")
      );

      CREATE TABLE "attendance" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "activity_id" uuid NOT NULL,
        "child_id" uuid NOT NULL,
        "was_present" boolean DEFAULT false,
        "attendee_type" attendee_type_enum DEFAULT 'child',
        "attendee_name" varchar,
        "marked_by_monitor_id" uuid NOT NULL,
        "marked_at" timestamp DEFAULT now(),
        "edited" boolean DEFAULT false,
        "edit_reason" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        FOREIGN KEY ("activity_id") REFERENCES "activities"("id"),
        FOREIGN KEY ("child_id") REFERENCES "children"("id"),
        FOREIGN KEY ("marked_by_monitor_id") REFERENCES "monitors"("id")
      );

      CREATE TABLE "monitor_contributions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "monitor_id" uuid NOT NULL,
        "year" int NOT NULL,
        "amount_due" decimal(10,2) NOT NULL,
        "amount_paid" decimal(10,2) DEFAULT 0,
        "payment_status" payment_status_enum DEFAULT 'pending',
        "installments" jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id")
      );

      CREATE TABLE "notification_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "activity_id" uuid,
        "recipient_type" recipient_type_enum NOT NULL,
        "recipient_id" uuid NOT NULL,
        "recipient_email" varchar,
        "recipient_whatsapp" varchar,
        "channel" notification_channel_enum NOT NULL,
        "status" notification_status_enum DEFAULT 'pending',
        "message" text,
        "error_message" text,
        "sent_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        FOREIGN KEY ("activity_id") REFERENCES "activities"("id")
      );

      CREATE TABLE "system_configurations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "key" varchar NOT NULL UNIQUE,
        "value" varchar NOT NULL,
        "description" varchar,
        "data_type" varchar DEFAULT 'string',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

		// Create indexes
		await queryRunner.query(`
      CREATE INDEX "idx_monitors_email" ON "monitors"("email");
      CREATE INDEX "idx_monitors_town" ON "monitors"("town_id");
      CREATE INDEX "idx_children_town" ON "children"("town_id");
      CREATE INDEX "idx_children_age_group" ON "children"("current_age_group_id");
      CREATE INDEX "idx_activities_town" ON "activities"("town_id");
      CREATE INDEX "idx_activities_date" ON "activities"("start_date");
      CREATE INDEX "idx_participants_activity" ON "participants"("activity_id");
      CREATE INDEX "idx_participants_child" ON "participants"("child_id");
      CREATE INDEX "idx_attendance_activity" ON "attendance"("activity_id");
      CREATE INDEX "idx_attendance_child" ON "attendance"("child_id");
      CREATE INDEX "idx_contributions_monitor" ON "monitor_contributions"("monitor_id");
      CREATE INDEX "idx_contributions_year" ON "monitor_contributions"("year");
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop tables
		await queryRunner.query(`
      DROP TABLE IF EXISTS "system_configurations";
      DROP TABLE IF EXISTS "notification_logs";
      DROP TABLE IF EXISTS "monitor_contributions";
      DROP TABLE IF EXISTS "attendance";
      DROP TABLE IF EXISTS "participants";
      DROP TABLE IF EXISTS "activity_target_groups";
      DROP TABLE IF EXISTS "activities";
      DROP TABLE IF EXISTS "children";
      DROP TABLE IF EXISTS "monitors";
      DROP TABLE IF EXISTS "age_groups";
      DROP TABLE IF EXISTS "towns";
    `);

		// Drop enum types
		await queryRunner.query(`
      DROP TYPE IF EXISTS "attendee_type_enum";
      DROP TYPE IF EXISTS "participation_reason_enum";
      DROP TYPE IF EXISTS "recipient_type_enum";
      DROP TYPE IF EXISTS "notification_status_enum";
      DROP TYPE IF EXISTS "notification_channel_enum";
      DROP TYPE IF EXISTS "payment_status_enum";
      DROP TYPE IF EXISTS "activity_type_enum";
      DROP TYPE IF EXISTS "role_enum";
    `);
	}
}
