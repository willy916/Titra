<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, Package, Loader2, MapPin, Truck, CheckCircle2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import { useOrderStore } from '@/stores/order'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

const orderStore = useOrderStore()
const isLoading = ref(true)

const tabs = [
  { id: 'in_progress', label: 'En cours' },
  { id: 'delivered', label: 'Livrées' },
  { id: 'cancelled', label: 'Annulées' }
]

const activeTab = ref('in_progress')

// Map UI tabs to API statuses - for personal orders as buyer
const statusMap: Record<string, string[]> = {
  in_progress: ['EN_ATTENTE', 'EN_PREPARATION', 'EN_COURS'],
  delivered: ['LIVREE'],
  cancelled: ['ANNULEE']
}

async function loadPersonalOrders() {
  isLoading.value = true
  try {
    // Fetch orders where current user is the buyer
    const statuses = statusMap[activeTab.value]
    // This would call a different endpoint for buyer orders
    // For now, we use the same store method but filter differently
    await orderStore.fetchMyPersonalOrders(statuses)
  } catch (error) {
    console.error('Error loading personal orders:', error)
    toast.error('Erreur lors du chargement de vos commandes')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadPersonalOrders)
watch(activeTab, loadPersonalOrders)

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  'EN_ATTENTE': { label: 'Paiement confirmé', color: 'bg-amber-400', icon: Package },
  'EN_PREPARATION': { label: 'En préparation', color: 'bg-amber-600', icon: Package },
  'EN_COURS': { label: 'En livraison', color: 'bg-blue-600', icon: Truck },
  'LIVREE': { label: 'Livrée', color: 'bg-green-600', icon: CheckCircle2 },
  'ANNULEE': { label: 'Annulée', color: 'bg-destructive', icon: Package },
}

const getStatusConfig = (status: string) => {
  return statusConfig[status] || { label: status, color: 'bg-muted', icon: Package }
}

// Progress steps for order tracking
const getOrderProgress = (order: any) => {
  if (order.trackingSteps && order.trackingSteps.length > 0) {
    return order.trackingSteps
  }

  const steps = [
    { id: 'EN_ATTENTE', label: 'Confirmée', active: false, completed: false },
    { id: 'EN_PREPARATION', label: 'Préparation', active: false, completed: false },
    { id: 'EN_COURS', label: 'En livraison', active: false, completed: false },
    { id: 'LIVREE', label: 'Livrée', active: false, completed: false }
  ]

  const status = order.status
  const statusOrder = ['EN_ATTENTE', 'EN_PREPARATION', 'EN_COURS', 'LIVREE']
  const currentIndex = statusOrder.indexOf(status)

  if (status === 'ANNULEE') {
    return steps.map(s => ({ ...s, active: false, completed: false }))
  }

  return steps.map((step, index) => ({
    ...step,
    completed: index < currentIndex,
    active: index === currentIndex
  }))
}

const mappedOrders = computed(() => {
  return (orderStore.personalOrders || []).map((o: any) => {
    const orderObj = {
      id: o.id,
      orderNumber: o.orderNumber || `CMD-${o.id.slice(0, 8)}`,
      date: o.orderDate ? new Date(o.orderDate) : new Date(),
      status: o.status || o.orderStatus,
      statusLabel: o.paymentStatusLabel || o.statusDisplayName || statusConfig[o.status || o.orderStatus]?.label || (o.status || o.orderStatus),
      sellerName: o.sellerName || (o.seller ? `${o.seller.firstName || ''} ${o.seller.lastName || ''}`.trim() : 'Vendeur inconnu'),
      total: o.totalAmount || 0,
      product: {
        nom: o.productName || o.productNameSnapshot || 'Produit sans nom',
        photos: o.productPhoto ? [o.productPhoto] : (o.productPhotoSnapshot ? [o.productPhotoSnapshot] : []),
        categorie: o.productCategory || (o.product ? o.product.categorie : 'Catégorie')
      },
      quantityDisplay: o.quantityInfo || `${o.quantity || 0} ${o.product?.unite || 'unité(s)'}`,
      unitPrice: o.unitPrice || 0,
      deliveryAddress: o.deliveryAddress || 'Adresse non spécifiée',
      trackingSteps: o.trackingSteps || []
    }
    
    // Add pre-calculated progress steps
    return {
      ...orderObj,
      progressSteps: getOrderProgress(orderObj)
    }
  })
})

