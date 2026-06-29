import { create } from 'zustand';

interface WalletStore {
  balance: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  balance: 150, // Mock initial balance
  addCoins: (amount) => set((state) => ({ balance: state.balance + amount })),
  spendCoins: (amount) => {
    const current = get().balance;
    if (current >= amount) {
      set({ balance: current - amount });
      return true;
    }
    return false;
  },
}));
