import { after, NextRequest, NextResponse } from "next/server";
import { db, studentCard, studentAttendance, systemDevice } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { SaveAttendanceRequest, SaveAttendanceResponse } from "@/lib/types";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

const smsApiUrl = process.env.SMS_API_URL!;
const smsApiToken = process.env.SMS_API_TOKEN!;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<SaveAttendanceResponse>> {
  try {
    const body: any = await request.json();
    const { device_id, card_id, time, date } = body;

    // Validate input
    if (!device_id || !date || !card_id || !time) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Verify card exists and belongs to student
    const card = await db
      .select()
      .from(studentCard)
      .where(eq(studentCard.cardId, card_id))
      .then((res) => res[0]);
    // console.log("Card details: ", card);
    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid student or card combination",
        },
        { status: 400 },
      );
    }

    if (card.deviceId != device_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Device not found",
        },
        { status: 404 },
      );
    }

    const checkInDate = new Date(`${date}T${time}`);

    // Check if attendance exists
    const attendance_taken = await db
      .select()
      .from(studentAttendance)
      .where(
        and(
          eq(studentAttendance.deviceId, device_id),
          eq(studentAttendance.cardId, card_id),
          eq(studentAttendance.timestamp, checkInDate.toISOString()),
        ),
      )
      .limit(1)
      .then((res) => res[0]);
    // console.log(attendance_taken);
    if (attendance_taken) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance has previously been taken",
        },
        { status: 400 },
      );
    }

    // Create attendance record
    const result = await db.insert(studentAttendance).values({
      cardId: card_id,
      courseCode: card.courseCode,
      studentId: card.studentId,
      studentName: card.studentName,
      deviceId: device_id,
      timestamp: checkInDate.toISOString(),
    });

    const data = {
      from: "FUNAAB",
      to: card.parentPhoneNumber.startsWith("0", 0)
        ? card.parentPhoneNumber.replace("0", "234")
        : card.parentPhoneNumber,
      body: `Alert: ${card.studentName} (${card.studentId}) attended ${card.courseCode} on ${date} at ${time} - FUNAAB EEE Dept`,
    };

    // console.log(data)

    after(async () => {
  try {
    console.log("SMS URL:", smsApiUrl);
    console.log("SMS payload:", data);

    const response = await fetch(smsApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${smsApiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("SMS status:", response.status);

    const text = await response.text();
    console.log("SMS response:", text);
  } catch (error: any) {
    console.error("SMS Error:", error);
    console.error("Cause:", error?.cause);
  }
});

    return NextResponse.json(
      {
        success: true,
        attendance_id: `att-${checkInDate.getTime()}`,
        message: "Attendance recorded successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in save-attendance route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
