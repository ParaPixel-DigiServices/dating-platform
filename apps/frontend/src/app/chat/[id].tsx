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

// Mock user profiles to fetch details based on ID
const MOCK_PROFILES: Record<string, { name: string; avatar: string }> = {
  "1": { name: "Ananya", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  "2": { name: "Karan", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  "3": { name: "Meera", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  "4": { name: "Arjun", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  "5": { name: "Sneha", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
};

// Mock conversation history
const INITIAL_MESSAGES = [
  { id: "msg_1", text: "Hey! How are you doing?", isSender: false, timestamp: "10:30 AM" },
  { id: "msg_2", text: "I'm good, thanks! How about you?", isSender: true, timestamp: "10:32 AM" },
  { id: "msg_3", text: "Doing great. Loved your profile pics!", isSender: false, timestamp: "10:35 AM" },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const activeTheme = (theme as any).onboarding;

  const profile = MOCK_PROFILES[id as string] || { name: "Match", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80" };

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim() === "") return;
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      text: inputText.trim(),
      isSender: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText("");
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
          <Text style={[styles.headerName, { color: activeTheme.textPrimary }]}>{profile.name}</Text>
          <TouchableOpacity style={styles.moreBtn}>
            <Feather name="more-horizontal" size={24} color={activeTheme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* MESSAGES LIST */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              text={item.text}
              isSender={item.isSender}
              timestamp={item.timestamp}
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
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  moreBtn: {
    padding: 4,
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
