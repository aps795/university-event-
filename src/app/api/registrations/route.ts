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

    // If querying by eventId, verify organizer or admin
    if (eventId) {
      if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const registrations = await prisma.registration.findMany({
        where: { eventId },
        orderBy: { registeredAt: "desc" },
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
          attendance: true,
        },
      });

      return NextResponse.json({ registrations });
    }

    // Default: fetch current student's registrations
    const registrations = await prisma.registration.findMany({
      where: { studentId: user.id },
      orderBy: { registeredAt: "desc" },
      include: {
        event: {
          include: {
            department: true,
            organizer: {
              select: { name: true, email: true },
            },
          },
        },
        attendance: true,
      },
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please log in with your university account to register" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { eventId, notes, enrollmentNumber, course, department, semester, phone } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: `Registration is not open for this event (Status: ${event.status})` },
        { status: 400 }
      );
    }

    // Check registration deadline
    const today = new Date().toISOString().split("T")[0];
    if (event.registrationDeadline && event.registrationDeadline < today) {
      return NextResponse.json(
        { error: "Registration deadline has already passed" },
        { status: 400 }
      );
    }

    // Check capacity
    if (event._count.registrations >= event.maxParticipants) {
      return NextResponse.json(
        { error: "This event has reached its maximum participant capacity" },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId: user.id,
        },
      },
    });

    if (existingRegistration) {
      if (existingRegistration.status === "CANCELLED") {
        // Reactivate registration
        const updated = await prisma.registration.update({
          where: { id: existingRegistration.id },
          data: {
            status: "CONFIRMED",
            notes: notes || existingRegistration.notes,
            registeredAt: new Date(),
          },
        });
        return NextResponse.json({
          success: true,
          message: "Registration reactivated successfully",
          registration: updated,
        });
      }
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 409 }
      );
    }

    // Update user profile fields if provided
    if (enrollmentNumber || course || department || semester || phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(enrollmentNumber && { enrollmentNumber: enrollmentNumber.trim().toUpperCase() }),
          ...(course && { course: course.trim() }),
          ...(department && { department: department.trim() }),
          ...(semester && { semester: semester.trim() }),
          ...(phone && { phone: phone.trim() }),
        },
      });
    }

    // Generate Unique Registration ID: DHSGSU-EVT-2026-XXXX
    const count = await prisma.registration.count();
    const sequence = String(count + 1).padStart(4, "0");
    const registrationId = `DHSGSU-EVT-2026-${sequence}`;

    // Payload for QR Code
    const studentEnroll = enrollmentNumber || user.enrollmentNumber || "STUDENT";
    const qrCode = `DHSGSU-REG:${registrationId}:${studentEnroll}:${eventId}`;

    const registration = await prisma.registration.create({
      data: {
        eventId,
        studentId: user.id,
        registrationId,
        qrCode,
        status: "CONFIRMED",
        notes: notes || null,
      },
      include: {
        event: true,
      },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Registration Successful!",
        message: `You are confirmed for '${event.title}'. Your Registration ID is ${registrationId}. Keep your QR code ready at venue check-in.`,
        type: "SUCCESS",
        link: "/my-events",
      },
    });

    // Notify Organizer
    await prisma.notification.create({
      data: {
        userId: event.organizerId,
        title: "New Registration Received",
        message: `${user.name} (${studentEnroll}) registered for '${event.title}'.`,
        type: "INFO",
        link: `/organizer?eventId=${event.id}`,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EVENT_REGISTRATION",
        entity: "Registration",
        entityId: registration.id,
        details: `Student ${user.name} registered for ${event.title} (Reg ID: ${registrationId})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      registration,
    });
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Failed to complete registration" },
      { status: 500 }
    );
  }
}
