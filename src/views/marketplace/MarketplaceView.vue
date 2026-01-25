<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, SlidersHorizontal, MapPin, Star, ArrowLeft, X, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Select from '@/components/ui/Select.vue'
import { useMarketplaceStore } from '@/stores/marketplace'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

const marketplaceStore = useMarketplaceStore()
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedLocation = ref('all')
const selectedSellerType = ref<string>('Tous')
const isLoading = ref(true)
const showFilters = ref(false)

const categories = ['all', 'Tubercules', 'Fruits', 'Céréales', 'Légumes', 'Épices', 'Huiles']
const locations = [
  { value: 'all', label: 'Toutes les régions' },
  { value: 'Abidjan', label: 'Abidjan' },
  { value: 'Bouaké', label: 'Bouaké' },
  { value: 'Yamoussoukro', label: 'Yamoussoukro' },
]
const sellerTypes = ['Tous', 'PRODUCTEUR', 'TRANSFORMATEUR', 'COMMERCANT']

async function loadProducts() {
  isLoading.value = true
  try {
    await marketplaceStore.fetchMarketplaceProducts({
      search: searchQuery.value,
      categorie: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
      localisation: selectedLocation.value === 'all' ? undefined : selectedLocation.value,
      typeVendeur: selectedSellerType.value !== 'Tous' ? selectedSellerType.value : undefined
    })
  } catch (error) {
    console.error('Error loading products:', error)
    toast.error('Erreur lors du chargement des produits')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProducts)

// Debounced search
let searchTimeout: any
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadProducts, 500)
})

watch([selectedCategory, selectedLocation, selectedSellerType], loadProducts)

const products = computed(() => {
  return marketplaceStore.products.map((p: any) => ({
    id: p.id,
    name: p.nom,
    category: p.categorie,
    price: p.prix,
    unit: p.unite,
    images: p.photos && p.photos.length > 0 ? p.photos : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'],
    stock: p.disponibilite,
    location: p.localisation,
    seller: {
      name: p.vendeur?.nom || 'Vendeur Inconnu',
      type: p.vendeur?.type,
      location: p.vendeur?.localisation,
      rating: p.vendeur?.note || 4.5,
      cooperative: p.vendeur?.cooperative
    },
    type: p.type, // PAYSAN or COOPERATIVE
    badges: p.badges || [],
    verified: p.badges?.includes('Vérifié') || p.badges?.includes('Local') // Example logic
  }))
})

