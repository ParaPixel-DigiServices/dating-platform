import React, { useState } from "react";
import { View, StyleSheet, FlatList, StatusBar, Platform, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import theme from "@/theme/theme";

import { SocialSearchHeader } from "@/components/social/SocialSearchHeader";
import { SocialFilterBar } from "@/components/social/SocialFilterBar";
import { SocialFilterModal } from "@/components/social/SocialFilterModal";
import { SocialPostCard, Post } from "@/components/social/SocialPostCard";
import { useSocialStore } from "@/hooks/useSocialStore";

export default function SocialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Best"); // For the scroll chips
  const { posts, upvotePost, downvotePost } = useSocialStore();

  // Advanced Filters
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});

  const filters = ["Best", "New", "Advice", "Experiences", "Safety"];

  // Filter posts based on Search, Chip Filters, and Advanced Filters
  const filteredPosts = posts.filter(p => {
    // 1. Search Query
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.body.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 2. Chip Filters (Simple)
    if (["Advice", "Experiences", "Safety"].includes(activeFilter) && p.topic !== activeFilter) {
      return false;
    }

    // 3. Advanced Filters (Topic)
    if (advancedFilters.topic && p.topic !== advancedFilters.topic) {
      return false;
    }

    // 4. Advanced Filters (Date)
    if (advancedFilters.dateAfter && p.date < advancedFilters.dateAfter) return false;
    if (advancedFilters.dateBefore && p.date > advancedFilters.dateBefore) return false;

    // We don't have age in MOCK_POSTS for authors right now, but the logic would go here.

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: t.background, paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0) }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.background} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.headerLogo, { color: t.primary }]}>Amora</Text>
      </View>

      <SocialSearchHeader theme={t} value={searchQuery} onChangeText={setSearchQuery} />
      
      <SocialFilterBar 
        theme={t} 
        filters={filters} 
        activeFilter={activeFilter} 
        onSelectFilter={setActiveFilter} 
        onOpenFilters={() => setIsFilterModalVisible(true)}
      />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        renderItem={({ item }) => (
          <SocialPostCard
            theme={t}
            post={item}
            onPress={() => router.push(`/social/${item.id}` as any)}
            onUpvote={upvotePost}
            onDownvote={downvotePost}
            onComment={() => router.push(`/social/${item.id}` as any)}
          />
        )}
      />

      <SocialFilterModal
        theme={t}
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={(f) => {
          setAdvancedFilters(f);
        }}
      />

      {/* FAB to create new post */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: t.primary, bottom: Math.max(insets.bottom + 75, 80) }]}
        onPress={() => router.push("/social/create" as any)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={28} color="#1E1410" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
  },
  headerLogo: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    letterSpacing: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
