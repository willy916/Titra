<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Bell, Plus, TrendingUp, Wallet, Package, Users, Settings, Store, Calculator, GraduationCap, BarChart3 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

interface User { name: string; role: string; balance?: number }
const props = defineProps<{ user: User }>()
const emit = defineEmits<{ navigate: [screen: string] }>()

const isLoading = ref(true)
onMounted(() => { setTimeout(() => isLoading.value = false, 1000) })

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
    interprofession: 'Interprofession', 
    independent: 'Indépendant' 
  }
  return labels[props.user.role as string] || 'Structure'
}

const stats = computed(() => {
  if (props.user.role === 'interprofession') return [
    { label: 'Structures membres', value: '78', icon: Users, description: 'Fédérations, Unions, Coopératives, Associations' },
    { label: 'Produits vendus', value: '324', icon: Package, description: 'Vendus ce mois sur la marketplace' },
    { label: 'Commissions du mois', value: '18.5M FCFA', icon: TrendingUp, description: '1% sur toutes les transactions' },
    { label: 'Volume transactionnel', value: '1.8Mds FCFA', icon: Wallet, description: 'Total des transactions de la filière' },
  ]
  return [
    { label: 'Membres actifs', value: '156', icon: Users, description: 'Producteurs enregistrés' },
    { label: 'Produits vendus', value: '248', icon: Package, description: 'Vendus ce mois' },
    { label: 'Commissions des membres', value: '2.4M FCFA', icon: TrendingUp, description: 'Revenus sur ventes membres' },
    { label: 'Solde disponible', value: `${(props.user.balance || 0).toLocaleString()} FCFA`, icon: Wallet, description: 'Disponible pour retrait' },
  ]
})

const quickActions = [
  { label: 'Gérer les membres', icon: Users, screen: 'members', variant: 'default' as const },
  { label: 'Ajouter un produit', icon: Plus, screen: 'add-product', variant: 'outline' as const },
  { label: 'Voir nos produits', icon: Package, screen: 'my-products', variant: 'outline' as const },
  { label: 'Statistiques', icon: BarChart3, screen: 'stats', variant: 'outline' as const },
  { label: 'Ma Comptabilité', icon: Calculator, screen: 'accounting', variant: 'outline' as const },
  { label: 'Formation', icon: GraduationCap, screen: 'training', variant: 'outline' as const },
]

const getRecentActivities = () => {
  if (props.user.role === 'interprofession') return [
    { id: '1', type: 'new_structure', member: 'Fédération Nationale du Cacao', description: 'Nouvelle fédération enregistrée', time: 'Il y a 3h' },
    { id: '2', type: 'member_sale', member: 'SCOOP-CA Agnibilékrou', description: 'Vente de 2 tonnes d\'anacarde - Commission: 125,000 FCFA', time: 'Il y a 5h', amount: 125000 },
    { id: '3', type: 'strategic_actor', member: 'SACO Export', description: 'Nouvel acteur stratégique (Exportateur)', time: 'Il y a 1j' },
    { id: '4', type: 'member_sale', member: 'Union des Producteurs du Sud', description: 'Transaction café - Commission: 85,000 FCFA', time: 'Il y a 1j', amount: 85000 },
  ]
  if (props.user.role === 'federation') return [
    { id: '1', type: 'union_sale', member: 'Union des Producteurs du Sud', description: 'Vente de 1.5 tonnes de café - Commission: 95,000 FCFA', time: 'Il y a 2h', amount: 95000 },
    { id: '2', type: 'union_sale', member: 'Union des Planteurs de Cacao', description: 'Vente de 3 tonnes de cacao - Commission: 180,000 FCFA', time: 'Il y a 4h', amount: 180000 },
    { id: '3', type: 'new_union', member: 'Union Régionale de l\'Ouest', description: 'Nouvelle union enregistrée dans la fédération', time: 'Il y a 1j' },
    { id: '4', type: 'union_sale', member: 'Union des Coopératives du Centre', description: 'Vente d\'anacarde - Commission: 65,000 FCFA', time: 'Il y a 1j', amount: 65000 },
  ]
  if (props.user.role === 'union') return [
    { id: '1', type: 'coop_sale', member: 'SCOOP-CA Agnibilékrou', description: 'Vente de 800kg d\'anacarde - Commission: 45,000 FCFA', time: 'Il y a 1h', amount: 45000 },
    { id: '2', type: 'asso_sale', member: 'Association Femmes Agricultrices', description: 'Vente de produits bio - Commission: 28,000 FCFA', time: 'Il y a 3h', amount: 28000 },
    { id: '3', type: 'coop_sale', member: 'Coopérative des Planteurs de Café', description: 'Vente de 1.2 tonnes de café - Commission: 75,000 FCFA', time: 'Il y a 5h', amount: 75000 },
    { id: '4', type: 'new_structure', member: 'Association Jeunes Agriculteurs', description: 'Nouvelle association enregistrée dans l\'union', time: 'Il y a 1j' },
  ]
  return [
    { id: '1', type: 'member_sale', member: 'Kouadio Jean', description: 'Vente de cacao - Commission: 15,000 FCFA', time: 'Il y a 2h', amount: 15000 },
    { id: '2', type: 'new_member', member: 'Aminata Traoré', description: 'Nouveau membre inscrit', time: 'Il y a 5h' },
    { id: '3', type: 'institution_sale', description: 'Vente directe de café - 500kg', time: 'Il y a 1j', amount: 750000 },
    { id: '4', type: 'member_sale', member: 'Yao Koffi', description: 'Vente d\'igname - Commission: 8,000 FCFA', time: 'Il y a 2j', amount: 8000 },
  ]
}
const recentActivities = getRecentActivities()

function getActivityIcon(type: string) {
  if (['member_sale', 'union_sale', 'coop_sale', 'asso_sale'].includes(type)) return TrendingUp
  if (['new_member', 'new_structure', 'new_union'].includes(type)) return Users
  if (type === 'strategic_actor') return Package
  return Store
}
function getActivityClass(type: string) {
  if (['member_sale', 'union_sale', 'coop_sale', 'asso_sale'].includes(type)) return 'bg-success/10 text-success'
  if (['new_member', 'new_structure', 'new_union'].includes(type)) return 'bg-primary/10 text-primary'
  if (type === 'strategic_actor') return 'bg-accent/10 text-accent'
  return 'bg-secondary/10 text-secondary'
}
</script>

<template>
  <div class="pb-20 lg:pb-0">
    <div class="p-4 lg:p-0 space-y-6">
      <!-- Stats Grid -->
      <div class="bg-gradient-to-br from-[#2D5016] via-[#2D5016] to-[#1a3009] rounded-xl p-6 -mx-4 lg:mx-0">
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
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0"><Store class="w-6 h-6 text-primary" /></div>
          <div>
            <h3 class="mb-2">Votre structure en action</h3>
            <p class="text-sm text-muted-foreground mb-4 text-[12px]">En tant que {{ getRoleLabel() }}, vous pouvez produire, transformer, vendre vos propres produits ET gérer vos membres. Gagnez des commissions sur chaque transaction de vos membres !</p>
            <div class="flex gap-2">
              <Button size="sm" @click="emit('navigate', 'my-products')">Nos produits</Button>
              <Button size="sm" variant="outline" @click="emit('navigate', 'members')">Gérer les membres</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
