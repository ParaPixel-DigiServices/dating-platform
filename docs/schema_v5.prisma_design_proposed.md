# AMORA DATABASE ARCHITECTURE V5 — PROPOSED

## DOCUMENT STATUS

Version: V5

Status: PROPOSED

Based On: V4 (FROZEN)

Purpose:

This document proposes the schema changes required to support the new product architecture:

- **Love** category: No sub-categories. Three exclusive features — Insight, Sync, Spark.
- **Marriage** category: Religion-based sub-categories (Hindu, Muslim, Christian) retained. No Insight/Sync/Spark features.
- **Casual / Roommate**: Unchanged from V4.

---

# WHAT CHANGED FROM V4

| Area | V4 | V5 |
|---|---|---|
| Love sub-categories | Spark, Insight, Sync as sub-categories | Removed — now product features |
| Love profile questions | Generic dynamic questions | 25 structured MCQ questions powering Insight + Sync |
| Marriage sub-categories | Hindu, Muslim, Christian | Retained unchanged |
| Spark | Not modelled | New `SparkQuestion` + `Spark` + `SparkAnswer` tables |
| Insight Report | Not modelled | Derived from `UserInsightProfile`, computed server-side |
| Sync Report | Not modelled | Computed on-demand from two users' `UserInsightProfile` |
| Future tables (V4) | SuperLike listed | Replaced by Spark |

---

# ARCHITECTURAL PRINCIPLES (INHERITED FROM V4)

All V4 principles apply unchanged:

1. Frequently queried data must be structured — never in JSON.
2. Frequently changing onboarding questions must be data-driven.
3. Frontend state is cache only. Backend is source of truth.
4. Matchmaking attributes must be directly queryable.
5. Profile identity and compatibility attributes must remain separate.

**New Principle 6 (V5):**

Feature availability is determined by `User.category`.

> Love-exclusive features (Insight, Sync, Spark) must never be accessible to Marriage / Casual / Roommate users at the data layer.

---

# UPDATED DOMAIN OVERVIEW

```text
User
│
├── Profile
├── Session
├── VerificationStatus
├── OnboardingProgress
│
├── UserPhoto
├── UserPrompt          (Love + Casual only)
│
├── UserLifestyle
├── UserPersonality
├── UserValues
├── UserPreference
│
├── UserLanguage
├── UserInterest
│
├── UserAnswer          (Dynamic question engine — all categories)
│
├── UserEmbedding
│
│── [LOVE EXCLUSIVE]
│   ├── UserInsightProfile   (25 MCQ answers → structured insight data)
│   ├── InsightReport        (Generated from UserInsightProfile)
│   ├── SyncReport           (Generated from two UserInsightProfiles)
│   ├── SparkQuestion        (3 custom questions set by Love user)
│   ├── Spark                (Sent spark from viewer to profile owner)
│   └── SparkAnswer          (Answers submitted with the spark)
│
└── [MARRIAGE EXCLUSIVE]
    └── UserAnswer (marriage_hindu / marriage_muslim / marriage_christian question sets)
```

---

# ENUMS — ADDITIONS & CHANGES

## MarriageSubCategory (NEW)

```prisma
enum MarriageSubCategory {
  HINDU
  MUSLIM
  CHRISTIAN
}
```

Purpose:

Replaces the old love sub-category concept for marriage.
Used to route the user to religion-specific onboarding questions.

---

## LoveLanguage (NEW)

```prisma
enum LoveLanguage {
  WORDS_OF_AFFIRMATION
  QUALITY_TIME
  ACTS_OF_SERVICE
  GIFT_GIVING
  PHYSICAL_TOUCH
}
```

Purpose:

Structured field derived from MCQ question `ll1`.
Enables matchmaking and Insight report generation.

---

## PersonalityTrait (NEW)

```prisma
enum PersonalityTrait {
  AMBITIOUS
  THOUGHTFUL
  ADVENTUROUS
  EMOTIONALLY_INTELLIGENT
  FAMILY_ORIENTED
  CREATIVE
  LOYAL
  EMPATHETIC
}
```

