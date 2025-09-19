-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('citizen', 'admin', 'officer');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('pending', 'assigned', 'resolved');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Complaint" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'pending',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Complaint" ADD CONSTRAINT "Complaint_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "public"."Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
