# AMORA DATA MODEL V2

## Onboarding Field Mapping Matrix

---

# SECTION 1 — ACCOUNT

| Question      | Destination         |
| ------------- | ------------------- |
| First Name    | Profile.firstName   |
| Last Name     | Profile.lastName    |
| Date Of Birth | Profile.dateOfBirth |
| Gender        | Profile.gender      |
| Category      | User.category       |

---

# SECTION 2 — BASIC PROFILE

| Question          | Destination                |
| ----------------- | -------------------------- |
| Profile Photos    | UserPhoto                  |
| Bio               | Profile.bio                |
| Current Location  | Profile.city/state/country |
| Education         | EducationLevel             |
| Qualification     | Profile.qualification      |
| Occupation        | Profile.occupation         |
| Annual Salary     | Profile.annualSalary       |
| Family Income     | Profile.familyIncome       |
| Assets            | Profile.assets             |
| Height            | Profile.heightCm           |
| Languages Spoken  | UserLanguage               |
| Mother Tongue     | Profile.motherTongue       |
| Religion          | Religion                   |
| Caste / Community | Profile.caste              |

---

# SECTION 3 — LIFESTYLE

| Question           | Destination       |
| ------------------ | ----------------- |
| Diet Preference    | UserCompatibility |
| Smoking Habit      | UserCompatibility |
| Drinking Habit     | UserCompatibility |
| Fitness Importance | UserCompatibility |
| Pets Preference    | UserCompatibility |

---

# SECTION 4 — PERSONALITY

| Question                   | Destination       |
| -------------------------- | ----------------- |
| Introvert / Extrovert      | UserCompatibility |
| Morning Person / Night Owl | UserCompatibility |
| Communication Style        | UserCompatibility |
| Conflict Resolution Style  | UserCompatibility |
| Social Level               | UserCompatibility |
| Cleanliness Level          | UserCompatibility |

---

# SECTION 5 — INTERESTS

| Question           | Destination  |
| ------------------ | ------------ |
| Selected Interests | UserInterest |

Maximum:

10 Interests

---

# SECTION 6 — GLOBAL MATCHING PREFERENCES

| Question             | Destination       |
| -------------------- | ----------------- |
| Family Importance    | UserCompatibility |
| Religion Importance  | UserCompatibility |
| Tradition Importance | UserCompatibility |
| Respect For Elders   | UserCompatibility |
| Parenting Philosophy | UserCompatibility |
| Travel Importance    | UserCompatibility |
| Loyalty Importance   | UserCompatibility |
| Independence Level   | UserCompatibility |
| Career Importance    | UserCompatibility |

---

# SECTION 7 — MARRIAGE

Core marriage questions should remain queryable.

| Question                 | Destination       |
| ------------------------ | ----------------- |
| Marriage Timeline        | UserCompatibility |
| Want Children            | UserCompatibility |
| Relocation               | UserCompatibility |
| Long Distance            | UserCompatibility |
| Marital Status           | UserCompatibility |
| Family Type              | UserCompatibility |
| Parents Consent          | UserCompatibility |
| Financial Responsibility | UserCompatibility |
| Anger Management         | UserCompatibility |
| Travel Interest          | UserCompatibility |

Everything else:

Question Engine

---

# SECTION 8 — LOVE

Story prompts are profile content.

Destination:

UserPrompt

Examples:

* quickest_way_to_my_heart
* i_feel_most_alive_when
* people_are_surprised_when
* perfect_date
* relationship_value
* love_language
* green_flag
* build_together

Compatibility questions:

UserCompatibility

Examples:

* long_term_relationship
* open_to_marriage
* want_children
* relocation
* long_distance

---

# SECTION 9 — CASUAL

Core Compatibility:

UserCompatibility

Examples:

* exclusivity
* friendship_first
* emotional_connection
* communication_frequency

Profile Content:

UserPrompt

Examples:

* biggest_green_flag
* biggest_red_flag
* biggest_misconception
* deal_breakers

Sensitive Casual Data:

Question Engine

Reason:

Private
Opt-In
Potential Legal/Safety Concerns

---

# SECTION 10 — ROOMMATE

Core Matching:

UserCompatibility

Examples:

* cleanliness
* sleep_schedule
* guest_frequency
* grocery_sharing
* smoking_at_home
* alcohol_at_home

Extended Preferences:

Question Engine

Examples:

* last_slice_of_pizza
* spontaneous_or_planned
* ideal_evening

---

# SECTION 11 — RELIGION MODULES

Never create:

* HinduProfile
* MuslimProfile
* ChristianProfile

All religion modules become:

Question
QuestionOption
UserAnswer

Examples:

hindu.kundli_matching

muslim.hijab_preference

christian.church_attendance

---

# QUESTION ENGINE

Question

QuestionOption

UserAnswer

Purpose:

Store all dynamic onboarding data.

No schema migration required when Product Team adds new questions.

---

# USERCOMPATIBILITY

Stores all frequently queried matching signals.

Purpose:

* Matchmaking
* Search Filters
* Recommendation Ranking
* AI Compatibility Engine

This table should contain only fields that are:

* Frequently filtered
* Frequently scored
* Frequently ranked

Everything else belongs in Question Engine.

---

# FINAL V2 TABLES

Core:

* User
* Profile
* Session
* VerificationStatus

Lookup:

* Religion
* Language
* Interest
* EducationLevel

Relations:

* UserLanguage
* UserInterest

Profile Content:

* UserPhoto
* UserPrompt

Matching:

* UserCompatibility

Dynamic:

* Question
* QuestionOption
* UserAnswer

Progress:

* OnboardingProgress

Future:

* Match
* Swipe
* Conversation
* Message
* Subscription
* Report
* Block
* VerificationDocument
* AICompatibilityReport

---

# SCHEMA FREEZE CRITERIA

Before Prisma implementation:

1. Every onboarding question has a destination.
2. No future onboarding question should require a new table.
3. Match engine fields are queryable.
4. Dynamic questions require no migrations.
5. Religion modules remain data-driven.
