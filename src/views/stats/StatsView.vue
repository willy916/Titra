<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, TrendingUp, TrendingDown, Users, Package, DollarSign, Download, Building2, ShoppingCart, Award, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { UserRole } from '@/types'
import { useCooperativeStore } from '@/stores/cooperative'
import { toast } from 'vue-sonner'

const props = defineProps<{ userRole: UserRole; filiere?: string }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const cooperativeStore = useCooperativeStore()
const isLoading = ref(true)
const performanceData = ref<any>(null)

onMounted(async () => {
  try {
    performanceData.value = await cooperativeStore.fetchPerformanceStats()
  } catch (error) {
    console.error('Error fetching performance stats:', error)
    toast.error('Erreur lors du chargement des statistiques')
  } finally {
    isLoading.value = false
  }
})

const isInterprofession = computed(() => props.userRole === 'interprofession')
const isFederation = computed(() => props.userRole === 'federation')
const isUnion = computed(() => props.userRole === 'union')

// Summary statistics from API
const summaryStats = computed(() => {
  const defaults = {
    ventes: { montant: 0, label: '0,0M F', trend: '' },
    commissions: { montant: 0, label: '0,00M F', trend: '' },
    commandes: { total: 0, period: 'Ce mois', trend: '' },
    membres: { total: 0, actifs: 0 }
  }
  
  if (!performanceData.value?.summary) return defaults

  return {
    ventes: { ...defaults.ventes, ...performanceData.value.summary.ventes },
    commissions: { ...defaults.commissions, ...performanceData.value.summary.commissions },
    commandes: { ...defaults.commandes, ...performanceData.value.summary.commandes },
    membres: { ...defaults.membres, ...performanceData.value.summary.structures } // Map structures to membres for consistency
  }
})

// Top products from API
const topProductsList = computed(() => {
  return (performanceData.value?.topProducts || []).map((p: any) => ({
    ...p,
    quantity: p.tonnage,
    revenue: p.caGenere,
    orders: p.nbCommandes
  }))
})

const structureBreakdown = computed(() => {
  if (!isInterprofession.value) return null
  
  const dist = performanceData.value?.structureDistribution || {}
  
  return [
    { type: 'Fédérations', count: dist.federations?.count || 0, percentage: parseInt(dist.federations?.percentage) || 0, commission: dist.federations?.caGenereted || 0, color: 'var(--primary)' },
    { type: 'Unions', count: dist.unions?.count || 0, percentage: parseInt(dist.unions?.percentage) || 0, commission: dist.unions?.caGenereted || 0, color: '#FF9800' },
    { type: 'Coopératives', count: dist.cooperatives?.count || 0, percentage: parseInt(dist.cooperatives?.percentage) || 0, commission: dist.cooperatives?.caGenereted || 0, color: '#2196F3' },
    { type: 'Associations', count: dist.associations?.count || 0, percentage: parseInt(dist.associations?.percentage) || 0, commission: dist.associations?.caGenereted || 0, color: '#9C27B0' },
  ]
})

const topMembersList = computed(() => {
  return (performanceData.value?.topMembers || []).map((m: any) => ({
    name: m.name,
    sales: m.totalSales || m.sales,
    commission: m.totalCommission || m.commission,
    products: m.nbProducts || m.products,
    type: m.type || 'Membre',
    growth: m.trend || m.growth || '+0%'
  }))
})

