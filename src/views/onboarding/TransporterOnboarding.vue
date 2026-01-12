<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Truck, Plus, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'

interface Vehicle { type: string; plate: string; capacity: string; capacityUnit: string; customCapacityUnit: string }

const emit = defineEmits<{ complete: [data: any] }>()

const step = ref(1)
const formData = ref({ firstName: '', lastName: '', vehicles: [] as Vehicle[], location: '', zonescovered: [] as string[], customZones: [] as string[], hasInsurance: '', license: '' })
const currentVehicle = ref<Vehicle>({ type: '', plate: '', capacity: '', capacityUnit: 'kg', customCapacityUnit: '' })
const newZoneInput = ref('')
const progress = computed(() => (step.value / 2) * 100)

const vehicleTypeOptions = [{ value: 'moto', label: 'Moto' }, { value: 'tricycle', label: 'Tricycle' }, { value: 'camionnette', label: 'Camionnette' }, { value: 'camion', label: 'Camion' }, { value: 'semi-remorque', label: 'Semi-remorque' }]
const capacityUnitOptions = [{ value: 'kg', label: 'kg' }, { value: 'tonne', label: 'tonne' }, { value: 'custom', label: 'Autre' }]
const insuranceOptions = [{ value: 'yes', label: 'Oui, assuré' }, { value: 'no', label: 'Non, pas encore' }]
const zones = ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro', 'Korhogo', 'Man', 'Gagnoa', 'Divo', 'Odienné']

function handleNext() { if (step.value < 2) step.value++; else emit('complete', formData.value) }
function addVehicle() { if (currentVehicle.value.type && currentVehicle.value.plate && currentVehicle.value.capacity) { formData.value.vehicles.push({ ...currentVehicle.value }); currentVehicle.value = { type: '', plate: '', capacity: '', capacityUnit: 'kg', customCapacityUnit: '' }; toast.success('Véhicule ajouté') } }
function removeVehicle(i: number) { formData.value.vehicles.splice(i, 1); toast.success('Véhicule supprimé') }
function toggleZone(z: string) { const i = formData.value.zonescovered.indexOf(z); if (i > -1) formData.value.zonescovered.splice(i, 1); else formData.value.zonescovered.push(z) }
function addCustomZone() { if (newZoneInput.value.trim()) { formData.value.customZones.push(newZoneInput.value.trim()); toast.success('Zone ajoutée'); newZoneInput.value = '' } }
function removeCustomZone(i: number) { formData.value.customZones.splice(i, 1); toast.success('Zone supprimée') }
function getVehicleLabel(t: string) { return vehicleTypeOptions.find(v => v.value === t)?.label || t }
</script>

