import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Only the student themselves or an admin can cancel
    if (registration.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await prisma.notification.create({
      data: {
        userId: registration.studentId,
        title: "Registration Cancelled",
        message: `Your registration for '${registration.event.title}' has been cancelled.`,
        type: "WARNING",
        link: "/my-events",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CANCEL_REGISTRATION",
        entity: "Registration",
        entityId: id,
        details: `Cancelled registration ${registration.registrationId} for ${registration.event.title}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
      registration: updated,
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