Purpose:

Structured personality trait scores used in the Insight radar chart.

---

## SparkStatus (NEW)

```prisma
enum SparkStatus {
  SENT
  VIEWED
  REPLIED
  EXPIRED
  DECLINED
}
```

---

## SyncStatus (NEW)

```prisma
enum SyncStatus {
  PENDING     // One or both users haven't completed profile
  COMPUTED    // Report successfully generated
  STALE       // Either user's profile was updated — needs recomputation
}
```

---

# UPDATED CORE MODELS

## User (MODIFIED)

```prisma
model User {
  id String @id @default(uuid())

  email String? @unique

  phoneNumber String? @unique

  authProvider AuthProvider

  category CategoryType?

  marriageSubCategory MarriageSubCategory?   // NULL for Love/Casual/Roommate

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

  // Love-exclusive relations
  insightProfile UserInsightProfile?

  sparkQuestionsOwned SparkQuestion[]    // Questions this user set for visitors

  sparksSent Spark[] @relation("SparkSender")

  sparksSentToMe Spark[] @relation("SparkReceiver")

  insightReports InsightReport[]

  syncReportsAsUser1 SyncReport[] @relation("SyncUser1")

  syncReportsAsUser2 SyncReport[] @relation("SyncUser2")

  @@index([category])

  @@index([marriageSubCategory])

  @@index([onboardingStatus])

  @@index([phoneNumber])

  @@index([email])
}
```

**Change from V4:**

Added `marriageSubCategory` to distinguish Hindu/Muslim/Christian without creating separate user types.

Added Love-exclusive relation fields (all nullable — safe for non-Love users).

---

# LOVE-EXCLUSIVE MODELS

## UserInsightProfile (NEW)

Purpose:

Stores the structured output of the 25 MCQ profile completion questions for Love users.

This is the source data for both the Insight Report and the Sync Report.

> This is NOT a dynamic answer table. It is a structured, queryable table because its fields power matchmaking and AI report generation.

```prisma
model UserInsightProfile {
  id String @id @default(uuid())

  userId String @unique

  // ── Basic Info ──────────────────────────────────────────
  heightRange String?            // "5'5\" – 5'8\""
  educationLevel String?         // "Master's Degree"
  occupationType String?         // "Working professional"

  // ── Personality Traits (scores 0-100) ───────────────────
  traitAmbitious        Int?
  traitThoughtful       Int?
  traitAdventurous      Int?
  traitEmotionallyIntelligent Int?
  traitFamilyOriented   Int?

  // ── Communication Style ──────────────────────────────────
  communicationStyleLabel String?   // e.g. "Thoughtful Listener"
  conflictApproach        String?   // e.g. "Take space, then talk"

  // ── Core Values ──────────────────────────────────────────
  coreValues Json?
  // Example: ["Honesty", "Respect", "Growth"]

  // ── Life Goals ───────────────────────────────────────────
  longTermGoal   String?
  fiveYearVision String?
  successMeaning String?

  // ── Lifestyle ────────────────────────────────────────────
  livingSituation  String?
  goingOutFrequency String?
  fitnessRelationship String?
  financialApproach String?

  // ── Love Language ────────────────────────────────────────
  loveLanguageReceiving LoveLanguage?
  loveLanguageGiving    LoveLanguage?

  // ── Deal Breakers ────────────────────────────────────────
  dealBreaker1 String?
  dealBreaker2 String?

  // ── Completion ───────────────────────────────────────────
  completedAt DateTime?

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  insightReports InsightReport[]

  @@index([loveLanguageReceiving])
  @@index([userId])
}
```

---

## InsightReport (NEW)

Purpose:

A generated personality insight report for a single Love user.

Shown to any visitor of the user's profile under the **Insight** tab.

Generated server-side by the AI/report engine using `UserInsightProfile` data.

