/*
  Warnings:

  - You are about to drop the column `religionId` on the `Caste` table. All the data in the column will be lost.
  - You are about to drop the `ChristianDenomination` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChristianMarriageProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HinduMarriageProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MuslimCommunity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MuslimMarriageProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MuslimSect` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SikhMarriageProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SikhReligiousStatus` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Caste` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceProfileVersion` to the `InsightReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileAVersion` to the `SyncReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileBVersion` to the `SyncReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'SYSTEM';

-- DropForeignKey
ALTER TABLE "Caste" DROP CONSTRAINT "Caste_religionId_fkey";

-- DropForeignKey
ALTER TABLE "ChristianMarriageProfile" DROP CONSTRAINT "ChristianMarriageProfile_denominationId_fkey";

-- DropForeignKey
ALTER TABLE "ChristianMarriageProfile" DROP CONSTRAINT "ChristianMarriageProfile_marriageProfileId_fkey";

-- DropForeignKey
ALTER TABLE "HinduMarriageProfile" DROP CONSTRAINT "HinduMarriageProfile_marriageProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderProfileId_fkey";

-- DropForeignKey
ALTER TABLE "MuslimCommunity" DROP CONSTRAINT "MuslimCommunity_sectId_fkey";

-- DropForeignKey
ALTER TABLE "MuslimMarriageProfile" DROP CONSTRAINT "MuslimMarriageProfile_communityId_fkey";

-- DropForeignKey
ALTER TABLE "MuslimMarriageProfile" DROP CONSTRAINT "MuslimMarriageProfile_marriageProfileId_fkey";

-- DropForeignKey
ALTER TABLE "MuslimMarriageProfile" DROP CONSTRAINT "MuslimMarriageProfile_sectId_fkey";

-- DropForeignKey
ALTER TABLE "SikhMarriageProfile" DROP CONSTRAINT "SikhMarriageProfile_marriageProfileId_fkey";

-- DropForeignKey
ALTER TABLE "SikhMarriageProfile" DROP CONSTRAINT "SikhMarriageProfile_religiousStatusId_fkey";

-- DropIndex
DROP INDEX "Caste_religionId_name_key";

-- DropIndex
DROP INDEX "Caste_religionId_state_idx";

-- DropIndex
DROP INDEX "Match_profileOneId_profileTwoId_key";

-- AlterTable
ALTER TABLE "Caste" DROP COLUMN "religionId";

-- AlterTable
ALTER TABLE "InsightReport" ADD COLUMN     "sourceProfileVersion" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "isDelivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "senderProfileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "compatibilityVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "assignedToId" UUID;

-- AlterTable
ALTER TABLE "SyncReport" ADD COLUMN     "profileAVersion" INTEGER NOT NULL,
ADD COLUMN     "profileBVersion" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ChristianDenomination";

-- DropTable
DROP TABLE "ChristianMarriageProfile";

-- DropTable
DROP TABLE "HinduMarriageProfile";

-- DropTable
DROP TABLE "MuslimCommunity";

-- DropTable
DROP TABLE "MuslimMarriageProfile";

-- DropTable
DROP TABLE "MuslimSect";

-- DropTable
DROP TABLE "SikhMarriageProfile";

-- DropTable
DROP TABLE "SikhReligiousStatus";

-- CreateTable
CREATE TABLE "PartnerPreferredReligion" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "religionId" UUID NOT NULL,

    CONSTRAINT "PartnerPreferredReligion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredReligion_partnerPreferenceId_religionId_key" ON "PartnerPreferredReligion"("partnerPreferenceId", "religionId");

-- CreateIndex
CREATE UNIQUE INDEX "Caste_name_key" ON "Caste"("name");

-- CreateIndex
CREATE INDEX "Caste_state_idx" ON "Caste"("state");

-- CreateIndex
CREATE INDEX "Match_profileOneId_profileTwoId_idx" ON "Match"("profileOneId", "profileTwoId");

-- AddForeignKey
ALTER TABLE "PartnerPreferredReligion" ADD CONSTRAINT "PartnerPreferredReligion_partnerPreferenceId_fkey" FOREIGN KEY ("partnerPreferenceId") REFERENCES "PartnerPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredReligion" ADD CONSTRAINT "PartnerPreferredReligion_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderProfileId_fkey" FOREIGN KEY ("senderProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
