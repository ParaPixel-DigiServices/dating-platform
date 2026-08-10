# Dating App Architecture (Frontend)

A production-grade React Native + Expo dating app with comprehensive auth flow, state management, and scalable architecture. This document outlines the current state of the frontend, which is currently running on mock data and local stores, awaiting backend integration.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Expo 55 + React Native
- **Navigation**: Expo Router v3 (file-based routing)
- **State Management**: Zustand with AsyncStorage persistence
- **Forms**: React Hook Form + Zod validation
- **Auth**: Firebase (Google OAuth + Phone OTP)
- **Styling**: React Native StyleSheet, LinearGradient, BlurView, Reanimated
- **HTTP Client**: Axios (configured in `services/backendService.ts`)
- **Data Fetching**: React Query (TanStack Query) - *Planned for backend integration*
- **Type Safety**: TypeScript (strict mode)

## 📁 Folder Structure

```
src/
├── app/                          # Expo Router screens & navigation
│   ├── _layout.tsx              # Root layout with auth guards
│   ├── index.tsx                # Entry point
│   ├── (onboarding)/            # Onboarding flow
│   │   ├── landing.tsx          # Initial landing screen
│   │   ├── details.tsx          # Name, DOB, Gender
│   │   ├── category.tsx         # Category selection (Love, Marriage, Casual)
│   │   ├── profile-completion.tsx # 25-question MCQ flow (Modern UI)
│   │   └── profile-completion-v2.tsx # 25-question MCQ flow (Legacy UI)
│   ├── (tabs)/                  # Main app tabs
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── home.tsx             # Swiping deck
│   │   ├── explore.tsx          # Grid view of profiles
│   │   ├── chat.tsx             # Chat list & requests
│   │   ├── social.tsx           # Social feed
│   │   └── profile.tsx          # Current user profile & completion meter
│   ├── chat/[id].tsx            # Chat detail screen
│   ├── call/[id].tsx            # Voice/Video call mock screen
│   ├── spark/[userId].tsx       # Spark question flow for Love category
│   └── user/[id].tsx            # Other user's profile view
│
├── components/                  # Reusable UI components
│   ├── home/                    # Swipeable cards, Action buttons
│   ├── chat/                    # Message bubbles, Chat list items
│   ├── profile/                 # ActivityTabContent, InsightTabContent, SyncTabContent
│   └── ui/                      # BottomNav, standard UI elements
│
├── hooks/                       # Custom hooks & Zustand stores
│   ├── useAuthStore.ts          # Auth state (JWT, Firebase user)
│   ├── useOnboardingStore.ts    # Basic onboarding state
│   ├── useProfileCompletionStore.ts # 25-question MCQ answers & progress
│   ├── useDeckStore.ts          # Swipe deck profiles & state
│   ├── useInteractionStore.ts   # Liked & Sparked profiles (persisted)
│   ├── useSocialStore.ts        # Social feed state
│   └── authService.ts           # Firebase auth wrappers
│
├── services/                    # API clients
│   ├── backendService.ts        # Axios instance with JWT interceptor
│   └── authBootstrap.ts         # Session restoration
│
├── theme/                       # Design tokens & dynamic themes
│   └── theme.js                 # Theme definitions (onboarding, love, marriage, casual)
│
└── utils/                       # Helpers
    └── mockData.ts              # MOCK_PROFILES used while backend is pending
```

## 🔐 Auth & Onboarding Flow

### 1. Authentication
- Firebase Phone OTP and Google Sign-In.
- `backendService.ts` contains `firebaseLogin` to exchange Firebase token for backend JWT.

### 2. Basic Onboarding
- **`/onboarding/details`**: First Name, Last Name, DOB, Gender.
- **`/onboarding/category`**: Selection of `LOVE`, `MARRIAGE`, or `CASUAL`.
  - *Marriage* prompts for religious sub-categories.
  - *Love* routes directly to home.

### 3. Profile Completion (25 MCQ)
- Located at `/onboarding/profile-completion`.
- Users answer 3 Basic and 22 Personality questions.
- Managed by `useProfileCompletionStore.ts`.
- Calculates a completion percentage shown on the Profile tab meter.

