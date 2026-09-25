import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, audience, targetEventId, targetDepartment, type = "INFO" } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    let recipientIds: string[] = [];

    if (audience === "EVENT_PARTICIPANTS" && targetEventId) {
      const registrations = await prisma.registration.findMany({
        where: { eventId: targetEventId, status: "CONFIRMED" },
        select: { studentId: true },
      });
      recipientIds = registrations.map((r) => r.studentId);
    } else if (audience === "DEPARTMENT" && targetDepartment) {
      const deptStudents = await prisma.user.findMany({
        where: { department: { contains: targetDepartment }, role: "STUDENT" },
        select: { id: true },
      });
      recipientIds = deptStudents.map((s) => s.id);
    } else {
      // ALL_STUDENTS
      const allStudents = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { id: true },
      });
      recipientIds = allStudents.map((s) => s.id);
    }

    if (recipientIds.length > 0) {
      await prisma.notification.createMany({
        data: recipientIds.map((userId) => ({
          userId,
          title: `📢 ${title}`,
          message,
          type,
          link: targetEventId ? `/events/${targetEventId}` : "/events",
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "BROADCAST_ANNOUNCEMENT",
        entity: "Notification",
        details: `Sent announcement '${title}' to ${recipientIds.length} recipients (${audience})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Announcement broadcast to ${recipientIds.length} students.`,
      count: recipientIds.length,
    });
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return NextResponse.json(
      { error: "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, markAll } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, readStatus: false },
        data: { readStatus: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id },
        data: { readStatus: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification status:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
