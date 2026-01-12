<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { useCartStore } from '@/stores/cart'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const cartStore = useCartStore()
const isLoading = ref(true)

onMounted(() => { setTimeout(() => isLoading.value = false, 800) })

const subtotal = computed(() => cartStore.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))
const deliveryFee = 1000
const commission = computed(() => subtotal.value * 0.05)
const total = computed(() => subtotal.value + deliveryFee + commission.value)

const updateQuantity = (productId: string, quantity: number) => {
  cartStore.updateQuantity(productId, quantity)
}

const removeItem = (productId: string) => {
  cartStore.removeItem(productId)
  toast.success('Produit retiré du panier')
}

const handleCheckout = () => {
  toast.success('Commande passée avec succès !', { description: 'Vous serez notifié quand le vendeur confirmera' })
  cartStore.clearCart()
  emit('navigate', 'orders')
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Empty Cart -->
    <template v-if="cartStore.items.length === 0 && !isLoading">
      <div class="p-4 border-b">
        <button @click="emit('back')" class="flex items-center gap-2">
          <ArrowLeft class="w-5 h-5" />
          <span>Retour</span>
        </button>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center p-6">
        <div class="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-4">
          <ShoppingCart class="w-16 h-16 text-muted-foreground" />
        </div>
        <h2 class="mb-2 text-xl font-medium">Votre panier est vide</h2>
        <p class="text-muted-foreground text-center mb-6">
          Explorez notre marketplace et ajoutez des produits frais
        </p>
        <Button @click="emit('navigate', 'marketplace')" class="bg-primary">
          Explorer les produits
        </Button>
      </div>
    </template>

    <!-- Cart with Items -->
    <template v-else>
      <div class="sticky top-0 z-10 bg-white border-b p-4">
        <button @click="emit('back')" class="flex items-center gap-2">
          <ArrowLeft class="w-5 h-5" />
          <span class="font-medium">Panier ({{ cartStore.items.length }})</span>
        </button>
      </div>

      <div class="flex-1 p-4 space-y-4 pb-56">
        <!-- Skeleton Loading -->
        <template v-if="isLoading">
          <Card v-for="i in 3" :key="i" class="p-4 animate-pulse">
            <div class="flex gap-4">
              <div class="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
              <div class="flex-1">
                <div class="h-5 w-32 bg-muted rounded mb-2"></div>
                <div class="h-4 w-24 bg-muted rounded mb-2"></div>
                <div class="h-5 w-28 bg-muted rounded"></div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-4 pt-4 border-t">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 bg-muted rounded"></div>
                <div class="h-6 w-8 bg-muted rounded"></div>
                <div class="h-8 w-8 bg-muted rounded"></div>
              </div>
              <div class="flex items-center gap-4">
                <div class="h-6 w-24 bg-muted rounded"></div>
                <div class="h-8 w-8 bg-muted rounded"></div>
              </div>
            </div>
          </Card>
        </template>

        <!-- Cart Items -->
        <template v-else>
          <Card v-for="item in cartStore.items" :key="item.product.id" class="p-4">
            <div class="flex gap-4">
              <div class="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img
                  :src="item.product.images[0]"
                  :alt="item.product.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium line-clamp-1">{{ item.product.name }}</p>
                <p class="text-sm text-muted-foreground line-clamp-1">
                  {{ item.product.seller.name }}
                </p>
                <p class="text-primary font-semibold mt-1">
                  {{ item.product.price.toLocaleString() }} FCFA / {{ item.product.unit }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between mt-4 pt-4 border-t">
              <div class="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  class="h-8 w-8"
                  @click="updateQuantity(item.product.id, Math.max(1, item.quantity - 1))"
                >
                  <Minus class="w-4 h-4" />
                </Button>
                <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                <Button
                  variant="outline"
                  size="icon"
                  class="h-8 w-8"
                  @click="updateQuantity(item.product.id, item.quantity + 1)"
                >
                  <Plus class="w-4 h-4" />
                </Button>
              </div>

              <div class="flex items-center gap-4">
                <p class="font-semibold">
                  {{ (item.product.price * item.quantity).toLocaleString() }} FCFA
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-destructive hover:text-destructive"
                  @click="removeItem(item.product.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </template>
      </div>

      <!-- Summary - Fixed Bottom -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Sous-total</span>
            <span>{{ subtotal.toLocaleString() }} FCFA</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Frais de livraison</span>
            <span>{{ deliveryFee.toLocaleString() }} FCFA</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Commission TITRA (5%)</span>
            <span>{{ commission.toLocaleString() }} FCFA</span>
          </div>
          <div class="flex justify-between pt-2 border-t">
            <span class="font-semibold">Total</span>
            <span class="font-bold text-primary text-lg">
              {{ total.toLocaleString() }} FCFA
            </span>
          </div>
        </div>
        <Button @click="handleCheckout" class="w-full bg-primary h-12" :disabled="isLoading">
          Passer la commande
        </Button>
      </div>
    </template>
  </div>
</template>
