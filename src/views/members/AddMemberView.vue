<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, UserPlus, Building2, Landmark, Briefcase, User, Tractor, Sprout, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Progress from '@/components/ui/Progress.vue'
import { toast } from 'vue-sonner'
import type { UserRole } from '@/types'

const props = defineProps<{ userRole: UserRole }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const step = ref(1)
const memberType = ref('')

// Formulaires
const farmerFormData = ref({
  firstName: '', lastName: '', phone: '', location: '', village: '', filiere: '', products: [] as string[], surfaceArea: '', photo: ''
})

const structureFormData = ref({
  name: '', type: '', legalNumber: '', president: '', phone: '', email: '', location: '', address: '', memberCount: '', creationYear: '', photo: ''
})

const teamMemberFormData = ref({
  name: '', phone: '', email: '', role: 'secretaire'
})

// Types de membres selon le rôle
const memberTypeOptions = computed(() => {
  switch (props.userRole) {
    case 'interprofession':
      return [
        { value: 'federation', label: 'Fédération', icon: Landmark, description: 'Rattachée à votre interprofession' },
        { value: 'cooperative', label: 'Coopérative', icon: Building2, description: 'Rattachée directement' },
        { value: 'association', label: 'Association', icon: Building2, description: 'Rattachée directement' },
        { value: 'strategic_actor', label: 'Acteur stratégique', icon: Briefcase, description: 'Exportateur, acheteur, institution' },
        { value: 'team_member', label: 'Membre de l\'équipe', icon: Users, description: 'Équipe de direction' },
      ]
    case 'federation':
      return [
        { value: 'union', label: 'Union', icon: Building2, description: 'Rattachée à votre fédération' },
        { value: 'cooperative', label: 'Coopérative majeure', icon: Building2, description: 'Rattachée directement' },
        { value: 'team_member', label: 'Membre de l\'équipe', icon: Users, description: 'Équipe de direction' },
      ]
    case 'union':
      return [
        { value: 'cooperative', label: 'Coopérative', icon: Building2, description: 'Rattachée à votre union' },
        { value: 'association', label: 'Association', icon: Building2, description: 'Rattachée à votre union' },
        { value: 'team_member', label: 'Membre de l\'équipe', icon: Users, description: 'Équipe de direction' },
      ]
    case 'cooperative':
    case 'association':
    default:
      return [
        { value: 'producteur', label: 'Producteur', icon: Tractor, description: 'Producteur agricole avec exploitation' },
        { value: 'paysan', label: 'Paysan', icon: Sprout, description: 'Petit exploitant agricole' },
        { value: 'eleveur', label: 'Éleveur', icon: User, description: 'Éleveur de bétail ou volaille' },
        { value: 'team_member', label: 'Membre de l\'équipe', icon: Users, description: 'Équipe de direction' },
      ]
  }
})

const isAddingStructure = computed(() => ['federation', 'union', 'cooperative', 'association'].includes(memberType.value))
const isAddingTeamMember = computed(() => memberType.value === 'team_member')
const isAddingFarmer = computed(() => ['producteur', 'paysan', 'eleveur'].includes(memberType.value))
const isAddingStrategicActor = computed(() => memberType.value === 'strategic_actor')

const progress = computed(() => memberType.value ? (step.value / 2) * 100 : 0)

const products = ['Igname', 'Manioc', 'Banane Plantain', 'Riz', 'Maïs', 'Tomate', 'Oignon', 'Piment', 'Gombo', 'Aubergine']

const toggleProduct = (product: string) => {
  const idx = farmerFormData.value.products.indexOf(product)
  if (idx > -1) farmerFormData.value.products.splice(idx, 1)
  else farmerFormData.value.products.push(product)
}

const roleOptions = [
  { value: 'secretaire', label: 'Secrétaire' },
  { value: 'tresorier', label: 'Trésorier' },
  { value: 'charge_ventes', label: 'Chargé des ventes' },
  { value: 'responsable_stock', label: 'Responsable stock' },
  { value: 'comptable', label: 'Comptable' },
]

const structureTypes = [
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'association', label: 'Association' },
  { value: 'union', label: 'Union' },
  { value: 'federation', label: 'Fédération' },
]