```prisma
model InsightReport {
  id String @id @default(uuid())

  userId String

  insightProfileId String

  // ── Personality Snapshot ─────────────────────────────────
  personalityTraits Json
  // Example:
  // [
  //   { "trait": "Ambitious", "score": 80 },
  //   { "trait": "Thoughtful", "score": 75 }
  // ]

  // ── Labels ───────────────────────────────────────────────
  communicationStyleLabel String?

  loveLanguageLabel String?

  coreValuesDisplay Json?
  // Example: ["Honesty", "Respect", "Growth", "Loyalty"]

  lifeGoalsSummary String?

  // ── Version / Freshness ──────────────────────────────────
  version Int @default(1)

  generatedAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  insightProfile UserInsightProfile @relation(
    fields: [insightProfileId],
    references: [id],
    onDelete: Cascade
  )

  @@index([userId])
  @@index([insightProfileId])
}
```

---

## SyncReport (NEW)

Purpose:

A compatibility report between two Love users.

Generated on-demand when User A views User B's profile and both have completed their `UserInsightProfile`.

Cached after first generation. Marked STALE when either profile updates.

```prisma
model SyncReport {
  id String @id @default(uuid())

  userId1 String     // The profile being viewed

  userId2 String     // The viewer requesting the sync

  status SyncStatus @default(PENDING)

  // ── Scores ───────────────────────────────────────────────
  compatibilityScore Int?       // 0-100

  compatibilityLabel String?    // "Great Match", "Good Match", etc.

  // ── Breakdown ────────────────────────────────────────────
  valuesScore         Int?
  lifestyleScore      Int?
  communicationScore  Int?
  lifeGoalsScore      Int?

  // ── Shared Data ──────────────────────────────────────────
  sharedInterests Json?
  // Example: ["Travel", "Coffee", "Music"]

  conversationStarters Json?
  // Example: ["What's the best trip you've ever had?"]

  // ── Meta ─────────────────────────────────────────────────
  generatedAt DateTime?

  expiresAt DateTime?     // Optional TTL for cache invalidation

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user1 User @relation(
    "SyncUser1",
    fields: [userId1],
    references: [id],
    onDelete: Cascade
  )

  user2 User @relation(
    "SyncUser2",
    fields: [userId2],
    references: [id],
    onDelete: Cascade
  )

  @@unique([userId1, userId2])

  @@index([userId1])

  @@index([userId2])

  @@index([status])
}
```

---

## SparkQuestion (NEW)

Purpose:

Stores the 3 custom questions a Love user sets for visitors who want to send them a Spark.

These questions are visible to anyone who taps the Spark button on this user's profile.

```prisma
model SparkQuestion {
  id String @id @default(uuid())

  userId String

  question1 String

  question2 String

  question3 String

  isActive Boolean @default(true)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  user User @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  sparks Spark[]

  @@index([userId])
}
```

---

## Spark (NEW)

Purpose:

Represents a Spark interaction — the equivalent of a Super Like in the Love category.

A Spark includes the answers the sender submitted to the profile owner's 3 custom questions.

```prisma
model Spark {
  id String @id @default(uuid())

  senderId String

  receiverId String

  sparkQuestionId String    // Which question set was used

  status SparkStatus @default(SENT)

  sentAt DateTime @default(now())

  viewedAt DateTime?

  repliedAt DateTime?

  expiredAt DateTime?

  sender User @relation(
    "SparkSender",
    fields: [senderId],
    references: [id],
    onDelete: Cascade
  )

  receiver User @relation(
    "SparkReceiver",
    fields: [receiverId],
    references: [id],
    onDelete: Cascade
  )

  sparkQuestion SparkQuestion @relation(
    fields: [sparkQuestionId],
    references: [id]
  )

  answers SparkAnswer[]

  @@unique([senderId, receiverId])  // One active spark per pair

  @@index([senderId])

  @@index([receiverId])

  @@index([status])
}
```

---

## SparkAnswer (NEW)

Purpose:

Stores the sender's 3 answers to the profile owner's custom Spark questions.

