# Backend Service-Layer Invariants Checklist

This checklist tracks the critical database invariants and business rules that **must** be enforced by the backend service/API layer. Because Prisma/PostgreSQL does not natively support some of these complex cross-table validations or partial unique constraints, our application logic acts as the final gatekeeper.

## 1. Profile Category Consistency (`LOVE` vs `MARRIAGE`)
- [ ] **Enforce Mutual Exclusion:** When a user sets `category = LOVE`, they must have a `LoveProfile` and must **not** have a `MarriageProfile`.
- [ ] **Enforce Mutual Exclusion:** When a user sets `category = MARRIAGE`, they must have a `MarriageProfile` and must **not** have a `LoveProfile`.
- [ ] **Data Cleanup on Category Switch:** If a user is allowed to switch categories in the future, the backend must soft-delete or securely archive the opposing profile data.

## 2. AI Compatibility Versioning & Determinism
- [ ] **Atomic Version Increments:** Whenever a user updates their 25 MCQ answers (or similar AI-input data), their `Profile.compatibilityVersion` must be incremented atomically in the same database transaction.
- [ ] **STALE Invalidation:** In that same transaction, update `status = STALE` for their `InsightReport` and all associated `SyncReport`s where they are either `ProfileA` or `ProfileB`.
- [ ] **Version Binding:** When generating a new report, the AI jobs must lock the current profile versions and explicitly write them to `sourceProfileVersion` (or `profileAVersion`/`profileBVersion`) when saving the `COMPLETED` report to prevent race conditions from mismatches.

## 3. Sync Report Canonical Ordering
- [ ] **Lexicographical Sorting:** When creating or querying a `SyncReport`, `profileOneId` (or `profileAId`) must **always** be the lexicographically smaller UUID.
- [ ] **Match/Interaction Sorting:** Apply the exact same canonical ordering logic to `Match` creation to ensure no duplicate `(A, B)` and `(B, A)` rows exist.

## 4. Spark Workflow & Version Ownership
- [ ] **Question Ownership Validation:** Before writing `SparkAnswer`s, the backend must verify that every `questionId` submitted belongs to the exact `sparkProfileVersionId` being targeted.
- [ ] **Version Targeting:** The backend must verify that the `sparkProfileVersionId` provided in the submission legitimately belongs to the target's `SparkProfile`.
- [ ] **Resubmission Handling:** If `allowResubmission = true`, the backend must gracefully soft-delete the older `SparkSubmission` row for the pair before inserting the new one. If `false`, it must reject the new submission.

## 5. Profile Photos
- [ ] **Single Primary Photo:** The backend must ensure that only **one** `ProfilePhoto` per profile has `isPrimary = true` at any given time. Setting a new primary photo must unset the previous one in a single transaction.

## 6. Matches and Interactions
- [ ] **Rematching Support:** Since the `Match` table uses `@@index` instead of `@@unique` to allow for future rematching, the backend must ensure that it only creates a new `Match` if the previous match is confirmed to have `unmatchedAt` populated (i.e. is soft-deleted). Active matches shouldn't be duplicated.
