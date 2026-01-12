<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Plus, Package, Edit, Trash2, Eye, Grid3X3, List } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

const isLoading = ref(true)
const activeTab = ref<'active' | 'draft' | 'sold'>('active')
const viewMode = ref<'list' | 'grid'>('list')

onMounted(() => { setTimeout(() => isLoading.value = false, 1200) })

// Produits avec vraies images
const products = [
  { id: '1', name: 'Igname Krenglè fraîche', price: 500, unit: 'kg', stock: 150, sold: 45, status: 'active', image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=200&h=200&fit=crop', category: 'Tubercules' },
  { id: '2', name: 'Manioc frais du village', price: 300, unit: 'kg', stock: 200, sold: 80, status: 'active', image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=200&h=200&fit=crop', category: 'Tubercules' },
  { id: '3', name: 'Banane plantain mûre', price: 400, unit: 'régime', stock: 50, sold: 32, status: 'active', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop', category: 'Fruits' },
  { id: '4', name: 'Tomates fraîches', price: 800, unit: 'kg', stock: 0, sold: 120, status: 'sold', image: 'https://images.unsplash.com/photo-1546470427-227c7369a9b9?w=200&h=200&fit=crop', category: 'Légumes' },
  { id: '5', name: 'Piment frais', price: 1500, unit: 'kg', stock: 25, sold: 15, status: 'active', image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=200&h=200&fit=crop', category: 'Épices' },
  { id: '6', name: 'Aubergines violettes', price: 600, unit: 'kg', stock: 40, sold: 28, status: 'draft', image: 'https://images.unsplash.com/photo-1613881553903-4b2ed59eb970?w=200&h=200&fit=crop', category: 'Légumes' },
  { id: '7', name: 'Maïs grain séché', price: 350, unit: 'kg', stock: 300, sold: 150, status: 'active', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop', category: 'Céréales' },
  { id: '8', name: 'Riz local parfumé', price: 700, unit: 'kg', stock: 100, sold: 65, status: 'active', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop', category: 'Céréales' },
  { id: '9', name: 'Oignons rouges', price: 900, unit: 'kg', stock: 60, sold: 42, status: 'active', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&h=200&fit=crop', category: 'Légumes' },
  { id: '10', name: 'Mangues Kent', price: 1200, unit: 'kg', stock: 0, sold: 200, status: 'sold', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop', category: 'Fruits' },
]

const filteredProducts = computed(() => {
  if (activeTab.value === 'active') return products.filter(p => p.status === 'active')
  if (activeTab.value === 'draft') return products.filter(p => p.status === 'draft')
  return products.filter(p => p.status === 'sold')
})

const stats = computed(() => ({
  total: products.length,
  active: products.filter(p => p.status === 'active').length,
  draft: products.filter(p => p.status === 'draft').length,
  sold: products.filter(p => p.status === 'sold').length,
  totalRevenue: products.reduce((sum, p) => sum + (p.price * p.sold), 0)
}))

const getStatusBadge = (status: string) => {
  if (status === 'active') return { label: 'En vente', class: 'bg-green-600' }
  if (status === 'draft') return { label: 'Brouillon', class: 'bg-muted text-muted-foreground' }
  return { label: 'Épuisé', class: 'bg-secondary' }
}
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-gradient-to-br from-[#2D5016] via-[#2D5016] to-[#1a3009] text-white p-6">
      <div class="flex items-center gap-4 mb-4">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-white text-2xl">Mes produits</h1>
          <p class="text-white/80 text-sm">{{ stats.total }} produits • {{ stats.totalRevenue.toLocaleString() }} F de ventes</p>
        </div>
        <Button @click="emit('navigate', 'add-product')" size="sm" class="bg-white text-[#2D5016] hover:bg-white/90">
          <Plus class="w-4 h-4 mr-1" />Ajouter
        </Button>
      </div>

      <!-- Quick Stats -->
      <template v-if="isLoading">
        <div class="grid grid-cols-3 gap-2">
          <div v-for="i in 3" :key="i" class="bg-white/10 rounded-lg p-3 animate-pulse">
            <div class="h-6 w-8 bg-white/20 rounded mx-auto mb-1"></div>
            <div class="h-3 w-12 bg-white/20 rounded mx-auto"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white/10 rounded-lg p-3 text-center">
            <p class="text-white text-xl font-bold">{{ stats.active }}</p>
            <p class="text-white/70 text-xs">En vente</p>
          </div>
          <div class="bg-white/10 rounded-lg p-3 text-center">
            <p class="text-white text-xl font-bold">{{ stats.draft }}</p>
            <p class="text-white/70 text-xs">Brouillons</p>
          </div>
          <div class="bg-white/10 rounded-lg p-3 text-center">
            <p class="text-white text-xl font-bold">{{ stats.sold }}</p>
            <p class="text-white/70 text-xs">Épuisés</p>
          </div>
        </div>
      </template>
    </div>

    <div class="p-4">
      <!-- Tabs & View Toggle -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex flex-1 bg-muted rounded-lg p-1">
          <button 
            @click="activeTab = 'active'" 
            :class="['flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors', activeTab === 'active' ? 'bg-background shadow' : 'text-muted-foreground']"
          >En vente ({{ stats.active }})</button>
          <button 
            @click="activeTab = 'draft'" 
            :class="['flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors', activeTab === 'draft' ? 'bg-background shadow' : 'text-muted-foreground']"
          >Brouillons ({{ stats.draft }})</button>
          <button 
            @click="activeTab = 'sold'" 
            :class="['flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors', activeTab === 'sold' ? 'bg-background shadow' : 'text-muted-foreground']"
          >Épuisés ({{ stats.sold }})</button>
        </div>
        <!-- View Toggle -->
        <div class="flex bg-muted rounded-lg p-1">
          <button 
            @click="viewMode = 'list'" 
            :class="['p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-background shadow' : 'text-muted-foreground']"
          ><List class="w-4 h-4" /></button>
          <button 
            @click="viewMode = 'grid'" 
            :class="['p-2 rounded-md transition-colors', viewMode === 'grid' ? 'bg-background shadow' : 'text-muted-foreground']"
          ><Grid3X3 class="w-4 h-4" /></button>
        </div>
      </div>

      <!-- Skeleton Loading - List -->
      <template v-if="isLoading && viewMode === 'list'">
        <div class="space-y-3">
          <Card v-for="i in 5" :key="i" class="p-3 animate-pulse">
            <div class="flex gap-3">
              <div class="w-16 h-16 bg-muted rounded-lg flex-shrink-0"></div>
              <div class="flex-1 min-w-0">
                <div class="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div class="h-5 w-1/3 bg-muted rounded mb-2"></div>
                <div class="flex gap-2">
                  <div class="h-4 w-16 bg-muted rounded"></div>
                  <div class="h-4 w-16 bg-muted rounded"></div>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="h-8 w-8 bg-muted rounded"></div>
                <div class="h-8 w-8 bg-muted rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      </template>

      <!-- Skeleton Loading - Grid -->
      <template v-if="isLoading && viewMode === 'grid'">
        <div class="grid grid-cols-2 gap-3">
          <Card v-for="i in 6" :key="i" class="overflow-hidden animate-pulse">
            <div class="aspect-[4/3] bg-muted"></div>
            <div class="p-3">
              <div class="h-4 w-3/4 bg-muted rounded mb-2"></div>
              <div class="h-5 w-1/2 bg-muted rounded mb-2"></div>
              <div class="flex justify-between">
                <div class="h-4 w-16 bg-muted rounded"></div>
                <div class="h-4 w-12 bg-muted rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      </template>

      <!-- Empty State -->
      <template v-if="!isLoading && filteredProducts.length === 0">
        <div class="text-center py-12">
          <Package class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground">Aucun produit dans cette catégorie</p>
          <Button @click="emit('navigate', 'add-product')" class="mt-4">
            <Plus class="w-4 h-4 mr-2" />Ajouter un produit
          </Button>
        </div>
      </template>

      <!-- List View -->
      <template v-if="!isLoading && viewMode === 'list' && filteredProducts.length > 0">
        <div class="space-y-3">
          <Card v-for="product in filteredProducts" :key="product.id" class="p-3 hover:shadow-md transition-shadow">
            <div class="flex gap-3">
              <!-- Image -->
              <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
              </div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-medium text-sm line-clamp-1">{{ product.name }}</p>
                  <Badge :class="['text-xs flex-shrink-0', getStatusBadge(product.status).class]">
                    {{ getStatusBadge(product.status).label }}
                  </Badge>
                </div>
                <p class="text-primary font-bold text-sm mt-1">
                  {{ product.price.toLocaleString() }} F<span class="text-muted-foreground font-normal text-xs">/{{ product.unit }}</span>
                </p>
                <div class="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>Stock: {{ product.stock }}</span>
                  <span class="text-success">{{ product.sold }} vendus</span>
                  <Badge variant="outline" class="text-xs">{{ product.category }}</Badge>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" class="h-8 w-8">
                  <Eye class="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" class="h-8 w-8">
                  <Edit class="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" class="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </template>

      <!-- Grid View -->
      <template v-if="!isLoading && viewMode === 'grid' && filteredProducts.length > 0">
        <div class="grid grid-cols-2 gap-3">
          <Card v-for="product in filteredProducts" :key="product.id" class="overflow-hidden group">
            <!-- Product Image -->
            <div class="aspect-[4/3] relative overflow-hidden bg-muted">
              <img 
                :src="product.image" 
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Badge :class="['absolute top-2 left-2 text-xs', getStatusBadge(product.status).class]">
                {{ getStatusBadge(product.status).label }}
              </Badge>
              <!-- Actions overlay -->
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" class="h-8 w-8">
                  <Eye class="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" class="h-8 w-8">
                  <Edit class="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" class="h-8 w-8">
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-2">
              <p class="font-medium text-xs line-clamp-1 mb-1">{{ product.name }}</p>
              <p class="text-primary font-bold text-sm">{{ product.price.toLocaleString() }} F<span class="text-muted-foreground font-normal text-xs">/{{ product.unit }}</span></p>
              <div class="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <span>Stock: {{ product.stock }}</span>
                <span class="text-success">{{ product.sold }} vendus</span>
              </div>
            </div>
          </Card>
        </div>
      </template>
    </div>
  </div>
</template>
