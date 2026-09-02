import { create } from "zustand";
import { getSocialTopics, getSocialPosts, getSocialPost, createSocialPost, createSocialComment, voteSocial } from "@/services/backendService";

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  authorId: string | null;
  isAnonymous: boolean;
  title: string;
  body: string;
  upvotes: number;     // Now mapped to voteCount
  commentCount: number;
  timeAgo: string;
  date: string;
  topic: any;          // Full topic object from backend
  userVote: "up" | "down" | null;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  isAnonymous: boolean;
  body: string;
  voteCount: number;
  timeAgo: string;
  date: string;
  userVote: "up" | "down" | null;
}

interface SocialStore {
  topics: any[];
  posts: Post[];
  activePost: Post | null;
  loading: boolean;
  
  fetchTopics: () => Promise<void>;
  fetchPosts: (topicId?: string, search?: string) => Promise<void>;
  fetchPostDetails: (id: string) => Promise<void>;
  
  addPost: (post: { topicId: string; title: string; body: string; isAnonymous: boolean }) => Promise<void>;
  addComment: (data: { postId: string; parentId?: string; body: string; isAnonymous: boolean }) => Promise<void>;
  
  upvotePost: (id: string) => Promise<void>;
  downvotePost: (id: string) => Promise<void>;
  
  // Quick local optimistic updates for comment votes inside activePost
  upvoteComment: (id: string) => Promise<void>;
  downvoteComment: (id: string) => Promise<void>;
}

export const useSocialStore = create<SocialStore>((set, get) => ({
  topics: [],
  posts: [],
  activePost: null,
  loading: false,

  fetchTopics: async () => {
    try {
      const topics = await getSocialTopics();
      set({ topics });
    } catch (e) {
      console.error("Failed to fetch topics", e);
    }
  },

  fetchPosts: async (topicId, search) => {
    set({ loading: true });
    try {
      const rawPosts = await getSocialPosts(topicId, search);
      // Map to match frontend Post interface
      const mappedPosts = rawPosts.map((p: any) => ({
        ...p,
        upvotes: p.voteCount,
      }));
      set({ posts: mappedPosts, loading: false });
    } catch (e) {
      console.error("Failed to fetch posts", e);
      set({ loading: false });
    }
  },

  fetchPostDetails: async (id) => {
    set({ loading: true });
    try {
      const rawPost = await getSocialPost(id);
      const mappedPost = {
        ...rawPost,
        upvotes: rawPost.voteCount,
        comments: rawPost.comments?.map((c: any) => ({
          ...c,
        })) || []
      };
      set({ activePost: mappedPost, loading: false });
    } catch (e) {
      console.error("Failed to fetch post details", e);
      set({ loading: false });
    }
  },

  addPost: async (postData) => {
    try {
      await createSocialPost(postData);
      // Simply refetch posts to get the newly created post with correct DB values
      await get().fetchPosts();
    } catch (e) {
      console.error("Failed to create post", e);
    }
  },

  addComment: async (data) => {
    try {
      await createSocialComment(data);
      // Refetch post details
      await get().fetchPostDetails(data.postId);
    } catch (e) {
      console.error("Failed to create comment", e);
    }
  },

  upvotePost: async (id) => {
    // Optimistic UI update
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === id) {
          if (p.userVote === "up") return { ...p, userVote: null, upvotes: p.upvotes - 1 };
          const offset = p.userVote === "down" ? 2 : 1;
          return { ...p, userVote: "up", upvotes: p.upvotes + offset };
        }
        return p;
      }),
      activePost: state.activePost?.id === id ? (() => {
        const p = state.activePost;
        if (p.userVote === "up") return { ...p, userVote: null, upvotes: p.upvotes - 1 };
        const offset = p.userVote === "down" ? 2 : 1;
        return { ...p, userVote: "up", upvotes: p.upvotes + offset };
      })() : state.activePost
    }));

    try {
      await voteSocial({ targetType: 'POST', targetId: id, value: 1 });
    } catch (e) {
      // Revert omitted for brevity
      console.error("Vote failed", e);
    }
  },

  downvotePost: async (id) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === id) {
          if (p.userVote === "down") return { ...p, userVote: null, upvotes: p.upvotes + 1 };
          const offset = p.userVote === "up" ? 2 : 1;
          return { ...p, userVote: "down", upvotes: p.upvotes - offset };
        }
        return p;
      }),
      activePost: state.activePost?.id === id ? (() => {
        const p = state.activePost;
        if (p.userVote === "down") return { ...p, userVote: null, upvotes: p.upvotes + 1 };
        const offset = p.userVote === "up" ? 2 : 1;
        return { ...p, userVote: "down", upvotes: p.upvotes - offset };
      })() : state.activePost
    }));

    try {
      await voteSocial({ targetType: 'POST', targetId: id, value: -1 });
    } catch (e) {
      console.error("Vote failed", e);
    }
  },

  upvoteComment: async (id) => {
    set((state) => {
      if (!state.activePost) return state;
      const newComments = (state.activePost as any).comments.map((c: any) => {
        if (c.id === id) {
          if (c.userVote === "up") return { ...c, userVote: null, voteCount: c.voteCount - 1 };
          const offset = c.userVote === "down" ? 2 : 1;
          return { ...c, userVote: "up", voteCount: c.voteCount + offset };
        }
        return c;
      });
      return { activePost: { ...state.activePost, comments: newComments } };
    });
    try {
      await voteSocial({ targetType: 'COMMENT', targetId: id, value: 1 });
    } catch (e) {}
  },

  downvoteComment: async (id) => {
    set((state) => {
      if (!state.activePost) return state;
      const newComments = (state.activePost as any).comments.map((c: any) => {
        if (c.id === id) {
          if (c.userVote === "down") return { ...c, userVote: null, voteCount: c.voteCount + 1 };
          const offset = c.userVote === "up" ? 2 : 1;
          return { ...c, userVote: "down", voteCount: c.voteCount - offset };
        }
        return c;
      });
      return { activePost: { ...state.activePost, comments: newComments } };
    });
    try {
      await voteSocial({ targetType: 'COMMENT', targetId: id, value: -1 });
    } catch (e) {}
  }
}));
