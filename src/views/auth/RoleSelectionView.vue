<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Wheat, 
  Cog, 
  Store, 
  Truck, 
  ShoppingBag, 
  Building2, 
  Users, 
  Building, 
  Globe, 
  GraduationCap 
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

interface Role {
  id: UserRole
  label: string
  icon: typeof Wheat
  description: string
  category: 'individual' | 'institution' | 'independent'
}

const emit = defineEmits<{
  'select-role': [role: UserRole]
}>()

const authStore = useAuthStore()
const selectedRole = ref<UserRole | null>(null)
const availableRoleNames = ref<string[]>([])

onMounted(async () => {
  try {
    const rolesData = await authStore.getAllRoles()
    // On extrait uniquement les noms des rôles depuis le tableau d'objets renvoyé par l'API
    const rawRoles = rolesData.body || rolesData
    if (Array.isArray(rawRoles)) {
      availableRoleNames.value = rawRoles.map((r: any) => r.name)
    }
    console.log('Rôles disponibles du backend:', availableRoleNames.value)
  } catch (error) {
    toast.error('Erreur lors de la récupération des rôles')
  }
})

const roles: Role[] = [
  // Individual Roles
  {
    id: 'farmer',
    label: 'Paysan / Producteur',
    icon: Wheat,
    description: 'Je cultive et vends mes produits agricoles',
    category: 'individual',
  },
  {
    id: 'processor',
    label: 'Transformateur',
    icon: Cog,
    description: 'Je transforme les produits agricoles',
    category: 'individual',
  },
  {
    id: 'merchant',
    label: 'Commerçant',
    icon: Store,
    description: "J'achète et revends des produits",
    category: 'individual',
  },
  {
    id: 'transporter',
    label: 'Transporteur',
    icon: Truck,
    description: "J'assure la livraison des produits",
    category: 'individual',
  },
  {
    id: 'consumer',
    label: 'Consommateur',
    icon: ShoppingBag,
    description: "J'achète des produits pour ma consommation",
    category: 'individual',
  },
  // Independent
  {
    id: 'independent',
    label: 'Formation',
    icon: GraduationCap,
    description: 'Centre de formation agricole et agroalimentaire',
    category: 'independent',
  },
  // Institutional Roles
  {
    id: 'cooperative',
    label: 'Coopérative',
    icon: Building2,
    description: 'Structure de base regroupant des producteurs',
    category: 'institution',
  },
  {
    id: 'association',
    label: 'Association',
    icon: Users,
    description: "Groupement de producteurs ou d'acteurs",
    category: 'institution',
  },
  {
    id: 'union',
    label: 'Union',
    icon: Building,
    description: 'Regroupement de coopératives ou associations',
    category: 'institution',
  },
  {
    id: 'federation',
    label: 'Fédération',
    icon: Globe,
    description: 'Structure régionale ou nationale de coordination',
    category: 'institution',
  },
  {
    id: 'interprofession',
    label: 'Interprofession',
    icon: Globe,
    description: 'Organisation transversale de filière agricole',
    category: 'institution',
  },
]

const roleMapping: Record<string, string> = {
  farmer: 'PAYSAN',
  processor: 'TRANSFORMATEUR',
  merchant: 'COMMERCANT',
  transporter: 'TRANSPORTEUR',
  consumer: 'CONSOMMATEUR',
  independent: 'FORMATION',
  cooperative: 'COOPERATIVE',
  association: 'ASSOCIATION',
  union: 'UNION',
  federation: 'FEDERATION',
  interprofession: 'INTERPROFESSION'
}

// Filter roles based on what the API returned
const filteredRoles = computed(() => {
  if (availableRoleNames.value.length === 0) return roles
  return roles.filter(r => {
    const apiName = roleMapping[r.id]
    return availableRoleNames.value.includes(apiName)
  })
})

const individualRoles = computed(() => filteredRoles.value.filter(r => r.category === 'individual'))
const independentRoles = computed(() => filteredRoles.value.filter(r => r.category === 'independent'))
const institutionalRoles = computed(() => filteredRoles.value.filter(r => r.category === 'institution'))

function selectRole(roleId: UserRole) {
  selectedRole.value = roleId
}

