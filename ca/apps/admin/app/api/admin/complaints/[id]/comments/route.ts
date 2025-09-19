import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import { prisma } from "@workspace/db";

export async function POST(
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
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Check if complaint exists
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

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        complaintId: id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}