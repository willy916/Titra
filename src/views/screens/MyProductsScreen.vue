<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{ userRole: 'farmer' | 'processor' }>()
const emit = defineEmits<{ back: [], navigate: [screen: string, data?: any] }>()

const products = ref([
  { id: '1', name: props.userRole === 'farmer' ? 'Igname fraîche' : 'Attiéké premium', description: 'Produit de qualité supérieure', price: props.userRole === 'farmer' ? 500 : 1500, unit: 'kg', category: props.userRole === 'farmer' ? 'Tubercules' : 'Produits transformés', quantity: 250, available: true, verified: true },
  { id: '2', name: props.userRole === 'farmer' ? 'Maïs grain' : 'Farine de manioc', description: 'Récolte de la saison', price: props.userRole === 'farmer' ? 350 : 1200, unit: 'kg', category: props.userRole === 'farmer' ? 'Céréales' : 'Produits transformés', quantity: 150, available: true, verified: false },
  { id: '3', name: props.userRole === 'farmer' ? 'Tomate' : 'Huile de palme', description: 'Fraîchement cueillies', price: props.userRole === 'farmer' ? 800 : 2500, unit: props.userRole === 'farmer' ? 'kg' : 'litre', category: props.userRole === 'farmer' ? 'Légumes' : 'Huiles', quantity: 0, available: false, verified: true },
])

const activeProducts = computed(() => products.value.filter(p => p.available))
const inactiveProducts = computed(() => products.value.filter(p => !p.available))
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6 pb-8">
      <div class="flex items-center gap-4 mb-6">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-white text-2xl">{{ userRole === 'farmer' ? 'Mes produits' : 'Produits transformés' }}</h1>
          <p class="text-white/80 text-sm">{{ activeProducts.length }} produits actifs</p>
        </div>
      </div>
      <Button @click="emit('navigate', 'add-product')" class="w-full bg-white text-primary hover:bg-white/90 h-12">
        <Plus class="w-5 h-5 mr-2" />
        {{ userRole === 'farmer' ? 'Ajouter un produit' : 'Ajouter un produit transformé' }}
      </Button>
    </div>

    <div class="p-6 space-y-6">
      <!-- Active Products -->
      <div>
        <h3 class="text-primary mb-3">Produits disponibles ({{ activeProducts.length }})</h3>
        <div class="space-y-3">
          <Card v-for="product in activeProducts" :key="product.id" class="p-4">
            <div class="flex gap-4">
              <div class="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-3xl">📦</span>
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-medium">{{ product.name }}</h4>
                    <p class="text-sm text-muted-foreground">{{ product.description }}</p>
                  </div>
                  <Badge v-if="product.verified" variant="default" class="bg-green-600">Vérifié</Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-lg font-medium text-primary">{{ product.price.toLocaleString() }} F / {{ product.unit }}</p>
                    <p class="text-sm text-muted-foreground">Stock : {{ product.quantity }} {{ product.unit }}</p>
                  </div>
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline"><Edit class="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline"><EyeOff class="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Inactive Products -->
      <div v-if="inactiveProducts.length > 0">
        <h3 class="text-muted-foreground mb-3">Produits indisponibles ({{ inactiveProducts.length }})</h3>
        <div class="space-y-3">
          <Card v-for="product in inactiveProducts" :key="product.id" class="p-4 opacity-60">
            <div class="flex gap-4">
              <div class="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-3xl">📦</span>
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-medium">{{ product.name }}</h4>
                    <p class="text-sm text-muted-foreground">{{ product.description }}</p>
                  </div>
                  <Badge variant="secondary">Indisponible</Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-lg font-medium">{{ product.price.toLocaleString() }} F / {{ product.unit }}</p>
                    <p class="text-sm text-red-600">Stock épuisé</p>
                  </div>
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline"><Edit class="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline"><Eye class="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" class="text-red-600"><Trash2 class="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Stats -->
      <Card class="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
        <h3 class="text-primary mb-3">Statistiques</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-sm text-muted-foreground">Vues ce mois</p><p class="text-2xl font-medium">342</p></div>
          <div><p class="text-sm text-muted-foreground">Commandes</p><p class="text-2xl font-medium">28</p></div>
        </div>
      </Card>
    </div>
  </div>
</template>
