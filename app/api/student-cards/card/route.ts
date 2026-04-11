import { NextRequest, NextResponse } from "next/server";
import { db, studentCards, studentAttendance } from "@/lib/db";
import { eq, gt } from "drizzle-orm";
import { CheckIdRequest, CheckIdResponse } from "@/lib/types";

export async function GET(request: NextRequest): Promise<any> {
  try {
    const { searchParams } = new URL(request.url);
    const device_id = searchParams.get("device_id");
    const card_id = searchParams.get("card_id");

    // Validate input
    if (!device_id || !card_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required query parameters: device_id and card_id",
        },
        { status: 400 },
      );
    }

    // Check if card exists in database
    const card = await db
      .select()
      .from(studentCards)
      .where(eq(studentCards.cardId, card_id), eq(studentCards.deviceId, device_id))
      .then((res) => res[0]);

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "RFID card not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in check-id route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest): Promise<any> {
  try {
    const body = await request.json();
    const {
      card_id,
      device_id,
    } = body;

    // Validate input
    if (!device_id || !card_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required query parameters: device_id and card_id",
        },
        { status: 400 },
      );
    }

    // Check if card exists in database
    const card = await db
      .select()
      .from(studentCards)
      .where(eq(studentCards.cardId, card_id), eq(studentCards.deviceId, device_id))
      .then((res) => res[0]);

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          message: "RFID card not found",
        },
        { status: 404 },
      );
    }

    await db
      .update(studentCards)
      .set({
        status: "active",
      })
      .where(eq(studentCards.cardId, card_id));

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in check-id route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}