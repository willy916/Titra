import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Product, CartItem } from '@/types'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const purchases = ref<any[]>([])
  const isLoading = ref(false)
  const authStore = useAuthStore()

  const apiBasePath = computed(() => {
    const role = authStore.user?.role
    if (role === 'merchant') return '/api/commercant'
    return '/api/consommateur'
  })

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
      const response = await api.get(`${apiBasePath.value}/cart`)
      const cartData = response.data.body || response.data.data || response.data

      items.value = Array.isArray(cartData) ? cartData.map((item: any) => ({
        product: {
          id: item.productId,
          name: item.productName || 'Produit',
          description: '',
          price: item.unitPrice || 0,
          unit: item.unit || 'kg',
          category: item.category || 'Alimentaire',
          images: item.photoUrl ? [item.photoUrl] : [],
          seller: {
            id: item.sellerId || '',
            name: item.sellerName || 'Vendeur',
            type: item.productType, // We can store this in a custom field or use it locally
            matricule: '',
            location: ''
          }
        } as unknown as Product,
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
      const productType = (product.seller as any)?.type || 'PAYSAN'
      const payload = {
        productId: product.id,
        productType,
        quantity
      }

      const response = await api.post(`${apiBasePath.value}/cart`, payload)
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
      await api.delete(`${apiBasePath.value}/cart/${productId}`)
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
      await api.delete(`${apiBasePath.value}/cart`)
      items.value = []
    } catch (error) {
      console.error('Clear cart error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function checkout(deliveryAddress?: string) {
    isLoading.value = true
    try {
      const response = await api.post(`${apiBasePath.value}/checkout`, { deliveryAddress })
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

  async function fetchPurchases() {
    isLoading.value = true
    try {
      const response = await api.get(`${apiBasePath.value}/purchases`)
      purchases.value = response.data.body || response.data.data || response.data
      return purchases.value
    } catch (error) {
      console.error('Fetch purchases error:', error)
      purchases.value = []
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
    fetchPurchases,
    purchases,
    isInCart,
    getQuantity,
  }
})
