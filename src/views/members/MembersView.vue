<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Plus, Search, Building2, Phone, MapPin, IdCard, User } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import type { UserRole } from '@/types'

const props = defineProps<{ userRole: UserRole }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const searchQuery = ref('')

const isFederation = computed(() => props.userRole === 'federation')
const isUnion = computed(() => props.userRole === 'union')
const isCooperative = computed(() => props.userRole === 'cooperative')
const isAssociation = computed(() => props.userRole === 'association')
const isInterprofession = computed(() => props.userRole === 'interprofession')

// Données selon le rôle
const members = computed(() => {
  if (isFederation.value) return [
    { id: '1', name: 'Union des Producteurs du Sud', type: 'Union', matricule: 'CI-UNION-2024-0015', phone: '+225 27 21 23 45 67', location: 'Abidjan', region: 'Sud', membersCount: 28, productsCount: 180, status: 'active', joinDate: 'Fev 2024', sector: 'Café' },
    { id: '2', name: 'Union des Planteurs de Cacao', type: 'Union', matricule: 'CI-UNION-2024-0032', phone: '+225 27 22 34 56 78', location: 'San Pedro', region: 'Sud-Ouest', membersCount: 35, productsCount: 220, status: 'active', joinDate: 'Jan 2024', sector: 'Cacao' },
    { id: '3', name: 'Union des Coopératives du Centre', type: 'Union', matricule: 'CI-UNION-2024-0048', phone: '+225 27 23 45 67 89', location: 'Bouaké', region: 'Centre', membersCount: 22, productsCount: 150, status: 'active', joinDate: 'Mar 2024', sector: 'Anacarde' },
    { id: '4', name: 'Union Régionale de l\'Est', type: 'Union', matricule: 'CI-UNION-2024-0056', phone: '+225 27 24 56 78 90', location: 'Abengourou', region: 'Est', membersCount: 18, productsCount: 95, status: 'inactive', joinDate: 'Avr 2024', sector: 'Café' },
  ]
  if (isUnion.value) return [
    { id: '1', name: 'SCOOP-CA Agnibilékrou', type: 'Coopérative', matricule: 'CI-COOP-2024-0125', phone: '+225 07 34 56 78 90', location: 'Agnibilékrou', region: 'Est', membersCount: 150, productsCount: 85, status: 'active', joinDate: 'Jan 2024', sector: 'Anacarde' },
    { id: '2', name: 'Coopérative des Planteurs de Café', type: 'Coopérative', matricule: 'CI-COOP-2024-0156', phone: '+225 07 45 67 89 01', location: 'Man', region: 'Ouest', membersCount: 120, productsCount: 95, status: 'active', joinDate: 'Fev 2024', sector: 'Café' },
    { id: '3', name: 'Association Femmes Agricultrices', type: 'Association', matricule: 'CI-ASSO-2024-0089', phone: '+225 05 45 67 89 01', location: 'Yamoussoukro', region: 'Centre', membersCount: 85, productsCount: 45, status: 'active', joinDate: 'Mar 2024', sector: 'Bio' },
    { id: '4', name: 'Association Jeunes Agriculteurs', type: 'Association', matricule: 'CI-ASSO-2024-0102', phone: '+225 05 56 78 90 12', location: 'Bouaké', region: 'Centre', membersCount: 62, productsCount: 32, status: 'inactive', joinDate: 'Mar 2024', sector: 'Cacao' },
  ]
  if (isInterprofession.value) return [
    { id: '1', name: 'Fédération Nationale du Cacao', type: 'Fédération', matricule: 'CI-FED-2024-0001', phone: '+225 27 20 12 34 56', location: 'Abidjan', region: 'Nationale', membersCount: 45, productsCount: 250, status: 'active', joinDate: 'Jan 2024', sector: 'Cacao' },
    { id: '2', name: 'Union des Producteurs du Sud', type: 'Union', matricule: 'CI-UNION-2024-0015', phone: '+225 27 21 23 45 67', location: 'Abidjan', region: 'Sud', membersCount: 28, productsCount: 180, status: 'active', joinDate: 'Fev 2024', sector: 'Café' },
    { id: '3', name: 'SCOOP-CA Agnibilékrou', type: 'Coopérative', matricule: 'CI-COOP-2024-0125', phone: '+225 07 34 56 78 90', location: 'Agnibilékrou', region: 'Est', membersCount: 150, productsCount: 85, status: 'active', joinDate: 'Jan 2024', sector: 'Anacarde' },
    { id: '4', name: 'Association Femmes Agricultrices', type: 'Association', matricule: 'CI-ASSO-2024-0089', phone: '+225 05 45 67 89 01', location: 'Yamoussoukro', region: 'Centre', membersCount: 85, productsCount: 45, status: 'active', joinDate: 'Mar 2024', sector: 'Bio' },
    { id: '5', name: 'Coopérative Jeunes Planteurs', type: 'Coopérative', matricule: 'CI-COOP-2024-0149', phone: '+225 07 56 78 90 12', location: 'Bouaké', region: 'Centre', membersCount: 62, productsCount: 32, status: 'inactive', joinDate: 'Mar 2024', sector: 'Cacao' },
  ]
  // Coopérative / Association - Membres individuels
  return [
    { id: '1', name: 'Kouadio Jean', type: 'Producteur', matricule: 'CI-AGRI-2024-0012', phone: '+225 07 12 34 56 78', location: 'Yamoussoukro', region: 'Centre', productsCount: 24, status: 'active', joinDate: 'Jan 2024', sector: 'Vivrier' },
    { id: '2', name: 'Aminata Traoré', type: 'Producteur', matricule: 'CI-AGRI-2024-0045', phone: '+225 05 23 45 67 89', location: 'Bouaké', region: 'Centre', productsCount: 18, status: 'active', joinDate: 'Fev 2024', sector: 'Maraîchage' },
    { id: '3', name: 'Yao Koffi', type: 'Paysan', matricule: 'CI-AGRI-2024-0078', phone: '+225 07 34 56 78 90', location: 'Korhogo', region: 'Nord', productsCount: 15, status: 'active', joinDate: 'Mar 2024', sector: 'Céréales' },
    { id: '4', name: 'Fatou Diabaté', type: 'Éleveur', matricule: 'CI-AGRI-2024-0089', phone: '+225 05 45 67 89 01', location: 'Ferkessédougou', region: 'Nord', productsCount: 12, status: 'active', joinDate: 'Mar 2024', sector: 'Élevage' },
    { id: '5', name: 'Ibrahim Coulibaly', type: 'Paysan', matricule: 'CI-AGRI-2024-0102', phone: '+225 07 56 78 90 12', location: 'Odienné', region: 'Nord-Ouest', productsCount: 8, status: 'inactive', joinDate: 'Avr 2024', sector: 'Vivrier' },
  ]
})

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(m => 
    m.name.toLowerCase().includes(query) || 
    m.matricule.toLowerCase().includes(query) ||
    m.location.toLowerCase().includes(query)
  )
})

