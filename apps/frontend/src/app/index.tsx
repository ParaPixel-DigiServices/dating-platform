import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";

/**
 * Routing decision tree:
 *
 * SIGN-UP:   landing → login → OTP → details → category → [index] → home
 * SIGN-IN:   landing → login → [index] → home
 * RESTART:   [index] → home (all local state already populated)
 */
export default function IndexScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const firstName   = useOnboardingStore((s) => s.firstName);
  const category    = useOnboardingStore((s) => s.category);

  // Step 1: Onboarding fully completed locally (firstName + category persisted).
  // Check this FIRST so the app works even when there is no live backend session.
  if (firstName && category) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Step 2: Not authenticated and onboarding not complete — go to landing
  if (!accessToken && !user) {
    console.log("Redirecting to landing because user is not authenticated");
    return <Redirect href="/(onboarding)/landing" />;
  }

  // Step 3: Authenticated but hasn't entered basic details yet
  if (!firstName) {
    return <Redirect href="/(onboarding)/details" />;
  }

  // Step 4: Has auth + details but hasn't chosen a category yet
  if (!category) {
    return <Redirect href="/(onboarding)/category" />;
  }

  // Step 5: Fully set up — go straight to the main app
  return <Redirect href="/(tabs)/home" />;
}