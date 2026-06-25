import { create } from "zustand";
import { Post } from "@/components/social/SocialPostCard";

interface SocialStore {
  posts: Post[];
  addPost: (post: Omit<Post, "id" | "upvotes" | "commentCount" | "timeAgo" | "date" | "userVote">) => void;
  upvotePost: (id: string) => void;
  downvotePost: (id: string) => void;
}

const INITIAL_POSTS: Post[] = [
  {
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
  },
  {
    id: "p2",
    authorName: "Anonymous",
    authorAvatar: null,
    isAnonymous: true,
    title: "Red flags or am I overthinking?",
    body: "We've been talking for two weeks and he's super sweet, but he refuses to share any details about his work or where he lives. He says he's just 'private'. Is this normal or a huge red flag?",
    upvotes: 892,
    commentCount: 213,
    timeAgo: "5h ago",
    date: "2026-06-24",
    topic: "Safety",
    userVote: "up",
  },
  {
    id: "p3",
    authorName: "Meera",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    isAnonymous: false,
    title: "Safety tips for first dates?",
    body: "Meeting someone from an app for the first time tomorrow. We're getting coffee in the afternoon. Any specific safety rituals you ladies swear by?",
    upvotes: 534,
    commentCount: 112,
    timeAgo: "1d ago",
    date: "2026-06-23",
    topic: "Safety",
    userVote: null,
  },
];

export const useSocialStore = create<SocialStore>((set) => ({
  posts: INITIAL_POSTS,
  addPost: (postData) =>
    set((state) => {
      const newPost: Post = {
        ...postData,
        id: Date.now().toString(),
        upvotes: 0,
        commentCount: 0,
        timeAgo: "Just now",
        date: new Date().toISOString().split("T")[0],
        userVote: null,
      };
      return { posts: [newPost, ...state.posts] };
    }),
  upvotePost: (id) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === id) {
          if (p.userVote === "up") return { ...p, userVote: null, upvotes: p.upvotes - 1 };
          const offset = p.userVote === "down" ? 2 : 1;
          return { ...p, userVote: "up", upvotes: p.upvotes + offset };
        }
        return p;
      }),
    })),
  downvotePost: (id) =>
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === id) {
          if (p.userVote === "down") return { ...p, userVote: null, upvotes: p.upvotes + 1 };
          const offset = p.userVote === "up" ? 2 : 1;
          return { ...p, userVote: "down", upvotes: p.upvotes - offset };
        }
        return p;
      }),
    })),
}));
