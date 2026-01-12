<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bell, Plus, MessageSquare, TrendingUp, Wallet, Package, ShoppingBag, Settings, Calculator, GraduationCap } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{ user: { name: string; balance?: number } }>()
const emit = defineEmits<{ navigate: [screen: string] }>()

const isLoading = ref(true)
onMounted(() => { setTimeout(() => isLoading.value = false, 1000) })

const stats = {
  balance: props.user.balance || 150000,
  pendingBalance: 45000,
  products: 12,
  sales: 24,
}

const quickActions = [
  { label: 'Ajouter un produit', icon: Plus, screen: 'add-product', variant: 'default' as const },
  { label: 'Ma Comptabilité', icon: Calculator, screen: 'accounting', variant: 'outline' as const },
  { label: 'Formation', icon: GraduationCap, screen: 'training', variant: 'outline' as const },
  { label: 'Mes conversations', icon: MessageSquare, screen: 'messages', variant: 'outline' as const },
]

const recentActivities = [
  { action: 'Nouvelle commande', detail: '10kg Igname - 5,000 FCFA', time: 'Il y a 2h', icon: ShoppingBag },
  { action: 'Message reçu', detail: 'Diabaté Aminata', time: 'Il y a 5h', icon: MessageSquare },
  { action: 'Produit publié', detail: 'Manioc Frais', time: 'Hier', icon: Package },
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
          <Badge variant="secondary" class="mt-2 bg-white/20 text-white border-0">Paysan</Badge>
        </div>
        <div class="flex gap-2">
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Bell class="w-5 h-5" /></button>
          <button class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Settings class="w-5 h-5" /></button>
        </div>
      </div>

      <!-- Balance Cards -->
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
      <!-- Stats -->
      <Card class="p-4">
        <h3 class="text-primary mb-4">Statistiques du mois</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center"><p class="text-muted-foreground text-sm">Produits</p><p class="text-2xl text-primary">{{ stats.products }}</p></div>
          <div class="text-center"><p class="text-muted-foreground text-sm">Ventes</p><p class="text-2xl text-secondary">{{ stats.sales }}</p></div>
          <div class="text-center"><p class="text-muted-foreground text-sm">Commandes</p><p class="text-2xl text-primary">3</p></div>
          <div class="text-center"><p class="text-muted-foreground text-sm">Revenus</p><p class="text-lg text-primary">{{ (stats.balance / 1000).toFixed(0) }}k</p></div>
        </div>
      </Card>

      <!-- Quick Actions -->
      <div>
        <h3 class="mb-4">Actions rapides</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button v-for="(action, index) in quickActions" :key="index" :variant="action.variant" @click="emit('navigate', action.screen)" :class="['h-auto py-4 flex flex-col gap-2', action.variant === 'default' ? 'bg-primary hover:bg-primary/90' : '']">
            <component :is="action.icon" class="w-5 h-5" />
            <span class="text-sm">{{ action.label }}</span>
          </Button>
        </div>
      </div>

      <!-- Desktop Two-Column Layout -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Recommendations -->
        <div>
          <h3 class="mb-4">Recommandations</h3>
          <Card class="p-4 border-l-4 border-l-secondary">
            <div class="flex items-start gap-3">
              <div class="bg-secondary/10 p-2 rounded-lg"><TrendingUp class="w-5 h-5 text-secondary" /></div>
              <div class="flex-1">
                <p class="font-medium mb-1">Complétez votre profil</p>
                <p class="text-sm text-muted-foreground mb-3">Votre profil est complet à 75%. Ajoutez plus d'informations pour augmenter votre visibilité.</p>
                <Button variant="link" class="p-0 h-auto text-secondary">Compléter maintenant →</Button>
              </div>
            </div>
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
            <template v-else>
              <Card v-for="(activity, index) in recentActivities" :key="index" class="p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start gap-3">
                  <div class="bg-muted p-2 rounded-lg"><component :is="activity.icon" class="w-4 h-4" /></div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm">{{ activity.action }}</p>
                    <p class="text-sm text-muted-foreground truncate">{{ activity.detail }}</p>
                  </div>
                  <span class="text-xs text-muted-foreground whitespace-nowrap">{{ activity.time }}</span>
                </div>
              </Card>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
