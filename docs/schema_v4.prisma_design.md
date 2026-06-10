# AMORA DATABASE ARCHITECTURE V4

## PART 1 — FOUNDATION, ENUMS, LOOKUP TABLES & CORE MODELS

---

# DOCUMENT STATUS

Version: V4

Status: FROZEN

Purpose:

This document defines the source of truth for Amora's database architecture before Prisma implementation.

Goals:

* Minimize future schema migrations
* Support Love / Marriage / Casual / Roommate
* Support AI matchmaking
* Support dynamic onboarding
* Support religion-specific onboarding
* Support future subscription system
* Support future moderation system

---

# ARCHITECTURAL PRINCIPLES

## Principle 1

Frequently queried data must be structured.

Examples:

* Gender
* Religion
* Height
* Smoking
* Drinking
* Want Children

These must never live inside JSON.

---

## Principle 2

Frequently changing onboarding questions must be data-driven.

Examples:

* Hijab Preference
* Kundli Matching
* Church Attendance
* Laundry Habits

These belong to Question Engine.

---

## Principle 3

Frontend state is cache only.

Backend database is always source of truth.

---

## Principle 4

Matchmaking attributes must be directly queryable.

Never store compatibility data inside JSON blobs.

---

## Principle 5

Profile identity and compatibility attributes must remain separate.

Identity:

* Name
* DOB
* Gender

Compatibility:

* Smoking
* Children
* Relocation
* Communication Style

---

# DOMAIN OVERVIEW

```text
User
│
├── Profile
├── Session
├── VerificationStatus
├── OnboardingProgress
│
├── UserPhoto
├── UserPrompt
│
├── UserLifestyle
├── UserPersonality
├── UserValues
├── UserPreference
│
├── UserLanguage
├── UserInterest
│
├── UserAnswer
│
└── UserEmbedding
```

---

# ENUMS

## AuthProvider

```prisma
enum AuthProvider {
  PHONE
  GOOGLE
  APPLE
}
```

Purpose:

Authentication source.

---

## CategoryType

```prisma
enum CategoryType {
  LOVE
  MARRIAGE
  CASUAL
  ROOMMATE
}
```

Purpose:

Determines onboarding flow.

Determines matchmaking pool.

Determines recommendation algorithm.

---

## Gender

```prisma
enum Gender {
  MALE
  FEMALE
  NON_BINARY
}
```

---

## OnboardingStatus

```prisma
enum OnboardingStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}
```

---

## VerificationStatusType

```prisma
enum VerificationStatusType {
  UNVERIFIED
  PENDING
  VERIFIED
  REJECTED
}
```

---

## DietPreference

```prisma
enum DietPreference {
  VEG
  NON_VEG
  VEGAN
  EGGETARIAN
  JAIN
}
```

---

## SmokingHabit

```prisma
enum SmokingHabit {
  NEVER
  OCCASIONALLY
  REGULARLY
}
```

---

## DrinkingHabit

```prisma
enum DrinkingHabit {
  NEVER
  SOCIALLY
  REGULARLY
}
```

---

## FitnessImportance

```prisma
enum FitnessImportance {
  LOW
  MEDIUM
  HIGH
}
```

---

## PetsPreference

```prisma
enum PetsPreference {
  LOVE_PETS
  OKAY_WITH_PETS
  NO_PETS
}
```

---

## SocialLevel

```prisma
enum SocialLevel {
  INTROVERT
  AMBIVERT
  EXTROVERT
}
```

---

## CommunicationStyle

```prisma
enum CommunicationStyle {
  DIRECT
  CALM
  EXPRESSIVE
  RESERVED
}
```

---

## ConflictStyle

```prisma
enum ConflictStyle {
  DISCUSS
  NEED_SPACE
  AVOID
  IMMEDIATE_RESOLUTION
}
```

---

## MorningNightType

