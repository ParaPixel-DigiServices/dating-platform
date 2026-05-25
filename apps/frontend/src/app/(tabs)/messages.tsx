import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Platform, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BottomNav } from "@/components/ui/BottomNav";
import { ConversationItem } from "@/components/ui/ConversationItem";

const { width } = Dimensions.get("window");

const newMatches = [
  { id: "m0", name: "Me", isOnline: false, isStory: false, image: "https://i.pravatar.cc/150?img=47" },
  { id: "m1", name: "Haris", isOnline: true, isStory: true, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { id: "m2", name: "Abdullah", isOnline: false, isStory: true, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
  { id: "m3", name: "Sienna", isOnline: true, isStory: false, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { id: "m4", name: "Alex", isOnline: false, isStory: false, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
];

const conversations = [
  { id: "c1", name: "Visit Denpasar", time: "24 mins", lastMessage: "Are they still open at sunday?", unread: 4, read: false, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { id: "c2", name: "Kira Lindegaard", time: "2 mins", lastMessage: "Got it, thanks Kira!!", unread: 0, read: true, image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80" },
  { id: "c3", name: "Kaja Kumar", time: "3 mins", lastMessage: "Thanks bro, see you later", unread: 0, read: true, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { id: "c4", name: "Ayana Izquierdo", time: "5 mins", lastMessage: "Sure hahaha", unread: 0, read: true, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80" },
  { id: "c5", name: "Khadija Dubois", time: "5 mins", lastMessage: "No, I think we can start at 8pm, wdyt?", unread: 4, read: false, image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80" },
];

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={s.masterContainer}>
      <LinearGradient colors={["#1A1A1C", "#0A0A0A"]} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={s.safeArea}>
        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Chats</Text>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn}><Feather name="search" size={20} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}><Feather name="camera" size={20} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}><Feather name="more-vertical" size={20} color="#FFF" /></TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* STORIES / ONLINE */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storiesRow}>
            {newMatches.map((m, i) => (
              <TouchableOpacity key={m.id} style={s.storyItem} activeOpacity={0.85}>
                <View style={s.storyRingOuter}>
                  {m.isStory ? (
                    <LinearGradient colors={["#FF8C00", "#FF4B2B"]} style={s.storyRing} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                  ) : (
                    <View style={[s.storyRing, { backgroundColor: "transparent", borderWidth: 2, borderColor: i===0?"transparent":"rgba(255,255,255,0.1)" }]} />
                  )}
                  <Image source={{ uri: m.image }} style={s.storyAvatar} />
                  {i === 0 && (
                    <View style={s.addStoryBadge}>
                      <Feather name="plus" size={12} color="#FFF" />
                    </View>
                  )}
                  {m.isOnline && !m.isStory && <View style={s.onlineDot} />}
                </View>
                <Text style={s.storyName} numberOfLines={1}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* CATEGORIES */}
          <View style={s.categoriesRow}>
            <TouchableOpacity style={[s.catPill, s.catPillActive]}>
              <Text style={[s.catText, s.catTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.catPill}>
              <Text style={s.catText}>Favorites</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.catPill}>
              <Text style={s.catText}>Matches</Text>
            </TouchableOpacity>
          </View>

          {/* CONVERSATIONS */}
          <View style={s.convList}>
            {conversations.map((c) => (
              <ConversationItem
                key={c.id}
                id={c.id}
                name={c.name}
                time={c.time}
                lastMessage={c.lastMessage}
                unread={c.unread}
                read={c.read}
                image={c.image}
                onPress={() => router.push(`/chat/${c.id}` as any)}
              />
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
  headerActions: { flexDirection: "row", gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  
  storiesRow: { paddingHorizontal: 20, gap: 16, paddingBottom: 24, paddingTop: 10 },
  storyItem: { alignItems: "center", width: 68 },
  storyRingOuter: { position: "relative", marginBottom: 8 },
  storyRing: { position: "absolute", top: -3, left: -3, right: -3, bottom: -3, borderRadius: 37, zIndex: -1 },
  storyAvatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: "#1A1A1C" },
  onlineDot: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#4CD964", borderWidth: 2, borderColor: "#1A1A1C" },
  addStoryBadge: { position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: "#FF4B2B", borderWidth: 2, borderColor: "#1A1A1C", justifyContent: "center", alignItems: "center" },
  storyName: { fontSize: 13, fontFamily: "Outfit_500Medium", color: "#FFF", textAlign: "center" },
  
  categoriesRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  catPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)" },
  catPillActive: { backgroundColor: "rgba(255,255,255,0.15)" },
  catText: { fontSize: 14, fontFamily: "Outfit_500Medium", color: "rgba(255,255,255,0.5)" },
  catTextActive: { color: "#FFF" },

  convList: { paddingHorizontal: 20 },
});
