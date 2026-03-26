import { NextRequest, NextResponse } from 'next/server';
import { db, studentCards, studentAttendance } from '@/lib/db';
import { eq, gt } from 'drizzle-orm';
import { CheckIdRequest, CheckIdResponse } from '@/lib/types';

// export async function POST(request: NextRequest): Promise<NextResponse<CheckIdResponse>> {
//   try {
//     const body: CheckIdRequest = await request.json();
//     const { device_id, card_id } = body;

//     // Validate input
//     if (!device_id || !card_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Missing required fields: device_id and card_id',
//         },
//         { status: 400 }
//       );
//     }

//     // Check if card exists in database
//     const card = await db.select().from(studentCards).where(eq(studentCards.cardId, card_id));

//     if (!card) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'RFID card not found',
//         },
//         { status: 404 }
//       );
//     }

//     // Check if card is active
//     // if (card.status !== 'active') {
//     //   return NextResponse.json(
//     //     {
//     //       success: false,
//     //       message: `Card is ${card.status}`,
//     //     },
//     //     { status: 400 }
//     //   );
//     // }

//     // Check for duplicate scan (within 5 minutes)
//     const now = new Date();
//     const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

//     const recentScans = await db.select().from(studentAttendance).where(
//       and(
//         eq(studentAttendance.cardId, card_id),
//         eq(studentAttendance.deviceId, device_id),
//         gt(studentAttendance.createdAt, fiveMinutesAgo)
//       )
//     );

//     if (recentScans) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Duplicate scan detected',
//           is_duplicate: true,
//           duplicate_within_minutes: 5,
//           student_id: card.studentId,
//         },
//         { status: 409 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       student_id: card.studentId,
//       message: 'Card verified successfully',
//     });
//   } catch (error) {
//     console.error('Error in check-id route:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: 'Internal server error',
//       },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request: NextRequest): Promise<any> {
  try {    const { searchParams } = new URL(request.url);
    const device_id = searchParams.get('device_id');
    const card_id = searchParams.get('card_id');

    // Validate input
    if (!device_id || !card_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required query parameters: device_id and card_id',
        },
        { status: 400 }
      );
    }

    // Check if card exists in database
    const card = await db.select().from(studentCards).where(eq(studentCards.cardId, card_id)).then(res => res[0]);

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: 'RFID card not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error('Error in check-id route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}