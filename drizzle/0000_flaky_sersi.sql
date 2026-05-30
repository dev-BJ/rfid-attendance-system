CREATE TABLE "institutions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"institution_code" varchar(100) NOT NULL,
	"institution_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "institutions_institution_code_unique" UNIQUE("institution_code")
);
--> statement-breakpoint
CREATE TABLE "student_attendance" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"card_id" varchar(100) NOT NULL,
	"student_id" varchar(100) NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"course_code" varchar(155) NOT NULL,
	"institution" varchar(100) NOT NULL,
	"lecturer_id" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_card" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"institution" varchar(100) NOT NULL,
	"lecturer_id" varchar(50) NOT NULL,
	"card_id" varchar(100) NOT NULL,
	"course_code" varchar(155) NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"student_id" varchar(100) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"parent_phone_number" varchar(50) NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"device_id" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_device" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"faculty" varchar(255) NOT NULL,
	"departments" varchar(255) NOT NULL,
	"levels" varchar(255) NOT NULL,
	"institution" varchar(100) NOT NULL,
	"lecturer_id" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"courses" jsonb DEFAULT 'null'::jsonb,
	"role" varchar(50) NOT NULL,
	"institution" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_institution_institutions_institution_code_fk" FOREIGN KEY ("institution") REFERENCES "public"."institutions"("institution_code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_lecturer_id_users_user_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_card" ADD CONSTRAINT "student_card_institution_institutions_institution_code_fk" FOREIGN KEY ("institution") REFERENCES "public"."institutions"("institution_code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_card" ADD CONSTRAINT "student_card_lecturer_id_users_user_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "system_device" ADD CONSTRAINT "system_device_institution_institutions_institution_code_fk" FOREIGN KEY ("institution") REFERENCES "public"."institutions"("institution_code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "system_device" ADD CONSTRAINT "system_device_lecturer_id_users_user_id_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_institution_institutions_institution_code_fk" FOREIGN KEY ("institution") REFERENCES "public"."institutions"("institution_code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "student_attendance_institution_idx" ON "student_attendance" USING btree ("institution" text_ops);--> statement-breakpoint
CREATE INDEX "student_attendance_lecturer_id_idx" ON "student_attendance" USING btree ("lecturer_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "student_card_card_id_unique" ON "student_card" USING btree ("card_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "student_card_student_id_unique" ON "student_card" USING btree ("student_id" text_ops);--> statement-breakpoint
CREATE INDEX "student_card_institution_idx" ON "student_card" USING btree ("institution" text_ops);--> statement-breakpoint
CREATE INDEX "student_card_lecturer_id_idx" ON "student_card" USING btree ("lecturer_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "system_device_device_id_unique" ON "system_device" USING btree ("device_id" text_ops);--> statement-breakpoint
CREATE INDEX "system_device_institution_idx" ON "system_device" USING btree ("institution" text_ops);--> statement-breakpoint
CREATE INDEX "system_device_lecturer_id_idx" ON "system_device" USING btree ("lecturer_id" text_ops);--> statement-breakpoint
CREATE INDEX "users_institution_idx" ON "users" USING btree ("institution" text_ops);