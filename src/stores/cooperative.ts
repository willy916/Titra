import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useCooperativeStore = defineStore('cooperative', () => {
    const isLoading = ref(false)
    const members = ref<any[]>([])
    const team = ref<any[]>([])
    const stats = ref<any>(null)
    const activities = ref<any[]>([])
    const wallet = ref<any>(null)
    const accountingDashboard = ref<any>(null)

    function getPrefix() {
        const userJson = localStorage.getItem('user')
        if (userJson) {
            const user = JSON.parse(userJson)
            const roleLabels = ['cooperative', 'association', 'union', 'federation', 'interprofession']
            if (roleLabels.includes(user.role)) {
                return `/api/${user.role}`
            }
        }
        return '/api/cooperative' // Fallback
    }

    // 📊 Dashboard & Statistiques
    async function fetchDashboardStats() {
        isLoading.value = true
        try {
            const prefix = getPrefix()
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
            const prefix = getPrefix()
            const response = await api.get(`${prefix}/dashboard/activities`)
            activities.value = response.data.body || response.data.data || response.data || []
            return activities.value
        } catch (error) {
            console.error('Fetch activities error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchPerformanceStats() {
        isLoading.value = true
        try {
            const prefix = getPrefix()
            const response = await api.get(`${prefix}/stats/performance`)
            return response.data.body || response.data.data || response.data
        } catch (error) {
            console.error('Fetch performance stats error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // 👥 Gestion des Membres (Paysans/Producteurs)
    async function fetchMembers() {
        isLoading.value = true
        try {
            const prefix = getPrefix()
            const response = await api.get(`${prefix}/members`)
            members.value = response.data.body || response.data.data || response.data || []
            return members.value
        } catch (error) {
            console.error('Fetch members error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function registerMember(memberData: any) {
        isLoading.value = true
        try {
            const prefix = getPrefix()
            let endpoint = `${prefix}/members/register`

            // Special handling for Institutions (Federation/InterPro) registering sub-structures
            if (memberData.structureType) {
                // If structureType provided (UNION, COOPERATIVE, STRATEGIC_ACTOR, ASSOCIATION), append to URL
                endpoint = `${prefix}/members/register/${memberData.structureType}`
            }

            const response = await api.post(endpoint, memberData)
            return response.data
        } catch (error) {
            console.error('Register member error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // 🏢 Gestion de l'Équipe (Staff structure)
    async function fetchTeam() {
        isLoading.value = true
        try {
            const prefix = getPrefix()
            const response = await api.get(`${prefix}/team`)
            team.value = response.data.body || response.data.data || response.data || []
            return team.value
        } catch (error) {
            console.error('Fetch structure team error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function registerTeamMember(teamMemberData: {
        fullName: string
        phoneNumber: string
        email: string
        role: string
    }) {
        isLoading.value = true
        try {
            const prefix = getPrefix()
            const response = await api.post(`${prefix}/team/register`, teamMemberData)
            return response.data
        } catch (error) {
            console.error('Register team member error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // 💰 Finance & Portefeuille
    // 💰 Finance & Portefeuille
    async function fetchWallet() {
        isLoading.value = true
        try {
            const prefix = getPrefix()
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

    // 📒 Comptabilité
    async function fetchAccountingDashboard() {
        isLoading.value = true
        try {
            const prefix = getPrefix()
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

    async function fetchInstitutionalAccounting() {
        isLoading.value = true
        try {
            const prefix = getPrefix()
            const response = await api.get(`${prefix}/accounting/institutional`)
            return response.data.body || response.data.data || response.data
        } catch (error) {
            console.error('Fetch institutional accounting error:', error)
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
            const prefix = getPrefix()
            const response = await api.post(`${prefix}/accounting/entry`, entry)
            return response.data
        } catch (error) {
            console.error('Add accounting entry error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function registerMemberSale(saleData: {
        paysanId: string
        produitId: string
        quantite: number
        prixUnitaire: number
        tauxCommission?: number
        dateVente?: string
        description?: string
    }) {
        isLoading.value = true
        try {
            const prefix = getPrefix()
            const response = await api.post(`${prefix}/ventes`, saleData)
            return response.data
        } catch (error) {
            console.error('Register member sale error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        members,
        team,
        stats,
        activities,
        wallet,
        accountingDashboard,
        fetchDashboardStats,
        fetchActivities,
        fetchPerformanceStats,
        fetchMembers,
        registerMember,
        fetchTeam,
        registerTeamMember,
        fetchWallet,
        fetchAccountingDashboard,
        fetchInstitutionalAccounting,
        addAccountingEntry,
        registerMemberSale,
    }
})
