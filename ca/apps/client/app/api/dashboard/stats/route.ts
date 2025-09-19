import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@workspace/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await prisma.complaint.groupBy({
      by: ["status"],
      where: {
        citizenId: session.user.id, // Fixed: use citizenId instead of createdBy
      },
      _count: {
        status: true,
      },
    });

    const result = {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
    };

    stats.forEach((stat) => {
      result.total += stat._count.status;
      switch (stat.status) {
        case "pending":
          result.pending = stat._count.status;
          break;
        case "in_progress":
          result.inProgress = stat._count.status;
          break;
        case "resolved":
          result.resolved = stat._count.status;
          break;
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}