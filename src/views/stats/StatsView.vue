<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, TrendingUp, TrendingDown, Users, Package, DollarSign, Download, Building2, ShoppingCart, Award } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import type { UserRole } from '@/types'

const props = defineProps<{ userRole: UserRole; filiere?: string }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const filiere = props.filiere || 'Cacao'

const isInterprofession = computed(() => props.userRole === 'interprofession')
const isFederation = computed(() => props.userRole === 'federation')
const isUnion = computed(() => props.userRole === 'union')

// Données produits par filière
const filiereProducts = computed(() => {
  const products: Record<string, any[]> = {
    'Cacao': [
      { name: 'Cacao en fèves', quantity: '245 tonnes', revenue: 122500000, trend: '+28%', orders: 89 },
      { name: 'Cacao fermenté', quantity: '180 tonnes', revenue: 90000000, trend: '+15%', orders: 67 },
      { name: 'Cacao séché', quantity: '95 tonnes', revenue: 47500000, trend: '+22%', orders: 54 },
      { name: 'Poudre de cacao', quantity: '50 tonnes', revenue: 36000000, trend: '+8%', orders: 42 },
    ],
    'Anacarde': [
      { name: 'Noix de cajou brutes', quantity: '320 tonnes', revenue: 160000000, trend: '+32%', orders: 95 },
      { name: 'Noix décortiquées', quantity: '180 tonnes', revenue: 108000000, trend: '+25%', orders: 72 },
      { name: 'Amandes de cajou', quantity: '95 tonnes', revenue: 85500000, trend: '+18%', orders: 58 },
    ],
    'Café': [
      { name: 'Café Arabica', quantity: '150 tonnes', revenue: 112500000, trend: '+30%', orders: 78 },
      { name: 'Café Robusta', quantity: '180 tonnes', revenue: 90000000, trend: '+22%', orders: 82 },
      { name: 'Café torréfié', quantity: '75 tonnes', revenue: 67500000, trend: '+18%', orders: 54 },
    ],
  }
  return products[filiere] || products['Cacao']
})

const stats = computed(() => {
  const totalRevenue = filiereProducts.value.reduce((sum, p) => sum + p.revenue, 0)
  const totalOrders = filiereProducts.value.reduce((sum, p) => sum + p.orders, 0)
  const commissionRate = 0.08
  const totalCommissions = totalRevenue * commissionRate

  if (isInterprofession.value) {
    return {
      totalMembers: 78,
      activeMembers: 72,
      thisMonth: totalRevenue * 0.15,
      lastMonth: totalRevenue * 0.12,
      commissionsThisMonth: totalCommissions * 0.15,
      commissionsLastMonth: totalCommissions * 0.12,
      totalOrders,
    }
  }
  return {
    totalMembers: 147,
    activeMembers: 132,
    thisMonth: totalRevenue * 0.20,
    lastMonth: totalRevenue * 0.16,
    commissionsThisMonth: totalCommissions * 0.20,
    commissionsLastMonth: totalCommissions * 0.16,
    totalOrders,
  }
})

const growth = computed(() => ((stats.value.thisMonth - stats.value.lastMonth) / stats.value.lastMonth) * 100)
const commissionGrowth = computed(() => ((stats.value.commissionsThisMonth - stats.value.commissionsLastMonth) / stats.value.commissionsLastMonth) * 100)

const structureBreakdown = computed(() => isInterprofession.value ? [
  { type: 'Fédérations', count: 12, percentage: 15, commission: 12500000, color: '#2D5016' },
  { type: 'Unions', count: 24, percentage: 31, commission: 4200000, color: '#FF9800' },
  { type: 'Coopératives', count: 28, percentage: 36, commission: 1400000, color: '#2196F3' },
  { type: 'Associations', count: 14, percentage: 18, commission: 400000, color: '#9C27B0' },
] : null)

