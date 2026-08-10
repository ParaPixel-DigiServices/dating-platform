import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface InteractedProfile {
  id: string;
  name: string;
  age?: number;
  avatar: string; // URI string for network image or local asset URI
  occupation?: string;
  location?: string;
  match?: number;
  timestamp: number; // Date.now()
}

interface InteractionStore {
  likedProfiles: InteractedProfile[];
  sparkedProfiles: InteractedProfile[];

  addLike: (profile: InteractedProfile) => void;
  removeLike: (profileId: string) => void;
  addSpark: (profile: InteractedProfile) => void;
  removeSpark: (profileId: string) => void;
  clearAll: () => void;

  hasLiked: (profileId: string) => boolean;
  hasSparked: (profileId: string) => boolean;
}

export const useInteractionStore = create<InteractionStore>()(
  persist(
    (set, get) => ({
      likedProfiles: [],
      sparkedProfiles: [],

      addLike: (profile) =>
        set((state) => {
          // Avoid duplicates
          if (state.likedProfiles.some((p) => p.id === profile.id)) return state;
          return { likedProfiles: [profile, ...state.likedProfiles] };
        }),

      removeLike: (profileId) =>
        set((state) => ({
          likedProfiles: state.likedProfiles.filter((p) => p.id !== profileId),
        })),

      addSpark: (profile) =>
        set((state) => {
          if (state.sparkedProfiles.some((p) => p.id === profile.id)) return state;
          return { sparkedProfiles: [profile, ...state.sparkedProfiles] };
        }),

      removeSpark: (profileId) =>
        set((state) => ({
          sparkedProfiles: state.sparkedProfiles.filter((p) => p.id !== profileId),
        })),

      clearAll: () => set({ likedProfiles: [], sparkedProfiles: [] }),

      hasLiked: (profileId) => get().likedProfiles.some((p) => p.id === profileId),
      hasSparked: (profileId) => get().sparkedProfiles.some((p) => p.id === profileId),
    }),
    {
      name: "interaction-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
