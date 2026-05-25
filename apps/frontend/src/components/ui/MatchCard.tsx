import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export interface MatchCardProps {
  id: string;
  name: string;
  age: number;
  image: string;
  liked: boolean;
}

export function MatchCard({ id, name, age, image, liked }: MatchCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/user/${id}` as any)}
    >
      <Image source={{ uri: image }} style={StyleSheet.absoluteFillObject} />

      {/* Heart badge for special matches */}
      {liked && (
        <View style={s.likedBadge}>
          <Ionicons name="heart" size={14} color="#FFF" />
        </View>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.95)"]}
        locations={[0.4, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={s.cardInfo}>
        <Text style={s.cardName}>
          {name} <Text style={s.cardAge}>{age}</Text>
        </Text>
        <View style={s.cardActions}>
          <TouchableOpacity style={s.smallActionBtn}>
            <Ionicons name="heart-dislike" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.primaryActionBtn}
            onPress={() => router.push(`/chat/${id}` as any)}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    width: (width - 40 - 16) / 2,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#222",
  },
  likedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 75, 43, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cardInfo: { position: "absolute", bottom: 12, left: 12, right: 12 },
  cardName: { fontSize: 18, fontFamily: "Outfit_600SemiBold", color: "#FFF", marginBottom: 8 },
  cardAge: { fontSize: 16, fontFamily: "Outfit_400Regular", color: "rgba(255,255,255,0.7)" },

  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  smallActionBtn: {
    flex: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionBtn: {
    flex: 2,
    height: 36,
    backgroundColor: "#FF4B2B",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
