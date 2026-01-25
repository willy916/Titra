<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, MapPin, Phone, MessageSquare, Package, Truck, CheckCircle, Clock, XCircle, Loader2, Wallet } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useOrderStore } from '@/stores/order'
import { toast } from 'vue-sonner'

const props = defineProps<{ order: any; userRole: string }>()
const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

const orderStore = useOrderStore()
const isLoading = ref(false)
const orderDetails = ref<any>(null)

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  'EN_PREPARATION': { label: 'En préparation', color: 'bg-amber-500', icon: Package },
  'EN_COURS': { label: 'En cours de livraison', color: 'bg-blue-500', icon: Truck },
  'LIVREE': { label: 'Livrée', color: 'bg-green-600', icon: CheckCircle },
  'ANNULEE': { label: 'Annulée', color: 'bg-destructive', icon: XCircle },
}

async function fetchDetails() {
  isLoading.value = true
  try {
    const data = await orderStore.fetchOrderDetails(props.order.id)
    orderDetails.value = data
  } catch (error) {
    console.error('Error fetching order details:', error)
    toast.error('Erreur lors du chargement des détails')
    // Fallback to prop data if API fails but we have basic info
    orderDetails.value = props.order
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (props.order?.id) {
    fetchDetails()
  } else {
    orderDetails.value = props.order
  }
})

const getStatus = (statusStr: string) => {
  return statusConfig[statusStr] || { label: statusStr, color: 'bg-muted', icon: Clock }
}

function getInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b p-4">
      <button @click="emit('back')" class="flex items-center gap-2">
        <ArrowLeft class="w-5 h-5" />
        <span>Détails de la commande</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-12">
      <Loader2 class="w-10 h-10 text-primary animate-spin mb-4" />
      <p class="text-muted-foreground">Chargement des détails...</p>
    </div>

    <div v-else-if="orderDetails" class="p-6 space-y-6">
      <!-- Order Status -->
      <Card class="p-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-semibold text-lg text-primary">{{ orderDetails.orderNumber }}</p>
            <p class="text-xs text-muted-foreground">
              {{ new Date(orderDetails.orderDate || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
            </p>
          </div>
          <Badge :class="`${getStatus(orderDetails.orderStatus).color} text-white border-0 shadow-sm`">
            <component :is="getStatus(orderDetails.orderStatus).icon" class="w-3 h-3 mr-1" />
            {{ getStatus(orderDetails.orderStatus).label }}
          </Badge>
        </div>

        <!-- Progress -->
        <div class="pt-4 border-t border-dashed">
            <div class="flex items-center gap-3">
                <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${getStatus(orderDetails.orderStatus).color} text-white shadow-lg animate-pulse`">
                    <component :is="getStatus(orderDetails.orderStatus).icon" class="w-4 h-4" />
                </div>
                <div>
                    <p class="font-medium text-sm">Statut actuel: {{ getStatus(orderDetails.orderStatus).label }}</p>
                    <p class="text-xs text-muted-foreground">Dernière mise à jour: Aujourd'hui</p>
                </div>
            </div>
        </div>
      </Card>

      <!-- Products -->
      <div>
        <h3 class="font-semibold mb-3 flex items-center gap-2">
            <Package class="w-4 h-4 text-primary" />
            Détails du produit
        </h3>
        <Card class="p-4">
          <div class="flex gap-4">
            <div class="w-20 h-20 bg-muted rounded-xl overflow-hidden shadow-inner shrink-0">
              <img 
                :src="orderDetails.product?.photos?.[0] || 'https://images.unsplash.com/photo-1586771107445-d3ca888129ee?w=400&h=400&fit=crop'" 
                :alt="orderDetails.product?.nom" 
                class="w-full h-full object-cover" 
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 truncate">{{ orderDetails.product?.nom || 'Produit sans nom' }}</p>
              <p class="text-xs text-muted-foreground mb-2">{{ orderDetails.product?.categorie }}</p>
              <div class="flex justify-between items-end">
                <div class="text-sm">
                    <span class="text-muted-foreground">Quantité:</span>
                    <span class="font-medium ml-1">{{ orderDetails.quantity }} {{ orderDetails.product?.unite || 'unité(s)' }}</span>
                </div>
                <p class="font-bold text-primary">{{ orderDetails.totalAmount?.toLocaleString() }} F</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Buyer Info -->
      <div>
        <h3 class="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-primary" />
            Informations client
        </h3>
        <Card class="p-4">
          <div class="flex items-center gap-3">
            <Avatar :fallback="getInitials(orderDetails.buyerName || 'Client')" class="w-12 h-12 border-2 border-primary/10" />
            <div class="flex-1">
              <p class="font-bold text-gray-900">{{ orderDetails.buyerName || 'Client' }}</p>
              <div class="flex items-center gap-2 mt-1">
                <MapPin class="w-3 h-3 text-muted-foreground" />
                <span class="text-xs text-muted-foreground">Côte d'Ivoire</span>
              </div>
            </div>
            <div class="flex gap-2">
              <Button size="icon" variant="outline" class="rounded-full h-10 w-10 hover:bg-primary/5">
                <MessageSquare class="w-4 h-4 text-primary" />
              </Button>
              <Button size="icon" variant="outline" class="rounded-full h-10 w-10 hover:bg-primary/5">
                <Phone class="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Summary -->
      <Card class="p-5 bg-primary/5 border-primary/10">
        <h3 class="font-bold mb-4 flex items-center gap-2">
            <Wallet class="w-4 h-4 text-primary" />
            Récapitulatif financier
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Prix unitaire</span>
            <span class="font-medium">{{ orderDetails.unitPrice?.toLocaleString() }} F</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-primary/10">
            <span class="text-muted-foreground">Sous-total</span>
            <span class="font-medium">{{ (Number(orderDetails.unitPrice || 0) * Number(orderDetails.quantity || 0))?.toLocaleString() }} F</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Frais de plateforme</span>
            <span class="text-destructive font-medium">- 0 F</span>
          </div>
          <div class="border-t border-primary/20 pt-3 mt-2">
            <div class="flex justify-between items-center font-bold">
              <span class="text-gray-900">Total à percevoir</span>
              <span class="text-xl text-primary">{{ orderDetails.totalAmount?.toLocaleString() }} FCFA</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Actions -->
      <div v-if="orderDetails.orderStatus === 'EN_PREPARATION' || orderDetails.orderStatus === 'EN_COURS'" class="flex gap-3 pt-4">
        <Button variant="outline" class="flex-1 h-12">Annuler</Button>
        <Button class="flex-1 bg-primary h-12 shadow-lg shadow-primary/20">
          {{ orderDetails.orderStatus === 'EN_PREPARATION' ? 'Passer en livraison' : 'Confirmer la livraison' }}
        </Button>
      </div>
    </div>
  </div>
</template>
