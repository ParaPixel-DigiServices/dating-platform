import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { Feather } from "@expo/vector-icons";
import theme from "@/theme/theme";
import { ChatListItem, ConnectionStatus } from "@/components/chat/ChatListItem";

import { useChatStore } from "@/hooks/useChatStore";
type FilterTab = "Requests" | "Socials" | "Matches";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeTheme = (theme as any).onboarding;

  const { inbox, fetchInbox, loadingInbox } = useChatStore();

  React.useEffect(() => {
    fetchInbox().then(() => {
      console.log("FETCHED INBOX FROM STORE:", useChatStore.getState().inbox);
    });
  }, []);

  const formattedInbox = useMemo(() => {
    return inbox.map(c => ({
      id: c.matchId,
      name: c.otherProfile.name,
      age: 0, // Not typically used on this list design anyway
      avatar: c.otherProfile.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      statusType: "chat" as ConnectionStatus,
      statusText: c.latestMessage ? c.latestMessage.content : "New match!",
      unreadCount: c.unreadCount,
    }));
  }, [inbox]);

  const [activeFilter, setActiveFilter] = useState<FilterTab>("Matches");
  const [searchQuery, setSearchQuery] = useState("");
  const filters: FilterTab[] = ["Matches", "Socials", "Requests"];

  const filteredConnections = useMemo(() => {
    let result = formattedInbox;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    // For now, MVP puts all live chats under Matches since we don't have separate Group chats yet
    return result;
  }, [activeFilter, formattedInbox, searchQuery]);

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
            onAccept={() => {}}
            onReject={() => {}}
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