```prisma
enum MorningNightType {
  MORNING_PERSON
  FLEXIBLE
  NIGHT_OWL
}
```

---

## MarriageTimeline

```prisma
enum MarriageTimeline {
  ASAP
  WITHIN_1_YEAR
  WITHIN_2_YEARS
  FLEXIBLE
}
```

---

## ChildrenPreference

```prisma
enum ChildrenPreference {
  YES
  NO
  MAYBE
}
```

---

## RelocationPreference

```prisma
enum RelocationPreference {
  YES
  NO
  DEPENDS
}
```

---

## LongDistancePreference

```prisma
enum LongDistancePreference {
  YES
  NO
  DEPENDS
}
```

---

# LOOKUP TABLES

These are seeded tables.

They are NOT enums.

Reason:

Data may evolve over time.

---

# Religion

```prisma
model Religion {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())
}
```

Seed Examples:

* Hindu
* Muslim
* Christian
* Sikh
* Jain
* Buddhist
* Jewish
* Atheist
* Agnostic
* Spiritual
* Other

---

# Language

```prisma
model Language {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())
}
```

Examples:

* English
* Hindi
* Kannada
* Tamil
* Telugu
* Malayalam
* Bengali
* Marathi
* Punjabi
* Gujarati

---

# EducationLevel

```prisma
model EducationLevel {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())
}
```

Examples:

* High School
* Diploma
* Bachelor's
* Master's
* MBA
* PhD
* Doctorate
* Other

---

# Interest

```prisma
model Interest {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())

  users UserInterest[]
}
```

Examples:

* Fitness
* Reading
* Music
* Travel
* Investing
* Gaming
* Hiking
* Yoga
* Startups
* Technology

---

# CORE MODELS

## User

Purpose:

Account identity.

Authentication.

Category ownership.

Platform lifecycle.

```prisma
model User {
  id String @id @default(uuid())

  email String? @unique

  phoneNumber String? @unique

  authProvider AuthProvider

  category CategoryType?

  phoneVerified Boolean @default(false)

  onboardingStatus OnboardingStatus
    @default(NOT_STARTED)

  isActive Boolean @default(true)

  isBlocked Boolean @default(false)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  deletedAt DateTime?

  profile Profile?

  sessions Session[]

  onboardingProgress OnboardingProgress?

  verificationStatus VerificationStatus?

  photos UserPhoto[]

  prompts UserPrompt[]

  lifestyle UserLifestyle?

  personality UserPersonality?

  values UserValues?

  preferences UserPreference?

  answers UserAnswer[]

  interests UserInterest[]

  languages UserLanguage[]

  embedding UserEmbedding?

  @@index([category])

  @@index([onboardingStatus])

  @@index([phoneNumber])

  @@index([email])
}
```

---

## Profile

Purpose:

Identity information.

Discovery card information.

Search filters.

```prisma
model Profile {
  id String @id @default(uuid())

  userId String @unique

  firstName String

  lastName String?

  dateOfBirth DateTime

  gender Gender

  bio String?

  city String?

  state String?

  country String?

  educationLevelId String?

  qualification String?

  occupation String?

  annualSalary Int?

  familyIncome Int?

  assets String?

  heightCm Int?

  motherTongueId String?

  religionId String?

  caste String?

  profileCompleted Boolean @default(false)

  completionPercentage Int @default(0)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@index([gender])

  @@index([religionId])

  @@index([country])

  @@index([state])

  @@index([city])
}
```

---

## Session

Purpose:

Refresh token sessions.

```prisma
model Session {
  id String @id @default(uuid())

  userId String

  refreshToken String

  ipAddress String?

  userAgent String?

  expiresAt DateTime

  createdAt DateTime @default(now())

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@index([userId])

  @@index([expiresAt])
}
```

---

## VerificationStatus

Purpose:

Identity verification lifecycle.

