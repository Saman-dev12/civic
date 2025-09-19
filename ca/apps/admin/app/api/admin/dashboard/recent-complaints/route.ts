import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "@workspace/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin and officer roles
    if (!["admin", "officer"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recentComplaints = await prisma.complaint.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        priority: true,
        location: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json(recentComplaints);
  } catch (error) {
    console.error("Recent complaints error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent complaints" },
      { status: 500 }
    );
  }
}