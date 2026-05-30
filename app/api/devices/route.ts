import { NextRequest, NextResponse } from "next/server";
import { db, systemDevice } from "@/lib/db";
import type { SystemDevice } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helper";
import { eq, and, SQL } from "drizzle-orm";

interface SystemDeviceResponse {
  id: number;
  deviceId: string;
  name: string;
  location: string;
  status: string;
  lastSeen: Date | null;
  createdAt: Date;
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
      conditions.push(eq(systemDevice.lecturer_id, user.user_id));
    }
    conditions.push(eq(systemDevice.institution, user.institution));

    const devices = await db
      .select({
        deviceId: systemDevice.deviceId,
        faculty: systemDevice.faculty,
        levels: systemDevice.levels,
        departments: systemDevice.departments,
        // institution: systemDevice.institution,
        // lecturer_id: systemDevice.lecturer_id,
        createdAt: systemDevice.createdAt,
        updatedAt: systemDevice.updatedAt
      })
      .from(systemDevice)
      .where(and(...conditions));

    // console.log(devices)
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
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
    const { device_id, faculty, departments, levels } = body;

    // Validate input
    if (!device_id || !faculty || !departments || !levels) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if device_id already exists
    const [existingDevice] = await db
      .select()
      .from(systemDevice)
      .where(
        and(
          eq(systemDevice.deviceId, device_id),
          eq(systemDevice.institution, user.institution),
        ),
      )
      .limit(1);

    if (existingDevice) {
      return NextResponse.json(
        { success: false, message: "Device ID already exists" },
        { status: 409 },
      );
    }

    const result = await db.insert(systemDevice).values({
      deviceId: device_id,
      faculty: faculty,
      departments: departments,
      levels: levels,
      institution: user.institution,
      lecturer_id: user.user_id,
    });

    return NextResponse.json({
      success: true,
      message: "Device registered successfully",
    });
  } catch (error) {
    console.error("Error creating device:", error);
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
    const { device_id, ...updates } = body;

    if (!device_id) {
      return NextResponse.json(
        { success: false, message: "Missing device_id" },
        { status: 400 },
      );
    }

    const existingDevice = await db
      .select()
      .from(systemDevice)
      .where(
        and(
          eq(systemDevice.deviceId, device_id),
          eq(systemDevice.institution, user.institution),
        ),
      )
      .limit(1)
      .then((results) => results[0]);

    if (!existingDevice) {
      return NextResponse.json(
        { success: false, message: "Device not found" },
        { status: 404 },
      );
    }

    await db
      .update(systemDevice)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(systemDevice.deviceId, device_id),
          eq(systemDevice.institution, user.institution),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Device updated successfully",
    });
  } catch (error) {
    console.error("Error updating device:", error);
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
    const device_id = searchParams.get("device_id");

    if (!device_id) {
      return NextResponse.json(
        { success: false, message: "Missing device_id" },
        { status: 400 },
      );
    }

    const existingDevice = await db
      .select()
      .from(systemDevice)
      .where(
        and(
          eq(systemDevice.deviceId, device_id),
          eq(systemDevice.institution, user.institution),
        ),
      )
      .limit(1)
      .then((results) => results[0]);

    if (!existingDevice) {
      return NextResponse.json(
        { success: false, message: "Device not found" },
        { status: 404 },
      );
    }

    await db
      .delete(systemDevice)
      .where(
        and(
          eq(systemDevice.deviceId, device_id),
          eq(systemDevice.institution, user.institution),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
