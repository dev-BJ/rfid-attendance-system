import {
  pgTable,
  uniqueIndex,
  index,
  varchar,
  timestamp,
  jsonb,
  bigserial,
} from "drizzle-orm/pg-core";

export const institutions = pgTable(
  "institutions",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),

    institution_code: varchar("institution_code", {
      length: 100,
    })
      .notNull()
      .unique(),

    institution_name: varchar("institution_name", {
      length: 255,
    }).notNull(),

    createdAt: timestamp("created_at", {
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  }
);

export type Institution = typeof institutions.$inferSelect;

export const users = pgTable(
  "users",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    user_id: varchar("user_id", { length: 50 }).notNull().unique(),
    courses: jsonb("courses").default(null),
    role: varchar("role", { length: 50 }).notNull(),

    institution: varchar("institution", { length: 100 })
      .notNull()
      .references(() => institutions.institution_code, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    password: varchar("password", { length: 255 }).notNull(),

    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("users_institution_idx").using(
      "btree",
      table.institution.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export type Users = typeof users.$inferSelect;

export const studentCard = pgTable(
  "student_card",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),

    institution: varchar("institution", { length: 100 })
      .notNull()
      .references(() => institutions.institution_code, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    lecturer_id: varchar("lecturer_id", { length: 50 })
      .notNull()
      .references(() => users.user_id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    cardId: varchar("card_id", { length: 100 }).notNull(),
    courseCode: varchar("course_code", { length: 155 }).notNull(),
    studentName: varchar("student_name", { length: 255 }).notNull(),
    studentId: varchar("student_id", { length: 100 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
    parentPhoneNumber: varchar("parent_phone_number", { length: 50 }).notNull(),

    registeredAt: timestamp("registered_at", { mode: "string" })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),

    status: varchar("status", { length: 50 })
      .default("active")
      .notNull(),

    deviceId: varchar("device_id", { length: 100 }).notNull(),
  },
  (table) => [
    uniqueIndex("student_card_card_id_unique").using(
      "btree",
      table.cardId.asc().nullsLast().op("text_ops"),
    ),

    uniqueIndex("student_card_student_id_unique").using(
      "btree",
      table.studentId.asc().nullsLast().op("text_ops"),
    ),

    index("student_card_institution_idx").using(
      "btree",
      table.institution.asc().nullsLast().op("text_ops"),
    ),

    index("student_card_lecturer_id_idx").using(
      "btree",
      table.lecturer_id.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export type StudentCard = typeof studentCard.$inferSelect;

export const systemDevice = pgTable(
  "system_device",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),

    deviceId: varchar("device_id", { length: 100 }).notNull(),

    faculty: varchar("faculty", { length: 255 }).notNull(),
    departments: varchar("departments", { length: 255 }).notNull(),
    levels: varchar("levels", { length: 255 }).notNull(),

    institution: varchar("institution", { length: 100 })
      .notNull()
      .references(() => institutions.institution_code, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    lecturer_id: varchar("lecturer_id", { length: 50 })
      .notNull()
      .references(() => users.user_id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("system_device_device_id_unique").using(
      "btree",
      table.deviceId.asc().nullsLast().op("text_ops"),
    ),

    index("system_device_institution_idx").using(
      "btree",
      table.institution.asc().nullsLast().op("text_ops"),
    ),

    index("system_device_lecturer_id_idx").using(
      "btree",
      table.lecturer_id.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export type SystemDevice = typeof systemDevice.$inferSelect;

export const studentAttendance = pgTable(
  "student_attendance",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),

    cardId: varchar("card_id", { length: 100 }).notNull(),
    studentId: varchar("student_id", { length: 100 }).notNull(),
    studentName: varchar("student_name", { length: 255 }).notNull(),
    deviceId: varchar("device_id", { length: 100 }).notNull(),

    timestamp: timestamp("timestamp", { mode: "string" })
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),

    courseCode: varchar("course_code", { length: 155 }).notNull(),

    institution: varchar("institution", { length: 100 })
      .notNull()
      .references(() => institutions.institution_code, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    lecturer_id: varchar("lecturer_id", { length: 50 })
      .notNull()
      .references(() => users.user_id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    index("student_attendance_institution_idx").using(
      "btree",
      table.institution.asc().nullsLast().op("text_ops"),
    ),

    index("student_attendance_lecturer_id_idx").using(
      "btree",
      table.lecturer_id.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export type StudentAttendance = typeof studentAttendance.$inferSelect;