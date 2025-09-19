import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const adminSignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(["admin", "officer"]),
  department: z.string().optional(),
  employeeId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = adminSignUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create admin/officer user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        role: validatedData.role,
        // Additional fields for admin users
        department: validatedData.department,
        employeeId: validatedData.employeeId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });

    return NextResponse.json({
      message: "Admin account created successfully",
      user,
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}