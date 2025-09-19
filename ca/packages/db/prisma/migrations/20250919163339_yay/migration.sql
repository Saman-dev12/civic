/*
  Warnings:

  - Added the required column `updatedAt` to the `Complaint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('roads', 'streetlight', 'sanitation', 'water', 'tree', 'electricity', 'drainage', 'others');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Status" ADD VALUE 'in_progress';
ALTER TYPE "public"."Status" ADD VALUE 'closed';

-- AlterTable
ALTER TABLE "public"."Complaint" ADD COLUMN     "category" "public"."Category" NOT NULL DEFAULT 'others',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'medium',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "department" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "public"."Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
