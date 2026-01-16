import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'
import { mockUser } from '@/data/mockData'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const selectedRole = ref<UserRole | null>(null)
  const isLoading = ref(false)

  const userRole = computed(() => user.value?.role ?? null)
  const userName = computed(() => user.value?.name ?? '')
  const userMatricule = computed(() => user.value?.matricule ?? '')

  function setUser(newUser: User) {
    user.value = newUser
    isAuthenticated.value = true
  }

  function selectRole(role: UserRole) {
    selectedRole.value = role
  }

  async function sendOtp(phoneNumber: string) {
    isLoading.value = true
    try {
      const response = await api.post('/api/user/send-otp', { phoneNumber })
      return response.data
    } catch (error) {
      console.error('Send OTP error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function verifyOtp(phoneNumber: string, otpCode: string) {
    isLoading.value = true
    try {
      const response = await api.post('/api/user/verify-otp', {
        phoneNumber,
        otpCode,
      })

      const { data, isNewUser } = response.data.body

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      // Transform API user to app User type
      const apiUser = data.user
      // Note: Use partial data or fallback to mock defaults if fields are missing from backend yet
      const mappedUser: User = {
        ...mockUser, // Fallback for fields not yet in API or different structure
        id: apiUser.id,
        phone: apiUser.phoneNumber || '',
        name: apiUser.name || '',
        role: (apiUser.roleActor as UserRole) || null,
        verified: apiUser.verified
      } as User

      setUser(mappedUser)
      localStorage.setItem('user', JSON.stringify(mappedUser))

      return { ...response.data, isNewUser }
    } catch (error) {
      console.error('Verify OTP error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function completeOnboarding(data: Record<string, unknown>) {
    const newUser: User = {
      ...mockUser,
      role: selectedRole.value!,
      name: `${data.firstName} ${data.lastName}`,
      location: data.location as string,
      cooperative: data.cooperative as string | undefined,
      interprofession: data.interprofession as string | undefined,
    }
    setUser(newUser)
  }

  function skipOnboarding(role: UserRole) {
    const newUser: User = {
      ...mockUser,
      role,
      name: 'Nouveau Utilisateur',
    }
    setUser(newUser)
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    selectedRole.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  function initializeAuth() {
    const token = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    if (token) {
      isAuthenticated.value = true
      if (savedUser) {
        user.value = JSON.parse(savedUser)
      }
    }
  }

  async function completePaysanProfile(profileData: any) {
    isLoading.value = true
    const token = localStorage.getItem('accessToken')

    // Debug logs
    console.log('--- completing paysan profile ---')
    console.log('Token:', token ? 'Present' : 'Missing')

    try {
      const isIndie = profileData.affiliationId === 'independent'
      const payload: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        address: profileData.location,
        typeActivite: profileData.activityType === 'agriculture' ? 'AGRICULTURE_CULTURE' :
          profileData.activityType === 'livestock' ? 'ELEVAGE' : 'MIXTE',
        surfaceCultivee: parseFloat(profileData.surfaceArea) || 0,
        produitNames: [...(profileData.products || []), ...(profileData.customProducts || [])],
        isIndependent: isIndie,
        cooperativeId: null,
        cooperativeNameManual: null,
        cooperativeContactManual: null
      }

      if (!isIndie) {
        if (profileData.affiliationId && profileData.affiliationId.startsWith('manual')) {
          payload.cooperativeNameManual = profileData.affiliationName
          payload.cooperativeContactManual = profileData.location
        } else {
          payload.cooperativeId = profileData.affiliationId
        }
      }

      console.log('Payload:', payload)

      const response = await api.put('/api/paysan/complete-profile', payload)
      console.log('Response:', response.data)
      // const apiUser = response.data.body

      const updatedUser: User = {
        ...user.value!,
        name: `${payload.firstName} ${payload.lastName}`,
        location: payload.address,
        role: 'farmer'
      }
      setUser(updatedUser)
      return response.data
    } catch (error) {
      console.error('Complete Profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function completeCooperativeProfile(profileData: any) {
    isLoading.value = true
    try {
      const payload: any = {
        name: profileData.cooperativeName,
        registrationNumber: profileData.registrationNumber,
        presidentName: profileData.presidentName,
        location: profileData.location,
        numberOfMembers: parseInt(profileData.membersCount) || 0,
      }

      // Add optional or conditional fields only if they have value
      if (profileData.rccm) payload.rccm = profileData.rccm
      if (profileData.ncc) payload.ncc = profileData.ncc
      if (profileData.yearFounded) payload.creationYear = parseInt(profileData.yearFounded)

      if (profileData.filiere) payload.mainFiliere = profileData.filiere
      if (profileData.customFiliere) payload.customMainFiliere = profileData.customFiliere

      if (profileData.secondaryFilieres?.length) payload.secondaryFilieres = profileData.secondaryFilieres
      if (profileData.contactPhone) payload.contactPhone = profileData.contactPhone
      if (profileData.contactEmail) payload.contactEmail = profileData.contactEmail

      console.log('--- completing cooperative profile ---')
      console.log('Payload:', payload)

      const response = await api.put('/api/cooperative/complete-profile', payload)

      const updatedUser: User = {
        ...user.value!,
        name: payload.name,
        location: payload.location,
        role: 'cooperative'
      }
      setUser(updatedUser)
      return response.data
    } catch (error) {
      console.error('Complete Cooperative Profile error:', error)
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

      const response = await api.post('/api/paysan/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (user.value) {
        user.value.photo = response.data.body // Assuming API returns the URL
      }

      return response.data
    } catch (error) {
      console.error('Upload Avatar error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function updateProfile(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
    }
  }

  return {
    user,
    isAuthenticated,
    selectedRole,
    isLoading,
    userRole,
    userName,
    userMatricule,
    setUser,
    selectRole,
    sendOtp,
    verifyOtp,
    completeOnboarding,
    completePaysanProfile,
    completeCooperativeProfile,
    uploadAvatar,
    initializeAuth,
    skipOnboarding,
    logout,
    updateProfile,
  }
})
