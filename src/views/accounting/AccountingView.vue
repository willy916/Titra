<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, TrendingUp, TrendingDown, FileText, Download, Plus, ShoppingCart, Package, Truck, Users, Sprout, Factory, Store, Landmark } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import type { UserRole } from '@/types'

const props = defineProps<{ userRole: UserRole }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const activeTab = ref('all')

const getAccountingData = () => {
  const data: Record<string, any> = {
    consumer: {
      metrics: [
        { label: 'Total dépensé', value: 450000, change: 12, icon: ShoppingCart, color: 'destructive' },
        { label: 'Commandes ce mois', value: 8, change: 3, icon: Package, color: 'primary', isCount: true },
        { label: 'Économisé (promos)', value: 35000, change: 18, icon: TrendingDown, color: 'success' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'expense', category: 'Légumes', amount: -25000, description: 'Tomates, oignons, piment' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Céréales', amount: -35000, description: 'Riz 25kg' },
        { id: '3', date: new Date('2024-12-15'), type: 'expense', category: 'Fruits', amount: -18000, description: 'Bananes, mangues' },
      ],
    },
    farmer: {
      metrics: [
        { label: 'Revenus (Ventes)', value: 850000, change: 15, icon: TrendingUp, color: 'success' },
        { label: 'Dépenses (Intrants)', value: 320000, change: -8, icon: Sprout, color: 'destructive' },
        { label: 'Bénéfice agricole', value: 530000, change: 28, icon: FileText, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'revenue', category: 'Vente de produits', amount: 125000, description: 'Café - 250kg' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Intrants', amount: -45000, description: 'Engrais NPK' },
        { id: '3', date: new Date('2024-12-15'), type: 'revenue', category: 'Vente de produits', amount: 185000, description: 'Cacao - 500kg' },
        { id: '4', date: new Date('2024-12-12'), type: 'expense', category: "Main d'œuvre", amount: -55000, description: 'Ouvriers saisonniers' },
      ],
    },
    processor: {
      metrics: [
        { label: 'Ventes (Transformés)', value: 1250000, change: 22, icon: Package, color: 'success' },
        { label: 'Matières premières', value: 580000, change: 10, icon: Factory, color: 'destructive' },
        { label: 'Marge transformation', value: 670000, change: 35, icon: TrendingUp, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'revenue', category: 'Ventes transformés', amount: 285000, description: 'Jus de fruits pasteurisés' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Matières premières', amount: -125000, description: 'Achat mangues fraîches' },
      ],
    },
    transporter: {
      metrics: [
        { label: 'Revenus transport', value: 680000, change: 25, icon: Truck, color: 'success' },
        { label: 'Dépenses véhicule', value: 285000, change: 8, icon: TrendingDown, color: 'destructive' },
        { label: 'Bénéfice net', value: 395000, change: 42, icon: FileText, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'revenue', category: 'Frais transport', amount: 125000, description: 'Livraison Abidjan-Bouaké' },
        { id: '2', date: new Date('2024-12-18'), type: 'expense', category: 'Carburant', amount: -55000, description: 'Gasoil 150L' },
      ],
    },
    default: {
      metrics: [
        { label: 'Revenus totaux', value: 3450000, change: 20, icon: Landmark, color: 'success' },
        { label: 'Dépenses gestion', value: 1280000, change: 5, icon: Users, color: 'destructive' },
        { label: 'Fonds disponibles', value: 2170000, change: 35, icon: TrendingUp, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: new Date('2024-12-20'), type: 'revenue', category: 'Ventes directes', amount: 485000, description: 'Vente groupée café' },
        { id: '2', date: new Date('2024-12-18'), type: 'revenue', category: 'Commissions', amount: 125000, description: 'Commission 3%' },
        { id: '3', date: new Date('2024-12-15'), type: 'expense', category: 'Salaires', amount: -285000, description: 'Salaires personnel' },
      ],
    },
  }
  return data[props.userRole] || data.default
}

const accountingData = computed(() => getAccountingData())

const getRoleInfo = () => {
  const infos: Record<string, { title: string; description: string; icon: any }> = {
    consumer: { title: "Mon Historique d'achats", description: 'Consultez vos dépenses sur TITRA', icon: ShoppingCart },
    farmer: { title: 'Ma Comptabilité Agricole', description: "Revenus de ventes, dépenses en intrants et main d'œuvre", icon: Sprout },
    processor: { title: 'Comptabilité de Transformation', description: 'Ventes de produits transformés, achats matières premières', icon: Factory },
    merchant: { title: 'Comptabilité Commerciale', description: "Chiffre d'affaires, achats stocks et marge commerciale", icon: Store },
    transporter: { title: 'Revenus de Transport', description: 'Frais de transport, commissions et dépenses véhicule', icon: Truck },
  }
  return infos[props.userRole] || { title: 'Comptabilité Institutionnelle', description: 'Revenus, cotisations et dépenses de gestion', icon: Landmark }
}

const roleInfo = computed(() => getRoleInfo())

const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return accountingData.value.transactions
  if (activeTab.value === 'revenue') return accountingData.value.transactions.filter((t: any) => t.type === 'revenue')
  return accountingData.value.transactions.filter((t: any) => t.type === 'expense')
})
</script>

<template>
  <div class="min-h-screen bg-background pb-20 lg:pb-0">
    <!-- Mobile Header -->
    <div class="lg:hidden sticky top-0 z-10 bg-background border-b">
      <div class="flex items-center gap-4 p-4">
        <button @click="emit('back')"><ArrowLeft class="w-6 h-6" /></button>
        <h2 class="font-semibold">Ma Comptabilité</h2>
      </div>
    </div>

    <div class="p-4 lg:p-0 space-y-6">
      <!-- Role-specific info banner -->
      <Card class="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <component :is="roleInfo.icon" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-primary">{{ roleInfo.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ roleInfo.description }}</p>
          </div>
        </div>
      </Card>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          v-for="(metric, index) in accountingData.metrics" 
          :key="index"
          :class="[
            'p-6',
            metric.color === 'success' ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/20' :
            metric.color === 'destructive' ? 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20' :
            'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
          ]"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ metric.label }}</span>
              <component 
                :is="metric.icon" 
                :class="[
                  'w-5 h-5',
                  metric.color === 'success' ? 'text-success' :
                  metric.color === 'destructive' ? 'text-destructive' : 'text-primary'
                ]" 
              />
            </div>
            <div class="text-2xl font-bold text-foreground">
              {{ metric.isCount ? metric.value : metric.value.toLocaleString() + ' FCFA' }}
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
        <Button variant="outline">
          <Download class="w-4 h-4 mr-2" />Exporter
        </Button>
      </div>

      <!-- Transactions -->
      <Card class="p-6">
        <!-- Tabs -->
        <div class="flex w-full mb-4 bg-muted rounded-lg p-1">
          <button 
            @click="activeTab = 'all'" 
            :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'all' ? 'bg-background shadow' : 'text-muted-foreground']"
          >
            Tout
          </button>
          <button 
            v-if="userRole !== 'consumer'"
            @click="activeTab = 'revenue'" 
            :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'revenue' ? 'bg-background shadow' : 'text-muted-foreground']"
          >
            Revenus
          </button>
          <button 
            @click="activeTab = 'expense'" 
            :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'expense' ? 'bg-background shadow' : 'text-muted-foreground']"
          >
            Dépenses
          </button>
        </div>

        <div class="space-y-3">
          <div 
            v-for="transaction in filteredTransactions" 
            :key="transaction.id" 
            class="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                transaction.type === 'revenue' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              ]">
                <component :is="transaction.type === 'revenue' ? TrendingUp : TrendingDown" class="w-5 h-5" />
              </div>
              <div>
                <div class="font-medium">{{ transaction.description }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ transaction.category }} • {{ transaction.date.toLocaleDateString('fr-FR') }}
                </div>
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
