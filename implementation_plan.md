# Backend Auth Completion & Initial Seeding

This plan covers Step 1.1 (Auth Completion) and Step 1.2 (Database Seeding) from the `backend_roadmap.md`. By completing this, the backend will have a fully functioning authentication perimeter and base lookup data, enabling all protected routes.

## User Review Required

Please review the proposed endpoints and confirm they align with the frontend's expectations before I proceed with the implementation.

## Proposed Changes

### 1. Database Seeding (`prisma/seed.ts`)
We will create a database seed script to populate essential lookup tables that are referenced by other models.
- **Religions:** Hindu, Muslim, Christian, Sikh, etc.
- **Languages:** English, Hindi, Tamil, etc.
- **Interests:** Travel, Music, Fitness, etc.
- Add `prisma/seed.ts` and wire it up in `package.json` (`prisma.seed`).

---

### 2. Auth Strategies & Guards (`src/auth/`)

#### [NEW] [jwt.strategy.ts](file:///home/anonymous/Downloads/dap/dating-platform/apps/backend/src/auth/strategies/jwt.strategy.ts)
- Implements `PassportStrategy(Strategy, 'jwt')`.
- Validates the `accessToken` using `JWT_ACCESS_SECRET`.
- Extracts the `sub` (userId) and returns it in `req.user`.

#### [NEW] [jwt-auth.guard.ts](file:///home/anonymous/Downloads/dap/dating-platform/apps/backend/src/auth/guards/jwt-auth.guard.ts)
- Extends `AuthGuard('jwt')` to protect routes.

#### [MODIFY] [auth.module.ts](file:///home/anonymous/Downloads/dap/dating-platform/apps/backend/src/auth/auth.module.ts)
- Register `PassportModule`.
- Provide `JwtStrategy`.

---

### 3. Auth Service Updates (`src/auth/auth.service.ts`)

#### [MODIFY] [auth.service.ts](file:///home/anonymous/Downloads/dap/dating-platform/apps/backend/src/auth/auth.service.ts)
- Add `logout(userId: string, sessionId: string)`:
  - Revokes the session by setting `revokedAt = new Date()`.
- Add `refreshToken(refreshToken: string)`:
  - Validates the refresh token hash against the `Session` table.
  - Generates new access and refresh tokens.
  - Updates the `Session` with the new refresh token hash and `lastUsedAt`.
- Add `getMe(userId: string)`:
  - Fetches the user profile and essential details using the database.

---

### 4. Auth Controller Updates (`src/auth/auth.controller.ts`)

#### [MODIFY] [auth.controller.ts](file:///home/anonymous/Downloads/dap/dating-platform/apps/backend/src/auth/auth.controller.ts)
- Change `@Post('firebase')` to `@Post('firebase-login')` to match frontend calls.
- Add `@UseGuards(JwtAuthGuard)` protected routes:
  - **`GET /me`**: Returns current logged-in user context.
  - **`POST /logout`**: Accepts an empty body and revokes the current session from the JWT payload.
- Add unprotected route:
  - **`POST /refresh`**: Accepts `{ refreshToken: string }` and issues new tokens.

## Verification Plan

### Automated Tests
- I will run `npm run lint` and `npm run build` in `apps/backend` to ensure the new code compiles correctly.
- Ensure `npx prisma db seed` successfully populates the database.

### Manual Verification
- You can test these endpoints from the frontend or using tools like cURL/Postman:
  - Successful token generation on login.
  - Requesting `/auth/me` with a valid JWT token.
  - Requesting `/auth/refresh` to get a new pair of tokens.
  - Requesting `/auth/logout` and confirming the session is marked as revoked in the database.
