<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MapPin, Building2, Users, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'
import InstitutionalAffiliationStep from '@/components/onboarding/InstitutionalAffiliationStep.vue'
import TeamMembersStep from '@/components/onboarding/TeamMembersStep.vue'

const emit = defineEmits<{ complete: [data: any] }>()
const authStore = useAuthStore()

const step = ref(authStore.user?.currentOnboardingStep || 1)
const formData = ref({
  cooperativeName: '', registrationNumber: '', rccm: '', ncc: '', presidentName: '', location: '',
  filiere: '', customFiliere: '', secondaryFilieres: [] as string[], membersCount: '', yearFounded: '',
  affiliationId: '', affiliationName: '', affiliationType: '', teamMembers: [] as any[],
  contactPhone: '', contactEmail: ''
})
const newSecondaryFiliere = ref('')
const progress = computed(() => (step.value / 4) * 100)

const apiFilieres = ref<any[]>([])
const predefinedFilieres = computed(() => {
  if (apiFilieres.value.length === 0) return [
    { value: 'cacao', label: 'Cacao' }, { value: 'cafe', label: 'Café' }, { value: 'anacarde', label: 'Anacarde' },
    { value: 'coton', label: 'Coton' }, { value: 'palmier', label: 'Palmier à huile' }, { value: 'hevea', label: 'Hévéa' },
    { value: 'vivrier', label: 'Cultures vivrières' }, { value: 'maraichage', label: 'Maraîchage' }
  ]
  return apiFilieres.value.map(f => ({ value: f.id, label: f.libelle }))
})

onMounted(async () => {
  try {
    apiFilieres.value = await authStore.getAllFilieres()
  } catch (error) {
    console.error('Failed to fetch filieres:', error)
  }
})

