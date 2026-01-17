import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole, Institution } from '@/types'
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

  function setOnboardingStep(step: number) {
    if (user.value) {
      user.value.currentOnboardingStep = step
      user.value.onboardingCompleted = false
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  function completeOnboardingState() {
    if (user.value) {
      user.value.onboardingCompleted = true
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  function setUser(u: User | null) {
    user.value = u
    isAuthenticated.value = true
  }

  function selectRole(role: UserRole) {
    selectedRole.value = role
    if (user.value) {
      user.value.role = role
      user.value.currentOnboardingStep = 1
      user.value.onboardingCompleted = false
      localStorage.setItem('user', JSON.stringify(user.value))
    }
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

      const responseData = response.data.body || response.data
      const { data, isNewUser } = responseData

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      // Transform API user to app User type
      const apiUser = data.user

      // Role mapping helper
      const mapApiRoleToSlug = (roleName: string): UserRole => {
        const mapping: Record<string, UserRole> = {
          'Paysan / Producteur': 'farmer',
          'Transformateur': 'processor',
          'Commerçant': 'merchant',
          'Transporteur': 'transporter',
          'Consommateur': 'consumer',
          'Formation': 'independent',
          'Coopérative': 'cooperative',
          'Association': 'association',
          'Union': 'union',
          'Fédération': 'federation',
          'Interprofession': 'interprofession',
          'Interprofessionnalité': 'interprofession'
        }
        return mapping[roleName] || 'farmer'
      }

      const roleSlug = apiUser.roleActor?.name ? mapApiRoleToSlug(apiUser.roleActor.name) : null

      const mappedUser: User = {
        ...apiUser,
        id: apiUser.id,
        phone: apiUser.phoneNumber || '',
        name: apiUser.name || '',
        role: roleSlug,
        verified: apiUser.verified,
        onboardingCompleted: apiUser.completed || false
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
    if (user.value) {
      user.value.role = role
      user.value.onboardingCompleted = true
      localStorage.setItem('user', JSON.stringify(user.value))
    }
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
        role: 'farmer',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
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
      const savedData = response.data.data || response.data.body || response.data

      const updatedUser: User = {
        ...user.value!,
        name: savedData.name || payload.name,
        cooperative: savedData.name || payload.name,
        location: savedData.location || payload.location,
        role: 'cooperative',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return response.data
    } catch (error) {
      console.error('Complete Cooperative Profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function completeAssociationProfile(profileData: any) {
    isLoading.value = true
    try {
      const payload: any = {
        name: profileData.associationName,
        registrationNumber: profileData.registrationNumber,
        presidentName: profileData.presidentName,
        location: profileData.location,
        numberOfMembers: parseInt(profileData.membersCount) || 0,
      }

      if (profileData.rccm) payload.rccm = profileData.rccm
      if (profileData.ncc) payload.ncc = profileData.ncc
      if (profileData.yearFounded) payload.creationYear = parseInt(profileData.yearFounded)
      if (profileData.filiere) payload.mainFiliere = profileData.filiere
      if (profileData.customFiliere) payload.customMainFiliere = profileData.customFiliere
      if (profileData.secondaryFilieres?.length) payload.secondaryFilieres = profileData.secondaryFilieres
      if (profileData.contactPhone) payload.contactPhone = profileData.contactPhone
      if (profileData.contactEmail) payload.contactEmail = profileData.contactEmail

      console.log('--- completing association profile ---')
      console.log('Payload:', payload)

      const response = await api.put('/api/association/complete-profile', payload)
      const savedData = response.data.data || response.data.body || response.data

      const updatedUser: User = {
        ...user.value!,
        name: savedData.name || payload.name,
        association: savedData.name || payload.name,
        location: savedData.location || payload.location,
        role: 'association',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return response.data
    } catch (error) {
      console.error('Complete Association Profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function completeUnionProfile(profileData: any) {
    isLoading.value = true
    try {
      const payload: any = {
        name: profileData.unionName,
        agrement: profileData.registrationNumber,
        presidentName: profileData.presidentName,
        siegeVille: profileData.location,
        zoneCouverture: profileData.region,
        numberOfCompagnie: parseInt(profileData.membersCount) || 0,
        isIndependant: profileData.affiliationType === 'independent' || !profileData.affiliationId
      }

      if (profileData.rccm) payload.rccm = profileData.rccm
      if (profileData.ncc) payload.ncc = profileData.ncc
      if (profileData.yearFounded) payload.creationYear = parseInt(profileData.yearFounded)
      if (profileData.affiliationId && !payload.isIndependant) {
        payload.federationId = profileData.affiliationId
      }

      const response = await api.put('/api/union/complete-profile', payload)
      const savedData = response.data.data || response.data.body || response.data

      const updatedUser: User = {
        ...user.value!,
        name: savedData.name || payload.name,
        union: savedData.name || payload.name,
        location: savedData.siegeVille || payload.siegeVille,
        role: 'union',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return response.data
    } catch (error) {
      console.error('Complete Union Profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function completeFederationProfile(profileData: any) {
    isLoading.value = true
    try {
      const payload: any = {
        name: profileData.federationName,
        agrement: profileData.registrationNumber,
        presidentName: profileData.presidentName,
        siegeVille: profileData.location,
        zoneCouverture: profileData.region,
        numberOfCompagnie: parseInt(profileData.membersCount) || 0,
        isIndependant: profileData.affiliationType === 'independent' || !profileData.affiliationId
      }

      if (profileData.rccm) payload.rccm = profileData.rccm
      if (profileData.ncc) payload.ncc = profileData.ncc
      if (profileData.yearFounded) payload.creationYear = parseInt(profileData.yearFounded)
      if (profileData.affiliationId && !payload.isIndependant) {
        payload.interprofessionId = profileData.affiliationId
      }

      const response = await api.put('/api/federation/complete-profile', payload)
      const savedData = response.data.data || response.data.body || response.data

      const updatedUser: User = {
        ...user.value!,
        name: savedData.name || payload.name,
        federation: savedData.name || payload.name,
        location: savedData.siegeVille || payload.siegeVille,
        role: 'federation',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return response.data
    } catch (error) {
      console.error('Complete Federation Profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function completeInterprofessionProfile(profileData: any) {
    isLoading.value = true
    try {
      const payload: any = {
        name: profileData.interprofessionName,
        agrement: profileData.registrationNumber,
        presidentName: profileData.presidentName,
        siegeVille: profileData.location,
        numberOfCompagnie: parseInt(profileData.membersCount) || 0,
      }

      if (profileData.rccm) payload.rccm = profileData.rccm
      if (profileData.ncc) payload.ncc = profileData.ncc
      if (profileData.yearFounded) payload.creationYear = parseInt(profileData.yearFounded)

      const response = await api.put('/api/interprofession/complete-profile', payload)
      const savedData = response.data.data || response.data.body || response.data

      const updatedUser: User = {
        ...user.value!,
        name: savedData.name || payload.name,
        interprofession: savedData.name || payload.name,
        location: savedData.siegeVille || payload.siegeVille,
        role: 'interprofession',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return response.data
    } catch (error) {
      console.error('Complete Interprofession Profile error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function completeTransformerProfile(profileData: any) {
    isLoading.value = true
    try {
      // Mocking API call for now if endpoint doesn't exist
      const updatedUser: User = {
        ...user.value!,
        name: `${profileData.firstName} ${profileData.lastName}`,
        location: profileData.location,
        role: 'processor',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  async function completeMerchantProfile(profileData: any) {
    isLoading.value = true
    try {
      const updatedUser: User = {
        ...user.value!,
        name: `${profileData.firstName} ${profileData.lastName}`,
        location: profileData.location,
        role: 'merchant',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true }
    } finally {
      isLoading.value = false
    }
  }

  async function completeTransporterProfile(profileData: any) {
    isLoading.value = true
    try {
      const updatedUser: User = {
        ...user.value!,
        name: `${profileData.firstName} ${profileData.lastName}`,
        location: profileData.location,
        role: 'transporter',
        onboardingCompleted: true
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true }
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

  async function getAllCooperatives(): Promise<Institution[]> {
    isLoading.value = true
    try {
      const response = await api.get('/api/cooperative/all')
      return response.data.body || response.data
    } catch (error) {
      console.error('Get all cooperatives error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function getAllAssociations(): Promise<Institution[]> {
    isLoading.value = true
    try {
      const response = await api.get('/api/association/all')
      return response.data.body || response.data
    } catch (error) {
      console.error('Get all associations error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function getAllUnions(): Promise<Institution[]> {
    isLoading.value = true
    try {
      const response = await api.get('/api/union/all')
      return response.data.body || response.data
    } catch (error) {
      console.error('Get all unions error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function getAllFederations(): Promise<Institution[]> {
    isLoading.value = true
    try {
      const response = await api.get('/api/federation/all')
      return response.data.body || response.data
    } catch (error) {
      console.error('Get all federations error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function getAllInterprofessions(): Promise<Institution[]> {
    isLoading.value = true
    try {
      const response = await api.get('/api/interprofession/all')
      return response.data.body || response.data
    } catch (error) {
      console.error('Get all interprofessions error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function getAllFilieres(): Promise<any[]> {
    isLoading.value = true
    try {
      const response = await api.get('/api/filiere/all')
      return response.data.body || response.data
    } catch (error) {
      console.error('Get all filieres error:', error)
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

  async function getAllRoles() {
    isLoading.value = true
    try {
      const response = await api.get('/api/user/get/all-role-actors')
      return response.data
    } catch (error) {
      console.error('Get all roles error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function setAnyRole(roleName: string) {
    isLoading.value = true
    try {
      const response = await api.post('/api/user/set-role/any', { roleName })
      if (user.value) {
        user.value.role = roleName as UserRole
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return response.data
    } catch (error) {
      console.error('Set role error:', error)
      throw error
    } finally {
      isLoading.value = false
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
    completeAssociationProfile,
    completeUnionProfile,
    completeFederationProfile,
    completeInterprofessionProfile,
    completeTransformerProfile,
    completeMerchantProfile,
    completeTransporterProfile,
    uploadAvatar,
    initializeAuth,
    skipOnboarding,
    logout,
    updateProfile,
    setOnboardingStep,
    completeOnboardingState,
    getAllRoles,
    setAnyRole,
    getAllCooperatives,
    getAllAssociations,
    getAllUnions,
    getAllFederations,
    getAllInterprofessions,
    getAllFilieres,
  }
}
)
