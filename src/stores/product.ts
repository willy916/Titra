import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useProductStore = defineStore('product', () => {
    const isLoading = ref(false)
    const products = ref<any[]>([])

    async function addProduct(productData: {
        nom: string
        description: string
        categorie: string
        prix: number
        unite: string
        quantiteDisponible: number
        photos: string[]
    }) {
        isLoading.value = true
        try {
            console.log('Sending product data:', productData)
            const endpoint = getEndpoint('/api/paysan/products')
            const response = await api.post(endpoint, productData)
            console.log('Product creation response:', response.data)

            const newProduct = response.data.data || response.data.body || response.data

            // Add to local state if valid
            if (newProduct && typeof newProduct === 'object') {
                products.value.unshift(newProduct)
            }
            return response.data
        } catch (error) {
            console.error('Add product error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function getEndpoint(base: string) {
        const userJson = localStorage.getItem('user')
        if (userJson) {
            const user = JSON.parse(userJson)
            const role = user.role
            const institutionRoles = ['cooperative', 'association', 'union', 'federation', 'interprofession']
            if (institutionRoles.includes(role)) {
                // Replace /paysan/ with the actual institution role
                return base.replace('/api/paysan/', `/api/${role}/`)
            }
            if (role === 'processor') {
                return base.replace('/api/paysan/', '/api/transform/')
            }
            if (role === 'merchant') {
                return base.replace('/api/paysan/', '/api/commercant/')
            }
        }
        return base
    }

    async function fetchMyProducts() {
        isLoading.value = true
        try {
            const endpoint = getEndpoint('/api/paysan/products')
            const response = await api.get(endpoint)
            console.log('Fetched products response:', response.data)

            const result = response.data
            if (Array.isArray(result)) {
                products.value = result
            } else if (result && Array.isArray(result.data)) {
                products.value = result.data
            } else if (result && Array.isArray(result.body)) {
                products.value = result.body
            } else {
                console.warn('No array found in product response:', result)
                products.value = []
            }
            return products.value
        } catch (error) {
            console.error('Fetch products error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function updateProduct(id: string, productData: {
        nom: string
        description: string
        categorie: string
        prix: number
        unite: string
        quantiteDisponible: number
        photos: string[]
        isAvailable: boolean
    }) {
        isLoading.value = true
        try {
            const endpoint = getEndpoint(`/api/paysan/products/${id}`)
            const response = await api.put(endpoint, productData)
            const updatedProduct = response.data.data || response.data.body || response.data

            // Update local state
            const index = products.value.findIndex(p => p.id === id)
            if (index !== -1) {
                products.value[index] = { ...products.value[index], ...updatedProduct }
            }
            return response.data
        } catch (error) {
            console.error('Update product error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function deleteProduct(id: string) {
        isLoading.value = true
        try {
            const endpoint = getEndpoint(`/api/paysan/products/${id}`)
            await api.delete(endpoint)
            // Remove from local state
            products.value = products.value.filter(p => p.id !== id)
            return true
        } catch (error) {
            console.error('Delete product error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function uploadProductPhoto(file: File) {
        isLoading.value = true
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'products')

            const response = await api.post('/api/user/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            // API returns { "status": "00", "message": { "url": "...", "message": "..." } }
            // or sometimes directly in data/body depending on wrapper
            const responseData = response.data
            const messageObj = responseData.message || responseData.body || responseData.data

            // Return normalized object { url: string }
            return {
                url: messageObj?.url || messageObj || responseData.url
            }
        } catch (error) {
            console.error('Upload product photo error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function toggleAvailability(id: string) {
        isLoading.value = true
        try {
            const userJson = localStorage.getItem('user')
            let isCoop = false
            if (userJson) {
                const user = JSON.parse(userJson)
                if (['cooperative', 'association', 'union', 'federation', 'interprofession'].includes(user.role)) {
                    isCoop = true
                }
            }

            let response
            if (isCoop) {
                // For institutions, we use PUT with isAvailable toggle
                const product = products.value.find(p => p.id === id)
                if (!product) throw new Error('Product not found locally')

                const cleanPayload = {
                    nom: product.nom || product.name,
                    description: product.description,
                    categorie: product.categorie || product.category,
                    prix: product.prix || product.price,
                    unite: product.unite || product.unit,
                    quantiteDisponible: product.quantiteDisponible !== undefined ? product.quantiteDisponible : product.stock,
                    photos: product.photos || product.images || [],
                    isAvailable: !product.isAvailable
                }

                const endpoint = getEndpoint(`/api/paysan/products/${id}`)
                response = await api.put(endpoint, cleanPayload)
            } else {
                response = await api.patch(`/api/paysan/toggle-availability/${id}`)
            }

            const updatedProduct = response.data.data || response.data.body || response.data

            // Update local state
            const index = products.value.findIndex(p => p.id === id)
            if (index !== -1) {
                products.value[index] = { ...products.value[index], ...updatedProduct }
            }
            return response.data
        } catch (error) {
            console.error('Toggle availability error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        products,
        addProduct,
        fetchMyProducts,
        updateProduct,
        deleteProduct,
        uploadProductPhoto,
        toggleAvailability,
    }
})
