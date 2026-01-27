<script setup lang="ts">
import { computed } from 'vue'
import { Home, Search, ShoppingCart, Wallet, User, Package, Truck, Users, BarChart3, Settings, MessageSquare, LogOut, Calculator, GraduationCap, X } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'

interface NavItem { id: string; label: string; icon: any }

const props = defineProps<{
  isOpen: boolean
  activeScreen: string
  role: string
  userName: string
  userPhoto?: string
  userMatricule?: string
  cartCount?: number
}>()

const emit = defineEmits<{
  close: []
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
  if (props.role === 'processor') return [{ id: 'marketplace', label: 'Acheter', icon: Search }, { id: 'my-products', label: 'Mes produits', icon: Package }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  if (props.role === 'merchant') return [{ id: 'marketplace', label: 'Marketplace', icon: Search }, { id: 'my-products', label: 'Mes produits', icon: Package }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  if (props.role === 'transporter') return []
  if (['cooperative', 'association', 'union', 'federation', 'interprofession', 'independent'].includes(props.role)) return [{ id: 'my-products', label: 'Nos produits', icon: Package }, { id: 'orders', label: 'Commandes', icon: ShoppingCart }]
  return [{ id: 'orders', label: 'Commandes', icon: Wallet }]
})

const financialItems = computed((): NavItem[] => {
  const common = [{ id: 'wallet', label: 'Portefeuille', icon: Wallet }, { id: 'accounting', label: 'Ma Comptabilité', icon: Calculator }]
  if (['cooperative', 'association', 'union', 'federation', 'interprofession', 'independent'].includes(props.role)) return [...common, { id: 'stats', label: 'Statistiques', icon: BarChart3 }]
  return common
})

function handleNavigate(screen: string) { emit('navigate', screen); emit('close') }
function handleLogout() { emit('logout'); emit('close') }
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-[60] lg:hidden" @click="emit('close')" />
    </Transition>
    
    <Transition name="slide">
      <div v-if="isOpen" class="fixed left-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-white z-[60] lg:hidden flex flex-col shadow-2xl">
        <div class="p-4 border-b border-border flex items-center justify-between bg-primary">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-white">TITRA</h1>
            <p class="text-xs text-white/80 mt-0.5">Plateforme agricole</p>
          </div>
          <button @click="emit('close')" class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <X class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        <div class="p-3 sm:p-4 border-b border-border">
          <button @click="handleNavigate('profile')" class="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-primary/20">
              <img v-if="userPhoto" :src="userPhoto" :alt="userName" class="w-full h-full object-cover" />
              <User v-else class="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div class="flex-1 text-left min-w-0">
              <p class="font-medium truncate text-sm sm:text-base">{{ userName }}</p>
              <Badge variant="secondary" class="text-xs mt-1">{{ getRoleLabel(role) }}</Badge>
            </div>
          </button>
          <p v-if="userMatricule" class="text-xs text-muted-foreground mt-2 px-2 sm:px-3">{{ userMatricule }}</p>
        </div>

        <nav class="flex-1 overflow-y-auto p-3 sm:p-4">
          <div class="space-y-1">
            <button v-for="item in navItems" :key="item.id" @click="handleNavigate(item.id)" :class="['w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base', activeScreen === item.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
              <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span class="flex-1 text-left">{{ item.label }}</span>
              <Badge v-if="item.id === 'cart' && (cartCount || 0) > 0" class="bg-secondary text-xs">{{ cartCount }}</Badge>
            </button>

            <template v-if="commerceItems.length > 0">
              <div class="my-3 sm:my-4 border-t border-border" />
              <div class="mb-2 px-3 sm:px-4"><p class="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Commerce</p></div>
              <button v-for="item in commerceItems" :key="item.id" @click="handleNavigate(item.id)" :class="['w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base', activeScreen === item.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
                <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span class="flex-1 text-left">{{ item.label }}</span>
                <Badge v-if="item.id === 'cart' && (cartCount || 0) > 0" class="bg-secondary text-xs">{{ cartCount }}</Badge>
              </button>
            </template>

            <template v-if="financialItems.length > 0">
              <div class="my-3 sm:my-4 border-t border-border" />
              <div class="mb-2 px-3 sm:px-4"><p class="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Finance & Analyse</p></div>
              <button v-for="item in financialItems" :key="item.id" @click="handleNavigate(item.id)" :class="['w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base', activeScreen === item.id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
                <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span class="flex-1 text-left">{{ item.label }}</span>
              </button>
            </template>

            <div class="my-3 sm:my-4 border-t border-border" />
            <button @click="handleNavigate('training')" :class="['w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base', activeScreen === 'training' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50']">
              <GraduationCap class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span class="flex-1 text-left">Formation</span>
            </button>
          </div>
        </nav>

        <div class="p-3 sm:p-4 border-t border-border space-y-2 bg-muted/30">
          <button @click="handleNavigate('settings')" class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-muted-foreground hover:bg-white transition-colors text-sm sm:text-base">
            <Settings class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /><span>Paramètres</span>
          </button>
          <button @click="handleLogout" class="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base">
            <LogOut class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /><span>Déconnexion</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>
