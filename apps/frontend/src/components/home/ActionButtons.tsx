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
  onSuperLike:  () => void;
}

const UP_THRESHOLD = 50; // px upward drag needed to trigger super like

export function ActionButtons({
  primaryColor,
  secondary,
  textPrimary,
  onDislike,
  onLike,
  onSuperLike,
}: Props) {
  // ── Heart button drag state ─────────────────────────────────
  const heartY        = useRef(new Animated.Value(0)).current;
  const superOpacity  = useRef(new Animated.Value(0)).current;
  const didDrag       = useRef(false);

  const resetHeart = () => {
    Animated.parallel([
      Animated.spring(heartY,       { toValue: 0, useNativeDriver: true, friction: 6 }),
      Animated.timing(superOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const heartPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      didDrag.current = false;
    },
    onPanResponderMove: (_, g) => {
      if (g.dy < -5) {
        didDrag.current = true;
        // Move button up (capped at -70)
        heartY.setValue(Math.max(g.dy, -70));
        // Fade in "SUPER" hint
        const progress = Math.min(Math.abs(g.dy) / UP_THRESHOLD, 1);
        superOpacity.setValue(progress);
      }
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy < -UP_THRESHOLD || !didDrag.current) {
        // tap OR drag-up past threshold → super like
        onSuperLike();
      }
      resetHeart();
    },
    onPanResponderTerminate: () => resetHeart(),
  });

  return (
    <View style={styles.row}>

      {/* ── Dislike (X) ──────────────────────────── */}
      <TouchableOpacity
        style={[styles.btn, styles.btnSmall, { backgroundColor: secondary, borderWidth: 1, borderColor: primaryColor }]}
        onPress={onDislike}
        activeOpacity={0.8}
      >
        <Feather name="x" size={28} color={primaryColor} />
      </TouchableOpacity>

      {/* ── Heart — tap = like, drag up = super like ─ */}
      <View style={styles.heartWrapper}>
        {/* "SUPER" hint that fades in when dragging up */}
        <Animated.View style={[styles.superHint, { opacity: superOpacity }]}>
          <Text style={[styles.superHintText, { color: primaryColor }]}>⭐ SUPER</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.btn,
            styles.btnLarge,
            { backgroundColor: primaryColor, transform: [{ translateY: heartY }] },
          ]}
          {...heartPan.panHandlers}
        >
          <Ionicons name="heart" size={38} color="#fff" />
        </Animated.View>
      </View>

      {/* ── Super Like (★) ───────────────────────── */}
      <TouchableOpacity
        style={[styles.btn, styles.btnSmall, { backgroundColor: secondary, borderWidth: 1, borderColor: primaryColor }]}
        onPress={onSuperLike}
        activeOpacity={0.8}
      >
        <Ionicons name="star-outline" size={28} color={primaryColor} />
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
  btnSmall: { width: 64, height: 64 },
  btnLarge: { width: 84, height: 84 },

  /* Heart button wrapper — holds the button + the SUPER hint above */
  heartWrapper: {
    alignItems:     "center",
    justifyContent: "flex-end",
  },
  superHint: {
    position:          "absolute",
    top:               -36,
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderRadius:      12,
    backgroundColor:   "rgba(0,0,0,0.55)",
  },
  superHintText: {
    fontSize:      12,
    fontWeight:    "700",
    letterSpacing: 1,
  },
});
