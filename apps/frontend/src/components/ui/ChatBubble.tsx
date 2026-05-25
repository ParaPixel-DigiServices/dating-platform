import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export interface ChatBubbleProps {
  id: string;
  text: string;
  sender: "me" | "them";
  avatar?: string;
  time?: string;
}

export function ChatBubble({ text, sender, avatar }: ChatBubbleProps) {
  const isMe = sender === "me";

  return (
    <View style={[s.msgWrapper, isMe ? s.msgWrapperMe : s.msgWrapperThem]}>
      {!isMe && avatar && (
        <Image source={{ uri: avatar }} style={s.msgAvatar} />
      )}
      <View style={[s.msgBubble, isMe ? s.msgBubbleMe : s.msgBubbleThem]}>
        <Text style={[s.msgText, isMe ? s.msgTextMe : s.msgTextThem]}>{text}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  msgWrapper: { flexDirection: "row", marginBottom: 16, alignItems: "flex-end" },
  msgWrapperMe: { justifyContent: "flex-end" },
  msgWrapperThem: { justifyContent: "flex-start" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginBottom: 4 },
  msgBubble: { maxWidth: width * 0.7, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24 },
  msgBubbleMe: { backgroundColor: "#FF4B2B", borderBottomRightRadius: 8 },
  msgBubbleThem: { backgroundColor: "#222", borderBottomLeftRadius: 8 },
  msgText: { fontSize: 15, fontFamily: "Outfit_400Regular", lineHeight: 22 },
  msgTextMe: { color: "#FFF" },
  msgTextThem: { color: "rgba(255,255,255,0.9)" },
});
