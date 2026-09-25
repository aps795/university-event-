import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid university email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid university email or password" },
        { status: 401 }
      );
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "STUDENT" | "ORGANIZER" | "ADMIN",
      enrollmentNumber: user.enrollmentNumber,
      course: user.course,
      department: user.department,
      semester: user.semester,
      phone: user.phone,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: "dhsgsu_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
