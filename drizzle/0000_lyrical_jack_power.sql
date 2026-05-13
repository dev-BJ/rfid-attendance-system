CREATE TABLE "student_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" varchar(100) NOT NULL,
	"course_code" varchar(155) DEFAULT 'COM' NOT NULL,
	"student_id" varchar(100) NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_card" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"card_id" varchar(100) NOT NULL,
	"course_code" varchar(155) NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"student_id" varchar(100) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"parent_phone_number" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_card_card_id_unique" UNIQUE("card_id"),
	CONSTRAINT "student_card_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "system_device" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"faculty" varchar(255) NOT NULL,
	"departments" varchar(255) NOT NULL,
	"levels" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_device_device_id_unique" UNIQUE("device_id")
);
