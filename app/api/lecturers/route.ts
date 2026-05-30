import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import type { Users } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helper";
import { createUser } from "@/lib/auth";

interface StudentCardResponse {
  id: number;
  cardId: string;
  studentName: string;
  studentId: string;
  status: string;
  registeredAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users_list = await db
      .select({
        full_name: users.full_name,
        user_id: users.user_id,
        courses: users.courses,
        createdAt: users.createdAt
      })
      .from(users)
      .where(
        and(
          eq(users.role, "lecturer"),
          eq(users.institution, user.institution),
        ),
      );
    // console.log(users_list);
    return NextResponse.json(users_list);
  } catch (error) {
    console.error("Error fetching lecturers:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, full_name, courses } = body;

    // Validate input
    if (!user_id || !full_name || !courses) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if RFID code already exists
    const existingLecturer = await db
      .select()
      .from(users)
      .where(eq(users.user_id, user_id))
      .limit(1)
      .then((results) => results[0]);

    if (existingLecturer) {
      return NextResponse.json(
        { success: false, message: "RFID code already registered" },
        { status: 409 },
      );
    }

    const result = await createUser({
      user_id,
      full_name,
      courses,
      password: "1234567",
      role: "lecturer",
      institution: user.institution,
    });

    return NextResponse.json({
      success: true,
      message: "Lecturer registered successfully",
    });
  } catch (error) {
    console.error("Error creating lecturer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ...updates } = body;

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "Missing User ID" },
        { status: 400 },
      );
    }

    const existingLecturer = await db
      .select()
      .from(users)
      .where(eq(users.user_id, user_id))
      .limit(1)
      .then((results) => results[0]);

    if (!existingLecturer) {
      return NextResponse.json(
        { success: false, message: "Lecturer not found" },
        { status: 404 },
      );
    }

    await db
      .update(users)
      .set({
        ...updates,
        courses:
          (updates.courses?.split(",") ?? updates.courses?.split(" "))?.filter(
            (value: string, _: string) => value.trim().toUpperCase(),
          ) ?? updates.courses,
        updatedAt: new Date(),
      })
      .where(eq(users.user_id, user_id));

    return NextResponse.json({
      success: true,
      message: "Lecturer updated successfully",
    });
  } catch (error) {
    console.error("Error updating lecturer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "Missing User ID" },
        { status: 400 },
      );
    }

    const existingLecturer = await db
      .select()
      .from(users)
      .where(eq(users.user_id, user_id))
      .limit(1)
      .then((results) => results[0]);

    if (!existingLecturer) {
      return NextResponse.json(
        { success: false, message: "Lecturer not found" },
        { status: 404 },
      );
    }

    await db.delete(users).where(eq(users.user_id, user_id));

    return NextResponse.json({
      success: true,
      message: "Lecturer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lecturer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
