<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Select from '@/components/ui/Select.vue'
import { toast } from 'vue-sonner'
import { useProductStore } from '@/stores/product'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ userRole: 'farmer' | 'processor' | 'merchant' | 'cooperative' | 'association' | 'union' | 'federation' | 'interprofession' }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const productStore = useProductStore()
const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const isInstitution = computed(() => ['cooperative', 'association', 'union', 'federation', 'interprofession'].includes(props.userRole))

const formData = ref({
  name: '',
  description: '',
  category: '',
  price: '',
  unit: 'kg',
  quantity: '',
  images: [] as string[],
})

const farmerCategories = ['Tubercules', 'Céréales', 'Légumes', 'Fruits', 'Épices', 'Légumineuses']
const processorCategories = ['Produits transformés', 'Farines', 'Huiles', 'Conserves', 'Jus et boissons', 'Condiments']
const merchantCategories = ['Gros & Détail', 'Produits Secs', 'Produits Frais', 'Épicerie', 'Boissons', 'Divers']

const categories = computed(() => {
  if (props.userRole === 'processor') return processorCategories
  if (props.userRole === 'merchant') return merchantCategories
  return farmerCategories
})

const units = ['kg', 'tonne', 'litre', 'unité', 'sac', 'bouteille', 'carton']

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  isUploading.value = true
  try {
    const file = target.files[0]
    // Use the specific product photo upload method
    const response = await productStore.uploadProductPhoto(file)
    
    // As per user feedback, the API returns { "message": "...", "url": "..." }
    const imageUrl = response.url
    
    if (imageUrl) {
      formData.value.images.push(imageUrl)
      toast.success('Image ajoutée')
    }
  } catch (error) {
    console.error('Upload error:', error)
    toast.error("Erreur lors de l'envoi de l'image")
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeImage(index: number) {
  formData.value.images.splice(index, 1)
}

async function handleSubmit() {
  if (!formData.value.name || !formData.value.category || !formData.value.price || !formData.value.quantity) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }

  try {
    const productData = {
      nom: formData.value.name,
      description: formData.value.description,
      categorie: formData.value.category,
      prix: parseFloat(formData.value.price) || 0,
      unite: formData.value.unit,
      quantiteDisponible: parseFloat(formData.value.quantity) || 0,
      photos: formData.value.images
    }

    const result = await productStore.addProduct(productData)
    
    const createdProduct = result.data || result.body || result
    const productName = createdProduct?.nom || formData.value.name
    
    toast.success(`Produit "${productName}" ajouté avec succès !`)
    emit('navigate', 'my-products')
  } catch (error) {
    console.error('Submit error:', error)
    toast.error("Erreur lors de l'ajout du produit")
  }
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
        <h1 class="text-white text-2xl">
          {{ userRole === 'processor' ? 'Ajouter un produit transformé' : (userRole === 'merchant' ? 'Ajouter un produit boutique' : (isInstitution ? 'Ajouter un produit structure' : 'Ajouter un produit')) }}
        </h1>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Photos -->
      <Card class="p-4">
        <Label class="mb-3 block">Photos du produit</Label>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="(img, index) in formData.images" :key="index" class="relative aspect-square rounded-lg overflow-hidden border">
            <img :src="img" class="w-full h-full object-cover" />
            <button @click="removeImage(index)" class="absolute top-1 right-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center">
              <X class="w-4 h-4" />
            </button>
          </div>

          <button 
            v-if="formData.images.length < 5"
            @click="fileInput?.click()"
            :disabled="isUploading"
            class="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <Loader2 v-if="isUploading" class="w-6 h-6 text-primary animate-spin" />
            <Upload v-else class="w-6 h-6 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">{{ isUploading ? 'Envoi...' : 'Ajouter' }}</span>
          </button>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          class="hidden" 
          accept="image/*" 
          @change="handleFileUpload"
        />
        <p class="text-xs text-muted-foreground mt-2">Ajoutez jusqu'à 5 photos de votre produit</p>
      </Card>

      <!-- Informations du produit -->
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Nom du produit *</Label>
          <Input
            id="name"
            v-model="formData.name"
            :placeholder="userRole === 'farmer' ? 'Ex: Igname fraîche' : 'Ex: Attiéké premium'"
          />
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Décrivez votre produit, son origine, ses qualités..."
            :rows="4"
          />
        </div>

        <div class="space-y-2">
          <Label for="category">Catégorie *</Label>
          <Select v-model="formData.category" placeholder="Sélectionnez une catégorie" :options="categories.map(c => ({ value: c, label: c }))" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="price">Prix *</Label>
            <Input id="price" type="number" v-model="formData.price" placeholder="0" />
          </div>
          <div class="space-y-2">
            <Label for="unit">Unité *</Label>
            <Select v-model="formData.unit" :options="units.map(u => ({ value: u, label: u }))" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="quantity">Quantité disponible *</Label>
          <Input id="quantity" type="number" v-model="formData.quantity" placeholder="0" />
          <p class="text-xs text-muted-foreground">Quantité que vous avez en stock</p>
        </div>
      </div>

      <!-- Info card -->
      <Card v-if="userRole === 'farmer'" class="p-4 bg-primary/5 border-primary/20">
        <h4 class="font-medium text-primary mb-2">💡 Conseils pour vendre plus</h4>
        <ul class="text-sm text-muted-foreground space-y-1">
          <li>• Ajoutez des photos de qualité</li>
          <li>• Décrivez précisément votre produit</li>
          <li>• Indiquez l'origine et la fraîcheur</li>
          <li>• Proposez un prix compétitif</li>
        </ul>
      </Card>

      <!-- Buttons -->
      <div class="flex gap-3 pt-4">
        <Button variant="outline" @click="emit('back')" class="flex-1">Annuler</Button>
        <Button @click="handleSubmit" :disabled="productStore.isLoading" class="flex-1">
          <Loader2 v-if="productStore.isLoading" class="w-4 h-4 mr-2 animate-spin" />
          Publier le produit
        </Button>
      </div>
    </div>
  </div>
</template>

