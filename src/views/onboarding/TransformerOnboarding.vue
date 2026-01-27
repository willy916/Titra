<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MapPin, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'
import { useAuthStore } from '@/stores/auth'
import { useTransformerStore } from '@/stores/transformer'

interface FormData {
  firstName: string
  lastName: string
  workshopName: string
  location: string
  filiereId: string
  productsTransformed: string[]
  customProducts: string[]
  capacity: string
  capacityUnit: string
  certification: string
}

const emit = defineEmits<{
  complete: [data: any]
}>()

const authStore = useAuthStore()
const transformerStore = useTransformerStore()

const step = ref(authStore.user?.currentOnboardingStep || 1)
const formData = ref<FormData>({
  firstName: '',
  lastName: '',
  workshopName: '',
  location: '',
  filiereId: '',
  productsTransformed: [],
  customProducts: [],
  capacity: '',
  capacityUnit: 'kg/mois',
  certification: '',
})

const newProductInput = ref('')
const progress = computed(() => (step.value / 3) * 100)

onMounted(async () => {
  try {
    await transformerStore.fetchFilieres()
  } catch (error) {
    toast.error('Erreur lors de la récupération des filières')
  }
})

const filiereOptions = computed(() => 
  transformerStore.filieres.map(f => ({
    value: f.id,
    label: f.libelle
  }))
)

const capacityUnitOptions = [
  { value: 'kg/mois', label: 'kg/mois' },
  { value: 'tonnes/mois', label: 'tonnes/mois' },
  { value: 'litres/mois', label: 'litres/mois' },
  { value: 'sacs/mois', label: 'sacs/mois' },
  { value: 'unités/mois', label: 'unités/mois' },
  { value: 'kg/an', label: 'kg/an' },
  { value: 'tonnes/an', label: 'tonnes/an' },
]

const suggestedProducts = computed(() => {
  const selectedFiliere = transformerStore.filieres.find(f => f.id === formData.value.filiereId)
  return selectedFiliere?.produits || []
})

function handleBack() {
  if (step.value > 1) {
    step.value--
    authStore.setOnboardingStep(step.value)
  }
}

async function handleNext() {
  if (step.value < 3) {
    step.value++
    authStore.setOnboardingStep(step.value)
  } else {
    try {
      const payload = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        nomAtelier: formData.value.workshopName,
        addresse: formData.value.location,
        filiereId: formData.value.filiereId,
        productionCapacity: parseInt(formData.value.capacity) || 0,
        productionUnit: formData.value.capacityUnit,
        productName: [...formData.value.productsTransformed],
        agrement: formData.value.certification
      }
      
      const response = await transformerStore.completeProfile(payload)
      toast.success('Profil transformateur créé avec succès !')
      
      // Update local user state
      if (authStore.user) {
        authStore.user.name = `${payload.firstName} ${payload.lastName}`
        authStore.user.onboardingCompleted = true
        authStore.user.matricule = response.matricule || response.code // Server returns matricule according to doc
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }
      
      emit('complete', response)
    } catch (error: any) {
      console.error("Transformer profile creation error details:", error)
      const data = error.response?.data
      
      if (data && typeof data === 'object' && !Array.isArray(data) && !data.message) {
        Object.values(data).forEach((msg) => {
          if (typeof msg === 'string') toast.error(msg)
        })
      } else {
        const backendMessage = data?.message || data?.error || data?.body || (typeof data === 'string' ? data : null)
        toast.error(backendMessage || "Erreur lors de la création du profil transformateur")
      }
    }
  }
}

function toggleProduct(product: string) {
  const idx = formData.value.productsTransformed.indexOf(product)
  if (idx > -1) formData.value.productsTransformed.splice(idx, 1)
  else formData.value.productsTransformed.push(product)
}

function addCustomProduct() {
  if (newProductInput.value.trim()) {
    const product = newProductInput.value.trim()
    if (!formData.value.customProducts.includes(product)) {
      formData.value.customProducts.push(product)
    }
    if (!formData.value.productsTransformed.includes(product)) {
      formData.value.productsTransformed.push(product)
    }
    toast.success(`${product} ajouté à vos produits`)
    newProductInput.value = ''
  }
}

function removeCustomProduct(product: string) {
  formData.value.customProducts = formData.value.customProducts.filter(p => p !== product)
  formData.value.productsTransformed = formData.value.productsTransformed.filter(p => p !== product)
}

function getFiliereLabel(id: string) {
  return transformerStore.filieres.find(f => f.id === id)?.libelle || ''
}

const isStep1Valid = computed(() => formData.value.firstName && formData.value.lastName && formData.value.workshopName)
const isStep2Valid = computed(() => formData.value.location && formData.value.filiereId && formData.value.capacity)
const isStep3Valid = computed(() => formData.value.productsTransformed.length > 0)
</script>

