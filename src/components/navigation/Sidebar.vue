<script setup lang="ts">
import { computed } from 'vue'
import { Home, Search, ShoppingCart, Wallet, User, Package, Truck, Users, BarChart3, Settings, MessageSquare, LogOut, Calculator, GraduationCap } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'

interface NavItem { id: string; label: string; icon: any }

const props = defineProps<{
  activeScreen: string
  role: string
  userName: string
  userPhoto?: string
  userMatricule?: string
  cartCount?: number
}>()

const emit = defineEmits<{
  navigate: [screen: string]
  logout: []
}>()

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    farmer: 'Paysan', consumer: 'Consommateur', processor: 'Transformateur', merchant: 'Commerçant',
    transporter: 'Transporteur', cooperative: 'Coopérative', association: 'Association', union: 'Union',
    federation: 'Fédération', interprofession: 'Interprofession', independent: 'Indépendant', admin: 'Administrateur',
  }
  return labels[role] || role
}

const navItems = computed((): NavItem[] => {
  if (props.role === 'consumer') return [{ id: 'home', label: 'Accueil', icon: Home }, { id: 'messages', label: 'Messages', icon: MessageSquare }]
  if (props.role === 'farmer') return [{ id: 'home', label: 'Accueil', icon: Home }, { id: 'messages', label: 'Messages', icon: MessageSquare }]
  if (props.role === 'processor') return [{ id: 'home', label: 'Accueil', icon: Home }, { id: 'messages', label: 'Messages', icon: MessageSquare }]
  if (props.role === 'merchant') return [{ id: 'home', label: 'Accueil', icon: Home }, { id: 'messages', label: 'Messages', icon: MessageSquare }]
  if (props.role === 'transporter') return [{ id: 'home', label: 'Accueil', icon: Home }, { id: 'missions', label: 'Missions', icon: Truck }, { id: 'courses', label: 'Mes courses', icon: Package }, { id: 'messages', label: 'Messages', icon: MessageSquare }]
  if (['cooperative', 'association', 'union', 'federation', 'interprofession', 'independent'].includes(props.role)) return [{ id: 'home', label: 'Accueil', icon: Home }, { id: 'members', label: 'Membres', icon: Users }, { id: 'messages', label: 'Messages', icon: MessageSquare }]
  return [{ id: 'home', label: 'Accueil', icon: Home }, { id: 'members', label: 'Membres', icon: Users }]
})

const commerceItems = computed((): NavItem[] => {
  if (props.role === 'consumer') return [{ id: 'marketplace', label: 'Explorer', icon: Search }, { id: 'cart', label: 'Panier', icon: ShoppingCart }, { id: 'orders', label: 'Commandes', icon: Package }]
  if (props.role === 'farmer') return [{ id: 'my-products', label: 'Mes produits', icon: Package }, { id: 'marketplace', label: 'Marketplace', icon: Search }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  if (props.role === 'processor') return [{ id: 'marketplace', label: 'Acheter', icon: Search }, { id: 'my-products', label: 'Mes produits', icon: Package }, { id: 'cart', label: 'Panier', icon: ShoppingCart }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  if (props.role === 'merchant') return [{ id: 'marketplace', label: 'Marketplace', icon: Search }, { id: 'my-products', label: 'Mes produits', icon: Package }, { id: 'cart', label: 'Panier', icon: ShoppingCart }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  if (props.role === 'transporter') return []
  if (['interprofession', 'cooperative'].includes(props.role)) return [{ id: 'my-products', label: 'Nos produits', icon: Package }, { id: 'marketplace', label: 'Marketplace', icon: Search }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  if (['association', 'union', 'federation', 'independent'].includes(props.role)) return [{ id: 'my-products', label: 'Nos produits', icon: Package }, { id: 'marketplace', label: 'Marketplace', icon: Search }, { id: 'cart', label: 'Panier', icon: ShoppingCart }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  return [{ id: 'orders', label: 'Commandes', icon: Wallet }]
})

const financialItems = computed((): NavItem[] => {
  const common = [{ id: 'wallet', label: 'Portefeuille', icon: Wallet }, { id: 'accounting', label: 'Ma Comptabilité', icon: Calculator }]
  if (['cooperative', 'association', 'union', 'federation', 'interprofession', 'independent'].includes(props.role)) return [...common, { id: 'stats', label: 'Statistiques', icon: BarChart3 }]
  return common
})
</script>

<template>
  <aside class="hidden lg:flex lg:flex-col w-64 bg-white border-r border-border fixed left-0 top-0 bottom-0 z-50">
    <div class="p-6 border-b border-border">
      <h1 class="text-2xl font-bold text-primary">TITRA</h1>
      <p class="text-xs text-muted-foreground mt-1">Plateforme agricole</p>
    </div>

    <div class="p-4 border-b border-border">
      <button @click="emit('navigate', 'profile')" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border border-primary/20">
          <img v-if="userPhoto" :src="userPhoto" :alt="userName" class="w-full h-full object-cover" />
          <User v-else class="w-5 h-5 text-primary" />
        </div>
        <div class="flex-1 text-left min-w-0">
          <p class="font-medium truncate">{{ userName }}</p>
          <Badge variant="secondary" class="text-xs mt-1">{{ getRoleLabel(role) }}</Badge>
        </div>
      </button>
      <p v-if="userMatricule" class="text-xs text-muted-foreground mt-2 px-3">{{ userMatricule }}</p>
    </div>

    <nav class="flex-1 overflow-y-auto p-4">
      <div class="space-y-1">
        <button v-for="item in navItems" :key="item.id" @click="emit('navigate', item.id)" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', activeScreen === item.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="flex-1 text-left">{{ item.label }}</span>
          <Badge v-if="item.id === 'cart' && (cartCount || 0) > 0" class="bg-secondary">{{ cartCount }}</Badge>
        </button>

        <div class="my-4 border-t border-border" />
        <div class="mb-2 px-4"><p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Commerce</p></div>
        <button v-for="item in commerceItems" :key="item.id" @click="emit('navigate', item.id)" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', activeScreen === item.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="flex-1 text-left">{{ item.label }}</span>
          <Badge v-if="item.id === 'cart' && (cartCount || 0) > 0" class="bg-secondary">{{ cartCount }}</Badge>
        </button>

        <div class="my-4 border-t border-border" />
        <div class="mb-2 px-4"><p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Finance & Analyse</p></div>
        <button v-for="item in financialItems" :key="item.id" @click="emit('navigate', item.id)" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', activeScreen === item.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
          <component :is="item.icon" class="w-5 h-5" />
          <span class="flex-1 text-left">{{ item.label }}</span>
        </button>

        <div class="my-4 border-t border-border" />
        <button @click="emit('navigate', 'training')" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', activeScreen === 'training' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
          <GraduationCap class="w-5 h-5" />
          <span class="flex-1 text-left">Formation</span>
        </button>
      </div>
    </nav>

    <div class="p-4 border-t border-border space-y-2">
      <button @click="emit('navigate', 'settings')" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
        <Settings class="w-5 h-5" /><span>Paramètres</span>
      </button>
      <button @click="emit('logout')" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
        <LogOut class="w-5 h-5" /><span>Déconnexion</span>
      </button>
    </div>
  </aside>
</template>