const authStore = useAuthStore()
const apiFilieres = ref<any[]>([])
const filiereOptions = computed(() => {
  if (apiFilieres.value.length === 0) return [
    { value: 'vivrier', label: 'Cultures vivrières' },
    { value: 'maraichage', label: 'Maraîchage' },
    { value: 'cacao', label: 'Cacao' },
    { value: 'cafe', label: 'Café' },
    { value: 'anacarde', label: 'Anacarde' },
    { value: 'hevea', label: 'Hévéa' },
    { value: 'palmier', label: 'Palmier à huile' },
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

const handleSubmit = () => {
  if (isAddingFarmer.value) {
    const name = `${farmerFormData.value.firstName} ${farmerFormData.value.lastName}`
    toast.success(`${name} a été enregistré avec succès !`, { description: 'Un SMS avec son matricule TITRA lui sera envoyé.' })
  } else if (isAddingStructure.value) {
    toast.success(`${structureFormData.value.name} a été enregistrée !`, { description: 'La structure peut maintenant rejoindre TITRA.' })
  } else if (isAddingTeamMember.value) {
    toast.success(`${teamMemberFormData.value.name} a été ajouté à l'équipe !`)
  }
  emit('navigate', 'members')
}
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-gradient-to-br from-[#2D5016] via-[#2D5016] to-[#1a3009] text-white p-6">
      <div class="flex items-center gap-4 mb-4">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-white text-xl">Ajouter un membre</h1>
          <p class="text-white/80 text-sm">Enregistrez un nouveau membre</p>
        </div>
      </div>
      <Progress v-if="memberType" :value="progress" class="h-2 bg-white/20" />
    </div>

    <div class="p-6 space-y-6">
      <!-- Type Selection -->
      <div v-if="!memberType">
        <h3 class="mb-4">Quel type de membre souhaitez-vous ajouter ?</h3>
        <div class="space-y-3">
          <Card 
            v-for="option in memberTypeOptions" 
            :key="option.value"
            @click="memberType = option.value"
            class="p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <component :is="option.icon" class="w-6 h-6 text-primary" />
              </div>
              <div class="flex-1">
                <h4 class="font-medium">{{ option.label }}</h4>
                <p class="text-sm text-muted-foreground">{{ option.description }}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Team Member Form -->
      <div v-if="isAddingTeamMember" class="space-y-4">
        <Card class="p-4 bg-blue-50 border-blue-200">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"><Users class="w-5 h-5 text-white" /></div>
            <div>
              <h4 class="font-medium text-blue-900 mb-1">Membre de l'équipe</h4>
              <p class="text-sm text-blue-700">Cette personne aura accès au tableau de bord de votre structure</p>
            </div>
          </div>
        </Card>

        <div class="space-y-2"><Label>Nom complet *</Label><Input v-model="teamMemberFormData.name" placeholder="Nom et prénom" /></div>
        <div class="space-y-2"><Label>Téléphone *</Label><Input v-model="teamMemberFormData.phone" type="tel" placeholder="+225 XX XX XX XX XX" /></div>
        <div class="space-y-2"><Label>Email</Label><Input v-model="teamMemberFormData.email" type="email" placeholder="email@exemple.com" /></div>
        <div class="space-y-2">
          <Label>Rôle *</Label>
          <Select v-model="teamMemberFormData.role" :options="roleOptions" placeholder="Sélectionnez un rôle" />
        </div>

        <div class="flex gap-3">
          <Button variant="outline" @click="memberType = ''" class="flex-1">Changer le type</Button>
          <Button @click="handleSubmit" class="flex-1" :disabled="!teamMemberFormData.name || !teamMemberFormData.phone">Enregistrer</Button>
        </div>
      </div>

      <!-- Structure Form -->
      <div v-if="isAddingStructure" class="space-y-4">
        <Card class="p-4 bg-primary/5 border-primary/20">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"><Building2 class="w-5 h-5 text-primary" /></div>
            <div>
              <h4 class="font-medium text-primary mb-1">Enregistrer une structure</h4>
              <p class="text-sm text-muted-foreground">Cette structure sera rattachée à votre organisation</p>
            </div>
          </div>
        </Card>

        <div class="space-y-2"><Label>Nom de la structure *</Label><Input v-model="structureFormData.name" placeholder="Ex: SCOOP-CA Agnibilékrou" /></div>
        <div class="space-y-2">
          <Label>Type de structure *</Label>
          <Select v-model="structureFormData.type" :options="structureTypes" placeholder="Sélectionnez le type" />
        </div>
        <div class="space-y-2"><Label>Numéro d'enregistrement</Label><Input v-model="structureFormData.legalNumber" placeholder="Numéro légal" /></div>
        <div class="space-y-2"><Label>Nom du président *</Label><Input v-model="structureFormData.president" placeholder="Nom du président" /></div>
        <div class="space-y-2"><Label>Téléphone *</Label><Input v-model="structureFormData.phone" type="tel" placeholder="+225 XX XX XX XX XX" /></div>
        <div class="space-y-2"><Label>Email</Label><Input v-model="structureFormData.email" type="email" placeholder="contact@structure.ci" /></div>
        <div class="space-y-2"><Label>Localisation *</Label><Input v-model="structureFormData.location" placeholder="Ville ou région" /></div>
        <div class="space-y-2"><Label>Nombre de membres</Label><Input v-model="structureFormData.memberCount" type="number" placeholder="Ex: 150" /></div>

        <div class="flex gap-3">
          <Button variant="outline" @click="memberType = ''" class="flex-1">Changer le type</Button>
          <Button @click="handleSubmit" class="flex-1" :disabled="!structureFormData.name || !structureFormData.president || !structureFormData.phone">Enregistrer</Button>
        </div>
      </div>

      <!-- Farmer Form -->
      <div v-if="isAddingFarmer">
        <!-- Step 1: Personal Info -->
        <div v-if="step === 1" class="space-y-4">
          <Card class="p-4 bg-primary/5 border-primary/20">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"><UserPlus class="w-5 h-5 text-primary" /></div>
              <div>
                <p class="text-sm text-muted-foreground">Ce producteur recevra un matricule unique TITRA pour la traçabilité</p>
              </div>
            </div>
          </Card>

          <div class="space-y-2"><Label>Prénom *</Label><Input v-model="farmerFormData.firstName" placeholder="Prénom du producteur" /></div>
          <div class="space-y-2"><Label>Nom *</Label><Input v-model="farmerFormData.lastName" placeholder="Nom du producteur" /></div>
          <div class="space-y-2"><Label>Numéro de téléphone *</Label><Input v-model="farmerFormData.phone" type="tel" placeholder="+225 XX XX XX XX XX" /></div>
          <div class="space-y-2"><Label>Village / Localité *</Label><Input v-model="farmerFormData.village" placeholder="Ex: Village Koffikro" /></div>
          <div class="space-y-2"><Label>Sous-préfecture / Région *</Label><Input v-model="farmerFormData.location" placeholder="Ex: Yamoussoukro" /></div>

          <div class="flex gap-3">
            <Button variant="outline" @click="memberType = ''" class="flex-1">Changer le type</Button>
            <Button @click="step = 2" class="flex-1" :disabled="!farmerFormData.firstName || !farmerFormData.lastName || !farmerFormData.phone || !farmerFormData.village || !farmerFormData.location">Continuer</Button>
          </div>
        </div>

        <!-- Step 2: Agricultural Info -->
        <div v-if="step === 2" class="space-y-4">
          <div class="space-y-2">
            <Label>Filière principale *</Label>
            <Select v-model="farmerFormData.filiere" :options="filiereOptions" placeholder="Sélectionnez la filière" />
          </div>

          <div class="space-y-2">
            <Label>Produits cultivés *</Label>
            <p class="text-sm text-muted-foreground">Sélectionnez les produits</p>
            <div class="flex flex-wrap gap-2">
              <Badge 
                v-for="product in products" 
                :key="product"
                :variant="farmerFormData.products.includes(product) ? 'default' : 'outline'"
                class="cursor-pointer"
                @click="toggleProduct(product)"
              >{{ product }}</Badge>
            </div>
          </div>

          <div class="space-y-2"><Label>Surface cultivée (hectares)</Label><Input v-model="farmerFormData.surfaceArea" type="number" placeholder="Ex: 2.5" /></div>

          <Card class="p-4 bg-green-50 border-green-200">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"><UserPlus class="w-5 h-5 text-white" /></div>
              <div>
                <h4 class="font-medium text-green-900 mb-1">Inscription automatique</h4>
                <p class="text-sm text-green-700">Un compte TITRA sera créé et le matricule envoyé par SMS</p>
              </div>
            </div>
          </Card>

          <div class="flex gap-3">
            <Button variant="outline" @click="step = 1" class="flex-1">Retour</Button>
            <Button @click="handleSubmit" class="flex-1" :disabled="!farmerFormData.filiere || farmerFormData.products.length === 0">Enregistrer</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
