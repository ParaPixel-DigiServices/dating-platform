import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  isAnonymous: boolean;
  title: string;
  body: string;
  upvotes: number;
  commentCount: number;
  timeAgo: string;
  date: string; // YYYY-MM-DD
  topic: string;
  userVote: "up" | "down" | null;
}

interface Props {
  theme: any;
  post: Post;
  onPress?: () => void;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onComment: (id: string) => void;
}

export function SocialPostCard({ theme: t, post, onPress, onUpvote, onDownvote, onComment }: Props) {
  const isUpvoted = post.userVote === "up";
  const isDownvoted = post.userVote === "down";

  // Determine display author
  const displayName = post.isAnonymous ? "Anonymous User" : post.authorName;
  const displayAvatar = post.isAnonymous || !post.authorAvatar
    ? "https://ui-avatars.com/api/?name=Anonymous&background=1E1410&color=e5b399"
    : post.authorAvatar;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: t.secondary, borderColor: t.border }]} 
      activeOpacity={0.9} 
      onPress={onPress}
      disabled={!onPress}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Image source={{ uri: displayAvatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={[styles.authorName, { color: t.textPrimary }]}>{displayName}</Text>
          <Text style={[styles.timeAgo, { color: t.textSecondary }]}>{post.timeAgo}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Feather name="more-horizontal" size={20} color={t.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: t.textPrimary }]}>{post.title}</Text>
        <Text style={[styles.content, { color: t.textSecondary }]} numberOfLines={onPress ? 4 : undefined}>
          {post.body}
        </Text>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <View style={styles.voteGroup}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onUpvote(post.id)}>
            <Feather name="arrow-up" size={20} color={isUpvoted ? t.primary : t.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.voteCount, { color: isUpvoted || isDownvoted ? t.primary : t.textPrimary }]}>
            {post.upvotes}
          </Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onDownvote(post.id)}>
            <Feather name="arrow-down" size={20} color={isDownvoted ? t.primary : t.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.commentBtn} onPress={() => onComment(post.id)}>
          <Feather name="message-square" size={18} color={t.textSecondary} />
          <Text style={[styles.commentCount, { color: t.textSecondary }]}>{post.commentCount}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: "Lato_400Regular",
    marginTop: 2,
    opacity: 0.8,
  },
  moreBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    fontFamily: "Lato_400Regular",
    lineHeight: 20,
    opacity: 0.9,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  actionBtn: {
    padding: 8,
  },
  voteCount: {
    fontSize: 13,
    fontFamily: "Lato_700Bold",
    marginHorizontal: 4,
  },
  commentBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  commentCount: {
    fontSize: 13,
    fontFamily: "Lato_700Bold",
    marginLeft: 6,
  },
});
