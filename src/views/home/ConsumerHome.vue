<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  Search, MapPin, Wheat, Carrot, Apple, Milk, Drumstick, Fish, Star, 
  ShoppingBag, Clock, CheckCircle, CreditCard, ChevronRight, TrendingUp,
  Percent, Bell, ShoppingCart
} from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useConsumerStore } from '@/stores/consumer'
import { useChatStore } from '@/stores/chat'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ navigate: [screen: string, data?: any] }>()
const consumerStore = useConsumerStore()
const chatStore = useChatStore()

const searchQuery = ref('')
const stats = computed(() => consumerStore.dashboardStats)
const isLoading = computed(() => consumerStore.isLoading)

onMounted(async () => {
  try {
    await consumerStore.fetchDashboardStats()
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }
})

const categories = [
  { id: 'cereals', label: 'Céréales', icon: Wheat, color: 'bg-amber-100 text-amber-600' },
  { id: 'vegetables', label: 'Légumes', icon: Carrot, color: 'bg-orange-100 text-orange-600' },
  { id: 'fruits', label: 'Fruits', icon: Apple, color: 'bg-red-100 text-red-600' },
  { id: 'dairy', label: 'Lait', icon: Milk, color: 'bg-blue-100 text-blue-600' },
  { id: 'meat', label: 'Viandes', icon: Drumstick, color: 'bg-rose-100 text-rose-600' },
  { id: 'fish', label: 'Poissons', icon: Fish, color: 'bg-cyan-100 text-cyan-600' },
]

function getInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price).replace('XOF', 'FCFA')
}

async function handleDirectContact(producer: any) {
  const phone = producer?.phoneNumber || producer?.telephone || producer?.phone || producer?.cellulaire
  if (!phone) {
    toast.error('Numéro de téléphone du producteur non disponible')
    return
  }

  try {
    const conversation = await chatStore.startConversation(phone)
    emit('navigate', 'chat', { conversation })
  } catch (error) {
    console.error('Failed to start conversation:', error)
    toast.error('Impossible de démarrer la conversation')
  }
}
</script>

