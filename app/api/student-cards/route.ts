import { NextRequest, NextResponse } from 'next/server';
import { db, studentCard } from '@/lib/db';
import type { StudentCard } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface StudentCardResponse {
  id: number;
  cardId: string;
  studentName: string;
  studentId: string;
  status: string;
  registeredAt: Date;
  updatedAt: Date;
}

export async function GET(): Promise<NextResponse<StudentCard[]>> {
  try {
    const cards = await db.select().from(studentCard);
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { student_id, student_name, card_id, course_code, device_id, phone_number, parent_phone_number } = body;

    // Validate input
    if (!student_id || !student_name || !card_id || !course_code || !device_id || !phone_number || !parent_phone_number) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if RFID code already exists
    const existingCard = await db.select().from(studentCard).where(eq(studentCard.cardId, card_id)).limit(1).then(results => results[0]);

    if (existingCard) {
      return NextResponse.json(
        { success: false, message: 'RFID code already registered' },
        { status: 409 }
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
    });

    return NextResponse.json({
      success: true,
      message: 'Student card registered successfully',
    });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { card_id, ...updates } = body;

    if (!card_id) {
      return NextResponse.json(
        { success: false, message: 'Missing card_id' },
        { status: 400 }
      );
    }

    const existingCard = await db.select().from(studentCard).where(eq(studentCard.cardId, card_id)).limit(1).then(results => results[0]);

    if (!existingCard) {
      return NextResponse.json(
        { success: false, message: 'Card not found' },
        { status: 404 }
      );
    }

    await db.update(studentCard)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(studentCard.cardId, card_id));

    return NextResponse.json({
      success: true,
      message: 'Card updated successfully',
    });
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const rfid_code = searchParams.get('rfid_code');

    if (!rfid_code) {
      return NextResponse.json(
        { success: false, message: 'Missing rfid_code' },
        { status: 400 }
      );
    }

    const { eq } = await import('drizzle-orm');

    const existingCard = await db.select().from(studentCard).where(eq(studentCard.cardId, rfid_code)).limit(1).then(results => results[0]);

    if (!existingCard) {
      return NextResponse.json(
        { success: false, message: 'Card not found' },
        { status: 404 }
      );
    }

    await db.delete(studentCard)
      .where(eq(studentCard.cardId, rfid_code));

    return NextResponse.json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
