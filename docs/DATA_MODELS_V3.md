# AMORA_DATA_MODEL_V3

## DOMAIN OVERVIEW

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

## CategoryType

```prisma
enum CategoryType {
  LOVE
  MARRIAGE
  CASUAL
  ROOMMATE
}
```

## Gender

```prisma
enum Gender {
  MALE
  FEMALE
  NON_BINARY
}
```

## OnboardingStatus

```prisma
enum OnboardingStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}
```

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

# CORE TABLES

## User

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
}
```

---

## Profile

```prisma
model Profile {
  id String @id @default(uuid())

  userId String @unique

  firstName String
  lastName String?

  dateOfBirth DateTime

  gender Gender

  bio String?

  cityId String?
  stateId String?
  countryId String?

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

  @@index([religionId])
  @@index([countryId])
  @@index([stateId])
  @@index([cityId])
}
```

---

## Session

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
}
```

---

## VerificationStatus

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

# MATCHING TABLES

## UserLifestyle

```prisma
model UserLifestyle {
  id String @id @default(uuid())

  userId String @unique

  dietPreference String?

  smokingHabit String?

  drinkingHabit String?

  fitnessImportance String?

  petsPreference String?

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

## UserPersonality

```prisma
model UserPersonality {
  id String @id @default(uuid())

  userId String @unique

  personalityType String?

  communicationStyle String?

  conflictResolutionStyle String?

  socialLevel String?

  cleanlinessLevel String?

  morningNightType String?

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

## UserValues

```prisma
model UserValues {
  id String @id @default(uuid())

  userId String @unique

  familyImportance String?

  religionImportance String?

  traditionImportance String?

  careerImportance String?

  travelImportance String?

  loyaltyImportance String?

  independenceLevel String?

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

## UserPreference

```prisma
model UserPreference {
  id String @id @default(uuid())

  userId String @unique

  wantChildren String?

  willingToRelocate String?

  longDistanceComfort String?

  marriageTimeline String?

  relationshipGoal String?

  dealBreakers Json?

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

# CONTENT TABLES

## UserPhoto

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

## UserPrompt

```prisma
model UserPrompt {
  id String @id @default(uuid())

  userId String

  promptKey String

  answer String

  displayOrder Int

  isVisible Boolean @default(true)

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  @@unique([userId, promptKey])
}
```

---

# LOOKUP TABLES

## Religion

```prisma
model Religion {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())
}
```

---

## Language

```prisma
model Language {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())
}
```

---

## EducationLevel

```prisma
model EducationLevel {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())
}
```

---

## Interest

```prisma
model Interest {
  id String @id @default(uuid())

  name String @unique

  createdAt DateTime @default(now())
}
```

---

# RELATION TABLES

## UserLanguage

```prisma
model UserLanguage {
  id String @id @default(uuid())

  userId String

  languageId String

  createdAt DateTime @default(now())

  @@unique([userId, languageId])
}
```

---

## UserInterest

```prisma
model UserInterest {
  id String @id @default(uuid())

  userId String

  interestId String

  createdAt DateTime @default(now())

  @@unique([userId, interestId])
}
```

---

# DYNAMIC QUESTION ENGINE

## QuestionSet

```prisma
model QuestionSet {
  id String @id @default(uuid())

  key String @unique

  title String

  description String?

  displayOrder Int

  questions Question[]
}
```

Examples:

```text
love_core
marriage_core
marriage_hindu
marriage_muslim
casual_core
roommate_core
```

---

## Question

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

  questionSet QuestionSet @relation(
    fields: [questionSetId],
    references: [id]
  )

  options QuestionOption[]

  answers UserAnswer[]
}
```

---

## QuestionOption

```prisma
model QuestionOption {
  id String @id @default(uuid())

  questionId String

  label String

  value String

  displayOrder Int

  question Question @relation(
    fields: [questionId],
    references: [id]
  )
}
```

---

## UserAnswer

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
    references: [id]
  )

  question Question @relation(
    fields: [questionId],
    references: [id]
  )

  @@unique([userId, questionId])
}
```

---

# AI READY

## UserEmbedding

```prisma
model UserEmbedding {
  id String @id @default(uuid())

  userId String @unique

  embedding Json

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

---

# FUTURE TABLES (PHASE 2+)

```text
Match
Swipe
Conversation
Message
Subscription
Report
Block
VerificationDocument
AICompatibilityReport
```

---

# PHASE 1 FREEZE

The schema is considered frozen when:

1. Every onboarding question has a destination.
2. No onboarding feature requires a new table.
3. Matchmaking fields remain queryable.
4. Religion-specific onboarding remains dynamic.
5. Love / Marriage / Casual / Roommate all share the same architecture.
6. AI compatibility can be added without redesigning the database.