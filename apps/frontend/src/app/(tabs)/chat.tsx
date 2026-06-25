import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import theme from "@/theme/theme";
import { ChatListItem, ConnectionStatus } from "@/components/chat/ChatListItem";

const MOCK_CONNECTIONS = [
  {
    id: "1",
    name: "Ananya",
    age: 25,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    statusType: "new_match" as ConnectionStatus,
    statusText: "New match",
  },
  {
    id: "2",
    name: "Karan",
    age: 27,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    statusType: "liked_you" as ConnectionStatus,
    statusText: "Liked you",
  },
  {
    id: "3",
    name: "Meera",
    age: 24,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    statusType: "new_match" as ConnectionStatus,
    statusText: "New match",
  },
  {
    id: "4",
    name: "Arjun",
    age: 26,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    statusType: "messaged_you" as ConnectionStatus,
    statusText: "Messaged you",
    unreadCount: 2,
  },
  {
    id: "5",
    name: "Sneha",
    age: 25,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    statusType: "new_match" as ConnectionStatus,
    statusText: "New match",
  },
];

type FilterTab = "All" | "Likes You" | "Matches" | "Chats";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeTheme = (theme as any).onboarding;

  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const filters: FilterTab[] = ["All", "Likes You", "Matches", "Chats"];

  const filteredConnections = useMemo(() => {
    switch (activeFilter) {
      case "Likes You":
        return MOCK_CONNECTIONS.filter((c) => c.statusType === "liked_you");
      case "Matches":
        return MOCK_CONNECTIONS.filter((c) => c.statusType === "new_match");
      case "Chats":
        return MOCK_CONNECTIONS.filter((c) => c.statusType === "messaged_you" || c.statusType === "chat");
      case "All":
      default:
        return MOCK_CONNECTIONS;
    }
  }, [activeFilter]);

  const handlePressChat = (id: string) => {
    router.push(`/chat/${id}` as any);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: activeTheme.background, paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      <StatusBar barStyle="light-content" backgroundColor={activeTheme.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: activeTheme.textPrimary }]}>Connections</Text>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                isActive && { borderBottomColor: activeTheme.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isActive ? activeTheme.textPrimary : activeTheme.textSecondary,
                    fontFamily: isActive ? "PlayfairDisplay_700Bold" : "Lato_400Regular"
                  }
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CONNECTIONS LIST */}
      <FlatList
        data={filteredConnections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            id={item.id}
            name={item.name}
            age={item.age}
            avatar={item.avatar}
            statusType={item.statusType}
            statusText={item.statusText}
            unreadCount={item.unreadCount}
            theme={activeTheme}
            onPress={() => handlePressChat(item.id)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
    marginBottom: 8,
  },
  filterTab: {
    marginRight: 24,
    paddingBottom: 10,
  },
  filterText: {
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 100,
  },
});
