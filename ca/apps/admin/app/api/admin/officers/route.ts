import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@workspace/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const officers = await prisma.user.findMany({
      where: {
        role: "officer",
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        isActive: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get assignment stats for each officer
    const officersWithStats = await Promise.all(
      officers.map(async (officer) => {
        const assignments = await prisma.assignment.findMany({
          where: { officerId: officer.id },
          select: { status: true },
        });

        const stats = {
          total: assignments.length,
          assigned: assignments.filter(a => a.status === "assigned").length,
          in_progress: assignments.filter(a => a.status === "in_progress").length,
          completed: assignments.filter(a => a.status === "completed").length,
        };

        return {
          ...officer,
          stats,
        };
      })
    );

    return NextResponse.json(officersWithStats);
  } catch (error) {
    console.error("Error fetching officers:", error);
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
    const { name, email, department, phone } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new officer with default password
    const hashedPassword = await bcrypt.hash("password123", 12);
    
    const officer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "officer",
        department,
        phone,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        isActive: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json(officer);
  } catch (error) {
    console.error("Error creating officer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}