/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Volunteer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `approvalStatus` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentName` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentUid` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hodApprovalType` to the `EventPermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'hod', 'teacher', 'student', 'committee_head', 'principal');

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "Volunteer" DROP CONSTRAINT "Volunteer_eventId_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "adminRemark" TEXT,
ADD COLUMN     "approvalStatus" TEXT NOT NULL,
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "studentName" TEXT NOT NULL,
ADD COLUMN     "studentUid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "createdAt",
ALTER COLUMN "date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "EventPermission" ADD COLUMN     "department" TEXT,
ADD COLUMN     "hodApprovalType" TEXT NOT NULL,
ADD COLUMN     "hodApprovals" TEXT[],
ADD COLUMN     "hodRemark" TEXT,
ADD COLUMN     "rescheduleSuggestions" JSONB,
ALTER COLUMN "eventDate" DROP NOT NULL,
ALTER COLUMN "eventDate" SET DATA TYPE TEXT,
ALTER COLUMN "venue" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ADD COLUMN     "uid" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropTable
DROP TABLE "Volunteer";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "toRole" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");
