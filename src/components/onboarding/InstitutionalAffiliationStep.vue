<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Building2, CheckCircle2, Info, Edit } from 'lucide-vue-next'
import type { UserRole } from '@/types'
import Label from '@/components/ui/Label.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'

interface Props {
  userRole: UserRole
  selectedAffiliation?: string
  canBeIndependent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canBeIndependent: false,
})

const emit = defineEmits<{
  select: [affiliationId: string, affiliationName: string, affiliationType: string]
  skip: []
}>()

// Mock data - En production, cela viendrait de Supabase
const mockStructures = {
  interprofessions: [
    { id: 'ip-001', name: 'Conseil Café-Cacao (CCC)', type: 'interprofession', filiere: 'Cacao, Café' },
    { id: 'ip-002', name: 'Interprofession Cajou (ICA)', type: 'interprofession', filiere: 'Anacarde' },
    { id: 'ip-003', name: 'Intercoton', type: 'interprofession', filiere: 'Coton' },
    { id: 'ip-004', name: 'Interprofession Palmier à Huile', type: 'interprofession', filiere: 'Palmier' },
    { id: 'ip-005', name: 'Instance Nationale Agriculture CI', type: 'interprofession', filiere: 'Toutes filières' },
  ],
  federations: [
    { id: 'fed-001', name: 'Fédération Nationale du Cacao (FNCC)', type: 'federation', interprofession: 'ip-001', region: 'Nationale' },
    { id: 'fed-002', name: 'Fédération des Producteurs de Café', type: 'federation', interprofession: 'ip-001', region: 'Nationale' },
    { id: 'fed-003', name: 'Fédération Anacarde du Sud', type: 'federation', interprofession: 'ip-002', region: 'Sud' },
    { id: 'fed-004', name: 'Fédération du Centre-Ouest', type: 'federation', interprofession: 'ip-001', region: 'Centre-Ouest' },
  ],
  unions: [
    { id: 'uni-001', name: 'Union Régionale des Coopératives Agricoles CI (URCACI)', type: 'union', federation: 'fed-001', region: 'Abidjan' },
    { id: 'uni-002', name: 'Union des Producteurs du Sud', type: 'union', federation: 'fed-001', region: 'Sud' },
    { id: 'uni-003', name: 'Union Centre-Ouest Cacao', type: 'union', federation: 'fed-004', region: 'Centre-Ouest' },
    { id: 'uni-004', name: 'Union Anacarde Bondoukou', type: 'union', federation: 'fed-003', region: 'Est' },
  ],
  cooperatives: [
    { id: 'coop-001', name: 'SCOOP-CA Agnibilékrou', type: 'cooperative', union: 'uni-001', location: 'Agnibilékrou' },
    { id: 'coop-002', name: 'Coopérative des Planteurs de Divo', type: 'cooperative', union: 'uni-002', location: 'Divo' },
    { id: 'coop-003', name: 'COOP Cacao Gagnoa', type: 'cooperative', union: 'uni-003', location: 'Gagnoa' },
    { id: 'coop-004', name: 'SCOOP Anacarde Bondoukou', type: 'cooperative', union: 'uni-004', location: 'Bondoukou' },
    { id: 'coop-005', name: 'Coopérative Jeunes Agriculteurs Yamoussoukro', type: 'cooperative', union: 'uni-001', location: 'Yamoussoukro' },
  ],
  associations: [
    { id: 'asso-001', name: 'Association des Producteurs de Café Bio', type: 'association', union: 'uni-001', location: 'Abidjan' },
    { id: 'asso-002', name: 'Association Femmes Agricultrices du Sud', type: 'association', union: 'uni-002', location: 'Sud' },
    { id: 'asso-003', name: 'Association Jeunes Planteurs Anacarde', type: 'association', union: 'uni-004', location: 'Bondoukou' },
  ],
}

const searchTerm = ref('')
const selected = ref(props.selectedAffiliation || '')
const isManualEntry = ref(false)
const manualStructureName = ref('')
const manualStructureLocation = ref('')

