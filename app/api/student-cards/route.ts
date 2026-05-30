import { NextRequest, NextResponse } from "next/server";
import { db, studentCard } from "@/lib/db";
import type { StudentCard } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helper";
import { eq, and, SQL } from "drizzle-orm";

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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conditions: SQL[] = [];

    if (user.role === "lecturer") {
      conditions.push(eq(studentCard.lecturer_id, user.user_id));
    }
    conditions.push(eq(studentCard.institution, user.institution));

    const cards = await db
      .select({
        cardId: studentCard.cardId,
        courseCode: studentCard.courseCode,
        studentName: studentCard.studentName,
        studentId: studentCard.studentId,
        phoneNumber: studentCard.phoneNumber,
        parentPhoneNumber: studentCard.parentPhoneNumber,
        registeredAt: studentCard.registeredAt,
        updatedAt: studentCard.updatedAt,
        status: studentCard.status,
        deviceId: studentCard.deviceId,
      })
      .from(studentCard)
      .where(and(...conditions));
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
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
    const {
      student_id,
      student_name,
      card_id,
      course_code,
      device_id,
      phone_number,
      parent_phone_number,
    } = body;

    // Validate input
    if (
      !student_id ||
      !student_name ||
      !card_id ||
      !course_code ||
      !device_id ||
      !phone_number ||
      !parent_phone_number
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if RFID code already exists
    const existingCard = await db
      .select()
      .from(studentCard)
      .where(
        and(
          eq(studentCard.cardId, card_id),
          eq(studentCard.institution, user.institution),
        ),
      )
      .limit(1)
      .then((results) => results[0]);

    if (existingCard) {
      return NextResponse.json(
        { success: false, message: "RFID code already registered" },
        { status: 409 },
      );
    }

    const result = await db.insert(studentCard).values({
      cardId: card_id,
      studentId: student_id,
      studentName: student_name,
      courseCode: course_code,
      deviceId: device_id,
      phoneNumber: phone_number,
      parentPhoneNumber: parent_phone_number,
      institution: user.institution,
      lecturer_id: user.user_id,
    });

    return NextResponse.json({
      success: true,
      message: "Student card registered successfully",
    });
  } catch (error) {
    console.error("Error creating card:", error);
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
    const { card_id, ...updates } = body;

    if (!card_id) {
      return NextResponse.json(
        { success: false, message: "Missing card_id" },
        { status: 400 },
      );
    }

    const existingCard = await db
      .select()
      .from(studentCard)
      .where(
        and(
          eq(studentCard.cardId, card_id),
          eq(studentCard.institution, user.institution),
        ),
      )
      .limit(1)
      .then((results) => results[0]);

    if (!existingCard) {
      return NextResponse.json(
        { success: false, message: "Card not found" },
        { status: 404 },
      );
    }

    await db
      .update(studentCard)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(studentCard.cardId, card_id),
          eq(studentCard.institution, user.institution),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Card updated successfully",
    });
  } catch (error) {
    console.error("Error updating card:", error);
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
    const rfid_code = searchParams.get("rfid_code");

    if (!rfid_code) {
      return NextResponse.json(
        { success: false, message: "Missing rfid_code" },
        { status: 400 },
      );
    }

    const existingCard = await db
      .select()
      .from(studentCard)
      .where(
        and(
          eq(studentCard.cardId, rfid_code),
          eq(studentCard.institution, user.institution),
        ),
      )
      .limit(1)
      .then((results) => results[0]);

    if (!existingCard) {
      return NextResponse.json(
        { success: false, message: "Card not found" },
        { status: 404 },
      );
    }

    await db
      .delete(studentCard)
      .where(
        and(
          eq(studentCard.cardId, rfid_code),
          eq(studentCard.institution, user.institution),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
