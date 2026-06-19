import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';

import { Loader } from '@/components/Loader';

import { useAuthStore } from '@/hooks/useAuthStore';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';

import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';

import '@react-native-firebase/app';

import { getCurrentUser } from '@/services/authBootstrap';

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);

  const isBootstrapping = useAuthStore(
    (state) => state.isBootstrapping,
  );

  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    const bootstrap = async () => {
      // Wait for Zustand hydration
      if (
        !useAuthStore.persist.hasHydrated() ||
        !useOnboardingStore.persist.hasHydrated()
      ) {
        let authDone = false;
        let onboardingDone = false;

        const tryFinish = () => {
          if (authDone && onboardingDone) {
            setHydrated(true);
          }
        };

        const unsubAuth =
          useAuthStore.persist.onFinishHydration(
            () => {
              authDone = true;
              tryFinish();
            },
          );

        const unsubOnboarding =
          useOnboardingStore.persist.onFinishHydration(
            () => {
              onboardingDone = true;
              tryFinish();
            },
          );

        return () => {
          unsubAuth();
          unsubOnboarding();
        };
      }

      setHydrated(true);

      const {
        accessToken,
        logout,
        setUser,
        setOnboardingStatus,
        setBootstrapping,
      } = useAuthStore.getState();

      if (!accessToken) {
        setBootstrapping(false);
        return;
      }

      try {
        console.log(
          "Stored Access Token:",
          accessToken,
        );
        
        const user =
          await getCurrentUser();

        setUser({
          uid: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          displayName: null,
          photoURL: null,
        });

        setOnboardingStatus(
          user.onboardingStatus,
        );
      } catch (error) {
        console.error(
          'Session restore failed:',
          error,
        );

        logout();
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!hydrated || !fontsLoaded || isBootstrapping || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(onboarding)';

    // If the user is not signed in and the initial segment is not anything in the onboarding group
    if (!accessToken && !inAuthGroup) {
      // Route to landing
      router.replace('/(onboarding)/landing');
    }
  }, [accessToken, segments, hydrated, fontsLoaded, isBootstrapping, navigationState?.key]);

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