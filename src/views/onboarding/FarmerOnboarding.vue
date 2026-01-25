<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, MapPin, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Progress from '@/components/ui/Progress.vue'
import Select from '@/components/ui/Select.vue'
import Badge from '@/components/ui/Badge.vue'
import RadioGroup from '@/components/ui/RadioGroup.vue'
import RadioGroupItem from '@/components/ui/RadioGroupItem.vue'
import ProfilePhotoUpload from '@/components/onboarding/ProfilePhotoUpload.vue'
import InstitutionalAffiliationStep from '@/components/onboarding/InstitutionalAffiliationStep.vue'

interface FormData {
  firstName: string
  lastName: string
  location: string
  photo: string
  affiliationId: string
  affiliationName: string
  affiliationType: string
  activityType: 'agriculture' | 'livestock' | 'mixed' | ''
  products: string[]
  customProducts: string[]
  surfaceArea: string
  surfaceUnit: 'hectare' | 'are' | 'm2' | 'custom'
  customSurfaceUnit: string
}

const emit = defineEmits<{
  complete: [data: FormData]
}>()

const authStore = useAuthStore()
const step = ref(authStore.user?.currentOnboardingStep || 1)
const totalSteps = 4

const formData = ref<FormData>({
  firstName: '',
  lastName: '',
  location: '',
  photo: '',
  affiliationId: '',
  affiliationName: '',
  affiliationType: '',
  activityType: '',
  products: [],
  customProducts: [],
  surfaceArea: '',
  surfaceUnit: 'hectare',
  customSurfaceUnit: '',
})

const newProductInput = ref('')
const progress = computed(() => (step.value / totalSteps) * 100)

const surfaceUnitOptions = [
  { value: 'hectare', label: 'Hectare' },
  { value: 'are', label: 'Are' },
  { value: 'm2', label: 'm²' },
  { value: 'custom', label: 'Autre' },
]

const availableProducts = {
  agriculture: ['Igname', 'Manioc', 'Banane Plantain', 'Riz', 'Maïs', 'Tomate', 'Oignon', 'Piment', 'Gombo', 'Aubergine', 'Cacao', 'Café', 'Anacarde', 'Hévéa', 'Palmier à huile'],
  livestock: ['Poulets', 'Moutons', 'Chèvres', 'Bœufs', 'Porcs', 'Poissons', 'Œufs', 'Lait', 'Miel'],
  mixed: [] as string[]
}

const displayProducts = computed(() => {
  if (formData.value.activityType === 'mixed') return [...availableProducts.agriculture, ...availableProducts.livestock]
  if (formData.value.activityType === 'agriculture') return availableProducts.agriculture
  if (formData.value.activityType === 'livestock') return availableProducts.livestock
  return []
})

watch(() => formData.value.activityType, () => { formData.value.products = [] })

function handleBack() { 
  if (step.value > 1) {
    step.value--
    authStore.setOnboardingStep(step.value)
  }
}

async function handleNext() {
  if (step.value === 1 && (!formData.value.firstName || !formData.value.lastName || !formData.value.location)) {
    toast.error('Veuillez remplir tous les champs'); return
  }
  if (step.value === 2 && !formData.value.affiliationId) {
    toast.error('Veuillez sélectionner votre affiliation'); return
  }
  if (step.value === 3 && !formData.value.activityType) {
    toast.error("Veuillez choisir votre type d'activité"); return
  }
  
  if (step.value < totalSteps) {
    step.value++
    authStore.setOnboardingStep(step.value)
  } else {
    try {
      // 1. Complete Profile
      await authStore.completePaysanProfile(formData.value)
      
      // 2. Upload photo if present (if it's a File or base64)
      // Note: formData.value.photo might be a blob URL or base64 from ProfilePhotoUpload
      // In a real app, ProfilePhotoUpload would provide the raw File
      // For now, only call if we have a valid photo type
      
      toast.success('Profil complété avec succès !')
      emit('complete', formData.value)
    } catch (error: any) {
      console.error('Registration error:', error)
      const responseData = error.response?.data
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        responseData.errors.forEach((err: any) => {
          toast.error(err.defaultMessage || 'Erreur de validation')
        })
      } else if (responseData?.message) {
        toast.error(responseData.message)
      } else {
        toast.error('Une erreur est survenue lors de la création de votre profil')
      }
    }
  }
}

