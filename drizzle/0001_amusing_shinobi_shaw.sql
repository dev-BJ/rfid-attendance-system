ALTER TABLE "student_card_id" RENAME TO "student_card";--> statement-breakpoint
ALTER TABLE "student_card" DROP CONSTRAINT "student_card_id_card_id_unique";--> statement-breakpoint
ALTER TABLE "student_card" DROP CONSTRAINT "student_card_id_student_id_unique";--> statement-breakpoint
ALTER TABLE "student_card" ADD COLUMN "status" varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_card" ADD CONSTRAINT "student_card_card_id_unique" UNIQUE("card_id");--> statement-breakpoint
ALTER TABLE "student_card" ADD CONSTRAINT "student_card_student_id_unique" UNIQUE("student_id");