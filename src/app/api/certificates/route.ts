import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (eventId && (user.role === "ORGANIZER" || user.role === "ADMIN")) {
      const certificates = await prisma.certificate.findMany({
        where: { eventId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              enrollmentNumber: true,
              course: true,
              department: true,
            },
          },
          event: true,
        },
      });
      return NextResponse.json({ certificates });
    }

    // Default: fetch current student's certificates
    const certificates = await prisma.certificate.findMany({
      where: { studentId: user.id },
      include: {
        event: {
          include: {
            department: true,
            organizer: {
              select: { name: true, department: true },
            },
          },
        },
        student: {
          select: {
            name: true,
            enrollmentNumber: true,
            course: true,
            department: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, studentId: requestedStudentId } = body;

    const targetStudentId = requestedStudentId || user.id;

    // Check attendance record
    const attendance = await prisma.attendance.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId: targetStudentId,
        },
      },
    });

    if (!attendance) {
      return NextResponse.json(
        {
          error:
            "Certificate can only be generated for participants who have verified venue attendance.",
        },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existing = await prisma.certificate.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId: targetStudentId,
        },
      },
      include: {
        event: true,
        student: true,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Certificate retrieved",
        certificate: existing,
      });
    }

    // Generate unique Certificate ID
    const count = await prisma.certificate.count();
    const sequence = String(count + 1).padStart(4, "0");
    const certificateId = `DHSGSU-CERT-2026-${sequence}`;

    const newCertificate = await prisma.certificate.create({
      data: {
        eventId,
        studentId: targetStudentId,
        certificateId,
        certificateUrl: `/verify-certificate/${certificateId}`,
        issuedAt: new Date(),
      },
      include: {
        event: true,
        student: true,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: targetStudentId,
        title: "Digital Certificate Issued! 🎓",
        message: `Your participation certificate for '${newCertificate.event.title}' is now available. Certificate ID: ${certificateId}`,
        type: "SUCCESS",
        link: `/verify-certificate/${certificateId}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Certificate generated successfully!",
      certificate: newCertificate,
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to issue certificate" },
      { status: 500 }
    );
  }
}
