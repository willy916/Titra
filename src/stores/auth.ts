import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'
import { mockUser } from '@/data/mockData'

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
    completeOnboarding,
    skipOnboarding,
    logout,
    updateProfile,
  }
})
