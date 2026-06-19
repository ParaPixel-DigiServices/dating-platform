import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";

/**
 * Routing decision tree (matches specified flows):
 *
 * SIGN-UP:   landing → login → OTP → [index] → details → category → home
 * SIGN-IN:   landing → login → [index] → (details → category →) home
 * RESTART:   [index] → home (all local state already populated)
 */
export default function IndexScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const firstName   = useOnboardingStore((s) => s.firstName);
  const category    = useOnboardingStore((s) => s.category);

  // Step 1: Not authenticated — go to landing
  if (!accessToken) {
    return <Redirect href="/(onboarding)/landing" />;
  }

  // Step 2: Authenticated but hasn’t entered basic details yet
  if (!firstName) {
    return <Redirect href="/(onboarding)/details" />;
  }

  // Step 3: Has details but hasn’t chosen a category
  if (!category) {
    return <Redirect href="/(onboarding)/category" />;
  }

  // Step 4: Fully set up — go straight to the main app
  return <Redirect href="/(tabs)/home" />;
}