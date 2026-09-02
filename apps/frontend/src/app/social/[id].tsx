import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import theme from "@/theme/theme";
import { SocialPostCard, Post } from "@/components/social/SocialPostCard";
import { useSocialStore } from "@/hooks/useSocialStore";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;

  const { activePost, fetchPostDetails, upvotePost, downvotePost, addComment, loading } = useSocialStore();

  React.useEffect(() => {
    if (id) {
      fetchPostDetails(id as string);
    }
  }, [id]);

  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    await addComment({
      postId: id as string,
      body: commentText.trim(),
      isAnonymous
    });
    setCommentText("");
  };

  if (!activePost && loading) {
    return (
      <View style={[styles.container, { backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: t.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  if (!activePost) {
    return (
      <View style={[styles.container, { backgroundColor: t.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: t.textPrimary }}>Post not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 30 : 0), borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={t.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Community Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={(activePost as any).comments || []}
        keyExtractor={(item: any) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <View style={{ paddingTop: 16 }}>
            <SocialPostCard
              theme={t}
              post={activePost}
              onUpvote={() => upvotePost(activePost.id)}
              onDownvote={() => downvotePost(activePost.id)}
              onComment={() => {}}
            />
            <Text style={[styles.commentsTitle, { color: t.textPrimary, borderBottomColor: t.border }]}>
              Comments ({activePost.commentCount})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.commentCard, { borderBottomColor: t.border }]}>
            <Image 
              source={{ uri: item.authorAvatar || "https://ui-avatars.com/api/?name=Anonymous&background=1E1410&color=e5b399" }} 
              style={styles.commentAvatar} 
            />
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: t.textPrimary }]}>{item.authorName || "Anonymous User"}</Text>
                <Text style={[styles.commentTime, { color: t.textSecondary }]}>{item.timeAgo}</Text>
              </View>
              <Text style={[styles.commentText, { color: t.textSecondary }]}>{item.body}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.inputContainer, { backgroundColor: t.secondary, borderTopColor: t.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TextInput
          style={[styles.input, { color: t.textPrimary, borderColor: t.border }]}
          placeholder="Add a comment..."
          placeholderTextColor={t.textSecondary}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: commentText.trim() ? t.primary : t.border }]} 
          disabled={!commentText.trim()}
          onPress={handleSendComment}
        >
          <Feather name="send" size={16} color={commentText.trim() ? "#1E1410" : t.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0.5,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 16,
    borderBottomWidth: 1,
  },
  commentCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 12,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 15,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  commentTime: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    opacity: 0.7,
  },
  commentText: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    lineHeight: 22,
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: "Lato_400Regular",
    marginRight: 12,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
