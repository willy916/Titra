import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const usePaysanStore = defineStore('paysan', () => {
    const isLoading = ref(false)
    const stats = ref<any>(null)
    const activities = ref<any[]>([])
    const recommendations = ref<string[]>([])
    const wallet = ref<any>(null)
    const accountingDashboard = ref<any>(null)

    function getBaseUrl() {
        const userJson = localStorage.getItem('user')
        if (userJson) {
            const user = JSON.parse(userJson)
            const role = user.role
            const institutionRoles = ['cooperative', 'association', 'union', 'federation', 'interprofession']
            if (institutionRoles.includes(role)) {
                // Return /api/association for association, /api/cooperative for cooperative, etc.
                return `/api/${role}`
            }
        }
        return '/api/paysan'
    }

    async function fetchDashboardStats() {
        isLoading.value = true
        try {
            const prefix = getBaseUrl()
            const response = await api.get(`${prefix}/dashboard/stats`)
            stats.value = response.data.body || response.data.data || response.data
            return stats.value
        } catch (error) {
            console.error('Fetch dashboard stats error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchActivities() {
        isLoading.value = true
        try {
            const prefix = getBaseUrl()
            // Institutions use /dashboard/activities, Paysan uses /dashboard/activity
            const isInstitution = prefix.startsWith('/api/') && prefix !== '/api/paysan'
            const endpoint = isInstitution ? '/dashboard/activities' : '/dashboard/activity'
            const response = await api.get(`${prefix}${endpoint}`)
            const data = response.data.body || response.data.data || response.data
            activities.value = Array.isArray(data) ? data : []
            return activities.value
        } catch (error) {
            console.error('Fetch activities error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchRecommendations() {
        isLoading.value = true
        try {
            // Note: Currently assuming only paysan has recommendations as per initial doc
            const response = await api.get('/api/paysan/dashboard/recommendations')
            recommendations.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
            return recommendations.value
        } catch (error) {
            console.error('Fetch recommendations error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchWallet() {
        isLoading.value = true
        try {
            const prefix = getBaseUrl()
            const response = await api.get(`${prefix}/wallet`)
            wallet.value = response.data.body || response.data.data || response.data
            return wallet.value
        } catch (error) {
            console.error('Fetch wallet error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchAccountingDashboard() {
        isLoading.value = true
        try {
            const prefix = getBaseUrl()
            const response = await api.get(`${prefix}/accounting/dashboard`)
            accountingDashboard.value = response.data.body || response.data.data || response.data
            return accountingDashboard.value
        } catch (error) {
            console.error('Fetch accounting dashboard error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function addAccountingEntry(entry: {
        type: 'EXPENSE' | 'REVENUE'
        categorie: string
        libelle: string
        montant: number
        description?: string
    }) {
        isLoading.value = true
        try {
            const prefix = getBaseUrl()
            const response = await api.post(`${prefix}/accounting/entry`, entry)
            await fetchAccountingDashboard()
            return response.data
        } catch (error) {
            console.error('Add accounting entry error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        stats,
        activities,
        recommendations,
        wallet,
        accountingDashboard,
        fetchDashboardStats,
        fetchActivities,
        fetchRecommendations,
        fetchWallet,
        fetchAccountingDashboard,
        addAccountingEntry,
    }
})
