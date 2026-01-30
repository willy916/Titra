<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ShoppingCart, Users } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ 
  back: []
  navigate: [screen: string, data?: any] 
}>()

const authStore = useAuthStore()
const userRole = computed(() => authStore.user?.role)

const orderTypes = computed(() => {
  const isSimplified = ['interprofession', 'cooperative', 'farmer'].includes(userRole.value || '')
  
  const types = [
    {
      id: 'customer-orders',
      title: isSimplified ? 'Commandes' : 'Commandes clients',
      description: isSimplified ? 'Gérer les commandes' : 'Gérer les commandes de vos clients',
      icon: Users,
      color: 'bg-primary',
      screen: 'customer-orders'
    },
    {
      id: 'my-orders',
      title: 'Mes commandes',
      description: 'Suivre vos commandes personnelles',
      icon: ShoppingCart,
      color: 'bg-accent',
      screen: 'my-personal-orders'
    }
  ]

  if (isSimplified) {
    return types.filter(t => t.id !== 'my-orders')
  }
  return types
})
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="p-4">
        <button @click="emit('back')" class="flex items-center gap-2 mb-4">
          <ArrowLeft class="w-5 h-5" />
          <span class="font-medium">Retour</span>
        </button>
        <h1 class="text-2xl font-bold text-foreground">Mes commandes</h1>
        <p class="text-sm text-muted-foreground mt-1">Choisissez le type de commandes à consulter</p>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-4">
      <Card
        v-for="type in orderTypes"
        :key="type.id"
        class="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        @click="emit('navigate', type.screen)"
      >
        <div class="flex items-start gap-4">
          <div :class="[type.color, 'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0']">
            <component :is="type.icon" class="w-7 h-7 text-white" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-foreground mb-1">{{ type.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ type.description }}</p>
          </div>
          <ArrowLeft class="w-5 h-5 text-muted-foreground rotate-180 mt-3" />
        </div>
      </Card>
    </div>
  </div>
</template>