const activeMembers = computed(() => filteredMembers.value.filter(m => m.status === 'active'))
const inactiveMembers = computed(() => filteredMembers.value.filter(m => m.status === 'inactive'))

// Stats par type
const typeStats = computed(() => {
  if (isFederation.value) {
    const unions = members.value.filter(m => m.type === 'Union').length
    return [{ label: 'Unions', count: unions, color: 'text-[#FF9800]' }, { label: 'Actives', count: activeMembers.value.length, color: 'text-green-600' }]
  }
  if (isUnion.value) {
    const coops = members.value.filter(m => m.type === 'Coopérative').length
    const assos = members.value.filter(m => m.type === 'Association').length
    return [{ label: 'Coopératives', count: coops, color: 'text-primary' }, { label: 'Associations', count: assos, color: 'text-secondary' }]
  }
  if (isInterprofession.value) {
    const feds = members.value.filter(m => m.type === 'Fédération').length
    const unions = members.value.filter(m => m.type === 'Union').length
    const coops = members.value.filter(m => m.type === 'Coopérative').length
    const assos = members.value.filter(m => m.type === 'Association').length
    return [
      { label: 'Fédérations', count: feds, color: 'text-primary' },
      { label: 'Unions', count: unions, color: 'text-secondary' },
      { label: 'Coopératives', count: coops, color: 'text-primary' },
      { label: 'Associations', count: assos, color: 'text-secondary' },
    ]
  }
  // Coopérative / Association
  const producteurs = members.value.filter(m => m.type === 'Producteur').length
  const paysans = members.value.filter(m => m.type === 'Paysan').length
  const eleveurs = members.value.filter(m => m.type === 'Éleveur').length
  return [
    { label: 'Producteurs', count: producteurs, color: 'text-primary' },
    { label: 'Paysans', count: paysans, color: 'text-secondary' },
    { label: 'Éleveurs', count: eleveurs, color: 'text-accent' },
    { label: 'Actifs', count: activeMembers.value.length, color: 'text-green-600' },
  ]
})

