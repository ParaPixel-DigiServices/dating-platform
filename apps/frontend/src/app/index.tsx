import React from "react";
import { Redirect } from "expo-router";

import { useAuthStore } from "@/hooks/useAuthStore";

export default function IndexScreen() {
  const accessToken =
    useAuthStore(
      (s) => s.accessToken,
    );

  const onboardingStatus =
    useAuthStore(
      (s) => s.onboardingStatus,
    );

  if (!accessToken) {
    return (
      <Redirect
        href="/(onboarding)/login"
      />
    );
  }

  switch (onboardingStatus) {
    case "NOT_STARTED":
      return (
        <Redirect
          href="/(onboarding)/details"
        />
      );

    case "IN_PROGRESS":
      return (
        <Redirect
          href="/(onboarding)/details"
        />
      );

    case "COMPLETED":
      return (
        <Redirect
          href="/(tabs)/home"
        />
      );

    default:
      return null;
  }
}