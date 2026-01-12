<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Truck, MapPin, Clock, Wallet, Bell, Settings, Navigation, Package, Calculator } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{ user: { name: string; balance?: number } }>()
const emit = defineEmits<{ navigate: [screen: string, data?: any] }>()

const isLoading = ref(true)
onMounted(() => { setTimeout(() => isLoading.value = false, 1200) })

const stats = { balance: props.user.balance || 450000, activeMissions: 3, completedToday: 5, thisMonth: 28, earnings: 450000 }
const activeMissions = [
  { id: '1', pickup: 'Yamoussoukro - Village Koffikro', delivery: 'Abidjan - Adjamé', product: 'Igname (150kg)', price: 25000, distance: '248 km', status: 'En cours' },
  { id: '2', pickup: 'Bouaké - Marché central', delivery: 'Abidjan - Plateau', product: 'Attiéké (80kg)', price: 18000, distance: '356 km', status: 'À récupérer' },
]
const availableMissions = [
  { id: '3', pickup: 'Korhogo', delivery: 'Abidjan', product: 'Mangues (200kg)', price: 35000, distance: '632 km' },
]
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6 rounded-b-3xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-white/80 text-sm">Bonjour,</p>
          <h1 class="text-white text-2xl">{{ user.name }}</h1>
          <Badge variant="secondary" class="mt-2 bg-white/20 text-white border-0">Transporteur</Badge>
        </div>
        <div class="flex gap-2">
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <Bell class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center">{{ availableMissions.length }}</span>
          </button>
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Settings class="w-5 h-5" /></button>
        </div>
      </div>

      <Card class="bg-white/10 border-white/20 backdrop-blur p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2"><Wallet class="w-4 h-4 text-white/80" /><p class="text-white/80 text-xs">Revenus disponibles</p></div>
            <p class="text-white text-2xl">{{ stats.balance.toLocaleString() }} F</p>
          </div>
          <Button size="sm" class="bg-white text-primary hover:bg-white/90">Retirer</Button>
        </div>
      </Card>
    </div>

    <div class="p-6 space-y-6">
      <!-- Stats Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-3 gap-3">
          <Card v-for="i in 3" :key="i" class="p-3 text-center animate-pulse">
            <div class="w-5 h-5 mx-auto mb-2 bg-muted rounded"></div>
            <div class="h-7 w-8 bg-muted rounded mx-auto mb-1"></div>
            <div class="h-3 w-12 bg-muted rounded mx-auto"></div>
          </Card>
        </div>
      </template>
      <!-- Stats -->
      <template v-else>
        <div class="grid grid-cols-3 gap-3">
          <Card class="p-3 text-center"><Truck class="w-5 h-5 mx-auto mb-2 text-primary" /><p class="text-2xl font-medium text-primary">{{ stats.activeMissions }}</p><p class="text-xs text-muted-foreground">En cours</p></Card>
          <Card class="p-3 text-center"><Package class="w-5 h-5 mx-auto mb-2 text-secondary" /><p class="text-2xl font-medium">{{ stats.completedToday }}</p><p class="text-xs text-muted-foreground">Aujourd'hui</p></Card>
          <Card class="p-3 text-center"><Clock class="w-5 h-5 mx-auto mb-2 text-muted-foreground" /><p class="text-2xl font-medium">{{ stats.thisMonth }}</p><p class="text-xs text-muted-foreground">Ce mois</p></Card>
        </div>
      </template>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 gap-3">
        <Button @click="emit('navigate', 'accounting')" variant="outline" class="h-auto flex-col gap-2 py-4"><Calculator class="w-6 h-6" /><span class="text-sm">Ma Comptabilité</span></Button>
        <Button @click="emit('navigate', 'wallet')" variant="outline" class="h-auto flex-col gap-2 py-4"><Wallet class="w-6 h-6" /><span class="text-sm">Portefeuille</span></Button>
      </div>

      <!-- Active Missions -->
      <div>
        <h3 class="text-primary mb-3">Mes courses en cours</h3>
        <div class="space-y-3">
          <template v-if="isLoading">
            <Card v-for="i in 2" :key="i" class="p-4 animate-pulse">
              <div class="flex items-start justify-between mb-3">
                <div class="h-6 w-20 bg-muted rounded"></div>
                <div class="h-6 w-24 bg-muted rounded"></div>
              </div>
              <div class="space-y-2">
                <div class="flex gap-2"><div class="w-4 h-4 bg-muted rounded"></div><div class="flex-1"><div class="h-4 w-20 bg-muted rounded mb-1"></div><div class="h-4 w-40 bg-muted rounded"></div></div></div>
                <div class="flex gap-2"><div class="w-4 h-4 bg-muted rounded"></div><div class="flex-1"><div class="h-4 w-16 bg-muted rounded mb-1"></div><div class="h-4 w-32 bg-muted rounded"></div></div></div>
              </div>
              <div class="h-9 w-full bg-muted rounded mt-3"></div>
            </Card>
          </template>
          <template v-else>
            <Card v-for="mission in activeMissions" :key="mission.id" class="p-4">
              <div class="flex items-start justify-between mb-3">
                <Badge :variant="mission.status === 'En cours' ? 'default' : 'secondary'">{{ mission.status }}</Badge>
                <p class="font-medium text-primary">{{ mission.price.toLocaleString() }} F</p>
              </div>
              <div class="space-y-2">
                <div class="flex gap-2"><Navigation class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><div class="flex-1"><p class="text-sm font-medium">Récupération</p><p class="text-sm text-muted-foreground">{{ mission.pickup }}</p></div></div>
                <div class="flex gap-2"><MapPin class="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" /><div class="flex-1"><p class="text-sm font-medium">Livraison</p><p class="text-sm text-muted-foreground">{{ mission.delivery }}</p></div></div>
                <div class="flex items-center justify-between pt-2 border-t"><span class="text-sm text-muted-foreground">{{ mission.product }}</span><span class="text-sm font-medium">{{ mission.distance }}</span></div>
              </div>
              <Button v-if="mission.status === 'En cours'" class="w-full mt-3" variant="outline">Confirmer livraison</Button>
            </Card>
          </template>
        </div>
      </div>

      <!-- Available Missions -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-primary">Nouvelles missions</h3>
          <Button variant="ghost" size="sm" @click="emit('navigate', 'missions')">Voir tout</Button>
        </div>
        <div class="space-y-3">
          <Card v-for="mission in availableMissions" :key="mission.id" class="p-4 border-primary/30">
            <div class="flex items-start justify-between mb-3">
              <Badge class="bg-secondary">Nouvelle</Badge>
              <p class="font-medium text-primary text-lg">{{ mission.price.toLocaleString() }} F</p>
            </div>
            <div class="space-y-2 mb-3">
              <div class="flex items-center gap-2"><Navigation class="w-4 h-4 text-muted-foreground" /><span class="text-sm">{{ mission.pickup }}</span></div>
              <div class="flex items-center gap-2"><MapPin class="w-4 h-4 text-muted-foreground" /><span class="text-sm">{{ mission.delivery }}</span></div>
              <div class="flex items-center justify-between pt-2 border-t"><span class="text-sm text-muted-foreground">{{ mission.product }}</span><span class="text-sm font-medium">{{ mission.distance }}</span></div>
            </div>
            <Button class="w-full">Accepter la mission</Button>
          </Card>
        </div>
      </div>

      <!-- Month Performance -->
      <Card class="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <h3 class="text-primary mb-3">Performance du mois</h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Livraisons terminées</span><span class="font-medium">{{ stats.thisMonth }}</span></div>
          <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Revenus du mois</span><span class="font-medium text-primary">{{ stats.earnings.toLocaleString() }} F</span></div>
          <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Moyenne par course</span><span class="font-medium">{{ Math.round(stats.earnings / stats.thisMonth).toLocaleString() }} F</span></div>
        </div>
      </Card>
    </div>
  </div>
</template>
