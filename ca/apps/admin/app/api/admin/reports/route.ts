import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@workspace/db";

interface DepartmentStat {
  department: string | null;
  officers: number;
  totalAssignments: number;
  completedAssignments: number;
  completionRate: number;
}

interface TopOfficer {
  name?: string | undefined;
  department?: string | null | undefined;
  completedAssignments: number;
}

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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const department = searchParams.get("department");

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    } : {};

    // Get overall statistics
    const totalComplaints = await prisma.complaint.count({
      where: dateFilter,
    });

    const complaintsByStatus = await prisma.complaint.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    const complaintsByCategory = await prisma.complaint.groupBy({
      by: ['category'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    const complaintsByPriority = await prisma.complaint.groupBy({
      by: ['priority'],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    // Get assignment statistics
    let departmentFilter: any = {};
    if (department) {
      departmentFilter = {
        officer: {
          department: department,
        },
      };
    }

    const assignmentsByStatus = await prisma.assignment.groupBy({
      by: ['status'],
      where: {
        ...dateFilter.createdAt ? { assignedAt: dateFilter.createdAt } : {},
        ...departmentFilter,
      },
      _count: {
        id: true,
      },
    });

    // Get department performance (admin only)
    let departmentStats: DepartmentStat[] = [];
    if (session.user.role === "admin") {
      const departments = await prisma.user.groupBy({
        by: ['department'],
        where: {
          role: 'officer',
          department: {
            not: null,
          },
        },
        _count: {
          id: true,
        },
      });

      departmentStats = await Promise.all(
        departments.map(async (dept) => {
          const completedAssignments = await prisma.assignment.count({
            where: {
              officer: {
                department: dept.department,
              },
              status: 'completed',
              assignedAt: dateFilter.createdAt,
            },
          });

          const totalAssignments = await prisma.assignment.count({
            where: {
              officer: {
                department: dept.department,
              },
              assignedAt: dateFilter.createdAt,
            },
          });

          return {
            department: dept.department,
            officers: dept._count.id,
            totalAssignments,
            completedAssignments,
            completionRate: totalAssignments > 0 ? 
              Math.round((completedAssignments / totalAssignments) * 100) : 0,
          };
        })
      );
    }

    // Get recent activity
    const recentComplaints = await prisma.complaint.findMany({
      where: dateFilter,
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        area: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Get top performing officers (admin only)
    let topOfficers: TopOfficer[] = [];
    if (session.user.role === "admin") {
      const officerStats = await prisma.assignment.groupBy({
        by: ['officerId'],
        where: {
          status: 'completed',
          assignedAt: dateFilter.createdAt,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      });

      topOfficers = await Promise.all(
        officerStats.map(async (stat) => {
          const officer = await prisma.user.findUnique({
            where: { id: stat.officerId },
            select: {
              name: true,
              department: true,
            },
          });

          return {
            ...officer,
            completedAssignments: stat._count.id,
          };
        })
      );
    }

    // Calculate trend data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const trendData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const complaints = await prisma.complaint.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        const resolved = await prisma.complaint.count({
          where: {
            status: 'resolved',
            updatedAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        return {
          date: date.toISOString().split('T')[0],
          complaints,
          resolved,
        };
      })
    );

    return NextResponse.json({
      summary: {
        totalComplaints,
        statusDistribution: complaintsByStatus.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
        categoryDistribution: complaintsByCategory.map(item => ({
          category: item.category,
          count: item._count.id,
        })),
        priorityDistribution: complaintsByPriority.map(item => ({
          priority: item.priority,
          count: item._count.id,
        })),
        assignmentDistribution: assignmentsByStatus.map(item => ({
          status: item.status,
          count: item._count.id,
        })),
      },
      departmentStats,
      recentComplaints,
      topOfficers,
      trendData,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}