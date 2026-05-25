# Dating App Architecture

A production-grade React Native + Expo dating app with comprehensive auth flow, state management, and scalable architecture.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Expo 55 + React Native
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with AsyncStorage persistence
- **Forms**: React Hook Form + Zod validation
- **Auth**: Firebase (Google OAuth + Phone OTP)
- **Styling**: React Native StyleSheet + NativeWind
- **HTTP Client**: Axios
- **Data Fetching**: React Query (TanStack Query)
- **Date/Time**: @react-native-community/datetimepicker
- **Type Safety**: TypeScript (strict mode)

## 📁 Folder Structure

```
src/
├── app/                          # Expo Router screens & navigation
│   ├── _layout.tsx              # Root layout with auth guards
│   ├── index.tsx                # Entry point → redirects to login
│   ├── login.tsx                # Google/Apple/X sign-in
│   ├── otp.tsx                  # Phone OTP verification (2-step)
│   ├── details.tsx              # User details onboarding
│   ├── category.tsx             # Category selection
│   └── explore.tsx              # Tabs layout with home screen
│   └── home.tsx                 # Home screen
│
├── hooks/                       # Custom hooks & Zustand stores
│   ├── useAuthStore.ts          # Auth state (Zustand + persist)
│   ├── useOnboardingStore.ts    # Onboarding state (Zustand + persist)
│   ├── usePhoneAuthStore.ts     # Phone auth state (non-persisted)
│   ├── authService.ts           # Firebase auth functions
│   └── storage.ts               # Storage utilities
│
├── components/                  # Reusable UI components
│   ├── Button.tsx               # Primary, secondary, outline variants
│   ├── Input.tsx                # Form input with validation
│   ├── Loader.tsx               # Loading spinner
│   ├── ScreenWrapper.tsx        # Safe area + keyboard handling
│   ├── toast.ts                 # Toast notifications
│   └── [existing components]
│
├── types/                       # TypeScript interfaces (future expansion)
│   └── index.ts                 # Type definitions
│
├── lib/                         # Library setup (future: services)
│   └── firebase.ts              # Firebase initialization
│
├── theme/                       # Design tokens (future expansion)
│   └── colors.ts                # Color palette
│
└── utils/                       # Helper functions (future expansion)
    ├── validation.ts            # Form validation helpers
    └── constants.ts             # App constants
```

## 🔐 Auth Flow

### 1. Login Screen (`/login`)
- **Entry Point**: User sees black background with app name
- **Options**:
  - ✅ **Google** (functional): Firebase Google OAuth
  - ❌ **Apple** (disabled): Shows toast "Coming soon"
  - ❌ **X** (disabled): Shows toast "Coming soon"
- **Next**: Routes to `/otp` on successful Google sign-in

### 2. Phone OTP (`/otp`)
- **Step 1**: Enter phone number
  - Validation: min 10 digits, valid E.164 format
  - Button triggers Firebase `sendOTP()`
  - Shows loading state
- **Step 2**: Enter 6-digit OTP code
  - Auto-masked input (numbers only)
  - Button triggers Firebase `verifyOTP()`
  - Can go back to change phone
- **Next**: Routes to `/details` after successful verification

### 3. User Details (`/details`)
- **Form Fields**:
  - First Name (required)
  - Last Name (required)
  - Date of Birth (date picker, min 18 years old)
- **Validation**: React Hook Form + Zod
- **Persistence**: Zustand onboarding store
- **Next**: Routes to `/category`

### 4. Category Selection (`/category`)
- **Options** (single selection):
  - ❤️ **Love**: Looking for serious relationship
  - 💍 **Marriage**: Ready for commitment
  - 😊 **Casual**: Just connecting
- **Validation**: Can't proceed without selection
- **Persistence**: Zustand store
- **Next**: Routes to `/explore` (tabs)

### 5. Home Screen (`/explore`)
- **Display**: User profile summary
- **Data shown**:
  - Personalized greeting with first name
  - User profile info (name, category)
  - Email address
  - Placeholder message for upcoming features

## 🎯 State Management

### Auth Store (`useAuthStore`)
**Location**: `src/hooks/useAuthStore.ts`
```typescript
{
  user: User | null,           // Firebase user object
  accessToken: string | null,  // JWT token
  isAuthenticated: boolean,    // Auth state flag
  isLoading: boolean,          // Loading state
  error: string | null,        // Error messages
  onboardingCompleted: boolean // Completion flag
}
```
**Persistence**: ✅ Persisted with AsyncStorage (key: `auth-storage`)

### Onboarding Store (`useOnboardingStore`)
**Location**: `src/hooks/useOnboardingStore.ts`
```typescript
{
  firstName: string,
  lastName: string,
  dateOfBirth: string | null,  // ISO format
  category: 'love' | 'marriage' | 'casual' | null
}
```
**Persistence**: ✅ Persisted with AsyncStorage (key: `onboarding-storage`)

### Phone Auth Store (`usePhoneAuthStore`)
**Location**: `src/hooks/usePhoneAuthStore.ts`
```typescript
{
  phoneNumber: string,
  verificationId: string | null,
  isCodeSent: boolean,
  isVerifying: boolean,
  error: string | null
}
```
**Persistence**: ❌ NOT persisted (ephemeral)

