<script setup lang="ts">
import { ref } from 'vue'
import { Camera, User as UserIcon } from 'lucide-vue-next'
import Label from '@/components/ui/Label.vue'

interface Props {
  photo: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Photo de profil',
})

const emit = defineEmits<{
  'update:photo': [photo: string]
  'select-file': [file: File]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

function handlePhotoChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('select-file', file)
    const reader = new FileReader()
    reader.onloadend = () => {
      emit('update:photo', reader.result as string)
    }
    reader.readAsDataURL(file)
  }
}

function handleEditPhoto() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="space-y-2">
    <Label>{{ label }}</Label>
    <div 
      class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:border-primary transition-colors"
    >
      <div class="relative">
        <!-- Photo circle -->
        <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
          <img
            v-if="photo"
            :src="photo"
            alt="Photo de profil"
            class="w-full h-full object-cover"
          />
          <UserIcon v-else class="w-12 h-12 text-primary" />
        </div>
        
        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handlePhotoChange"
        />
        
        <!-- Camera button -->
        <button
          type="button"
          class="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          @click="handleEditPhoto"
        >
          <Camera class="w-4 h-4" />
        </button>
      </div>
      
      <p class="text-sm text-muted-foreground mt-3 text-center">
        {{ photo ? "Cliquez sur l'icône pour changer" : "Cliquez sur l'icône pour ajouter une photo" }}
      </p>
    </div>
  </div>
</template>
