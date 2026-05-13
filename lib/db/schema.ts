import { pgTable, uniqueIndex, serial, varchar, timestamp } from "drizzle-orm/pg-core"
import { $Type, sql } from "drizzle-orm"



export const studentCard = pgTable("student_card", {
	id: serial().primaryKey().notNull(),
	cardId: varchar("card_id", { length: 100 }).notNull(),
	courseCode: varchar("course_code", { length: 155 }).notNull(),
	studentName: varchar("student_name", { length: 255 }).notNull(),
	studentId: varchar("student_id", { length: 100 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
	parentPhoneNumber: varchar("parent_phone_number", { length: 50 }).notNull(),
	registeredAt: timestamp("registered_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 50 }).default('active').notNull(),
	deviceId: varchar("device_id", { length: 100 }).notNull(),
}, (table) => [
	uniqueIndex("student_card_card_id_unique").using("btree", table.cardId.asc().nullsLast().op("text_ops")),
	uniqueIndex("student_card_student_id_unique").using("btree", table.studentId.asc().nullsLast().op("text_ops")),
]);

export type StudentCard = typeof studentCard.$inferSelect;

export const systemDevice = pgTable("system_device", {
	id: serial().primaryKey().notNull(),
	deviceId: varchar("device_id", { length: 100 }).notNull(),
	faculty: varchar({ length: 255 }).notNull(),
	departments: varchar({ length: 255 }).notNull(),
	levels: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("system_device_device_id_unique").using("btree", table.deviceId.asc().nullsLast().op("text_ops")),
]);

export type SystemDevice = typeof systemDevice.$inferSelect;

export const studentAttendance = pgTable("student_attendance", {
	id: serial().primaryKey().notNull(),
	cardId: varchar("card_id", { length: 100 }).notNull(),
	studentId: varchar("student_id", { length: 100 }).notNull(),
	studentName: varchar("student_name", { length: 255 }).notNull(),
	deviceId: varchar("device_id", { length: 100 }).notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	courseCode: varchar("course_code", { length: 155 }).notNull(),
});

export type StudentAttendance = typeof studentAttendance.$inferSelect;