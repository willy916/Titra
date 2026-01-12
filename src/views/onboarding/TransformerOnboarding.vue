<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'

interface FormData {
  firstName: string
  lastName: string
  workshopName: string
  location: string
  filiere: string
  customFiliere: string
  productsTransformed: string[]
  customProducts: string[]
  capacity: string
  capacityUnit: string
  customCapacityUnit: string
  certification: string
}

const emit = defineEmits<{
  complete: [data: FormData]
}>()

const step = ref(1)
const formData = ref<FormData>({
  firstName: '',
  lastName: '',
  workshopName: '',
  location: '',
  filiere: '',
  customFiliere: '',
  productsTransformed: [],
  customProducts: [],
  capacity: '',
  capacityUnit: 'kg/mois',
  customCapacityUnit: '',
  certification: '',
})

const newProductInput = ref('')
const progress = computed(() => (step.value / 3) * 100)

const filiereOptions = [
  { value: 'manioc', label: 'Manioc' },
  { value: 'cacao', label: 'Cacao' },
  { value: 'palmier', label: 'Palmier à huile' },
  { value: 'karite', label: 'Karité' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'cereales', label: 'Céréales' },
  { value: 'autre', label: 'Autre' },
]

const capacityUnitOptions = [
  { value: 'kg/mois', label: 'kg/mois' },
  { value: 'tonnes/mois', label: 'tonnes/mois' },
  { value: 'litres/mois', label: 'litres/mois' },
  { value: 'sacs/mois', label: 'sacs/mois' },
  { value: 'unités/mois', label: 'unités/mois' },
  { value: 'kg/an', label: 'kg/an' },
  { value: 'tonnes/an', label: 'tonnes/an' },
  { value: 'custom', label: 'Autre' },
]

const productsByFiliere: Record<string, string[]> = {
  manioc: ['Attiéké', 'Gari', 'Farine de manioc', 'Tapioca', 'Placali', 'Chips de manioc'],
  cacao: ['Poudre de cacao', 'Beurre de cacao', 'Chocolat noir', 'Chocolat au lait', 'Liqueur de cacao'],
  palmier: ['Huile de palme rouge', 'Huile de palme raffinée', 'Savon noir', 'Tourteau de palmiste'],
  karite: ['Beurre de karité', 'Savon de karité', 'Huile de karité', 'Crème de karité'],
  fruits: ['Jus de fruits', 'Confiture', 'Fruits séchés', 'Purée de fruits', 'Sirop de fruits'],
  cereales: ['Farine de maïs', 'Farine de mil', 'Farine de sorgho', 'Couscous', 'Semoule'],
  autre: []
}

const transformedProducts = computed(() => {
  if (formData.value.filiere === 'autre' && formData.value.customFiliere) {
    return []
  }
  return productsByFiliere[formData.value.filiere] || []
})

function handleBack() {
  if (step.value > 1) step.value--
}

function handleNext() {
  if (step.value < 3) step.value++
  else emit('complete', formData.value)
}

function toggleProduct(product: string) {
  const idx = formData.value.productsTransformed.indexOf(product)
  if (idx > -1) formData.value.productsTransformed.splice(idx, 1)
  else formData.value.productsTransformed.push(product)
}

function addCustomProduct() {
  if (newProductInput.value.trim()) {
    formData.value.customProducts.push(newProductInput.value.trim())
    formData.value.productsTransformed.push(newProductInput.value.trim())
    toast.success(`${newProductInput.value.trim()} ajouté à vos produits`)
    newProductInput.value = ''
  }
}

function removeCustomProduct(product: string) {
  formData.value.customProducts = formData.value.customProducts.filter(p => p !== product)
  formData.value.productsTransformed = formData.value.productsTransformed.filter(p => p !== product)
}

function getFiliereLabel(value: string) {
  if (value === 'palmier') return 'Palmier à huile'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const isStep1Valid = computed(() => formData.value.firstName && formData.value.lastName && formData.value.workshopName)
const isStep2Valid = computed(() => formData.value.location && formData.value.filiere && (formData.value.filiere !== 'autre' || formData.value.customFiliere))
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
          <Select v-model="formData.filiere" :options="filiereOptions" placeholder="Sélectionnez votre filière" />
        </div>

        <div v-if="formData.filiere === 'autre'" class="space-y-2">
          <Label for="customFiliere">Précisez votre filière</Label>
          <Input id="customFiliere" v-model="formData.customFiliere" placeholder="Ex: Coton" />
        </div>

        <div class="space-y-2">
          <Label for="capacity">Capacité de production</Label>
          <div class="flex gap-2">
            <Input id="capacity" v-model="formData.capacity" type="number" placeholder="Ex: 5000" class="flex-1" />
            <Select v-model="formData.capacityUnit" :options="capacityUnitOptions" class="w-[140px]" />
          </div>
        </div>

        <div v-if="formData.capacityUnit === 'custom'" class="space-y-2">
          <Label for="customCapacityUnit">Précisez l'unité</Label>
          <Input id="customCapacityUnit" v-model="formData.customCapacityUnit" placeholder="Ex: Caisses/semaine, Bidons/mois..." />
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
        <div v-if="transformedProducts.length > 0" class="space-y-2">
          <Label>Produits standards pour {{ getFiliereLabel(formData.filiere) }}</Label>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="product in transformedProducts" :key="product" :variant="formData.productsTransformed.includes(product) ? 'default' : 'outline'" class="cursor-pointer" @click="toggleProduct(product)">
              {{ product }}
            </Badge>
          </div>
        </div>

        <div v-if="transformedProducts.length === 0 && formData.filiere === 'autre'" class="bg-muted/50 p-4 rounded-lg border border-dashed">
          <p class="text-sm text-muted-foreground text-center">Aucun produit standard pour cette filière. Utilisez le champ ci-dessus pour ajouter vos produits.</p>
        </div>

        <div class="space-y-2">
          <Label for="certification">Certification / Agrément</Label>
          <Input id="certification" v-model="formData.certification" placeholder="Ex: Agrément sanitaire n°..." />
        </div>

        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" @click="handleBack">Retour</Button>
          <Button class="flex-1" :disabled="!isStep3Valid" @click="handleNext">Terminer</Button>
        </div>
      </div>
    </div>
  </div>
</template>
