import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 403 });
    }

    const [
      totalStudents,
      totalOrganizers,
      totalEvents,
      totalRegistrations,
      totalAttendance,
      totalCertificates,
      pendingEvents,
      recentAuditLogs,
      users,
      events,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ORGANIZER" } }),
      prisma.event.count(),
      prisma.registration.count({ where: { status: "CONFIRMED" } }),
      prisma.attendance.count(),
      prisma.certificate.count(),
      prisma.event.findMany({
        where: { status: "PENDING_APPROVAL" },
        include: {
          organizer: { select: { name: true, email: true, department: true } },
          department: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { timestamp: "desc" },
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          enrollmentNumber: true,
          department: true,
          course: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.event.findMany({
        include: {
          department: true,
          _count: {
            select: { registrations: true, attendance: true },
          },
        },
      }),
    ]);

    // Compute category counts
    const categoryStats: Record<string, number> = {};
    for (const ev of events) {
      categoryStats[ev.category] = (categoryStats[ev.category] || 0) + 1;
    }
    const categoryData = Object.entries(categoryStats).map(([name, count]) => ({
      name,
      events: count,
    }));

    // Compute department stats
    const departmentStats: Record<string, number> = {};
    for (const ev of events) {
      const deptName = ev.department?.name || "General";
      departmentStats[deptName] = (departmentStats[deptName] || 0) + ev._count.registrations;
    }
    const departmentData = Object.entries(departmentStats).map(([name, registrations]) => ({
      name: name.replace("Department of ", ""),
      registrations,
    }));

    return NextResponse.json({
      stats: {
        totalStudents,
        totalOrganizers,
        totalEvents,
        totalRegistrations,
        totalAttendance,
        totalCertificates,
        pendingApprovalsCount: pendingEvents.length,
      },
      categoryData,
      departmentData,
      pendingEvents,
      users,
      recentAuditLogs,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Administrator access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, eventId, userId, newRole } = body;

    if (action === "APPROVE_EVENT" && eventId) {
      const updated = await prisma.event.update({
        where: { id: eventId },
        data: { status: "PUBLISHED" },
        include: { organizer: true },
      });

      await prisma.notification.create({
        data: {
          userId: updated.organizerId,
          title: "Event Approved & Published! 🎉",
          message: `Your event '${updated.title}' has been reviewed and published by the administration.`,
          type: "SUCCESS",
          link: `/events/${updated.id}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "APPROVE_EVENT",
          entity: "Event",
          entityId: eventId,
          details: `Admin approved and published event '${updated.title}'`,
        },
      });

      return NextResponse.json({ success: true, message: "Event approved and published" });
    }

    if (action === "REJECT_EVENT" && eventId) {
      const updated = await prisma.event.update({
        where: { id: eventId },
        data: { status: "DRAFT" },
      });

      await prisma.notification.create({
        data: {
          userId: updated.organizerId,
          title: "Event Returned to Draft",
          message: `Your event '${updated.title}' was returned to draft by administration for revisions.`,
          type: "WARNING",
          link: "/organizer",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "REJECT_EVENT",
          entity: "Event",
          entityId: eventId,
          details: `Admin returned event '${updated.title}' to draft`,
        },
      });

      return NextResponse.json({ success: true, message: "Event returned to draft" });
    }

    if (action === "UPDATE_USER_ROLE" && userId && newRole) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_USER_ROLE",
          entity: "User",
          entityId: userId,
          details: `Changed role of ${updatedUser.name} to ${newRole}`,
        },
      });

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Failed to execute administrative action" }, { status: 500 });
  }
}
