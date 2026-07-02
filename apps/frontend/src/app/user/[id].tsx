import React, { useMemo, useState } from "react";
import { View, Image, StyleSheet, Dimensions, StatusBar, ScrollView, TouchableOpacity, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import theme from "@/theme/theme";

import { useDeckStore } from "@/hooks/useDeckStore";

import { ProfileTabContent } from "@/components/profile/ProfileTabContent";
import { PostsTabContent } from "@/components/profile/PostsTabContent";
import { InsightTabContent } from "@/components/profile/InsightTabContent";
import { SyncTabContent } from "@/components/profile/SyncTabContent";

const { height, width } = Dimensions.get("window");

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const category = useOnboardingStore((s) => s.category) ?? "Casual";
  const themeObj = (theme as any).default || theme;
  const t = themeObj[category] || themeObj.onboarding;

  const masterProfiles = useDeckStore((s) => s.masterProfiles);
  const profile = useMemo(() => masterProfiles.find((p) => p.id === id), [id, masterProfiles]);

  const [activeTab, setActiveTab] = useState<"Profile" | "Insight" | "Sync" | "Posts">("Profile");

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: t.background }]}>
        <Text style={{ color: t.textPrimary }}>Profile not found</Text>
      </View>
    );
  }

  const topTags = ["Single", profile.height || "180cm"];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/explore");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Full Screen Image */}
      <View style={StyleSheet.absoluteFillObject}>
        <Image source={profile.main_photo} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.85)", t.background]}
          locations={[0, 0.25, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === "android" ? 30 : 0) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <View style={styles.backBtnCircle}>
            <Feather name="chevron-left" size={24} color={t.textPrimary} />
          </View>
          <Text style={[styles.headerText, { color: t.textPrimary }]}>Home</Text>
        </TouchableOpacity>
        {/* Mock top right avatars/badges can go here */}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Transparent Spacer */}
        <View style={{ height: height * 0.35 }} />

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={t.textPrimary} />
            <Text style={[styles.locationText, { color: t.textPrimary }]}>{profile.distance}</Text>
          </View>

          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: t.textPrimary }]}>{profile.name}</Text>
            <View style={styles.ageBadge}>
              <BlurView intensity={40} tint="dark" style={styles.ageBlur}>
                <Text style={[styles.ageText, { color: t.textPrimary }]}>{profile.age}</Text>
              </BlurView>
            </View>
          </View>

          <View style={styles.tagsRow}>
            {topTags.map((tag, i) => (
              <View key={i} style={styles.tagBadge}>
                <BlurView intensity={40} tint="dark" style={styles.tagBlur}>
                  {i === 0 && <Feather name="user" size={12} color={t.textPrimary} style={styles.tagIcon} />}
                  {i === 1 && <Feather name="arrow-up" size={12} color={t.textPrimary} style={styles.tagIcon} />}
                  <Text style={[styles.tagText, { color: t.textPrimary }]}>{tag}</Text>
                </BlurView>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <BlurView intensity={60} tint="dark" style={styles.iconBtnBlur}>
                <Feather name="heart" size={24} color={t.textPrimary} />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconBtn}>
              <BlurView intensity={60} tint="dark" style={styles.iconBtnBlur}>
                <Feather name="message-circle" size={24} color={t.textPrimary} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <BlurView intensity={60} tint="dark" style={styles.iconBtnBlur}>
                <Feather name="video" size={24} color={t.textPrimary} />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab System */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabSwitcher}>
            {(["Profile", "Insight", "Sync", "Posts"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, { color: activeTab === tab ? t.textPrimary : t.textSecondary }]}>
                  {tab === "Posts" ? "Social" : tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Tab Content */}
        {activeTab === "Profile" && (
          <ProfileTabContent
            profile={profile}
            textPrimary={t.textPrimary}
            textSecondary={t.textSecondary}
            primaryColor={t.primaryLight}
            background={t.background}
            secondary={t.secondary}
          />
        )}
        {activeTab === "Insight" && (
          <InsightTabContent
            textPrimary={t.textPrimary}
            textSecondary={t.textSecondary}
            primaryColor={t.primaryLight}
            secondary={t.secondary}
          />
        )}
        {activeTab === "Sync" && (
          <SyncTabContent
            textPrimary={t.textPrimary}
            textSecondary={t.textSecondary}
            primaryColor={t.primaryLight}
            viewedUserName={profile.name}
          />
        )}
        {activeTab === "Posts" && (
          <PostsTabContent
            textPrimary={t.textPrimary}
            theme={t}
            profileId={profile.id}
            profileName={profile.name}
          />
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 36,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ageBadge: {
    marginLeft: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  ageBlur: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ageText: {
    fontSize: 18,
    fontWeight: "700",
  },
  tagsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  tagBadge: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tagBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  iconBtnBlur: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  meetingBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  meetingBtnBlur: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
  },
  meetingIcon: {
    marginRight: 8,
  },
  meetingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  meetingClose: {
    marginLeft: 8,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabSwitcher: {
    flexDirection: "row",
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  tabBtn: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: "#FFF",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