## 🎨 Reusable Components

### Button
**Usage**: All CTA and action buttons
```tsx
<Button
  title="Continue"
  onPress={handlePress}
  variant="primary"      // 'primary' | 'secondary' | 'outline'
  loading={isLoading}
  disabled={!isValid}
/>
```

### Input
**Usage**: Text inputs with validation
```tsx
<Input
  label="First Name"
  placeholder="Enter name"
  value={value}
  onChangeText={onChange}
  error={fieldState.error?.message}
/>
```

### Loader
**Usage**: Full-screen loading indicator
```tsx
<Loader size="large" color="#000" />
```

### ScreenWrapper
**Usage**: Screen container with safe area, keyboard handling
```tsx
<ScreenWrapper backgroundColor="#000" scrollable>
  {/* Content */}
</ScreenWrapper>
```

## 🔌 Firebase Integration

**Config**: `src/lib/firebase.ts`
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBaVODoexERlLvNWS6G1YFoj4EMu3odAms",
  authDomain: "dating-app-1ce2c.firebaseapp.com",
  projectId: "dating-app-1ce2c",
  // ... rest of config
};
```

**Services**: `src/hooks/authService.ts`
- `signInWithGoogle()` → Returns JWT token
- `sendPhoneOTP(phoneNumber)` → Sends OTP via Firebase
- `verifyPhoneOTP(verificationId, otp)` → Verifies code
- `signOut()` → Logs out user
- `getCurrentUser()` → Returns current Firebase user
- `onAuthChange(callback)` → Listens to auth state

## 🔄 Navigation Flow

```
/login
  ↓ (Google sign-in)
/otp
  ↓ (Phone verified)
/details
  ↓ (Details saved)
/category
  ↓ (Category selected)
/explore (Tabs)
  └── /home (Home screen)
```

**Route Protection**: Handled in `_layout.tsx` based on:
- `isAuthenticated` flag
- `onboardingCompleted` flag

## 📱 UI/UX Details

### Color Scheme
- **Auth/Onboarding**: Black background (#000) with white text
- **Home**: White background (#fff) with dark text
- **Buttons**: Black primary, outline variants
- **Borders**: Light gray (#ddd) for inputs, (#333) for cards

### Loading States
- All async actions show loading states
- Buttons disable during submission
- Inputs disable during submission

### Validation
- Phone: E.164 format (e.g., +1 5551234567)
- OTP: Exactly 6 digits
- Names: Non-empty strings
- DOB: ISO format, minimum 18 years old

### Error Handling
- Form validation errors displayed inline
- Toast notifications for API errors
- Graceful error recovery

## 🚀 Getting Started

### Prerequisites
```bash
node>=18
npm or yarn
expo-cli
```

### Installation
```bash
npm install
```

### Running
```bash
npm start
# Press 'a' for Android, 'i' for iOS, 'w' for web
```

### Lint & Type Check
```bash
npm run lint
```

## 🔮 Future Enhancements

### Phase 2: Core Features
- [ ] Profile picture upload
- [ ] Profile browsing/swiping
- [ ] Messaging system
- [ ] Match notifications
- [ ] User preferences filtering

### Phase 3: Advanced
- [ ] Location-based matching
- [ ] Video calls integration
- [ ] Payments (premium features)
- [ ] Analytics
- [ ] Push notifications

### Phase 4: Optimization
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Performance monitoring
- [ ] A/B testing

## 📚 Key Patterns & Best Practices

### Type Safety
- **No `any` types**: All values properly typed
- **Zod schemas**: Runtime validation for forms
- **Strict mode**: TypeScript strict compilation

### Performance
- **Zustand**: Minimal re-renders with selector pattern
- **React Query**: Caching & request deduplication
- **Lazy Loading**: Route components code-split by Expo Router

### State Management
- **Zustand > Context**: Simpler, more performant
- **Persistence**: AsyncStorage for critical data (auth, onboarding)
- **Separation**: Auth & onboarding in separate stores

### Navigation
- **Expo Router**: File-based routing (Next.js-like)
- **Route Guards**: Conditional rendering in root layout
- **Type-safe**: Typed routes via `expo-router`

### Error Handling
- **Try-catch**: All async operations wrapped
- **User Feedback**: Toast notifications for errors
- **Graceful Degradation**: Error states don't crash app

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 8081
netstat -ano | findstr :8081
# Kill it
taskkill /PID <PID> /F
```

### Modules Not Found
```bash
npm install
npm start -- --clear
```

### Firebase Config Issues
- Verify config in `src/lib/firebase.ts`
- Check Firebase console project settings
- Ensure Google OAuth is enabled

## 📄 License

Proprietary - Startup Dating App Foundation

## 👨‍💻 Developer Notes

- All screens use strict TypeScript - no implicit `any`
- Components are stateless where possible
- Business logic isolated in hooks and services
- Navigation flows defined in root `_layout.tsx`
- Forms always use React Hook Form + Zod combo
- AsyncStorage used for persistence (not Redux/persist)
