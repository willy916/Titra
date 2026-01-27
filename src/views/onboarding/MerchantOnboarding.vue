<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Store, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'

import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ complete: [data: any] }>()
const authStore = useAuthStore()

const step = ref(authStore.user?.currentOnboardingStep || 1)
const formData = ref({
  firstName: '', 
  lastName: '', 
  shopName: '', 
  address: '', 
  deliveryZone: '',
  buyType: 'DETAIL', // DETAIL, GROS, BOTH
  typeCommerce: '', 
  productSearched: [] as string[],
  customProducts: [] as string[],
})
const newProductInput = ref('')
const progress = computed(() => (step.value / 2) * 100)

const shopTypeOptions = [
  { value: 'Supermarché', label: 'Supermarché' },
  { value: 'Marché', label: 'Marché' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'Grossiste', label: 'Grossiste' },
  { value: 'Détaillant', label: 'Détaillant' },
  { value: 'Boutique', label: 'Boutique de quartier' },
  { value: 'Maquis', label: 'Maquis / Cantine' },
  { value: 'Autre', label: 'Autre' },
]

const productCategories = ['Tubercules', 'Céréales', 'Légumes', 'Fruits', 'Produits transformés', 'Huiles', 'Épices', 'Volailles', 'Poissons']

async function handleNext() { 
  if (step.value < 2) {
    step.value++
    authStore.setOnboardingStep(step.value)
  } else {
    try {
      // Prepare payload exactly as requested
      const payload = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        shopName: formData.value.shopName,
        address: formData.value.address,
        deliveryZone: formData.value.deliveryZone,
        buyType: formData.value.buyType,
        typeCommerce: formData.value.typeCommerce,
        productSearched: formData.value.productSearched
      }
      
      await authStore.completeMerchantProfile(payload)
      toast.success('Profil commerçant créé avec succès !')
      emit('complete', payload)
    } catch (error: any) {
      console.error("Profile creation error details:", error)
      const data = error.response?.data
      
      if (data && typeof data === 'object' && !Array.isArray(data) && !data.message) {
        // Handle flat error object: { field: message }
        Object.values(data).forEach((msg) => {
          if (typeof msg === 'string') toast.error(msg)
        })
      } else {
        const backendMessage = data?.message || data?.error || data?.body || (typeof data === 'string' ? data : null)
        toast.error(backendMessage || "Erreur lors de la création du profil")
      }
    }
  }
}

function handleBack() {
  if (step.value > 1) {
    step.value--
    authStore.setOnboardingStep(step.value)
  }
}
function toggleProduct(p: string) { const i = formData.value.productSearched.indexOf(p); if (i > -1) formData.value.productSearched.splice(i, 1); else formData.value.productSearched.push(p) }
function addCustomProduct() { if (newProductInput.value.trim()) { formData.value.customProducts.push(newProductInput.value.trim()); formData.value.productSearched.push(newProductInput.value.trim()); toast.success(`${newProductInput.value.trim()} ajouté`); newProductInput.value = '' } }
function removeCustomProduct(p: string) { formData.value.customProducts = formData.value.customProducts.filter(x => x !== p); formData.value.productSearched = formData.value.productSearched.filter(x => x !== p) }
</script>

<template>
  <div class="min-h-screen bg-background p-4 pb-8">
    <div class="max-w-md mx-auto">
      <div class="mb-8"><h1 class="text-primary mb-2">Profil Commerçant</h1><p class="text-muted-foreground">Étape {{ step }} sur 2</p><Progress :value="progress" class="mt-4" /></div>

      <div v-if="step === 1" class="space-y-6">
        <h2 class="text-primary">Informations boutique</h2>
        <div class="space-y-2"><Label>Prénom</Label><Input v-model="formData.firstName" placeholder="Votre prénom" /></div>
        <div class="space-y-2"><Label>Nom</Label><Input v-model="formData.lastName" placeholder="Votre nom" /></div>
        <div class="space-y-2"><Label>Nom de la boutique</Label><div class="relative"><Store class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input v-model="formData.shopName" placeholder="Ex: Boutique du Plateau" class="pl-10" /></div></div>
        <div class="space-y-2"><Label>Localisation boutique</Label><div class="relative"><MapPin class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input v-model="formData.address" placeholder="Ville, commune, quartier" class="pl-10" /></div></div>
        <div class="space-y-2"><Label>Zone de livraison</Label><Input v-model="formData.deliveryZone" placeholder="Ex: Abidjan - Plateau, Cocody, Marcory" /></div>
        <Button class="w-full" :disabled="!formData.firstName || !formData.lastName || !formData.shopName || !formData.address" @click="handleNext">Continuer</Button>
      </div>

      <div v-else class="space-y-6">
        <h2 class="text-primary">Préférences d'achat</h2>
        <div class="space-y-3">
          <Label>Type d'achat</Label>
          <RadioGroup v-model="formData.buyType">
            <div class="flex items-center space-x-2"><RadioGroupItem value="DETAIL" id="detail" /><Label for="detail" class="font-normal cursor-pointer">Détail (petites quantités)</Label></div>
            <div class="flex items-center space-x-2"><RadioGroupItem value="GROS" id="gross" /><Label for="gross" class="font-normal cursor-pointer">Gros (grandes quantités)</Label></div>
            <div class="flex items-center space-x-2"><RadioGroupItem value="BOTH" id="both" /><Label for="both" class="font-normal cursor-pointer">Les deux</Label></div>
          </RadioGroup>
        </div>
        <div class="space-y-2"><Label>Type de commerce</Label><Select v-model="formData.typeCommerce" :options="shopTypeOptions.map(o => ({ value: o.label, label: o.label }))" placeholder="Sélectionnez" /></div>
        <div class="space-y-2"><Label>Produits recherchés</Label><p class="text-sm text-muted-foreground">Sélectionnez ou ajoutez vos produits</p></div>
        <div class="space-y-2"><Label>Ajouter un produit personnalisé</Label><div class="flex gap-2"><Input v-model="newProductInput" placeholder="Ex: Pommes de terre, Tomates..." @keypress.enter.prevent="addCustomProduct" /><Button @click="addCustomProduct"><Plus class="w-4 h-4" /></Button></div><p class="text-xs text-muted-foreground">Le produit sera automatiquement ajouté à votre liste</p></div>
        <div v-if="formData.customProducts.length > 0" class="space-y-2"><Label>Produits personnalisés ajoutés</Label><div class="flex flex-wrap gap-2"><Badge v-for="p in formData.customProducts" :key="p" class="cursor-pointer bg-primary hover:bg-primary/80" @click="removeCustomProduct(p)">{{ p }} ✕</Badge></div></div>
        <div class="space-y-2"><Label>Catégories standards</Label><div class="flex flex-wrap gap-2"><Badge v-for="p in productCategories" :key="p" :variant="formData.productSearched.includes(p) ? 'default' : 'outline'" class="cursor-pointer" @click="toggleProduct(p)">{{ p }}</Badge></div></div>
        <div class="flex gap-2"><Button variant="outline" class="flex-1" @click="handleBack">Retour</Button><Button class="flex-1" :disabled="!formData.typeCommerce || formData.productSearched.length === 0" @click="handleNext">Terminer</Button></div>
      </div>
    </div>
  </div>
</template>
