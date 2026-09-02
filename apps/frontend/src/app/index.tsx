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
  const firstName = useOnboardingStore((s) => s.firstName);
  const category = useOnboardingStore((s) => s.category);

  const marriageProgress = useOnboardingStore((s) => s.marriageProgress);

  // 1. If backend says we are fully onboarded, go to home
  if (user?.onboardingStep === 'COMPLETED') {
    return <Redirect href="/(tabs)/home" />;
  }

  // 2. If category is selected but flow is not completed
  if (user?.onboardingStep === 'CATEGORY_DONE') {
    const isMarriage = category === 'MARRIAGE' || user?.category === 'MARRIAGE';
    const isLove = category === 'LOVE' || user?.category === 'LOVE';

    if (isLove) return <Redirect href="/(tabs)/home" />;
    
    if (isMarriage) {
      if (marriageProgress === 'INTERESTS') {
        return <Redirect href="/(onboarding)/marriage-interests" />;
      }
      return <Redirect href="/(onboarding)/marriage-details" />;
    }
    
    // Fallback if category somehow isn't known
    return <Redirect href="/(onboarding)/category" />;
  }

  // 3. If backend says details are done but category isn't
  if (user?.onboardingStep === 'DETAILS_DONE') {
    return <Redirect href="/(onboarding)/category" />;
  }



  // 4. Not authenticated at all
  if (!accessToken && !user) {
    console.log("Redirecting to landing because user is not authenticated");
    return <Redirect href="/(onboarding)/landing" />;
  }

  // 5. Authenticated (PHONE_VERIFIED) but details not done
  if (user?.onboardingStep === 'PHONE_VERIFIED' || !firstName) {
    return <Redirect href="/(onboarding)/details" />;
  }

  // 6. Fallback
  return <Redirect href="/(onboarding)/category" />;
}