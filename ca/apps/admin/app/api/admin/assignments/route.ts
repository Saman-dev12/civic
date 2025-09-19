import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@workspace/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !["admin", "officer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let whereClause: any = {};

    // Officers can only see their own assignments
    if (session.user.role === "officer") {
      whereClause.officerId = session.user.id;
    }

    // Apply filters
    if (department) {
      whereClause.officer = {
        department: department,
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        complaint: {
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
            status: true,
            area: true,
            landmark: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
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
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { complaintId, officerId, priority, dueDate, notes } = body;

    console.log("Assignment creation request:", { complaintId, officerId, assignedBy: session.user.id, priority });

    // Validate that the complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!complaint) {
      console.error("Complaint not found:", complaintId);
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Validate that the officer exists
    const officer = await prisma.user.findUnique({
      where: { id: officerId, role: "officer" }
    });

    if (!officer) {
      console.error("Officer not found:", officerId);
      return NextResponse.json(
        { error: "Officer not found" },
        { status: 404 }
      );
    }

    // Validate that the assigner (admin) exists
    const assigner = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!assigner) {
      console.error("Assigner not found:", session.user.id);
      return NextResponse.json(
        { error: "Assigner not found" },
        { status: 404 }
      );
    }

    // Check if complaint is already assigned
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        complaintId,
        status: {
          in: ["assigned", "in_progress"],
        },
      },
    });

    if (existingAssignment) {
      console.log("Complaint already assigned:", existingAssignment);
      return NextResponse.json(
        { error: "Complaint is already assigned" },
        { status: 400 }
      );
    }

    console.log("Creating assignment with data:", {
      complaintId,
      officerId,
      assignedBy: session.user.id,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
      status: "assigned",
    });

    const assignment = await prisma.assignment.create({
      data: {
        complaintId,
        officerId,
        assignedBy: session.user.id,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: "assigned",
      },
      include: {
        complaint: {
          select: {
            title: true,
            category: true,
          },
        },
        officer: {
          select: {
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    console.log("Assignment created successfully:", assignment.id);

    // Update complaint status
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: "assigned" },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}