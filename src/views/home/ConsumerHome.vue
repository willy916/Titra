<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, MapPin, Wheat, Carrot, Apple, Milk, Drumstick, Fish, Star } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { mockProducts } from '@/data/mockData'

const emit = defineEmits<{ navigate: [screen: string, data?: any] }>()

const searchQuery = ref('')
const isLoading = ref(true)

onMounted(() => { setTimeout(() => isLoading.value = false, 1000) })

const categories = [
  { id: 'cereals', label: 'Céréales', icon: Wheat },
  { id: 'vegetables', label: 'Légumes', icon: Carrot },
  { id: 'fruits', label: 'Fruits', icon: Apple },
  { id: 'dairy', label: 'Lait', icon: Milk },
  { id: 'meat', label: 'Viandes', icon: Drumstick },
  { id: 'fish', label: 'Poissons', icon: Fish },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('')
}
</script>

<template>
  <div class="pb-20">
    <!-- Header with Search -->
    <div class="bg-gradient-to-br from-primary to-[#4CAF50] text-white p-6 rounded-b-3xl">
      <div class="flex items-center gap-2 mb-4 text-sm">
        <MapPin class="w-4 h-4" />
        <span>Abidjan, Cocody</span>
      </div>
      
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Que recherchez-vous aujourd'hui ?" class="pl-10 bg-white text-foreground h-12" />
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Categories Skeleton -->
      <div v-if="isLoading">
        <div class="h-5 w-24 bg-muted rounded mb-4 animate-pulse"></div>
        <div class="flex gap-4 overflow-x-auto pb-2">
          <div v-for="i in 6" :key="i" class="flex flex-col items-center gap-2 min-w-[80px] animate-pulse">
            <div class="w-16 h-16 rounded-full bg-muted"></div>
            <div class="h-3 w-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
      <!-- Categories -->
      <div v-else>
        <h3 class="mb-4">Catégories</h3>
        <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <button v-for="category in categories" :key="category.id" class="flex flex-col items-center gap-2 min-w-[80px]">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <component :is="category.icon" class="w-7 h-7 text-primary" />
            </div>
            <span class="text-xs text-center">{{ category.label }}</span>
          </button>
        </div>
      </div>

      <!-- Nearby Farmers Skeleton -->
      <div v-if="isLoading">
        <div class="h-5 w-48 bg-muted rounded mb-4 animate-pulse"></div>
        <div class="space-y-3">
          <Card v-for="i in 3" :key="i" class="p-4 animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-muted"></div>
              <div class="flex-1">
                <div class="h-4 w-32 bg-muted rounded mb-2"></div>
                <div class="h-3 w-24 bg-muted rounded mb-2"></div>
                <div class="flex gap-2">
                  <div class="h-5 w-16 bg-muted rounded"></div>
                  <div class="h-5 w-20 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <!-- Nearby Farmers -->
      <div v-else>
        <h3 class="mb-4">Producteurs près de chez vous</h3>
        <div class="space-y-3">
          <Card v-for="product in mockProducts.slice(0, 3)" :key="product.id" class="p-4 cursor-pointer hover:shadow-lg transition-shadow" @click="emit('navigate', 'seller-profile', { seller: product.seller })">
            <div class="flex items-center gap-3">
              <Avatar :fallback="getInitials(product.seller.name)" class="w-12 h-12" />
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ product.seller.name }}</p>
                <p class="text-sm text-muted-foreground truncate">{{ product.seller.cooperative }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <Badge variant="outline" class="text-xs">{{ product.category }}</Badge>
                  <span class="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin class="w-3 h-3" />{{ product.seller.location }}
                  </span>
                </div>
              </div>
              <div v-if="product.seller.rating" class="flex items-center gap-1">
                <Star class="w-4 h-4 fill-secondary text-secondary" />
                <span class="text-sm">{{ product.seller.rating }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Popular Products Skeleton -->
      <div v-if="isLoading">
        <div class="flex justify-between mb-4">
          <div class="h-5 w-36 bg-muted rounded animate-pulse"></div>
          <div class="h-4 w-16 bg-muted rounded animate-pulse"></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Card v-for="i in 4" :key="i" class="overflow-hidden animate-pulse">
            <div class="aspect-square bg-muted"></div>
            <div class="p-3">
              <div class="h-4 w-full bg-muted rounded mb-2"></div>
              <div class="h-3 w-2/3 bg-muted rounded mb-2"></div>
              <div class="h-5 w-1/2 bg-muted rounded"></div>
            </div>
          </Card>
        </div>
      </div>
      <!-- Popular Products -->
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <h3>Produits populaires</h3>
          <button @click="emit('navigate', 'marketplace')" class="text-sm text-primary hover:underline">Voir tout</button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <Card v-for="product in mockProducts.slice(0, 4)" :key="product.id" class="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" @click="emit('navigate', 'product-detail', { product })">
            <div class="aspect-square bg-muted relative overflow-hidden">
              <img :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
              <Badge v-if="product.verified" class="absolute top-2 right-2 bg-success text-white">✓ Vérifié</Badge>
            </div>
            <div class="p-3">
              <p class="font-medium text-sm mb-1 truncate">{{ product.name }}</p>
              <p class="text-xs text-muted-foreground mb-2 truncate">{{ product.seller.name }}</p>
              <div class="flex items-center justify-between">
                <p class="font-semibold text-primary">{{ product.price }} FCFA</p>
                <span class="text-xs text-muted-foreground">/{{ product.unit }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Promotions Skeleton -->
      <div v-if="isLoading">
        <div class="h-5 w-32 bg-muted rounded mb-4 animate-pulse"></div>
        <Card class="p-4 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-muted rounded-lg"></div>
            <div class="flex-1">
              <div class="h-4 w-32 bg-muted rounded mb-2"></div>
              <div class="h-3 w-48 bg-muted rounded"></div>
            </div>
          </div>
        </Card>
      </div>
      <!-- Promotions -->
      <div v-else>
        <h3 class="mb-4">Offres spéciales</h3>
        <Card class="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20 p-4">
          <div class="flex items-center gap-3">
            <div class="bg-secondary text-white p-3 rounded-lg">
              <Apple class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <p class="font-medium">🎉 Réduction de 20%</p>
              <p class="text-sm text-muted-foreground">Sur tous les produits frais cette semaine</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
