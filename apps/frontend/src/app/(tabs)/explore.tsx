import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useOnboardingStore }    from "@/hooks/useOnboardingStore";
import theme                      from "@/theme/theme";
import { ExploreHeader }          from "@/components/explore/ExploreHeader";
import { MatchesSection }         from "@/components/explore/MatchesSection";
import { LikedYouSection }        from "@/components/explore/LikedYouSection";
import { MatchProfile }           from "@/components/explore/MatchAvatarCard";
import { LikedProfile }           from "@/components/explore/LikedYouCard";

const DUMMY = require("../../../assets/images/dummy_img1.png");

// ── Dummy data ────────────────────────────────────────────────

const ALL_MATCHES: MatchProfile[] = [
  { id: "m1", name: "Priya",  age: 24, photo: DUMMY, match: 92, isOnline: true,  isNew: true  },
  { id: "m2", name: "Ananya", age: 26, photo: DUMMY, match: 87, isOnline: false, isNew: true  },
  { id: "m3", name: "Kavya",  age: 25, photo: DUMMY, match: 94, isOnline: true,  isNew: false },
  { id: "m4", name: "Meera",  age: 23, photo: DUMMY, match: 79, isOnline: false, isNew: false },
  { id: "m5", name: "Shreya", age: 27, photo: DUMMY, match: 81, isOnline: true,  isNew: true  },
  { id: "m6", name: "Nisha",  age: 22, photo: DUMMY, match: 88, isOnline: false, isNew: true  },
];

const ALL_LIKED: LikedProfile[] = [
  { id: "l1", name: "Riya",  age: 24, photo: DUMMY, isOnline: true,  timeAgo: "2h ago"   },
  { id: "l2", name: "Sneha", age: 25, photo: DUMMY, isOnline: false, timeAgo: "5h ago"   },
  { id: "l3", name: "Pooja", age: 23, photo: DUMMY, isOnline: true,  timeAgo: "Just now" },
  { id: "l4", name: "Divya", age: 26, photo: DUMMY, isOnline: false, timeAgo: "1d ago"   },
  { id: "l5", name: "Isha",  age: 22, photo: DUMMY, isOnline: true,  timeAgo: "30m ago"  },
];


// ── Screen ────────────────────────────────────────────────────

export default function ExploreScreen() {
  const router   = useRouter();
  const category = useOnboardingStore((s) => s.category) ?? "Casual";
  const t        = theme[category];

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
    <View style={[styles.screen, { backgroundColor: t.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
