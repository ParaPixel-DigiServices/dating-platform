-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('PHONE', 'EMAIL', 'SELFIE', 'GOVERNMENT_ID');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkSector" AS ENUM ('PRIVATE', 'GOVT', 'DEFENSE', 'BUSINESS', 'NOT_WORKING');

-- CreateEnum
CREATE TYPE "WorkRole" AS ENUM ('BANKING', 'CA', 'INVESTMENT', 'SOFTWARE_DEVELOPER', 'ARCHITECT', 'FASHION_DESIGNER', 'OTHER');

-- CreateEnum
CREATE TYPE "DietPreference" AS ENUM ('VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN', 'VEGAN', 'OTHER');

-- CreateEnum
CREATE TYPE "SmokingHabit" AS ENUM ('NEVER', 'OCCASIONALLY', 'REGULARLY');

-- CreateEnum
CREATE TYPE "DrinkingHabit" AS ENUM ('NEVER', 'OCCASIONALLY', 'REGULARLY');

-- CreateEnum
CREATE TYPE "ImportanceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PersonalityType" AS ENUM ('INTROVERT', 'EXTROVERT', 'AMBIVERT');

-- CreateEnum
CREATE TYPE "PhotoModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('BASIC', 'CONVERSATIONAL', 'FLUENT', 'NATIVE');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('INSIGHT', 'SYNCHRONIZATION');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('LOVE', 'MARRIAGE');

-- CreateEnum
CREATE TYPE "RelationshipIntent" AS ENUM ('LONG_TERM', 'OPEN_TO_MARRIAGE', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "SparkSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "InsightReportStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'STALE');

-- CreateEnum
CREATE TYPE "SyncReportStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'STALE');

-- CreateEnum
CREATE TYPE "AIJobType" AS ENUM ('SPARK_REPORT', 'INSIGHT_REPORT', 'SYNC_REPORT');

-- CreateEnum
CREATE TYPE "AIJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MarriageTimeline" AS ENUM ('IMMEDIATE', 'WITHIN_ONE_YEAR', 'FAMILY_SEARCHING', 'EXPLORING_SERIOUSLY', 'REMARRIAGE');

-- CreateEnum
CREATE TYPE "FamilyType" AS ENUM ('JOINT', 'NUCLEAR');

-- CreateEnum
CREATE TYPE "FamilyLivingStatus" AS ENUM ('LIVING_ALONE', 'WITH_FAMILY', 'NO_FAMILY_RELATION', 'NO_FAMILY');

-- CreateEnum
CREATE TYPE "FamilyIncome" AS ENUM ('ELITE', 'HIGH', 'MIDDLE', 'ASPIRING');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE');

-- CreateEnum
CREATE TYPE "DisabilityStatus" AS ENUM ('NONE', 'PHYSICAL', 'MENTAL', 'OTHER');

-- CreateEnum
CREATE TYPE "RelocationPreference" AS ENUM ('DOMESTIC', 'ABROAD', 'BOTH', 'NOT_WILLING');

