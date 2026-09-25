import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role = "STUDENT",
      enrollmentNumber,
      course,
      department,
      semester,
      phone,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if (enrollmentNumber) {
      const existingEnroll = await prisma.user.findUnique({
        where: { enrollmentNumber: enrollmentNumber.trim() },
      });
      if (existingEnroll) {
        return NextResponse.json(
          { error: "This Enrollment Number is already registered" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: role.toUpperCase(),
        enrollmentNumber: enrollmentNumber ? enrollmentNumber.trim().toUpperCase() : null,
        course: course || null,
        department: department || null,
        semester: semester || null,
        phone: phone || null,
      },
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: "Welcome to DHSGSU EventHub!",
        message: "Your university account is ready. Discover upcoming seminars, workshops, and fests happening across campus.",
        type: "SUCCESS",
        link: "/events",
      },
    });

    const userSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as "STUDENT" | "ORGANIZER" | "ADMIN",
      enrollmentNumber: newUser.enrollmentNumber,
      course: newUser.course,
      department: newUser.department,
      semester: newUser.semester,
      phone: newUser.phone,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({
      success: true,
      user: userSession,
      token,
    });

    response.cookies.set({
      name: "dhsgsu_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register account" },
      { status: 500 }
    );
  }
}
