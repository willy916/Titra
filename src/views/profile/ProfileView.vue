<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, User as UserIcon, MapPin, Phone, Building2, IdCard, Edit, LogOut, ChevronRight, Shield, Camera } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { User, UserRole } from '@/types'

const props = defineProps<{ user: User }>()
const emit = defineEmits<{ back: []; navigate: [screen: string]; logout: [] }>()

const photo = ref(props.user.photo)
const fileInputRef = ref<HTMLInputElement | null>(null)

const getRoleLabel = (role: UserRole) => {
  const labels: Record<string, string> = {
    farmer: 'Paysan / Producteur', consumer: 'Consommateur', processor: 'Transformateur', merchant: 'Commerçant',
    transporter: 'Transporteur', cooperative: 'Coopérative', association: 'Association', union: 'Union',
    federation: 'Fédération', interprofession: 'Interprofession', independent: 'Indépendant', admin: 'Administrateur',
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

function handlePhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onloadend = () => { photo.value = reader.result as string }
    reader.readAsDataURL(file)
  }
}

function handleEditPhoto() { fileInputRef.value?.click() }
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
            <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              <img v-if="photo" :src="photo" :alt="user.name" class="w-full h-full object-cover" />
              <UserIcon v-else class="w-12 h-12 text-primary" />
            </div>
            <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handlePhotoChange" />
            <button @click="handleEditPhoto" class="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
              <Camera class="w-4 h-4" />
            </button>
          </div>
          <h2 class="text-2xl font-medium">{{ user.name }}</h2>
          <Badge :class="[getRoleColor(user.role), 'mt-2 text-white']">{{ getRoleLabel(user.role) }}</Badge>
          <Button variant="outline" size="sm" class="mt-4"><Edit class="w-4 h-4 mr-2" />Modifier le profil</Button>
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
