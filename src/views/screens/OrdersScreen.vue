<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Package } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import { mockOrders } from '@/data/mockData'
import type { Order } from '@/types'

const props = defineProps<{ userRole: string }>()
const emit = defineEmits<{ back: [], navigate: [screen: string, data?: any] }>()

const activeTab = ref('in_progress')

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Paiement confirmé', color: 'bg-secondary' },
  confirmed: { label: 'Confirmé', color: 'bg-secondary' },
  preparing: { label: 'En préparation', color: 'bg-secondary' },
  in_delivery: { label: 'En livraison', color: 'bg-accent' },
  delivered: { label: 'Livré', color: 'bg-success' },
  cancelled: { label: 'Annulé', color: 'bg-destructive' },
}

const inProgressOrders = computed(() => mockOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)))
const deliveredOrders = computed(() => mockOrders.filter(o => o.status === 'delivered'))
const cancelledOrders = computed(() => mockOrders.filter(o => o.status === 'cancelled'))

const currentOrders = computed(() => {
  if (activeTab.value === 'in_progress') return inProgressOrders.value
  if (activeTab.value === 'delivered') return deliveredOrders.value
  return cancelledOrders.value
})

function getStatusConfig(status: string) {
  return statusConfig[status] || { label: status, color: 'bg-muted' }
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

      <div class="grid grid-cols-3 border-t">
        <button @click="activeTab = 'in_progress'" :class="['py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'in_progress' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground']">En cours</button>
        <button @click="activeTab = 'delivered'" :class="['py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'delivered' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground']">Livrées</button>
        <button @click="activeTab = 'cancelled'" :class="['py-3 text-sm font-medium border-b-2 transition-colors', activeTab === 'cancelled' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground']">Annulées</button>
      </div>
    </div>

    <div class="p-4 space-y-4">
      <template v-if="currentOrders.length > 0">
        <Card v-for="order in currentOrders" :key="order.id" class="p-4 cursor-pointer hover:shadow-lg transition-shadow" @click="emit('navigate', 'order-detail', { order })">
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="font-medium">{{ order.orderNumber }}</p>
              <p class="text-sm text-muted-foreground">{{ order.date.toLocaleDateString('fr-FR') }}</p>
            </div>
            <Badge :class="[getStatusConfig(order.status).color, 'text-white']">{{ getStatusConfig(order.status).label }}</Badge>
          </div>

          <div class="flex gap-2 mb-3">
            <template v-for="(item, index) in order.items.slice(0, 3)" :key="index">
              <div class="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                <img :src="item.product.images[0]" :alt="item.product.name" class="w-full h-full object-cover" />
              </div>
            </template>
            <div v-if="order.items.length > 3" class="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <span class="text-sm text-muted-foreground">+{{ order.items.length - 3 }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t">
            <div class="text-sm">
              <p class="text-muted-foreground">{{ userRole === 'consumer' ? 'Vendeur' : 'Acheteur' }}</p>
              <p class="font-medium">{{ userRole === 'consumer' ? order.seller.name : order.buyer?.name }}</p>
            </div>
            <p class="font-semibold text-primary">{{ order.total.toLocaleString() }} FCFA</p>
          </div>
        </Card>
      </template>

      <div v-else class="flex flex-col items-center justify-center py-12">
        <div class="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Package class="w-12 h-12 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground text-center">
          {{ activeTab === 'in_progress' ? 'Aucune commande en cours' : activeTab === 'delivered' ? 'Aucune commande livrée' : 'Aucune commande annulée' }}
        </p>
      </div>
    </div>
  </div>
</template>
