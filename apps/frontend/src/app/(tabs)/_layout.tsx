import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { BottomNav } from "@/components/ui/BottomNav";
import { socketService } from "@/services/socketService";
import { useChatStore } from "@/hooks/useChatStore";
import { webrtcService } from "@/services/webrtcService";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function TabsLayout() {
  useEffect(() => {
    socketService.connect();
    useChatStore.getState().initSocketListeners();
    webrtcService.attachSocketListeners();

    return () => {
      useChatStore.getState().removeSocketListeners();
      socketService.disconnect();
    };
  }, []);

  const [incomingCall, setIncomingCall] = React.useState<{ matchId: string; callerId: string; callerName: string; isVideo: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    webrtcService.onIncomingCall = (data) => {
      setIncomingCall(data);
    };
  }, []);

  const handleAccept = () => {
    if (incomingCall) {
      const { matchId, isVideo } = incomingCall;
      webrtcService.acceptCall(matchId);
      setIncomingCall(null);
      router.push(`/call/${matchId}?type=${isVideo ? 'video' : 'audio'}&isAnswering=true` as any);
    }
  };

  const handleReject = () => {
    if (incomingCall) {
      webrtcService.rejectCall(incomingCall.matchId);
      setIncomingCall(null);
    }
  };

  return (
    <>
      <Tabs
        tabBar={() => <BottomNav />}
        screenOptions={{ headerShown: false }}
      />
      
      {/* Global Incoming Call Overlay */}
      <Modal visible={!!incomingCall} transparent animationType="slide">
        <View style={styles.overlayContainer}>
          <View style={styles.callCard}>
            <View style={styles.avatarPlaceholder}>
              <Feather name="phone-incoming" size={32} color="#fff" />
            </View>
            <Text style={styles.callerName}>{incomingCall?.callerName || "Someone"} is calling...</Text>
            <Text style={styles.callType}>{incomingCall?.isVideo ? "Video Call" : "Voice Call"}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E63946' }]} onPress={handleReject}>
                <Feather name="phone-off" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]} onPress={handleAccept}>
                <Feather name="phone-call" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    alignItems: 'center',
  },
  callCard: {
    width: '90%',
    backgroundColor: '#1E1410',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  callerName: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 40,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
