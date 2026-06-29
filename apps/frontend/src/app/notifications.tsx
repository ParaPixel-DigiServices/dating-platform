import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "@/theme/theme";
import { useDeckStore } from "@/hooks/useDeckStore";

// Mock data
const NOTIFICATIONS = [
  {
    id: "1",
    type: "match",
    title: "You got a new match!",
    message: "Say hi to Ananya. She also loves coffee and hiking.",
    time: "2m ago",
    unread: true,
    icon: "heart",
    iconColor: "#FF2D55",
    action: { type: "profile", id: "2" },
  },
  {
    id: "2",
    type: "likes",
    title: "50 people liked your profile",
    message: "Upgrade to premium to see who liked you.",
    time: "1h ago",
    unread: true,
    icon: "star",
    iconColor: "#FFD60A",
    action: { type: "tab", tab: "Liked You" },
  },
  {
    id: "3",
    type: "system",
    title: "Welcome to Amora!",
    message: "We're so glad you're here. Complete your profile to get more matches.",
    time: "2d ago",
    unread: false,
    icon: "info",
    iconColor: (theme as any).onboarding.primaryLight,
    action: null,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;
  const setActiveTab = useDeckStore((state) => state.setActiveTab);

  const handlePress = (item: typeof NOTIFICATIONS[0]) => {
    if (!item.action) return;
    
    if (item.action.type === "profile") {
      router.push(`/user/${item.action.id}`);
    } else if (item.action.type === "tab") {
      setActiveTab(item.action.tab);
      router.navigate("/(tabs)/home");
    }
  };

  const renderItem = ({ item }: { item: typeof NOTIFICATIONS[0] }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, item.unread && { backgroundColor: "rgba(255, 255, 255, 0.03)" }]} 
      activeOpacity={item.action ? 0.7 : 1}
      onPress={() => handlePress(item)}
    >
      <View style={styles.iconContainer}>
        <Feather name={item.icon as any} size={20} color={item.iconColor} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: t.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.message, { color: t.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {item.unread && <View style={[styles.unreadDot, { backgroundColor: t.primary }]} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.background, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="chevron-left" size={28} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* List */}
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={t.textSecondary} />
            <Text style={[styles.emptyText, { color: t.textSecondary }]}>No new notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
