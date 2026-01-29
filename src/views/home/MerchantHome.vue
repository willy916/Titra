<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search, ShoppingCart, Package, TrendingUp, Bell, Settings, Truck, Store, Calculator } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { useMerchantStore } from '@/stores/merchant'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{ user: { name: string; balance?: number } }>()
const emit = defineEmits<{ navigate: [screen: string, data?: any] }>()

const merchantStore = useMerchantStore()
const cartStore = useCartStore()
const isLoading = ref(true)

onMounted(async () => { 
  try {
    await merchantStore.fetchDashboardStats()
  } finally {
    isLoading.value = false 
  }
})

const activeOrders = [
  { id: '1', product: 'Igname', seller: 'Koné Ibrahim', quantity: '200kg', status: 'En préparation', delivery: 'Demain' },
  { id: '2', product: 'Tomate', seller: 'Coopérative Divo', quantity: '50kg', status: 'En livraison', delivery: "Aujourd'hui" },
]

const cartItemsCount = computed(() => cartStore.items.length)
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6 rounded-b-3xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-white/80 text-sm">Bonjour,</p>
          <h1 class="text-white text-2xl">{{ merchantStore.stats?.fullName || user.name }}</h1>
          <Badge v-if="merchantStore.stats?.shopName" variant="secondary" class="mt-2 bg-white/20 text-white border-0">{{ merchantStore.stats.shopName }}</Badge>
          <Badge v-else variant="secondary" class="mt-2 bg-white/20 text-white border-0">Commerçant</Badge>
        </div>
        <div class="flex gap-2">
          <button @click="emit('navigate', 'cart')" class="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ShoppingCart class="w-5 h-5" />
            <span v-if="cartItemsCount > 0" class="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
              {{ cartItemsCount }}
            </span>
          </button>
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <Bell class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>
          <button @click="emit('navigate', 'settings')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Settings class="w-5 h-5" /></button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <Card class="bg-white/10 border-white/20 backdrop-blur p-4">
          <div class="flex items-center gap-2 mb-2"><Package class="w-4 h-4 text-white/80" /><p class="text-white/80 text-xs">Commandes en cours</p></div>
          <p v-if="merchantStore.isLoading" class="h-8 w-12 bg-white/20 animate-pulse rounded"></p>
          <p v-else class="text-white text-2xl">{{ merchantStore.stats?.pendingOrdersCount || 0 }}</p>
        </Card>
        <Card class="bg-white/10 border-white/20 backdrop-blur p-4">
          <div class="flex items-center gap-2 mb-2"><TrendingUp class="w-4 h-4 text-white/80" /><p class="text-white/80 text-xs">Ce mois</p></div>
          <p v-if="merchantStore.isLoading" class="h-8 w-24 bg-white/20 animate-pulse rounded"></p>
          <p v-else class="text-white text-lg">{{ ((merchantStore.stats?.monthlySpending || 0) / 1000).toFixed(0) }}k F</p>
        </Card>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Quick Actions -->
      <div>
        <h2 class="mb-4 text-primary">Actions rapides</h2>
        <div class="grid grid-cols-2 gap-3">
          <Button @click="emit('navigate', 'marketplace')" class="h-auto flex-col gap-2 py-4 bg-primary"><Search class="w-6 h-6" /><span class="text-sm">Marketplace</span></Button>
          <Button @click="emit('navigate', 'my-products')" class="h-auto flex-col gap-2 py-4 bg-secondary"><Store class="w-6 h-6" /><span class="text-sm">Ma Boutique</span></Button>
          <Button @click="emit('navigate', 'orders')" variant="outline" class="h-auto flex-col gap-2 py-4"><ShoppingCart class="w-6 h-6 text-primary" /><span class="text-sm">Commandes</span></Button>
          <Button @click="emit('navigate', 'accounting')" variant="outline" class="h-auto flex-col gap-2 py-4"><Calculator class="w-6 h-6 text-primary" /><span class="text-sm">Comptabilité</span></Button>
        </div>
      </div>

      <!-- Active Orders -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-primary">Dernières achats</h3>
          <Button variant="ghost" size="sm" @click="emit('navigate', 'orders')">Voir tout</Button>
        </div>
        <div class="space-y-3">
          <template v-if="merchantStore.isLoading">
            <Card v-for="i in 2" :key="i" class="p-4 animate-pulse">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="h-5 w-24 bg-muted rounded mb-2"></div>
                  <div class="h-4 w-32 bg-muted rounded mb-2"></div>
                  <div class="h-4 w-16 bg-muted rounded"></div>
                </div>
                <div class="h-6 w-24 bg-muted rounded"></div>
              </div>
            </Card>
          </template>
          <template v-else>
            <Card v-for="order in activeOrders" :key="order.id" class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="font-medium">{{ order.product }}</p>
                  <p class="text-sm text-muted-foreground">{{ order.seller }}</p>
                  <p class="text-sm text-primary mt-1">{{ order.quantity }}</p>
                </div>
                <Badge :variant="order.status === 'En livraison' ? 'default' : 'secondary'">{{ order.status }}</Badge>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck class="w-4 h-4" /><span>Livraison : {{ order.delivery }}</span>
              </div>
            </Card>
          </template>
        </div>
      </div>

      <!-- Month Stats -->
      <Card class="p-4">
        <h3 class="text-primary mb-4">Statistiques du mois</h3>
        <div class="space-y-3">
          <template v-if="merchantStore.isLoading">
            <div v-for="i in 3" :key="i" class="flex items-center justify-between animate-pulse">
              <div class="h-4 w-32 bg-muted rounded"></div>
              <div class="h-4 w-20 bg-muted rounded"></div>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center justify-between"><span class="text-muted-foreground">Commandes terminées</span><span class="font-medium text-primary">{{ merchantStore.stats?.completedOrdersCount || 0 }}</span></div>
            <div class="flex items-center justify-between"><span class="text-muted-foreground">Dépenses totales</span><span class="font-medium">{{ (merchantStore.stats?.monthlySpending || 0).toLocaleString() }} F</span></div>
            <div class="flex items-center justify-between"><span class="text-muted-foreground">Moyenne par commande</span><span class="font-medium">{{ (merchantStore.stats?.averageOrderAmount || 0).toLocaleString() }} F</span></div>
          </template>
        </div>
      </Card>

      <!-- Banner -->
      <Card class="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"><Store class="w-5 h-5 text-primary" /></div>
          <div>
            <h4 class="font-medium text-primary mb-1">Développez votre activité</h4>
            <p class="text-sm text-muted-foreground mb-3">Revendez vos produits sur TITRA et augmentez vos revenus</p>
            <Button size="sm" variant="outline">En savoir plus</Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
