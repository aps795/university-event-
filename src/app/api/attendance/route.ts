import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const format = searchParams.get("format"); // "csv" or "json"

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: { eventId },
      orderBy: { checkInTime: "desc" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollmentNumber: true,
            course: true,
            department: true,
            semester: true,
            phone: true,
          },
        },
        event: {
          select: { title: true, eventDate: true, venue: true },
        },
        marker: {
          select: { name: true },
        },
      },
    });

    if (format === "csv") {
      const header = "Registration ID,Student Name,Enrollment No,Email,Course,Department,Semester,Phone,Check-in Time,Marked By\n";
      const rows = attendanceRecords
        .map((rec) => {
          const s = rec.student;
          return `"${rec.registrationId}","${s.name}","${s.enrollmentNumber || ''}","${s.email}","${s.course || ''}","${s.department || ''}","${s.semester || ''}","${s.phone || ''}","${rec.checkInTime.toISOString()}","${rec.marker?.name || ''}"`;
        })
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="attendance-${eventId}.csv"`,
        },
      });
    }

    return NextResponse.json({ attendance: attendanceRecords });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized: Only organizers or administrators can mark attendance" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { qrData, registrationId: rawRegId, eventId } = body;

    let targetRegId = rawRegId?.trim();

    // If QR data is passed in format "DHSGSU-REG:DHSGSU-EVT-2026-0001:..."
    if (qrData) {
      if (qrData.startsWith("DHSGSU-REG:")) {
        const parts = qrData.split(":");
        targetRegId = parts[1];
      } else {
        targetRegId = qrData.trim();
      }
    }

    if (!targetRegId) {
      return NextResponse.json(
        { error: "QR code data or Registration ID is required" },
        { status: 400 }
      );
    }

    // Find the registration
    const registration = await prisma.registration.findUnique({
      where: { registrationId: targetRegId },
      include: {
        event: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollmentNumber: true,
            course: true,
            department: true,
            semester: true,
            phone: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: `No registration found matching ID: ${targetRegId}` },
        { status: 404 }
      );
    }

    // If eventId was specified, verify registration matches event
    if (eventId && registration.eventId !== eventId) {
      return NextResponse.json(
        {
          error: `Registration belongs to '${registration.event.title}', not this event.`,
        },
        { status: 400 }
      );
    }

    // Check if registration is cancelled
    if (registration.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This registration was cancelled by the student." },
        { status: 400 }
      );
    }

    // Duplicate check: Verify if attendance is ALREADY marked
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        eventId_studentId: {
          eventId: registration.eventId,
          studentId: registration.studentId,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          alreadyMarked: true,
          error: `Attendance ALREADY recorded for this participant at ${existingAttendance.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Duplicate check-in prevented.`,
          record: existingAttendance,
          student: registration.student,
          event: registration.event,
        },
        { status: 409 }
      );
    }

    // Record attendance
    const attendance = await prisma.attendance.create({
      data: {
        eventId: registration.eventId,
        studentId: registration.studentId,
        registrationId: registration.registrationId,
        checkInTime: new Date(),
        status: "PRESENT",
        markedBy: user.id,
      },
      include: {
        event: true,
        student: true,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: registration.studentId,
        title: "Attendance Verified! 🎯",
        message: `Your presence for '${registration.event.title}' has been successfully verified at the venue.`,
        type: "SUCCESS",
        link: "/my-events",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "MARK_ATTENDANCE",
        entity: "Attendance",
        entityId: attendance.id,
        details: `Marked attendance for ${registration.student.name} (${registration.student.enrollmentNumber || 'N/A'}) for ${registration.event.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully!",
      attendance,
      student: registration.student,
      event: {
        title: registration.event.title,
        venue: registration.event.venue,
        eventDate: registration.event.eventDate,
      },
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
