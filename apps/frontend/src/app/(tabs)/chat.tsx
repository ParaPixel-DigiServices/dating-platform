import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { Feather } from "@expo/vector-icons";
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
  {
    id: "req1",
    name: "Rohan",
    age: 28,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    statusType: "request" as ConnectionStatus,
    statusText: "Sent a message request",
    unreadCount: 1,
  },
  {
    id: "req2",
    name: "Aarav",
    age: 26,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    statusType: "request" as ConnectionStatus, 
    statusText: "Wants to connect",
  },
  {
    id: "soc1",
    name: "Weekend Hikers",
    age: 0,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    statusType: "social" as ConnectionStatus,
    statusText: "Group chat",
    unreadCount: 3,
  },
];

type FilterTab = "Requests" | "Socials" | "Matches";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeTheme = (theme as any).onboarding;

  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("Matches");
  const [searchQuery, setSearchQuery] = useState("");
  const filters: FilterTab[] = ["Matches", "Socials", "Requests"];

  const handleAcceptRequest = (id: string) => {
    setConnections(connections.map(c => c.id === id ? { ...c, statusType: "social" } : c));
  };

  const handleRejectRequest = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
  };

  const filteredConnections = useMemo(() => {
    let result = connections;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    switch (activeFilter) {
      case "Requests":
        return result.filter((c) => c.statusType === "request" || c.statusType === "liked_you");
      case "Socials":
        return result.filter((c) => c.statusType === "social");
      case "Matches":
      default:
        return result.filter((c) => c.statusType === "new_match" || c.statusType === "messaged_you" || c.statusType === "chat");
    }
  }, [activeFilter, connections, searchQuery]);

  const handlePressChat = (id: string) => {
    router.push(`/chat/${id}` as any);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: activeTheme.background, paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      <StatusBar barStyle="light-content" backgroundColor={activeTheme.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerLogo, { color: activeTheme.primary }]}>Amora</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={[styles.searchBar, { backgroundColor: activeTheme.secondary, borderColor: activeTheme.border, borderWidth: 1 }]}>
          <Feather name="search" size={18} color={activeTheme.textSecondary} />
          <TextInput
            placeholder="Search connections..."
            placeholderTextColor={activeTheme.textSecondary}
            style={[styles.searchInput, { color: activeTheme.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
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
            age={item.statusType === "social" ? 0 : item.age}
            avatar={item.avatar}
            statusType={item.statusType}
            statusText={item.statusText}
            unreadCount={item.unreadCount}
            theme={activeTheme}
            onAccept={() => handleAcceptRequest(item.id)}
            onReject={() => handleRejectRequest(item.id)}
            onPress={() => {
              if (item.statusType !== "request" && item.statusType !== "liked_you") {
                handlePressChat(item.id);
              }
            }}
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
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerLogo: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Lato_400Regular",
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