function handleAffiliationSelect(id: string, name: string, type: string) {
  formData.value.affiliationId = id
  formData.value.affiliationName = name
  formData.value.affiliationType = type
}

function toggleProduct(product: string) {
  const idx = formData.value.products.indexOf(product)
  if (idx > -1) formData.value.products.splice(idx, 1)
  else formData.value.products.push(product)
}

function addCustomProduct() {
  if (newProductInput.value.trim()) {
    formData.value.customProducts.push(newProductInput.value.trim())
    toast.success(`${newProductInput.value} ajouté à la base de produits`)
    newProductInput.value = ''
  }
}

function removeCustomProduct(product: string) {
  formData.value.customProducts = formData.value.customProducts.filter(p => p !== product)
}

async function handlePhotoUpload(file: File) {
  try {
    const response = await authStore.uploadAvatar(file)
    toast.success('Photo enregistrée avec succès')
    // The photo URL returned by the API is already handled in authStore.uploadAvatar
    // but we update the local preview if needed
    if (response?.body) {
      formData.value.photo = response.body
    }
  } catch (error) {
    toast.error('Erreur lors de l\'enregistrement de la photo')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <div class="p-4 border-b">
      <div class="flex items-center gap-4">
        <button v-if="step > 1" class="text-muted-foreground hover:text-foreground" @click="handleBack"><ArrowLeft class="w-5 h-5" /></button>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-muted-foreground">Étape {{ step }} sur {{ totalSteps }}</span>
            <span class="text-sm text-muted-foreground">{{ Math.round(progress) }}%</span>
          </div>
          <Progress :value="progress" class="h-2" />
        </div>
      </div>
    </div>

    <div class="flex-1 p-6 max-w-md w-full mx-auto overflow-y-auto pb-24">
      <!-- Step 1 -->
      <div v-if="step === 1" class="space-y-6">
        <div class="space-y-2"><h2>Informations personnelles</h2><p class="text-sm text-muted-foreground">Complétez vos informations de base</p></div>
        <div class="space-y-4">
          <div class="space-y-2"><Label>Prénom</Label><Input v-model="formData.firstName" placeholder="Votre prénom" /></div>
          <div class="space-y-2"><Label>Nom</Label><Input v-model="formData.lastName" placeholder="Votre nom" /></div>
          <div class="space-y-2">
            <Label>Localisation</Label>
            <div class="relative"><MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input v-model="formData.location" placeholder="Ville ou région" class="pl-10" /></div>
          </div>
          <ProfilePhotoUpload 
            :photo="formData.photo" 
            label="Photo de profil (optionnel)" 
            @update:photo="formData.photo = $event"
            @select-file="handlePhotoUpload"
          />
        </div>
      </div>

      <!-- Step 2 -->
      <div v-else-if="step === 2" class="space-y-6">
        <div class="space-y-2"><h2>Affiliation institutionnelle</h2><p class="text-sm text-muted-foreground">Sélectionnez votre Coopérative ou Association</p></div>
        <InstitutionalAffiliationStep user-role="farmer" :selected-affiliation="formData.affiliationId" :can-be-independent="true" @select="handleAffiliationSelect" />
      </div>

      <!-- Step 3 -->
      <div v-else-if="step === 3" class="space-y-6">
        <div class="space-y-2"><h2>Type d'activité</h2><p class="text-sm text-muted-foreground">Sélectionnez votre domaine d'activité principal</p></div>
        <div class="space-y-4">
          <RadioGroup :model-value="formData.activityType" @update:model-value="(v: string) => formData.activityType = v as any">
            <div class="flex items-center space-x-2 border rounded-lg p-4">
              <RadioGroupItem value="agriculture" id="agriculture" />
              <Label for="agriculture" class="flex-1 cursor-pointer"><div><div class="font-medium">Agriculture / Culture</div><div class="text-sm text-muted-foreground">Cultures végétales, céréales, tubercules, etc.</div></div></Label>
            </div>
            <div class="flex items-center space-x-2 border rounded-lg p-4">
              <RadioGroupItem value="livestock" id="livestock" />
              <Label for="livestock" class="flex-1 cursor-pointer"><div><div class="font-medium">Élevage</div><div class="text-sm text-muted-foreground">Animaux, volailles, poissons, produits laitiers</div></div></Label>
            </div>
            <div class="flex items-center space-x-2 border rounded-lg p-4">
              <RadioGroupItem value="mixed" id="mixed" />
              <Label for="mixed" class="flex-1 cursor-pointer"><div><div class="font-medium">Mixte</div><div class="text-sm text-muted-foreground">Agriculture et élevage</div></div></Label>
            </div>
          </RadioGroup>
          <div v-if="formData.activityType" class="space-y-4">
            <div class="space-y-2">
              <Label>Surface cultivée</Label>
              <div class="flex gap-2">
                <Input v-model="formData.surfaceArea" type="number" placeholder="Ex: 2.5" class="flex-1" />
                <Select v-model="formData.surfaceUnit" :options="surfaceUnitOptions" class="w-32" />
              </div>
            </div>
            <div v-if="formData.surfaceUnit === 'custom'" class="space-y-2">
              <Label>Précisez l'unité</Label>
              <Input v-model="formData.customSurfaceUnit" placeholder="Ex: Arpent, Carré, etc." />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4 -->
      <div v-else class="space-y-6">
        <div class="space-y-2"><h2>Vos produits</h2><p class="text-sm text-muted-foreground">Sélectionnez ou ajoutez vos produits</p></div>
        <div class="space-y-2">
          <Label>Ajouter un produit personnalisé</Label>
          <div class="flex gap-2"><Input v-model="newProductInput" placeholder="Ex: Avocat, Mangue..." @keypress.enter.prevent="addCustomProduct" /><Button @click="addCustomProduct"><Plus class="w-4 h-4" /></Button></div>
          <p class="text-xs text-muted-foreground">Le produit sera automatiquement ajouté à la base de données</p>
        </div>
        <div v-if="formData.customProducts.length > 0" class="space-y-2">
          <Label>Produits personnalisés ajoutés</Label>
          <div class="flex flex-wrap gap-2"><Badge v-for="p in formData.customProducts" :key="p" class="cursor-pointer bg-primary hover:bg-primary/80" @click="removeCustomProduct(p)">{{ p }} ✕</Badge></div>
        </div>
        <div class="space-y-2">
          <Label>Produits standards</Label>
          <div class="flex flex-wrap gap-2"><Badge v-for="p in displayProducts" :key="p" :variant="formData.products.includes(p) ? 'default' : 'outline'" class="cursor-pointer" @click="toggleProduct(p)">{{ p }}</Badge></div>
        </div>
        <div v-if="formData.products.length > 0 || formData.customProducts.length > 0" class="p-4 bg-success/10 border border-success/20 rounded-lg">
          <p class="text-sm text-success">✓ {{ formData.products.length + formData.customProducts.length }} produit(s) sélectionné(s)</p>
        </div>
      </div>
    </div>

    <div class="p-6 border-t bg-background sticky bottom-0">
      <Button 
        class="w-full h-12" 
        :loading="authStore.isLoading"
        :disabled="authStore.isLoading"
        @click="handleNext"
      >
        {{ step === totalSteps ? 'Terminer' : 'Continuer' }}
      </Button>
    </div>
  </div>
</template>
