import { Stack } from "expo-router";

// Route group for the 4-step onboarding flow.
// Parentheses mean this folder name does NOT appear in the URL.
// /login, /otp, /details, /category all work as before.
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
  );
}
