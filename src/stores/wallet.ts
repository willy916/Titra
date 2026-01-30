import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface WalletTransaction {
    id: string
    type: 'CREDIT' | 'DEBIT'
    amount: number
    description: string
    date: string
    status: 'COMPLETED' | 'PENDING' | 'FAILED'
}

export interface WalletData {
    soldeDisponible: number
    soldeEnAttente: number
    totalVentesCeMois: number
    revenuTotalCeMois: number
    commissionCeMois: number
    transactions: WalletTransaction[]
}

export const useWalletStore = defineStore('wallet', () => {
    const isLoading = ref(false)
    const walletData = ref<WalletData | null>(null)

    async function fetchWallet() {
        isLoading.value = true
        try {
            const response = await api.get('/api/wallet/balance')
            // Normalize response based on backend description
            const data = response.data.body || response.data.data || response.data
            walletData.value = {
                soldeDisponible: data.soldeDisponible || 0,
                soldeEnAttente: data.soldeEnAttente || 0,
                totalVentesCeMois: data.totalVentesCeMois || 0,
                revenuTotalCeMois: data.revenuTotalCeMois || 0,
                commissionCeMois: data.commissionCeMois || 0,
                transactions: data.transactions || []
            }
            return walletData.value
        } catch (error) {
            console.error('Fetch wallet error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function withdraw(amount: number, phoneNumber?: string) {
        isLoading.value = true
        try {
            const response = await api.post('/api/wallet/withdraw', { amount, phoneNumber })
            await fetchWallet()
            return response.data
        } catch (error) {
            console.error('Withdraw error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchTransactions() {
        isLoading.value = true
        try {
            const response = await api.get('/api/wallet/transactions')
            const data = response.data.body || response.data.data || response.data
            if (walletData.value) {
                walletData.value.transactions = Array.isArray(data) ? data : []
            }
            return data
        } catch (error) {
            console.error('Fetch transactions error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function initiatePayment(orderId: string) {
        isLoading.value = true
        try {
            const response = await api.post(`/api/payment/initiate/${orderId}`)
            const data = response.data.body || response.data.data || response.data
            return {
                success: data.success || true,
                paymentUrl: data.paymentUrl,
                token: data.token,
                orderId: data.orderId || orderId
            }
        } catch (error) {
            console.error('Initiate payment error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function checkPaymentStatus(orderId: string) {
        isLoading.value = true
        try {
            const response = await api.get(`/api/payment/status/${orderId}`)
            const data = response.data.body || response.data.data || response.data
            return {
                isPaid: data.isPaid || false,
                status: data.status || 'EN_ATTENTE_PAIEMENT'
            }
        } catch (error) {
            console.error('Check payment status error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        walletData,
        fetchWallet,
        withdraw,
        fetchTransactions,
        initiatePayment,
        checkPaymentStatus
    }
})
