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

    // Build where clause for complaints based on user role
    let complaintWhere: any = {};
    if (session.user.role === "officer") {
      complaintWhere = {
        assignments: {
          some: {
            officerId: session.user.id,
          },
        },
      };
    }

    const [
      complaintStats,
      officerStats,
    ] = await Promise.all([
      prisma.complaint.groupBy({
        by: ["status"],
        where: complaintWhere,
        _count: {
          status: true,
        },
      }),
      prisma.user.aggregate({
        where: {
          role: { in: ["officer", "admin"] },
        },
        _count: true,
      }),
    ]);

    const activeOfficers = await prisma.user.count({
      where: {
        role: { in: ["officer", "admin"] },
        isActive: true,
      },
    });

    const totalComplaints = complaintStats.reduce((sum, stat) => sum + stat._count.status, 0);
    
    const result = {
      totalComplaints,
      pendingComplaints: complaintStats.find(s => s.status === "pending")?._count?.status || 0,
      assignedComplaints: complaintStats.find(s => s.status === "assigned")?._count?.status || 0,
      resolvedComplaints: complaintStats.find(s => s.status === "resolved")?._count?.status || 0,
      totalOfficers: officerStats._count,
      activeOfficers,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}