async function handleContinue() {
  if (selectedRole.value) {
    try {
      // On récupère le nom exact attendu par l'API via le mapping
      const apiName = roleMapping[selectedRole.value]
      
      await authStore.setAnyRole(apiName)
      emit('select-role', selectedRole.value)
    } catch (error) {
      toast.error('Erreur lors du choix du rôle')
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header - Fixed -->
    <div class="sticky top-0 z-10 bg-background border-b p-6">
      <div class="max-w-2xl w-full mx-auto">
        <div class="space-y-2 text-center">
          <h1>Choisissez votre rôle</h1>
          <p class="text-muted-foreground">
            Sélectionnez le rôle qui correspond à votre activité
          </p>
        </div>
      </div>
    </div>

    <!-- Content - Scrollable -->
    <div class="flex-1 overflow-y-auto p-6 pb-32">
      <div class="max-w-2xl w-full mx-auto space-y-8">
        <!-- Individual Roles Section -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-foreground">Profils individuels</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              v-for="role in individualRoles"
              :key="role.id"
              class="p-6 cursor-pointer transition-all hover:shadow-lg"
              :class="selectedRole === role.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-border hover:border-primary/50'"
              @click="selectRole(role.id)"
            >
              <div class="flex flex-col items-center text-center gap-3">
                <div
                  class="p-4 rounded-full"
                  :class="selectedRole === role.id ? 'bg-primary text-white' : 'bg-muted'"
                >
                  <component :is="role.icon" class="w-8 h-8" />
                </div>
                <div class="space-y-1">
                  <h3 :class="selectedRole === role.id ? 'text-primary' : ''">
                    {{ role.label }}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {{ role.description }}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <!-- Independent Roles Section -->
        <div class="space-y-4">
          <div class="space-y-2">
            <h2 class="text-lg font-semibold text-foreground">Indépendants</h2>
            <p class="text-sm text-muted-foreground">
              Ces acteurs travaillent sans affiliation à une structure
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              v-for="role in independentRoles"
              :key="role.id"
              class="p-6 cursor-pointer transition-all hover:shadow-lg"
              :class="selectedRole === role.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-border hover:border-primary/50'"
              @click="selectRole(role.id)"
            >
              <div class="flex flex-col items-center text-center gap-3">
                <div
                  class="p-4 rounded-full"
                  :class="selectedRole === role.id ? 'bg-primary text-white' : 'bg-muted'"
                >
                  <component :is="role.icon" class="w-8 h-8" />
                </div>
                <div class="space-y-1">
                  <h3 :class="selectedRole === role.id ? 'text-primary' : ''">
                    {{ role.label }}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {{ role.description }}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <!-- Institutional Roles Section -->
        <div class="space-y-4">
          <div class="space-y-2">
            <h2 class="text-lg font-semibold text-foreground">Structures institutionnelles</h2>
            <p class="text-sm text-muted-foreground">
              Ces structures peuvent produire, transformer, vendre et gérer leurs membres
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              v-for="role in institutionalRoles"
              :key="role.id"
              class="p-6 cursor-pointer transition-all hover:shadow-lg"
              :class="selectedRole === role.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-border hover:border-primary/50'"
              @click="selectRole(role.id)"
            >
              <div class="flex flex-col items-center text-center gap-3">
                <div
                  class="p-4 rounded-full"
                  :class="selectedRole === role.id ? 'bg-primary text-white' : 'bg-muted'"
                >
                  <component :is="role.icon" class="w-8 h-8" />
                </div>
                <div class="space-y-1">
                  <h3 :class="selectedRole === role.id ? 'text-primary' : ''">
                    {{ role.label }}
                  </h3>
                  <p class="text-sm text-muted-foreground">
                    {{ role.description }}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Button - Fixed at bottom -->
    <div class="sticky bottom-0 z-10 bg-background border-t p-6">
      <div class="max-w-2xl w-full mx-auto">
        <Button
          :disabled="!selectedRole || authStore.isLoading"
          :loading="authStore.isLoading"
          class="w-full h-12"
          @click="handleContinue"
        >
          Continuer
        </Button>
      </div>
    </div>
  </div>
</template>
