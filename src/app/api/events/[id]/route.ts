import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        department: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            phone: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            attendance: true,
            certificates: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized: Organizer or Admin role required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const existing = await prisma.event.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Organizers can only update their own events; Admins can update any
    if (user.role !== "ADMIN" && existing.organizerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to edit this event" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      subCategory,
      venue,
      eventDate,
      startTime,
      endTime,
      registrationDeadline,
      maxParticipants,
      eligibility,
      rules,
      speakerGuest,
      contactPerson,
      contactPhone,
      requiredDocuments,
      posterUrl,
      status,
      isFeatured,
      isPast,
    } = body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(category && { category }),
        ...(subCategory !== undefined && { subCategory }),
        ...(venue && { venue: venue.trim() }),
        ...(eventDate && { eventDate }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(registrationDeadline && { registrationDeadline }),
        ...(maxParticipants && { maxParticipants: parseInt(maxParticipants) }),
        ...(eligibility && { eligibility }),
        ...(rules !== undefined && { rules: typeof rules === "string" ? rules : JSON.stringify(rules) }),
        ...(speakerGuest !== undefined && { speakerGuest }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(requiredDocuments !== undefined && { requiredDocuments }),
        ...(posterUrl && { posterUrl }),
        ...(status && { status }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPast !== undefined && { isPast }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_EVENT",
        entity: "Event",
        entityId: id,
        details: `Updated event '${updated.title}' details/status to ${updated.status}`,
      },
    });

    // Notify registered participants if status changed or venue changed
    if (status === "CANCELLED" || (body.venue && body.venue !== existing.venue)) {
      const registrations = await prisma.registration.findMany({
        where: { eventId: id, status: "CONFIRMED" },
        select: { studentId: true },
      });

      for (const reg of registrations) {
        await prisma.notification.create({
          data: {
            userId: reg.studentId,
            title: status === "CANCELLED" ? "Event Cancelled" : "Event Venue Update",
            message: status === "CANCELLED"
              ? `'${updated.title}' has been cancelled by the organizer.`
              : `Venue for '${updated.title}' has been updated to: ${updated.venue}`,
            type: status === "CANCELLED" ? "ALERT" : "WARNING",
            link: `/events/${id}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const existing = await prisma.event.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && existing.organizerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.event.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE_EVENT",
        entity: "Event",
        entityId: id,
        details: `Deleted event '${existing.title}'`,
      },
    });

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
