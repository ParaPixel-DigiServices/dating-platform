import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CategoryKey = 'LOVE' | 'MARRIAGE';
export type MarriageProgress = 'SUB_CATEGORY' | 'BASIC_DETAILS' | 'FAMILY' | 'INTERESTS';

interface MarriageFormData {
  maritalStatus: string;
  height: string;
  education: string;
  college: string;
  annualIncome: string;
  workSector: string;
  workRole: string;
  workCompany: string;
  diet: string;
  family: string;
  familyIncome: string;
  fatherName: string;
  motherName: string;
  brotherCount: string;
  sisterCount: string;
  relocationPreference: string;
  disabilityStatus: string;
}

interface OnboardingStore {
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  category: CategoryKey | null;
  subCategory: string | null;
  
  marriageProgress: MarriageProgress | null;
  marriageFormData: MarriageFormData;

  // Actions
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setGender: (gender: string | null) => void;
  setDateOfBirth: (date: string | null) => void;
  setCategory: (category: CategoryKey | null) => void;
  setSubCategory: (subCategory: string | null) => void;
  
  setMarriageProgress: (progress: MarriageProgress | null) => void;
  updateMarriageFormData: (data: Partial<MarriageFormData>) => void;
  
  reset: () => void;
}

const defaultMarriageFormData: MarriageFormData = {
  maritalStatus: '',
  height: '',
  education: '',
  college: '',
  annualIncome: '',
  workSector: '',
  workRole: '',
  workCompany: '',
  diet: '',
  family: '',
  familyIncome: '',
  fatherName: '',
  motherName: '',
  brotherCount: '',
  sisterCount: '',
  relocationPreference: '',
  disabilityStatus: '',
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      firstName: '',
      lastName: '',
      gender: null,
      dateOfBirth: null,
      category: null,
      subCategory: null,
      
      marriageProgress: null,
      marriageFormData: defaultMarriageFormData,

      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setGender: (gender) => set({ gender }),
      setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
      setCategory: (category) => set({ category }),
      setSubCategory: (subCategory) => set({ subCategory }),
      
      setMarriageProgress: (marriageProgress) => set({ marriageProgress }),
      updateMarriageFormData: (data) => set((state) => ({ 
        marriageFormData: { ...state.marriageFormData, ...data } 
      })),
      
      reset: () => set({
        firstName: '',
        lastName: '',
        gender: null,
        dateOfBirth: null,
        category: null,
        subCategory: null,
        marriageProgress: null,
        marriageFormData: defaultMarriageFormData,
      }),
    }),
    {
      name: 'onboarding-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
