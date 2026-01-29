<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Bell, Plus, MessageSquare, TrendingUp, Wallet, Package, ShoppingBag, Settings, Calculator, GraduationCap, ShoppingCart } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { usePaysanStore } from '@/stores/paysan'
import { useCartStore } from '@/stores/cart'
import { toast } from 'vue-sonner'

const props = defineProps<{ user: { name: string; balance?: number } }>()
const emit = defineEmits<{ navigate: [screen: string] }>()

const paysanStore = usePaysanStore()
const cartStore = useCartStore()
const isLoading = ref(true)

onMounted(async () => { 
  try {
    await Promise.all([
      paysanStore.fetchDashboardStats(),
      paysanStore.fetchActivities(),
      paysanStore.fetchRecommendations()
    ])
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    toast.error('Erreur lors du chargement des données')
  } finally {
    isLoading.value = false
  }
})

const dashboardStats = computed(() => {
  if (!paysanStore.stats) {
    return {
      balance: props.user.balance || 0,
      pendingBalance: 0,
      monthly: { produits: 0, ventes: 0, commandes: 0, revenus: 0 },
      completion: 0
    }
  }
  
  const s = paysanStore.stats
  return {
    balance: s.wallet?.soldeDisponible || 0,
    pendingBalance: s.wallet?.soldeEnAttente || 0,
    monthly: {
      produits: s.monthStats?.produits || 0,
      ventes: s.monthStats?.ventes || 0,
      commandes: s.monthStats?.commandes || 0,
      revenus: s.monthStats?.revenus || 0
    },
    completion: s.profileCompletion || 0
  }
})

const cartItemsCount = computed(() => cartStore.items.length)

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'NOUVELLE_COMMANDE': return ShoppingBag
    case 'MESSAGE_RECU': return MessageSquare
    case 'PRODUIT_PUBLIE': return Package
    case 'VENTE_EFFECTUEE': return TrendingUp
    default: return Bell
  }
}

