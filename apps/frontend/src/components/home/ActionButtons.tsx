import React, { useRef } from "react";
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

interface Props {
  primaryColor: string;
  secondary:    string;
  textPrimary:  string;
  onDislike:    () => void;
  onLike:       () => void;
  onSpark:      () => void;
}

const UP_THRESHOLD = 50;

export function ActionButtons({
  primaryColor,
  secondary,
  textPrimary,
  onDislike,
  onLike,
  onSpark,
}: Props) {
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

      {/* ── Spark (Zap) ─────────────────────────── */}
      <TouchableOpacity
        style={[styles.btn, styles.btnLarge, { backgroundColor: primaryColor }]}
        onPress={onSpark}
        activeOpacity={0.8}
      >
        <Feather name="zap" size={34} color="#2D211C" />
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
});
