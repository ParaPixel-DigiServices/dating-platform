import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import theme from "@/theme/theme";
import { SocialPostCard, Post } from "@/components/social/SocialPostCard";

const MOCK_POST: Post = {
  id: "p1",
  authorName: "Ananya",
  authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  isAnonymous: false,
  title: "How do you politely decline a second date?",
  body: "I went on a date yesterday and he was nice, but there was absolutely zero spark. He just texted me asking to meet up again this weekend. What's the best way to let him down easy without ghosting?",
  upvotes: 245,
  commentCount: 84,
  timeAgo: "2h ago",
  date: "2026-06-24",
  topic: "Advice",
  userVote: null,
};

const MOCK_COMMENTS = [
  {
    id: "c1",
    authorName: "Priya",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    text: "Just be honest! Tell him you had a nice time but didn't feel a romantic connection.",
    timeAgo: "1h ago",
  },
  {
    id: "c2",
    authorName: "Anonymous",
    authorAvatar: null,
    text: "I usually say something like 'Hey! It was great meeting you, but I don't see this going further. Wishing you the best!' Simple and clear.",
    timeAgo: "45m ago",
  },
];

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = (theme as any).onboarding;

  const [post, setPost] = useState(MOCK_POST);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState("");

  const handleUpvote = () => {
    const offset = post.userVote === "up" ? -1 : (post.userVote === "down" ? 2 : 1);
    setPost({ ...post, userVote: post.userVote === "up" ? null : "up", upvotes: post.upvotes + offset });
  };
  const handleDownvote = () => {
    const offset = post.userVote === "down" ? -1 : (post.userVote === "up" ? 2 : 1);
    setPost({ ...post, userVote: post.userVote === "down" ? null : "down", upvotes: post.upvotes - offset });
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      authorName: "You",
      authorAvatar: null,
      text: commentText.trim(),
      timeAgo: "Just now",
    };
    setComments([...comments, newComment]);
    setPost({ ...post, commentCount: comments.length + 1 });
    setCommentText("");
  };

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
        data={comments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <View style={{ paddingTop: 16 }}>
            <SocialPostCard
              theme={t}
              post={post}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onComment={() => {}}
            />
            <Text style={[styles.commentsTitle, { color: t.textPrimary, borderBottomColor: t.border }]}>
              Comments ({comments.length})
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
              <Text style={[styles.commentText, { color: t.textSecondary }]}>{item.text}</Text>
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
