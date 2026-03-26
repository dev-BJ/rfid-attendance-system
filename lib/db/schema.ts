import { pgTable, text, serial, timestamp, boolean, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// System Devices table - for RFID scanner devices
// export const systemDevices = pgTable('system_device', {
//   id: serial('id').primaryKey(),
//   deviceId: varchar('device_id', { length: 100 }).notNull().unique(),
//   name: varchar('name', { length: 255 }).notNull(),
//   location: varchar('location', { length: 255 }).notNull(),
//   status: varchar('status', { length: 50 }).notNull().default('inactive'), // active, inactive, error
//   lastSeen: timestamp('last_seen'),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

export const systemDevices = pgTable('system_device', {
  id: serial('id').primaryKey(),
  deviceId: varchar('device_id', { length: 100 }).notNull().unique(),
  faculty: varchar('faculty', { length: 255 }).notNull(),
  departments: varchar('departments', { length: 255 }).notNull(),
  levels: varchar('levels', { length: 255 }).notNull(), // active, inactive, error
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SystemDevice = typeof systemDevices.$inferSelect;

// Student RFID Cards table
// export const studentCards = pgTable('student_card_id', {
//   id: serial('id').primaryKey(),
//   cardId: varchar('card_id', { length: 100 }).notNull().unique(),
//   studentName: varchar('student_name', { length: 255 }).notNull(),
//   studentId: varchar('student_id', { length: 100 }).notNull().unique(),
//   status: varchar('status', { length: 50 }).notNull().default('active'), // active, inactive, lost
//   registeredAt: timestamp('registered_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

export const studentCards = pgTable('student_card', {
  id: serial('id').primaryKey(),
  deviceId: varchar('device_id', { length: 100 }).notNull(),
  cardId: varchar('card_id', { length: 100 }).notNull().unique(),
  courseCode: varchar('course_code', { length: 155 }).notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  studentId: varchar('student_id', { length: 100 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  parentPhoneNumber: varchar('parent_phone_number', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, inactive, lost
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type StudentCard = typeof studentCards.$inferSelect;

// Attendance Records table
// export const studentAttendance = pgTable('student_attendance', {
//   id: serial('id').primaryKey(),
//   cardId: varchar('card_id', { length: 100 }).notNull(),
//   studentId: varchar('student_id', { length: 100 }).notNull(),
//   studentName: varchar('student_name', { length: 255 }).notNull(),
//   deviceId: varchar('device_id', { length: 100 }).notNull(),
//   deviceName: varchar('device_name', { length: 255 }).notNull(),
//   checkedInAt: timestamp('checked_in_at').notNull(),
//   checkedOutAt: timestamp('checked_out_at'),
//   duration: integer('duration'), // in seconds
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// });

export const studentAttendance = pgTable('student_attendance', {
  id: serial('id').primaryKey(),
  cardId: varchar('card_id', { length: 100 }).notNull(),
  studentId: varchar('student_id', { length: 100 }).notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  deviceId: varchar('device_id', { length: 100 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type StudentAttendance = typeof studentAttendance.$inferSelect;

// Define relations
export const systemDevicesRelations = relations(systemDevices, ({ many }) => ({
  attendance: many(studentAttendance),
  cards: many(studentCards),
}));

export const studentCardsRelations = relations(studentCards, ({ many, one }) => ({
  attendance: many(studentAttendance),
  device: one(systemDevices, {
    fields: [studentCards.deviceId],
    references: [systemDevices.deviceId],
  }),
}));

export const studentAttendanceRelations = relations(studentAttendance, ({ one }) => ({
  device: one(systemDevices, {
    fields: [studentAttendance.deviceId],
    references: [systemDevices.deviceId],
  }),
  card: one(studentCards, {
    fields: [studentAttendance.cardId],
    references: [studentCards.cardId],
  }),
}));
