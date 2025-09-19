#!/usr/bin/env node
import { prisma } from "../packages/db";
import bcrypt from "bcryptjs";

const CATEGORIES = [
  "roads",
  "streetlight", 
  "sanitation",
  "water",
  "tree",
  "electricity",
  "drainage",
  "others"
] as const;

const PRIORITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["pending", "assigned", "in_progress", "resolved", "closed"] as const;

const DEPARTMENTS = [
  "Public Works",
  "Utilities", 
  "Transportation",
  "Parks & Recreation",
  "Environmental Services"
];

const COMPLAINT_TITLES = [
  "Pothole on Main Street needs urgent repair",
  "Street light not working for 3 days",
  "Garbage not collected for a week",
  "Water leak in residential area",
  "Fallen tree blocking sidewalk",
  "Power outage in neighborhood",
  "Blocked drainage causing flooding",
  "Noise complaint from construction site",
  "Broken fire hydrant leaking water",
  "Traffic signal malfunction",
  "Damaged road barrier after accident",
  "Public park bench vandalized",
  "Overgrown vegetation blocking road signs",
  "Sewer backup in basement",
  "Cracked sidewalk causing safety hazard"
];

const SAMPLE_DESCRIPTIONS = [
  "This issue has been ongoing for several days and is causing significant inconvenience to residents. Please prioritize this request.",
  "The problem is affecting multiple households in the area. We would appreciate a quick resolution.",
  "This is a safety concern that needs immediate attention. Children and elderly people are at risk.",
  "The situation is getting worse each day. Please send someone to assess and fix the problem.",
  "Multiple residents have complained about this issue. It's affecting the quality of life in our neighborhood.",
  "This problem is causing property damage and needs urgent intervention from the authorities.",
  "We have tried to manage this temporarily, but professional help is required for a permanent solution.",
  "The issue is visible from the main road and is giving a bad impression of our community.",
  "This has been reported before but no action was taken. Please escalate this to the concerned department.",
  "The problem is affecting local businesses and their daily operations. Quick action is needed."
];

const LOCATIONS = [
  { area: "Downtown", landmark: "City Hall" },
  { area: "Residential District", landmark: "Community Center" },
  { area: "Business District", landmark: "Shopping Mall" },
  { area: "Suburban Area", landmark: "Local School" },
  { area: "Industrial Zone", landmark: "Factory Complex" },
  { area: "Historic District", landmark: "Old Church" },
  { area: "University Area", landmark: "Main Campus" },
  { area: "Waterfront", landmark: "Marina" },
  { area: "Green Valley", landmark: "Central Park" },
  { area: "Tech Hub", landmark: "Innovation Center" }
];

const ADDRESSES = [
  "123 Main Street, Downtown",
  "456 Oak Avenue, Residential District", 
  "789 Commerce Blvd, Business District",
  "321 Elm Street, Suburban Area",
  "654 Industrial Way, Industrial Zone",
  "987 Heritage Lane, Historic District",
  "147 University Drive, University Area",
  "258 Harbor View, Waterfront",
  "369 Park Place, Green Valley",
  "741 Innovation Blvd, Tech Hub"
];

async function createMockUsers() {
  console.log("🔧 Creating mock users...");
  
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  // Create System Administrator
  const admin = await prisma.user.upsert({
    where: { email: "admin@civic.gov" },
    update: {},
    create: {
      email: "admin@civic.gov",
      name: "System Administrator",
      password: hashedPassword,
      role: "admin",
      department: "Administration",
      isActive: true,
      phone: "+1-555-0001",
    },
  });

  // Create Officers
  const officers = [];
  const officerData = [
    { name: "John Smith", department: "Public Works", email: "john.smith@civic.gov" },
    { name: "Sarah Johnson", department: "Utilities", email: "sarah.johnson@civic.gov" },
    { name: "Mike Davis", department: "Transportation", email: "mike.davis@civic.gov" },
    { name: "Lisa Wilson", department: "Parks & Recreation", email: "lisa.wilson@civic.gov" },
    { name: "David Brown", department: "Environmental Services", email: "david.brown@civic.gov" },
    { name: "Emily Garcia", department: "Public Works", email: "emily.garcia@civic.gov" },
    { name: "Robert Martinez", department: "Utilities", email: "robert.martinez@civic.gov" },
    { name: "Jennifer Lee", department: "Transportation", email: "jennifer.lee@civic.gov" },
  ];

  for (const officer of officerData) {
    const user = await prisma.user.upsert({
      where: { email: officer.email },
      update: {},
      create: {
        email: officer.email,
        name: officer.name,
        password: hashedPassword,
        role: "officer",
        department: officer.department,
        isActive: true,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      },
    });
    officers.push(user);
  }

  // Create Citizens
  const citizens = [];
  const citizenData = [
    { name: "Alice Cooper", email: "alice.cooper@email.com" },
    { name: "Bob Thompson", email: "bob.thompson@email.com" },
    { name: "Carol White", email: "carol.white@email.com" },
    { name: "Daniel Clark", email: "daniel.clark@email.com" },
    { name: "Eva Rodriguez", email: "eva.rodriguez@email.com" },
    { name: "Frank Miller", email: "frank.miller@email.com" },
    { name: "Grace Taylor", email: "grace.taylor@email.com" },
    { name: "Henry Anderson", email: "henry.anderson@email.com" },
    { name: "Iris Jackson", email: "iris.jackson@email.com" },
    { name: "Jack Wilson", email: "jack.wilson@email.com" },
  ];

  for (const citizen of citizenData) {
    const user = await prisma.user.upsert({
      where: { email: citizen.email },
      update: {},
      create: {
        email: citizen.email,
        name: citizen.name,
        password: hashedPassword,
        role: "citizen",
        isActive: true,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      },
    });
    citizens.push(user);
  }

  console.log(`✅ Created 1 admin, ${officers.length} officers, and ${citizens.length} citizens`);
  return { admin, officers, citizens };
}

