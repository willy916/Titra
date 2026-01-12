<script setup lang="ts">
import { computed } from 'vue'
import { Home, Search, ShoppingCart, Wallet, User, Package, Truck, Users, BarChart3 } from 'lucide-vue-next'

interface NavItem {
  id: string
  label: string
  icon: any
}

const props = defineProps<{
  activeScreen: string
  role: string
  cartCount?: number
}>()

const emit = defineEmits<{
  navigate: [screen: string]
}>()

const navItems = computed((): NavItem[] => {
  if (props.role === 'consumer') {
    return [
      { id: 'home', label: 'Accueil', icon: Home },
      { id: 'marketplace', label: 'Explorer', icon: Search },
      { id: 'cart', label: 'Panier', icon: ShoppingCart },
      { id: 'orders', label: 'Commandes', icon: Package },
      { id: 'profile', label: 'Profil', icon: User },
    ]
  }
  if (props.role === 'farmer') {
    return [
      { id: 'home', label: 'Accueil', icon: Home },
      { id: 'my-products', label: 'Mes produits', icon: Package },
      { id: 'orders', label: 'Commandes', icon: ShoppingCart },
      { id: 'wallet', label: 'Portefeuille', icon: Wallet },
      { id: 'profile', label: 'Profil', icon: User },
    ]
  }
  if (props.role === 'processor') {
    return [
      { id: 'home', label: 'Accueil', icon: Home },
      { id: 'marketplace', label: 'Acheter', icon: Search },
      { id: 'my-products', label: 'Produits', icon: Package },
      { id: 'orders', label: 'Commandes', icon: ShoppingCart },
      { id: 'wallet', label: 'Finances', icon: Wallet },
    ]
  }
  if (props.role === 'merchant') {
    return [
      { id: 'home', label: 'Accueil', icon: Home },
      { id: 'marketplace', label: 'Marketplace', icon: Search },
      { id: 'orders', label: 'Commandes', icon: ShoppingCart },
      { id: 'wallet', label: 'Finances', icon: Wallet },
      { id: 'profile', label: 'Profil', icon: User },
    ]
  }
  if (props.role === 'transporter') {
    return [
      { id: 'home', label: 'Accueil', icon: Home },
      { id: 'missions', label: 'Missions', icon: Truck },
      { id: 'orders', label: 'Courses', icon: Package },
      { id: 'wallet', label: 'Revenus', icon: Wallet },
      { id: 'profile', label: 'Profil', icon: User },
    ]
  }
  if (['cooperative', 'association', 'union', 'federation', 'interprofession', 'independent'].includes(props.role)) {
    return [
      { id: 'home', label: 'Accueil', icon: Home },
      { id: 'members', label: 'Membres', icon: Users },
      { id: 'stats', label: 'Statistiques', icon: BarChart3 },
      { id: 'wallet', label: 'Finances', icon: Wallet },
      { id: 'profile', label: 'Profil', icon: User },
    ]
  }
  return [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'members', label: 'Membres', icon: Users },
    { id: 'orders', label: 'Commandes', icon: Wallet },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ]
})
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 shadow-lg lg:hidden">
    <div class="flex items-center justify-around max-w-screen-xl mx-auto px-1 sm:px-2">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="emit('navigate', item.id)"
        :class="[
          'relative flex flex-col items-center gap-0.5 sm:gap-1 py-2 sm:py-3 px-2 sm:px-4 min-w-[56px] sm:min-w-[60px] transition-all duration-200',
          activeScreen === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground active:scale-95'
        ]"
      >
        <div v-if="activeScreen === item.id" class="absolute top-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-primary rounded-b-full" />
        <div class="relative">
          <component :is="item.icon" :class="['w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200', activeScreen === item.id ? 'scale-110' : 'scale-100']" />
          <span v-if="item.id === 'cart' && (cartCount || 0) > 0" class="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 bg-secondary text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium border-2 border-white">
            {{ (cartCount || 0) > 9 ? '9+' : cartCount }}
          </span>
        </div>
        <span :class="['text-[10px] sm:text-xs font-medium transition-all duration-200 truncate max-w-[56px] sm:max-w-none', activeScreen === item.id ? 'opacity-100' : 'opacity-70']">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>
