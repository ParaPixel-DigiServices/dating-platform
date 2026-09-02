import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { RTCView, MediaStream } from "react-native-webrtc";
import { webrtcService } from "@/services/webrtcService";
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
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended' | 'rejected' | 'disconnected' | 'ringing' | 'incoming'>('connecting');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Parse if this is an incoming call we are answering
  const { isAnswering, offerStr } = useLocalSearchParams<{ isAnswering?: string; offerStr?: string }>();

  useEffect(() => {
    // Advance status steps
    const stepTimer = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, STATUS_STEPS.length - 1));
    }, 2000);

    webrtcService.onCallStateChange = (state) => {
      setCallState(state);
      if (state === 'connected') {
        setCallDuration(0);
        clearInterval(stepTimer);
      } else if (state === 'ended' || state === 'rejected' || state === 'disconnected') {
        setTimeout(() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/');
          }
        }, 1500);
      }
    };

    webrtcService.onRemoteStream = (stream) => {
      setRemoteStream(stream);
    };

    webrtcService.onLocalStream = (stream) => {
      setLocalStream(stream);
    };

    const requestPermissionsAndStartLocal = async () => {
      if (Platform.OS === 'android') {
        try {
          const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
          if (isVideo) {
            permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
          }
          const granted = await PermissionsAndroid.requestMultiple(permissions);
          const audioGranted = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
          const videoGranted = isVideo ? granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED : true;
          
          if (!audioGranted || !videoGranted) {
            Alert.alert("Permissions Required", "Audio and Camera permissions are needed for calls.");
            if (router.canGoBack()) router.back();
            else router.push("/");
            return false;
          }
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
      await webrtcService.startLocalStream(isVideo);
      return true;
    };

    const initCallFlow = async () => {
      if (isAnswering === 'true') {
        // We are answering an incoming call
        const hasPermissions = await requestPermissionsAndStartLocal();
        if (hasPermissions) {
          webrtcService.setupAnswerStream(id as string, isVideo);
        }
      } else {
        // We are initiating an outgoing call
        const hasPermissions = await requestPermissionsAndStartLocal();
        if (hasPermissions) {
          webrtcService.onCallAccepted = () => {
            webrtcService.initiateCall(id as string, isVideo);
          };
          webrtcService.inviteUser(id as string, isVideo, displayName);
        }
      }
    };

    initCallFlow();

    return () => {
      clearInterval(stepTimer);
      webrtcService.endCall();
    };
  }, []);

  // Tick the call duration once connected
  useEffect(() => {
    if (callDuration === null || callState !== 'connected') return;
    const tick = setInterval(() => setCallDuration((d) => (d ?? 0) + 1), 1000);
    return () => clearInterval(tick);
  }, [callDuration, callState]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Control states
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    webrtcService.toggleMute(muted);
  }, [muted]);

  useEffect(() => {
    webrtcService.toggleVideo(!videoOff);
  }, [videoOff]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={["#0f0f10", "#1a1210", "#0f0f10"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Full screen video: remote stream if available, otherwise local stream */}
      {(remoteStream || localStream) && (
        <RTCView
          streamURL={remoteStream ? remoteStream.toURL() : localStream!.toURL()}
          style={isVideo && !videoOff ? styles.videoView : styles.hiddenAudioView}
          objectFit="cover"
        />
      )}

      {/* Subtle accent glow */}
      <View style={[styles.glow, { backgroundColor: t.primary + "18" }]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === "android" ? 40 : 20) }]}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/');
          }
        }} activeOpacity={0.8}>
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
        {callState === 'ringing' ? (
          <View style={styles.statusArea}>
            <Text style={[styles.statusStep, { color: t.primary, fontSize: 18, fontFamily: "PlayfairDisplay_700Bold" }]}>Ringing...</Text>
          </View>
        ) : callState === 'incoming' ? (
          <View style={styles.statusArea}>
            <Text style={[styles.statusStep, { color: t.primary, fontSize: 18, fontFamily: "PlayfairDisplay_700Bold" }]}>Incoming Call...</Text>
          </View>
        ) : callState === 'connecting' ? (
          <View style={styles.statusArea}>
            <ConnectingDots />
            <Text style={[styles.statusStep, { color: t.primary + "cc", marginTop: 4 }]}>
              Waiting for permissions...
            </Text>
            <Text style={[styles.statusStep, { color: t.primary + "88", marginTop: 2, fontSize: 11 }]}>
              {STATUS_STEPS[statusIdx]}
            </Text>
          </View>
        ) : callState === 'ended' || callState === 'rejected' || callState === 'disconnected' ? (
          <Animated.View entering={FadeIn.duration(500)} style={styles.statusArea}>
            <Text style={[styles.durationText, { color: '#E63946' }]}>Call Ended</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(500)} style={styles.statusArea}>
            <Text style={[styles.durationText, { color: t.primary }]}>
              {formatDuration(callDuration || 0)}
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
          <TouchableOpacity onPress={() => setMuted((v) => !v)} activeOpacity={0.8} style={styles.controlBtnWrapper}>
            <BlurView intensity={muted ? 40 : 20} tint="light" style={[styles.controlBtn, muted && styles.controlBtnActive]}>
              <Feather name={muted ? "mic-off" : "mic"} size={26} color={muted ? "#fff" : "rgba(255,255,255,0.9)"} />
            </BlurView>
            <Text style={styles.controlLabel}>{muted ? "Unmute" : "Mute"}</Text>
          </TouchableOpacity>

          {/* Speaker / Camera */}
          {isVideo ? (
            <TouchableOpacity onPress={() => setVideoOff((v) => !v)} activeOpacity={0.8} style={styles.controlBtnWrapper}>
              <BlurView intensity={videoOff ? 40 : 20} tint="light" style={[styles.controlBtn, videoOff && styles.controlBtnActive]}>
                <Feather name={videoOff ? "video-off" : "video"} size={26} color="rgba(255,255,255,0.9)" />
              </BlurView>
              <Text style={styles.controlLabel}>{videoOff ? "Start Video" : "Stop Video"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setSpeakerOn((v) => !v)} activeOpacity={0.8} style={styles.controlBtnWrapper}>
              <BlurView intensity={speakerOn ? 40 : 20} tint="light" style={[styles.controlBtn, speakerOn && styles.controlBtnActive]}>
                <Ionicons name={speakerOn ? "volume-high" : "volume-medium"} size={26} color="rgba(255,255,255,0.9)" />
              </BlurView>
              <Text style={styles.controlLabel}>{speakerOn ? "Speaker On" : "Speaker"}</Text>
            </TouchableOpacity>
          )}

          {/* End call */}
          <TouchableOpacity
            style={styles.endCallBtn}
            onPress={() => {
              webrtcService.endCall();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/');
              }
            }}
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
    paddingHorizontal: 20,
  },
  controlBtnWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  controlBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  controlBtnActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderColor: "rgba(255,255,255,0.4)",
  },
  controlLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginTop: 12,
    textAlign: "center",
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
  videoView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  hiddenAudioView: {
    width: 1,
    height: 1,
    opacity: 0,
  },
});
