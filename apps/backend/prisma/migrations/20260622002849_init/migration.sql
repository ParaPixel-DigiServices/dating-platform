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
CREATE TYPE "SleepPreference" AS ENUM ('MORNING_PERSON', 'NIGHT_OWL');

-- CreateEnum
CREATE TYPE "SocialLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "CleanlinessLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "PhotoModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('BASIC', 'CONVERSATIONAL', 'FLUENT', 'NATIVE');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('LOVE', 'MARRIAGE');

-- CreateEnum
CREATE TYPE "UserJourneyStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'SWITCHED');

-- CreateEnum
CREATE TYPE "RelationshipIntent" AS ENUM ('LONG_TERM', 'OPEN_TO_MARRIAGE', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "MarriageTimeline" AS ENUM ('IMMEDIATE', 'WITHIN_ONE_YEAR', 'FAMILY_SEARCHING', 'EXPLORING_SERIOUSLY', 'REMARRIAGE');

-- CreateEnum
CREATE TYPE "FamilyType" AS ENUM ('JOINT', 'NUCLEAR');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "RelocationPreference" AS ENUM ('DOMESTIC', 'ABROAD', 'BOTH', 'NOT_WILLING');

-- CreateEnum
CREATE TYPE "PreferenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PracticeFrequency" AS ENUM ('NEVER', 'OCCASIONALLY', 'MONTHLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "LifestyleType" AS ENUM ('MODERN', 'TRADITIONAL', 'BALANCED');

-- CreateEnum
CREATE TYPE "WeddingType" AS ENUM ('SIMPLE', 'TRADITIONAL', 'LUXURY', 'DESTINATION', 'TEMPLE', 'CHURCH', 'MOSQUE', 'GURDWARA', 'MINIMAL');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('LIKE', 'PASS', 'SUPER_LIKE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ACTIVE', 'UNMATCHED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VOICE', 'VIDEO', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'DELETED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'SCAM', 'UNDERAGE', 'IMPERSONATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('WARNING', 'TEMP_SUSPENSION', 'PERMANENT_BAN', 'SHADOW_BAN');

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
    "religionId" UUID NOT NULL,
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
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "educationLevel" "EducationLevel",
    "college" TEXT,
    "occupation" TEXT,
    "annualIncome" DECIMAL(15,2),
    "familyIncome" DECIMAL(15,2),
    "incomeCurrency" TEXT DEFAULT 'INR',
    "assets" TEXT,
    "religionId" UUID,
    "casteId" UUID,
    "motherTongue" TEXT,
    "dietPreference" "DietPreference",
    "smokingHabit" "SmokingHabit",
    "drinkingHabit" "DrinkingHabit",
    "fitnessImportance" "ImportanceLevel",
    "petsPreference" "ImportanceLevel",
    "personalityType" "PersonalityType",
    "sleepPreference" "SleepPreference",
    "communicationStyle" TEXT,
    "conflictResolutionStyle" TEXT,
    "socialLevel" "SocialLevel",
    "cleanlinessLevel" "CleanlinessLevel",
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "type" "CategoryType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCategory" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "subCategoryId" UUID NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCategory_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "LovePrompt" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LovePrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LovePromptAnswer" (
    "id" UUID NOT NULL,
    "loveProfileId" UUID NOT NULL,
    "promptId" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LovePromptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoveCompatibility" (
    "id" UUID NOT NULL,
    "loveProfileId" UUID NOT NULL,
    "relationshipIntent" "RelationshipIntent" NOT NULL,
    "religiousCompatibilityImportance" INTEGER NOT NULL,
    "wantsChildren" BOOLEAN,
    "openToRelocation" BOOLEAN,
    "comfortableLongDistance" BOOLEAN,
    "comfortablePoliticalDiscussions" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoveCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarriageProfile" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "lookingFor" TEXT,
    "marriageTimeline" "MarriageTimeline",
    "residence" TEXT,
    "maritalStatus" "MaritalStatus",
    "hasChildren" BOOLEAN,
    "childrenCount" INTEGER,
    "siblingsCount" INTEGER,
    "familyType" "FamilyType",
    "parentalConsentRequired" BOOLEAN,
    "wantsChildren" BOOLEAN,
    "relocationPreference" "RelocationPreference",
    "partnerExpectations" TEXT,
    "dealBreakers" TEXT,
    "financialResponsibility" "PreferenceLevel",
    "angerManagement" "PreferenceLevel",
    "travelInterest" "PreferenceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarriageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HinduMarriageProfile" (
    "id" UUID NOT NULL,
    "marriageProfileId" UUID NOT NULL,
    "religionImportance" "PreferenceLevel",
    "kundliRequired" BOOLEAN,
    "doshaImportance" "PreferenceLevel",
    "horoscopeMismatchAccepted" BOOLEAN,
    "hasSpiritualGuru" BOOLEAN,
    "poojaFrequency" "PracticeFrequency",
    "templeVisitFrequency" "PracticeFrequency",
    "fastingPreferences" TEXT[],
    "ritualPreferences" TEXT[],
    "touchesElderFeet" BOOLEAN,
    "nonVegAtHomeAccepted" BOOLEAN,
    "alcoholAcceptance" "PreferenceLevel",
    "smokingAcceptance" "PreferenceLevel",
    "dressingStyle" "LifestyleType",
    "genderRolePreference" "LifestyleType",
    "tattooAccepted" BOOLEAN,
    "clubbingAccepted" BOOLEAN,
    "oppositeGenderFriendAcceptance" "PreferenceLevel",
    "casteConscious" BOOLEAN,
    "intercasteMarriageAccepted" BOOLEAN,
    "sameFamilyStatusExpected" BOOLEAN,
    "workingPartnerPreference" "PreferenceLevel",
    "acceptDivorcee" BOOLEAN,
    "weddingPreference" "WeddingType",
    "wearsThali" BOOLEAN,
    "vastuImportance" "PreferenceLevel",
    "separatePoojaRoom" BOOLEAN,
    "livingNearTemplePreference" BOOLEAN,
    "hinduSymbolsAtHome" BOOLEAN,
    "childrenLearnSanskrit" BOOLEAN,
    "templeDonationImportance" "PreferenceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HinduMarriageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuslimSect" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MuslimSect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuslimCommunity" (
    "id" UUID NOT NULL,
    "sectId" UUID,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MuslimCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuslimMarriageProfile" (
    "id" UUID NOT NULL,
    "marriageProfileId" UUID NOT NULL,
    "sectId" UUID,
    "communityId" UUID,
    "practiceLevel" "PreferenceLevel",
    "prayerFrequency" "PracticeFrequency",
    "tahajjudPractice" BOOLEAN,
    "quranReadingFrequency" "PracticeFrequency",
    "ramadanObservance" "PreferenceLevel",
    "zakatImportance" "PreferenceLevel",
    "hajjUmrahPlan" TEXT,
    "followsScholar" BOOLEAN,
    "hijabPreference" "PreferenceLevel",
    "beardPreference" "PreferenceLevel",
    "halalLifestyleRequired" BOOLEAN,
    "interestFreeLifeImportance" "PreferenceLevel",
    "westernFestivalAcceptance" BOOLEAN,
    "nikahPreference" "WeddingType",
    "mehrImportance" "PreferenceLevel",
    "polygamyAcceptance" BOOLEAN,
    "womanWorkingAfterMarriage" "PreferenceLevel",
    "acceptDivorcee" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MuslimMarriageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChristianDenomination" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChristianDenomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChristianMarriageProfile" (
    "id" UUID NOT NULL,
    "marriageProfileId" UUID NOT NULL,
    "denominationId" UUID,
    "churchAttendanceFrequency" "PracticeFrequency",
    "bibleReadingFrequency" "PracticeFrequency",
    "prayerRoutines" TEXT[],
    "fastingRetreatImportance" "PreferenceLevel",
    "pastorGuidanceImportance" "PreferenceLevel",
    "churchServiceParticipation" BOOLEAN,
    "choirParticipation" BOOLEAN,
    "churchCharityImportance" "PreferenceLevel",
    "modestDressingPreference" "PreferenceLevel",
    "porkAcceptance" BOOLEAN,
    "alcoholAcceptance" "PreferenceLevel",
    "smokingAcceptance" "PreferenceLevel",
    "clubbingAcceptance" BOOLEAN,
    "livingNearChurchImportance" "PreferenceLevel",
    "religiousSymbolsAtHome" BOOLEAN,
    "entertainmentIndustryAcceptance" BOOLEAN,
    "phonePasswordSharingPreference" "PreferenceLevel",
    "pdaComfortLevel" "PreferenceLevel",
    "tattooAcceptance" BOOLEAN,
    "socialMediaModestyImportance" "PreferenceLevel",
    "therapyAcceptance" BOOLEAN,
    "churchMarriageRequired" BOOLEAN,
    "premaritalCounsellingRequired" BOOLEAN,
    "weddingPreference" "WeddingType",
    "interDenominationAcceptance" BOOLEAN,
    "husbandSpiritualHeadPreference" "PreferenceLevel",
    "purityBeforeMarriageImportance" "PreferenceLevel",
    "childrenBaptismPreference" BOOLEAN,
    "christianSchoolPreference" BOOLEAN,
    "familyValuesOrientation" "LifestyleType",
    "parentingStyle" "PreferenceLevel",
    "adoptionAcceptance" BOOLEAN,
    "acceptDivorcee" BOOLEAN,
    "anniversaryImportance" "PreferenceLevel",
    "financialTransparencyImportance" "PreferenceLevel",
    "savingMoneyImportance" "PreferenceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChristianMarriageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikhReligiousStatus" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SikhReligiousStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikhMarriageProfile" (
    "id" UUID NOT NULL,
    "marriageProfileId" UUID NOT NULL,
    "religiousStatusId" UUID,
    "nitnemFrequency" "PracticeFrequency",
    "gurdwaraVisitFrequency" "PracticeFrequency",
    "turbanPreference" "PreferenceLevel",
    "keshImportance" "PreferenceLevel",
    "sevaParticipationImportance" "PreferenceLevel",
    "dietPreference" "DietPreference",
    "alcoholAcceptance" "PreferenceLevel",
    "smokingAcceptance" "PreferenceLevel",
    "lifestyleOrientation" "LifestyleType",
    "casteConscious" BOOLEAN,
    "anandKarajPreference" "WeddingType",
    "interCasteAcceptance" BOOLEAN,
    "workingPartnerPreference" "PreferenceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SikhMarriageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreference" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "ageFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "heightFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minHeightCm" INTEGER,
    "maxHeightCm" INTEGER,
    "distanceFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxDistanceKm" INTEGER,
    "casteFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "languageFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "educationFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minimumEducationLevel" "EducationLevel",
    "incomeFilterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minimumAnnualIncome" DECIMAL(15,2),
    "valuesWeight" INTEGER NOT NULL DEFAULT 100,
    "lifestyleWeight" INTEGER NOT NULL DEFAULT 90,
    "communicationWeight" INTEGER NOT NULL DEFAULT 90,
    "conflictResolutionWeight" INTEGER NOT NULL DEFAULT 90,
    "familyWeight" INTEGER NOT NULL DEFAULT 95,
    "interestsWeight" INTEGER NOT NULL DEFAULT 60,
    "careerWeight" INTEGER NOT NULL DEFAULT 40,
    "personalityWeight" INTEGER NOT NULL DEFAULT 85,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreferredCaste" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "casteId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerPreferredCaste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreferredLanguage" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerPreferredLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreferredInterest" (
    "id" UUID NOT NULL,
    "partnerPreferenceId" UUID NOT NULL,
    "interestId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerPreferredInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileInteraction" (
    "id" UUID NOT NULL,
    "fromProfileId" UUID NOT NULL,
    "toProfileId" UUID NOT NULL,
    "interactionType" "InteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "profileOneId" UUID NOT NULL,
    "profileTwoId" UUID NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "chatId" UUID NOT NULL,
    "senderProfileId" UUID NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "attachmentUrl" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "assignedAdminId" UUID,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportEvidence" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "UserVerification_userId_type_key" ON "UserVerification"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Religion_name_key" ON "Religion"("name");

-- CreateIndex
CREATE INDEX "Caste_religionId_state_idx" ON "Caste"("religionId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Caste_religionId_name_key" ON "Caste"("religionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

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
CREATE UNIQUE INDEX "Category_type_key" ON "Category"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_categoryId_name_key" ON "SubCategory"("categoryId", "name");

-- CreateIndex
CREATE INDEX "UserCategory_profileId_idx" ON "UserCategory"("profileId");

-- CreateIndex
CREATE INDEX "UserCategory_isCurrent_idx" ON "UserCategory"("isCurrent");

-- CreateIndex
CREATE INDEX "UserCategory_profileId_isCurrent_idx" ON "UserCategory"("profileId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "LoveProfile_profileId_key" ON "LoveProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "LovePromptAnswer_loveProfileId_promptId_key" ON "LovePromptAnswer"("loveProfileId", "promptId");

-- CreateIndex
CREATE UNIQUE INDEX "LoveCompatibility_loveProfileId_key" ON "LoveCompatibility"("loveProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "MarriageProfile_profileId_key" ON "MarriageProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "HinduMarriageProfile_marriageProfileId_key" ON "HinduMarriageProfile"("marriageProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "MuslimSect_name_key" ON "MuslimSect"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MuslimCommunity_name_key" ON "MuslimCommunity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MuslimMarriageProfile_marriageProfileId_key" ON "MuslimMarriageProfile"("marriageProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ChristianDenomination_name_key" ON "ChristianDenomination"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChristianMarriageProfile_marriageProfileId_key" ON "ChristianMarriageProfile"("marriageProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SikhReligiousStatus_name_key" ON "SikhReligiousStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SikhMarriageProfile_marriageProfileId_key" ON "SikhMarriageProfile"("marriageProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreference_profileId_key" ON "PartnerPreference"("profileId");

-- CreateIndex
CREATE INDEX "PartnerPreference_profileId_idx" ON "PartnerPreference"("profileId");

-- CreateIndex
CREATE INDEX "PartnerPreferredCaste_casteId_idx" ON "PartnerPreferredCaste"("casteId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredCaste_partnerPreferenceId_casteId_key" ON "PartnerPreferredCaste"("partnerPreferenceId", "casteId");

-- CreateIndex
CREATE INDEX "PartnerPreferredLanguage_languageId_idx" ON "PartnerPreferredLanguage"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredLanguage_partnerPreferenceId_languageId_key" ON "PartnerPreferredLanguage"("partnerPreferenceId", "languageId");

-- CreateIndex
CREATE INDEX "PartnerPreferredInterest_interestId_idx" ON "PartnerPreferredInterest"("interestId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreferredInterest_partnerPreferenceId_interestId_key" ON "PartnerPreferredInterest"("partnerPreferenceId", "interestId");

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
CREATE INDEX "Match_profileOneId_idx" ON "Match"("profileOneId");

-- CreateIndex
CREATE INDEX "Match_profileTwoId_idx" ON "Match"("profileTwoId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Match_profileOneId_profileTwoId_key" ON "Match"("profileOneId", "profileTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_matchId_key" ON "Chat"("matchId");

-- CreateIndex
CREATE INDEX "Chat_lastMessageAt_idx" ON "Chat"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Message_chatId_sentAt_idx" ON "Message"("chatId", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "Message_senderProfileId_idx" ON "Message"("senderProfileId");

-- CreateIndex
CREATE INDEX "Block_blockedProfileId_idx" ON "Block"("blockedProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerProfileId_blockedProfileId_key" ON "Block"("blockerProfileId", "blockedProfileId");

-- CreateIndex
CREATE INDEX "Report_reportedProfileId_idx" ON "Report"("reportedProfileId");

-- CreateIndex
CREATE INDEX "Report_reporterProfileId_idx" ON "Report"("reporterProfileId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "ReportEvidence_reportId_idx" ON "ReportEvidence"("reportId");

-- CreateIndex
CREATE INDEX "ModerationAction_userId_idx" ON "ModerationAction"("userId");

-- CreateIndex
CREATE INDEX "ModerationAction_adminId_idx" ON "ModerationAction"("adminId");

-- CreateIndex
CREATE INDEX "ModerationAction_actionType_idx" ON "ModerationAction"("actionType");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caste" ADD CONSTRAINT "Caste_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "Religion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoveProfile" ADD CONSTRAINT "LoveProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LovePromptAnswer" ADD CONSTRAINT "LovePromptAnswer_loveProfileId_fkey" FOREIGN KEY ("loveProfileId") REFERENCES "LoveProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LovePromptAnswer" ADD CONSTRAINT "LovePromptAnswer_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "LovePrompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoveCompatibility" ADD CONSTRAINT "LoveCompatibility_loveProfileId_fkey" FOREIGN KEY ("loveProfileId") REFERENCES "LoveProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarriageProfile" ADD CONSTRAINT "MarriageProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HinduMarriageProfile" ADD CONSTRAINT "HinduMarriageProfile_marriageProfileId_fkey" FOREIGN KEY ("marriageProfileId") REFERENCES "MarriageProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuslimCommunity" ADD CONSTRAINT "MuslimCommunity_sectId_fkey" FOREIGN KEY ("sectId") REFERENCES "MuslimSect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuslimMarriageProfile" ADD CONSTRAINT "MuslimMarriageProfile_marriageProfileId_fkey" FOREIGN KEY ("marriageProfileId") REFERENCES "MarriageProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuslimMarriageProfile" ADD CONSTRAINT "MuslimMarriageProfile_sectId_fkey" FOREIGN KEY ("sectId") REFERENCES "MuslimSect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuslimMarriageProfile" ADD CONSTRAINT "MuslimMarriageProfile_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "MuslimCommunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChristianMarriageProfile" ADD CONSTRAINT "ChristianMarriageProfile_marriageProfileId_fkey" FOREIGN KEY ("marriageProfileId") REFERENCES "MarriageProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChristianMarriageProfile" ADD CONSTRAINT "ChristianMarriageProfile_denominationId_fkey" FOREIGN KEY ("denominationId") REFERENCES "ChristianDenomination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikhMarriageProfile" ADD CONSTRAINT "SikhMarriageProfile_marriageProfileId_fkey" FOREIGN KEY ("marriageProfileId") REFERENCES "MarriageProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikhMarriageProfile" ADD CONSTRAINT "SikhMarriageProfile_religiousStatusId_fkey" FOREIGN KEY ("religiousStatusId") REFERENCES "SikhReligiousStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreference" ADD CONSTRAINT "PartnerPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredCaste" ADD CONSTRAINT "PartnerPreferredCaste_partnerPreferenceId_fkey" FOREIGN KEY ("partnerPreferenceId") REFERENCES "PartnerPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreferredCaste" ADD CONSTRAINT "PartnerPreferredCaste_casteId_fkey" FOREIGN KEY ("casteId") REFERENCES "Caste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Match" ADD CONSTRAINT "Match_profileOneId_fkey" FOREIGN KEY ("profileOneId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_profileTwoId_fkey" FOREIGN KEY ("profileTwoId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderProfileId_fkey" FOREIGN KEY ("senderProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerProfileId_fkey" FOREIGN KEY ("blockerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedProfileId_fkey" FOREIGN KEY ("blockedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterProfileId_fkey" FOREIGN KEY ("reporterProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedProfileId_fkey" FOREIGN KEY ("reportedProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEvidence" ADD CONSTRAINT "ReportEvidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
