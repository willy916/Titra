<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ArrowLeft, MapPin, Phone, MessageSquare, Package, Truck, CheckCircle, Clock, XCircle, Loader2, Wallet, CreditCard } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useOrderStore } from '@/stores/order'
import { useWalletStore } from '@/stores/wallet'
import { toast } from 'vue-sonner'

const props = defineProps<{ order: any; userRole: string }>()
const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

const orderStore = useOrderStore()
const walletStore = useWalletStore()
const isLoading = ref(false)
const isUpdating = ref(false)
const isPaying = ref(false)
const orderDetails = ref<any>(null)

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  'EN_ATTENTE': { label: 'En attente', color: 'bg-amber-400', icon: Clock },
  'PAYEE': { label: 'Payée', color: 'bg-green-500', icon: CheckCircle },
  'EN_PREPARATION': { label: 'Préparation', color: 'bg-amber-600', icon: Package },
  'EN_COURS': { label: 'Expédiée', color: 'bg-blue-600', icon: Truck },
  'LIVREE': { label: 'Livrée', color: 'bg-green-600', icon: CheckCircle },
  'ANNULEE': { label: 'Annulée', color: 'bg-destructive', icon: XCircle },
}

async function fetchDetails() {
  isLoading.value = true
  try {
    // Determine if we need normalization (raw list item) or if it's already detailed
    const data = props.order
    
    // Normalize data locally without API call
    orderDetails.value = {
      ...data,
      orderStatus: data.status || data.orderStatus,
      buyerName: data.clientName || data.customerName || data.buyerName || 'Client',
      product: data.product?.nom ? data.product : {
        nom: data.productName || data.productNameSnapshot || 'Produit sans nom',
        photos: data.productPhoto ? [data.productPhoto] : (data.productPhotoSnapshot ? [data.productPhotoSnapshot] : []),
        categorie: data.productCategory || 'Catégorie',
        unite: data.product?.unite || (data.quantityInfo ? '' : 'unité(s)')
      },
      displayQuantity: data.quantityDisplay || data.quantityInfo || `${data.quantity || 0}`
    }
  } catch (error) {
    console.error('Error in details setup:', error)
    toast.error('Erreur lors de l\'affichage des détails')
    orderDetails.value = props.order
  } finally {
    isLoading.value = false
  }
}

async function updateStatus(newStatus: string) {
    isUpdating.value = true
    try {
        await orderStore.updateOrderStatus(orderDetails.value.id, newStatus)
        toast.success(`Statut mis à jour : ${statusConfig[newStatus].label}`)
        await fetchDetails()
    } catch (error) {
        toast.error('Erreur lors de la mise à jour du statut')
    } finally {
        isUpdating.value = false
    }
}

onMounted(() => {
  if (props.order?.id) {
    fetchDetails()
  } else {
    orderDetails.value = props.order
  }
})

const nextStatus = computed(() => {
    if (!orderDetails.value) return null
    const status = orderDetails.value.orderStatus
    
    if (props.userRole === 'processor' || props.userRole === 'merchant') {
        if (status === 'EN_ATTENTE') return { id: 'EN_PREPARATION', label: 'Préparer la commande' }
        if (status === 'EN_PREPARATION') return { id: 'EN_COURS', label: 'Expédier la commande' }
        if (status === 'EN_COURS') return { id: 'LIVREE', label: 'Confirmer la livraison' }
    } else {
        if (status === 'EN_PREPARATION') return { id: 'EN_COURS', label: 'Passer en livraison' }
        if (status === 'EN_COURS') return { id: 'LIVREE', label: 'Confirmer la livraison' }
    }
    return null
})

const canCancel = computed(() => {
    if (!orderDetails.value) return false
    const status = orderDetails.value.orderStatus
    return ['EN_ATTENTE', 'EN_PREPARATION'].includes(status)
})

const getStatus = (statusStr: string) => {
  return statusConfig[statusStr] || { label: statusStr, color: 'bg-muted', icon: Clock }
}

const canPay = computed(() => {
    if (!orderDetails.value) return false
    const status = orderDetails.value.orderStatus
    return (props.order.fromScreen === 'my-personal-orders' || props.userRole === 'consumer') && status === 'EN_ATTENTE'
})

