import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useOrderStore = defineStore('order', () => {
    const isLoading = ref(false)
    const orders = ref<any[]>([])
    const personalOrders = ref<any[]>([])

    function getBaseUrl() {
        const userJson = localStorage.getItem('user')
        if (userJson) {
            const user = JSON.parse(userJson)
            const role = user.role
            // Roles that use the cooperative API prefix
            if (['cooperative', 'association', 'union', 'federation', 'interprofession'].includes(role)) {
                return `/api/${role}/orders`
            }
            if (role === 'processor') {
                return '/api/transform/orders'
            }
            if (role === 'merchant') {
                return '/api/commercant/orders'
            }
            if (role === 'consumer') {
                return '/api/consommateur/orders'
            }
        }
        return '/api/paysan/orders'
    }

    function getPersonalOrdersBaseUrl() {
        const userJson = localStorage.getItem('user')
        if (userJson) {
            const user = JSON.parse(userJson)
            const role = user.role
            // Personal orders endpoint for tracking purchases
            if (['cooperative', 'association', 'union', 'federation', 'interprofession'].includes(role)) {
                return `/api/${role}/my-purchases`
            }
            if (role === 'processor') {
                return '/api/transform/my-purchases'
            }
            if (role === 'merchant') {
                return '/api/commercant/purchases'
            }
            if (role === 'farmer') {
                return '/api/paysan/my-purchases'
            }
        }
        return '/api/consommateur/orders'
    }

    async function fetchMyOrders(status: string = 'EN_ATTENTE,EN_PREPARATION,EN_COURS') {
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

    async function fetchMyPersonalOrders(statuses: string[]) {
        isLoading.value = true
        try {
            const baseUrl = getPersonalOrdersBaseUrl()
            const statusParam = statuses.join(',')
            const url = `${baseUrl}?status=${statusParam}`
            const response = await api.get(url)

            // Normalize response
            const data = response.data.body || response.data.data || response.data
            personalOrders.value = Array.isArray(data) ? data : []

            return personalOrders.value
        } catch (error) {
            console.error('Fetch personal orders error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchOrderDetails(id: string, isPersonal: boolean = false) {
        isLoading.value = true
        try {
            const baseUrl = isPersonal ? getPersonalOrdersBaseUrl() : getBaseUrl()
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
        personalOrders,
        fetchMyOrders,
        fetchMyPersonalOrders,
        fetchOrderDetails,
        fetchCooperativeOrders,
        fetchCooperativeOrderDetails,
        updateOrderStatus,
    }
})
