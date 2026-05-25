import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function IndexScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);

  // User completed full onboarding → go straight to home
  if (onboardingCompleted) {
    return <Redirect href="/(tabs)/home" />;
  }

  // User is authenticated but hasn't completed onboarding → resume from OTP/details
  if (isAuthenticated) {
    return <Redirect href="/otp" />;
  }

  // Fresh user → login
  return <Redirect href="/login" />;
}