async function retryPayment() {
    isPaying.value = true
    try {
        const paymentData = await walletStore.initiatePayment(orderDetails.value.id)
        if (paymentData.success && paymentData.paymentUrl) {
            toast.success('Redirection vers le paiement...')
            window.location.href = paymentData.paymentUrl
        } else {
            toast.error('Impossible d\'initier le paiement pour le moment')
        }
    } catch (error) {
        toast.error('Erreur lors de l\'initiation du paiement')
    } finally {
        isPaying.value = false
    }
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
      <!-- Order Tracking Progress -->
      <Card v-if="orderDetails.trackingSteps && orderDetails.trackingSteps.length > 0" class="p-5">
        <h3 class="font-semibold mb-6 flex items-center gap-2">
            <Clock class="w-4 h-4 text-primary" />
            Suivi de la commande
        </h3>
        <div class="relative pl-8 space-y-8">
            <!-- Vertical Line -->
            <div class="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted"></div>
            
            <div v-for="(step, index) in orderDetails.trackingSteps" :key="index" class="relative">
                <!-- Dot -->
                <div :class="[
                    'absolute -left-[25px] w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-300',
                    step.completed ? 'bg-primary border-primary/20' : step.active ? 'bg-white border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] animate-pulse' : 'bg-white border-muted'
                ]">
                    <CheckCircle v-if="step.completed" class="w-2.5 h-2.5 text-white" />
                    <div v-else-if="step.active" class="w-2 h-2 rounded-full bg-primary"></div>
                    <div v-else class="w-2 h-2 rounded-full bg-muted"></div>
                </div>
                
                <div class="flex flex-col">
                    <span :class="['text-sm font-semibold', step.completed || step.active ? 'text-foreground' : 'text-muted-foreground']">
                        {{ step.label }}
                    </span>
                    <span v-if="step.date" class="text-[10px] text-muted-foreground">
                        {{ new Date(step.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                    <span v-else-if="step.completed || step.active" class="text-[10px] text-muted-foreground italic">
                        {{ step.completed ? 'Étape terminée' : 'Étape actuelle' }}
                    </span>
                </div>
            </div>
        </div>
      </Card>

      <!-- Fallback Status Card if no tracking steps -->
      <Card v-else class="p-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-semibold text-lg text-primary">{{ orderDetails.orderNumber || `CMD-${orderDetails.id.slice(0,8)}` }}</p>
            <p class="text-xs text-muted-foreground">
              {{ new Date(orderDetails.orderDate || Date.now()).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
            </p>
          </div>
          <Badge :class="`${getStatus(orderDetails.orderStatus).color} text-white border-0 shadow-sm`">
            <component :is="getStatus(orderDetails.orderStatus).icon" class="w-3 h-3 mr-1" />
            {{ orderDetails.paymentStatusLabel || getStatus(orderDetails.orderStatus).label }}
          </Badge>
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
                    <span class="font-medium ml-1">{{ orderDetails.displayQuantity }} {{ orderDetails.product?.unite || '' }}</span>
                </div>
                <p class="font-bold text-primary">{{ orderDetails.totalAmount?.toLocaleString() }} F</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Delivery Info if available -->
      <div v-if="orderDetails.deliveryAddress">
        <h3 class="font-semibold mb-3 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-primary" />
            Adresse de livraison
        </h3>
        <Card class="p-4 flex items-start gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <MapPin class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-sm font-medium">{{ orderDetails.deliveryAddress }}</p>
            <p class="text-xs text-muted-foreground mt-1">Côte d'Ivoire</p>
          </div>
        </Card>
      </div>

      <!-- Seller or Buyer Info -->
      <div>
        <h3 class="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-primary" />
            Informations {{ order.fromScreen === 'my-personal-orders' ? 'vendeur' : 'client' }}
        </h3>
        <Card class="p-4">
          <div class="flex items-center gap-3">
            <Avatar :fallback="getInitials(order.fromScreen === 'my-personal-orders' ? (orderDetails.seller?.name || orderDetails.sellerName || 'Vendeur') : (orderDetails.buyerName || 'Client'))" class="w-12 h-12 border-2 border-primary/10" />
            <div class="flex-1">
              <p class="font-bold text-gray-900">{{ order.fromScreen === 'my-personal-orders' ? (orderDetails.seller?.name || orderDetails.sellerName || 'Vendeur') : (orderDetails.buyerName || 'Client') }}</p>
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
      <div v-if="nextStatus || canCancel || canPay" class="flex flex-col gap-3 pt-4">
        <div class="flex gap-3 w-full">
            <Button v-if="canCancel" variant="outline" class="flex-1 h-12" :disabled="isUpdating || isPaying" @click="updateStatus(props.userRole === 'processor' ? 'CANCELLED' : 'ANNULEE')">Annuler</Button>
            <Button v-if="nextStatus" class="flex-1 bg-primary h-12 shadow-lg shadow-primary/20" :disabled="isUpdating || isPaying" @click="updateStatus(nextStatus.id)">
                <Loader2 v-if="isUpdating" class="w-4 h-4 mr-2 animate-spin" />
                {{ nextStatus.label }}
            </Button>
        </div>
        
        <Button v-if="canPay" class="w-full bg-secondary h-12 shadow-lg shadow-secondary/20 font-bold" :disabled="isPaying || isUpdating" @click="retryPayment">
            <CreditCard v-if="!isPaying" class="w-5 h-5 mr-2" />
            <Loader2 v-else class="w-5 h-5 mr-2 animate-spin" />
            Payer maintenant
        </Button>
      </div>
    </div>
  </div>
</template>
