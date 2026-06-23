import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CategoryKey = 'Casual' | 'Love' | 'Marriage' | 'Find_Your_Roommate';

interface OnboardingStore {
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  category: CategoryKey | null;
  subCategory: string | null;

  // Actions
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setGender: (gender: string | null) => void;
  setDateOfBirth: (date: string | null) => void;
  setCategory: (category: CategoryKey | null) => void;
  setSubCategory: (subCategory: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      firstName: '',
      lastName: '',
      gender: null,
      dateOfBirth: null,
      category: null,
      subCategory: null,

      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setGender: (gender) => set({ gender }),
      setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
      setCategory: (category) => set({ category }),
      setSubCategory: (subCategory) => set({ subCategory }),
      reset: () => set({
        firstName: '',
        lastName: '',
        gender: null,
        dateOfBirth: null,
        category: null,
        subCategory: null,
      }),
    }),
    {
      name: 'onboarding-storage-v2',  // Bumped to flush stale category:null data
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
