import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface MerchantStats {
    fullName: string
    shopName: string
    role: string
    avatarUrl: string | null
    pendingOrdersCount: number
    monthlySpending: number
    completedOrdersCount: number
    averageOrderAmount: number
}

export interface WalletState {
    availableBalance: number
    escrowBalance: number
    monthlyStats: any
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

export const useMerchantStore = defineStore('merchant', () => {
    const isLoading = ref(false)
    const stats = ref<MerchantStats | null>(null)
    const wallet = ref<WalletState | null>(null)
    const accountingDashboard = ref<AccountingDashboard | null>(null)

    async function fetchDashboardStats() {
        isLoading.value = true
        try {
            const response = await api.get('/api/commercant/dashboard/stats')
            // Normalize response
            stats.value = response.data.body || response.data.data || response.data
            return stats.value
        } catch (error) {
            console.error('Fetch merchant stats error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchWallet() {
        isLoading.value = true
        try {
            const response = await api.get('/api/commercant/wallet')
            // Normalize response
            wallet.value = response.data.body || response.data.data || response.data
            return wallet.value
        } catch (error) {
            console.error('Fetch merchant wallet error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchAccountingDashboard() {
        isLoading.value = true
        try {
            const response = await api.get('/api/commercant/accounting/dashboard')
            accountingDashboard.value = response.data.body || response.data.data || response.data
            return accountingDashboard.value
        } catch (error) {
            console.error('Fetch merchant accounting dashboard error:', error)
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
            const response = await api.post('/api/commercant/accounting/entry', entry)
            await fetchAccountingDashboard()
            return response.data
        } catch (error) {
            console.error('Add merchant accounting entry error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        stats,
        wallet,
        accountingDashboard,
        fetchDashboardStats,
        fetchWallet,
        fetchAccountingDashboard,
        addAccountingEntry
    }
})
