import { create } from 'zustand'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find(i => i.productId === item.productId)
    if (existing) {
      set(state => ({
        items: state.items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }))
    } else {
      set(state => ({ items: [...state.items, { ...item, quantity: 1 }] }))
    }
  },
  removeItem: (productId) =>
    set(state => ({ items: state.items.filter(i => i.productId !== productId) })),
  updateQuantity: (productId, quantity) =>
    set(state => ({
      items: quantity <= 0
        ? state.items.filter(i => i.productId !== productId)
        : state.items.map(i => i.productId === productId ? { ...i, quantity } : i)
    })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}))
