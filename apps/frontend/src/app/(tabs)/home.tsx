import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BottomNav } from "@/components/ui/BottomNav";

const { width } = Dimensions.get("window");

const STORIES = [
  { id: "s1", name: "You", image: "https://i.pravatar.cc/150?img=47", isMe: true },
  { id: "s2", name: "Jessica", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80", isMe: false },
  { id: "s3", name: "Sarah", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", isMe: false },
  { id: "s4", name: "Emma", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80", isMe: false },
];

const LIKED_YOU = [
  { id: "l1", name: "Alice", image: "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?auto=format&fit=crop&w=200&q=80" },
  { id: "l2", name: "Maria", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80" },
  { id: "l3", name: "Jenny", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80" },
];

const DISCOVER = [
  { id: "d1", name: "Kylie", age: 22, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" },
  { id: "d2", name: "Sophie", age: 24, image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80" },
  { id: "d3", name: "Hannah", age: 21, image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" },
  { id: "d4", name: "Mia", age: 26, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={s.master}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <View style={s.header}>
            <View>
              <Text style={s.greeting}>Good Morning,</Text>
              <Text style={s.name}>Kartik</Text>
            </View>
            <TouchableOpacity style={s.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={s.notifDot} />
            </TouchableOpacity>
          </View>

          {/* STORIES SECTION */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Highlights</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storiesScroll}>
              {STORIES.map((story) => (
                <View key={story.id} style={s.storyItem}>
                  <View style={[s.storyImgWrap, !story.isMe && s.storyActive]}>
                    <Image source={{ uri: story.image }} style={s.storyImg} />
                    {story.isMe && (
                      <View style={s.storyAdd}>
                        <Ionicons name="add" size={14} color="#FFF" />
                      </View>
                    )}
                  </View>
                  <Text style={s.storyName}>{story.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* WHO LIKED YOU SECTION */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Likes You <Text style={s.badge}>(4)</Text></Text>
              <TouchableOpacity><Text style={s.seeAll}>See All</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.likesScroll}>
              {LIKED_YOU.map((person, idx) => (
                <TouchableOpacity key={person.id} style={s.likeCard} activeOpacity={0.9}>
                  <Image source={{ uri: person.image }} style={s.likeImg} blurRadius={idx === 0 ? 0 : 8} />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={StyleSheet.absoluteFillObject} />
                  {idx !== 0 && (
                    <View style={s.lockOverlay}>
                      <Ionicons name="lock-closed" size={20} color="#FFF" />
                    </View>
                  )}
                  <Text style={s.likeName}>{idx === 0 ? person.name : "Secret"}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* DISCOVER GRID */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Discover</Text>
            <View style={s.grid}>
              {DISCOVER.map((profile) => (
                <TouchableOpacity 
                  key={profile.id} 
                  style={s.gridCard} 
                  activeOpacity={0.9}
                  onPress={() => router.push(`/user/${profile.id}` as any)}
                >
                  <Image source={{ uri: profile.image }} style={StyleSheet.absoluteFillObject} />
                  <LinearGradient 
                    colors={["transparent", "rgba(0,0,0,0.8)"]} 
                    locations={[0.5, 1]} 
                    style={StyleSheet.absoluteFillObject} 
                  />
                  <View style={s.gridInfo}>
                    <Text style={s.gridName}>{profile.name}, {profile.age}</Text>
                    <View style={s.gridStatus}>
                      <View style={s.onlineDot} />
                      <Text style={s.statusTxt}>Recently Active</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}

const s = StyleSheet.create({
  master: { flex: 1, backgroundColor: "#0A0A0A" },
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 120, paddingTop: Platform.OS === "android" ? 40 : 10 },
  
  // HEADER
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 24 },
  greeting: { fontSize: 14, fontFamily: "Outfit_400Regular", color: "rgba(255,255,255,0.6)" },
  name: { fontSize: 28, fontFamily: "Outfit_700Bold", color: "#FFF" },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  notifDot: { position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF4B2B" },

  // SECTIONS
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontFamily: "Outfit_600SemiBold", color: "#FFF", paddingHorizontal: 20, marginBottom: 16 },
  badge: { color: "#FF4B2B" },
  seeAll: { fontSize: 14, fontFamily: "Outfit_500Medium", color: "#FF4B2B" },

  // STORIES
  storiesScroll: { paddingHorizontal: 20, gap: 16 },
  storyItem: { alignItems: "center", width: 70 },
  storyImgWrap: { width: 68, height: 68, borderRadius: 34, padding: 3, justifyContent: "center", alignItems: "center" },
  storyActive: { borderWidth: 2, borderColor: "#FF4B2B" },
  storyImg: { width: "100%", height: "100%", borderRadius: 30, backgroundColor: "#222" },
  storyAdd: { position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: "#FF4B2B", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#0A0A0A" },
  storyName: { fontSize: 12, fontFamily: "Outfit_400Regular", color: "#FFF", marginTop: 8 },

  // LIKES
  likesScroll: { paddingHorizontal: 20, gap: 12 },
  likeCard: { width: 110, height: 140, borderRadius: 16, overflow: "hidden", backgroundColor: "#222" },
  likeImg: { width: "100%", height: "100%" },
  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  likeName: { position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", fontSize: 14, fontFamily: "Outfit_600SemiBold", color: "#FFF" },

  // GRID
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16, paddingHorizontal: 20 },
  gridCard: { width: (width - 40 - 16) / 2, height: 200, borderRadius: 20, overflow: "hidden", backgroundColor: "#222" },
  gridInfo: { position: "absolute", bottom: 12, left: 12, right: 12 },
  gridName: { fontSize: 16, fontFamily: "Outfit_600SemiBold", color: "#FFF", marginBottom: 4 },
  gridStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CD964" },
  statusTxt: { fontSize: 11, fontFamily: "Outfit_400Regular", color: "rgba(255,255,255,0.7)" },
});
