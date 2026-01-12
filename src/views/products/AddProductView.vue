<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Upload } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Select from '@/components/ui/Select.vue'
import { toast } from 'vue-sonner'

const props = defineProps<{ userRole: 'farmer' | 'processor' }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

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
const categories = props.userRole === 'farmer' ? farmerCategories : processorCategories
const units = ['kg', 'tonne', 'litre', 'unité', 'sac']

function handleSubmit() {
  if (!formData.value.name || !formData.value.category || !formData.value.price || !formData.value.quantity) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  toast.success('Produit ajouté avec succès !')
  emit('navigate', 'my-products')
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
          {{ userRole === 'farmer' ? 'Ajouter un produit' : 'Ajouter un produit transformé' }}
        </h1>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Photos -->
      <Card class="p-4">
        <Label class="mb-3 block">Photos du produit</Label>
        <div class="grid grid-cols-3 gap-3">
          <button class="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors">
            <Upload class="w-6 h-6 text-muted-foreground" />
            <span class="text-xs text-muted-foreground">Ajouter</span>
          </button>
        </div>
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
        <Button @click="handleSubmit" class="flex-1">Publier le produit</Button>
      </div>
    </div>
  </div>
</template>
