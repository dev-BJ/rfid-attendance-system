import { NextRequest, NextResponse } from 'next/server';
import { db, studentAttendance } from '@/lib/db';
import { and, gte, lte, eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const deviceId = searchParams.get('device_id');
    const studentId = searchParams.get('student_id');
    const cardId = searchParams.get('card_id');
    // const timestamp = searchParams.get('timestamp');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build filter conditions
    const filters = [];

    if (deviceId) {
      filters.push(eq(studentAttendance.deviceId, deviceId));
    }

    if (studentId) {
      filters.push(eq(studentAttendance.studentId, studentId));
    }

    if (cardId) {
      filters.push(eq(studentAttendance.cardId, cardId));
    }

    // if (timestamp) {
    //   filters.push(gte(studentAttendance.timestamp, new Date(timestamp)));
    // }

    // if (endDate) {
    //   const endDateObj = new Date(endDate);
    //   endDateObj.setHours(23, 59, 59, 999);
    //   filters.push(lte(studentAttendance.checkedInAt, endDateObj));
    // }

    // Get total count
    const totalRecords = await db.select().from(studentAttendance).where(filters.length > 0 ? and(...filters) : undefined);

    const total = totalRecords.length;

    // Get paginated records
    const records = await db.select().from(studentAttendance).where(filters.length > 0 ? and(...filters) : undefined).orderBy(desc(studentAttendance.createdAt)).limit(limit).offset((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