<template>
  <div class="min-h-screen bg-background p-4 pb-8">
    <div class="max-w-md mx-auto">
      <div class="mb-8"><h1 class="text-primary mb-2">Profil Transporteur</h1><p class="text-muted-foreground">Étape {{ step }} sur 2</p><Progress :value="progress" class="mt-4" /></div>

      <div v-if="step === 1" class="space-y-6">
        <h2 class="text-primary">Informations personnelles</h2>
        <div class="space-y-2"><Label>Prénom</Label><Input v-model="formData.firstName" placeholder="Votre prénom" /></div>
        <div class="space-y-2"><Label>Nom</Label><Input v-model="formData.lastName" placeholder="Votre nom" /></div>
        <div class="space-y-2"><Label>Type de véhicule</Label><Select v-model="currentVehicle.type" :options="vehicleTypeOptions" placeholder="Sélectionnez" /></div>
        <div class="space-y-2"><Label>Immatriculation</Label><div class="relative"><Truck class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input v-model="currentVehicle.plate" placeholder="Ex: AB-1234-CD" class="pl-10" /></div></div>
        <div class="space-y-2"><Label>Capacité de charge</Label><div class="flex gap-2"><Input v-model="currentVehicle.capacity" type="number" placeholder="Ex: 1000" class="flex-1" /><Select v-model="currentVehicle.capacityUnit" :options="capacityUnitOptions" class="w-24" /></div></div>
        <div v-if="currentVehicle.capacityUnit === 'custom'" class="space-y-2"><Label>Précisez l'unité</Label><Input v-model="currentVehicle.customCapacityUnit" placeholder="Ex: m³" /></div>
        <div class="space-y-2"><Label>Permis de conduire</Label><Input v-model="formData.license" placeholder="Numéro de permis" /></div>
        <div v-if="formData.vehicles.length > 0" class="space-y-2">
          <Label>Véhicules ajoutés ({{ formData.vehicles.length }})</Label>
          <div v-for="(v, i) in formData.vehicles" :key="i" class="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div><div class="flex items-center gap-2"><Truck class="h-4 w-4 text-primary" /><span class="font-medium">{{ getVehicleLabel(v.type) }}</span></div><p class="text-sm text-muted-foreground mt-1">{{ v.plate }} • {{ v.capacity }} {{ v.capacityUnit === 'custom' ? v.customCapacityUnit : v.capacityUnit }}</p></div>
            <Button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10" @click="removeVehicle(i)"><X class="h-4 w-4" /></Button>
          </div>
        </div>
        <Button variant="outline" class="w-full" :disabled="!currentVehicle.type || !currentVehicle.plate || !currentVehicle.capacity" @click="addVehicle"><Plus class="w-4 h-4 mr-2" />Ajouter un nouveau véhicule</Button>
        <Button class="w-full" :disabled="!formData.firstName || !formData.lastName || formData.vehicles.length === 0" @click="handleNext">Continuer</Button>
      </div>

      <div v-else class="space-y-6">
        <h2 class="text-primary">Zones d'intervention</h2><p class="text-muted-foreground text-sm">Indiquez votre localisation et les zones que vous couvrez</p>
        <div class="space-y-2"><Label>Où êtes-vous situé ?</Label><div class="relative"><MapPin class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input v-model="formData.location" placeholder="Ex: Abobo, Grand-Bassam..." class="pl-10" /></div><p class="text-xs text-muted-foreground">Indiquez votre ville, commune ou quartier</p></div>
        <div class="space-y-2"><Label>Villes principales couvertes</Label><div class="flex flex-wrap gap-2"><Badge v-for="z in zones" :key="z" :variant="formData.zonescovered.includes(z) ? 'default' : 'outline'" class="cursor-pointer" @click="toggleZone(z)">{{ z }}</Badge></div></div>
        <div class="space-y-2"><Label>Ajouter une zone personnalisée</Label><div class="flex gap-2"><Input v-model="newZoneInput" placeholder="Ex: Cocody, Marcory..." @keypress.enter.prevent="addCustomZone" /><Button :disabled="!newZoneInput.trim()" @click="addCustomZone"><Plus class="w-4 h-4" /></Button></div><p class="text-xs text-muted-foreground">Ajoutez d'autres zones qui ne sont pas dans la liste</p></div>
        <div v-if="formData.customZones.length > 0" class="space-y-2"><Label>Zones personnalisées ({{ formData.customZones.length }})</Label><div class="flex flex-wrap gap-2"><Badge v-for="(z, i) in formData.customZones" :key="i" class="cursor-pointer bg-primary hover:bg-primary/80" @click="removeCustomZone(i)">{{ z }} ✕</Badge></div></div>
        <div class="space-y-2"><Label>Assurance véhicule</Label><Select v-model="formData.hasInsurance" :options="insuranceOptions" placeholder="Sélectionnez" /></div>
        <div class="flex gap-2"><Button variant="outline" class="flex-1" @click="step = 1">Retour</Button><Button class="flex-1" :disabled="!formData.location || (formData.zonescovered.length === 0 && formData.customZones.length === 0)" @click="handleNext">Terminer</Button></div>
      </div>
    </div>
  </div>
</template>
