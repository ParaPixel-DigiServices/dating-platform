import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ConversationItemProps {
  id: string;
  name: string;
  time: string;
  lastMessage: string;
  unread: number;
  read: boolean;
  image: string;
  onPress: () => void;
}

export function ConversationItem({
  name,
  time,
  lastMessage,
  unread,
  read,
  image,
  onPress,
}: ConversationItemProps) {
  return (
    <TouchableOpacity style={s.convRow} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: image }} style={s.convAvatar} />
      <View style={s.convContent}>
        <View style={s.convTop}>
          <Text style={s.convName}>{name}</Text>
          <Text style={[s.convTime, unread > 0 && s.convTimeUnread]}>{time}</Text>
        </View>
        <View style={s.convBottom}>
          <View style={s.msgPreview}>
            {read && (
              <Ionicons
                name="checkmark-done"
                size={16}
                color="#FFF"
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[s.convMsg, unread > 0 && s.msgUnread]} numberOfLines={1}>
              {lastMessage}
            </Text>
          </View>
          {unread > 0 && (
            <View style={s.unreadBadge}>
              <Text style={s.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  convAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  convContent: { flex: 1 },
  convTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  convName: { fontSize: 16, fontFamily: "Outfit_600SemiBold", color: "#FFF" },
  convTime: { fontSize: 12, fontFamily: "Outfit_400Regular", color: "rgba(255,255,255,0.5)" },
  convTimeUnread: { color: "#FF4B2B", fontFamily: "Outfit_600SemiBold" },
  convBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  msgPreview: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
  convMsg: { fontSize: 14, fontFamily: "Outfit_400Regular", color: "rgba(255,255,255,0.6)", flex: 1 },
  msgUnread: { color: "#FFF", fontFamily: "Outfit_500Medium" },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: { color: "#FFF", fontSize: 11, fontFamily: "Outfit_700Bold" },
});