```prisma
model SparkAnswer {
  id String @id @default(uuid())

  sparkId String

  questionNumber Int     // 1, 2, or 3

  answerText String

  createdAt DateTime @default(now())

  spark Spark @relation(
    fields: [sparkId],
    references: [id],
    onDelete: Cascade
  )

  @@unique([sparkId, questionNumber])

  @@index([sparkId])
}
```

---

# MARRIAGE-SPECIFIC CHANGES

## No New Tables

Marriage sub-categories (Hindu, Muslim, Christian) continue to be handled entirely through the dynamic Question Engine:

```text
QuestionSet → marriage_hindu
QuestionSet → marriage_muslim
QuestionSet → marriage_christian
```

The `User.marriageSubCategory` enum field routes the user to the correct question set during onboarding.

No new tables are introduced for Marriage.

---

## Question Sets (Marriage)

Existing and unchanged:

| Question Set Key | Sub-category |
|---|---|
| `marriage_core` | All Marriage users |
| `marriage_hindu` | Hindu sub-category |
| `marriage_muslim` | Muslim sub-category |
| `marriage_christian` | Christian sub-category |

---

# LOVE QUESTION SETS (V5 REVISION)

In V4, Love used `love_core` with generic questions.

In V5, Love uses a structured 25-question MCQ set:

| Question Set Key | Purpose |
|---|---|
| `love_basic_info` | Height, Education, Occupation (3 questions) |
| `love_personality` | Personality trait mapping (4 questions) |
| `love_communication` | Communication style mapping (3 questions) |
| `love_values` | Core values mapping (4 questions) |
| `love_life_goals` | Life goals mapping (3 questions) |
| `love_lifestyle` | Lifestyle compatibility (4 questions) |
| `love_love_language` | Love language (2 questions) |
| `love_deal_breakers` | Deal breakers (2 questions) |

All answers are stored in `UserAnswer` (the existing dynamic engine).

The backend then processes these answers to populate `UserInsightProfile`.

---

# CATEGORY → FEATURE AVAILABILITY MAP

| Feature | Love | Marriage | Casual | Roommate |
|---|---|---|---|---|
| Insight Report | YES | NO | NO | NO |
| Sync Report | YES | NO | NO | NO |
| Spark | YES | NO | NO | NO |
| Sub-categories | NO | YES | NO | NO |
| Religion-specific questions | NO | YES | NO | NO |
| User Prompts | YES | NO | YES | NO |
| Marriage Timeline | NO | YES | NO | NO |
| Kundli / Hijab / Church questions | NO | YES | NO | NO |

> Enforcement: Backend API endpoints for Insight, Sync, and Spark must validate `User.category === LOVE` and return `403 Forbidden` for non-Love users.

---

# UPDATED CATEGORY SPECIFIC ONBOARDING

## LOVE

Question Sets:

```text
love_basic_info
love_personality
love_communication
love_values
love_life_goals
love_lifestyle
love_love_language
love_deal_breakers
```

Structured storage:

```text
UserInsightProfile   ← derived from MCQ answers
UserAnswer           ← raw answers stored here
InsightReport        ← generated from UserInsightProfile
```

Prompts:

```text
UserPrompt still used for profile display prompts
(e.g. "My ideal Sunday is...", "The green flag I look for is...")
```

---

## MARRIAGE

Question Sets:

```text
marriage_core
marriage_hindu      (routed via User.marriageSubCategory)
marriage_muslim
marriage_christian
```

Stored In:

```text
UserPreference
UserAnswer
```

---

# SYNC REPORT COMPUTATION LOGIC

```text
1. User A opens User B's profile.

2. Frontend requests GET /sync/:userId1/:userId2

3. Backend checks:
   a. Does User A have a completed UserInsightProfile? → if NO: return SyncStatus.PENDING
   b. Does User B have a completed UserInsightProfile? → if NO: return SyncStatus.PENDING

4. Check if a SyncReport already exists for (userId1, userId2):
   a. Exists + COMPUTED + not STALE → return cached report
   b. Exists + STALE → recompute
   c. Does not exist → compute

5. Computation inputs:
   UserInsightProfile(A) + UserInsightProfile(B)
   → Shared interests (from UserInterest)
   → Value alignment (from coreValues JSON comparison)
   → Communication match (from communicationStyleLabel)
   → Life goals alignment (from lifeGoalsSummary comparison)
   → Generate conversation starters (AI or template-based)

6. Store result in SyncReport and return.
```

