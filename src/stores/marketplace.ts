import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useMarketplaceStore = defineStore('marketplace', () => {
    const isLoading = ref(false)
    const products = ref<any[]>([])

    async function fetchMarketplaceProducts(filters: {
        categorie?: string
        localisation?: string
        typeVendeur?: string
        search?: string
    } = {}) {
        isLoading.value = true
        try {
            const params = new URLSearchParams()
            if (filters.categorie && filters.categorie !== 'all') params.append('categorie', filters.categorie)
            if (filters.localisation && filters.localisation !== 'all') params.append('localisation', filters.localisation)
            if (filters.typeVendeur) params.append('typeVendeur', filters.typeVendeur)
            if (filters.search) params.append('search', filters.search)

            const response = await api.get(`/api/marketplace/products?${params.toString()}`)
            products.value = Array.isArray(response.data) ? response.data : (response.data.data || [])
            return products.value
        } catch (error) {
            console.error('Fetch marketplace products error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchProductDetails(type: string, id: string) {
        isLoading.value = true
        try {
            const response = await api.get(`/api/marketplace/products/${type}/${id}`)
            return response.data.body || response.data.data || response.data
        } catch (error) {
            console.error('Fetch product details error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        products,
        fetchMarketplaceProducts,
        fetchProductDetails,
    }
})
