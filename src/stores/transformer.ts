import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { useAuthStore } from './auth'

export interface Filiere {
    id: string
    libelle: string
    produits: string[]
}

export interface DashboardStats {
    transformateur: {
        name: string
        role: string
        avatarUrl: string
    }
    wallet: {
        availableBalance: number
        pendingBalance: number
    }
    stats: {
        purchaseCount: number
        saleCount: number
        totalRevenue: number
    }
    recentPurchases: Array<{
        id: string
        title: string
        subtitle: string
        amount: number
        date: string
        status: string
        icon: string
    }>
    recentSales: Array<{
        id: string
        title: string
        subtitle: string
        amount: number
        date: string
        status: string
        icon: string
    }>
}

export interface WalletState {
    availableBalance: number
    escrowBalance: number
    monthlyStats: {
        salesCount: number
        totalRevenue: number
        commissions: number
    }
    revenueHistory: Array<{ month: string; amount: number }>
    transactions: Array<{
        id: string
        title: string
        date: string
        amount: number
        status: string
        type: 'ENTRY' | 'EXIT'
        icon: string
    }>
}

export interface AccountingDashboard {
    totalRevenue: number
    revenueTrend: string
    totalExpenses: number
    expenseTrend: string
    netProfit: number
    profitTrend: string
    recentEntries: Array<{
        id: string
        libelle: string
        categorie: string
        date: string
        amount: number
        type: 'REVENUE' | 'EXPENSE'
        icon: string
    }>
}

export const useTransformerStore = defineStore('transformer', () => {
    const isLoading = ref(false)
    const filieres = ref<Filiere[]>([])
    const dashboardStats = ref<DashboardStats | null>(null)
    const wallet = ref<WalletState | null>(null)
    const accountingDashboard = ref<AccountingDashboard | null>(null)

    async function fetchFilieres() {
        isLoading.value = true
        try {
            const response = await api.get('/api/filiere')
            filieres.value = response.data.body || response.data
            return filieres.value
        } catch (error) {
            console.error('Fetch filieres error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function completeProfile(payload: {
        firstName: string
        lastName: string
        nomAtelier: string
        addresse: string
        filiereId: string
        productionCapacity: number
        productionUnit: string
        productName: string[]
        agrement: string
    }) {
        isLoading.value = true
        try {
            const response = await api.post('/api/transform/completed', payload)
            return response.data.body || response.data
        } catch (error) {
            console.error('Complete transformer profile error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchDashboardStats() {
        isLoading.value = true
        try {
            const response = await api.get('/api/transform/dashboard/stats')
            dashboardStats.value = response.data.body || response.data
            return dashboardStats.value
        } catch (error) {
            console.error('Fetch dashboard stats error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchWallet() {
        isLoading.value = true
        try {
            const response = await api.get('/api/transform/wallet')
            wallet.value = response.data.body || response.data
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
            const response = await api.get('/api/transform/accounting/dashboard')
            accountingDashboard.value = response.data.body || response.data
            return accountingDashboard.value
        } catch (error) {
            console.error('Fetch accounting dashboard error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function addAccountingEntry(entry: {
        libelle: string
        montant: number
        type: 'REVENUE' | 'EXPENSE'
        categorie: string
        description?: string
    }) {
        isLoading.value = true
        try {
            const response = await api.post('/api/transform/accounting/entry', entry)
            await fetchAccountingDashboard()
            return response.data
        } catch (error) {
            console.error('Add accounting entry error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function uploadAvatar(file: File) {
        isLoading.value = true
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await api.post('/api/transform/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            const url = response.data.body || response.data.data || response.data

            // If the URL is also needed in the user auth state
            const authStore = useAuthStore()
            if (url && typeof url === 'string') {
                authStore.updateProfile({ photo: url })
            }

            return url
        } catch (error) {
            console.error('Transformer upload avatar error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        filieres,
        dashboardStats,
        wallet,
        accountingDashboard,
        fetchFilieres,
        completeProfile,
        fetchDashboardStats,
        fetchWallet,
        fetchAccountingDashboard,
        addAccountingEntry,
        uploadAvatar,
    }
})
