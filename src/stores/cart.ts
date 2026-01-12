import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, CartItem } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() => 
    items.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  )

  const deliveryFee = computed(() => subtotal.value > 0 ? 500 : 0)

  const titraCommission = computed(() => Math.round(subtotal.value * 0.05))

  const institutionCommission = computed(() => Math.round(subtotal.value * 0.03))

  const total = computed(() => 
    subtotal.value + deliveryFee.value + titraCommission.value + institutionCommission.value
  )

  function addToCart(product: Product) {
    const existingItem = items.value.find(item => item.product.id === product.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({ product, quantity: 1 })
    }
  }

  function removeFromCart(productId: string) {
    items.value = items.value.filter(item => item.product.id !== productId)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function incrementQuantity(productId: string) {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      item.quantity++
    }
  }

  function decrementQuantity(productId: string) {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      if (item.quantity <= 1) {
        removeFromCart(productId)
      } else {
        item.quantity--
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  function isInCart(productId: string): boolean {
    return items.value.some(item => item.product.id === productId)
  }

  function getQuantity(productId: string): number {
    const item = items.value.find(item => item.product.id === productId)
    return item?.quantity ?? 0
  }

  return {
    items,
    totalItems,
    subtotal,
    deliveryFee,
    titraCommission,
    institutionCommission,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    isInCart,
    getQuantity,
  }
})
