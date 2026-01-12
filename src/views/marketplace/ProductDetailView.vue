<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, MapPin, Star, Minus, Plus, MessageSquare, ShoppingCart } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import type { Product } from '@/types'

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{
  back: []
  navigate: [screen: string, data?: any]
  addToCart: [product: Product, quantity: number]
}>()

const quantity = ref(1)
const currentImageIndex = ref(0)

function handleAddToCart() {
  emit('addToCart', props.product, quantity.value)
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('')
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

    <!-- Image Gallery -->
    <div class="relative aspect-square bg-muted">
      <img :src="product.images[currentImageIndex]" :alt="product.name" class="w-full h-full object-cover" />
      <Badge v-if="product.verified" class="absolute top-4 right-4 bg-success text-white">✓ Vérifié</Badge>
      <div v-if="product.images.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          v-for="(_, index) in product.images"
          :key="index"
          @click="currentImageIndex = index"
          :class="['h-2 rounded-full transition-all', index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2']"
        />
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Product Info -->
      <div>
        <h1>{{ product.name }}</h1>
        <div class="flex items-center gap-2 mt-2">
          <Badge v-for="tag in product.tags" :key="tag" variant="secondary" class="text-xs">{{ tag }}</Badge>
        </div>
      </div>

      <!-- Price -->
      <div class="flex items-baseline gap-2">
        <p class="text-3xl font-bold text-primary">{{ product.price.toLocaleString() }} FCFA</p>
        <span class="text-muted-foreground">/ {{ product.unit }}</span>
      </div>

      <!-- Description -->
      <div>
        <h3>Description</h3>
        <p class="text-muted-foreground mt-2">{{ product.description }}</p>
      </div>

      <!-- Details -->
      <Card class="p-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Catégorie</p>
            <p class="font-medium">{{ product.category }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Origine</p>
            <p class="font-medium">{{ product.seller.location }}</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Disponibilité</p>
            <p class="font-medium text-success">{{ product.quantity }} {{ product.unit }} en stock</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Livraison</p>
            <p class="font-medium">Sur commande</p>
          </div>
        </div>
      </Card>

      <!-- Seller Info -->
      <div>
        <h3 class="mb-3">Vendeur</h3>
        <Card class="p-4 cursor-pointer hover:shadow-lg transition-shadow" @click="emit('navigate', 'seller-profile', { seller: product.seller })">
          <div class="flex items-center gap-3">
            <Avatar :fallback="getInitials(product.seller.name)" class="w-14 h-14" />
            <div class="flex-1">
              <p class="font-medium">{{ product.seller.name }}</p>
              <p class="text-sm text-muted-foreground">{{ product.seller.matricule }}</p>
              <p v-if="product.seller.cooperative" class="text-sm text-muted-foreground">{{ product.seller.cooperative }}</p>
              <div class="flex items-center gap-2 mt-1">
                <MapPin class="w-3 h-3 text-muted-foreground" />
                <span class="text-xs text-muted-foreground">{{ product.seller.location }}</span>
                <template v-if="product.seller.rating">
                  <Star class="w-3 h-3 fill-secondary text-secondary ml-2" />
                  <span class="text-xs">{{ product.seller.rating }}/5</span>
                </template>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Traceability -->
      <div>
        <h3 class="mb-3">Traçabilité</h3>
        <Card class="p-4">
          <div class="space-y-3">
            <div v-if="product.seller.cooperative" class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-primary" />
              <div class="flex-1">
                <p class="text-sm font-medium">Coopérative</p>
                <p class="text-sm text-muted-foreground">{{ product.seller.cooperative }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-primary" />
              <div class="flex-1">
                <p class="text-sm font-medium">Producteur vérifié</p>
                <p class="text-sm text-muted-foreground">Matricule: {{ product.seller.matricule }}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">Quantité</span>
        <div class="flex items-center gap-3">
          <Button variant="outline" size="icon" class="h-10 w-10" @click="quantity = Math.max(1, quantity - 1)">
            <Minus class="w-4 h-4" />
          </Button>
          <span class="w-12 text-center font-medium">{{ quantity }}</span>
          <Button variant="outline" size="icon" class="h-10 w-10" @click="quantity = Math.min(product.quantity, quantity + 1)">
            <Plus class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div class="flex gap-3">
        <Button variant="outline" class="flex-1" @click="emit('navigate', 'chat', { user: product.seller })">
          <MessageSquare class="w-4 h-4 mr-2" />Contacter
        </Button>
        <Button class="flex-1 bg-primary" @click="handleAddToCart">
          <ShoppingCart class="w-4 h-4 mr-2" />Ajouter au panier
        </Button>
      </div>
    </div>
  </div>
</template>
