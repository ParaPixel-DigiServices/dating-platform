import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  Text,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useDeckStore } from "@/hooks/useDeckStore";
import { useInteractionStore } from "@/hooks/useInteractionStore";
import theme from "@/theme/theme";

import { HomeHeader } from "@/components/home/HomeHeader";
import { ProfilePrompt } from "@/components/home/ProfilePrompt";
import { HomeFilterModal } from "@/components/home/HomeFilterModal";
import { SwipeableProfileCard, SwipeableProfileCardRef } from "@/components/home/SwipeableProfileCard";
import { ActionButtons } from "@/components/home/ActionButtons";
import { Profile } from "@/components/home/MatchCard";

const { height } = Dimensions.get("window");

import { ActivityIndicator } from "react-native";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const t = (theme as any).onboarding;
  const activeTab = useDeckStore((state) => state.activeTab);
  const setActiveTab = useDeckStore((state) => state.setActiveTab);
  const profiles = useDeckStore((state) => state.profiles);
  const swipeProfile = useDeckStore((state) => state.swipeProfile);
  const setFilters = useDeckStore((state) => state.setFilters);
  const unreadCount = useDeckStore((state) => state.unreadCount);
  const setUnreadCount = useDeckStore((state) => state.setUnreadCount);
  const fetchDeck = useDeckStore((state) => state.fetchDeck);
  const swipeApi = useDeckStore((state) => state.swipeApi);
  const isLoading = useDeckStore((state) => state.isLoading);
  const { addLike, addSpark } = useInteractionStore();
  const { user } = useAuthStore();
  const onboardingCategory = useOnboardingStore((s) => s.category);
  const category = user?.category ?? onboardingCategory;

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const topCardRef = useRef<SwipeableProfileCardRef>(null);

  React.useEffect(() => {
    fetchDeck();
  }, []);

  const checkProfileCompletion = () => {
    if (user?.onboardingStep !== 'COMPLETED') {
      Alert.alert("Incomplete Profile", "Please complete your profile to interact with others.");
      return false;
    }
    return true;
  };

  const handleSwipe = async (direction: 'LIKE' | 'PASS', profileId: string) => {
    if (direction === 'LIKE' && !checkProfileCompletion()) {
      // Re-fetch deck to bring the card back visually if it swiped away
      fetchDeck();
      return;
    }
    swipeProfile();
    const result = await swipeApi(profileId, direction);
    if (result.matched) {
      // In a real app, you would show a nice modal. We will show an alert for MVP
      Alert.alert("It's a Match! 🎉", "You can now chat with them in the Social tab.");
    }
  };

  const handleLike = () => {
    if (!checkProfileCompletion()) return;
    const top = profiles[0];
    if (top) {
      addLike({
        id: top.id,
        name: top.name,
        age: top.age,
        avatar: top.main_photo?.uri ?? "",
        occupation: top.occupation,
        location: top.location,
        match: top.match,
        timestamp: Date.now(),
      });
    }
    topCardRef.current?.swipeRight();
  };

  const handleSpark = () => {
    if (!checkProfileCompletion()) return;
    const top = profiles[0];
    if (!top) return;
    addSpark({
      id: top.id,
      name: top.name,
      age: top.age,
      avatar: top.main_photo?.uri ?? "",
      occupation: top.occupation,
      location: top.location,
      match: top.match,
      timestamp: Date.now(),
    });
    router.push(`/spark/${top.id}` as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.background, paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      {/* Header (Fixed) */}
      <View style={{ zIndex: 100, backgroundColor: t.background }}>
        <HomeHeader
          primaryColor={t.primary}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          secondary={t.secondary}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFilterPress={() => setIsFilterModalVisible(true)}
          onNotificationPress={() => {
            setUnreadCount(0);
            router.push("/notifications");
          }}
          notificationCount={unreadCount}
        />
      </View>

      {/* Swipe Deck Container */}
      <View style={styles.deckContainer}>
        {isLoading ? (
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color={t.primary} />
            <Text style={[styles.emptyStateText, { color: t.textSecondary, marginTop: 16 }]}>
              Finding matches...
            </Text>
          </View>
        ) : profiles.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons name="cards-playing-outline" size={64} color={t.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyStateTitle, { color: t.textPrimary }]}>
              You're all caught up!
            </Text>
            <Text style={[styles.emptyStateText, { color: t.textSecondary }]}>
              There are no more profiles to show right now. Check back later for new matches!
            </Text>
          </View>
        ) : (
          profiles.slice(0, 2).map((profile, index) => {
            const isTop = index === 0;
            return (
              <SwipeableProfileCard
                key={profile.id}
                ref={isTop ? topCardRef : null}
                profile={profile}
                isTop={isTop}
                theme={t}
                onSwipe={(dir) => handleSwipe(dir, profile.id)}
              />
            );
          }).reverse()
        )}
      </View>

      {/* GRADIENT OVERLAY (Touches pass through completely) */}
      <View style={styles.fixedButtonsContainer} pointerEvents="none">
        <LinearGradient
          colors={[
            "rgba(14, 14, 15, 0)",
            "rgba(14, 14, 15, 0)",
            "rgba(14, 14, 15, 0.25)",
            "rgba(14, 14, 15, 0.4)",
            "rgba(14, 14, 15, 0.81)",
            "rgba(14, 14, 15, 0.97)",
            "#0e0e0f",
          ]}
          locations={[0, 0.24, 0.41, 0.55, 0.62, 0.7, 0.82]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* ACTION BUTTONS (Only buttons catch touches, rest passes through) */}
      <View style={styles.fixedButtonsContainer} pointerEvents="box-none">
        <ActionButtons
          primaryColor={t.primaryLight}
          secondary={t.secondary}
          textPrimary={t.textPrimary}
          category={category ?? undefined}
          onDislike={() => topCardRef.current?.swipeLeft()}
          onLike={handleLike}
          onSpark={async () => {
            if (!checkProfileCompletion()) return;
            const isMarriageCat = String(category || '').toUpperCase() === 'MARRIAGE';
            if (isMarriageCat) {
              const top = profiles[0];
              if (!top) return;
              swipeProfile();
              const result = await swipeApi(top.id, 'SUPER_LIKE');
              if (result.matched) {
                Alert.alert("It's a Match! 🎉", "You can now chat with them in the Social tab.");
              } else {
                Alert.alert("Super Like Sent! ⭐", "They will see that you super liked them.");
              }
            } else {
              handleSpark();
            }
          }}
        />
      </View>

      <HomeFilterModal
        theme={t}
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={(filters) => {
          setFilters(filters);
          setIsFilterModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  deckContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    marginTop: 10,
  },
  fixedButtonsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingTop: 80,
    paddingBottom: 20,
    alignItems: "center",
    zIndex: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontFamily: "Lato_700Bold",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
  }
});
