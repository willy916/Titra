import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Product, CartItem } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)

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

  async function fetchCart() {
    isLoading.value = true
    try {
      const response = await api.get('/api/consommateur/cart')
      const cartData = response.data.body || response.data.data || response.data

      items.value = Array.isArray(cartData) ? cartData.map((item: any) => ({
        product: {
          id: item.productId,
          name: item.productName || 'Produit',
          price: item.unitPrice || 0,
          images: item.photoUrl ? [item.photoUrl] : [],
          seller: { type: item.productType }
        } as Product,
        quantity: item.quantity || 1
      })) : []

      return items.value
    } catch (error) {
      console.error('Fetch cart error:', error)
      items.value = []
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addToCart(product: Product, quantity: number = 1) {
    isLoading.value = true
    try {
      const payload = {
        productId: product.id,
        productType: product.seller?.type || 'PAYSAN',
        quantity
      }

      const response = await api.post('/api/consommateur/cart', payload)
      await fetchCart()
      return response.data
    } catch (error) {
      console.error('Add to cart error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function removeFromCart(productId: string) {
    isLoading.value = true
    try {
      await api.delete(`/api/consommateur/cart/${productId}`)
      items.value = items.value.filter(item => item.product.id !== productId)
    } catch (error) {
      console.error('Remove from cart error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function clearCart() {
    isLoading.value = true
    try {
      await api.delete('/api/consommateur/cart')
      items.value = []
    } catch (error) {
      console.error('Clear cart error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function checkout() {
    isLoading.value = true
    try {
      const response = await api.post('/api/consommateur/checkout')
      const orders = response.data.body?.data || response.data.data || response.data
      items.value = []
      return orders
    } catch (error) {
      console.error('Checkout error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
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
    if (item) item.quantity++
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

  function isInCart(productId: string): boolean {
    return items.value.some(item => item.product.id === productId)
  }

  function getQuantity(productId: string): number {
    const item = items.value.find(item => item.product.id === productId)
    return item?.quantity ?? 0
  }

  return {
    items,
    isLoading,
    totalItems,
    subtotal,
    deliveryFee,
    titraCommission,
    institutionCommission,
    total,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    checkout,
    isInCart,
    getQuantity,
  }
})
