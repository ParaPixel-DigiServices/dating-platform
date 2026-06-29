import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboardingStore }    from "@/hooks/useOnboardingStore";
import { useDeckStore }          from "@/hooks/useDeckStore";
import theme                      from "@/theme/theme";
import { ExploreHeader }          from "@/components/explore/ExploreHeader";
import { MatchesSection }         from "@/components/explore/MatchesSection";
import { LikedYouSection }        from "@/components/explore/LikedYouSection";
import { MatchProfile }           from "@/components/explore/MatchAvatarCard";
import { LikedProfile }           from "@/components/explore/LikedYouCard";


// ── Screen ────────────────────────────────────────────────────

export default function ExploreScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const t        = (theme as any).onboarding;

  const masterProfiles = useDeckStore((s) => s.masterProfiles);

  // Derive match/liked display data from central store
  const ALL_MATCHES: MatchProfile[] = useMemo(() =>
    masterProfiles
      .filter((p) => p.match !== undefined)
      .slice(0, 6)
      .map((p, i) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        photo: p.main_photo,
        match: p.match ?? 80,
        isOnline: i % 2 === 0,
        isNew: i < 3,
      })),
    [masterProfiles]
  );

  const ALL_LIKED: LikedProfile[] = useMemo(() =>
    masterProfiles
      .filter((p) => p.liked === true)
      .slice(0, 5)
      .map((p, i) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        photo: p.main_photo,
        isOnline: i % 2 === 0,
        timeAgo: ["2h ago", "5h ago", "Just now", "1d ago", "30m ago"][i] ?? "Recently",
      })),
    [masterProfiles]
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Filter both sections by search query
  const filteredMatches = useMemo(() =>
    searchQuery.trim().length === 0
      ? ALL_MATCHES
      : ALL_MATCHES.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [searchQuery]
  );

  const filteredLiked = useMemo(() =>
    searchQuery.trim().length === 0
      ? ALL_LIKED
      : ALL_LIKED.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [searchQuery]
  );

  return (
    <View style={[styles.screen, { backgroundColor: t.background, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Top safe area spacer ──────────────────────────── */}
        <View style={styles.topSpacer} />

        {/* ── Header + Search ──────────────────────────────── */}
        <ExploreHeader
          primaryColor={t.primary}
          textPrimary={t.textPrimary}
          textSecondary={t.textSecondary}
          secondary={t.secondary}
          background={t.background}
          onSearch={setSearchQuery}
        />

        {/* ── Your Matches ─────────────────────────────────── */}
        {filteredMatches.length > 0 && (
          <MatchesSection
            profiles={filteredMatches}
            primaryColor={t.primary}
            textPrimary={t.textPrimary}
            textSecondary={t.textSecondary}
            secondary={t.secondary}
            background={t.background}
            onSeeAll={() => {}}
            onProfile={(id) => router.push(`/user/${id}`)}
          />
        )}

        {/* ── Liked You ────────────────────────────────────── */}
        {filteredLiked.length > 0 && (
          <LikedYouSection
            profiles={filteredLiked}
            primaryColor={t.primary}
            textPrimary={t.textPrimary}
            textSecondary={t.textSecondary}
            secondary={t.secondary}
            onSeeMore={() => {}}
            onProfile={(id) => router.push(`/user/${id}`)}
            onAction={(_id) => {}}
          />
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
