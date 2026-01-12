<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, TrendingUp, TrendingDown, FileText, Download, Plus, ShoppingCart, Package, Truck, Users, Sprout, Factory, Store, Landmark } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { UserRole } from '@/types'

const props = defineProps<{ userRole: UserRole }>()
const emit = defineEmits<{ back: [], navigate: [screen: string] }>()

const activeTab = ref('all')

const getAccountingData = (role: UserRole) => {
  const dataMap: Record<string, any> = {
    consumer: {
      metrics: [
        { label: 'Total dépensé', value: 450000, change: +12, icon: ShoppingCart, color: 'destructive' },
        { label: 'Commandes ce mois', value: 8, change: +3, icon: Package, color: 'primary', isCount: true },
        { label: 'Économisé (promos)', value: 35000, change: +18, icon: TrendingDown, color: 'success' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'expense', category: 'Légumes', amount: -25000, description: 'Tomates, oignons, piment' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Céréales', amount: -35000, description: 'Riz 25kg' },
        { id: '3', date: new Date('2024-12-15'), type: 'expense', category: 'Fruits', amount: -18000, description: 'Bananes, mangues' },
      ],
    },
    farmer: {
      metrics: [
        { label: 'Revenus (Ventes)', value: 850000, change: +15, icon: TrendingUp, color: 'success' },
        { label: 'Dépenses (Intrants)', value: 320000, change: -8, icon: Sprout, color: 'destructive' },
        { label: 'Bénéfice agricole', value: 530000, change: +28, icon: FileText, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'revenue', category: 'Vente de produits', amount: 125000, description: 'Café - 250kg' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Intrants', amount: -45000, description: 'Engrais NPK' },
        { id: '3', date: new Date('2024-12-15'), type: 'revenue', category: 'Vente de produits', amount: 185000, description: 'Cacao - 500kg' },
        { id: '4', date: new Date('2024-12-12'), type: 'expense', category: 'Main d\'œuvre', amount: -55000, description: 'Ouvriers saisonniers' },
      ],
    },
    processor: {
      metrics: [
        { label: 'Ventes (Transformés)', value: 1250000, change: +22, icon: Package, color: 'success' },
        { label: 'Matières premières', value: 580000, change: +10, icon: Factory, color: 'destructive' },
        { label: 'Marge transformation', value: 670000, change: +35, icon: TrendingUp, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'revenue', category: 'Ventes transformés', amount: 285000, description: 'Jus de fruits pasteurisés' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Matières premières', amount: -125000, description: 'Achat mangues fraîches' },
      ],
    },
    transporter: {
      metrics: [
        { label: 'Revenus transport', value: 680000, change: +25, icon: Truck, color: 'success' },
        { label: 'Dépenses véhicule', value: 285000, change: +8, icon: TrendingDown, color: 'destructive' },
        { label: 'Bénéfice net', value: 395000, change: +42, icon: FileText, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'revenue', category: 'Frais transport', amount: 125000, description: 'Livraison Abidjan-Bouaké' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Carburant', amount: -55000, description: 'Gasoil 150L' },
      ],
    },
  }
  return dataMap[role] || dataMap.farmer
}

const accountingData = computed(() => getAccountingData(props.userRole))

const getRoleInfo = (role: UserRole) => {
  const infoMap: Record<string, { title: string; description: string; icon: any }> = {
    consumer: { title: 'Mon Historique d\'achats', description: 'Consultez vos dépenses sur TITRA', icon: ShoppingCart },
    farmer: { title: 'Ma Comptabilité Agricole', description: 'Revenus de ventes, dépenses en intrants et main d\'œuvre', icon: Sprout },
    processor: { title: 'Comptabilité de Transformation', description: 'Ventes de produits transformés et achats de matières premières', icon: Factory },
    transporter: { title: 'Comptabilité Transport', description: 'Revenus des courses et dépenses véhicule', icon: Truck },
  }
  return infoMap[role] || infoMap.farmer
}

const roleInfo = computed(() => getRoleInfo(props.userRole))

const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return accountingData.value.transactions
  return accountingData.value.transactions.filter((t: any) => t.type === activeTab.value)
})

function getColorClass(color: string) {
  const map: Record<string, string> = { success: 'text-success', destructive: 'text-destructive', primary: 'text-primary' }
  return map[color] || 'text-foreground'
}
function getBgClass(color: string) {
  const map: Record<string, string> = { success: 'bg-success/10', destructive: 'bg-destructive/10', primary: 'bg-primary/10' }
  return map[color] || 'bg-muted'
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20 lg:pb-0">
    <!-- Mobile Header -->
    <div class="lg:hidden sticky top-0 z-10 bg-background border-b">
      <div class="flex items-center gap-4 p-4">
        <button @click="emit('back')"><ArrowLeft class="w-6 h-6" /></button>
        <h2 class="font-semibold">{{ roleInfo.title }}</h2>
      </div>
    </div>

    <div class="p-4 lg:p-0 space-y-6">
      <!-- Info Banner -->
      <Card class="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <component :is="roleInfo.icon" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold mb-1">{{ roleInfo.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ roleInfo.description }}</p>
          </div>
        </div>
      </Card>

      <!-- Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card v-for="(metric, index) in accountingData.metrics" :key="index" class="p-4">
          <div class="flex items-start justify-between">
            <div>
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center mb-3', getBgClass(metric.color)]">
                <component :is="metric.icon" :class="['w-5 h-5', getColorClass(metric.color)]" />
              </div>
              <p class="text-sm text-muted-foreground mb-1">{{ metric.label }}</p>
              <p class="text-2xl font-semibold">
                {{ metric.isCount ? metric.value : metric.value.toLocaleString() + ' F' }}
              </p>
            </div>
            <div :class="['flex items-center gap-1 text-sm', metric.change > 0 ? 'text-success' : 'text-destructive']">
              <component :is="metric.change > 0 ? TrendingUp : TrendingDown" class="w-4 h-4" />
              <span>{{ metric.change > 0 ? '+' : '' }}{{ metric.change }}% ce mois</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <Button v-if="userRole !== 'consumer'" class="flex-1 bg-primary hover:bg-primary/90">
          <Plus class="w-4 h-4 mr-2" />Nouvelle écriture
        </Button>
        <Button variant="outline"><Download class="w-4 h-4 mr-2" />Exporter</Button>
      </div>

      <!-- Transactions -->
      <Card class="p-6">
        <div class="flex gap-4 mb-4 border-b">
          <button @click="activeTab = 'all'" :class="['pb-2 text-sm font-medium border-b-2 -mb-px', activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground']">Tout</button>
          <button v-if="userRole !== 'consumer'" @click="activeTab = 'revenue'" :class="['pb-2 text-sm font-medium border-b-2 -mb-px', activeTab === 'revenue' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground']">Revenus</button>
          <button @click="activeTab = 'expense'" :class="['pb-2 text-sm font-medium border-b-2 -mb-px', activeTab === 'expense' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground']">Dépenses</button>
        </div>

        <div class="space-y-3">
          <div v-for="transaction in filteredTransactions" :key="transaction.id" class="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div class="flex items-center gap-4">
              <div :class="['w-10 h-10 rounded-full flex items-center justify-center', transaction.type === 'revenue' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive']">
                <component :is="transaction.type === 'revenue' ? TrendingUp : TrendingDown" class="w-5 h-5" />
              </div>
              <div>
                <div class="font-medium">{{ transaction.description }}</div>
                <div class="text-sm text-muted-foreground">{{ transaction.category }} • {{ transaction.date.toLocaleDateString('fr-FR') }}</div>
              </div>
            </div>
            <div :class="['font-semibold', transaction.type === 'revenue' ? 'text-success' : 'text-destructive']">
              {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount.toLocaleString() }} FCFA
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
