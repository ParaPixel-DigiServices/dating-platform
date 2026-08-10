import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useInteractionStore, InteractedProfile } from "@/hooks/useInteractionStore";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48 - 10) / 2; // 2-col grid with 16px side padding + 10 gap

interface Props {
  theme: any;
}

function TimeAgo({ ts }: { ts: number }) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <Text style={styles.timeText}>Just now</Text>;
  if (mins < 60) return <Text style={styles.timeText}>{mins}m ago</Text>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <Text style={styles.timeText}>{hrs}h ago</Text>;
  return <Text style={styles.timeText}>{Math.floor(hrs / 24)}d ago</Text>;
}

function ProfileMiniCard({
  profile,
  accentColor,
  badge,
  badgeColor,
  onPress,
}: {
  profile: InteractedProfile;
  accentColor: string;
  badge: string;
  badgeColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.miniCard, { width: CARD_W }]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatarWrap}>
        {profile.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{profile.name[0]}</Text>
          </View>
        )}
        {/* Badge top-right */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {profile.name}{profile.age ? `, ${profile.age}` : ""}
        </Text>
        {profile.occupation && (
          <Text style={styles.cardOccupation} numberOfLines={1}>{profile.occupation}</Text>
        )}
        {profile.match != null && (
          <Text style={[styles.matchPct, { color: accentColor }]}>{profile.match}% match</Text>
        )}
        <TimeAgo ts={profile.timestamp} />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ icon, label, theme }: { icon: string; label: string; theme: any }) {
  return (
    <View style={styles.emptyWrap}>
      <Feather name={icon as any} size={32} color={theme.textSecondary + "55"} />
      <Text style={[styles.emptyText, { color: theme.textSecondary + "88" }]}>{label}</Text>
    </View>
  );
}

export default function ActivityTabContent({ theme }: Props) {
  const router = useRouter();
  const { likedProfiles, sparkedProfiles, removeLike, removeSpark } = useInteractionStore();

  const goToProfile = (id: string) => router.push(`/user/${id}` as any);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── SPARKS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: "#F4A261" }]} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Sparks</Text>
          <Text style={[styles.sectionCount, { color: theme.textSecondary }]}>
            {sparkedProfiles.length}
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Profiles you sent a Spark to
        </Text>

        {sparkedProfiles.length === 0 ? (
          <EmptyState icon="zap" label="No sparks sent yet" theme={theme} />
        ) : (
          <View style={styles.grid}>
            {sparkedProfiles.map((p) => (
              <ProfileMiniCard
                key={p.id}
                profile={p}
                accentColor="#F4A261"
                badge="Spark"
                badgeColor="#F4A261"
                onPress={() => goToProfile(p.id)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.primary + "22" }]} />

      {/* ── LIKES ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>You Liked</Text>
          <Text style={[styles.sectionCount, { color: theme.textSecondary }]}>
            {likedProfiles.length}
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Profiles you liked
        </Text>

        {likedProfiles.length === 0 ? (
          <EmptyState icon="heart" label="No likes yet — start swiping" theme={theme} />
        ) : (
          <View style={styles.grid}>
            {likedProfiles.map((p) => (
              <ProfileMiniCard
                key={p.id}
                profile={p}
                accentColor={theme.primary}
                badge="Liked"
                badgeColor={theme.primary}
                onPress={() => goToProfile(p.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginBottom: 16,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  miniCard: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: CARD_W,
    height: CARD_W * 1.2,
    borderRadius: 14,
  },
  avatarFallback: {
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: "#1a1a1a",
    fontSize: 10,
    fontFamily: "Lato_700Bold",
  },
  cardInfo: {
    padding: 8,
    gap: 2,
  },
  cardName: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  cardOccupation: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Lato_400Regular",
  },
  matchPct: {
    fontSize: 11,
    fontFamily: "Lato_700Bold",
  },
  timeText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontFamily: "Lato_400Regular",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Lato_400Regular",
  },
});
