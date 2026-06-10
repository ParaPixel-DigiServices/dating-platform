import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';

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