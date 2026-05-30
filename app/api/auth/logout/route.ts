import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie, deleteSessionCookie } from '@/lib/cookies';

export async function POST(request: NextRequest) {
  try {
    await deleteSessionCookie();

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
