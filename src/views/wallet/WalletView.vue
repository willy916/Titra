<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, DollarSign, CreditCard, PiggyBank, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { User } from '@/types'
import { usePaysanStore } from '@/stores/paysan'
import { useTransformerStore } from '@/stores/transformer'
import { useMerchantStore } from '@/stores/merchant'
import { useWalletStore } from '@/stores/wallet'
import { toast } from 'vue-sonner'

const props = defineProps<{ user: User }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const paysanStore = usePaysanStore()
const transformerStore = useTransformerStore()
const merchantStore = useMerchantStore()
const walletStore = useWalletStore()

const isLoading = ref(true)
const activeTab = ref('all')

const isProcessor = computed(() => props.user.role === 'processor')
const isMerchant = computed(() => props.user.role === 'merchant')
const store = computed(() => {
  if (isProcessor.value) return transformerStore
  if (isMerchant.value) return merchantStore
  return paysanStore
})

onMounted(async () => {
  try {
    await walletStore.fetchWallet()
  } catch (error) {
    console.error('Error fetching wallet:', error)
    // Fallback to role-specific store if unified fails or isn't ready
    try {
      await store.value.fetchWallet()
    } catch (e) {
      toast.error('Erreur lors du chargement du portefeuille')
    }
  } finally {
    isLoading.value = false
  }
})

const walletData = computed(() => {
  // Try unified store first
  if (walletStore.walletData) {
    return {
      soldeDisponible: walletStore.walletData.soldeDisponible,
      soldeEscrow: walletStore.walletData.soldeEnAttente,
      statsMois: {
        nombreVentes: walletStore.walletData.totalVentesCeMois,
        revenuTotalBrut: walletStore.walletData.revenuTotalCeMois,
        totalCommissions: walletStore.walletData.commissionCeMois
      },
      evolutionRevenus: [], // Wallet store currently doesn't have history
      transactions: walletStore.walletData.transactions || []
    }
  }

  const base = store.value.wallet || {}
  
  if (isProcessor.value || isMerchant.value) {
    return {
      soldeDisponible: Number(base.availableBalance ?? props.user.balance ?? 0),
      soldeEscrow: Number(base.escrowBalance ?? 0),
      statsMois: {
        nombreVentes: base.monthlyStats?.salesCount || 0,
        revenuTotalBrut: base.monthlyStats?.totalRevenue || 0,
        totalCommissions: base.monthlyStats?.commissions || 0
      },
      evolutionRevenus: base.revenueHistory || [],
      transactions: base.transactions || []
    }
  }

  return {
    soldeDisponible: Number(base.soldeDisponible ?? props.user.balance ?? 0),
    soldeEscrow: Number(base.soldeEscrow ?? props.user.pendingBalance ?? 0),
    statsMois: base.statsMois || { nombreVentes: 0, revenuTotalBrut: 0, totalCommissions: 0 },
    evolutionRevenus: Array.isArray(base.evolutionRevenus) ? base.evolutionRevenus : [],
    transactions: Array.isArray(base.transactions) ? base.transactions : []
  }
})

const chartData = computed(() => {
  const evolution = walletData.value.evolutionRevenus
  if (!evolution || evolution.length === 0) {
    return [
      { month: 'Jan', amount: 0, label: 'Janvier' },
      { month: 'Fév', amount: 0, label: 'Février' },
      { month: 'Mar', amount: 0, label: 'Mars' },
      { month: 'Avr', amount: 0, label: 'Avril' },
      { month: 'Mai', amount: 0, label: 'Mai' },
      { month: 'Juin', amount: 0, label: 'Juin' },
    ]
  }
  return evolution.map((d: any) => ({
    month: d.mois || d.month || '?',
    amount: Number(d.montant || d.amount || d.revenue || 0),
    label: d.mois || d.month || d.label || '?'
  }))
})

// Transactions are now fetched from walletData.value.transactions

// SVG Chart calculations
const chartWidth = 320
const chartHeight = 180
const padding = { top: 20, right: 20, bottom: 30, left: 45 }
const graphWidth = chartWidth - padding.left - padding.right
const graphHeight = chartHeight - padding.top - padding.bottom

const maxAmount = computed(() => {
  const vals = chartData.value.map(d => d.amount)
  const max = Math.max(...vals, 1000)
  return max * 1.1
})
const minAmount = computed(() => {
  const vals = chartData.value.map(d => d.amount)
  const min = Math.min(...vals, 0)
  return min * 0.9
})

