import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "@workspace/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !["admin", "officer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // id is already extracted above
    const body = await request.json();
    const { status, notes, priority, dueDate } = body;

    // Officers can only update their own assignments
    if (session.user.role === "officer") {
      const assignment = await prisma.assignment.findUnique({
        where: { id },
      });

      if (!assignment || assignment.officerId !== session.user.id) {
        return NextResponse.json(
          { error: "Assignment not found or unauthorized" },
          { status: 404 }
        );
      }
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        status,
        notes,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        complaint: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        officer: {
          select: {
            name: true,
            department: true,
          },
        },
      },
    });

    // Update complaint status based on assignment status
    let complaintStatus: string | undefined;
    switch (status) {
      case "assigned":
        complaintStatus = "assigned";
        break;
      case "in_progress":
        complaintStatus = "in_progress";
        break;
      case "completed":
        complaintStatus = "resolved";
        break;
    }

    if (complaintStatus) {
      await prisma.complaint.update({
        where: { id: updatedAssignment.complaintId },
        data: { status: complaintStatus as any },
      });
    }

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}