```prisma
model VerificationStatus {
  id String @id @default(uuid())

  userId String @unique

  status VerificationStatusType
    @default(UNVERIFIED)

  reviewedAt DateTime?

  rejectionReason String?

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

## OnboardingProgress

Purpose:

Resume onboarding.

Track onboarding completion.

```prisma
model OnboardingProgress {
  id String @id @default(uuid())

  userId String @unique

  currentStep Int @default(0)

  completedSteps Json?

  completed Boolean @default(false)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

# AMORA DATABASE ARCHITECTURE V4

## PART 2 — MATCHING MODELS, CONTENT MODELS & RELATION MODELS

---

# PURPOSE OF PART 2

Part 2 contains the heart of the matchmaking engine.

These tables determine:

* Match recommendations
* Compatibility scoring
* Search filters
* AI compatibility reports
* Discovery ranking

The architecture intentionally separates:

```text
Identity
↓
Profile

Lifestyle
↓
UserLifestyle

Personality
↓
UserPersonality

Values
↓
UserValues

Relationship Preferences
↓
UserPreference
```

This allows independent weighting inside the matchmaking engine.

---

# MATCHING ENGINE ARCHITECTURE

Compatibility Score is computed from:

```text
Lifestyle Compatibility

+
Personality Compatibility

+
Values Compatibility

+
Relationship Compatibility

+
Interest Compatibility

+
Location Compatibility
```

Each category can be independently weighted.

---

# USERLIFESTYLE

Purpose:

Stores day-to-day lifestyle attributes.

These are frequently filtered.

Examples:

```text
Smoking
Drinking
Diet
Fitness
Pets
```

---

## Prisma Model

```prisma
model UserLifestyle {
  id String @id @default(uuid())

  userId String @unique

  dietPreference DietPreference?

  smokingHabit SmokingHabit?

  drinkingHabit DrinkingHabit?

  fitnessImportance FitnessImportance?

  petsPreference PetsPreference?

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@index([dietPreference])

  @@index([smokingHabit])

  @@index([drinkingHabit])
}
```

---

# USERPERSONALITY

Purpose:

Stores personality characteristics.

Used heavily by compatibility scoring.

Examples:

```text
Communication Style
Conflict Style
Social Level
Morning/Night
Cleanliness
```

---

## Prisma Model

```prisma
model UserPersonality {
  id String @id @default(uuid())

  userId String @unique

  communicationStyle CommunicationStyle?

  conflictStyle ConflictStyle?

  socialLevel SocialLevel?

  morningNightType MorningNightType?

  cleanlinessLevel Int?

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@index([communicationStyle])

  @@index([socialLevel])
}
```

---

# CLEANLINESS SCALE

Range:

```text
1 = Very Messy
2 = Messy
3 = Neutral
4 = Clean
5 = Extremely Clean
```

Purpose:

Especially important for Roommate category.

---

# USERVALUES

Purpose:

Stores core life values.

Values are among the strongest long-term compatibility predictors.

Examples:

```text
Family Importance
Religion Importance
Tradition Importance
Career Importance
Travel Importance
Loyalty Importance
Independence Level
```

---

## Scale

Every field uses:

```text
1 = Not Important

2 = Slightly Important

3 = Neutral

4 = Important

5 = Extremely Important
```

---

## Prisma Model

```prisma
model UserValues {
  id String @id @default(uuid())

  userId String @unique

  familyImportance Int?

  religionImportance Int?

  traditionImportance Int?

  careerImportance Int?

  travelImportance Int?

  loyaltyImportance Int?

  independenceLevel Int?

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

# USERPREFERENCE

Purpose:

Stores relationship expectations.

These are among the most important matching signals.

Examples:

```text
Want Children
Marriage Timeline
Relocation
Long Distance
```

---

## Prisma Model

```prisma
model UserPreference {
  id String @id @default(uuid())

  userId String @unique

  childrenPreference ChildrenPreference?

  marriageTimeline MarriageTimeline?

  relocationPreference RelocationPreference?

  longDistancePreference LongDistancePreference?

  relationshipGoal String?

  dealBreakers Json?

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

# RELATIONSHIP GOAL

Initially stored as String.

Possible values:

```text
Long Term

Marriage

Casual

Friendship

Roommate
```

Can later become enum if needed.

---

# DEAL BREAKERS

Stored as JSON.

Examples:

```json
[
  "Smoking",
  "Dishonesty",
  "Long Distance"
]
```

Reason:

User-defined.

Not standardized.

---

# USERPHOTO

Purpose:

Stores profile photos.

---

## Rules

```text
Maximum Photos = 10

Minimum Photos = 1

Primary Photo = Exactly 1
```

---

## Prisma Model

```prisma
model UserPhoto {
  id String @id @default(uuid())

  userId String

  url String

  order Int

  isPrimary Boolean @default(false)

  moderationStatus String?

  blurHash String?

  uploadedAt DateTime @default(now())

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@index([userId])
}
```

---

# MODERATION STATUS

Examples:

```text
PENDING

APPROVED

REJECTED
```

Can become enum later.

---

# USERPROMPT

Purpose:

Stores profile prompts.

Used heavily in:

```text
Love

Casual
```

categories.

---

## Examples

```text
The quickest way to my heart is...

I feel most alive when...

People are surprised when...

My ideal Sunday is...

The green flag I look for is...
```

---

## Prisma Model

```prisma
model UserPrompt {
  id String @id @default(uuid())

  userId String

  promptKey String

  answer String

  displayOrder Int

  isVisible Boolean @default(true)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@unique([userId, promptKey])

  @@index([userId])
}
```

---

# USERLANGUAGE

Purpose:

Many-to-many relation.

A user can speak multiple languages.

---

## Prisma Model

```prisma
model UserLanguage {
  id String @id @default(uuid())

  userId String

  languageId String

  createdAt DateTime @default(now())

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  language Language @relation(
    fields: [languageId],
    references: [id]
  )

  @@unique([userId, languageId])

  @@index([userId])

  @@index([languageId])
}
```

---

# USERINTEREST

Purpose:

Many-to-many relation.

Supports interest-based matching.

---

## Prisma Model

```prisma
model UserInterest {
  id String @id @default(uuid())

  userId String

  interestId String

  createdAt DateTime @default(now())

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  interest Interest @relation(
    fields: [interestId],
    references: [id]
  )

  @@unique([userId, interestId])

  @@index([userId])

  @@index([interestId])
}
```

---

# INTEREST MATCHING

Example:

```text
User A:
Fitness
Reading
Travel

User B:
Fitness
Travel
Music
```

Shared:

```text
Fitness
Travel
```

Interest Score:

```text
2 Shared Interests
```

Used in recommendation ranking.

---

# MATCHING WEIGHTS (V1)

Lifestyle:

```text
20%
```

Personality:

```text
25%
```

Values:

```text
25%
```

Relationship Preferences:

```text
20%
```

Interests:

```text
10%
```

Total:

```text
100%
```

These values will evolve later.

---

# AMORA DATABASE ARCHITECTURE V4

## PART 3 — DYNAMIC QUESTION ENGINE, AI ARCHITECTURE, INDEXING, ONBOARDING MAPPING & DATABASE FREEZE

---

# PURPOSE OF PART 3

This section defines:

* Dynamic Question System
* Religion-specific onboarding
* Category-specific onboarding
* AI compatibility readiness
* Search strategy
* Matchmaking strategy
* Database seeding
* Schema freeze rules

This completes the V4 Architecture.

---

# DYNAMIC QUESTION ENGINE

## WHY IT EXISTS

Without Question Engine:

Every onboarding change requires:

```text
Prisma Migration
Backend Update
Frontend Update
Database Deployment
```

With Question Engine:

```text
Insert New Question
Done
```

---

# QUESTION SET

Purpose:

Group questions into onboarding modules.

Examples:

```text
love_core

marriage_core

marriage_hindu

marriage_muslim

marriage_christian

casual_core

roommate_core
```

---

## Prisma Model

```prisma
model QuestionSet {
  id String @id @default(uuid())

  key String @unique

  title String

  description String?

  displayOrder Int

  isActive Boolean @default(true)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  questions Question[]
}
```

---

# QUESTION

Purpose:

Defines a question.

Examples:

```text
hindu.kundli_matching

muslim.hijab_preference

christian.church_attendance

roommate.cleanliness

love.love_language
```

---

## Prisma Model

```prisma
model Question {
  id String @id @default(uuid())

  questionSetId String

  key String @unique

  label String

  description String?

  type String

  required Boolean @default(false)

  displayOrder Int

  isActive Boolean @default(true)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  questionSet QuestionSet @relation(
    fields: [questionSetId],
    references: [id],
    onDelete: Cascade
  )

  options QuestionOption[]

  answers UserAnswer[]

  @@index([questionSetId])

  @@index([key])
}
```

---

# QUESTION TYPES

Allowed Types:

```text
TEXT

TEXTAREA

NUMBER

SINGLE_SELECT

MULTI_SELECT

BOOLEAN

DATE
```

Frontend rendering uses this field.

---

# QUESTION OPTION

Purpose:

Stores selectable options.

---

## Prisma Model

```prisma
model QuestionOption {
  id String @id @default(uuid())

  questionId String

  label String

  value String

  displayOrder Int

  createdAt DateTime @default(now())

  question Question @relation(
    fields: [questionId],
    references: [id],
    onDelete: Cascade
  )

  @@index([questionId])
}
```

---

# USER ANSWER

Purpose:

Stores dynamic answers.

---

## Prisma Model

```prisma
model UserAnswer {
  id String @id @default(uuid())

  userId String

  questionId String

  answerJson Json

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  question Question @relation(
    fields: [questionId],
    references: [id],
    onDelete: Cascade
  )

  @@unique([userId, questionId])

  @@index([userId])

  @@index([questionId])
}
```

---

# ANSWER JSON EXAMPLES

## Single Select

```json
{
  "value": "PREFERRED"
}
```

---

## Multi Select

```json
{
  "values": [
    "TRAVEL",
    "FITNESS",
    "READING"
  ]
}
```

---

## Text

```json
{
  "text": "I want someone ambitious and kind."
}
```

---

# RELIGION SPECIFIC ONBOARDING

NO TABLES:

```text
HinduProfile

MuslimProfile

ChristianProfile
```

are ever allowed.

---

Religion-specific onboarding must always be implemented through:

```text
QuestionSet

Question

QuestionOption

UserAnswer
```

---

# EXAMPLES

## Hindu

```text
hindu.kundli_matching

hindu.temple_frequency

hindu.festival_importance
```

---

## Muslim

```text
muslim.hijab_preference

muslim.namaz_frequency

muslim.ramadan_observance
```

---

## Christian

```text
christian.church_attendance

christian.faith_importance

christian.ministry_involvement
```

---

# CATEGORY SPECIFIC ONBOARDING

---

## LOVE

Question Set:

```text
love_core
```

Prompts:

```text
quickest_way_to_my_heart

ideal_sunday

love_language

green_flag
```

Stored In:

```text
UserPrompt
```

---

## MARRIAGE

Question Set:

```text
marriage_core
```

Stored In:

```text
UserPreference
+
UserAnswer
```

---

## CASUAL

Question Set:

```text
casual_core
```

Stored In:

```text
UserPreference
+
UserPrompt
+
UserAnswer
```

---

## ROOMMATE

Question Set:

```text
roommate_core
```

Stored In:

```text
UserLifestyle
+
UserPersonality
+
UserAnswer
```

---

# AI COMPATIBILITY ARCHITECTURE

Purpose:

Future semantic compatibility.

Future recommendation ranking.

Future AI-generated compatibility reports.

---

# USER EMBEDDING

## Prisma Model

```prisma
model UserEmbedding {
  id String @id @default(uuid())

  userId String @unique

  embedding Json

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

# EMBEDDING SOURCE DATA

Generated from:

```text
Profile

UserLifestyle

UserPersonality

UserValues

UserPreference

UserPrompt

UserAnswer
```

---

# FUTURE AI FEATURES

Planned:

```text
Semantic Matching

Compatibility Reports

Match Explanations

Conversation Starters

Smart Recommendations

AI Wingman
```

No schema changes required.

---

# MATCHMAKING SEARCH STRATEGY

Primary Filters:

```text
Age

Gender

Religion

Location

Education

Children Preference

Smoking

Drinking

Relationship Goal
```

---

# INDEXING STRATEGY

Indexes Required:

## User

```text
category

onboardingStatus

phoneNumber

email
```

---

## Profile

```text
gender

religionId

country

state

city
```

---

## UserLifestyle

```text
dietPreference

smokingHabit

drinkingHabit
```

---

## UserPersonality

```text
communicationStyle

socialLevel
```

---

## UserLanguage

```text
userId

languageId
```

---

## UserInterest

```text
userId

interestId
```

---

## Question

```text
questionSetId

key
```

---

## UserAnswer

```text
userId

questionId
```

---

# DATABASE SEEDING STRATEGY

Must Seed:

```text
Religion

Language

EducationLevel

Interest
```

---

# RELIGION SEEDS

```text
Hindu

Muslim

Christian

Sikh

Jain

Buddhist

Jewish

Atheist

Agnostic

Spiritual

Other
```

---

# EDUCATION LEVEL SEEDS

```text
High School

Diploma

Bachelor's

Master's

MBA

PhD

Doctorate

Other
```

---

# LANGUAGE SEEDS

Phase 1:

```text
English

Hindi

Kannada

Tamil

Telugu

Malayalam

Marathi

Gujarati

Punjabi

Bengali
```

---

# INTEREST SEEDS

Minimum:

```text
Fitness

Travel

Reading

Music

Movies

Gaming

Technology

Startups

Cooking

Yoga

Photography

Art

Hiking

Cycling

Investing

Business

Pets

Fashion

Dancing

Sports
```

---

# ONBOARDING STORAGE MAP

## Profile

Stores:

```text
Name

DOB

Gender

Location

Education

Occupation

Salary

Height

Religion

Mother Tongue
```

---

## UserLifestyle

Stores:

```text
Smoking

Drinking

Diet

Fitness

Pets
```

---

## UserPersonality

Stores:

```text
Communication

Conflict

Social Level

Cleanliness

Morning/Night
```

---

## UserValues

Stores:

```text
Family

Religion

Tradition

Career

Travel

Loyalty

Independence
```

---

## UserPreference

Stores:

```text
Children

Marriage Timeline

Relocation

Long Distance

Relationship Goal
```

---

## UserPrompt

Stores:

```text
Profile Prompts
```

---

## UserAnswer

Stores:

```text
All Dynamic Questions
```

---

# FUTURE TABLES (PHASE 2+)

Not Included In Phase 1:

```text
Match

Swipe

Conversation

Message

Subscription

PremiumFeature

Boost

SuperLike

Block

Report

ModerationAction

VerificationDocument

Notification

UserDevice

AnalyticsEvent

AICompatibilityReport
```

---

# SCHEMA FREEZE RULES

The schema is considered frozen when:

1. Every onboarding question has a destination.
2. Matchmaking fields are queryable.
3. Dynamic questions require no migration.
4. Religion modules are data-driven.
5. AI features require no schema redesign.
6. Love / Marriage / Casual / Roommate use the same architecture.
7. No new onboarding table should ever be required.

---