const memberLabel = computed(() => {
  if (isInterprofession.value) return 'Top structures'
  if (isFederation.value) return 'Top unions'
  if (isUnion.value) return 'Top structures'
  return 'Top membres'
})
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-gradient-to-br from-primary via-primary-dark to-primary-darker text-white p-6">
      <div class="flex items-center gap-4 mb-6">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-white text-2xl">Statistiques</h1>
          <p class="text-white/80 text-sm">{{ isInterprofession ? "Performance de l'interprofession" : "Performance de la structure" }}</p>
        </div>
        <Button size="sm" class="bg-white text-primary hover:bg-white/90">
          <Download class="w-4 h-4 mr-2" />Export
        </Button>
      </div>

      <!-- Quick Stats -->
      <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-50">
        <Card v-for="i in 4" :key="i" class="h-24 bg-white/10 animate-pulse border-0"></Card>
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><DollarSign class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">Ventes</span>
          </div>
          <p class="text-white text-xl font-medium">{{ summaryStats.ventes.label }}</p>
          <div v-if="summaryStats.ventes.trend" class="flex items-center gap-1 mt-1">
            <component :is="summaryStats.ventes.trend.startsWith('+') ? TrendingUp : TrendingDown" :class="['w-3 h-3', summaryStats.ventes.trend.startsWith('+') ? 'text-green-300' : 'text-red-300']" />
            <span :class="['text-xs', summaryStats.ventes.trend.startsWith('+') ? 'text-green-300' : 'text-red-300']">{{ summaryStats.ventes.trend }}</span>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Award class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">Commissions</span>
          </div>
          <p class="text-white text-xl font-medium">{{ summaryStats.commissions.label }}</p>
          <div v-if="summaryStats.commissions.trend" class="flex items-center gap-1 mt-1">
            <component :is="summaryStats.commissions.trend.startsWith('+') ? TrendingUp : TrendingDown" :class="['w-3 h-3', summaryStats.commissions.trend.startsWith('+') ? 'text-green-300' : 'text-red-300']" />
            <span :class="['text-xs', summaryStats.commissions.trend.startsWith('+') ? 'text-green-300' : 'text-red-300']">{{ summaryStats.commissions.trend }}</span>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><ShoppingCart class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">Commandes</span>
          </div>
          <p class="text-white text-xl font-medium">{{ summaryStats.commandes.total }}</p>
          <div class="flex items-center gap-1 mt-1">
             <component v-if="summaryStats.commandes.trend" :is="summaryStats.commandes.trend.startsWith('+') ? TrendingUp : TrendingDown" :class="['w-3 h-3', summaryStats.commandes.trend.startsWith('+') ? 'text-green-300' : 'text-red-300']" />
             <span class="text-white/60 text-xs">{{ summaryStats.commandes.trend || summaryStats.commandes.period }}</span>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Users class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">{{ isInterprofession ? 'Structures' : 'Membres' }}</span>
          </div>
          <p class="text-white text-xl font-medium">{{ summaryStats.membres.total }}</p>
          <span class="text-white/60 text-xs">{{ summaryStats.membres.actifs }} actifs</span>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <div v-if="isLoading" class="flex flex-col items-center justify-center p-12">
        <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
        <p class="text-muted-foreground">Calcul des performances en cours...</p>
      </div>

      <template v-else>
        <!-- Structure Breakdown (Interprofession only) -->
        <Card v-if="structureBreakdown" class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-[#9C27B0]/10 rounded-lg flex items-center justify-center"><Building2 class="w-5 h-5 text-[#9C27B0]" /></div>
            <div>
              <h3 class="text-lg font-medium">Répartition des structures</h3>
              <p class="text-sm text-muted-foreground">Par type d'organisation</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="structure in structureBreakdown" :key="structure.type" class="p-4 rounded-xl border-2 hover:shadow-md transition-shadow" :style="{ borderColor: structure.color + '20' }">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: structure.color }"></div>
                <span class="text-sm font-medium">{{ structure.type }}</span>
              </div>
              <p class="text-2xl font-bold mb-1">{{ structure.count }}</p>
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>{{ structure.percentage }}% du total</span>
                <span class="font-medium text-primary">{{ (structure.commission / 1000000).toFixed(1) }}M F</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Top Products -->
        <Card class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-[#FF9800]/10 rounded-lg flex items-center justify-center"><Package class="w-5 h-5 text-[#FF9800]" /></div>
            <div>
              <h3 class="text-lg font-medium">Produits les plus vendus</h3>
              <p class="text-sm text-muted-foreground">Top performance ce mois</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-if="topProductsList.length === 0" class="text-center py-6 text-muted-foreground">
               Aucune donnée de vente disponible.
            </div>
            <div v-for="(product, index) in topProductsList" :key="product.name" class="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div class="flex items-center gap-3">
                <div :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white',
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-primary to-primary-dark'
                ]">{{ Number(index) + 1 }}</div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="font-medium">{{ product.name }}</h4>
                    <Badge :class="product.trend?.startsWith('+') ? 'bg-green-600' : 'bg-red-600'">
                      <component :is="product.trend?.startsWith('+') ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />{{ product.trend }}
                    </Badge>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex gap-4 text-muted-foreground">
                      <span>{{ product.tonnage }}</span>
                      <span>•</span>
                      <span>{{ product.nbCommandes }}</span>
                    </div>
                    <span class="font-bold text-primary">{{ (product.caGenere / 1000000).toFixed(1) }}M F</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Top Members -->
        <Card class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Award class="w-5 h-5 text-primary" /></div>
            <div>
              <h3 class="text-lg font-medium">{{ memberLabel }}</h3>
              <p class="text-sm text-muted-foreground">Commissions par {{ isInterprofession || isUnion ? 'structure' : isFederation ? 'union' : 'membre' }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-if="topMembersList.length === 0" class="text-center py-6 text-muted-foreground">
               Aucun membre enregistré pour cette période.
            </div>
            <div v-for="(member, index) in topMembersList" :key="member.name" class="p-4 rounded-xl border-2 border-muted hover:border-primary/30 hover:shadow-md transition-all">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-bold">{{ Number(index) + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <div class="min-w-0">
                      <h4 class="font-medium truncate">{{ member.name }}</h4>
                      <Badge v-if="isInterprofession || isUnion" variant="outline" class="text-xs mt-1">{{ member.type }}</Badge>
                    </div>
                    <Badge class="bg-green-600"><TrendingUp class="w-3 h-3 mr-1" />{{ member.growth }}</Badge>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p class="text-muted-foreground mb-0.5">Ventes</p>
                      <p class="font-medium truncate">{{ (member.sales / 1000000).toFixed(1) }}M F</p>
                    </div>
                    <div>
                      <p class="text-muted-foreground mb-0.5">Com.</p>
                      <p class="font-bold text-[#FF9800] truncate">{{ (member.commission / 1000000).toFixed(2) }}M F</p>
                    </div>
                    <div>
                      <p class="text-muted-foreground mb-0.5">Produits</p>
                      <p class="font-medium truncate">{{ member.products }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </template>
    </div>
  </div>
</template>
