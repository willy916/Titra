<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ShoppingBag, Package, TrendingUp, Wallet, Bell, Settings, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{ user: { name: string; balance?: number; pendingBalance?: number } }>()
const emit = defineEmits<{ navigate: [screen: string, data?: any] }>()

const isLoading = ref(true)
onMounted(() => { setTimeout(() => isLoading.value = false, 1200) })

const stats = { balance: props.user.balance || 2450000, pendingBalance: props.user.pendingBalance || 850000, purchases: 12, sales: 28, thisMonth: 1200000 }
const recentPurchases = [
  { id: '1', product: 'Manioc frais', seller: 'Koné Moussa', amount: 150000, date: 'Il y a 2 jours' },
  { id: '2', product: 'Noix de palme', seller: 'SCOOP Divo', amount: 450000, date: 'Il y a 4 jours' },
]
const recentSales = [
  { id: '1', product: 'Attiéké premium', buyer: 'Boutique Plateau', amount: 180000, status: 'En cours' },
  { id: '2', product: 'Farine de manioc', buyer: 'Restaurant Abidjan', amount: 95000, status: 'Livré' },
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
          <Badge variant="secondary" class="mt-2 bg-white/20 text-white border-0">Transformateur</Badge>
        </div>
        <div class="flex gap-2">
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Bell class="w-5 h-5" /></button>
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Settings class="w-5 h-5" /></button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <Card class="bg-white/10 border-white/20 backdrop-blur p-4">
          <div class="flex items-center gap-2 mb-2"><Wallet class="w-4 h-4 text-white/80" /><p class="text-white/80 text-xs">Solde disponible</p></div>
          <p class="text-white text-xl">{{ stats.balance.toLocaleString() }} F</p>
        </Card>
        <Card class="bg-white/10 border-white/20 backdrop-blur p-4">
          <div class="flex items-center gap-2 mb-2"><TrendingUp class="w-4 h-4 text-white/80" /><p class="text-white/80 text-xs">En attente</p></div>
          <p class="text-white text-xl">{{ stats.pendingBalance.toLocaleString() }} F</p>
        </Card>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Quick Actions -->
      <div>
        <h2 class="mb-4 text-primary">Actions rapides</h2>
        <div class="grid grid-cols-2 gap-3">
          <Button @click="emit('navigate', 'marketplace')" class="h-auto flex-col gap-2 py-4 bg-secondary"><ShoppingBag class="w-6 h-6" /><span class="text-sm text-[14px]">Acheter matières <br/>premières</span></Button>
          <Button @click="emit('navigate', 'my-products')" class="h-auto flex-col gap-2 py-4 bg-primary"><Package class="w-6 h-6" /><span class="text-sm">Mes produits <br/>transformés</span></Button>
        </div>
      </div>

      <!-- Stats -->
      <Card class="p-4">
        <h3 class="text-primary mb-4">Statistiques du mois</h3>
        <div class="grid grid-cols-3 gap-4">
          <template v-if="isLoading">
            <div v-for="i in 3" :key="i" class="text-center animate-pulse">
              <div class="h-4 w-12 bg-muted rounded mx-auto mb-2"></div>
              <div class="h-7 w-10 bg-muted rounded mx-auto"></div>
            </div>
          </template>
          <template v-else>
            <div class="text-center"><p class="text-muted-foreground text-sm">Achats</p><p class="text-2xl text-primary">{{ stats.purchases }}</p></div>
            <div class="text-center"><p class="text-muted-foreground text-sm">Ventes</p><p class="text-2xl text-secondary">{{ stats.sales }}</p></div>
            <div class="text-center"><p class="text-muted-foreground text-sm">Revenus</p><p class="text-lg text-primary">{{ (stats.thisMonth / 1000).toFixed(0) }}k</p></div>
          </template>
        </div>
      </Card>

      <!-- Recent Purchases -->
      <div>
        <div class="flex items-center justify-between mb-3"><h3 class="text-primary">Achats récents</h3><Button variant="ghost" size="sm" @click="emit('navigate', 'orders')">Voir tout</Button></div>
        <div class="space-y-2">
          <template v-if="isLoading">
            <Card v-for="i in 2" :key="i" class="p-4 animate-pulse">
              <div class="flex items-start justify-between">
                <div class="flex gap-3 flex-1">
                  <div class="w-10 h-10 bg-muted rounded-lg"></div>
                  <div class="flex-1">
                    <div class="h-4 w-24 bg-muted rounded mb-2"></div>
                    <div class="h-3 w-32 bg-muted rounded mb-2"></div>
                    <div class="h-3 w-20 bg-muted rounded"></div>
                  </div>
                </div>
                <div class="h-5 w-24 bg-muted rounded"></div>
              </div>
            </Card>
          </template>
          <template v-else>
            <Card v-for="purchase in recentPurchases" :key="purchase.id" class="p-4">
              <div class="flex items-start justify-between">
                <div class="flex gap-3 flex-1">
                  <div class="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center"><ArrowDownRight class="w-5 h-5 text-secondary" /></div>
                  <div class="flex-1">
                    <p class="font-medium">{{ purchase.product }}</p>
                    <p class="text-sm text-muted-foreground">{{ purchase.seller }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ purchase.date }}</p>
                  </div>
                </div>
                <p class="font-medium text-secondary">-{{ purchase.amount.toLocaleString() }} F</p>
              </div>
            </Card>
          </template>
        </div>
      </div>

      <!-- Recent Sales -->
      <div>
        <div class="flex items-center justify-between mb-3"><h3 class="text-primary">Ventes récentes</h3><Button variant="ghost" size="sm" @click="emit('navigate', 'orders')">Voir tout</Button></div>
        <div class="space-y-2">
          <template v-if="isLoading">
            <Card v-for="i in 2" :key="i" class="p-4 animate-pulse">
              <div class="flex items-start justify-between">
                <div class="flex gap-3 flex-1">
                  <div class="w-10 h-10 bg-muted rounded-lg"></div>
                  <div class="flex-1">
                    <div class="h-4 w-28 bg-muted rounded mb-2"></div>
                    <div class="h-3 w-36 bg-muted rounded mb-2"></div>
                    <div class="h-5 w-16 bg-muted rounded"></div>
                  </div>
                </div>
                <div class="h-5 w-24 bg-muted rounded"></div>
              </div>
            </Card>
          </template>
          <template v-else>
            <Card v-for="sale in recentSales" :key="sale.id" class="p-4">
              <div class="flex items-start justify-between">
                <div class="flex gap-3 flex-1">
                  <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><ArrowUpRight class="w-5 h-5 text-primary" /></div>
                  <div class="flex-1">
                    <p class="font-medium">{{ sale.product }}</p>
                    <p class="text-sm text-muted-foreground">{{ sale.buyer }}</p>
                    <Badge :variant="sale.status === 'Livré' ? 'default' : 'secondary'" class="mt-1 text-xs">{{ sale.status }}</Badge>
                  </div>
                </div>
                <p class="font-medium text-primary">+{{ sale.amount.toLocaleString() }} F</p>
              </div>
            </Card>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
