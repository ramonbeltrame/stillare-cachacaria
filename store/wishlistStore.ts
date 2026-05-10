import { create } from "zustand";

interface WishlistState {
  items: string[];
  loading: boolean;
  setItems: (items: string[]) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  setLoading: (loading: boolean) => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  loading: false,
  setItems: (items) => set({ items, loading: false }),
  toggleItem: (productId) => {
    const current = get().items;
    if (current.includes(productId)) {
      set({ items: current.filter((id) => id !== productId) });
    } else {
      set({ items: [...current, productId] });
    }
  },
  hasItem: (productId) => get().items.includes(productId),
  setLoading: (loading) => set({ loading }),
}));
