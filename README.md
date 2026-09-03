# Amora - Dating & Matrimony Platform

A modern, dual-purpose dating and matrimony platform. The application allows users to choose between a "Love" (casual dating/relationship) path and a "Marriage" (matrimony) path, tailoring the onboarding, profile details, and matching experience accordingly.

## 🏗 Architecture

This project is a monorepo managed with `pnpm` workspaces, containing two main applications:

### 1. Frontend (`apps/frontend`)
- **Framework**: React Native with Expo (SDK 55) & Expo Router
- **State Management**: Zustand (Auth, Onboarding, Chat stores)
- **Forms & Validation**: React Hook Form + Zod
- **Authentication**: Firebase Phone Auth
- **Real-time**: `socket.io-client` for live chat
- **Styling**: Custom Theme (`@/theme/theme.ts`) with responsive design
- **Animations**: `moti`, `react-native-reanimated`

### 2. Backend (`apps/backend`)
- **Framework**: NestJS (running on Fastify)
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Real-time**: `@nestjs/websockets` + Socket.io
- **Storage**: AWS S3 (via `@aws-sdk/client-s3` for pre-signed URL uploads)
- **Security**: JWT Authentication, Helmet, CORS

---

## 🚀 Features Implemented (Current Progress)

### Authentication & Onboarding
- **Firebase Phone Login**: Secure OTP verification.
- **Dynamic Onboarding Engine**:
  - Name, DOB (with auto-formatting), Gender (Male/Female).
  - **Path Selection**: Users choose **Love** or **Marriage**.
  - **Love Path**: Asks for "Spark Questions" (icebreakers) and lifestyle interests.
  - **Marriage Path**: Deep dive into Family Background (Income, Type, Siblings), Religion, Education, and specific Partner Preferences.
- **Media Upload**: Direct-to-S3 photo uploads using presigned URLs from the backend.

### Core Application
- **Dynamic Profiles**: The profile screen adapts its tabs (`BIO`, `SPARK`, `FAMILY`, `PREFERENCES`) based on the user's chosen category.
- **Real-time Chat**: Fully functional socket.io chat.
  - Inbox listing matches and latest messages.
  - Smart avatar fallbacks (male/female default images) if users haven't uploaded photos.
- **Settings**: Premium UI for account management, logout, and account deletion.

---

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v20+ recommended)
- `pnpm` package manager
- PostgreSQL (running locally or via Docker)
- Android Studio / Xcode (for running mobile apps natively)

### 1. Install Dependencies
Run this in the root of the project to install packages for both frontend and backend:
```bash
pnpm install
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd apps/backend
```
1. Create a `.env` file (ask the team for the keys, requires Postgres URL, JWT Secret, AWS S3 keys).
2. Generate Prisma Client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
3. Start the server:
   ```bash
   pnpm run start:dev
   ```
*The backend runs on `http://localhost:3000` by default.*

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd apps/frontend
```
1. Create a `.env` file containing the backend API URL and Firebase Config (ask the team for the config).
2. Start the Expo development server:
   ```bash
   pnpm run start
   ```
3. Or, build and run natively on Android/iOS (recommended for full performance):
   ```bash
   pnpm run android
   # or
   pnpm run ios
   ```

---

## 📱 Generating an APK (Local Build)

If you need to quickly test the app on a physical Android device without setting up EAS Cloud:

1. Ensure you have the `android` directory generated (running `pnpm run android` does this).
2. Run the Gradle release build:
   ```bash
   cd apps/frontend/android
   ./gradlew assembleRelease
   ```
3. Grab your compiled APK from:
   `apps/frontend/android/app/build/outputs/apk/release/app-release.apk`
4. Install via ADB:
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

---

## 📝 Next Steps / To-Do
- Finalize the Matching Engine (Swipe mechanics & backend match logic).
- Group chats/Socials tab implementation.
- Premium Coins & Wallet features completion.
- Push Notifications integration.
