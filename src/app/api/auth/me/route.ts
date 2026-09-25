import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ user: null });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: userSession.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enrollmentNumber: true,
        course: true,
        department: true,
        semester: true,
        phone: true,
      },
    });

    return NextResponse.json({ user: freshUser || userSession });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.delete("dhsgsu_token");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