-- CreateEnum
CREATE TYPE "PracticeFrequency" AS ENUM ('NEVER', 'OCCASIONALLY', 'MONTHLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "LifestyleType" AS ENUM ('MODERN', 'TRADITIONAL', 'BALANCED');

-- CreateEnum
CREATE TYPE "WeddingType" AS ENUM ('SIMPLE', 'TRADITIONAL', 'LUXURY', 'DESTINATION', 'TEMPLE', 'CHURCH', 'MOSQUE', 'GURDWARA', 'MINIMAL');

-- CreateEnum
CREATE TYPE "MarriageSubCategory" AS ENUM ('HINDU', 'MUSLIM', 'CHRISTIAN');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('LIKE', 'PASS', 'SUPER_LIKE', 'SPARK');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VOICE', 'VIDEO', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('FAKE_PROFILE', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'SPAM', 'SCAM', 'UNDERAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('WARNING', 'TEMP_SUSPENSION', 'PERMANENT_BAN', 'CONTENT_REMOVAL', 'PROFILE_RESET');

-- CreateEnum
CREATE TYPE "ReportConfigType" AS ENUM ('SYNC_REPORT', 'INSIGHT_REPORT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'SPEND', 'EARN', 'REFUND');

-- CreateEnum
CREATE TYPE "FiatTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "clientDeviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "platform" "DevicePlatform" NOT NULL,
    "appVersion" TEXT,
    "pushToken" TEXT,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVerification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "reviewedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Religion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Religion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caste" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "parentCasteId" UUID,
    "state" TEXT,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Caste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "bio" TEXT,
    "heightCm" INTEGER,
    "category" "CategoryType",
    "onboardingStatus" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "educationLevel" TEXT,
    "college" TEXT,
    "occupation" TEXT,
    "workSector" TEXT,
    "companyName" TEXT,
    "maritalStatus" TEXT,
    "disabilityStatus" TEXT,
    "annualIncome" TEXT,
    "incomeCurrency" TEXT DEFAULT 'INR',
    "religionId" UUID,
    "casteId" UUID,
    "motherTongue" TEXT,
    "dietPreference" TEXT,
    "smokingHabit" TEXT,
    "drinkingHabit" TEXT,
    "fitnessImportance" "ImportanceLevel",
    "petsPreference" "ImportanceLevel",
    "personalityType" "PersonalityType",
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "compatibilityVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePhoto" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "cdnUrl" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "moderationStatus" "PhotoModerationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfilePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLanguage" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "proficiency" "LanguageProficiency",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "interestId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" UUID NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoveProfile" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "voiceIntroUrl" TEXT,
    "videoIntroUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoveProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkProfile" (
    "id" UUID NOT NULL,
    "loveProfileId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxQuestions" INTEGER NOT NULL DEFAULT 5,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "allowResubmission" BOOLEAN NOT NULL DEFAULT false,
    "activeVersionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SparkProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkProfileVersion" (
    "id" UUID NOT NULL,
    "sparkProfileId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SparkProfileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkQuestion" (
    "id" UUID NOT NULL,
    "sparkProfileVersionId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SparkQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkSubmission" (
    "id" UUID NOT NULL,
    "sparkProfileVersionId" UUID NOT NULL,
    "sparkProfileId" UUID NOT NULL,
    "senderProfileId" UUID NOT NULL,
    "status" "SparkSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "isViewedByOwner" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SparkSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkAnswer" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SparkAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparkAIReport" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "data" JSONB NOT NULL,
    "aiJobId" UUID,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SparkAIReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightReport" (
    "id" UUID NOT NULL,
    "subjectProfileId" UUID NOT NULL,
    "sourceProfileVersion" INTEGER NOT NULL,
    "status" "InsightReportStatus" NOT NULL DEFAULT 'PENDING',
    "data" JSONB,
    "aiJobId" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InsightReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncReport" (
    "id" UUID NOT NULL,
    "profileAId" UUID NOT NULL,
    "profileAVersion" INTEGER NOT NULL,
    "profileBId" UUID NOT NULL,
    "profileBVersion" INTEGER NOT NULL,
    "status" "SyncReportStatus" NOT NULL DEFAULT 'PENDING',
    "overallScore" INTEGER,
    "data" JSONB,
    "aiJobId" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIJob" (
    "id" UUID NOT NULL,
    "type" "AIJobType" NOT NULL,
    "status" "AIJobStatus" NOT NULL DEFAULT 'QUEUED',
    "provider" TEXT,
    "model" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "tokensUsed" INTEGER,
    "generationTimeMs" INTEGER,
    "costUsd" DECIMAL(10,6),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarriageProfile" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "subCategory" TEXT,
    "familyLivingStatus" TEXT,
    "familyType" TEXT,
    "familyIncome" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "brotherCount" INTEGER,
    "sisterCount" INTEGER,
    "relocationPreference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarriageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreference" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "minHeightCm" INTEGER,
    "maxHeightCm" INTEGER,
    "maxDistanceKm" INTEGER,
    "minIncome" DECIMAL(15,2),
    "maxIncome" DECIMAL(15,2),
    "valuesWeight" INTEGER DEFAULT 50,
    "lifestyleWeight" INTEGER DEFAULT 50,
    "looksWeight" INTEGER DEFAULT 50,
    "careerWeight" INTEGER DEFAULT 50,
    "familyWeight" INTEGER DEFAULT 50,
    "genderPreference" "Gender"[],
    "educationLevels" "EducationLevel"[],
    "dietPreferences" "DietPreference"[],
    "smokingHabits" "SmokingHabit"[],
    "drinkingHabits" "DrinkingHabit"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreferredCaste" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "casteId" UUID NOT NULL,

    CONSTRAINT "PartnerPreferredCaste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreferredReligion" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "religionId" UUID NOT NULL,

    CONSTRAINT "PartnerPreferredReligion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreferredLanguage" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "languageId" UUID NOT NULL,

    CONSTRAINT "PartnerPreferredLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreferredInterest" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "interestId" UUID NOT NULL,

    CONSTRAINT "PartnerPreferredInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileInteraction" (
    "id" UUID NOT NULL,
    "fromProfileId" UUID NOT NULL,
    "toProfileId" UUID NOT NULL,
    "interactionType" "InteractionType" NOT NULL,
    "sparkSubmissionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "profileOneId" UUID NOT NULL,
    "profileTwoId" UUID NOT NULL,
    "unmatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "clientMessageId" TEXT,
    "chatId" UUID NOT NULL,
    "senderProfileId" UUID,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "mediaUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" UUID NOT NULL,
    "blockerProfileId" UUID NOT NULL,
    "blockedProfileId" UUID NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "reporterProfileId" UUID NOT NULL,
    "reportedProfileId" UUID NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "assignedToId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportEvidence" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReportConfig" (
    "id" UUID NOT NULL,
    "type" "ReportConfigType" NOT NULL,
    "parameters" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIReportConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinPricingConfig" (
    "id" UUID NOT NULL,
    "actionName" TEXT NOT NULL,
    "coinCost" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinPricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiatTransaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "coinsCredited" INTEGER NOT NULL,
    "status" "FiatTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentGatewayId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiatTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialTopic" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialComment" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "parentId" UUID,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialVote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "postId" UUID,
    "commentId" UUID,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "User"("lastActiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "Device_pushToken_key" ON "Device"("pushToken");

-- CreateIndex
CREATE INDEX "Device_userId_idx" ON "Device"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_userId_clientDeviceId_key" ON "Device"("userId", "clientDeviceId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_deviceId_idx" ON "Session"("deviceId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_revokedAt_idx" ON "Session"("revokedAt");

-- CreateIndex
CREATE INDEX "UserVerification_status_idx" ON "UserVerification"("status");

-- CreateIndex
CREATE INDEX "UserVerification_reviewedById_idx" ON "UserVerification"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerification_userId_type_key" ON "UserVerification"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Religion_name_key" ON "Religion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Caste_name_key" ON "Caste"("name");

-- CreateIndex
CREATE INDEX "Caste_state_idx" ON "Caste"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_category_idx" ON "Profile"("category");

-- CreateIndex
CREATE INDEX "Profile_latitude_longitude_idx" ON "Profile"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Profile_city_state_country_idx" ON "Profile"("city", "state", "country");

-- CreateIndex
CREATE INDEX "Profile_gender_idx" ON "Profile"("gender");

-- CreateIndex
CREATE INDEX "Profile_religionId_idx" ON "Profile"("religionId");

-- CreateIndex
CREATE INDEX "Profile_casteId_idx" ON "Profile"("casteId");

-- CreateIndex
CREATE INDEX "Profile_religionId_state_idx" ON "Profile"("religionId", "state");

-- CreateIndex
CREATE INDEX "ProfilePhoto_profileId_idx" ON "ProfilePhoto"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserLanguage_profileId_languageId_key" ON "UserLanguage"("profileId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_profileId_interestId_key" ON "UserInterest"("profileId", "interestId");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "Question"("category");

-- CreateIndex
CREATE INDEX "UserAnswer_profileId_idx" ON "UserAnswer"("profileId");

-- CreateIndex
CREATE INDEX "UserAnswer_questionId_idx" ON "UserAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnswer_profileId_questionId_key" ON "UserAnswer"("profileId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "LoveProfile_profileId_key" ON "LoveProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkProfile_loveProfileId_key" ON "SparkProfile"("loveProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkProfile_activeVersionId_key" ON "SparkProfile"("activeVersionId");

-- CreateIndex
CREATE INDEX "SparkProfileVersion_sparkProfileId_idx" ON "SparkProfileVersion"("sparkProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkProfileVersion_sparkProfileId_versionNumber_key" ON "SparkProfileVersion"("sparkProfileId", "versionNumber");

-- CreateIndex
CREATE INDEX "SparkQuestion_sparkProfileVersionId_idx" ON "SparkQuestion"("sparkProfileVersionId");

-- CreateIndex
CREATE INDEX "SparkSubmission_sparkProfileId_senderProfileId_idx" ON "SparkSubmission"("sparkProfileId", "senderProfileId");

-- CreateIndex
CREATE INDEX "SparkSubmission_sparkProfileVersionId_idx" ON "SparkSubmission"("sparkProfileVersionId");

-- CreateIndex
CREATE INDEX "SparkSubmission_sparkProfileId_idx" ON "SparkSubmission"("sparkProfileId");

-- CreateIndex
CREATE INDEX "SparkSubmission_senderProfileId_idx" ON "SparkSubmission"("senderProfileId");

-- CreateIndex
CREATE INDEX "SparkSubmission_status_idx" ON "SparkSubmission"("status");

-- CreateIndex
CREATE INDEX "SparkAnswer_submissionId_idx" ON "SparkAnswer"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkAnswer_submissionId_questionId_key" ON "SparkAnswer"("submissionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkAIReport_submissionId_key" ON "SparkAIReport"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "SparkAIReport_aiJobId_key" ON "SparkAIReport"("aiJobId");

-- CreateIndex
CREATE UNIQUE INDEX "InsightReport_subjectProfileId_key" ON "InsightReport"("subjectProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "InsightReport_aiJobId_key" ON "InsightReport"("aiJobId");

-- CreateIndex
CREATE INDEX "InsightReport_status_idx" ON "InsightReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SyncReport_aiJobId_key" ON "SyncReport"("aiJobId");

-- CreateIndex
CREATE INDEX "SyncReport_profileAId_idx" ON "SyncReport"("profileAId");

-- CreateIndex
CREATE INDEX "SyncReport_profileBId_idx" ON "SyncReport"("profileBId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncReport_profileAId_profileBId_key" ON "SyncReport"("profileAId", "profileBId");

-- CreateIndex
CREATE INDEX "AIJob_status_idx" ON "AIJob"("status");

-- CreateIndex
CREATE INDEX "AIJob_type_idx" ON "AIJob"("type");

-- CreateIndex
CREATE INDEX "AIJob_type_status_idx" ON "AIJob"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MarriageProfile_profileId_key" ON "MarriageProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreference_profileId_key" ON "PartnerPreference"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredCaste_partnerPreferenceId_casteId_key" ON "PartnerPreferredCaste"("partnerPreferenceId", "casteId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredReligion_partnerPreferenceId_religionId_key" ON "PartnerPreferredReligion"("partnerPreferenceId", "religionId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredLanguage_partnerPreferenceId_languageId_key" ON "PartnerPreferredLanguage"("partnerPreferenceId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredInterest_partnerPreferenceId_interestId_key" ON "PartnerPreferredInterest"("partnerPreferenceId", "interestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileInteraction_sparkSubmissionId_key" ON "ProfileInteraction"("sparkSubmissionId");

-- CreateIndex
CREATE INDEX "ProfileInteraction_toProfileId_interactionType_idx" ON "ProfileInteraction"("toProfileId", "interactionType");

-- CreateIndex
CREATE INDEX "ProfileInteraction_fromProfileId_idx" ON "ProfileInteraction"("fromProfileId");

-- CreateIndex
CREATE INDEX "ProfileInteraction_toProfileId_idx" ON "ProfileInteraction"("toProfileId");

-- CreateIndex
CREATE INDEX "ProfileInteraction_interactionType_idx" ON "ProfileInteraction"("interactionType");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileInteraction_fromProfileId_toProfileId_key" ON "ProfileInteraction"("fromProfileId", "toProfileId");

-- CreateIndex
CREATE INDEX "Match_profileOneId_profileTwoId_idx" ON "Match"("profileOneId", "profileTwoId");

-- CreateIndex
CREATE INDEX "Match_profileOneId_idx" ON "Match"("profileOneId");

-- CreateIndex
CREATE INDEX "Match_profileTwoId_idx" ON "Match"("profileTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_matchId_key" ON "Chat"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_clientMessageId_key" ON "Message"("clientMessageId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_senderProfileId_idx" ON "Message"("senderProfileId");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "Block_blockerProfileId_idx" ON "Block"("blockerProfileId");

-- CreateIndex
CREATE INDEX "Block_blockedProfileId_idx" ON "Block"("blockedProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerProfileId_blockedProfileId_key" ON "Block"("blockerProfileId", "blockedProfileId");

-- CreateIndex
CREATE INDEX "Report_reportedProfileId_idx" ON "Report"("reportedProfileId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "ReportEvidence_reportId_idx" ON "ReportEvidence"("reportId");

-- CreateIndex
CREATE INDEX "ModerationAction_userId_idx" ON "ModerationAction"("userId");

-- CreateIndex
CREATE INDEX "ModerationAction_adminId_idx" ON "ModerationAction"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "AIReportConfig_type_key" ON "AIReportConfig"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CoinPricingConfig_actionName_key" ON "CoinPricingConfig"("actionName");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialTopic_name_key" ON "SocialTopic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialVote_userId_postId_key" ON "SocialVote"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialVote_userId_commentId_key" ON "SocialVote"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caste" ADD CONSTRAINT "Caste_parentCasteId_fkey" FOREIGN KEY ("parentCasteId") REFERENCES "Caste"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_casteId_fkey" FOREIGN KEY ("casteId") REFERENCES "Caste"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePhoto" ADD CONSTRAINT "ProfilePhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguage" ADD CONSTRAINT "UserLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoveProfile" ADD CONSTRAINT "LoveProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkProfile" ADD CONSTRAINT "SparkProfile_loveProfileId_fkey" FOREIGN KEY ("loveProfileId") REFERENCES "LoveProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkProfile" ADD CONSTRAINT "SparkProfile_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "SparkProfileVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkProfileVersion" ADD CONSTRAINT "SparkProfileVersion_sparkProfileId_fkey" FOREIGN KEY ("sparkProfileId") REFERENCES "SparkProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkQuestion" ADD CONSTRAINT "SparkQuestion_sparkProfileVersionId_fkey" FOREIGN KEY ("sparkProfileVersionId") REFERENCES "SparkProfileVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkSubmission" ADD CONSTRAINT "SparkSubmission_sparkProfileVersionId_fkey" FOREIGN KEY ("sparkProfileVersionId") REFERENCES "SparkProfileVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkSubmission" ADD CONSTRAINT "SparkSubmission_sparkProfileId_fkey" FOREIGN KEY ("sparkProfileId") REFERENCES "SparkProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkSubmission" ADD CONSTRAINT "SparkSubmission_senderProfileId_fkey" FOREIGN KEY ("senderProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkAnswer" ADD CONSTRAINT "SparkAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SparkSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkAnswer" ADD CONSTRAINT "SparkAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SparkQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkAIReport" ADD CONSTRAINT "SparkAIReport_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "SparkSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparkAIReport" ADD CONSTRAINT "SparkAIReport_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "AIJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightReport" ADD CONSTRAINT "InsightReport_subjectProfileId_fkey" FOREIGN KEY ("subjectProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightReport" ADD CONSTRAINT "InsightReport_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "AIJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncReport" ADD CONSTRAINT "SyncReport_profileAId_fkey" FOREIGN KEY ("profileAId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncReport" ADD CONSTRAINT "SyncReport_profileBId_fkey" FOREIGN KEY ("profileBId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncReport" ADD CONSTRAINT "SyncReport_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "AIJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarriageProfile" ADD CONSTRAINT "MarriageProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreference" ADD CONSTRAINT "PartnerPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredCaste" ADD CONSTRAINT "PartnerPreferredCaste_partnerPreferenceId_fkey" FOREIGN KEY ("partnerPreferenceId") REFERENCES "PartnerPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredCaste" ADD CONSTRAINT "PartnerPreferredCaste_casteId_fkey" FOREIGN KEY ("casteId") REFERENCES "Caste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredReligion" ADD CONSTRAINT "PartnerPreferredReligion_partnerPreferenceId_fkey" FOREIGN KEY ("partnerPreferenceId") REFERENCES "PartnerPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredReligion" ADD CONSTRAINT "PartnerPreferredReligion_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredLanguage" ADD CONSTRAINT "PartnerPreferredLanguage_partnerPreferenceId_fkey" FOREIGN KEY ("partnerPreferenceId") REFERENCES "PartnerPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredLanguage" ADD CONSTRAINT "PartnerPreferredLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredInterest" ADD CONSTRAINT "PartnerPreferredInterest_partnerPreferenceId_fkey" FOREIGN KEY ("partnerPreferenceId") REFERENCES "PartnerPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredInterest" ADD CONSTRAINT "PartnerPreferredInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileInteraction" ADD CONSTRAINT "ProfileInteraction_fromProfileId_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileInteraction" ADD CONSTRAINT "ProfileInteraction_toProfileId_fkey" FOREIGN KEY ("toProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileInteraction" ADD CONSTRAINT "ProfileInteraction_sparkSubmissionId_fkey" FOREIGN KEY ("sparkSubmissionId") REFERENCES "SparkSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_profileOneId_fkey" FOREIGN KEY ("profileOneId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_profileTwoId_fkey" FOREIGN KEY ("profileTwoId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderProfileId_fkey" FOREIGN KEY ("senderProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerProfileId_fkey" FOREIGN KEY ("blockerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedProfileId_fkey" FOREIGN KEY ("blockedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterProfileId_fkey" FOREIGN KEY ("reporterProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedProfileId_fkey" FOREIGN KEY ("reportedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEvidence" ADD CONSTRAINT "ReportEvidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiatTransaction" ADD CONSTRAINT "FiatTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SocialTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SocialComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialVote" ADD CONSTRAINT "SocialVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialVote" ADD CONSTRAINT "SocialVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialVote" ADD CONSTRAINT "SocialVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "SocialComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
