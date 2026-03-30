import { create } from "zustand";

export interface CartLineItem {
  id: number | string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  slug?: string;
}

interface CartState {
  items: CartLineItem[];
  addItem: (item: CartLineItem) => void;
  removeItem: (itemId: CartLineItem["id"]) => void;
  updateQuantity: (itemId: CartLineItem["id"], quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find((entry) => entry.id === item.id);

      if (!existingItem) {
        return { items: [...state.items, item] };
      }

      return {
        items: state.items.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry
        ),
      };
    }),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((entry) => entry.id !== itemId),
    })),
  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items: state.items.map((entry) =>
        entry.id === itemId ? { ...entry, quantity: Math.max(1, quantity) } : entry
      ),
    })),
  clearCart: () => set({ items: [] }),
}));
