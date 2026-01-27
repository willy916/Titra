<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Bell, Plus, TrendingUp, Wallet, Package, Users, Settings, Store, Calculator, GraduationCap, BarChart3, UserPlus, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { User } from '@/types'
import { usePaysanStore } from '@/stores/paysan'

const props = defineProps<{ user: User }>()
const emit = defineEmits<{ navigate: [screen: string] }>()

const paysanStore = usePaysanStore()
const isLoading = ref(true)

onMounted(async () => { 
  try {
    await Promise.all([
      paysanStore.fetchDashboardStats(),
      paysanStore.fetchActivities()
    ])
  } catch (error) {
    console.error('Failed to load cooperative dashboard:', error)
  } finally {
    isLoading.value = false 
  }
})

const displayName = computed(() => {
  const role = props.user.role as string
  const roleSpecificName = (props.user as any)[role]
  return roleSpecificName || props.user.name || 'Structure'
})

const getRoleLabel = () => {
  const labels: Record<string, string> = { 
    cooperative: 'Coopérative', 
    association: 'Association', 
    union: 'Union', 
    federation: 'Fédération', 
    interprofession: 'Interprofession' 
  }
  return labels[props.user.role as string] || 'Structure'
}

const stats = computed(() => {
  const data = paysanStore.stats || { 
    membresActifs: 0, 
    produitsVendusCeMois: 0, 
    commissionsTotal: 0, 
    soldeDisponible: 0 
  }
  
  return [
    { label: 'Membres actifs', value: data.membresActifs?.toString() || '0', icon: Users, description: 'Actifs ce mois' },
    { label: 'Produits vendus', value: data.produitsVendusCeMois?.toString() || '0', icon: Package, description: 'Vendus ce mois' },
    { label: 'Commissions', value: `${(data.commissionsTotal || 0).toLocaleString()} F`, icon: TrendingUp, description: 'Total généré' },
    { label: 'Solde disponible', value: `${(data.soldeDisponible || props.user.balance || 0).toLocaleString()} F`, icon: Wallet, description: 'Disponible pour retrait' },
  ]
})

const quickActions = [
  { label: 'Enregistrer un paysan', icon: UserPlus, screen: 'add-member', variant: 'default' as const },
  { label: 'Voir les membres', icon: Users, screen: 'members', variant: 'outline' as const },
  { label: 'Ajouter un produit', icon: Plus, screen: 'add-product', variant: 'outline' as const },
  { label: 'Statistiques', icon: BarChart3, screen: 'stats', variant: 'outline' as const },
  { label: 'Ma Comptabilité', icon: Calculator, screen: 'accounting', variant: 'outline' as const },
  { label: 'Formation', icon: GraduationCap, screen: 'training', variant: 'outline' as const },
]

const topSellers = computed(() => {
  return (paysanStore.stats?.bestSellers || []).map((s: any, index: number) => ({
    id: s.matricule || index.toString(),
    name: s.name,
    matricule: s.matricule,
    sales: s.totalSales,
    formattedSales: s.formattedSales
  }))
})

const recentActivities = computed(() => {
  const activities = paysanStore.activities || []
  return activities.map((act: any, index: number) => ({
    id: act.id || index, 
    type: act.type || 'member_sale', 
    member: act.member || 'Membre', 
    description: act.description || 'Action effectuée', 
    time: act.time || 'Récemment', 
    amount: act.amount
  })).slice(0, 5) // Show only last 5
})

function getActivityIcon(type: string) {
  if (type === 'member_sale') return TrendingUp
  if (type === 'new_member') return Users
  return Store
}

function getActivityClass(type: string) {
  if (type === 'member_sale') return 'bg-success/10 text-success'
  if (type === 'new_member') return 'bg-primary/10 text-primary'
  return 'bg-secondary/10 text-secondary'
}
</script>

