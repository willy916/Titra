<script setup lang="ts">
import { ArrowLeft, MapPin, Phone, MessageSquare, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import type { Order } from '@/types'

const props = defineProps<{ order: Order; userRole: string }>()
const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Paiement confirmé', color: 'bg-secondary', icon: Clock },
  confirmed: { label: 'Confirmé', color: 'bg-secondary', icon: CheckCircle },
  preparing: { label: 'En préparation', color: 'bg-secondary', icon: Package },
  in_delivery: { label: 'En livraison', color: 'bg-accent', icon: Truck },
  delivered: { label: 'Livré', color: 'bg-success', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-destructive', icon: XCircle },
}

const status = statusConfig[props.order.status]

const timeline = [
  { status: 'Commande passée', date: props.order.date, completed: true },
  { status: 'Paiement confirmé', date: new Date(props.order.date.getTime() + 1000 * 60 * 5), completed: true },
  { status: 'En préparation', date: new Date(props.order.date.getTime() + 1000 * 60 * 60), completed: props.order.status !== 'pending' },
  { status: 'En livraison', date: null, completed: props.order.status === 'in_delivery' || props.order.status === 'delivered' },
  { status: 'Livré', date: null, completed: props.order.status === 'delivered' },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('')
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

    <div class="p-6 space-y-6">
      <!-- Order Status -->
      <Card class="p-4">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="font-semibold text-lg">{{ order.orderNumber }}</p>
            <p class="text-sm text-muted-foreground">{{ order.date.toLocaleDateString('fr-FR') }}</p>
          </div>
          <Badge :class="[status.color, 'text-white']">{{ status.label }}</Badge>
        </div>

        <!-- Timeline -->
        <div class="space-y-3">
          <div v-for="(step, index) in timeline" :key="index" class="flex items-start gap-3">
            <div class="flex flex-col items-center">
              <div :class="['w-3 h-3 rounded-full', step.completed ? 'bg-primary' : 'bg-muted']" />
              <div v-if="index < timeline.length - 1" :class="['w-0.5 h-8', step.completed ? 'bg-primary' : 'bg-muted']" />
            </div>
            <div class="flex-1 -mt-0.5">
              <p :class="['text-sm', step.completed ? 'font-medium' : 'text-muted-foreground']">{{ step.status }}</p>
              <p v-if="step.date && step.completed" class="text-xs text-muted-foreground">
                {{ step.date.toLocaleDateString('fr-FR') }} à {{ step.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Products -->
      <div>
        <h3 class="mb-3">Produits ({{ order.items.length }})</h3>
        <Card class="divide-y">
          <div v-for="item in order.items" :key="item.product.id" class="p-4 flex gap-4">
            <div class="w-16 h-16 bg-muted rounded-lg overflow-hidden">
              <img :src="item.product.images[0]" :alt="item.product.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <p class="font-medium">{{ item.product.name }}</p>
              <p class="text-sm text-muted-foreground">{{ item.quantity }} x {{ item.price.toLocaleString() }} FCFA</p>
            </div>
            <p class="font-semibold">{{ (item.quantity * item.price).toLocaleString() }} FCFA</p>
          </div>
        </Card>
      </div>

      <!-- Seller/Buyer Info -->
      <div>
        <h3 class="mb-3">{{ userRole === 'consumer' ? 'Vendeur' : 'Acheteur' }}</h3>
        <Card class="p-4">
          <div class="flex items-center gap-3">
            <Avatar :fallback="getInitials(userRole === 'consumer' ? order.seller.name : order.buyer?.name || '')" class="w-12 h-12" />
            <div class="flex-1">
              <p class="font-medium">{{ userRole === 'consumer' ? order.seller.name : order.buyer?.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <MapPin class="w-3 h-3 text-muted-foreground" />
                <span class="text-xs text-muted-foreground">Abidjan</span>
              </div>
            </div>
            <div class="flex gap-2">
              <Button size="icon" variant="outline" @click="emit('navigate', 'chat', { user: userRole === 'consumer' ? order.seller : order.buyer })">
                <MessageSquare class="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Phone class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Delivery Address -->
      <div>
        <h3 class="mb-3">Adresse de livraison</h3>
        <Card class="p-4">
          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p class="font-medium">{{ order.deliveryAddress }}</p>
              <p class="text-sm text-muted-foreground mt-1">{{ order.paymentMethod }}</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Order Summary -->
      <Card class="p-4">
        <h3 class="mb-4">Récapitulatif</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Sous-total</span>
            <span>{{ order.total.toLocaleString() }} FCFA</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Frais de livraison</span>
            <span>0 FCFA</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Commission TITRA (5%)</span>
            <span>{{ Math.round(order.total * 0.05).toLocaleString() }} FCFA</span>
          </div>
          <div class="border-t pt-2 mt-2">
            <div class="flex justify-between font-semibold">
              <span>Total</span>
              <span class="text-primary">{{ order.total.toLocaleString() }} FCFA</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Actions -->
      <div v-if="order.status !== 'delivered' && order.status !== 'cancelled'" class="flex gap-3">
        <Button variant="outline" class="flex-1">Signaler un problème</Button>
        <Button v-if="userRole !== 'consumer' && order.status === 'preparing'" class="flex-1 bg-primary">
          Marquer comme expédié
        </Button>
      </div>
    </div>
  </div>
</template>