<template>
  <div class="pb-24 bg-slate-50 min-h-screen">
    <!-- Premium Header -->
    <div class="relative overflow-hidden bg-primary pb-32 pt-8 px-6 rounded-b-[40px] shadow-xl">
      <!-- Decorative circles -->
      <div class="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-secondary/10 rounded-full blur-2xl"></div>
      
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <Avatar 
              v-if="stats?.consommateurInfo" 
              :src="stats.consommateurInfo.avatarUrl || undefined" 
              :fallback="getInitials(stats.consommateurInfo.fullName)"
              class="w-12 h-12 border-2 border-white/20 shadow-lg" 
            />
            <div class="flex flex-col">
              <span class="text-white/70 text-xs font-medium uppercase tracking-wider">Bienvenue</span>
              <h2 class="text-white font-bold text-xl leading-tight">
                {{ stats?.consommateurInfo?.fullName || 'Chargement...' }}
              </h2>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="emit('navigate', 'cart')" class="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300">
              <ShoppingCart class="w-6 h-6 text-white" />
              <span v-if="stats?.consommateurInfo?.cartItemsCount" class="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                {{ stats.consommateurInfo.cartItemsCount }}
              </span>
            </button>
            <button class="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300">
              <Bell class="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-6 text-white/90 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/10">
          <MapPin class="w-4 h-4 text-secondary-light" />
          <span class="text-sm font-medium">{{ stats?.consommateurInfo?.location || 'Localisation...' }}</span>
        </div>
        
        <div class="relative group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            v-model="searchQuery" 
            placeholder="Rechercher des produits frais..." 
            class="pl-12 bg-white/95 backdrop-blur-sm text-slate-900 h-14 rounded-2xl border-0 shadow-lg focus:ring-4 focus:ring-secondary/20 transition-all text-lg" 
          />
        </div>
      </div>
    </div>

    <div class="px-6 -mt-20 space-y-8 relative z-20">
      <!-- Activity Stats Cards -->
      <div v-if="isLoading" class="grid grid-cols-2 gap-4">
        <div v-for="i in 2" :key="i" class="h-24 bg-white rounded-3xl animate-pulse shadow-sm"></div>
      </div>
      <div v-else-if="stats" class="grid grid-cols-2 gap-4">
        <Card class="p-4 bg-white border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden relative group transition-all hover:-translate-y-1 active:scale-95 cursor-pointer" @click="emit('navigate', 'orders')">
          <div class="absolute top-0 right-0 p-3 text-primary/5 group-hover:text-primary/10 transition-colors">
            <ShoppingBag class="w-12 h-12" />
          </div>
          <div class="relative z-10">
            <p class="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-tight">Commandes</p>
            <div class="flex items-baseline gap-1">
              <h3 class="text-2xl font-bold text-slate-900">{{ stats.orderStats.totalOrders }}</h3>
              <span class="text-[10px] text-slate-400 font-medium">total</span>
            </div>
            <div class="flex items-center gap-1 mt-2">
              <div class="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span class="text-[10px] font-bold text-secondary">{{ stats.orderStats.pendingOrders }} en cours</span>
            </div>
          </div>
        </Card>

        <Card class="p-4 bg-white border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden relative group transition-all hover:-translate-y-1 active:scale-95 cursor-pointer" @click="emit('navigate', 'wallet')">
          <div class="absolute top-0 right-0 p-3 text-secondary/5 group-hover:text-secondary/10 transition-colors">
            <CreditCard class="w-12 h-12" />
          </div>
          <div class="relative z-10">
            <p class="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-tight">Dépenses</p>
            <h3 class="text-xl font-bold text-slate-900 truncate">{{ formatPrice(stats.orderStats.totalSpent) }}</h3>
            <div class="flex items-center gap-1 mt-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
              <TrendingUp class="w-3 h-3" />
              <span class="text-[10px] font-bold">{{ formatPrice(stats.orderStats.averageOrderValue) }} / moy.</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Categories -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900">Catégories</h3>
          <button class="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all" @click="emit('navigate', 'marketplace')">
            Tout voir <ChevronRight class="w-4 h-4" />
          </button>
        </div>
        <div class="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
          <button v-for="category in categories" :key="category.id" class="flex flex-col items-center gap-3 min-w-[70px] group">
            <div :class="[category.color, 'w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 group-active:scale-95 transition-all duration-300 transform']">
              <component :is="category.icon" class="w-8 h-8" />
            </div>
            <span class="text-xs font-bold text-slate-600 group-hover:text-primary transition-colors text-center">{{ category.label }}</span>
          </button>
        </div>
      </section>

      <!-- Special Offers -->
      <section v-if="stats?.specialOffers?.length">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Offres du moment</h3>
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          <Card 
            v-for="offer in stats.specialOffers" 
            :key="offer.id" 
            class="min-w-[300px] bg-gradient-to-br from-indigo-600 to-primary border-0 p-5 rounded-[32px] overflow-hidden relative shadow-lg shadow-indigo-200"
          >
            <div class="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div class="relative z-10 flex gap-4">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">
                {{ offer.icon }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <Badge class="bg-secondary text-white border-0">{{ offer.discountPercentage }}% DE RÉDUCTION</Badge>
                </div>
                <h4 class="text-white font-bold text-lg mb-1">{{ offer.title }}</h4>
                <p class="text-white/80 text-xs font-medium">{{ offer.description }}</p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between">
              <div class="flex items-center gap-1 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                <Clock class="w-3 h-3" /> Expire bientôt
              </div>
              <button class="bg-white text-primary text-xs font-bold px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-transform">En profiter</button>
            </div>
          </Card>
        </div>
      </section>

      <!-- Nearby Producers -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900">Producteurs proches</h3>
          <button class="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Explorer <ChevronRight class="w-4 h-4" />
          </button>
        </div>
        
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 2" :key="i" class="h-28 bg-white rounded-3xl animate-pulse shadow-sm"></div>
        </div>
        <div v-else class="space-y-4">
          <Card 
            v-for="producer in stats?.nearbyProducers" 
            :key="producer.id" 
            class="p-4 bg-white border-0 shadow-md shadow-slate-200/50 rounded-3xl cursor-pointer hover:shadow-xl hover:translate-x-1 transition-all duration-300 relative group" 
            @click="emit('navigate', 'seller-profile', { sellerId: producer.id, seller: producer })"
          >
            <div class="flex items-center gap-4">
              <div class="relative">
                <Avatar 
                  :src="producer.avatarUrl || undefined" 
                  :fallback="getInitials(producer.name)" 
                  class="w-16 h-16 rounded-2xl border-2 border-slate-50" 
                />
                <div class="absolute -bottom-1 -right-1 bg-success text-white p-1 rounded-full border-2 border-white shadow-sm">
                  <CheckCircle class="w-3 h-3 fill-success" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-slate-900 truncate">{{ producer.name }}</h4>
                  <Badge variant="outline" class="text-[10px] py-0 px-1.5 h-4 border-slate-200 text-slate-500 font-bold uppercase">{{ producer.type }}</Badge>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <Badge class="bg-primary/5 text-primary border-0 text-[10px] font-bold">{{ producer.category }}</Badge>
                  <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <MapPin class="w-3 h-3" /> {{ producer.location }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div class="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl">
                  <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span class="text-xs font-bold text-amber-600">{{ producer.rating }}</span>
                </div>
                <button 
                  @click.stop="handleDirectContact(producer)"
                  class="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <MessageSquare class="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <!-- Popular Products -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-slate-900">Populaires</h3>
            <Badge class="bg-rose-500 text-white border-0 text-[10px] animate-pulse">HOT</Badge>
          </div>
          <button @click="emit('navigate', 'marketplace')" class="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Voir le marché <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <div v-if="isLoading" class="grid grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="h-64 bg-white rounded-3xl animate-pulse shadow-sm"></div>
        </div>
        <div v-else class="grid grid-cols-2 gap-4">
          <Card 
            v-for="product in stats?.popularProducts" 
            :key="product.id" 
            class="group bg-white border-0 shadow-md shadow-slate-200/50 rounded-[32px] overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
            @click="emit('navigate', 'product-detail', { product })"
          >
            <div class="aspect-square bg-slate-100 relative overflow-hidden">
              <img 
                :src="product.photoUrl || 'https://via.placeholder.com/300'" 
                :alt="product.name" 
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div class="absolute top-3 left-3 flex flex-col gap-2">
                <Badge v-if="product.isVerified" class="bg-success text-white border-0 shadow-sm text-[10px] w-fit">✓ VÉRIFIÉ</Badge>
              </div>
              <button @click.stop class="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md p-2.5 rounded-2xl shadow-lg hover:bg-primary hover:text-white transition-all active:scale-90">
                <ShoppingCart class="w-5 h-5" />
              </button>
            </div>
            <div class="p-4">
              <p class="font-bold text-slate-800 text-sm mb-0.5 truncate">{{ product.name }}</p>
              <p class="text-[10px] text-slate-400 font-semibold mb-3 truncate flex items-center gap-1">
                <CheckCircle class="w-3 h-3 text-primary/40" /> {{ product.producerName }}
              </p>
              <div class="flex items-center justify-between">
                <p class="font-black text-primary text-base">{{ formatPrice(product.price) }}</p>
                <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">/{{ product.unit }}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <!-- Favorite Categories -->
      <section v-if="stats?.favoriteCategories?.length">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Vos préférences</h3>
        <div class="flex flex-wrap gap-2">
          <Badge 
            v-for="cat in stats.favoriteCategories" 
            :key="cat" 
            class="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl font-bold hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer"
          >
            #{{ cat }}
          </Badge>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
