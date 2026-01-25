<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, Package, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import { useOrderStore } from '@/stores/order'
import { toast } from 'vue-sonner'

const props = defineProps<{ userRole: string }>()
const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

const orderStore = useOrderStore()
const isLoading = ref(true)
const activeTab = ref('preparing')

// Map UI tabs to API statuses
const statusMap: Record<string, string> = {
  preparing: 'EN_PREPARATION',
  in_progress: 'EN_COURS',
  delivered: 'LIVREE',
  cancelled: 'ANNULEE'
}

async function loadOrders() {
  isLoading.value = true
  try {
    await orderStore.fetchMyOrders(statusMap[activeTab.value])
  } catch (error) {
    console.error('Error loading orders:', error)
    toast.error('Erreur lors du chargement des commandes')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)
watch(activeTab, loadOrders)

const statusConfig: Record<string, { label: string; color: string }> = {
  'EN_PREPARATION': { label: 'En préparation', color: 'bg-amber-500' },
  'EN_COURS': { label: 'En cours de livraison', color: 'bg-blue-500' },
  'LIVREE': { label: 'Livrée', color: 'bg-green-600' },
  'ANNULEE': { label: 'Annulée', color: 'bg-destructive' },
}

const getStatusConfig = (status: string) => {
  return statusConfig[status] || { label: status, color: 'bg-muted' }
}

const mappedOrders = computed(() => {
  return orderStore.orders.map((o: any) => ({
    id: o.id,
    orderNumber: o.orderNumber || `CMD-${o.id.slice(0, 8)}`,
    date: o.orderDate ? new Date(o.orderDate) : new Date(),
    status: o.orderStatus,
    buyerName: o.buyerName || 'Client inconnu',
    total: o.totalAmount || 0,
    product: o.product, // { nom, categorie, photos: [] }
    quantity: o.quantity || 0,
    unitPrice: o.unitPrice || 0
  }))
})

const emptyMessages: Record<string, string> = {
  preparing: 'Aucune commande en préparation',
  in_progress: 'Aucune commande en cours de livraison',
  delivered: 'Aucune commande livrée',
  cancelled: 'Aucune commande annulée',
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="p-4">
        <button @click="emit('back')" class="flex items-center gap-2">
          <ArrowLeft class="w-5 h-5" />
          <span>Mes commandes</span>
        </button>
      </div>

      <!-- Tabs -->
      <div class="grid grid-cols-4 border-t">
        <button
          v-for="tab in ['preparing', 'in_progress', 'delivered', 'cancelled']"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'py-3 text-[10px] sm:text-xs font-medium transition-colors',
            activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
          ]"
        >
          {{ tab === 'preparing' ? 'Préparation' : tab === 'in_progress' ? 'En cours' : tab === 'delivered' ? 'Livrées' : 'Annulées' }}
        </button>
      </div>
    </div>

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
        <p class="text-muted-foreground">Chargement des commandes...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="mappedOrders.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Package class="w-12 h-12 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground text-center">{{ emptyMessages[activeTab] }}</p>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <Card
          v-for="order in mappedOrders"
          :key="order.id"
          class="p-4 cursor-pointer hover:shadow-lg transition-shadow"
          @click="emit('navigate', 'order-detail', { order })"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-medium text-primary">{{ order.orderNumber }}</p>
              <p class="text-xs text-muted-foreground">{{ order.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}</p>
            </div>
            <Badge :class="`${getStatusConfig(order.status).color} text-white border-0`">
              {{ getStatusConfig(order.status).label }}
            </Badge>
          </div>

          <div class="flex gap-3 mb-4">
            <!-- Product Image -->
            <div class="w-20 h-20 bg-muted rounded-xl overflow-hidden shadow-inner flex-shrink-0">
              <img 
                :src="order.product?.photos?.[0] || 'https://images.unsplash.com/photo-1586771107445-d3ca888129ee?w=200&h=200&fit=crop'" 
                :alt="order.product?.nom" 
                class="w-full h-full object-cover" 
              />
            </div>
            <div class="flex-1">
              <p class="font-medium text-sm line-clamp-1">{{ order.product?.nom || 'Produit sans nom' }}</p>
              <p class="text-xs text-muted-foreground mb-2">{{ order.product?.categorie }}</p>
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="text-[10px]">{{ order.quantity }} {{ order.product?.unite || 'unité(s)' }}</Badge>
                <span class="text-xs text-muted-foreground">x {{ order.unitPrice.toLocaleString() }} F</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t">
            <div class="text-sm">
              <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Acheteur</p>
              <p class="font-medium truncate max-w-[150px]">{{ order.buyerName }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Total</p>
              <p class="font-bold text-primary">{{ order.total.toLocaleString() }} FCFA</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