const topMembers = computed(() => {
  if (isInterprofession.value) return [
    { name: 'Fédération Nationale du Cacao', sales: 850000000, commission: 8500000, products: 324, type: 'Fédération', growth: '+32%' },
    { name: 'Union des Producteurs du Sud', sales: 320000000, commission: 3200000, products: 186, type: 'Union', growth: '+28%' },
    { name: 'SCOOP-CA Agnibilékrou', sales: 215000000, commission: 2150000, products: 142, type: 'Coopérative', growth: '+18%' },
  ]
  if (isFederation.value) return [
    { name: 'Union des Producteurs du Sud', sales: 12500000, commission: 625000, products: 86, type: 'Union', growth: '+35%' },
    { name: 'Union des Planteurs de Cacao', sales: 10800000, commission: 540000, products: 72, type: 'Union', growth: '+28%' },
    { name: 'Union des Coopératives du Centre', sales: 8200000, commission: 410000, products: 54, type: 'Union', growth: '+22%' },
  ]
  if (isUnion.value) return [
    { name: 'SCOOP-CA Agnibilékrou', sales: 8500000, commission: 425000, products: 85, type: 'Coopérative', growth: '+32%' },
    { name: 'Coopérative des Planteurs de Café', sales: 7200000, commission: 360000, products: 95, type: 'Coopérative', growth: '+28%' },
    { name: 'Association Femmes Agricultrices', sales: 5600000, commission: 280000, products: 45, type: 'Association', growth: '+24%' },
  ]
  return [
    { name: 'Kouadio Jean', sales: 3200000, commission: 160000, products: 24, type: 'Membre', growth: '+22%' },
    { name: 'Aminata Traoré', sales: 2800000, commission: 140000, products: 18, type: 'Membre', growth: '+18%' },
    { name: 'Yao Koffi', sales: 2400000, commission: 120000, products: 15, type: 'Membre', growth: '+12%' },
  ]
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
    <div class="bg-gradient-to-br from-[#2D5016] via-[#2D5016] to-[#1a3009] text-white p-6">
      <div class="flex items-center gap-4 mb-6">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-white text-2xl">Statistiques</h1>
          <p class="text-white/80 text-sm">{{ isInterprofession ? "Performance de l'interprofession" : "Performance de la structure" }}</p>
        </div>
        <Button size="sm" class="bg-white text-[#2D5016] hover:bg-white/90">
          <Download class="w-4 h-4 mr-2" />Export
        </Button>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><DollarSign class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">Ventes</span>
          </div>
          <p class="text-white text-xl font-medium">{{ (stats.thisMonth / 1000000).toFixed(1) }}M F</p>
          <div class="flex items-center gap-1 mt-1">
            <component :is="growth > 0 ? TrendingUp : TrendingDown" :class="['w-3 h-3', growth > 0 ? 'text-green-300' : 'text-red-300']" />
            <span :class="['text-xs', growth > 0 ? 'text-green-300' : 'text-red-300']">{{ growth > 0 ? '+' : '' }}{{ growth.toFixed(1) }}%</span>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Award class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">Commissions</span>
          </div>
          <p class="text-white text-xl font-medium">{{ (stats.commissionsThisMonth / 1000000).toFixed(2) }}M F</p>
          <div class="flex items-center gap-1 mt-1">
            <component :is="commissionGrowth > 0 ? TrendingUp : TrendingDown" :class="['w-3 h-3', commissionGrowth > 0 ? 'text-green-300' : 'text-red-300']" />
            <span :class="['text-xs', commissionGrowth > 0 ? 'text-green-300' : 'text-red-300']">{{ commissionGrowth > 0 ? '+' : '' }}{{ commissionGrowth.toFixed(1) }}%</span>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><ShoppingCart class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">Commandes</span>
          </div>
          <p class="text-white text-xl font-medium">{{ stats.totalOrders }}</p>
          <span class="text-white/60 text-xs">Ce mois</span>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Users class="w-4 h-4 text-white" /></div>
            <span class="text-white/80 text-xs">{{ isInterprofession ? 'Structures' : 'Membres' }}</span>
          </div>
          <p class="text-white text-xl font-medium">{{ stats.totalMembers }}</p>
          <span class="text-white/60 text-xs">{{ stats.activeMembers }} actifs</span>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
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
              <span class="font-medium text-[#2D5016]">{{ (structure.commission / 1000000).toFixed(1) }}M F</span>
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
          <div v-for="(product, index) in filiereProducts" :key="product.name" class="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div class="flex items-center gap-3">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white',
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                'bg-gradient-to-br from-[#2D5016] to-[#1a3009]'
              ]">{{ index + 1 }}</div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-medium">{{ product.name }}</h4>
                  <Badge :class="product.trend.startsWith('+') ? 'bg-green-600' : 'bg-red-600'">
                    <component :is="product.trend.startsWith('+') ? TrendingUp : TrendingDown" class="w-3 h-3 mr-1" />{{ product.trend }}
                  </Badge>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <div class="flex gap-4 text-muted-foreground">
                    <span>{{ product.quantity }}</span>
                    <span>•</span>
                    <span>{{ product.orders }} commandes</span>
                  </div>
                  <span class="font-bold text-[#2D5016]">{{ (product.revenue / 1000000).toFixed(1) }}M F</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Top Members -->
      <Card class="p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-[#2D5016]/10 rounded-lg flex items-center justify-center"><Award class="w-5 h-5 text-[#2D5016]" /></div>
          <div>
            <h3 class="text-lg font-medium">{{ memberLabel }}</h3>
            <p class="text-sm text-muted-foreground">Commissions par {{ isInterprofession || isUnion ? 'structure' : isFederation ? 'union' : 'membre' }}</p>
          </div>
        </div>
        <div class="space-y-3">
          <div v-for="(member, index) in topMembers" :key="member.name" class="p-4 rounded-xl border-2 border-muted hover:border-[#2D5016]/30 hover:shadow-md transition-all">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-[#2D5016] to-[#1a3009] rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ index + 1 }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <h4 class="font-medium">{{ member.name }}</h4>
                    <Badge v-if="isInterprofession || isUnion" variant="outline" class="text-xs mt-1">{{ member.type }}</Badge>
                  </div>
                  <Badge class="bg-green-600"><TrendingUp class="w-3 h-3 mr-1" />{{ member.growth }}</Badge>
                </div>
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p class="text-muted-foreground text-xs">Ventes</p>
                    <p class="font-medium">{{ (member.sales / 1000000).toFixed(1) }}M F</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs">Commission</p>
                    <p class="font-bold text-[#FF9800]">{{ (member.commission / 1000000).toFixed(2) }}M F</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs">Produits</p>
                    <p class="font-medium">{{ member.products }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
