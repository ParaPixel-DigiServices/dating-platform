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

  // Actions
  setMasterProfiles: (profiles: Profile[]) => void;
  setActiveTab: (tab: string) => void;
  setFilters: (filters: FilterState) => void;
  swipeProfile: () => void;
  applyFilters: () => void;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  masterProfiles: [],
  profiles: [],
  activeTab: "For You",
  filters: {},

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

    // 1. Tab Filtering
    if (activeTab === "Liked You") {
      filtered = filtered.filter(p => p.liked === true);
    } else if (activeTab === "Recently Active") {
      filtered = filtered.filter(p => p.recentlyActive === true);
    }
    // "For You" includes everyone

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