---

# INSIGHT REPORT GENERATION LOGIC

```text
1. Triggered when:
   a. User completes their UserInsightProfile for the first time.
   b. User updates their UserInsightProfile.

2. Inputs:
   UserInsightProfile(userId)

3. Outputs:
   InsightReport:
   - personalityTraits (scored 0-100 per trait)
   - communicationStyleLabel
   - loveLanguageLabel
   - coreValuesDisplay
   - lifeGoalsSummary

4. Stored in InsightReport linked to userId.

5. Visible to ALL visitors of the user's profile (no access restriction).
```

---

# UPDATED ONBOARDING STORAGE MAP

## Profile (unchanged)

```text
Name, DOB, Gender, Location, Education, Occupation, Height, Religion, Mother Tongue
```

## UserInsightProfile (Love only — NEW)

```text
Height Range
Education Level
Occupation Type
Personality Trait Scores
Communication Style Label
Conflict Approach
Core Values
Life Goals
Lifestyle Fields
Love Language (Receiving + Giving)
Deal Breakers
```

## UserAnswer (all categories)

```text
All dynamic question answers
(love_* sets + marriage_* sets)
```

## SparkQuestion (Love only — NEW)

```text
3 custom questions set by user for their profile visitors
```

---

# FUTURE TABLES UPDATE (V5)

In V4, `SuperLike` was listed as a future table.

In V5, **SuperLike is replaced by Spark** for the Love category.

Marriage retains a conventional Like/Dislike swipe model with no special interaction type.

Updated future tables:

```text
Match
Swipe
Conversation
Message
Subscription
PremiumFeature
Boost
Block
Report
ModerationAction
VerificationDocument
Notification
UserDevice
AnalyticsEvent
```

Removed from future:
```text
SuperLike     ← replaced by Spark (already modelled in V5)
```

---

# NEW INDEXES (V5 ADDITIONS)

## User

```text
marriageSubCategory
```

## SyncReport

```text
userId1
userId2
status
```

## Spark

```text
senderId
receiverId
status
```

## UserInsightProfile

```text
userId
loveLanguageReceiving
```

---

# SCHEMA FREEZE RULES (V5 UPDATE)

The V5 schema is considered ready for implementation when:

1. All V4 freeze rules are satisfied.
2. `UserInsightProfile` covers all 25 MCQ question outputs.
3. `InsightReport` is generatable without schema changes.
4. `SyncReport` is computable from two `UserInsightProfile` records.
5. `SparkQuestion` + `Spark` + `SparkAnswer` cover the full Spark interaction flow.
6. Marriage sub-category routing works via `User.marriageSubCategory` without new tables.
7. Feature availability is enforced at the API layer using `User.category`.
8. No Love-exclusive feature ever needs a schema change to add new content variants.

---

# MIGRATION NOTES (V4 → V5)

| Migration Step | Action |
|---|---|
| Add `User.marriageSubCategory` | `ALTER TABLE` — nullable, safe |
| Create `UserInsightProfile` | New table — no data migration needed |
| Create `InsightReport` | New table — populated by backend job |
| Create `SyncReport` | New table — computed on demand |
| Create `SparkQuestion` | New table — users fill post-launch |
| Create `Spark` | New table — replaces SuperLike in Love |
| Create `SparkAnswer` | New table |
| Add `LoveLanguage` enum | New enum |
| Add `MarriageSubCategory` enum | New enum |
| Add `SparkStatus` enum | New enum |
| Add `SyncStatus` enum | New enum |
| Backfill existing Love users | Prompt to complete `UserInsightProfile` |
| Remove Love sub-categories from frontend | No DB change needed |

All migrations are **additive only**.

No existing V4 tables are dropped or altered destructively.
