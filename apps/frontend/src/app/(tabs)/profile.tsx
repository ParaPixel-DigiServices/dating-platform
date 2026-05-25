import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Platform, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { BottomNav } from "@/components/ui/BottomNav";

const { width } = Dimensions.get("window");

const interests = ["Travel ✈️", "Coffee ☕", "Photography 📷", "Hiking 🏔️", "Music 🎵", "Art 🎨"];

const stats = [
  { label: "Matches", value: "128" },
  { label: "Likes", value: "340" },
  { label: "Visitors", value: "1.2K" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const firstName = useOnboardingStore((s) => s.firstName);
  const lastName = useOnboardingStore((s) => s.lastName);
  const category = useOnboardingStore((s) => s.category);

  const displayName = firstName ? `${firstName} ${lastName}`.trim() : "Your Name";
  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : "Love";

  return (
    <View style={s.masterContainer}>
      <LinearGradient colors={["#1A1A1C", "#0A0A0A"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={s.safeArea}>
        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile</Text>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.8} onPress={() => router.push("/profile/settings")}>
            <Feather name="settings" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* PROFILE CARD */}
          <View style={s.profileCard}>
            <View style={s.avatarWrapper}>
              <Image source={{ uri: "https://i.pravatar.cc/300?img=47" }} style={s.avatar} />
              <TouchableOpacity style={s.editAvatarBtn} activeOpacity={0.8}>
                <Feather name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={s.profileName}>{displayName}</Text>
            <View style={s.categoryBadge}>
              <Ionicons name="heart" size={12} color="#FF4B2B" />
              <Text style={s.categoryText}>Looking for {categoryLabel}</Text>
            </View>

            {/* STATS ROW */}
            <View style={s.statsRow}>
              {stats.map((stat, i) => (
                <React.Fragment key={stat.label}>
                  <View style={s.statItem}>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statLabel}>{stat.label}</Text>
                  </View>
                  {i < stats.length - 1 && <View style={s.statDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* COMPLETION NUDGE */}
          <View style={s.completionCard}>
            <View style={s.completionLeft}>
              <Text style={s.completionTitle}>Complete your profile</Text>
              <Text style={s.completionSub}>Add a bio & more photos to get 3× more matches</Text>
            </View>
            <View style={s.completionCircle}>
              <Text style={s.completionPct}>65%</Text>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View style={s.actionsGrid}>
            {[
              { icon: "image", label: "Add Photos" },
              { icon: "file-text", label: "Edit Bio" },
              { icon: "map-pin", label: "Location" },
              { icon: "sliders", label: "Preferences" },
            ].map((action) => (
              <TouchableOpacity key={action.label} style={s.actionCard} activeOpacity={0.85}>
                <View style={s.actionIconWrap}>
                  <Feather name={action.icon as any} size={22} color="#FF4B2B" />
                </View>
                <Text style={s.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* INTERESTS */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Interests</Text>
              <TouchableOpacity><Text style={s.sectionEdit}>Edit</Text></TouchableOpacity>
            </View>
            <View style={s.interestsWrap}>
              {interests.map((tag) => (
                <View key={tag} style={s.interestTag}>
                  <Text style={s.interestText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ACCOUNT - REMOVED SETTINGS/LOGOUT AS IT'S IN SETTINGS PAGE NOW */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Account</Text>
            {[
              { icon: "star", label: "Go Premium" },
              { icon: "shield", label: "Privacy Center" },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={s.menuRow} activeOpacity={0.8}>
                <View style={s.menuIconWrap}>
                  <Feather name={item.icon as any} size={18} color="#FFF" />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}

const s = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: "#0A0A0A" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 40 : 10, paddingBottom: 16 },
  headerTitle: { fontSize: 32, fontFamily: "Outfit_600SemiBold", color: "#FFF" },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  
  profileCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: "#1C1C1E", borderRadius: 28, padding: 24, alignItems: "center" },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#1C1C1E" },
  editAvatarBtn: { position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: "#FF4B2B", justifyContent: "center", alignItems: "center" },
  profileName: { fontSize: 24, fontFamily: "Outfit_700Bold", color: "#FFF", marginBottom: 6 },
  categoryBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255, 75, 43, 0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
  categoryText: { fontSize: 13, color: "#FF4B2B", fontFamily: "Outfit_600SemiBold" },
  
  statsRow: { flexDirection: "row", width: "100%", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 20, fontFamily: "Outfit_700Bold", color: "#FFF" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Outfit_400Regular", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 4 },
  
  completionCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: "#1C1C1E", borderRadius: 20, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  completionLeft: { flex: 1, marginRight: 12 },
  completionTitle: { fontSize: 15, fontFamily: "Outfit_600SemiBold", color: "#FFF", marginBottom: 4 },
  completionSub: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Outfit_400Regular", lineHeight: 18 },
  completionCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#FF4B2B", justifyContent: "center", alignItems: "center" },
  completionPct: { fontSize: 14, fontFamily: "Outfit_700Bold", color: "#FFF" },
  
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  actionCard: { width: (width - 40 - 12) / 2, backgroundColor: "#1C1C1E", borderRadius: 20, padding: 18, alignItems: "center" },
  actionIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255, 75, 43, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  actionLabel: { fontSize: 14, fontFamily: "Outfit_500Medium", color: "#FFF" },
  
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Outfit_600SemiBold", color: "#FFF", marginBottom: 14 },
  sectionEdit: { fontSize: 14, color: "#FF4B2B", fontFamily: "Outfit_600SemiBold" },
  interestsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  interestTag: { backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  interestText: { fontSize: 13, color: "#FFF", fontFamily: "Outfit_500Medium" },
  
  menuRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16, marginBottom: 10 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: "Outfit_500Medium", color: "#FFF" },
});
