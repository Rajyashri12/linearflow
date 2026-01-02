/*
  Warnings:

  - The primary key for the `EventPermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hodApprovals` on the `EventPermission` table. All the data in the column will be lost.
  - You are about to drop the column `hodRemark` on the `EventPermission` table. All the data in the column will be lost.
  - You are about to drop the column `volunteers` on the `EventPermission` table. All the data in the column will be lost.
  - The `id` column on the `EventPermission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `rescheduleSuggestions` column on the `EventPermission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `eventDate` on table `EventPermission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `venue` on table `EventPermission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EventPermission" DROP CONSTRAINT "EventPermission_pkey",
DROP COLUMN "hodApprovals",
DROP COLUMN "hodRemark",
DROP COLUMN "volunteers",
ADD COLUMN     "collisionReason" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "eventDate" SET NOT NULL,
ALTER COLUMN "venue" SET NOT NULL,
DROP COLUMN "rescheduleSuggestions",
ADD COLUMN     "rescheduleSuggestions" TEXT[],
ADD CONSTRAINT "EventPermission_pkey" PRIMARY KEY ("id");
