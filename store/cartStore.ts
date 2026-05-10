import { create } from "zustand";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  volumeMl: number | null;
  stock: number;
}

export interface CartItemType {
  productId: string;
  product: CartProduct;
  quantity: number;
  unitPrice: number;
}

interface CartState {
  items: CartItemType[];
  hydrated: boolean;
  hydrate: () => void;
  addItem: (product: CartProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("stillare-cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ items: parsed.items || [], hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
  addItem: (product: CartProduct) => {
    set((state) => {
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        const newQuantity = Math.min(existing.quantity + 1, product.stock);
        return {
          items: state.items.map((item) =>
            item.productId === product.id ? { ...item, quantity: newQuantity } : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { productId: product.id, product, quantity: 1, unitPrice: product.price },
        ],
      };
    });
  },
  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },
  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) { get().removeItem(productId); return; }
    set((state) => ({
      items: state.items.map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity: Math.min(quantity, item.product.stock) };
        }
        return item;
      }),
    }));
  },
  clearCart: () => set({ items: [] }),
  subtotal: () => get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

// Save to localStorage on every change (client-only, silent)
if (typeof window !== "undefined") {
  useCartStore.subscribe((state) => {
    localStorage.setItem("stillare-cart", JSON.stringify({ items: state.items }));
  });
}
