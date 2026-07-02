import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SparkQuestions {
  q1: string;
  q2: string;
  q3: string;
}

export interface ProfileCompletionStore {
  profileCompleted: boolean;
  profileAnswers: Record<string, string>;
  sparkQuestions: SparkQuestions;

  setAnswer: (questionId: string, answer: string) => void;
  markProfileCompleted: () => void;
  setSparkQuestions: (questions: SparkQuestions) => void;
  reset: () => void;
}

const DEFAULT_SPARK_QUESTIONS: SparkQuestions = {
  q1: "What is one thing you are deeply passionate about and why?",
  q2: "What does your ideal Sunday look like?",
  q3: "What is something most people don't know about you?",
};

export const useProfileCompletionStore = create<ProfileCompletionStore>()(
  persist(
    (set) => ({
      profileCompleted: false,
      profileAnswers: {},
      sparkQuestions: DEFAULT_SPARK_QUESTIONS,

      setAnswer: (questionId, answer) =>
        set((state) => ({
          profileAnswers: { ...state.profileAnswers, [questionId]: answer },
        })),

      markProfileCompleted: () => set({ profileCompleted: true }),

      setSparkQuestions: (questions) => set({ sparkQuestions: questions }),

      reset: () =>
        set({
          profileCompleted: false,
          profileAnswers: {},
          sparkQuestions: DEFAULT_SPARK_QUESTIONS,
        }),
    }),
    {
      name: 'profile-completion-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { DEFAULT_SPARK_QUESTIONS };
