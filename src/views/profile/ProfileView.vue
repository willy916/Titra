<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, User as UserIcon, MapPin, Phone, Building2, IdCard, Edit, LogOut, ChevronRight, Shield, Camera, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { User, UserRole } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const props = defineProps<{ user: User }>()
const emit = defineEmits<{ back: []; navigate: [screen: string]; logout: [] }>()

const authStore = useAuthStore()
const photo = ref(props.user.photo)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const getRoleLabel = (role: UserRole) => {
  const labels: Record<string, string> = {
    farmer: 'Paysan / Producteur', consumer: 'Consommateur', processor: 'Transformateur', merchant: 'Commerçant',
    transporter: 'Transporteur', cooperative: 'Coopérative', association: 'Association', union: 'Union',
    federation: 'Fédération', interprofession: 'Interprofession', independent: 'Independant', admin: 'Administrateur',
  }
  return labels[role] || role
}

const getRoleColor = (role: UserRole) => {
  const colors: Record<string, string> = {
    farmer: 'bg-green-600', consumer: 'bg-blue-600', processor: 'bg-purple-600', merchant: 'bg-orange-600',
    transporter: 'bg-yellow-600', cooperative: 'bg-teal-600', association: 'bg-teal-700', union: 'bg-teal-800',
    federation: 'bg-teal-900', interprofession: 'bg-indigo-600', independent: 'bg-gray-600', admin: 'bg-red-600',
  }
  return colors[role] || 'bg-gray-600'
}

async function handlePhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    isUploading.value = true
    try {
      // 1. Upload to backend
      const response = await authStore.uploadAvatar(file)
      // Support both new structure (message.profile.logo) and older formats
      const newPhotoUrl = response.message?.profile?.logo || 
                          response.message?.logo || 
                          response.logoUrl || 
                          response.avatarUrl || 
                          (typeof response.message === 'string' ? response.message : null) ||
                          response.body || 
                          response.data || 
                          response

      // 2. Local update for UI
      photo.value = newPhotoUrl
      toast.success('Photo de profil mise à jour !')
    } catch (error) {
      console.error('Photo upload error:', error)
      toast.error('Erreur lors de la mise à jour de la photo')
    } finally {
      isUploading.value = false
    }
  }
}

function handleEditPhoto() { 
  if (!isUploading.value) fileInputRef.value?.click() 
}
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6 pb-20">
      <div class="flex items-center gap-4 mb-8">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-white text-2xl">Mon profil</h1>
      </div>
    </div>

    <div class="px-6 -mt-12 space-y-6">
      <!-- Profile Card -->
      <Card class="p-6">
        <div class="flex flex-col items-center text-center">
          <div class="relative w-24 h-24 mb-4">
            <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-inner">
              <img v-if="photo" :src="photo" :alt="user.name" class="w-full h-full object-cover" />
              <UserIcon v-else class="w-12 h-12 text-primary" />
              
              <!-- Upload Overlay -->
              <div v-if="isUploading" class="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in transition-all">
                <Loader2 class="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handlePhotoChange" />
            <button 
              @click="handleEditPhoto" 
              :disabled="isUploading"
              class="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera v-if="!isUploading" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
            </button>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">{{ user.name }}</h2>
          <Badge :class="`${getRoleColor(user.role)} mt-2 text-white border-0 shadow-sm`" variant="default">
            {{ getRoleLabel(user.role) }}
          </Badge>
          <Button variant="outline" size="sm" class="mt-4 rounded-full px-6">
            <Edit class="w-4 h-4 mr-2" />
            Modifier le profil
          </Button>
        </div>
      </Card>

      <!-- Informations -->
      <div class="space-y-3">
        <h3 class="text-primary px-2">Informations</h3>
        
        <Card v-if="user.matricule" class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><IdCard class="w-5 h-5 text-primary" /></div>
            <div class="flex-1">
              <p class="text-sm text-muted-foreground">Matricule TITRA</p>
              <p class="font-medium">{{ user.matricule }}</p>
            </div>
            <Badge variant="secondary">Vérifié</Badge>
          </div>
        </Card>

        <Card class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Phone class="w-5 h-5 text-primary" /></div>
            <div class="flex-1">
              <p class="text-sm text-muted-foreground">Téléphone</p>
              <p class="font-medium">{{ user.phone }}</p>
            </div>
          </div>
        </Card>

        <Card v-if="user.location" class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><MapPin class="w-5 h-5 text-primary" /></div>
            <div class="flex-1">
              <p class="text-sm text-muted-foreground">Localisation</p>
              <p class="font-medium">{{ user.location }}</p>
            </div>
          </div>
        </Card>

        <Card v-if="user.cooperative" class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Building2 class="w-5 h-5 text-primary" /></div>
            <div class="flex-1">
              <p class="text-sm text-muted-foreground">Coopérative</p>
              <p class="font-medium">{{ user.cooperative }}</p>
            </div>
          </div>
        </Card>

        <Card v-if="user.interprofession" class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><Shield class="w-5 h-5 text-primary" /></div>
            <div class="flex-1">
              <p class="text-sm text-muted-foreground">Interprofession</p>
              <p class="font-medium">{{ user.interprofession }}</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Actions -->
      <div class="space-y-2">
        <Button variant="outline" class="w-full justify-between" @click="emit('navigate', 'settings')">
          <span>Paramètres</span><ChevronRight class="w-5 h-5" />
        </Button>
        <Button variant="outline" class="w-full justify-between" @click="emit('navigate', 'help')">
          <span>Aide et support</span><ChevronRight class="w-5 h-5" />
        </Button>
        <Button variant="outline" class="w-full justify-between text-red-600 border-red-200 hover:bg-red-50" @click="emit('logout')">
          <span>Se déconnecter</span><LogOut class="w-5 h-5" />
        </Button>
      </div>

      <!-- Version -->
      <div class="text-center pt-4">
        <p class="text-sm text-muted-foreground">TITRA v1.0.0 - Plateforme agricole ivoirienne</p>
      </div>
    </div>
  </div>
</template>
