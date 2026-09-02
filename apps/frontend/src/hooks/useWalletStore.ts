import { create } from 'zustand';
import apiClient from '../services/backendService';

interface WalletStore {
  balance: number;
  isLoading: boolean;
  fetchWallet: () => Promise<void>;
  addCoins: (amount: number, description: string) => Promise<void>;
  spendCoins: (amount: number) => boolean; // Mock spending for now, real spending handled in backend logic usually
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  balance: 0,
  isLoading: false,
  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/user/wallet');
      const payload = res.data?.data || res.data;
      if (payload?.balance !== undefined) {
        set({ balance: payload.balance });
      } else {
        console.error('Wallet response has no balance:', res.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch wallet:', error?.response?.data || error);
    } finally {
      set({ isLoading: false });
    }
  },
  addCoins: async (amount, description) => {
    try {
      // Optimistic update
      set((state) => ({ balance: state.balance + amount }));
      await apiClient.post('/user/wallet/earn', { amount, description });
    } catch (error) {
      console.error('Failed to add coins:', error);
      // Revert if failed
      set((state) => ({ balance: state.balance - amount }));
    }
  },
  spendCoins: (amount) => {
    const current = get().balance;
    if (current >= amount) {
      set({ balance: current - amount });
      return true;
    }
    return false;
  },
}));
