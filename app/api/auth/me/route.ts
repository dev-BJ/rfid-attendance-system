import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    // console.log("user", user);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        full_name: user.full_name,
        user_id: user.user_id,
        role: user.role,
        courses: user.courses,
        institution: user.institution,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