<template>
  <div class="min-h-screen bg-background p-4 pb-8">
    <div class="max-w-md mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-primary mb-2">Profil Transformateur</h1>
        <p class="text-muted-foreground">Étape {{ step }} sur 3</p>
        <Progress :value="progress" class="mt-4" />
      </div>

      <!-- Step 1: Informations personnelles -->
      <div v-if="step === 1" class="space-y-6">
        <h2 class="text-primary">Informations personnelles</h2>

        <div class="space-y-2">
          <Label for="firstName">Prénom</Label>
          <Input id="firstName" v-model="formData.firstName" placeholder="Votre prénom" />
        </div>

        <div class="space-y-2">
          <Label for="lastName">Nom</Label>
          <Input id="lastName" v-model="formData.lastName" placeholder="Votre nom" />
        </div>

        <div class="space-y-2">
          <Label for="workshopName">Nom de l'atelier</Label>
          <Input id="workshopName" v-model="formData.workshopName" placeholder="Ex: Atelier Abidjannaise" />
        </div>

        <Button class="w-full" :disabled="!isStep1Valid" @click="handleNext">Continuer</Button>
      </div>

      <!-- Step 2: Localisation et filière -->
      <div v-else-if="step === 2" class="space-y-6">
        <h2 class="text-primary">Localisation et filière</h2>

        <div class="space-y-2">
          <Label for="location">Localisation</Label>
          <div class="relative">
            <MapPin class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input id="location" v-model="formData.location" placeholder="Ville, commune, quartier" class="pl-10" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="filiere">Filière principale</Label>
          <Select v-model="formData.filiereId" :options="filiereOptions" placeholder="Sélectionnez votre filière" />
        </div>

        <div class="space-y-2">
          <Label for="capacity">Capacité de production</Label>
          <div class="flex gap-2">
            <Input id="capacity" v-model="formData.capacity" type="number" placeholder="Ex: 5000" class="flex-1" />
            <Select v-model="formData.capacityUnit" :options="capacityUnitOptions" class="w-[140px]" />
          </div>
        </div>

        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" @click="handleBack">Retour</Button>
          <Button class="flex-1" :disabled="!isStep2Valid" @click="handleNext">Continuer</Button>
        </div>
      </div>

      <!-- Step 3: Produits transformés -->
      <div v-else class="space-y-6">
        <h2 class="text-primary">Produits transformés</h2>
        <p class="text-muted-foreground text-sm">Sélectionnez ou ajoutez vos produits transformés</p>

        <!-- Add custom product -->
        <div class="space-y-2">
          <Label>Ajouter un produit personnalisé</Label>
          <div class="flex gap-2">
            <Input v-model="newProductInput" placeholder="Ex: Pâte d'arachide, Gari..." @keypress.enter.prevent="addCustomProduct" />
            <Button @click="addCustomProduct" class="bg-primary hover:bg-primary/90"><Plus class="w-4 h-4" /></Button>
          </div>
          <p class="text-xs text-muted-foreground">Le produit sera automatiquement ajouté à la base de données</p>
        </div>

        <!-- Custom products -->
        <div v-if="formData.customProducts.length > 0" class="space-y-2">
          <Label>Produits personnalisés ajoutés</Label>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="product in formData.customProducts" :key="product" class="cursor-pointer bg-primary hover:bg-primary/80" @click="removeCustomProduct(product)">
              {{ product }} ✕
            </Badge>
          </div>
        </div>

        <!-- Standard products -->
        <div v-if="suggestedProducts.length > 0" class="space-y-2">
          <Label>Produits standards pour {{ getFiliereLabel(formData.filiereId) }}</Label>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="product in suggestedProducts" :key="product" :variant="formData.productsTransformed.includes(product) ? 'default' : 'outline'" class="cursor-pointer" @click="toggleProduct(product)">
              {{ product }}
            </Badge>
          </div>
        </div>

        <div v-else class="bg-muted/50 p-4 rounded-lg border border-dashed">
          <p class="text-sm text-muted-foreground text-center">Aucun produit standard pour cette filière. Utilisez le champ ci-dessus pour ajouter vos produits.</p>
        </div>

        <div class="space-y-2">
          <Label for="certification">Certification / Agrément</Label>
          <Input id="certification" v-model="formData.certification" placeholder="Ex: Agrément sanitaire n°..." />
        </div>

        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" @click="handleBack">Retour</Button>
          <Button class="flex-1" :disabled="!isStep3Valid" :isLoading="transformerStore.isLoading" @click="handleNext">Terminer</Button>
        </div>
      </div>
    </div>
  </div>
</template>