const emptyMessages: Record<string, string> = {
  in_progress: 'Aucune commande en cours',
  delivered: 'Aucune commande livrée',
  cancelled: 'Aucune commande annulée',
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <div class="sticky top-0 z-10 bg-white border-b">
      <div class="p-4">
        <button @click="emit('back')" class="flex items-center gap-2 mb-2">
          <ArrowLeft class="w-5 h-5" />
          <span class="font-medium">Retour</span>
        </button>
        <h1 class="text-xl font-bold">Mes commandes personnelles</h1>
        <p class="text-xs text-muted-foreground mt-1">Suivez l'évolution de vos achats</p>
      </div>

      <!-- Tabs -->
      <div class="grid grid-cols-3 border-t">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-3 text-xs font-medium transition-colors',
            activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
        <p class="text-muted-foreground">Chargement de vos commandes...</p>
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
          class="p-4"
        >
          <!-- Order Header -->
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-medium text-primary">{{ order.orderNumber }}</p>
              <p class="text-xs text-muted-foreground">{{ order.date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}</p>
            </div>
            <Badge :class="`${getStatusConfig(order.status).color} text-white border-0`">
              {{ order.statusLabel }}
            </Badge>
          </div>

          <!-- Product Info -->
          <div class="flex gap-3 mb-4 pb-4 border-b">
            <div class="w-20 h-20 bg-muted rounded-xl overflow-hidden shadow-inner flex-shrink-0">
              <img 
                :src="order.product?.photos?.[0] || 'https://images.unsplash.com/photo-1586771107445-d3ca888129ee?w=200&h=200&fit=crop'" 
                :alt="order.product?.nom" 
                class="w-full h-full object-cover" 
              />
            </div>
            <div class="flex-1">
              <p class="font-medium text-sm line-clamp-1">{{ order.product?.nom || 'Produit sans nom' }}</p>
              <p class="text-xs text-muted-foreground mb-2">{{ order.product?.categorie || 'Catégorie' }}</p>
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="text-[10px]">{{ order.quantityDisplay }}</Badge>
                <span class="text-xs text-muted-foreground">x {{ order.unitPrice.toLocaleString() }} F</span>
              </div>
            </div>
          </div>

          <!-- Order Progress (only for in_progress orders) -->
          <div v-if="activeTab === 'in_progress'" class="mb-4 pb-4 border-b">
            <p class="text-xs font-medium text-muted-foreground mb-3">Suivi de la commande</p>
            <div class="relative">
              <div class="flex justify-between items-center">
                <div
                  v-for="(step, index) in order.progressSteps"
                  :key="index"
                  class="flex-1 flex flex-col items-center relative"
                >
                  <!-- Progress Line -->
                  <div
                    v-if="(index as number) < order.progressSteps.length - 1"
                    :class="[
                      'absolute top-3 left-1/2 w-full h-0.5',
                      step.completed ? 'bg-primary' : 'bg-muted'
                    ]"
                    style="z-index: 0"
                  />
                  
                  <!-- Step Circle -->
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center mb-2 relative z-10',
                      step.completed ? 'bg-primary' : step.active ? 'bg-primary border-4 border-primary/30' : 'bg-muted'
                    ]"
                  >
                    <CheckCircle2
                      v-if="step.completed"
                      class="w-4 h-4 text-white"
                    />
                    <div
                      v-else
                      :class="[
                        'w-2 h-2 rounded-full',
                        step.active ? 'bg-white' : 'bg-muted-foreground/30'
                      ]"
                    />
                  </div>
                  
                  <!-- Step Label -->
                  <p
                    :class="[
                      'text-[9px] text-center',
                      step.completed || step.active ? 'text-foreground font-medium' : 'text-muted-foreground'
                    ]"
                  >
                    {{ step.label }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="flex items-start gap-2 mb-4 pb-4 border-b">
            <MapPin class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Adresse de livraison</p>
              <p class="text-xs">{{ order.deliveryAddress }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Vendeur</p>
              <p class="font-medium text-xs">{{ order.sellerName }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Total</p>
              <p class="font-bold text-primary">{{ order.total.toLocaleString() }} FCFA</p>
            </div>
          </div>

          <!-- Action Button for in_progress -->
          <button
            v-if="activeTab === 'in_progress'"
            class="w-full mt-4 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            @click="emit('navigate', 'order-detail', { order, fromScreen: 'my-personal-orders' })"
          >
            Voir les détails
          </button>
        </Card>
      </div>
    </div>
  </div>
</template>