## 🎯 State Management (Zustand)

Currently heavily reliant on Zustand to simulate backend persistence:

1. **`useAuthStore`**: Stores JWTs, Firebase user info, onboarding completion flags. Persisted.
2. **`useProfileCompletionStore`**: Stores the user's answers to the 25 MCQ questions and current progress index. Persisted.
3. **`useInteractionStore`**: Stores profiles the user has Liked or Sparked. Populates the "Activity" tab on the profile. Persisted.
4. **`useDeckStore`**: Manages the array of profiles shown on the swiping deck (`home.tsx`). Currently loads from `mockData.ts`.
5. **`useSocialStore`**: Manages mock social posts.

## 🌟 Key Features & Workflows

### The Swiping Deck (`/tabs/home`)
- Custom gesture-based swipe cards (`SwipeableProfileCard`).
- Tapping 'Like' (Right swipe) adds the user to `useInteractionStore`.
- Tapping 'Spark' opens the Spark flow.

### Category Split: Love vs. Marriage
The app architecture fundamentally splits features based on whether the user is in the "Love" (casual/dating) or "Marriage" (matrimony) category. The backend must enforce this separation via flags.

**Love Category Features (Exclusive):**
These 3 features are *only* available to users in the Love category and are completely hidden from Marriage users:
1. **Spark (`/spark/[userId]`)**: Completely replaces the traditional "Super Like" for Love users. Instead of a button press, sending a Spark requires answering 3 custom prompts set by the target user.
2. **Insight Tab**: Found on user profiles. Shows personality traits, love languages, and core values generated from the 25 MCQ answers (visualized with Reanimated bar charts).
3. **Sync Tab (Synchronization)**: Shows a compatibility breakdown (Values, Lifestyle, Communication) between the current user and the viewed profile.

**Marriage Category Features (Exclusive):**
- Does *not* have Spark, Insight, or Sync features.
- Has religion-specific sub-categories chosen during onboarding (Hindu, Muslim, Christian, Sikh, etc.).
- Requires entirely different profile data fields (Marriage Timeline, Family Type, Marital Status) which need specific tables in the backend schema.

### Chat & Calling
- **`/tabs/chat`**: List of matches, likes, and message requests.
- **`/chat/[id]`**: Chat interface. Header includes Voice and Video call buttons.
- **`/call/[id]`**: A rich mock calling screen with pulsing animations, simulated connection steps, and a live duration timer.

## 🔌 API & Integration Status (Pending Backend)

The frontend currently uses mock data, but `services/backendService.ts` is pre-configured to connect to a NestJS backend. 

**Endpoints expected by the Frontend (Needs Backend Implementation):**
- `POST /auth/firebase-login`: Exchange Firebase ID token for JWTs.
- `GET /auth/me`: Restore session on app launch.
- `POST /onboarding/details`: Save name, DOB, gender.
- `POST /onboarding/category`: Save chosen category (and sub-category).
- `GET /discovery/deck`: Fetch profiles for the swipe deck (currently `mockData.ts`).
- `POST /interactions`: Record Like/Pass/Spark.
- `POST /profile/completion`: Persist the 25 MCQ answers.

## 🎨 UI/UX Patterns

- **Glassmorphism**: Heavy use of `BlurView` and translucent `LinearGradient` overlays for a premium, modern feel.
- **Micro-interactions**: React Native Reanimated is used for smooth entering/exiting animations, pulse rings on the call screen, and progress bars.
- **Dynamic Theming**: The app applies different color palettes based on the user's chosen category (Love vs. Marriage).

## 🔮 Future Enhancements (Post-Backend Integration)

1. **Real-time Chat**: Upgrade REST messages to WebSockets.
2. **Push Notifications**: Integrate FCM for match and message alerts.
3. **Photo Uploads**: Connect frontend image picker to backend S3/R2 presigned URLs.
4. **AI Matchmaking**: Replace static Insight/Sync mock data with backend-generated ML insights based on the MCQ answers.