async function handleNext() {
  if (step.value === 1 && (!formData.value.cooperativeName || !formData.value.registrationNumber || !formData.value.presidentName || !formData.value.location)) {
    toast.error('Veuillez remplir les champs obligatoires'); return
  }
  if (step.value === 2 && !formData.value.filiere && !formData.value.customFiliere) {
    toast.error('Veuillez sélectionner une filière'); return
  }
  
  if (step.value < 4) {
    step.value++
    authStore.setOnboardingStep(step.value)
  } else {
    try {
      await authStore.completeCooperativeProfile(formData.value)
      toast.success('Profil coopérative créé avec succès !')
      emit('complete', formData.value)
    } catch (error: any) {
      console.error('Cooperative registration error details:', error)
      const data = error.response?.data
      
      if (data && typeof data === 'object' && !Array.isArray(data) && !data.message) {
        Object.values(data).forEach((msg) => {
          if (typeof msg === 'string') toast.error(msg)
        })
      } else if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err: any) => {
          toast.error(err.defaultMessage || 'Erreur de validation')
        })
      } else {
        const backendMessage = data?.message || data?.error || data?.body || (typeof data === 'string' ? data : null)
        toast.error(backendMessage || "Erreur lors de la création du profil coopérative")
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
function handleAffiliationSelect(id: string, name: string, type: string) { formData.value.affiliationId = id; formData.value.affiliationName = name; formData.value.affiliationType = type }
function addSecondaryFiliere(f: string) { if (f.trim() && !formData.value.secondaryFilieres.includes(f.trim())) { formData.value.secondaryFilieres.push(f.trim()); newSecondaryFiliere.value = ''; toast.success('Filière ajoutée') } }
function removeSecondaryFiliere(i: number) { formData.value.secondaryFilieres.splice(i, 1); toast.success('Filière supprimée') }
function toggleSecondaryFiliere(label: string) { const i = formData.value.secondaryFilieres.indexOf(label); if (i > -1) formData.value.secondaryFilieres.splice(i, 1); else formData.value.secondaryFilieres.push(label) }

const isStep1Valid = computed(() => formData.value.cooperativeName && formData.value.registrationNumber && formData.value.presidentName && formData.value.location)
const isStep2Valid = computed(() => (formData.value.filiere || formData.value.customFiliere) && formData.value.membersCount)
</script>

<template>
  <div class="min-h-screen bg-background p-4 pb-8">
    <div class="max-w-md mx-auto">
      <div class="mb-8"><h1 class="text-primary mb-2">Profil Coopérative</h1><p class="text-muted-foreground">Étape {{ step }} sur 4</p><Progress :value="progress" class="mt-4" /></div>

      <div v-if="step === 1" class="space-y-6">
        <h2 class="text-primary">Informations de la coopérative</h2>
        <div class="space-y-2"><Label>Nom de la coopérative</Label><div class="relative"><Building2 class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input v-model="formData.cooperativeName" placeholder="Ex: SCOOP-CA Agnibilékrou" class="pl-10" /></div></div>
        <div class="space-y-2"><Label>Numéro d'enregistrement</Label><Input v-model="formData.registrationNumber" placeholder="Ex: CI-AGRI-2020-001" /></div>
        <div class="space-y-2"><Label>RCCM</Label><Input v-model="formData.rccm" placeholder="Ex: RCCM CI-ABJ-2020-001" /></div>
        <div class="space-y-2"><Label>NCC</Label><Input v-model="formData.ncc" placeholder="Ex: NCC CI-ABJ-2020-001" /></div>
        <div class="space-y-2"><Label>Nom du Président</Label><Input v-model="formData.presidentName" placeholder="Nom complet" /></div>
        <div class="space-y-2"><Label>Localisation</Label><div class="relative"><MapPin class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input v-model="formData.location" placeholder="Village, sous-préfecture, région" class="pl-10" /></div></div>
        <div class="space-y-2"><Label>Année de création</Label><Input v-model="formData.yearFounded" type="number" placeholder="Ex: 2015" /></div>
        <Button class="w-full" :disabled="!isStep1Valid" @click="handleNext">Continuer</Button>
      </div>

      <div v-else-if="step === 2" class="space-y-6">
        <h2 class="text-primary">Filière et activité</h2>
        <div class="space-y-2"><Label>Filière principale</Label><Select v-model="formData.filiere" :options="predefinedFilieres" placeholder="Sélectionnez la filière" @update:model-value="formData.customFiliere = ''" /></div>
        <div class="space-y-2"><Label>Ou saisissez une filière personnalisée</Label><Input v-model="formData.customFiliere" placeholder="Ex: Riz, Mangue, Agrumes..." @input="formData.filiere = ''" /><p class="text-xs text-muted-foreground">Laissez vide si vous avez sélectionné une filière ci-dessus</p></div>
        <div class="space-y-2"><Label>Nombre de membres</Label><div class="relative"><Users class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input v-model="formData.membersCount" type="number" placeholder="Ex: 150" class="pl-10" /></div></div>
        <div class="space-y-2">
          <Label>Filières secondaires (optionnel)</Label><p class="text-sm text-muted-foreground">Ajoutez d'autres filières dans lesquelles votre coopérative est active</p>
          <div class="flex flex-wrap gap-2 mb-2"><Badge v-for="f in predefinedFilieres.filter(x => x.value !== formData.filiere)" :key="f.value" :variant="formData.secondaryFilieres.includes(f.label) ? 'default' : 'outline'" class="cursor-pointer" @click="toggleSecondaryFiliere(f.label)">{{ f.label }}</Badge></div>
          <div class="flex gap-2"><Input v-model="newSecondaryFiliere" placeholder="Ajouter une filière personnalisée..." @keypress.enter.prevent="addSecondaryFiliere(newSecondaryFiliere)" /><Button :disabled="!newSecondaryFiliere.trim()" @click="addSecondaryFiliere(newSecondaryFiliere)"><Plus class="w-4 h-4" /></Button></div>
          <div v-if="formData.secondaryFilieres.filter(f => !predefinedFilieres.some(pf => pf.label === f)).length > 0" class="mt-2"><Label class="text-xs text-muted-foreground">Filières personnalisées ajoutées</Label><div class="flex flex-wrap gap-2 mt-1"><Badge v-for="(f, i) in formData.secondaryFilieres.filter(x => !predefinedFilieres.some(pf => pf.label === x))" :key="i" class="cursor-pointer bg-primary hover:bg-primary/80" @click="removeSecondaryFiliere(formData.secondaryFilieres.indexOf(f))">{{ f }} ✕</Badge></div></div>
        </div>
        <div class="flex gap-2"><Button variant="outline" class="flex-1" @click="handleBack">Retour</Button><Button class="flex-1" :disabled="!isStep2Valid" @click="handleNext">Continuer</Button></div>
      </div>

      <div v-else-if="step === 3" class="space-y-6">
        <h2 class="text-primary">Affiliation institutionnelle</h2>
        <InstitutionalAffiliationStep user-role="cooperative" :selected-affiliation="formData.affiliationId" :can-be-independent="true" @select="handleAffiliationSelect" />
        <div class="flex gap-2"><Button variant="outline" class="flex-1" @click="handleBack">Retour</Button><Button class="flex-1" :disabled="!formData.affiliationId" @click="handleNext">Continuer</Button></div>
      </div>

      <div v-else class="space-y-6">
        <TeamMembersStep :members="formData.teamMembers" structure-type="coopérative" @update:members="formData.teamMembers = $event" />
        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" @click="handleBack">Retour</Button>
          <Button 
            class="flex-1" 
            :loading="authStore.isLoading" 
            :disabled="authStore.isLoading"
            @click="handleNext"
          >
            Terminer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
