import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

export type ConnectionStatus = "new_match" | "liked_you" | "messaged_you" | "chat";

export interface ChatListItemProps {
  id: string;
  name: string;
  age: number;
  avatar: string;
  statusType: ConnectionStatus;
  statusText?: string; // e.g. "New match", "Liked you", "Messaged you"
  unreadCount?: number;
  theme: any;
  onPress: () => void;
}

export function ChatListItem({
  name,
  age,
  avatar,
  statusType,
  statusText,
  unreadCount,
  theme,
  onPress,
}: ChatListItemProps) {
  // Determine the right-side indicator based on statusType
  const renderIndicator = () => {
    if (statusType === "liked_you") {
      return <Ionicons name="heart-outline" size={20} color={theme.primary} />;
    }
    if (statusType === "messaged_you" || statusType === "chat") {
      return (
        <View style={styles.messageIndicatorContainer}>
          {unreadCount && unreadCount > 0 ? (
            <View style={[styles.unreadBadge, { borderColor: theme.textSecondary }]}>
              <Text style={[styles.unreadText, { color: theme.textSecondary }]}>{unreadCount}</Text>
            </View>
          ) : (
            <Ionicons name="chatbubble-outline" size={20} color={theme.textSecondary + "99"} />
          )}
          {statusType === "messaged_you" && (
            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          )}
        </View>
      );
    }
    if (statusType === "new_match") {
      return <View style={[styles.dot, { backgroundColor: theme.primary }]} />;
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.nameText, { color: theme.textPrimary }]}>
            {name}, {age}
          </Text>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            {statusText || "Active now"}
          </Text>
        </View>
        <View style={styles.indicatorContainer}>{renderIndicator()}</View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
    paddingBottom: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameText: {
    fontSize: 18,
    fontFamily: "Outfit_500Medium",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    opacity: 0.8,
  },
  indicatorContainer: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  messageIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    fontSize: 11,
    fontFamily: "Outfit_600SemiBold",
  },
});
