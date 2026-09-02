import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

import { restoreSession } from '@/services/authBootstrap';

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
        await restoreSession();
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  // Consider onboarding locally complete when the step is CATEGORY_DONE or COMPLETED
  const onboardingDone = user?.onboardingStep === 'CATEGORY_DONE' || user?.onboardingStep === 'COMPLETED';

  useEffect(() => {
    if (!hydrated || !fontsLoaded || isBootstrapping || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(onboarding)';
    const isRootRoute = segments.length === 0;

    // Only allow access to protected routes if authenticated and fully onboarded
    // We allow inAuthGroup AND isRootRoute (because index.tsx acts as the master router)
    if ((!accessToken || !onboardingDone) && !inAuthGroup && !isRootRoute) {
      router.replace('/(onboarding)/landing');
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </GestureHandlerRootView>
  );
}