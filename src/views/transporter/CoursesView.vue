<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, MapPin, Navigation, Package, Phone, CheckCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const isLoading = ref(true)
const activeTab = ref<'active' | 'completed'>('active')

onMounted(() => { setTimeout(() => isLoading.value = false, 1200) })

const activeCourses = [
  { id: '1', pickup: 'Yamoussoukro - Village Koffikro', delivery: 'Abidjan - Adjamé', product: 'Igname (150kg)', price: 25000, distance: '248 km', status: 'En cours', customer: 'Koné Ibrahim', customerPhone: '+225 07 XX XX XX XX' },
  { id: '2', pickup: 'Bouaké - Marché central', delivery: 'Abidjan - Plateau', product: 'Attiéké (80kg)', price: 18000, distance: '356 km', status: 'Récupéré', customer: 'Boutique Plateau', customerPhone: '+225 05 XX XX XX XX' },
]

const completedCourses = [
  { id: '3', pickup: 'Daloa', delivery: 'Abidjan - Cocody', product: 'Tomates (100kg)', price: 22000, distance: '428 km', completedDate: 'Aujourd\'hui 10:30', customer: 'Restaurant Abidjan' },
  { id: '4', pickup: 'San-Pédro', delivery: 'Abidjan - Marcory', product: 'Poissons frais (50kg)', price: 15000, distance: '312 km', completedDate: 'Hier 16:45', customer: 'Marché Marcory' },
]

const handleConfirmDelivery = (courseId: string) => {
  toast.success('Livraison confirmée !', { description: 'Le paiement sera traité' })
}

const handleConfirmPickup = (courseId: string) => {
  toast.success('Récupération confirmée !', { description: 'Dirigez-vous vers le point de livraison' })
}
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6">
      <div class="flex items-center gap-4">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-white text-2xl">Mes courses</h1>
          <p class="text-white/80 text-sm">{{ activeCourses.length }} courses en cours</p>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Tabs -->
      <div class="w-full grid grid-cols-2 bg-muted rounded-lg p-1 mb-4">
        <button 
          @click="activeTab = 'active'" 
          :class="['py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'active' ? 'bg-background shadow' : 'text-muted-foreground']"
        >En cours ({{ activeCourses.length }})</button>
        <button 
          @click="activeTab = 'completed'" 
          :class="['py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'completed' ? 'bg-background shadow' : 'text-muted-foreground']"
        >Terminées</button>
      </div>

      <!-- Skeleton Loading -->
      <template v-if="isLoading">
        <div class="space-y-3">
          <Card v-for="i in 3" :key="i" class="p-4 animate-pulse">
            <div class="flex items-start justify-between mb-3">
              <div class="h-6 w-20 bg-muted rounded"></div>
              <div class="h-6 w-24 bg-muted rounded"></div>
            </div>
            <div class="space-y-2 mb-4">
              <div class="flex gap-2">
                <div class="w-4 h-4 bg-muted rounded"></div>
                <div class="flex-1">
                  <div class="h-4 w-20 bg-muted rounded mb-1"></div>
                  <div class="h-4 w-48 bg-muted rounded"></div>
                </div>
              </div>
              <div class="flex gap-2">
                <div class="w-4 h-4 bg-muted rounded"></div>
                <div class="flex-1">
                  <div class="h-4 w-16 bg-muted rounded mb-1"></div>
                  <div class="h-4 w-40 bg-muted rounded"></div>
                </div>
              </div>
            </div>
            <div class="h-16 bg-muted rounded mb-3"></div>
            <div class="h-10 bg-muted rounded"></div>
          </Card>
        </div>
      </template>

      <!-- Active Courses -->
      <template v-else-if="activeTab === 'active'">
        <div class="space-y-3">
          <Card v-for="course in activeCourses" :key="course.id" class="p-4">
            <div class="flex items-start justify-between mb-3">
              <Badge :variant="course.status === 'En cours' ? 'default' : 'secondary'">{{ course.status }}</Badge>
              <p class="font-medium text-primary">{{ course.price.toLocaleString() }} F</p>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex gap-2">
                <Navigation class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium">Récupération</p>
                  <p class="text-sm text-muted-foreground">{{ course.pickup }}</p>
                </div>
              </div>
              
              <div class="flex gap-2">
                <MapPin class="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium">Livraison</p>
                  <p class="text-sm text-muted-foreground">{{ course.delivery }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t">
                <span class="text-sm text-muted-foreground">{{ course.product }}</span>
                <span class="text-sm font-medium">{{ course.distance }}</span>
              </div>
            </div>

            <!-- Customer info -->
            <Card class="p-3 bg-muted/50 mb-3">
              <p class="text-xs text-muted-foreground mb-1">Client</p>
              <div class="flex items-center justify-between">
                <p class="font-medium">{{ course.customer }}</p>
                <Button size="sm" variant="outline">
                  <Phone class="w-4 h-4 mr-2" />Appeler
                </Button>
              </div>
            </Card>

            <Button
              v-if="course.status === 'Récupéré'"
              class="w-full"
              @click="handleConfirmDelivery(course.id)"
            >
              <CheckCircle class="w-4 h-4 mr-2" />Confirmer la livraison
            </Button>

            <Button
              v-else
              class="w-full"
              variant="outline"
              @click="handleConfirmPickup(course.id)"
            >J'ai récupéré le colis</Button>
          </Card>
        </div>
      </template>

      <!-- Completed Courses -->
      <template v-else>
        <div class="space-y-3">
          <Card v-for="course in completedCourses" :key="course.id" class="p-4">
            <div class="flex items-start justify-between mb-3">
              <Badge class="bg-green-600">Terminée</Badge>
              <p class="font-medium text-primary">+{{ course.price.toLocaleString() }} F</p>
            </div>

            <div class="space-y-2 mb-3">
              <div class="flex gap-2">
                <Navigation class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm text-muted-foreground">{{ course.pickup }}</p>
                </div>
              </div>
              
              <div class="flex gap-2">
                <MapPin class="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm text-muted-foreground">{{ course.delivery }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t">
                <span class="text-sm text-muted-foreground">{{ course.product }}</span>
                <span class="text-sm">{{ course.distance }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Client : {{ course.customer }}</span>
              <span class="text-muted-foreground">{{ course.completedDate }}</span>
            </div>
          </Card>
        </div>
      </template>
    </div>
  </div>
</template>
