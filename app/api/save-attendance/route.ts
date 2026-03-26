import { NextRequest, NextResponse } from 'next/server';
import { db, studentCards, studentAttendance, systemDevices } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { SaveAttendanceRequest, SaveAttendanceResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<SaveAttendanceResponse>> {
  try {
    const body: any = await request.json();
    const { device_id, card_id, time, date } = body;

    // Validate input
    if (!device_id || !date || !card_id || !time) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Verify card exists and belongs to student
    const card = await db.select().from(studentCards).where(eq(studentCards.cardId, card_id)).then(res => res[0]);
    console.log("Card details: ",card)
    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid student or card combination',
        },
        { status: 400 }
      );
    }

    if (card.deviceId != device_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Device not found',
        },
        { status: 404 }
      );
    }

    // Get device information
    // const device = await db.select().from(systemDevices).where(eq(systemDevices.deviceId, device_id)).then(res => res[0]);
    // console.log("Device", device)

    // if (!device) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: 'Device not found',
    //     },
    //     { status: 404 }
    //   );
    // }

    // Create attendance record
    const combinedString = `${date}T${time}`;
    const checkInDate = new Date(combinedString);
    const result = await db.insert(studentAttendance).values({
      cardId: card_id,
      studentId: card.studentId,
      studentName: card.studentName,
      deviceId: device_id,
      timestamp: checkInDate,
    });

    return NextResponse.json({
      success: true,
      attendance_id: `att-${checkInDate.getTime()}`,
      message: 'Attendance recorded successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error in save-attendance route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
