import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import theme from "@/theme/theme";
import { MessageBubble } from "@/components/chat/MessageBubble";

import { useChatStore } from "@/hooks/useChatStore";
import { format } from "date-fns"; // We'll just use raw JS date for now if date-fns isn't installed. Actually JS Dates are fine.

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const activeTheme = (theme as any).onboarding;

  const { inbox, activeChatMessages, fetchMessages, sendMessage, joinChatRoom, leaveChatRoom, setActiveMatchId } = useChatStore();
  
  // Find profile info from inbox
  const chatInfo = inbox.find(c => c.matchId === id);
  const profile = chatInfo ? chatInfo.otherProfile : { name: "Match", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80", id: "" };

  const [inputText, setInputText] = useState("");

  React.useEffect(() => {
    if (id) {
      const matchId = id as string;
      setActiveMatchId(matchId);
      joinChatRoom(matchId);
      fetchMessages(matchId);
      if (useChatStore.getState().inbox.length === 0) {
        useChatStore.getState().fetchInbox();
      }

      return () => {
        leaveChatRoom(matchId);
        setActiveMatchId(null);
      };
    }
  }, [id]);

  const handleSend = () => {
    if (inputText.trim() === "") return;
    sendMessage(id as string, inputText.trim());
    setInputText("");
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: activeTheme.background, paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={28} color={activeTheme.textPrimary} />
          </TouchableOpacity>
          <Image source={{ uri: profile.avatar }} style={styles.headerAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerName, { color: activeTheme.textPrimary }]}>{profile.name}</Text>
            <Text style={{ fontSize: 11, color: activeTheme.textSecondary, fontFamily: "Lato_400Regular" }}>Online</Text>
          </View>
          {/* Voice Call */}
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: activeTheme.secondary }]}
            onPress={() => router.push(`/call/${id}?type=audio&name=${encodeURIComponent(profile.name)}` as any)}
            activeOpacity={0.8}
          >
            <Feather name="phone" size={18} color={activeTheme.primary} />
          </TouchableOpacity>
          {/* Video Call */}
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: activeTheme.secondary, marginLeft: 8 }]}
            onPress={() => router.push(`/call/${id}?type=video&name=${encodeURIComponent(profile.name)}` as any)}
            activeOpacity={0.8}
          >
            <Feather name="video" size={18} color={activeTheme.primary} />
          </TouchableOpacity>
        </View>

        {/* MESSAGES LIST */}
        <FlatList
          data={activeChatMessages}
          keyExtractor={(item) => item.clientMessageId || item.id}
          inverted
          renderItem={({ item }) => (
            <MessageBubble
              text={item.content}
              isSender={item.senderProfileId?.toLowerCase() !== profile.id?.toLowerCase()}
              timestamp={formatTime(item.createdAt)}
              theme={activeTheme}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* INPUT AREA */}
        <View style={[styles.inputContainer, { backgroundColor: activeTheme.background, borderTopColor: activeTheme.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: activeTheme.secondary, color: activeTheme.textPrimary, borderColor: activeTheme.border, borderWidth: 1 }]}
            placeholder="Type a message..."
            placeholderTextColor={activeTheme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: inputText.trim() ? activeTheme.primary : activeTheme.secondary }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color={inputText.trim() ? "#FFF" : activeTheme.textSecondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    flex: 1,
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    fontFamily: "Lato_400Regular",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginBottom: 0,
  },
});
