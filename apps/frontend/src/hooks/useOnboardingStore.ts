import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingStore {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  category: 'love' | 'marriage' | 'casual' | null;

  // Actions
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setDateOfBirth: (date: string | null) => void;
  setCategory: (category: 'love' | 'marriage' | 'casual' | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      category: null,

      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
      setCategory: (category) => set({ category }),
      reset: () => set({
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        category: null,
      }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
