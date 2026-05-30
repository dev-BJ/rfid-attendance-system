import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db, users } from "./db";
import { eq } from "drizzle-orm";
import type { Users } from "./db";

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate random token
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

// Create user
export async function createUser(data: {
  full_name: string;
  password: string;
  courses?: string;
  role: string;
  user_id: string;
  institution: string;
}): Promise<Omit<Users, "password" | "createdAt" | "updatedAt">> {
  const hashedPassword = await hashPassword(data.password);

  const courses = data?.courses?.trim();
  const course_list =
    (courses?.split(",") ?? courses?.split(" "))?.filter((value, _) =>
      value.trim().toUpperCase(),
    ) ?? courses;

  const result = await db
    .insert(users)
    .values({
      ...data,
      password: hashedPassword,
      courses: JSON.stringify(course_list),
    })
    .returning();

  return result[0];
}

// Get user by ID (optimized: select only needed columns)
export async function getUserById(
  id: string,
): Promise<Omit<Users, "createdAt" | "updatedAt"> | null> {
  const query = await db
    .select({
      id: users.id,
      institution: users.institution,
      user_id: users.user_id,
      role: users.role,
      courses: users.courses,
      full_name: users.full_name,
      password: users.password,
    })
    .from(users)
    .where(eq(users.id, BigInt(id)))
    .limit(1);
  return query[0];
}

export async function getUserByUserId(
  user_id: string,
): Promise<Omit<Users, "createdAt" | "updatedAt"> | null> {
  const query = await db
    .select({
      id: users.id,
      institution: users.institution,
      user_id: users.user_id,
      role: users.role,
      courses: users.courses,
      full_name: users.full_name,
      password: users.password,
    })
    .from(users)
    .where(eq(users.user_id, user_id));
  return query[0];
}

// Verify user password (optimized: password_hash already fetched in getUserByEmail)
export async function verifyUserPassword(
  user_id: string,
  password: string,
): Promise<Omit<Users, "password" | "createdAt" | "updatedAt"> | null> {
  const user = await getUserByUserId(user_id);
  // console.log("user", user);
  if (!user) return null;

  // password_hash is already fetched in getUserByEmail
  const passwordHash = user.password;
  if (!passwordHash) return null;

  const isValid = await verifyPassword(password, passwordHash);
  return isValid ? user : null;
}
