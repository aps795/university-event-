import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Search by certificateId (e.g. DHSGSU-CERT-2024-0342 or uuid)
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ certificateId: id }, { id: id }],
      },
      include: {
        student: {
          select: {
            name: true,
            enrollmentNumber: true,
            course: true,
            department: true,
          },
        },
        event: {
          include: {
            department: true,
            organizer: {
              select: {
                name: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { verified: false, error: "Invalid or unrecognized certificate identifier" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: true,
      institution: "Dr. Harisingh Gour Vishwavidyalaya, Sagar (M.P.)",
      accreditation: "A Central University (NAAC 'A' Grade)",
      certificateId: certificate.certificateId,
      studentName: certificate.student.name,
      enrollmentNumber: certificate.student.enrollmentNumber || "N/A",
      course: certificate.student.course || "N/A",
      eventTitle: certificate.event.title,
      eventCategory: certificate.event.category,
      department: certificate.event.department.name,
      eventDate: certificate.event.eventDate,
      issuedAt: certificate.issuedAt,
      organizerName: certificate.event.organizer.name,
      status: "AUTHENTIC & VERIFIED",
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Verification system temporarily unavailable" },
      { status: 500 }
    );
  }
}