const isIndividualMembers = computed(() => isCooperative.value || isAssociation.value)
const headerTitle = computed(() => {
  if (isFederation.value) return 'Unions membres'
  if (isUnion.value) return 'Structures membres'
  if (isInterprofession.value) return 'Structures membres'
  return 'Membres'
})
const addButtonLabel = computed(() => {
  if (isFederation.value) return 'Enregistrer une nouvelle union'
  if (isIndividualMembers.value) return 'Enregistrer un nouveau membre'
  return 'Enregistrer une nouvelle structure'
})
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
          <h1 class="text-white text-2xl">{{ headerTitle }}</h1>
          <p class="text-white/80 text-sm">{{ members.length }} enregistrés</p>
        </div>
      </div>

      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher par nom, matricule..."
          class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>
    </div>

    <!-- Add Button -->
    <div class="p-6 pb-0">
      <Button @click="emit('navigate', 'add-member')" class="w-full">
        <Plus class="w-5 h-5 mr-2" />{{ addButtonLabel }}
      </Button>
    </div>

    <div class="p-6 space-y-6">
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3" :class="{ 'grid-cols-4': typeStats.length === 4 }">
        <Card v-for="stat in typeStats" :key="stat.label" class="p-3">
          <p :class="['text-lg font-medium', stat.color]">{{ stat.count }}</p>
          <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
        </Card>
      </div>

      <!-- Active Members -->
      <div>
        <h3 class="text-primary mb-3">{{ isIndividualMembers ? `Membres actifs (${activeMembers.length})` : `Structures actives (${activeMembers.length})` }}</h3>
        <div class="space-y-3">
          <Card v-for="member in activeMembers" :key="member.id" class="p-4">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <component :is="isIndividualMembers ? User : Building2" class="w-6 h-6 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-medium">{{ member.name }}</h4>
                    <div class="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" class="text-xs">{{ member.type }}</Badge>
                      <Badge variant="outline" class="text-xs">{{ member.matricule }}</Badge>
                      <Badge class="bg-green-600 text-xs">Actif</Badge>
                    </div>
                  </div>
                </div>

                <div class="space-y-1 text-sm text-muted-foreground">
                  <div class="flex items-center gap-2"><MapPin class="w-4 h-4" /><span>{{ member.location }} • {{ member.region }}</span></div>
                  <div class="flex items-center gap-2"><Phone class="w-4 h-4" /><span>{{ member.phone }}</span></div>
                  <div class="flex items-center gap-2"><IdCard class="w-4 h-4" /><span>Spécialité: {{ member.sector }}</span></div>
                </div>

                <div class="flex items-center justify-between mt-3 pt-3 border-t">
                  <div v-if="!isIndividualMembers">
                    <p class="text-xs text-muted-foreground">Membres</p>
                    <p class="font-medium text-primary">{{ member.membersCount }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Produits vendus</p>
                    <p class="font-medium">{{ member.productsCount }}</p>
                  </div>
                  <div v-if="isIndividualMembers">
                    <p class="text-xs text-muted-foreground">Adhésion</p>
                    <p class="font-medium text-sm">{{ member.joinDate }}</p>
                  </div>
                  <Button size="sm" variant="outline">Détails</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Inactive Members -->
      <div v-if="inactiveMembers.length > 0">
        <h3 class="text-muted-foreground mb-3">{{ isIndividualMembers ? `Membres inactifs (${inactiveMembers.length})` : `Structures inactives (${inactiveMembers.length})` }}</h3>
        <div class="space-y-3">
          <Card v-for="member in inactiveMembers" :key="member.id" class="p-4 opacity-60">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <component :is="isIndividualMembers ? User : Building2" class="w-6 h-6 text-muted-foreground" />
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-medium">{{ member.name }}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <Badge variant="outline" class="text-xs">{{ member.type }}</Badge>
                      <Badge variant="secondary" class="text-xs">Inactif</Badge>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground">{{ member.matricule }}</p>
                <p class="text-sm text-muted-foreground">{{ member.location }}</p>
                <Button size="sm" variant="outline" class="mt-2">Contacter</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
