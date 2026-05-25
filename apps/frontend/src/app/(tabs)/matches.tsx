import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BottomNav } from "@/components/ui/BottomNav";
import { MatchCard } from "@/components/ui/MatchCard";

const { width } = Dimensions.get("window");

const NAV_BOTTOM = Platform.OS === "ios" ? 34 : 20;

const MATCHES = [
  { id: "1", name: "Jacob", age: 28, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80", liked: true },
  { id: "2", name: "Martin", age: 24, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80", liked: false },
  { id: "3", name: "John", age: 20, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", liked: false },
  { id: "4", name: "Oliver", age: 18, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80", liked: false },
  { id: "5", name: "William", age: 22, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", liked: false },
  { id: "6", name: "Ethan", age: 25, image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80", liked: false },
];

export default function MatchesScreen() {
  const router = useRouter();

  return (
    <View style={s.master}>
      <LinearGradient colors={["#0A0A0A", "#111113"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={s.safeArea}>
        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Matches</Text>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.iconBtn}>
              <Feather name="bar-chart-2" size={20} color="#FFF" style={{ transform: [{ rotate: "90deg" }] }} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}>
              <Feather name="more-vertical" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* GRID */}
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.grid}>
            {MATCHES.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                name={match.name}
                age={match.age}
                image={match.image}
                liked={match.liked}
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
  master: { flex: 1, backgroundColor: "#0A0A0A" },
  safeArea: { flex: 1 },
  
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: Platform.OS === "android" ? 40 : 10, paddingBottom: 16 },
  headerTitle: { fontSize: 32, fontFamily: "Outfit_600SemiBold", color: "#FFF" },
  headerActions: { flexDirection: "row", gap: 16 },
  iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 },
  
});