async function createMockComplaints(users: { admin: any, officers: any[], citizens: any[] }) {
  console.log("📝 Creating mock complaints...");
  
  const complaints = [];
  const { officers, citizens } = users;
  
  // Create 50 mock complaints
  for (let i = 0; i < 50; i++) {
    const citizen = citizens[Math.floor(Math.random() * citizens.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)] || { area: "Unknown Area", landmark: "Unknown Landmark" };
    const address = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];
    const title = COMPLAINT_TITLES[Math.floor(Math.random() * COMPLAINT_TITLES.length)];
    const description = SAMPLE_DESCRIPTIONS[Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length)];
    
    // Random date within the last 6 months
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 180));
    
    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        area: location.area,
        landmark: location.landmark,
        address,
        citizenId: citizen.id,
        images: Math.random() > 0.7 ? [`/uploads/complaint-${i + 1}.jpg`] : [],
        createdAt,
        updatedAt: createdAt,
      },
    });
    
    complaints.push(complaint);
    
    // Randomly add comments (30% chance)
    if (Math.random() > 0.7) {
      await prisma.comment.create({
        data: {
          content: "Thank you for reporting this issue. We are looking into it and will update you soon.",
          complaintId: complaint.id,
          userId: officers[Math.floor(Math.random() * officers.length)].id,
          createdAt: new Date(createdAt.getTime() + Math.random() * 86400000), // Random time after complaint
        },
      });
    }
  }
  
  console.log(`✅ Created ${complaints.length} complaints with some comments`);
  return complaints;
}

async function createMockAssignments(complaints: any[], officers: any[], admin: any) {
  console.log("👮 Creating mock assignments...");
  
  let assignmentCount = 0;
  
  // Assign 60% of complaints to officers
  const assignableComplaints = complaints.filter(c => 
    c.status !== "pending" && Math.random() > 0.4
  );
  
  for (const complaint of assignableComplaints) {
    const officer = officers[Math.floor(Math.random() * officers.length)];
    
    // Update complaint status if it's still pending
    if (complaint.status === "pending") {
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: "assigned" },
      });
    }
    
    await prisma.assignment.create({
      data: {
        complaintId: complaint.id,
        officerId: officer.id,
        assignedBy: admin.id, // Admin assigns complaints
        assignedAt: new Date(complaint.createdAt.getTime() + Math.random() * 86400000),
        priority: complaint.priority,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random due date within a week
        status: ["assigned", "in_progress", "completed"][Math.floor(Math.random() * 3)] as any,
        notes: `Assigned to ${officer.department} department. Please handle according to priority level.`,
      },
    });
    
    assignmentCount++;
  }
  
  console.log(`✅ Created ${assignmentCount} assignments`);
}

async function main() {
  console.log("🚀 Starting mock data seeding...");
  console.log("=" .repeat(50));
  
  try {
    // Clean existing data (optional - comment out if you want to keep existing data)
    console.log("🧹 Cleaning existing data...");
    await prisma.assignment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.complaint.deleteMany();
    await prisma.user.deleteMany();
    console.log("✅ Existing data cleaned");
    
    // Create mock data
    const users = await createMockUsers();
    const complaints = await createMockComplaints(users);
    await createMockAssignments(complaints, users.officers, users.admin);
    
    console.log("=" .repeat(50));
    console.log("🎉 Mock data seeding completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(`👤 Users: 1 admin + ${users.officers.length} officers + ${users.citizens.length} citizens`);
    console.log(`📝 Complaints: ${complaints.length}`);
    console.log(`👮 Assignments: ~${Math.floor(complaints.length * 0.6)}`);
    console.log("");
    console.log("🔐 Default Login Credentials:");
    console.log("Admin: admin@civic.gov / password123");
    console.log("Officer: john.smith@civic.gov / password123");
    console.log("Citizen: alice.cooper@email.com / password123");
    console.log("");
    console.log("🌐 You can now:");
    console.log("• Login to admin dashboard at http://localhost:3001");
    console.log("• Login to citizen app at http://localhost:3000");
    console.log("• Test all features with the mock data");
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});