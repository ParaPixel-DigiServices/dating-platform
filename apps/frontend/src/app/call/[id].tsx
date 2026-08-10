import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "@/theme/theme";

const { width, height } = Dimensions.get("window");
const t = (theme as any).onboarding;

// Pulsing ring component
function PulseRing({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1.8, { duration: 1800, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 0 }),
          withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: t.primary,
        },
      ]}
    />
  );
}

// Dot blink for "Connecting..."
function ConnectingDots() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text style={styles.connectingText}>
      Connecting{dots}
    </Text>
  );
}

const STATUS_STEPS = [
  "Initialising secure channel",
  "Locating peer on network",
  "Establishing handshake",
  "Almost there",
];

export default function CallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, type, name } = useLocalSearchParams<{
    id: string;
    type: "audio" | "video";
    name: string;
  }>();

  const isVideo = type === "video";
  const displayName = name ? decodeURIComponent(name) : "User";

  // Cycle through status steps
  const [statusIdx, setStatusIdx] = useState(0);
  const [callDuration, setCallDuration] = useState<number | null>(null); // null = still connecting

  useEffect(() => {
    // Advance status steps
    const stepTimer = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, STATUS_STEPS.length - 1));
    }, 2000);

    // Simulate "connected" after ~8s — just shows a timer
    const connectedTimer = setTimeout(() => {
      setCallDuration(0);
      clearInterval(stepTimer);
    }, 8000);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(connectedTimer);
    };
  }, []);

  // Tick the call duration once connected
  useEffect(() => {
    if (callDuration === null) return;
    const tick = setInterval(() => setCallDuration((d) => (d ?? 0) + 1), 1000);
    return () => clearInterval(tick);
  }, [callDuration]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Control states
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={["#0f0f10", "#1a1210", "#0f0f10"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle accent glow */}
      <View style={[styles.glow, { backgroundColor: t.primary + "18" }]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === "android" ? 40 : 20) }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Feather name="chevron-down" size={28} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.callTypeLabel}>
          {isVideo ? "Video Call" : "Voice Call"}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Center — avatar + name + status */}
      <View style={styles.centerArea}>
        {/* Pulse rings */}
        <View style={styles.pulseArea}>
          <PulseRing size={140} delay={0} />
          <PulseRing size={180} delay={600} />
          <PulseRing size={220} delay={1200} />

          {/* Avatar circle */}
          <View style={[styles.avatarCircle, { borderColor: t.primary + "88", backgroundColor: t.secondary }]}>
            <Text style={styles.avatarInitial}>{displayName[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Name */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={styles.calleeName}>{displayName}</Text>
        </Animated.View>

        {/* Status */}
        {callDuration === null ? (
          <View style={styles.statusArea}>
            <ConnectingDots />
            <Text style={[styles.statusStep, { color: t.primary + "cc" }]}>
              {STATUS_STEPS[statusIdx]}
            </Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(500)} style={styles.statusArea}>
            <Text style={[styles.durationText, { color: t.primary }]}>
              {formatDuration(callDuration)}
            </Text>
            <Text style={styles.connectedLabel}>Connected · Secure</Text>
          </Animated.View>
        )}
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        {/* Row 1: mute, speaker/video-off, end */}
        <View style={styles.controlRow}>
          {/* Mute */}
          <TouchableOpacity
            style={[styles.controlBtn, muted && styles.controlBtnActive]}
            onPress={() => setMuted((v) => !v)}
            activeOpacity={0.8}
          >
            <Feather name={muted ? "mic-off" : "mic"} size={22} color={muted ? "#fff" : "rgba(255,255,255,0.8)"} />
            <Text style={styles.controlLabel}>{muted ? "Unmute" : "Mute"}</Text>
          </TouchableOpacity>

          {/* Speaker / Camera */}
          {isVideo ? (
            <TouchableOpacity
              style={[styles.controlBtn, videoOff && styles.controlBtnActive]}
              onPress={() => setVideoOff((v) => !v)}
              activeOpacity={0.8}
            >
              <Feather name={videoOff ? "video-off" : "video"} size={22} color="rgba(255,255,255,0.8)" />
              <Text style={styles.controlLabel}>{videoOff ? "Start Video" : "Stop Video"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlBtn, speakerOn && styles.controlBtnActive]}
              onPress={() => setSpeakerOn((v) => !v)}
              activeOpacity={0.8}
            >
              <Ionicons name={speakerOn ? "volume-high" : "volume-medium"} size={22} color="rgba(255,255,255,0.8)" />
              <Text style={styles.controlLabel}>{speakerOn ? "Speaker On" : "Speaker"}</Text>
            </TouchableOpacity>
          )}

          {/* End call */}
          <TouchableOpacity
            style={styles.endCallBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Feather name="phone-off" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f10",
  },
  glow: {
    position: "absolute",
    top: "25%",
    left: "10%",
    width: "80%",
    height: "40%",
    borderRadius: 300,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  callTypeLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontFamily: "Lato_400Regular",
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  pulseArea: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 46,
    color: "#fff",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  calleeName: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "PlayfairDisplay_700Bold",
    textAlign: "center",
  },
  statusArea: {
    alignItems: "center",
    gap: 6,
  },
  connectingText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Lato_400Regular",
    width: 140, // prevents jitter from dot changes
  },
  statusStep: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    textAlign: "center",
  },
  durationText: {
    fontSize: 28,
    fontFamily: "Lato_700Bold",
    letterSpacing: 2,
  },
  connectedLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Lato_400Regular",
  },
  controls: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  controlBtn: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
  },
  controlBtnActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  controlLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontFamily: "Lato_400Regular",
    position: "absolute",
    bottom: -20,
    textAlign: "center",
    width: 80,
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E63946",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
});
