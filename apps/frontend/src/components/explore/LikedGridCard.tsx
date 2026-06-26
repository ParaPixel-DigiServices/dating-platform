import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LikedProfile } from "./LikedYouCard"; // reuse the interface

const { width } = Dimensions.get("window");
// 2 columns with 20px padding on edges and 12px gap between columns
const GRID_ITEM_WIDTH = (width - 40 - 12) / 2;
const GRID_ITEM_HEIGHT = GRID_ITEM_WIDTH * 1.3;

interface Props {
  profile:       LikedProfile;
  primaryColor:  string;
  textPrimary:   string;
  textSecondary: string;
  secondary:     string;
  isBlurred?:    boolean;
  onPress:       () => void;
  onAction:      () => void;
}

export function LikedGridCard({
  profile,
  primaryColor,
  textPrimary,
  textSecondary,
  isBlurred = true, // default to blurred for "Premium" tease
  onPress,
  onAction,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={profile.photo} 
          style={[styles.image, isBlurred && styles.blurredImage]} 
          blurRadius={isBlurred ? 20 : 0}
        />
        
        {/* Gradient for text readability */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />

        {/* Top-right blur overlay icon */}
        {isBlurred && (
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={16} color="#fff" />
          </View>
        )}
      </View>

      {/* Info overlay */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
          {profile.name}
        </Text>
        <Text style={[styles.timeAgo, { color: textSecondary }]}>
          {profile.timeAgo}
        </Text>
      </View>

      {/* Action button overlay */}
      {!isBlurred && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: primaryColor }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={18} color="#000" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  blurredImage: {
    opacity: 0.8,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  lockIconContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  info: {
    position: "absolute",
    bottom: 16,
    left: 12,
    right: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: "Lato_700Bold",
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
  },
  actionBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
