ALTER TABLE "student_card" DROP CONSTRAINT "student_card_card_id_unique";--> statement-breakpoint
ALTER TABLE "student_card" DROP CONSTRAINT "student_card_student_id_unique";--> statement-breakpoint
ALTER TABLE "system_device" DROP CONSTRAINT "system_device_device_id_unique";--> statement-breakpoint
ALTER TABLE "student_attendance" ALTER COLUMN "course_code" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "student_card_card_id_unique" ON "student_card" USING btree ("card_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "student_card_student_id_unique" ON "student_card" USING btree ("student_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "system_device_device_id_unique" ON "system_device" USING btree ("device_id" text_ops);