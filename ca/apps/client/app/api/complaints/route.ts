import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@workspace/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";

const complaintSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(["roads", "streetlight", "sanitation", "water", "tree", "electricity", "drainage", "others"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  location: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    const complaintData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      priority: formData.get("priority") as string,
      location: formData.get("location") as string,
    };

    // Validate the data
    const validatedData = complaintSchema.parse(complaintData);

    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads", "complaints");
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${imageFile.name.split('.').pop()}`;
      const filePath = join(uploadsDir, fileName);

      // Save the file
      const bytes = await imageFile.arrayBuffer();
      await writeFile(filePath, new Uint8Array(bytes));

      imageUrl = `/uploads/complaints/${fileName}`;
    }

    // Create the complaint in the database
    const complaint = await prisma.complaint.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        location: validatedData.location,
        imageUrl,
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: complaint.id,
      message: "Complaint filed successfully",
    });
  } catch (error) {
    console.error("Complaint creation error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data provided", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to file complaint" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: any = {
      createdBy: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          assignments: {
            include: {
              officer: {
                select: {
                  name: true,
                  email: true,
                },
              },
              assigner: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Complaints fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}