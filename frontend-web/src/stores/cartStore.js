import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(item => item.product.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          set({ items: [...items, { product, quantity }] })
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.product.id !== productId) })
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
        } else {
          set({
            items: get().items.map(item =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            )
          })
        }
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.product.base_price * item.quantity)
        }, 0)
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalWithVAT: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.base_price * item.quantity
          const vat = price * (item.product.vat_rate / 100)
          return total + price + vat
        }, 0)
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)

export default useCartStore
