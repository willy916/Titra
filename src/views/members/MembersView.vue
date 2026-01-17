<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Plus, Search, Building2, Phone, MapPin, IdCard, User, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import type { UserRole, Institution } from '@/types'

const props = defineProps<{ userRole: UserRole }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const authStore = useAuthStore()
const isLoading = ref(false)
const rawMembers = ref<Institution[]>([])
const searchQuery = ref('')

const isFederation = computed(() => props.userRole === 'federation')
const isUnion = computed(() => props.userRole === 'union')
const isCooperative = computed(() => props.userRole === 'cooperative')
const isAssociation = computed(() => props.userRole === 'association')
const isInterprofession = computed(() => props.userRole === 'interprofession')

onMounted(async () => {
  isLoading.value = true
  try {
    let data: Institution[] = []
    if (isFederation.value) {
      data = await authStore.getAllUnions()
    } else if (isUnion.value) {
      // Pour une union, on montre coops et assos
      const [coops, assos] = await Promise.all([
        authStore.getAllCooperatives(),
        authStore.getAllAssociations()
      ])
      data = [...coops, ...assos]
    } else if (isInterprofession.value) {
      const [feds, unis, coops, assos] = await Promise.all([
        authStore.getAllFederations(),
        authStore.getAllUnions(),
        authStore.getAllCooperatives(),
        authStore.getAllAssociations()
      ])
      data = [...feds, ...unis, ...coops, ...assos]
    } else if (isCooperative.value || isAssociation.value) {
      // Pour une coop/asso, on montrerait normalement les paysans, 
      // mais en l'absence d'API paysan/all, on montre au moins les autres coops/assos pour l'exemple
      // ou on attend l'API dédiée. Pour respecter la demande, on tente de fetch.
      const coops = await authStore.getAllCooperatives()
      data = coops
    }
    rawMembers.value = data
  } catch (error) {
    console.error('Failed to fetch members:', error)
  } finally {
    isLoading.value = false
  }
})

// Données mappées
const members = computed(() => {
  return rawMembers.value.map(m => ({
    id: m.id,
    name: m.name,
    type: m.matricule?.startsWith('CI-FED') ? 'Fédération' : 
          m.matricule?.startsWith('CI-UNION') ? 'Union' : 
          m.matricule?.startsWith('CI-COOP') ? 'Coopérative' : 'Association',
    matricule: m.matricule || 'N/A',
    phone: m.contactPhone || 'N/A',
    location: m.adresse || 'N/A',
    region: 'N/A',
    membersCount: m.numberOfMembers || 0,
    productsCount: 0,
    status: 'active',
    joinDate: new Date(m.createdAt).toLocaleDateString(),
    sector: m.filiere?.libelle || 'N/A'
  }))
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
      <div v-if="isLoading" class="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 class="w-10 h-10 text-primary animate-spin" />
        <p class="text-muted-foreground font-medium">Récupération des membres...</p>
      </div>

      <template v-else>
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
          <div v-if="activeMembers.length === 0" class="text-center p-8 bg-muted/20 rounded-xl">
             <p class="text-muted-foreground">Aucun membre actif trouvé</p>
          </div>
          <div v-else class="space-y-3">
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
                    <div class="flex items-center gap-2"><MapPin class="w-4 h-4" /><span>{{ member.location }}</span></div>
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
      </template>
    </div>
  </div>
</template>
