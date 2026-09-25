import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const timeframe = searchParams.get("timeframe") || ""; // today, week, month, past, upcoming
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "date"; // date, popularity, deadline
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    // Only show published events to public/students unless organizer/admin requests
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ["PUBLISHED", "COMPLETED", "REGISTRATION_CLOSED"] };
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { speakerGuest: { contains: query } },
        { venue: { contains: query } },
        { subCategory: { contains: query } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (departmentId && departmentId !== "All") {
      where.departmentId = departmentId;
    }

    // Timeframe filtering
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    if (timeframe === "today") {
      where.eventDate = todayStr;
    } else if (timeframe === "past") {
      where.isPast = true;
    } else if (timeframe === "upcoming") {
      where.isPast = false;
      where.eventDate = { gte: todayStr };
    }

    // Order by
    let orderBy: any = { eventDate: "asc" };
    if (sort === "deadline") {
      orderBy = { registrationDeadline: "asc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        department: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            attendance: true,
          },
        },
      },
    });

    // If popularity sort is requested
    if (sort === "popularity") {
      events.sort((a, b) => b._count.registrations - a._count.registrations);
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized: Only organizers or administrators can create events" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      subCategory,
      departmentId,
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
    } = body;

    if (!title || !description || !category || !departmentId || !venue || !eventDate) {
      return NextResponse.json(
        { error: "Missing required event fields" },
        { status: 400 }
      );
    }

    // Admins can publish directly, Organizers default to PENDING_APPROVAL or PUBLISHED based on setting
    const status = user.role === "ADMIN" ? "PUBLISHED" : "PENDING_APPROVAL";

    const newEvent = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        subCategory: subCategory || null,
        departmentId,
        organizerId: user.id,
        venue: venue.trim(),
        eventDate,
        startTime: startTime || "10:00 AM",
        endTime: endTime || "01:00 PM",
        registrationDeadline: registrationDeadline || eventDate,
        maxParticipants: parseInt(maxParticipants) || 100,
        eligibility: eligibility || "Open to all DHSGSU students",
        rules: typeof rules === "string" ? rules : JSON.stringify(rules || []),
        speakerGuest: speakerGuest || null,
        contactPerson: contactPerson || user.name,
        contactPhone: contactPhone || user.phone || null,
        requiredDocuments: requiredDocuments || "University Identity Card",
        posterUrl: posterUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        status,
        isFeatured: false,
        isPast: false,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_EVENT",
        entity: "Event",
        entityId: newEvent.id,
        details: `Created event '${newEvent.title}' with status ${status}`,
      },
    });

    // Notify admins if pending approval
    if (status === "PENDING_APPROVAL") {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
      for (const adm of admins) {
        await prisma.notification.create({
          data: {
            userId: adm.id,
            title: "New Event Pending Approval",
            message: `${user.name} submitted '${newEvent.title}' for administrative review.`,
            type: "INFO",
            link: "/admin",
          },
        });
      }
    }

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
