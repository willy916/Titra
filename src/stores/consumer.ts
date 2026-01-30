import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface ConsumerOrder {
    id: string
    orderNumber: string
    productNameSnapshot: string
    productPhotoSnapshot?: string | null
    quantity: number
    totalAmount: number
    orderStatus: string
    orderDate: string
    buyer?: {
        id: string
        phoneNumber: string
    }
    seller?: {
        id: string
        firstName?: string
        lastName?: string
        nom?: string
    }
    cooperative?: {
        id: string
        name: string
    }
    commercantSeller?: {
        id: string
        firstName?: string
        lastName?: string
        shopName?: string
    }
}

export interface DashboardStats {
    consommateurInfo: {
        fullName: string
        phoneNumber: string
        avatarUrl: string | null
        location: string
        cartItemsCount: number
    }
    orderStats: {
        totalOrders: number
        pendingOrders: number
        completedOrders: number
        totalSpent: number
        averageOrderValue: number
    }
    favoriteCategories: string[]
    nearbyProducers: Array<{
        id: string
        name: string
        type: string
        location: string
        category: string
        rating: number
        avatarUrl: string | null
        phoneNumber?: string
    }>
    popularProducts: Array<{
        id: string
        name: string
        producerName: string
        price: number
        unit: string
        photoUrl: string | null
        isVerified: boolean
        isAvailable: boolean
    }>
    specialOffers: Array<{
        id: string
        title: string
        description: string
        icon: string
        discountPercentage: number
        validUntil: string
    }>
}

export const useConsumerStore = defineStore('consumer', () => {
    const isLoading = ref(false)
    const orders = ref<ConsumerOrder[]>([])
    const dashboardStats = ref<DashboardStats | null>(null)

    async function fetchOrders(status?: string) {
        isLoading.value = true
        try {
            const url = status ? `/api/consommateur/orders?status=${status}` : '/api/consommateur/orders'
            const response = await api.get(url)
            const data = response.data.body || response.data.data || response.data
            orders.value = Array.isArray(data) ? data : []
            return orders.value
        } catch (error) {
            console.error('Fetch consumer orders error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchDashboardStats() {
        isLoading.value = true
        try {
            const response = await api.get('/api/consommateur/dashboard/stats')
            dashboardStats.value = response.data.data || response.data
            return dashboardStats.value
        } catch (error) {
            console.error('Fetch consumer dashboard stats error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        orders,
        dashboardStats,
        fetchOrders,
        fetchDashboardStats,
    }
})