// Déterminer quelle liste de structures afficher selon le rôle
const affiliationInfo = computed(() => {
  switch (props.userRole) {
    case 'farmer':
      return {
        title: 'Sélectionnez votre Coopérative ou Association',
        description: "Choisissez la structure à laquelle vous appartenez. Si vous n'êtes affilié à aucune structure, vous serez enregistré comme producteur indépendant.",
        structures: [...mockStructures.cooperatives, ...mockStructures.associations],
        canSkip: true,
      }
    case 'cooperative':
    case 'association':
      return {
        title: 'Sélectionnez votre Union ou Fédération',
        description: "Choisissez l'union ou la fédération dont vous dépendez. Vous pouvez être indépendant si vous n'êtes pas encore rattaché.",
        structures: [...mockStructures.unions, ...mockStructures.federations],
        canSkip: true,
      }
    case 'union':
      return {
        title: 'Sélectionnez votre Fédération',
        description: 'Choisissez la fédération dont vous dépendez.',
        structures: mockStructures.federations,
        canSkip: false,
      }
    case 'federation':
      return {
        title: 'Sélectionnez votre Interprofession',
        description: "Choisissez l'interprofession dont vous dépendez.",
        structures: mockStructures.interprofessions,
        canSkip: false,
      }
    case 'interprofession':
      return {
        title: 'Rattachement à une instance nationale (optionnel)',
        description: 'Vous pouvez être indépendante ou rattachée à une instance nationale.',
        structures: mockStructures.interprofessions.filter(ip => ip.filiere === 'Toutes filières'),
        canSkip: true,
      }
    default:
      return {
        title: 'Affiliation institutionnelle',
        description: 'Sélectionnez votre structure de rattachement.',
        structures: [],
        canSkip: true,
      }
  }
})

