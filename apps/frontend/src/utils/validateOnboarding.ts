import { useAuthStore } from '@/hooks/useAuthStore';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';

/**
 * Checks if onboarding data is fully complete.
 *
 * Required fields across both stores:
 *  AuthStore  → user.email, user.phoneNumber
 *  OnboardingStore → firstName, lastName, gender, dateOfBirth, category
 *
 * Returns true  → all data is present, user can proceed to home
 * Returns false → something is missing, caller should wipe + redirect to login
 */
export function isOnboardingComplete(): boolean {
  const { user, onboardingCompleted } = useAuthStore.getState();
  const { firstName, lastName, gender, dateOfBirth, category } =
    useOnboardingStore.getState();

  // 1. onboarding flag must be set
  if (!onboardingCompleted) return false;

  // 2. user must exist with email (Google sign-in verified)
  if (!user || !user.email || user.email.trim() === '') return false;

  // 3. verified phone number (OTP step)
  if (!user.phoneNumber || user.phoneNumber.trim() === '') return false;

  // 4. personal details
  if (!firstName || firstName.trim() === '') return false;
  if (!lastName || lastName.trim() === '') return false;
  if (!gender || gender.trim() === '') return false;
  if (!dateOfBirth) return false;

  // 5. category chosen
  if (!category) return false;

  return true;
}

/**
 * Wipes all auth and onboarding state.
 * Call this when onboarding is found to be incomplete.
 */
export function wipeIncompleteOnboarding(): void {
  useOnboardingStore.getState().reset();
}
