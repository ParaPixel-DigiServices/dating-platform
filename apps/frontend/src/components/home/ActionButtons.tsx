import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

interface Props {
  primaryColor: string;
  secondary:    string;
  textPrimary:  string;
  category?:    string; // 'LOVE' | 'MARRIAGE'
  onDislike:    () => void;
  onLike:       () => void;
  onSpark:      () => void;
}

export function ActionButtons({
  primaryColor,
  secondary,
  textPrimary,
  category,
  onDislike,
  onLike,
  onSpark,
}: Props) {
  const isMarriage = String(category || '').toUpperCase() === 'MARRIAGE';

  return (
    <View style={styles.row}>

      {/* ── Dislike (X) ──────────────────────────── */}
      <TouchableOpacity
        style={[styles.btn, styles.btnSmall, { backgroundColor: secondary, borderWidth: 1, borderColor: primaryColor }]}
        onPress={onDislike}
        activeOpacity={0.8}
      >
        <Feather name="x" size={25} color={primaryColor} />
      </TouchableOpacity>

      {/* ── Like (Heart) ─────────────────────────── */}
      <TouchableOpacity
        style={[styles.btn, styles.btnSmall, { backgroundColor: secondary, borderWidth: 1, borderColor: primaryColor }]}
        onPress={onLike}
        activeOpacity={0.8}
      >
        <Ionicons name="heart-outline" size={25} color={primaryColor} />
      </TouchableOpacity>

      {/* ── Spark (Love) / Super Like (Marriage) ─── */}
      <TouchableOpacity
        style={[
          styles.btn,
          styles.btnLarge,
          { backgroundColor: primaryColor },
          isMarriage && styles.superLikeGlow,
        ]}
        onPress={onSpark}
        activeOpacity={0.8}
      >
        {isMarriage
          ? <Ionicons name="star" size={34} color="#2D211C" />
          : <Feather name="zap" size={34} color="#2D211C" />
        }
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            32,
    paddingTop:     16,
    paddingBottom:  40,
  },
  btn: {
    justifyContent: "center",
    alignItems:     "center",
    borderRadius:   999,
    elevation:      3,
    shadowColor:    "#000",
    shadowOpacity:  0.15,
    shadowRadius:   8,
    shadowOffset:   { width: 0, height: 4 },
  },
  btnSmall: { width: 58, height: 58 },
  btnLarge: { width: 76, height: 76 },
  superLikeGlow: {
    // Extra glow on the star to differentiate Super Like from Spark
    elevation:    10,
    shadowOpacity: 0.5,
    shadowRadius:  18,
  },
});