const points = computed(() => {
  return chartData.value.map((d, i) => ({
    x: padding.left + (i / (chartData.value.length - 1)) * graphWidth,
    y: padding.top + graphHeight - ((d.amount - minAmount.value) / (maxAmount.value - minAmount.value)) * graphHeight,
    amount: d.amount,
    month: d.month,
    label: d.label
  }))
})

// SVG paths using points
const smoothLinePath = computed(() => {
  if (points.value.length < 2) return ''
  let path = `M ${points.value[0].x} ${points.value[0].y}`
  for (let i = 1; i < points.value.length; i++) {
    const prev = points.value[i - 1]
    const curr = points.value[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpy1 = prev.y
    const cpx2 = prev.x + 2 * (curr.x - prev.x) / 3
    const cpy2 = curr.y
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`
  }
  return path
})

const smoothAreaPath = computed(() => {
  if (points.value.length < 2) return ''
  let path = `M ${points.value[0].x} ${padding.top + graphHeight}`
  path += ` L ${points.value[0].x} ${points.value[0].y}`
  for (let i = 1; i < points.value.length; i++) {
    const prev = points.value[i - 1]
    const curr = points.value[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpy1 = prev.y
    const cpx2 = prev.x + 2 * (curr.x - prev.x) / 3
    const cpy2 = curr.y
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`
  }
  const lastPoint = points.value[points.value.length - 1]
  path += ` L ${lastPoint.x} ${padding.top + graphHeight} Z`
  return path
})

const yAxisLabels = computed(() => {
  const labels = []
  const step = (maxAmount.value - minAmount.value) / 4
  for (let i = 0; i <= 4; i++) {
    const value = minAmount.value + step * i
    const y = padding.top + graphHeight - (i / 4) * graphHeight
    labels.push({ value: Math.round(value / 1000), y })
  }
  return labels
})

const gridLines = computed(() => {
  return yAxisLabels.value.map(l => l.y)
})

const hoveredPoint = ref<number | null>(null)

const totalRevenue = computed(() => chartData.value.reduce((sum, d) => sum + d.amount, 0))
const avgRevenue = computed(() => chartData.value.length ? Math.round(totalRevenue.value / chartData.value.length) : 0)
const growth = computed(() => {
  if (chartData.value.length < 2) return 0
  const lastTwo = chartData.value.slice(-2)
  if (!lastTwo[0].amount) return 0
  return Math.round(((lastTwo[1].amount - lastTwo[0].amount) / lastTwo[0].amount) * 100)
})

const setHoveredPoint = (val: number | null) => {
  hoveredPoint.value = val
}

const filteredTransactions = computed(() => {
  const allTx = walletData.value.transactions || []
  if (activeTab.value === 'all') return allTx
  if (activeTab.value === 'credit') return allTx.filter((t: any) => t.type === 'ENTRY')
  return allTx.filter((t: any) => t.type === 'EXIT')
})
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b p-4 lg:hidden">
      <button @click="emit('back')" class="flex items-center gap-2">
        <ArrowLeft class="w-5 h-5" />
        <span class="font-medium">Mon portefeuille</span>
      </button>
    </div>

    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh]">
      <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
      <p class="text-muted-foreground">Chargement des données financières...</p>
    </div>

    <!-- Balance Card -->
    <div v-else class="space-y-0">
      <div class="p-6">
      <Card class="bg-gradient-to-br from-primary via-primary-dark to-primary-darker text-white p-6 relative overflow-hidden">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="1" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>
        
        <div class="relative">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet class="w-5 h-5" />
            </div>
            <span class="text-sm opacity-90">Solde disponible</span>
          </div>
          <p class="text-4xl font-bold mb-6">{{ walletData.soldeDisponible.toLocaleString() }} <span class="text-xl font-normal opacity-80">FCFA</span></p>
          <div class="flex items-center justify-between pt-4 border-t border-white/20">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <PiggyBank class="w-4 h-4" />
              </div>
              <div>
                <p class="text-xs opacity-75">En attente (Escrow)</p>
                <p class="font-semibold">{{ walletData.soldeEscrow.toLocaleString() }} FCFA</p>
              </div>
            </div>
            <Button @click="emit('navigate', 'withdrawal')" class="bg-white text-primary hover:bg-white/90">
              <CreditCard class="w-4 h-4 mr-2" />Retirer
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Statistics -->
    <div class="px-6 pb-6">
      <h3 class="mb-4 font-medium">Statistiques du mois</h3>
      <div class="grid grid-cols-3 gap-3 mb-6">
        <Card class="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <TrendingUp class="w-5 h-5 text-success mb-2" />
          <p class="text-xs text-muted-foreground mb-1">Ventes</p>
          <p class="font-bold text-lg">{{ walletData.statsMois.nombreVentes || 0 }}</p>
        </Card>
        <Card class="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <DollarSign class="w-5 h-5 text-primary mb-2" />
          <p class="text-xs text-muted-foreground mb-1">Revenu total</p>
          <p class="font-bold text-lg">{{ ((walletData.statsMois.revenuTotalBrut || 0) / 1000).toFixed(1) }}k</p>
        </Card>
        <Card class="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <ArrowUpRight class="w-5 h-5 text-secondary mb-2" />
          <p class="text-xs text-muted-foreground mb-1">Commissions</p>
          <p class="font-bold text-lg">{{ ((walletData.statsMois.totalCommissions || 0) / 1000).toFixed(1) }}k</p>
        </Card>
      </div>

      <!-- Professional Chart -->
      <Card class="p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="font-medium">Évolution des revenus</h4>
            <p class="text-sm text-muted-foreground">6 derniers mois</p>
          </div>
          <div class="flex items-center gap-2">
            <div :class="['flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', growth > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive']">
              <component :is="growth > 0 ? TrendingUp : ArrowUpRight" class="w-3 h-3" />
              {{ growth > 0 ? '+' : '' }}{{ growth }}%
            </div>
          </div>
        </div>

        <!-- SVG Chart -->
        <div class="relative">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            <defs>
              <!-- Gradient for area -->
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:var(--primary);stop-opacity:0.3"/>
                <stop offset="50%" style="stop-color:var(--primary);stop-opacity:0.1"/>
                <stop offset="100%" style="stop-color:var(--primary);stop-opacity:0.02"/>
              </linearGradient>
              <!-- Gradient for line -->
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:var(--primary)"/>
                <stop offset="100%" style="stop-color:var(--primary-dark)"/>
              </linearGradient>
              <!-- Glow effect -->
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <!-- Drop shadow for points -->
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="var(--primary)" flood-opacity="0.3"/>
              </filter>
            </defs>

            <!-- Grid lines -->
            <g class="grid-lines">
              <line 
                v-for="(y, i) in gridLines" 
                :key="i"
                :x1="padding.left" 
                :y1="y" 
                :x2="chartWidth - padding.right" 
                :y2="y"
                stroke="#e5e7eb"
                stroke-width="1"
                stroke-dasharray="4,4"
              />
            </g>

            <!-- Y-axis labels -->
            <g class="y-axis">
              <text 
                v-for="label in yAxisLabels" 
                :key="label.value"
                :x="padding.left - 8" 
                :y="label.y + 4"
                text-anchor="end"
                fill="#9ca3af"
                font-size="10"
                font-weight="500"
              >{{ label.value }}k</text>
            </g>

            <!-- X-axis labels -->
            <g class="x-axis">
              <text 
                v-for="point in points" 
                :key="point.month"
                :x="point.x" 
                :y="chartHeight - 8"
                text-anchor="middle"
                fill="#6b7280"
                font-size="11"
                font-weight="500"
              >{{ point.month }}</text>
            </g>

            <!-- Area fill with smooth curve -->
            <path 
              :d="smoothAreaPath" 
              fill="url(#areaGradient)"
              class="transition-all duration-300"
            />

            <!-- Line with smooth curve -->
            <path 
              :d="smoothLinePath" 
              fill="none" 
              stroke="url(#lineGradient)" 
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="url(#glow)"
              class="transition-all duration-300"
            />

            <!-- Data points -->
            <g class="data-points">
              <g v-for="(point, i) in points" :key="i">
                <!-- Outer ring on hover -->
                <circle 
                  :cx="point.x" 
                  :cy="point.y" 
                  r="12"
                  fill="transparent"
                  class="cursor-pointer"
                  @mouseenter="setHoveredPoint(Number(i))"
                  @mouseleave="setHoveredPoint(null)"
                />
                <!-- Point background -->
                <circle 
                  :cx="point.x" 
                  :cy="point.y" 
                  :r="hoveredPoint === i ? 8 : 5"
                  fill="white"
                  filter="url(#shadow)"
                  class="transition-all duration-200"
                />
                <!-- Point fill -->
                <circle 
                  :cx="point.x" 
                  :cy="point.y" 
                  :r="hoveredPoint === i ? 6 : 3.5"
                  :fill="i === points.length - 1 ? 'var(--primary-dark)' : 'var(--primary)'"
                  class="transition-all duration-200"
                />
              </g>
            </g>

            <!-- Tooltip -->
            <g v-if="hoveredPoint !== null" class="tooltip">
              <rect 
                :x="points[hoveredPoint].x - 40" 
                :y="points[hoveredPoint].y - 45"
                width="80"
                height="32"
                rx="6"
                fill="#1f2937"
                filter="url(#shadow)"
              />
              <polygon 
                :points="`${points[hoveredPoint].x - 6},${points[hoveredPoint].y - 13} ${points[hoveredPoint].x + 6},${points[hoveredPoint].y - 13} ${points[hoveredPoint].x},${points[hoveredPoint].y - 5}`"
                fill="#1f2937"
              />
              <text 
                :x="points[hoveredPoint].x" 
                :y="points[hoveredPoint].y - 32"
                text-anchor="middle"
                fill="white"
                font-size="10"
                font-weight="500"
              >{{ chartData[hoveredPoint].label }}</text>
              <text 
                :x="points[hoveredPoint].x" 
                :y="points[hoveredPoint].y - 20"
                text-anchor="middle"
                fill="#4ade80"
                font-size="11"
                font-weight="600"
              >{{ points[hoveredPoint].amount.toLocaleString() }} F</text>
            </g>
          </svg>
        </div>

        <!-- Chart Summary -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t">
          <div class="text-center">
            <p class="text-xs text-muted-foreground">Total période</p>
            <p class="font-bold text-primary">{{ totalRevenue.toLocaleString() }} F</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-muted-foreground">Moyenne/mois</p>
            <p class="font-bold">{{ avgRevenue.toLocaleString() }} F</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-muted-foreground">Meilleur mois</p>
            <p class="font-bold text-success">{{ Math.max(...chartData.map(d => d.amount)).toLocaleString() }} F</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Transactions -->
    <div class="px-6 pb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium">Historique récent</h3>
        <Button variant="link" class="p-0 h-auto text-sm">Voir tout</Button>
      </div>

      <!-- Tabs -->
      <div class="flex w-full mb-4 bg-muted rounded-lg p-1">
        <button 
          @click="activeTab = 'all'" 
          :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'all' ? 'bg-background shadow' : 'text-muted-foreground']"
        >Tout</button>
        <button 
          @click="activeTab = 'credit'" 
          :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'credit' ? 'bg-background shadow' : 'text-muted-foreground']"
        >Entrées</button>
        <button 
          @click="activeTab = 'debit'" 
          :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'debit' ? 'bg-background shadow' : 'text-muted-foreground']"
        >Sorties</button>
      </div>

      <Card class="overflow-hidden divide-y">
        <div v-for="transaction in filteredTransactions" :key="transaction.id" class="p-4">
          <div class="flex items-start gap-3">
            <div :class="['p-2 rounded-lg', transaction.type === 'ENTRY' ? 'bg-success/10' : 'bg-muted']">
              <component :is="transaction.type === 'ENTRY' ? ArrowDownLeft : ArrowUpRight" :class="['w-4 h-4', transaction.type === 'ENTRY' ? 'text-success' : 'text-foreground']" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm">{{ transaction.titre || transaction.title || transaction.description || 'Transaction' }}</p>
              <p class="text-xs text-muted-foreground">{{ transaction.date }}</p>
            </div>
            <div class="text-right">
              <p :class="['font-semibold', (transaction.type === 'ENTRY' || transaction.type === 'sale') ? 'text-success' : 'text-foreground']">
                {{ (transaction.type === 'ENTRY' || transaction.type === 'sale') ? '+' : '' }}{{ (transaction.montant || transaction.amount || 0).toLocaleString() }} FCFA
              </p>
              <p class="text-xs text-muted-foreground">{{ transaction.statut }}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</div>
</template>
