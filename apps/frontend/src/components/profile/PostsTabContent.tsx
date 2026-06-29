import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SocialPostCard, Post } from "@/components/social/SocialPostCard";
import { useSocialStore } from "@/hooks/useSocialStore";

interface Props {
  textPrimary: string;
  theme: any;
  profileId: string;
  profileName: string;
}

// Generate a few dummy posts authored by this specific user
const getMockUserPosts = (profileId: string, profileName: string): Post[] => [
  {
    id: `${profileId}-post-1`,
    authorName: profileName,
    authorAvatar: null,
    isAnonymous: false,
    title: "My weekend hiking adventure",
    body: `Just got back from an incredible trail at the hills! The views were absolutely breathtaking and I highly recommend it to anyone who loves the outdoors. There's something magical about waking up early and watching the sunrise from a mountain peak.`,
    upvotes: 42,
    commentCount: 8,
    timeAgo: "2h ago",
    date: "2024-10-20",
    topic: "Experiences",
    userVote: null,
  },
  {
    id: `${profileId}-post-2`,
    authorName: profileName,
    authorAvatar: null,
    isAnonymous: false,
    title: "Tips for a great first date",
    body: `After going on many first dates, I've learned that the best ones aren't about impressing someone — they're about being genuinely curious about them. Ask real questions. Be present. Put the phone away. The rest takes care of itself.`,
    upvotes: 127,
    commentCount: 21,
    timeAgo: "1d ago",
    date: "2024-10-19",
    topic: "Advice",
    userVote: null,
  },
  {
    id: `${profileId}-post-3`,
    authorName: profileName,
    authorAvatar: null,
    isAnonymous: false,
    title: "Why I love cooking for people",
    body: `Food is my love language. There's nothing better than having friends over, spending the whole afternoon cooking together, and then sitting around the table just laughing. If I cook for you, you're definitely special to me.`,
    upvotes: 65,
    commentCount: 13,
    timeAgo: "3d ago",
    date: "2024-10-17",
    topic: "Experiences",
    userVote: null,
  },
];

export function PostsTabContent({ textPrimary, theme, profileId, profileName }: Props) {
  const router = useRouter();
  const { upvotePost, downvotePost } = useSocialStore();

  const userPosts = getMockUserPosts(profileId, profileName);

  return (
    <View style={styles.container}>
      {userPosts.map((post) => (
        <SocialPostCard
          key={post.id}
          theme={theme}
          post={post}
          onPress={() => router.push(`/social/${post.id}` as any)}
          onUpvote={upvotePost}
          onDownvote={downvotePost}
          onComment={() => router.push(`/social/${post.id}` as any)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 40,
  },
});
