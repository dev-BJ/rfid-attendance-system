import { NextRequest, NextResponse } from 'next/server';
import { db, systemDevices } from '@/lib/db';
import type { SystemDevice } from '@/lib/db/schema';

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

export async function GET(): Promise<NextResponse<SystemDevice[]>> {
  try {
    const devices = await db.select().from(systemDevices);
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { device_id, faculty, departments, levels } = body;

    // Validate input
    if (!device_id || !faculty || !departments || !levels) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if device_id already exists
    const { eq } = await import('drizzle-orm');

    const [existingDevice] = await db.select().from(systemDevices).where(eq(systemDevices.deviceId, device_id)).limit(1);

    if (existingDevice) {
      return NextResponse.json(
        { success: false, message: 'Device ID already exists' },
        { status: 409 }
      );
    }

    const result = await db.insert(systemDevices).values({
      deviceId: device_id,
      faculty: faculty,
      departments: departments,
      levels: levels,
    });

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
    });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { device_id, ...updates } = body;

    if (!device_id) {
      return NextResponse.json(
        { success: false, message: 'Missing device_id' },
        { status: 400 }
      );
    }

    const { eq } = await import('drizzle-orm');

    const existingDevice = await db.select().from(systemDevices).where(eq(systemDevices.deviceId, device_id)).limit(1).then(results => results[0]);

    if (!existingDevice) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      );
    }

    await db.update(systemDevices)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(systemDevices.deviceId, device_id));

    return NextResponse.json({
      success: true,
      message: 'Device updated successfully',
    });
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const device_id = searchParams.get('device_id');

    if (!device_id) {
      return NextResponse.json(
        { success: false, message: 'Missing device_id' },
        { status: 400 }
      );
    }

    const { eq } = await import('drizzle-orm');

    const existingDevice = await db.select().from(systemDevices).where(eq(systemDevices.deviceId, device_id)).limit(1).then(results => results[0]);

    if (!existingDevice) {
      return NextResponse.json(
        { success: false, message: 'Device not found' },
        { status: 404 }
      );
    }

    await db.delete(systemDevices)
      .where(eq(systemDevices.deviceId, device_id));

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