function resetFilters() {
  selectedCategory.value = 'all'
  selectedLocation.value = 'all'
  selectedSellerType.value = 'Tous'
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20 lg:pb-0">
    <!-- Header - Mobile -->
    <div class="lg:hidden bg-white border-b sticky top-0 z-10">
      <div class="p-4">
        <div class="flex items-center gap-3 mb-4">
          <button @click="emit('back')"><ArrowLeft class="w-5 h-5" /></button>
          <h2 class="flex-1">Marketplace</h2>
        </div>

        <div class="flex gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Rechercher un produit..." class="pl-9" />
          </div>
          <Button variant="outline" size="icon" @click="showFilters = true">
            <SlidersHorizontal class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Category chips - Mobile -->
      <div class="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        <Badge
          v-for="cat in categories"
          :key="cat"
          :variant="selectedCategory === cat ? 'default' : 'outline'"
          @click="selectedCategory = cat"
          class="cursor-pointer whitespace-nowrap"
        >
          {{ cat === 'all' ? 'Tous' : cat }}
        </Badge>
      </div>
    </div>

    <!-- Mobile Filter Sheet -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="showFilters" class="lg:hidden fixed inset-0 z-50">
          <!-- Overlay -->
          <div class="absolute inset-0 bg-black/50" @click="showFilters = false" />
          
          <!-- Filter Panel -->
          <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div class="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h3 class="font-semibold text-lg">Filtres</h3>
              <button @click="showFilters = false"><X class="w-5 h-5" /></button>
            </div>

            <div class="p-4 space-y-6">
              <!-- Catégorie -->
              <div class="space-y-3">
                <h4 class="font-medium">Catégorie</h4>
                <div class="space-y-2">
                  <label v-for="cat in categories" :key="cat" class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      :checked="selectedCategory === cat" 
                      @change="selectedCategory = cat" 
                      class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm">{{ cat === 'all' ? 'Toutes' : cat }}</span>
                  </label>
                </div>
              </div>

              <!-- Localisation -->
              <div class="space-y-3">
                <h4 class="font-medium">Localisation</h4>
                <select 
                  v-model="selectedLocation" 
                  class="w-full p-3 border rounded-lg bg-white text-sm"
                >
                  <option v-for="loc in locations" :key="loc.value" :value="loc.value">
                    {{ loc.label }}
                  </option>
                </select>
              </div>

              <!-- Type de vendeur -->
              <div class="space-y-3">
                <h4 class="font-medium">Type de vendeur</h4>
                <div class="space-y-2">
                  <label v-for="type in sellerTypes" :key="type" class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      :value="type"
                      v-model="selectedSellerType"
                      class="w-4 h-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm">{{ type }}</span>
                  </label>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3 pt-4">
                <Button variant="outline" class="flex-1" @click="resetFilters">Réinitialiser</Button>
                <Button class="flex-1 bg-primary" @click="showFilters = false">Appliquer</Button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Desktop Layout -->
    <div class="hidden lg:flex gap-6">
      <!-- Filters Sidebar - Desktop -->
      <aside class="w-64 flex-shrink-0">
        <Card class="p-4 sticky top-24">
          <h3 class="font-semibold mb-4">Filtres</h3>
          <div class="space-y-6">
            <div class="space-y-3">
              <h4 class="text-sm font-medium">Catégorie</h4>
              <div class="space-y-2">
                <label v-for="cat in categories" :key="cat" class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    :checked="selectedCategory === cat" 
                    @change="selectedCategory = cat" 
                    class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm">{{ cat === 'all' ? 'Toutes' : cat }}</span>
                </label>
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="text-sm font-medium">Localisation</h4>
              <select v-model="selectedLocation" class="w-full p-2 border rounded-lg bg-white text-sm">
                <option v-for="loc in locations" :key="loc.value" :value="loc.value">{{ loc.label }}</option>
              </select>
            </div>

            <div class="space-y-3">
              <h4 class="text-sm font-medium">Type de vendeur</h4>
              <div class="space-y-2">
                <label v-for="type in sellerTypes" :key="type" class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    :value="type"
                    v-model="selectedSellerType"
                    class="w-4 h-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm">{{ type }}</span>
                </label>
              </div>
            </div>

            <Button variant="outline" class="w-full" @click="resetFilters">Réinitialiser</Button>
          </div>
        </Card>
      </aside>

      <!-- Products Grid - Desktop -->
      <div class="flex-1">
        <div class="mb-4">
          <p class="text-sm text-muted-foreground">{{ products.length }} produit{{ products.length > 1 ? 's' : '' }} trouvé{{ products.length > 1 ? 's' : '' }}</p>
        </div>

        <div class="grid grid-cols-3 xl:grid-cols-4 gap-4">
          <template v-if="isLoading">
            <Card v-for="i in 8" :key="i" class="overflow-hidden animate-pulse">
              <div class="aspect-square bg-muted" />
              <div class="p-3 space-y-2">
                <div class="h-4 bg-muted rounded w-3/4" />
                <div class="h-3 bg-muted rounded w-1/2" />
              </div>
            </Card>
          </template>
          <template v-else>
            <Card
              v-for="product in products"
              :key="product.id"
              class="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              @click="emit('navigate', 'product-detail', { product })"
            >
              <div class="aspect-square bg-muted relative overflow-hidden">
                <img :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
                <Badge v-if="product.verified" class="absolute top-2 right-2 bg-success text-white text-xs">✓</Badge>
              </div>
              <div class="p-3">
                <p class="font-medium text-sm mb-1 line-clamp-1">{{ product.name }}</p>
                <p class="text-xs text-muted-foreground mb-1 line-clamp-1">{{ product.seller.name }}</p>
                <div class="flex items-center gap-1 mb-2">
                  <MapPin class="w-3 h-3 text-muted-foreground" />
                  <span class="text-xs text-muted-foreground line-clamp-1">{{ product.seller.location }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-primary">{{ product.price.toLocaleString() }}</p>
                    <span class="text-xs text-muted-foreground">FCFA/{{ product.unit }}</span>
                  </div>
                  <div v-if="product.seller.rating" class="flex items-center gap-1">
                    <Star class="w-3 h-3 fill-secondary text-secondary" />
                    <span class="text-xs">{{ product.seller.rating }}</span>
                  </div>
                </div>
              </div>
            </Card>
          </template>
        </div>
      </div>
    </div>

    <!-- Products - Mobile -->
    <div class="lg:hidden p-4">
      <p class="text-sm text-muted-foreground mb-4">{{ products.length }} produit{{ products.length > 1 ? 's' : '' }} trouvé{{ products.length > 1 ? 's' : '' }}</p>

      <div class="grid grid-cols-2 gap-4">
        <template v-if="isLoading">
          <Card v-for="i in 8" :key="i" class="overflow-hidden animate-pulse">
            <div class="aspect-square bg-muted" />
            <div class="p-3 space-y-2">
              <div class="h-4 bg-muted rounded w-3/4" />
              <div class="h-3 bg-muted rounded w-1/2" />
            </div>
          </Card>
        </template>
        <template v-else>
          <Card
            v-for="product in products"
            :key="product.id"
            class="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            @click="emit('navigate', 'product-detail', { product })"
          >
            <div class="aspect-square bg-muted relative overflow-hidden">
              <img :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
              <Badge v-if="product.verified" class="absolute top-2 right-2 bg-success text-white text-xs">✓</Badge>
            </div>
            <div class="p-3">
              <p class="font-medium text-sm mb-1 line-clamp-1">{{ product.name }}</p>
              <p class="text-xs text-muted-foreground mb-1 line-clamp-1">{{ product.seller.name }}</p>
              <div class="flex items-center gap-1 mb-2">
                <MapPin class="w-3 h-3 text-muted-foreground" />
                <span class="text-xs text-muted-foreground line-clamp-1">{{ product.seller.location }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-primary">{{ product.price.toLocaleString() }}</p>
                  <span class="text-xs text-muted-foreground">FCFA/{{ product.unit }}</span>
                </div>
                <div v-if="product.seller.rating" class="flex items-center gap-1">
                  <Star class="w-3 h-3 fill-secondary text-secondary" />
                  <span class="text-xs">{{ product.seller.rating }}</span>
                </div>
              </div>
            </div>
          </Card>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}
.slide-up-enter-from > div:last-child,
.slide-up-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
