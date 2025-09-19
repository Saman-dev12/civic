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
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const officer = await prisma.user.findUnique({
      where: {
        id: id,
        role: { in: ["officer", "admin"] },
      },
    });

    if (!officer) {
      return NextResponse.json(
        { error: "Officer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(officer);
  } catch (error) {
    console.error("Error fetching officer:", error);
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
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, department, employeeId, isActive } = body;

    await prisma.user.update({
      where: { id: id },
      data: {
        name,
        email,
        phone,
        department,
        employeeId,
        isActive,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating officer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
