import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Loader } from '@/components/Loader';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import { useFonts, Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';


export default function RootLayout() {
  const [hydrated, setHydrated] = useState(false);
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    // Check if already hydrated (e.g. hot reload)
    if (
      useAuthStore.persist.hasHydrated() &&
      useOnboardingStore.persist.hasHydrated()
    ) {
      setHydrated(true);
      return;
    }

    // Wait for both stores to finish reading from AsyncStorage
    let authDone = false;
    let onboardingDone = false;

    const tryFinish = () => {
      if (authDone && onboardingDone) setHydrated(true);
    };

    const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
      authDone = true;
      tryFinish();
    });

    const unsubOnboarding = useOnboardingStore.persist.onFinishHydration(() => {
      onboardingDone = true;
      tryFinish();
    });

    // Safety fallback — never show loader forever
    const fallback = setTimeout(() => setHydrated(true), 800);

    return () => {
      unsubAuth();
      unsubOnboarding();
      clearTimeout(fallback);
    };
  }, []);

  if (!hydrated || !fontsLoaded) return <Loader />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
