/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `authProvider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ProfilePhoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RelationshipIntent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('LOVE', 'MARRIAGE', 'CASUAL', 'ROOMMATE');

-- CreateEnum
CREATE TYPE "DietPreference" AS ENUM ('VEG', 'NON_VEG', 'VEGAN', 'EGGITARIAN', 'JAIN');

-- CreateEnum
CREATE TYPE "SmokingHabit" AS ENUM ('NEVER', 'OCCASIONALLY', 'REGULARLY');

-- CreateEnum
CREATE TYPE "DrinkingHabit" AS ENUM ('NEVER', 'SOCIALLY', 'REGULARLY');

-- CreateEnum
CREATE TYPE "FitnessImportance" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PetsPreference" AS ENUM ('LOVE_PETS', 'OKAY_WITH_PETS', 'NO_PETS');

-- CreateEnum
CREATE TYPE "SocialLevel" AS ENUM ('INTROVERT', 'AMBIVERT', 'EXTROVERT');

-- CreateEnum
CREATE TYPE "CommunicationStyle" AS ENUM ('DIRECT', 'CALM', 'EXPRESSIVE', 'RESERVED');

-- CreateEnum
CREATE TYPE "ConflictStyle" AS ENUM ('DISCUSS', 'NEED_SPACE', 'AVOID', 'IMMEDIATE_RESOLUTION');

-- CreateEnum
CREATE TYPE "MorningNightType" AS ENUM ('MORNING_PERSON', 'FLEXIBLE', 'NIGHT_OWL');

-- CreateEnum
CREATE TYPE "MarriageTimeline" AS ENUM ('ASAP', 'WITHIN_1_YEAR', 'WITHIN_2_YEARS', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "ChildrenPreference" AS ENUM ('YES', 'NO', 'MAYBE');

-- CreateEnum
CREATE TYPE "RelocationPreference" AS ENUM ('YES', 'NO', 'DEPENDS');

-- CreateEnum
CREATE TYPE "LongDistancePreference" AS ENUM ('YES', 'NO', 'DEPENDS');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SINGLE_SELECT', 'MULTI_SELECT', 'BOOLEAN', 'DATE');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'SELFIE');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FamilyType" AS ENUM ('NUCLEAR', 'JOINT');

-- DropForeignKey
ALTER TABLE "ProfilePhoto" DROP CONSTRAINT "ProfilePhoto_profileId_fkey";

-- DropForeignKey
ALTER TABLE "RelationshipIntent" DROP CONSTRAINT "RelationshipIntent_profileId_fkey";

-- DropForeignKey
ALTER TABLE "UserInterest" DROP CONSTRAINT "UserInterest_interestId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "deletedAt",
ADD COLUMN     "annualSalary" INTEGER,
ADD COLUMN     "assets" TEXT,
ADD COLUMN     "caste" TEXT,
ADD COLUMN     "completionPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "educationLevelId" TEXT,
ADD COLUMN     "familyIncome" INTEGER,
ADD COLUMN     "familyType" "FamilyType",
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "isNRI" BOOLEAN,
ADD COLUMN     "motherTongueId" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "religionId" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authProvider",
ADD COLUMN     "category" "CategoryType",
ADD COLUMN     "isDiscoverable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "VerificationStatus" ADD COLUMN     "verificationMethod" "VerificationMethod";

-- DropTable
DROP TABLE "ProfilePhoto";

-- DropTable
DROP TABLE "RelationshipIntent";

-- DropEnum
DROP TYPE "RelationshipIntentType";

-- CreateTable
CREATE TABLE "Religion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Religion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuthProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuthProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLifestyle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dietPreference" "DietPreference",
    "smokingHabit" "SmokingHabit",
    "drinkingHabit" "DrinkingHabit",
    "fitnessImportance" "FitnessImportance",
    "petsPreference" "PetsPreference",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLifestyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPersonality" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communicationStyle" "CommunicationStyle",
    "conflictStyle" "ConflictStyle",
    "socialLevel" "SocialLevel",
    "morningNightType" "MorningNightType",
    "cleanlinessLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPersonality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserValues" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyImportance" INTEGER,
    "religionImportance" INTEGER,
    "traditionImportance" INTEGER,
    "careerImportance" INTEGER,
    "travelImportance" INTEGER,
    "loyaltyImportance" INTEGER,
    "independenceLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserValues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childrenPreference" "ChildrenPreference",
    "marriageTimeline" "MarriageTimeline",
    "relocationPreference" "RelocationPreference",
    "longDistancePreference" "LongDistancePreference",
    "dealBreakers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "blurHash" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptKey" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLanguage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSet" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEmbedding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGenderPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGenderPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Religion_name_key" ON "Religion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLevel_name_key" ON "EducationLevel"("name");

-- CreateIndex
CREATE INDEX "UserAuthProvider_userId_idx" ON "UserAuthProvider"("userId");

-- CreateIndex
CREATE INDEX "UserAuthProvider_provider_idx" ON "UserAuthProvider"("provider");

-- CreateIndex
CREATE INDEX "UserAuthProvider_providerUserId_idx" ON "UserAuthProvider"("providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthProvider_provider_providerUserId_key" ON "UserAuthProvider"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLifestyle_userId_key" ON "UserLifestyle"("userId");

-- CreateIndex
CREATE INDEX "UserLifestyle_dietPreference_idx" ON "UserLifestyle"("dietPreference");

-- CreateIndex
CREATE INDEX "UserLifestyle_smokingHabit_idx" ON "UserLifestyle"("smokingHabit");

-- CreateIndex
CREATE INDEX "UserLifestyle_drinkingHabit_idx" ON "UserLifestyle"("drinkingHabit");

-- CreateIndex
CREATE UNIQUE INDEX "UserPersonality_userId_key" ON "UserPersonality"("userId");

-- CreateIndex
CREATE INDEX "UserPersonality_communicationStyle_idx" ON "UserPersonality"("communicationStyle");

-- CreateIndex
CREATE INDEX "UserPersonality_socialLevel_idx" ON "UserPersonality"("socialLevel");

-- CreateIndex
CREATE UNIQUE INDEX "UserValues_userId_key" ON "UserValues"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserPhoto_userId_idx" ON "UserPhoto"("userId");

-- CreateIndex
CREATE INDEX "UserPrompt_userId_idx" ON "UserPrompt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPrompt_userId_promptKey_key" ON "UserPrompt"("userId", "promptKey");

-- CreateIndex
CREATE INDEX "UserLanguage_userId_idx" ON "UserLanguage"("userId");

-- CreateIndex
CREATE INDEX "UserLanguage_languageId_idx" ON "UserLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguage_userId_languageId_key" ON "UserLanguage"("userId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSet_key_key" ON "QuestionSet"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Question_key_key" ON "Question"("key");

-- CreateIndex
CREATE INDEX "Question_questionSetId_idx" ON "Question"("questionSetId");

-- CreateIndex
CREATE INDEX "Question_key_idx" ON "Question"("key");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- CreateIndex
CREATE INDEX "UserAnswer_userId_idx" ON "UserAnswer"("userId");

-- CreateIndex
CREATE INDEX "UserAnswer_questionId_idx" ON "UserAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnswer_userId_questionId_key" ON "UserAnswer"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmbedding_userId_key" ON "UserEmbedding"("userId");

-- CreateIndex
CREATE INDEX "UserGenderPreference_userId_idx" ON "UserGenderPreference"("userId");

-- CreateIndex
CREATE INDEX "UserGenderPreference_gender_idx" ON "UserGenderPreference"("gender");

-- CreateIndex
CREATE UNIQUE INDEX "UserGenderPreference_userId_gender_key" ON "UserGenderPreference"("userId", "gender");

-- CreateIndex
CREATE INDEX "Profile_religionId_idx" ON "Profile"("religionId");

-- CreateIndex
CREATE INDEX "Profile_state_idx" ON "Profile"("state");

-- CreateIndex
CREATE INDEX "Profile_dateOfBirth_idx" ON "Profile"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_revokedAt_idx" ON "Session"("revokedAt");

-- CreateIndex
CREATE INDEX "User_category_idx" ON "User"("category");

-- AddForeignKey
ALTER TABLE "UserAuthProvider" ADD CONSTRAINT "UserAuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "EducationLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_motherTongueId_fkey" FOREIGN KEY ("motherTongueId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLifestyle" ADD CONSTRAINT "UserLifestyle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPersonality" ADD CONSTRAINT "UserPersonality_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserValues" ADD CONSTRAINT "UserValues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPrompt" ADD CONSTRAINT "UserPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "QuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmbedding" ADD CONSTRAINT "UserEmbedding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGenderPreference" ADD CONSTRAINT "UserGenderPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
