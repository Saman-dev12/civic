import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "@workspace/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin and officer roles
    if (!["admin", "officer"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        assignments: {
          include: {
            officer: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
            assigner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // If user is an officer, only allow access to assigned complaints
    if (session.user.role === "officer") {
      const isAssigned = complaint.assignments.some(
        (assignment) => assignment.officer.id === session.user.id
      );
      
      if (!isAssigned) {
        return NextResponse.json(
          { error: "Access denied - complaint not assigned to you" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin and officer roles
    if (!["admin", "officer"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["pending", "assigned", "in_progress", "resolved", "closed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if complaint exists and user has permission
    const complaint = await prisma.complaint.findUnique({
      where: { id: id },
      include: {
        assignments: {
          include: {
            officer: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // If user is an officer, only allow access to assigned complaints
    if (session.user.role === "officer") {
      const isAssigned = complaint.assignments.some(
        (assignment) => assignment.officer.id === session.user.id
      );
      
      if (!isAssigned) {
        return NextResponse.json(
          { error: "Access denied - complaint not assigned to you" },
          { status: 403 }
        );
      }
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        assignments: {
          include: {
            officer: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
            assigner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}