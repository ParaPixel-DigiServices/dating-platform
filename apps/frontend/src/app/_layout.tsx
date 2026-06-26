import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { Loader } from '@/components/Loader';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Lato_400Regular,
  Lato_700Bold,
} from '@expo-google-fonts/lato';

import '@react-native-firebase/app';

import { getCurrentUser } from '@/services/authBootstrap';

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);

  const isBootstrapping = useAuthStore(
    (state) => state.isBootstrapping,
  );

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  useEffect(() => {
    const runBootstrap = async () => {
      const {
        accessToken,
        logout,
        setUser,
        setBootstrapping,
      } = useAuthStore.getState();

      if (!accessToken) {
        setBootstrapping(false);
        return;
      }

      try {
        // Validate the stored token is still good and restore the user object.
        // Routing is purely based on local state (firstName + category in
        // useOnboardingStore), so we don't need to touch onboardingStatus here.
        const user = await getCurrentUser();
        setUser({
          id: user.id,
          email: user.email ?? null,
          phoneNumber: user.phoneNumber ?? null,
          displayName: null,
          photoURL: null,
        });
      } catch (error) {
        console.error('Session restore failed:', error);
        // Token is invalid/expired — clear everything and send to landing
        logout();
      } finally {
        setBootstrapping(false);
      }
    };

    const bootstrap = async () => {
      const authHydrated = useAuthStore.persist.hasHydrated();
      const onboardingHydrated = useOnboardingStore.persist.hasHydrated();

      if (!authHydrated || !onboardingHydrated) {
        // Wait for both stores to hydrate, then run the full bootstrap
        let authDone = authHydrated;
        let onboardingDone = onboardingHydrated;

        const tryFinish = () => {
          if (authDone && onboardingDone) {
            setHydrated(true);
            runBootstrap(); // Previously missing — the hydration path never called this!
          }
        };

        const unsubs: (() => void)[] = [];
        if (!authDone) {
          unsubs.push(useAuthStore.persist.onFinishHydration(() => {
            authDone = true;
            tryFinish();
          }));
        }
        if (!onboardingDone) {
          unsubs.push(useOnboardingStore.persist.onFinishHydration(() => {
            onboardingDone = true;
            tryFinish();
          }));
        }
        return () => unsubs.forEach(u => u());
      }

      // Both already hydrated — proceed immediately
      setHydrated(true);
      await runBootstrap();
    };

    bootstrap();
  }, []);

  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const accessToken   = useAuthStore((s) => s.accessToken);
  const firstName     = useOnboardingStore((s) => s.firstName);
  const category      = useOnboardingStore((s) => s.category);

  // Consider onboarding locally complete if both firstName and category are set.
  // This allows the app to work without a live backend session.
  const onboardingDone = !!(firstName && category);

  useEffect(() => {
    if (!hydrated || !fontsLoaded || isBootstrapping || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(onboarding)';

    // Only send to landing if the user has no auth token AND hasn't completed
    // onboarding locally. If local state is populated we can let them through.
    if (!accessToken && !onboardingDone && !inAuthGroup) {
      // router.replace('/(onboarding)/landing');
      router.replace('/(tabs)/home');
    }
  }, [accessToken, onboardingDone, segments, hydrated, fontsLoaded, isBootstrapping, navigationState?.key]);

  if (
    !hydrated ||
    !fontsLoaded ||
    isBootstrapping
  ) {
    return <Loader />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}