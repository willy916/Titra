import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useOrderStore = defineStore('order', () => {
    const isLoading = ref(false)
    const orders = ref<any[]>([])

    function getBaseUrl() {
        const userJson = localStorage.getItem('user')
        if (userJson) {
            const user = JSON.parse(userJson)
            const role = user.role
            // Roles that use the cooperative API prefix
            if (['cooperative', 'association', 'union', 'federation', 'interprofession'].includes(role)) {
                return `/api/${role}/orders`
            }
        }
        return '/api/paysan/orders'
    }

    async function fetchMyOrders(status?: string) {
        isLoading.value = true
        try {
            const baseUrl = getBaseUrl()
            const url = status ? `${baseUrl}?status=${status}` : baseUrl
            const response = await api.get(url)

            // Normalize response
            const data = response.data.body || response.data.data || response.data
            orders.value = Array.isArray(data) ? data : []

            return orders.value
        } catch (error) {
            console.error('Fetch orders error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchOrderDetails(id: string) {
        isLoading.value = true
        try {
            const baseUrl = getBaseUrl()
            const response = await api.get(`${baseUrl}/${id}`)
            return response.data.body || response.data.data || response.data
        } catch (error) {
            console.error('Fetch order details error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function updateOrderStatus(id: string, status: string) {
        isLoading.value = true
        try {
            const baseUrl = getBaseUrl()
            const response = await api.put(`${baseUrl}/${id}/status`, { status })
            return response.data
        } catch (error) {
            console.error('Update order status error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // Keep aliases for backward compatibility if needed, but point them to the dynamic functions
    const fetchCooperativeOrders = fetchMyOrders
    const fetchCooperativeOrderDetails = fetchOrderDetails

    return {
        isLoading,
        orders,
        fetchMyOrders,
        fetchOrderDetails,
        fetchCooperativeOrders,
        fetchCooperativeOrderDetails,
        updateOrderStatus,
    }
})