<template>
  <div class="pb-20 lg:pb-0">
    <div class="p-4 lg:p-0 space-y-6">
      <!-- Stats Grid -->
      <div class="bg-gradient-to-br from-primary via-primary-dark to-primary-darker rounded-xl p-6 -mx-4 lg:mx-0">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-white/80 text-sm">{{ getRoleLabel() }}</p>
            <h3 class="text-white">{{ displayName }}</h3>
          </div>
          <div class="flex gap-2">
            <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell class="w-5 h-5 text-white" />
            </button>
            <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Settings class="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <template v-if="isLoading">
            <div v-for="i in 4" :key="i" class="bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-pulse">
              <div class="w-8 h-8 bg-white/20 rounded-lg mb-2"></div>
              <div class="h-6 bg-white/20 rounded mb-1"></div>
              <div class="h-4 bg-white/20 rounded w-2/3"></div>
            </div>
          </template>
          <template v-else>
            <div v-for="(stat, index) in stats" :key="index" class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-colors">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><component :is="stat.icon" class="w-4 h-4 text-white" /></div>
                <span class="text-white/80 text-xs">{{ stat.label }}</span>
              </div>
              <p class="text-white text-xl font-medium mb-1">{{ stat.value }}</p>
              <p class="text-white/60 text-xs">{{ stat.description }}</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Quick Actions -->
      <Card class="p-6">
        <h3 class="mb-4">Actions rapides</h3>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Button v-for="(action, index) in quickActions" :key="index" :variant="action.variant" @click="emit('navigate', action.screen)" class="h-auto py-4 flex-col gap-2">
            <component :is="action.icon" class="w-5 h-5" />
            <span class="text-sm">{{ action.label }}</span>
          </Button>
        </div>
      </Card>

      <!-- Top Sellers -->
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3>Meilleurs vendeurs du mois</h3>
          <BarChart3 class="w-5 h-5 text-muted-foreground" />
        </div>
        <template v-if="isLoading">
          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="flex gap-3 p-3 rounded-lg border animate-pulse">
              <div class="w-8 h-8 bg-muted rounded-full"></div>
              <div class="flex-1"><div class="h-4 bg-muted rounded w-1/2 mb-2"></div><div class="h-3 bg-muted rounded w-3/4"></div></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="space-y-3">
            <div v-for="(seller, index) in topSellers" :key="seller.id" class="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span class="text-primary font-medium">{{ Number(index) + 1 }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">{{ seller.name }}</p>
                <p class="text-xs text-muted-foreground">{{ seller.matricule }}</p>
              </div>
              <p class="font-semibold text-primary">{{ seller.formattedSales || `${(seller.sales / 1000).toFixed(0)}k F` }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Recent Activities -->
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3>Activités récentes</h3>
          <Button variant="ghost" size="sm" @click="emit('navigate', 'stats')">Voir tout</Button>
        </div>
        <template v-if="isLoading">
          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="flex gap-3 p-3 rounded-lg border animate-pulse">
              <div class="w-10 h-10 bg-muted rounded-full"></div>
              <div class="flex-1"><div class="h-4 bg-muted rounded w-1/2 mb-2"></div><div class="h-3 bg-muted rounded w-3/4"></div></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="space-y-3">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center', getActivityClass(activity.type)]">
                <component :is="getActivityIcon(activity.type)" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p v-if="activity.member" class="font-medium text-sm">{{ activity.member }}</p>
                <p class="text-sm text-muted-foreground">{{ activity.description }}</p>
                <p class="text-xs text-muted-foreground mt-1">{{ activity.time }}</p>
              </div>
              <div v-if="activity.amount" class="text-right">
                <p class="font-semibold text-success">+{{ activity.amount.toLocaleString() }} FCFA</p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Info Card -->
      <Card class="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0"><Package class="w-6 h-6 text-primary" /></div>
          <div>
            <h3 class="mb-2">Traçabilité et transparence</h3>
            <p class="text-sm text-muted-foreground mb-4 text-[12px]">Tous vos membres sont identifiés avec un matricule unique. Gérez vos producteurs, suivez leurs ventes et gagnez des commissions sur chaque transaction !</p>
            <div class="flex gap-2">
              <Button size="sm" @click="emit('navigate', 'add-member')">Ajouter un membre</Button>
              <Button size="sm" variant="outline" @click="emit('navigate', 'members')">Voir les membres</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