const filteredStructures = computed(() => {
  return affiliationInfo.value.structures.filter((structure) =>
    structure.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

function handleSelect(structure: { id: string; name: string; type: string }) {
  selected.value = structure.id
  emit('select', structure.id, structure.name, structure.type)
}

function handleSelectIndependent() {
  selected.value = 'independent'
  emit('select', 'independent', 'Indépendant', 'independent')
}

function handleManualEntry() {
  isManualEntry.value = true
}

function handleCancelManualEntry() {
  isManualEntry.value = false
  manualStructureName.value = ''
  manualStructureLocation.value = ''
}

function handleManualSubmit() {
  if (manualStructureName.value && manualStructureLocation.value) {
    const newId = `manual-${Date.now()}`
    selected.value = newId
    emit('select', newId, manualStructureName.value, 'manual')
    isManualEntry.value = false
  }
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cooperative: 'Coopérative',
    association: 'Association',
    union: 'Union',
    federation: 'Fédération',
    interprofession: 'Interprofession',
  }
  return labels[type] || type
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Info Card -->
    <Card class="p-3 sm:p-4 bg-primary/5 border-primary/20">
      <div class="flex items-start gap-2 sm:gap-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Info class="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-primary mb-1 text-sm sm:text-base">Affiliation institutionnelle</h3>
          <p class="text-xs sm:text-sm text-muted-foreground">
            {{ affiliationInfo.description }}
          </p>
        </div>
      </div>
    </Card>

    <!-- Search -->
    <div class="space-y-2">
      <Label for="search" class="text-sm sm:text-base">{{ affiliationInfo.title }}</Label>
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          id="search"
          v-model="searchTerm"
          placeholder="Rechercher par nom..."
          class="pl-9 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base"
        />
      </div>
    </div>

    <!-- Option indépendant - TOUJOURS EN HAUT -->
    <Card
      v-if="affiliationInfo.canSkip || canBeIndependent"
      class="p-3 sm:p-4 cursor-pointer transition-all"
      :class="[
        selected === 'independent'
          ? 'bg-primary/10 border-primary'
          : 'hover:bg-muted/50 active:bg-muted/50'
      ]"
      @click="handleSelectIndependent"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Building2 class="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm sm:text-base">Je suis indépendant(e)</h4>
            <p class="text-xs sm:text-sm text-muted-foreground truncate">
              Non affilié à une structure
            </p>
          </div>
        </div>
        <CheckCircle2
          v-if="selected === 'independent'"
          class="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0"
        />
      </div>
    </Card>

    <!-- Séparateur -->
    <div
      v-if="affiliationInfo.canSkip || canBeIndependent"
      class="flex items-center gap-2 sm:gap-3 my-3 sm:my-4"
    >
      <div class="flex-1 h-px bg-border" />
      <span class="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">OU</span>
      <div class="flex-1 h-px bg-border" />
    </div>

    <!-- Liste des structures -->
    <div class="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
      <template v-if="filteredStructures.length > 0">
        <Card
          v-for="structure in filteredStructures"
          :key="structure.id"
          class="p-3 sm:p-4 cursor-pointer transition-all"
          :class="[
            selected === structure.id
              ? 'bg-primary/10 border-primary'
              : 'hover:bg-muted/50 active:bg-muted/50'
          ]"
          @click="handleSelect(structure)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 class="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium mb-1 text-sm sm:text-base line-clamp-2">{{ structure.name }}</h4>
                <div class="flex flex-wrap gap-1 sm:gap-2">
                  <Badge variant="outline" class="text-xs">
                    {{ getTypeLabel(structure.type) }}
                  </Badge>
                  <Badge
                    v-if="(structure as any).location"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ (structure as any).location }}
                  </Badge>
                  <Badge
                    v-if="(structure as any).region"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ (structure as any).region }}
                  </Badge>
                  <Badge
                    v-if="(structure as any).filiere"
                    variant="secondary"
                    class="text-xs truncate max-w-[120px] sm:max-w-none"
                  >
                    {{ (structure as any).filiere }}
                  </Badge>
                </div>
              </div>
            </div>
            <CheckCircle2
              v-if="selected === structure.id"
              class="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0"
            />
          </div>
        </Card>
      </template>
      
      <Card v-else class="p-6 sm:p-8 text-center">
        <p class="text-sm sm:text-base text-muted-foreground">Aucune structure trouvée</p>
        <p v-if="affiliationInfo.canSkip" class="text-xs sm:text-sm text-muted-foreground mt-2">
          Vous pouvez continuer sans affiliation
        </p>
      </Card>
    </div>

    <!-- Séparateur pour l'option manuelle -->
    <div class="flex items-center gap-2 sm:gap-3 my-3 sm:my-4">
      <div class="flex-1 h-px bg-border" />
      <span class="text-[10px] sm:text-sm text-muted-foreground whitespace-nowrap px-1">STRUCTURE NON RÉPERTORIÉE ?</span>
      <div class="flex-1 h-px bg-border" />
    </div>

    <!-- Option d'entrée manuelle -->
    <Card
      v-if="!isManualEntry"
      class="p-3 sm:p-4 bg-orange-50 border-orange-200"
    >
      <div class="flex items-start gap-2 sm:gap-3 mb-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Edit class="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-orange-900 mb-1 text-sm sm:text-base">Saisie manuelle</h4>
          <p class="text-xs sm:text-sm text-orange-700">
            Si votre structure n'existe pas encore dans la liste, vous pouvez l'ajouter manuellement
          </p>
        </div>
      </div>
      <Button
        class="w-full bg-orange-600 hover:bg-orange-700 text-white h-10 sm:h-11 text-sm sm:text-base"
        @click="handleManualEntry"
      >
        <Edit class="w-4 h-4 mr-2" />
        Saisir manuellement
      </Button>
    </Card>

    <!-- Formulaire de saisie manuelle -->
    <Card
      v-else
      class="p-3 sm:p-4 bg-orange-50 border-orange-200"
    >
      <div class="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Edit class="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-orange-900 mb-1 text-sm sm:text-base">Saisie manuelle</h4>
          <p class="text-xs sm:text-sm text-orange-700">
            Entrez les informations de votre structure
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="space-y-2">
          <Label for="manualName" class="text-sm sm:text-base">Nom de la structure *</Label>
          <Input
            id="manualName"
            v-model="manualStructureName"
            placeholder="Ex: Coopérative des Planteurs de Bouaké"
            class="h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        <div class="space-y-2">
          <Label for="manualLocation" class="text-sm sm:text-base">Localisation *</Label>
          <Input
            id="manualLocation"
            v-model="manualStructureLocation"
            placeholder="Ex: Bouaké, Centre"
            class="h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>

        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
          <Button
            variant="outline"
            class="flex-1 h-10 sm:h-11 text-sm sm:text-base order-2 sm:order-1"
            @click="handleCancelManualEntry"
          >
            Annuler
          </Button>
          <Button
            :disabled="!manualStructureName || !manualStructureLocation"
            class="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-10 sm:h-11 text-sm sm:text-base order-1 sm:order-2"
            @click="handleManualSubmit"
          >
            Valider
          </Button>
        </div>

        <Card class="p-2 sm:p-3 bg-blue-50 border-blue-200 mt-3">
          <p class="text-xs text-blue-700">
            💡 Les informations seront vérifiées après votre inscription
          </p>
        </Card>
      </div>
    </Card>
  </div>
</template>
