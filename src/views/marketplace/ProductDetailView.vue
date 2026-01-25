<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, MapPin, Star, Minus, Plus, MessageSquare, ShoppingCart, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useMarketplaceStore } from '@/stores/marketplace'
import { toast } from 'vue-sonner'

const props = defineProps<{ product: any }>()
const emit = defineEmits<{
  back: []
  navigate: [screen: string, data?: any]
  addToCart: [product: any, quantity: number]
}>()

const marketplaceStore = useMarketplaceStore()
const quantity = ref(1)
const currentImageIndex = ref(0)
const isLoading = ref(false)
const fullProduct = ref<any>(null)

async function fetchFullDetails() {
  isLoading.value = true
  try {
    const data = await marketplaceStore.fetchProductDetails(props.product.type, props.product.id)
    // Map API fields to UI fields
    fullProduct.value = {
      ...data,
      name: data.nom || data.name,
      prix: data.prix || data.price,
      unite: data.unite || data.unit,
      categorie: data.categorie || data.category,
      images: (data.photos && data.photos.length > 0) ? data.photos : (data.images || ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop']),
      seller: {
        name: data.vendeur?.nom || data.seller?.name || 'Vendeur Inconnu',
        matricule: data.vendeur?.matricule || data.seller?.matricule,
        cooperative: data.vendeur?.cooperative || data.seller?.cooperative,
        location: data.vendeur?.localisation || data.seller?.location,
        rating: data.vendeur?.note || data.seller?.rating || 4.5
      },
      verified: data.badges?.includes('Local') || data.badges?.includes('Vérifié') || data.verified,
      quantity: data.disponibilite || data.quantity || data.stock || 0
    }
  } catch (error) {
    console.error('Error fetching product details:', error)
    // Fallback but ensure structure
    fullProduct.value = {
      ...props.product,
      seller: props.product.seller || { name: 'Mon Profil' }
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // If navigating from "my-products", utilize the passed product object directly
  // This avoids calling the generic marketplace API which might not find private/coop products
  const fromSource = (props.product as any).fromSource || (props.product as any)._fromSource // or check route params if available
  
  // Actually, we can check if it has detailed fields already or just try fetch
  // Better yet, rely on the caller passing a flag or just use the prop if it looks complete
  // For now, let's fix the specific issue: Coop products from "My Products"
  
  if (props.product?.type === 'PAYSAN' && props.product?.id && !props.product._raw) {
     // Authentic marketplace fetch
     fetchFullDetails()
  } else {
     // It's likely from My Products or already full
     // Map existing props to fullProduct
     const p = props.product
     fullProduct.value = {
        ...p,
        name: p.nom || p.name,
        prix: p.prix || p.price,
        unite: p.unite || p.unit,
        categorie: p.categorie || p.category,
        images: (p.photos && p.photos.length > 0) ? p.photos : (p.images || p.image ? [p.image] : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop']),
        seller: p.seller || { 
            name: 'Mon Profil', // Default for self-view
            location: p.localisation || 'Ma localité'
        },
        verified: true,
        quantity: p.quantiteDisponible || p.stock || 0,
        description: p.description || 'Pas de description.'
     }
  }
})

function handleAddToCart() {
  emit('addToCart', fullProduct.value, quantity.value)
}

function getInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="min-h-screen bg-background pb-32">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b p-4">
      <button @click="emit('back')" class="flex items-center gap-2">
        <ArrowLeft class="w-5 h-5" />
        <span>Retour</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-12">
      <Loader2 class="w-10 h-10 text-primary animate-spin mb-4" />
      <p class="text-muted-foreground">Chargement des détails...</p>
    </div>

    <template v-else-if="fullProduct">
      <!-- Image Gallery -->
      <div class="relative aspect-square bg-muted">
        <img :src="fullProduct.images[currentImageIndex]" :alt="fullProduct.name" class="w-full h-full object-cover" />
        <Badge v-if="fullProduct.verified" class="absolute top-4 right-4 bg-success text-white">✓ Vérifié</Badge>
        <div v-if="fullProduct.images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            v-for="(_, index) in fullProduct.images"
            :key="index"
            @click="currentImageIndex = index"
            :class="['h-2 rounded-full transition-all', index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2']"
          />
        </div>
      </div>

      <div class="p-6 space-y-6">
        <!-- Product Info -->
        <div>
          <h1 class="text-2xl font-bold">{{ fullProduct.name }}</h1>
          <div v-if="fullProduct.badges" class="flex items-center gap-2 mt-2">
            <Badge v-for="tag in fullProduct.badges" :key="tag" variant="secondary" class="text-xs">{{ tag }}</Badge>
          </div>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-2">
          <p class="text-3xl font-bold text-primary">{{ fullProduct.prix?.toLocaleString() }} FCFA</p>
          <span class="text-muted-foreground">/ {{ fullProduct.unite }}</span>
        </div>

        <!-- Description -->
        <div>
          <h3 class="font-semibold">Description</h3>
          <p class="text-muted-foreground mt-2 text-sm leading-relaxed">{{ fullProduct.description }}</p>
        </div>

        <!-- Details -->
        <Card class="p-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">Catégorie</p>
              <p class="font-medium">{{ fullProduct.categorie }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Origine</p>
              <p class="font-medium">{{ fullProduct.localisation || fullProduct.seller.location }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Disponibilité</p>
              <p class="font-medium text-success">{{ fullProduct.quantity }} {{ fullProduct.unite }} en stock</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Livraison</p>
              <p class="font-medium">Sur commande</p>
            </div>
          </div>
        </Card>

        <!-- Seller Info -->
        <div>
          <h3 class="font-semibold mb-3">Vendeur</h3>
          <Card class="p-4 cursor-pointer hover:shadow-lg transition-shadow" @click="emit('navigate', 'seller-profile', { seller: fullProduct.seller })">
            <div class="flex items-center gap-3">
              <Avatar :fallback="getInitials(fullProduct.seller.name)" class="w-14 h-14" />
              <div class="flex-1">
                <p class="font-medium">{{ fullProduct.seller.name }}</p>
                <p class="text-xs text-muted-foreground">{{ fullProduct.seller.matricule }}</p>
                <p v-if="fullProduct.seller.cooperative" class="text-xs text-muted-foreground">{{ fullProduct.seller.cooperative }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <MapPin class="w-3 h-3 text-muted-foreground" />
                  <span class="text-xs text-muted-foreground">{{ fullProduct.seller.location }}</span>
                  <template v-if="fullProduct.seller.rating">
                    <Star class="w-3 h-3 fill-secondary text-secondary ml-2" />
                    <span class="text-xs font-medium">{{ fullProduct.seller.rating }}/5</span>
                  </template>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Traceability -->
        <div>
          <h3 class="font-semibold mb-3">Traçabilité</h3>
          <Card class="p-4">
            <div class="space-y-3">
              <div v-if="fullProduct.seller.cooperative" class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-primary" />
                <div class="flex-1">
                  <p class="text-sm font-medium">Coopérative</p>
                  <p class="text-sm text-muted-foreground">{{ fullProduct.seller.cooperative }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-primary" />
                <div class="flex-1">
                  <p class="text-sm font-medium">Origine certifiée</p>
                  <p class="text-sm text-muted-foreground">Région: {{ fullProduct.localisation || 'Côte d\'Ivoire' }}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3 shadow-2xl z-20">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Quantité</span>
          <div class="flex items-center gap-3">
            <Button variant="outline" size="icon" class="h-10 w-10" @click="quantity = Math.max(1, quantity - 1)">
              <Minus class="w-4 h-4" />
            </Button>
            <span class="w-12 text-center font-bold">{{ quantity }}</span>
            <Button variant="outline" size="icon" class="h-10 w-10" @click="quantity = Math.min(Number(fullProduct.quantity), quantity + 1)">
              <Plus class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="flex gap-3">
          <Button variant="outline" class="flex-1 h-12" @click="emit('navigate', 'chat', { user: fullProduct.seller })">
            <MessageSquare class="w-4 h-4 mr-2" />Contacter
          </Button>
          <Button class="flex-1 bg-primary h-12" @click="handleAddToCart">
            <ShoppingCart class="w-4 h-4 mr-2" />Ajouter au panier
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
