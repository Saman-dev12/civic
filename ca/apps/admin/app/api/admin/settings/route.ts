import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

// Mock settings storage (in a real app, this would be in the database)
let systemSettings = {
  siteName: "Civic Complaints System",
  siteDescription: "Report and track civic issues in your community",
  contactEmail: "admin@civic.gov",
  maxFileSize: 5,
  allowedFileTypes: ["jpg", "jpeg", "png", "pdf"],
  autoAssignment: false,
  emailNotifications: true,
  smsNotifications: false,
  defaultPriority: "medium",
  defaultCategory: "others",
  maintenanceMode: false,
  sessionTimeout: 30,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(systemSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
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
    
    // Validate and update settings
    systemSettings = {
      ...systemSettings,
      ...body,
    };

    // In a real app, you would save this to the database
    // await db.settings.upsert({
    //   where: { id: 1 },
    //   update: systemSettings,
    //   create: { id: 1, ...systemSettings }
    // });

    return NextResponse.json(systemSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}