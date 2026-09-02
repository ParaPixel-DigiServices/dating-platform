import { create } from 'zustand';
import { Profile } from '@/components/home/MatchCard';

export interface FilterState {
  gender?: string;
  religion?: string;
  distance?: number;
  ageRange?: [number, number];
  verifiedOnly?: boolean;
}

interface DeckStore {
  masterProfiles: Profile[];
  profiles: Profile[];
  activeTab: string;
  filters: FilterState;
  unreadCount: number;

  isLoading: boolean;
  
  // Actions
  fetchDeck: () => Promise<void>;
  swipeApi: (targetProfileId: string, type: 'LIKE' | 'PASS' | 'SUPER_LIKE') => Promise<{ matched: boolean; matchId?: string }>;
  setMasterProfiles: (profiles: Profile[]) => void;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: FilterState) => void;
  setUnreadCount: (count: number) => void;
  swipeProfile: () => void;
  applyFilters: () => void;
}

import apiClient from '../services/backendService';

export const useDeckStore = create<DeckStore>((set, get) => ({
  masterProfiles: [],
  profiles: [],
  activeTab: "For You",
  filters: {},
  unreadCount: 0,
  isLoading: false,

  fetchDeck: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/deck');
      const payload = res.data?.data || res.data;
      if (payload && Array.isArray(payload)) {
        set({ masterProfiles: payload });
        get().applyFilters();
      }
    } catch (error) {
      console.error('Failed to fetch deck:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  swipeApi: async (targetProfileId, type) => {
    try {
      const res = await apiClient.post('/interaction/swipe', { targetProfileId, type });
      const payload = res.data?.data || res.data;
      return payload;
    } catch (error) {
      console.error('Failed to register swipe API:', error);
      return { matched: false };
    }
  },

  setMasterProfiles: (profiles) => {
    set({ masterProfiles: profiles });
    get().applyFilters();
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    get().applyFilters();
  },

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  swipeProfile: () => set((state) => {
    if (state.profiles.length === 0) return state;
    const swipedId = state.profiles[0].id;
    return {
      profiles: state.profiles.slice(1),
      masterProfiles: state.masterProfiles.filter(p => p.id !== swipedId)
    };
  }),

  applyFilters: () => {
    const { masterProfiles, activeTab, filters } = get();
    
    let filtered = [...masterProfiles];

    // 1. Tab Filtering removed as per user request (keep all tabs same)

    // 2. Modal Filtering
    if (filters.gender && filters.gender !== "Everyone") {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }
    
    if (filters.religion) {
      filtered = filtered.filter(p => p.religion === filters.religion);
    }
    
    if (filters.distance !== undefined) {
      filtered = filtered.filter(p => (p.distanceNum || 0) <= filters.distance!);
    }
    
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange;
      filtered = filtered.filter(p => p.age >= minAge && p.age <= maxAge);
    }
    
    if (filters.verifiedOnly) {
      filtered = filtered.filter(p => p.verified === true);
    }

    set({ profiles: filtered });
  }
}));
