import { create } from 'zustand';

interface PhoneAuthStore {
  phoneNumber: string;
  verificationId: string | null;
  isCodeSent: boolean;
  isVerifying: boolean;
  error: string | null;

  // Actions
  setPhoneNumber: (number: string) => void;
  setVerificationId: (id: string) => void;
  setCodeSent: (sent: boolean) => void;
  setVerifying: (verifying: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePhoneAuthStore = create<PhoneAuthStore>((set) => ({
  phoneNumber: '',
  verificationId: null,
  isCodeSent: false,
  isVerifying: false,
  error: null,

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setVerificationId: (verificationId) => set({ verificationId }),
  setCodeSent: (isCodeSent) => set({ isCodeSent }),
  setVerifying: (isVerifying) => set({ isVerifying }),
  setError: (error) => set({ error }),
  reset: () => set({
    phoneNumber: '',
    verificationId: null,
    isCodeSent: false,
    isVerifying: false,
    error: null,
  }),
}));
