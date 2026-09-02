import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useDeckStore } from "@/hooks/useDeckStore";
import theme from "@/theme/theme";
import { ExploreHeader } from "@/components/explore/ExploreHeader";
import { HorizontalProfileSection } from "@/components/explore/HorizontalProfileSection";
import { getActivity } from "@/services/backendService";

export default function ActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;

  const { user } = useAuthStore();
  const onboardingCategory = useOnboardingStore((s) => s.category);
  const category = user?.category ?? onboardingCategory ?? "Love";
  const isLove = String(category || '').toUpperCase() === 'LOVE';

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [realData, setRealData] = useState({
    incomingLikes:      [] as any[],
    outgoingLikes:      [] as any[],
    incomingSuperLikes: [] as any[],
    outgoingSuperLikes: [] as any[],
    incomingSparks:     [] as any[],
    outgoingSparks:     [] as any[],
    matches:            [] as any[],
  });


  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await getActivity();
        // Backend double-wraps: interceptor unwraps once → res = { success, data: {...} }
        // or res is the data directly if fully unwrapped
        const payload = res?.data ?? res;
        if (payload) {
          setRealData((prev) => ({ ...prev, ...payload }));
        }
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const filterRealData = (dataArray: any[]) => {
    if (searchQuery.trim().length === 0) return dataArray || [];
    return (dataArray || []).filter((p) => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredMatches = filterRealData(realData.matches);


  const incomingLikes = filterRealData(realData.incomingLikes);
  const incomingSuperLikes = filterRealData(realData.incomingSuperLikes);
  const outgoingSuperLikes = filterRealData(realData.outgoingSuperLikes);
  const outgoingSparks = filterRealData(realData.outgoingSparks);
  const incomingSparks = filterRealData(realData.incomingSparks);

  return (
    <View style={[styles.screen, { backgroundColor: t.background, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.topSpacer} />

        {/* ── Header + Search ──────────────────────────────── */}
        <ExploreHeader
          primaryColor={t.primary}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          secondary={t.secondary}
          background={t.background}
          title="Activity"
          subtitle="Track your connections and interactions"
          onSearch={setSearchQuery}
        />

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <ActivityIndicator size="large" color={t.primary} />
          </View>
        ) : (
          <>
            {/* ── Your Matches ─────────────────────────────────── */}
            <HorizontalProfileSection
              title="Your Matches"
              subtitle={`${filteredMatches.length} people liked you back`}
              profiles={filteredMatches}
              primaryColor={t.primary}
              textPrimary={t.textPrimary}
              textSecondary={t.textSecondary}
              emptyIcon="users"
              emptyTitle="No matches yet"
              emptyLabel="When you and someone else both like each other, it's a match! They will appear here."
              onSeeAll={() => {}}
              onProfile={(id) => router.push(`/user/${id}` as any)}
            />

            {/* ── Liked You (Incoming) ─────────────────────────── */}
            <HorizontalProfileSection
              title="Liked You"
              subtitle="People who liked your profile"
              profiles={incomingLikes}
              primaryColor={t.primary}
              textPrimary={t.textPrimary}
              textSecondary={t.textSecondary}
              emptyIcon="heart"
              emptyTitle="No incoming likes yet"
              emptyLabel="When people swipe right on your profile, they will appear right here."
              onSeeAll={() => {}}
              onProfile={(id) => router.push(`/user/${id}` as any)}
            />
            
            {/* ── Super Likes Received (Incoming) ─────────────────────────── */}
            <HorizontalProfileSection
              title="Super Likes"
              subtitle="People who super liked your profile"
              profiles={incomingSuperLikes}
              primaryColor="#FBBF24"
              textPrimary={t.textPrimary}
              textSecondary={t.textSecondary}
              emptyIcon="star"
              emptyTitle="No super likes yet"
              emptyLabel="Super Likes stand out. When you get one, you'll see it here."
              onSeeAll={() => {}}
              onProfile={(id) => router.push(`/user/${id}` as any)}
            />

            {/* ── Sparks Received (Incoming) ───────────────────── */}
            {isLove && (
              <HorizontalProfileSection
                title="Sparks Received"
                subtitle="People who answered your Spark questions"
                profiles={incomingSparks}
                primaryColor="#F4A261"
                textPrimary={t.textPrimary}
                textSecondary={t.textSecondary}
                emptyIcon="zap"
                emptyTitle="No sparks received"
                emptyLabel="If someone is captivated by your Spark questions, their answers will show up here!"
                onSeeAll={() => {}}
                onProfile={(id) => router.push(`/user/${id}` as any)}
              />
            )}

            {/* ── Your Sparks (Outgoing) ───────────────────────── */}
            {isLove && (
              <HorizontalProfileSection
                title="Your Sparks"
                subtitle="Profiles you sent a Spark to"
                profiles={outgoingSparks}
                primaryColor="#F4A261"
                textPrimary={t.textPrimary}
                textSecondary={t.textSecondary}
                emptyIcon="zap"
                emptyTitle="Spark a connection"
                emptyLabel="You haven't sent any Sparks yet. Answer a profile's Spark question to stand out!"
                onSeeAll={() => {}}
                onProfile={(id) => router.push(`/user/${id}` as any)}
              />
            )}

            {/* ── Your Super Likes (Outgoing) ───────────────────────── */}
            {!isLove && (
              <HorizontalProfileSection
                title="Your Super Likes"
                subtitle="Profiles you Super Liked"
                profiles={outgoingSuperLikes}
                primaryColor="#FBBF24"
                textPrimary={t.textPrimary}
                textSecondary={t.textSecondary}
                emptyIcon="star"
                emptyTitle="Send a Super Like"
                emptyLabel="You haven't sent any Super Likes yet. Stand out to profiles you really like!"
                onSeeAll={() => {}}
                onProfile={(id) => router.push(`/user/${id}` as any)}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  topSpacer: {
    height: 48,
  },
});
