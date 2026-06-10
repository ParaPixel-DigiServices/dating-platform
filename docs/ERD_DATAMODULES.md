# AMORA DATA MODEL V1

## Purpose

This document defines the long-term database architecture for Amora.

Goals:

* Minimize future schema migrations.
* Support Love, Marriage, Casual, and Roommate categories.
* Support religion-specific onboarding.
* Support dynamic onboarding questions.
* Support future matchmaking engine.
* Support future AI compatibility engine.
* Support future subscription and premium features.

---

# Architecture Principles

## Principle 1 — Structured Data First

Data that will be:

* Filtered
* Sorted
* Matched
* Ranked

must live in structured tables.

Examples:

* Height
* Religion
* Education
* Smoking Habit
* Want Children

---

## Principle 2 — Dynamic Questions

Questions that may change frequently should never require database migrations.

Examples:

* Hijab Preference
* Kundli Matching
* Church Attendance
* Laundry Habits
* PDA Comfort

These must use the Dynamic Question Engine.

---

## Principle 3 — Single Source of Truth

Backend database is always the source of truth.

Frontend Zustand stores are caches only.

---

# Core Domain Model

User
│
├── Profile
├── Session
├── VerificationStatus
├── UserLifestyle
├── UserPersonality
├── UserValues
├── UserPreference
├── UserInterest
├── UserPhoto
├── UserAnswer
└── OnboardingProgress

---

# ENUMS

## AuthProvider

PHONE
GOOGLE
APPLE

---

## CategoryType

LOVE
MARRIAGE
CASUAL
ROOMMATE

---

## Gender

MALE
FEMALE
NON_BINARY

---

## OnboardingStatus

NOT_STARTED
IN_PROGRESS
COMPLETED

---

## VerificationStatusType

UNVERIFIED
PENDING
VERIFIED
REJECTED

---

# USER

Represents the account.

Fields:

* id
* email
* phoneNumber
* authProvider
* category
* phoneVerified
* onboardingStatus
* isActive
* isBlocked
* createdAt
* updatedAt
* deletedAt

Responsibilities:

* Authentication
* Account lifecycle
* Category selection

---

# PROFILE

Represents permanent identity information.

Fields:

* userId
* firstName
* lastName
* dateOfBirth
* gender
* bio

Location:

* city
* state
* country

Education:

* education
* qualification

Career:

* occupation
* annualSalary
* familyIncome
* assets

Personal:

* heightCm
* motherTongue
* religion
* caste

Metadata:

* profileCompleted

Responsibilities:

* Identity
* Search Filters
* Discovery Cards

---

# USER_PHOTO

Stores profile photos.

Fields:

* id
* userId
* url
* order
* isPrimary
* createdAt

Rules:

* Maximum 10 photos
* One primary photo

---

# USER_LIFESTYLE

Stores lifestyle attributes.

Fields:

* userId

Diet:

* dietPreference

Habits:

* smokingHabit
* drinkingHabit

Fitness:

* fitnessImportance

Pets:

* petsPreference

Purpose:

* Matching
* Search Filters

---

# USER_PERSONALITY

Stores personality attributes.

Fields:

* userId

Personality:

* personalityType

Daily Life:

* morningNightType

Communication:

* communicationStyle

Conflict:

* conflictResolutionStyle

Social:

* socialLevel

Home:

* cleanlinessLevel

Purpose:

* Compatibility Scoring

---

# USER_VALUES

Stores value systems.

Fields:

* userId

Family:

* familyImportance

Religion:

* religionImportance

Traditions:

* traditionImportance

Respect:

* elderRespectImportance

Parenting:

* parentingPhilosophy

Career:

* careerImportance

Travel:

* travelImportance

Relationships:

* loyaltyImportance
* independenceLevel

Purpose:

* High Weight Matching

---

# USER_PREFERENCE

Stores relationship preferences.

Fields:

* userId

Relationship:

* longTermIntent
* marriageIntent

Family:

* wantChildren

Location:

* willingToRelocate
* longDistanceComfort

Partner:

* expectations
* dealBreakers

Purpose:

* Matching Engine

---

# INTEREST

Master interest catalog.

Examples:

* Fitness
* Music
* Travel
* Reading
* Investing
* Yoga

Fields:

* id
* name
* createdAt

---

# USER_INTEREST

Links users to interests.

Fields:

* userId
* interestId

Rules:

* Maximum 10 selected interests

---

# DYNAMIC QUESTION ENGINE

Purpose:

Avoid schema changes whenever onboarding changes.

---

## QUESTION

Stores question definitions.

Fields:

* id

Identity:

* key
* label
* description

Classification:

* category
* religion

Rendering:

* questionType
* required

Ordering:

* displayOrder

Examples:

* marriage.timeline
* hindu.kundli_matching
* muslim.hijab_preference
* christian.church_attendance
* roommate.cleanliness

---

## QUESTION_OPTION

Stores selectable options.

Fields:

* id
* questionId
* label
* value
* displayOrder

Example:

Question:

hindu.kundli_matching

Options:

* REQUIRED
* PREFERRED
* NOT_IMPORTANT

---

## USER_ANSWER

Stores answers.

Fields:

* id
* userId
* questionId
* answerJson
* createdAt
* updatedAt

Examples:

{
"value": "PREFERRED"
}

{
"values": [
"RAMADAN",
"ZAKAT"
]
}

{
"text": "I want someone ambitious."
}

---

# ONBOARDING_PROGRESS

Tracks onboarding.

Fields:

* userId
* currentStep
* completedSteps
* completed

Purpose:

* Resume onboarding
* Progress tracking

---

# SESSION

Stores refresh token sessions.

Fields:

* id
* userId
* refreshToken
* ipAddress
* userAgent
* expiresAt
* createdAt

Purpose:

* Session Management

---

# VERIFICATION_STATUS

Stores verification lifecycle.

Fields:

* userId
* status
* reviewedAt
* rejectionReason

Purpose:

* KYC
* Verification Badge

---

# MATCHING PRIORITY

Highest Weight:

* Values
* Communication Style
* Conflict Style
* Relationship Goals
* Children Preference
* Relocation Preference

Medium Weight:

* Religion
* Lifestyle
* Interests

Low Weight:

* Salary
* Education
* Profession
* Height

---

# FUTURE TABLES (NOT V1)

* Match
* Swipe
* Conversation
* Message
* Subscription
* Report
* Block
* VerificationDocument
* AICompatibilityReport

These are intentionally excluded from V1.
