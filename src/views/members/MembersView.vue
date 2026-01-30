<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Plus, Search, Building2, Phone, MapPin, IdCard, User, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useCooperativeStore } from '@/stores/cooperative'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import type { UserRole, Institution } from '@/types'

const props = defineProps<{ userRole: UserRole }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const authStore = useAuthStore()
const cooperativeStore = useCooperativeStore()
const isLoading = ref(false)
const rawMembers = ref<any[]>([])
const rawTeam = ref<any[]>([])
const searchQuery = ref('')
const currentTab = ref('members') // 'members' or 'team'

const isFederation = computed(() => props.userRole === 'federation')
const isUnion = computed(() => props.userRole === 'union')
const isCooperative = computed(() => props.userRole === 'cooperative')
const isAssociation = computed(() => props.userRole === 'association')
const isInterprofession = computed(() => props.userRole === 'interprofession')

const interprofessionStats = ref({
  totalFederations: 0,
  totalUnions: 0,
  totalCooperatives: 0,
  totalAssociations: 0,
  totalStrategicActors: 0
})

onMounted(async () => {
  isLoading.value = true
  try {
    let data: any[] = []
    if (isFederation.value) {
      data = await authStore.getAllUnions()
    } else if (isUnion.value) {
      const [coops, assos] = await Promise.all([
        authStore.getAllCooperatives(),
        authStore.getAllAssociations()
      ])
      data = [...coops, ...assos]
    } else if (isInterprofession.value) {
      const result = await authStore.getInterprofessionMembersCombined()
      data = result.members || []
      interprofessionStats.value = {
        totalFederations: result.totalFederations || 0,
        totalUnions: result.totalUnions || 0,
        totalCooperatives: result.totalCooperatives || 0,
        totalAssociations: result.totalAssociations || 0,
        totalStrategicActors: result.totalStrategicActors || 0
      }
    } else if (isCooperative.value || isAssociation.value) {
      // Pour une coop/asso, on fetch les membres paysans et l'équipe
      const [membersData, teamData] = await Promise.all([
        cooperativeStore.fetchMembers(),
        cooperativeStore.fetchTeam()
      ])
      data = membersData
      rawTeam.value = teamData
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
  return rawMembers.value.map(m => {
    // Si c'est un paysan/producteur (API cooperative/members)
    if (m.firstName || m.codePaysan) {
      return {
        id: m.id,
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        type: m.utilisateur?.roleActor?.name || m.memberType || 'Producteur',
        matricule: m.codePaysan || m.matricule || 'N/A',
        phone: m.utilisateur?.phoneNumber || m.phoneNumber || m.phone || 'N/A',
        location: m.address || m.village || m.location || 'N/A',
        region: m.region || 'N/A',
        membersCount: 0,
        productsCount: m.produits?.length || 0,
        status: m.status === 0 ? 'inactive' : 'active',
        joinDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A',
        sector: m.mainFiliere || (m.produits?.[0]?.categorie) || 'N/A'
      }
    }
    // Si c'est une institution
    return {
      id: m.id,
      name: m.name,
      type: m.type || (m.matricule?.includes('FED') ? 'Fédération' : 
            m.matricule?.includes('UNION') ? 'Union' : 
            m.matricule?.includes('COOP') ? 'Coopérative' : 'Association'),
      matricule: m.matricule || 'N/A',
      phone: m.contactPhone || m.phone || 'N/A',
      location: m.adresse || m.location || 'N/A',
      region: m.region || 'N/A',
      membersCount: m.numberOfMembers || 0,
      productsCount: 0,
      status: m.isActive === false ? 'inactive' : 'active',
      joinDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A',
      sector: m.filiere?.libelle || 'N/A'
    }
  })
})

const team = computed(() => {
  return rawTeam.value.map(t => ({
    id: t.id,
    name: t.fullName,
    role: t.role,
    phone: t.phoneNumber,
    email: t.email,
    status: 'active'
  }))
})

const filteredMembers = computed(() => {
  const list = currentTab.value === 'members' ? members.value : team.value
  if (!searchQuery.value) return list
  const query = searchQuery.value.toLowerCase()
  return list.filter((m: any) => 
    (m.name || '').toLowerCase().includes(query) || 
    (m.matricule || '').toLowerCase().includes(query) ||
    (m.role || '').toLowerCase().includes(query) ||
    (m.location || '').toLowerCase().includes(query)
  )
})

const activeMembers = computed(() => filteredMembers.value.filter((m: any) => m.status === 'active'))
const inactiveMembers = computed(() => filteredMembers.value.filter((m: any) => m.status === 'inactive'))

// Stats par type
const typeStats = computed(() => {
  if (isFederation.value) {
    const unions = members.value.length // All fetched items are Unions
    return [{ label: 'Unions', count: unions, color: 'text-[#FF9800]' }, { label: 'Actives', count: activeMembers.value.length, color: 'text-green-600' }]
  }
  if (isUnion.value) {
    const coops = members.value.filter(m => m.type === 'Coopérative').length
    const assos = members.value.filter(m => m.type === 'Association').length
    return [{ label: 'Coopératives', count: coops, color: 'text-primary' }, { label: 'Associations', count: assos, color: 'text-secondary' }]
  }
  if (isInterprofession.value) {
    return [
      { label: 'Fédérations', count: interprofessionStats.value.totalFederations, color: 'text-primary' },
      { label: 'Unions', count: interprofessionStats.value.totalUnions, color: 'text-secondary' },
      { label: 'Coopératives', count: interprofessionStats.value.totalCooperatives, color: 'text-primary' },
      { label: 'Associations', count: interprofessionStats.value.totalAssociations, color: 'text-secondary' },
    ]
  }
  // Coopérative / Association
  const totalMembres = members.value.length
  const totalTeam = team.value.length
  return [
    { label: 'Membres', count: totalMembres, color: 'text-primary' },
    { label: 'Équipe', count: totalTeam, color: 'text-secondary' },
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
    <div class="bg-gradient-to-br from-primary via-primary-dark to-primary-darker text-white p-6">
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
    <div class="p-6 pb-0 flex flex-col gap-4">
      <Button @click="emit('navigate', 'add-member')" class="w-full">
        <Plus class="w-5 h-5 mr-2" />{{ addButtonLabel }}
      </Button>

      <!-- Tabs for Cooperative/Association -->
      <div v-if="isCooperative || isAssociation" class="flex w-full bg-muted rounded-lg p-1">
        <button 
          @click="currentTab = 'members'" 
          :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', currentTab === 'members' ? 'bg-background shadow' : 'text-muted-foreground']"
        >Membres</button>
        <button 
          @click="currentTab = 'team'" 
          :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', currentTab === 'team' ? 'bg-background shadow' : 'text-muted-foreground']"
        >Équipe</button>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <div v-if="isLoading" class="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 class="w-10 h-10 text-primary animate-spin" />
        <p class="text-muted-foreground font-medium">Récupération des données...</p>
      </div>

      <template v-else>
        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3" :class="{ 'grid-cols-4': typeStats.length === 4 }">
          <Card v-for="stat in typeStats" :key="stat.label" class="p-3">
            <p :class="['text-lg font-medium', stat.color]">{{ stat.count }}</p>
            <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
          </Card>
        </div>

        <!-- List -->
        <div>
          <h3 class="text-primary mb-3">
            {{ currentTab === 'members' ? (isIndividualMembers ? `Membres actifs (${activeMembers.length})` : `Structures actives (${activeMembers.length})`) : `Membres de l'équipe (${activeMembers.length})` }}
          </h3>
          <div v-if="activeMembers.length === 0" class="text-center p-8 bg-muted/20 rounded-xl">
             <p class="text-muted-foreground">Aucun résultat trouvé</p>
          </div>
          <div v-else class="space-y-3">
            <Card v-for="item in (activeMembers as any[])" :key="item.id" class="p-4">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <component :is="currentTab === 'team' ? User : (isIndividualMembers ? User : Building2)" class="w-6 h-6 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h4 class="font-medium">{{ item.name }}</h4>
                      <div class="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" class="text-xs">{{ currentTab === 'team' ? item.role : item.type }}</Badge>
                        <Badge v-if="currentTab === 'members'" variant="outline" class="text-xs">{{ item.matricule }}</Badge>
                        <Badge class="bg-green-600 text-xs text-white border-0">Actif</Badge>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-1 text-sm text-muted-foreground">
                    <div v-if="item.location" class="flex items-center gap-2"><MapPin class="w-4 h-4" /><span>{{ item.location }}</span></div>
                    <div class="flex items-center gap-2"><Phone class="w-4 h-4" /><span>{{ item.phone }}</span></div>
                    <div v-if="currentTab === 'team' && item.email" class="flex items-center gap-2 font-mono text-xs"><span class="text-primary">@</span><span>{{ item.email }}</span></div>
                    <div v-if="currentTab === 'members' && item.sector" class="flex items-center gap-2"><IdCard class="w-4 h-4" /><span>Spécialité: {{ item.sector }}</span></div>
                  </div>

                  <div class="flex items-center justify-between mt-3 pt-3 border-t">
                    <template v-if="currentTab === 'members'">
                      <div v-if="!isIndividualMembers">
                        <p class="text-xs text-muted-foreground">Membres</p>
                        <p class="font-medium text-primary">{{ item.membersCount }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-muted-foreground">Produits vendus</p>
                        <p class="font-medium">{{ item.productsCount || 0 }}</p>
                      </div>
                      <div v-if="isIndividualMembers">
                        <p class="text-xs text-muted-foreground">Adhésion</p>
                        <p class="font-medium text-sm">{{ item.joinDate }}</p>
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex-1">
                        <p class="text-xs text-muted-foreground">Accès</p>
                        <p class="font-medium text-xs text-primary">Tableau de bord complet</p>
                      </div>
                    </template>
                    <Button size="sm" variant="outline">Gérer</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <!-- Inactive Elements -->
        <div v-if="inactiveMembers.length > 0">
          <h3 class="text-muted-foreground mb-3 text-sm uppercase font-semibold">Éléments inactifs ({{ inactiveMembers.length }})</h3>
          <div class="space-y-3">
            <Card v-for="item in (inactiveMembers as any[])" :key="item.id" class="p-4 opacity-75 grayscale bg-muted/30">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <component :is="currentTab === 'team' ? User : (isIndividualMembers ? User : Building2)" class="w-6 h-6 text-muted-foreground" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h4 class="font-medium">{{ item.name }}</h4>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge variant="outline" class="text-xs">{{ currentTab === 'team' ? item.role : item.type }}</Badge>
                        <Badge variant="secondary" class="text-xs">Inactif</Badge>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1 text-sm text-muted-foreground">
                    <div v-if="item.matricule" class="text-xs font-mono">{{ item.matricule }}</div>
                    <div v-if="item.location" class="flex items-center gap-2 text-xs"><MapPin class="w-3 h-3" />{{ item.location }}</div>
                  </div>
                  <Button size="sm" variant="outline" class="mt-3">Réactiver</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
