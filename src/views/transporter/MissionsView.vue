<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, MapPin, Navigation, Package, Filter } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const isLoading = ref(true)
const filter = ref<'all' | 'near' | 'high-pay'>('all')

onMounted(() => { setTimeout(() => isLoading.value = false, 1200) })

const missions = [
  { id: '1', pickup: 'Yamoussoukro - Village Koffikro', delivery: 'Abidjan - Adjamé', product: 'Igname (150kg)', price: 25000, distance: '248 km', urgent: false, pickupDate: 'Demain 8h' },
  { id: '2', pickup: 'Bouaké - Marché central', delivery: 'Abidjan - Plateau', product: 'Attiéké (80kg)', price: 18000, distance: '356 km', urgent: true, pickupDate: "Aujourd'hui 14h" },
  { id: '3', pickup: 'Korhogo - Coopérative du Nord', delivery: 'Abidjan - Cocody', product: 'Mangues (200kg)', price: 35000, distance: '632 km', urgent: false, pickupDate: '15 Jan' },
  { id: '4', pickup: 'Daloa - Zone agricole', delivery: 'San-Pédro - Port', product: 'Cacao (500kg)', price: 45000, distance: '185 km', urgent: false, pickupDate: '16 Jan' },
  { id: '5', pickup: 'Man - Centre de collecte', delivery: 'Abidjan - Yopougon', product: 'Café (300kg)', price: 40000, distance: '548 km', urgent: true, pickupDate: 'Demain 10h' },
]

const filteredMissions = computed(() => {
  if (filter.value === 'near') return [...missions].sort((a, b) => parseInt(a.distance) - parseInt(b.distance))
  if (filter.value === 'high-pay') return [...missions].sort((a, b) => b.price - a.price)
  return missions
})

const handleAccept = (missionId: string) => {
  toast.success('Mission acceptée !', { description: 'Vous recevrez les détails par message' })
}
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6">
      <div class="flex items-center gap-4 mb-4">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-white text-2xl">Missions disponibles</h1>
          <p class="text-white/80 text-sm">{{ missions.length }} missions près de vous</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2">
        <Button
          size="sm"
          :class="filter === 'all' ? 'bg-white text-primary hover:bg-white/90' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'"
          @click="filter = 'all'"
        >Toutes</Button>
        <Button
          size="sm"
          :class="filter === 'near' ? 'bg-white text-primary hover:bg-white/90' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'"
          @click="filter = 'near'"
        >Proximité</Button>
        <Button
          size="sm"
          :class="filter === 'high-pay' ? 'bg-white text-primary hover:bg-white/90' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'"
          @click="filter = 'high-pay'"
        >Mieux payées</Button>
      </div>
    </div>

    <div class="p-6 space-y-3">
      <!-- Skeleton Loading -->
      <template v-if="isLoading">
        <Card v-for="i in 4" :key="i" class="p-4 animate-pulse">
          <div class="flex items-start justify-between mb-3">
            <div class="flex gap-2">
              <div class="h-6 w-16 bg-muted rounded"></div>
              <div class="h-6 w-20 bg-muted rounded"></div>
            </div>
            <div class="h-6 w-24 bg-muted rounded"></div>
          </div>
          <div class="space-y-3 mb-4">
            <div class="flex gap-2">
              <div class="w-5 h-5 bg-muted rounded"></div>
              <div class="flex-1">
                <div class="h-4 w-20 bg-muted rounded mb-1"></div>
                <div class="h-4 w-48 bg-muted rounded"></div>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="w-5 h-5 bg-muted rounded"></div>
              <div class="flex-1">
                <div class="h-4 w-16 bg-muted rounded mb-1"></div>
                <div class="h-4 w-40 bg-muted rounded"></div>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <div class="flex-1 h-9 bg-muted rounded"></div>
            <div class="flex-1 h-9 bg-muted rounded"></div>
          </div>
        </Card>
      </template>

      <!-- Missions List -->
      <template v-else>
        <Card 
          v-for="mission in filteredMissions" 
          :key="mission.id" 
          :class="['p-4', mission.urgent ? 'border-secondary' : '']"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex gap-2">
              <Badge v-if="mission.urgent" class="bg-secondary">Urgent</Badge>
              <Badge variant="outline">{{ mission.pickupDate }}</Badge>
            </div>
            <p class="font-medium text-primary text-lg">{{ mission.price.toLocaleString() }} F</p>
          </div>

          <div class="space-y-3 mb-4">
            <div class="flex gap-2">
              <Navigation class="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium">Récupération</p>
                <p class="text-sm text-muted-foreground">{{ mission.pickup }}</p>
              </div>
            </div>
            
            <div class="flex gap-2">
              <MapPin class="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <p class="text-sm font-medium">Livraison</p>
                <p class="text-sm text-muted-foreground">{{ mission.delivery }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t">
              <div class="flex items-center gap-2">
                <Package class="w-4 h-4 text-muted-foreground" />
                <span class="text-sm">{{ mission.product }}</span>
              </div>
              <span class="text-sm font-medium">{{ mission.distance }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" size="sm" class="flex-1">Détails</Button>
            <Button size="sm" class="flex-1" @click="handleAccept(mission.id)">Accepter</Button>
          </div>
        </Card>
      </template>
    </div>
  </div>
</template>
