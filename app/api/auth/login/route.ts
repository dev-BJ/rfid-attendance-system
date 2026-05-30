import { NextRequest, NextResponse } from "next/server";
import { verifyUserPassword, generateToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, password } = body;

    if (!user_id || !password) {
      return NextResponse.json(
        { error: "User ID and Password are required" },
        { status: 400 },
      );
    }

    // Verify user credentials
    const user = await verifyUserPassword(user_id, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid User ID or Password" },
        { status: 401 },
      );
    }

    // Create session
    // const session = generateToken(8);
    const data = {
      id: user.id.toString(),
      role: user.role,
      full_name: user.full_name,
      courses: user.courses,
      user_id: user.user_id,
      institution: user.institution,
    };
    await setSessionCookie(data.user_id);

    return NextResponse.json(
      {
        message: "Login successful",
        user: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