const quickActions = [
  { label: 'Ajouter un produit', icon: Plus, screen: 'add-product', variant: 'default' as const },
  { label: 'Ma Comptabilité', icon: Calculator, screen: 'accounting', variant: 'outline' as const },
  { label: 'Formation', icon: GraduationCap, screen: 'training', variant: 'outline' as const },
  { label: 'Mes conversations', icon: MessageSquare, screen: 'messages', variant: 'outline' as const },
]
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6 rounded-b-3xl">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-white/80 text-sm">Bonjour,</p>
          <h1 class="text-white text-2xl">{{ paysanStore.stats?.paysanInfo?.fullName || user.name }}</h1>
          <Badge v-if="paysanStore.stats?.paysanInfo?.cooperative" variant="secondary" class="mt-2 bg-white/20 text-white border-0">
            {{ paysanStore.stats.paysanInfo.cooperative }}
          </Badge>
          <Badge v-else variant="secondary" class="mt-2 bg-white/20 text-white border-0">Paysan</Badge>
        </div>
        <div class="flex gap-2">
          <button @click="emit('navigate', 'cart')" class="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ShoppingCart class="w-5 h-5" />
            <span v-if="cartItemsCount > 0" class="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
              {{ cartItemsCount }}
            </span>
          </button>
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Bell class="w-5 h-5" /></button>
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Settings class="w-5 h-5" /></button>
        </div>
      </div>

      <!-- Balance Cards -->
      <div class="grid grid-cols-2 gap-3">
        <Card class="bg-white/10 border-white/20 backdrop-blur p-4">
          <div class="flex items-center gap-2 mb-2"><Wallet class="w-4 h-4 text-white/80" /><p class="text-white/80 text-xs">Solde disponible</p></div>
          <p class="text-white text-xl">{{ dashboardStats.balance.toLocaleString() }} F</p>
        </Card>
        <Card class="bg-white/10 border-white/20 backdrop-blur p-4">
          <div class="flex items-center gap-2 mb-2"><TrendingUp class="w-4 h-4 text-white/80" /><p class="text-white/80 text-xs">En attente</p></div>
          <p class="text-white text-xl">{{ dashboardStats.pendingBalance.toLocaleString() }} F</p>
        </Card>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Stats -->
      <Card class="p-4">
        <h3 class="text-primary mb-4">Statistiques du mois</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center"><p class="text-muted-foreground text-sm">Produits</p><p class="text-2xl text-primary">{{ dashboardStats.monthly.produits }}</p></div>
          <div class="text-center"><p class="text-muted-foreground text-sm">Ventes</p><p class="text-2xl text-secondary">{{ dashboardStats.monthly.ventes }}</p></div>
          <div class="text-center"><p class="text-muted-foreground text-sm">Commandes</p><p class="text-2xl text-primary">{{ dashboardStats.monthly.commandes }}</p></div>
          <div class="text-center"><p class="text-muted-foreground text-sm">Revenus</p><p class="text-lg text-primary">{{ dashboardStats.monthly.revenus.toLocaleString() }} F</p></div>
        </div>
      </Card>

      <!-- Quick Actions -->
      <div>
        <h3 class="mb-4">Actions rapides</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            v-for="(action, index) in quickActions" 
            :key="index" 
            :variant="action.variant" 
            @click="emit('navigate', action.screen)" 
            :class="`h-auto py-4 flex flex-col gap-2 ${action.variant === 'default' ? 'bg-primary hover:bg-primary/90' : ''}`"
          >
            <component :is="action.icon" class="w-5 h-5" />
            <span class="text-sm">{{ action.label }}</span>
          </Button>
        </div>
      </div>

      <!-- Desktop Two-Column Layout -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Recommendations -->
        <div class="space-y-4">
          <h3 class="mb-4">Recommandations</h3>
          
          <template v-if="isLoading">
            <Card v-for="i in 2" :key="i" class="p-4 animate-pulse">
              <div class="flex gap-3">
                <div class="w-10 h-10 bg-muted rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-muted rounded w-1/2"></div>
                  <div class="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </Card>
          </template>
          
          <template v-else>
            <Card v-for="(rec, index) in paysanStore.recommendations" :key="index" class="p-4 border-l-4 border-l-secondary overflow-hidden">
              <div class="flex items-start gap-3">
                <div class="bg-secondary/10 p-2 rounded-lg shrink-0"><TrendingUp class="w-5 h-5 text-secondary" /></div>
                <div class="flex-1">
                  <p class="font-medium mb-1 text-sm">{{ rec }}</p>
                  <Button variant="link" class="p-0 h-auto text-secondary text-xs" @click="emit('navigate', rec.includes('profil') ? 'profile' : 'add-product')">
                    {{ rec.includes('profil') ? 'Compléter maintenant →' : 'Ajouter un produit →' }}
                  </Button>
                </div>
              </div>
            </Card>
          </template>

          <Card v-if="!isLoading && paysanStore.recommendations.length === 0" class="p-6 text-center text-muted-foreground border-dashed">
            Votre profil est optimal ! ✨
          </Card>
        </div>

        <!-- Recent Activity -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3>Activité récente</h3>
            <Button variant="link" class="p-0 h-auto">Voir tout</Button>
          </div>
          <div class="space-y-3">
            <template v-if="isLoading">
              <Card v-for="i in 3" :key="i" class="p-4 animate-pulse"><div class="flex gap-3"><div class="w-10 h-10 bg-muted rounded-lg"></div><div class="flex-1"><div class="h-4 bg-muted rounded w-1/2 mb-2"></div><div class="h-3 bg-muted rounded w-3/4"></div></div></div></Card>
            </template>
            <template v-else-if="paysanStore.activities.length === 0">
              <Card class="p-8 text-center border-dashed">
                <Bell class="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p class="text-sm text-muted-foreground">Aucune activité récente</p>
              </Card>
            </template>
            <template v-else>
              <Card v-for="(activity, index) in paysanStore.activities" :key="index" class="p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start gap-3">
                  <div class="bg-muted p-2 rounded-lg"><component :is="getActivityIcon(activity.type)" class="w-4 h-4" /></div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm">{{ activity.title }}</p>
                    <p class="text-sm text-muted-foreground truncate">{{ activity.description }}</p>
                  </div>
                  <span class="text-xs text-muted-foreground whitespace-nowrap">{{ activity.timeAgo }}</span>
                </div>
              </Card>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
