<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, TrendingUp, TrendingDown, FileText, Download, Plus, ShoppingCart, Package, Truck, Users, Sprout, Factory, Store, Landmark, Loader2, X } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Textarea from '@/components/ui/Textarea.vue'
import type { UserRole } from '@/types'
import { usePaysanStore } from '@/stores/paysan'
import { toast } from 'vue-sonner'

const props = defineProps<{ userRole: UserRole }>()
const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const paysanStore = usePaysanStore()
const activeTab = ref('all')
const isLoading = ref(false)
const showEntryModal = ref(false)

// Form for new entry
const entryForm = ref({
  type: 'EXPENSE' as 'EXPENSE' | 'REVENUE',
  categorie: 'INTRANTS',
  libelle: '',
  montant: '',
  description: ''
})

const categoriesData = {
  REVENUE: [
    { value: 'VENTE_PRODUITS', label: 'Vente de produits' },
    { value: 'AUTRE', label: 'Autre revenu' }
  ],
  EXPENSE: [
    { value: 'INTRANTS', label: 'Intrants (Engrais, Semences)' },
    { value: 'MAIN_DOEUVRE', label: "Main d'œuvre" },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'EQUIPEMENT', label: 'Équipement' },
    { value: 'LOCATION_MATERIEL', label: 'Location de matériel' },
    { value: 'AUTRE', label: 'Autre dépense' }
  ]
}

onMounted(async () => {
  const needsData = props.userRole === 'farmer' || 
    ['cooperative', 'association', 'union', 'federation', 'interprofession'].includes(props.userRole)

  if (needsData) {
    isLoading.value = true
    try {
      await paysanStore.fetchAccountingDashboard()
    } catch (e) {
      toast.error('Erreur lors du chargement des données comptables')
    } finally {
      isLoading.value = false
    }
  }
})

async function handleAddEntry() {
  if (!entryForm.value.libelle || !entryForm.value.montant) {
    toast.error('Veuillez remplir les champs obligatoires')
    return
  }

  try {
    await paysanStore.addAccountingEntry({
      type: entryForm.value.type,
      categorie: entryForm.value.categorie,
      libelle: entryForm.value.libelle,
      montant: parseFloat(entryForm.value.montant),
      description: entryForm.value.description
    })
    toast.success('Écriture enregistrée !')
    showEntryModal.value = false
    // Reset form
    entryForm.value = {
      type: 'EXPENSE',
      categorie: 'INTRANTS',
      libelle: '',
      montant: '',
      description: ''
    }
  } catch (e) {
    toast.error("Erreur lors de l'enregistrement")
  }
}

const accountingDashboard = computed(() => paysanStore.accountingDashboard || {
  totalRevenus: 0,
  tendanceRevenus: "0% ce mois",
  totalDepenses: 0,
  tendanceDepenses: "0% ce mois",
  beneficeNet: 0,
  tendanceBenefice: "0% ce mois",
  entries: []
})

const getAccountingData = () => {
  const isInstitutional = ['farmer', 'cooperative', 'association', 'union', 'federation', 'interprofession'].includes(props.userRole)
  
  if (isInstitutional) {
     return {
        metrics: [
          { label: 'Revenus (Ventes)', value: accountingDashboard.value.totalRevenus || 0, trend: accountingDashboard.value.tendanceRevenus, icon: TrendingUp, color: 'success' },
          { label: 'Dépenses et Charges', value: accountingDashboard.value.totalDepenses || 0, trend: accountingDashboard.value.tendanceDepenses, icon: Sprout, color: 'destructive' },
          { label: 'Bénéfice net', value: accountingDashboard.value.beneficeNet || 0, trend: accountingDashboard.value.tendanceBenefice, icon: FileText, color: 'primary' },
        ],
        transactions: (accountingDashboard.value.entries || []).map((e: any) => ({
           id: e.id,
           date: e.date || e.entryDate,
           type: (e.formatType || e.type || '').split('_')[0].toLowerCase(), 
           category: e.categorie,
           amount: e.montant,
           description: e.libelle
        }))
     }
  }

  const data: Record<string, any> = {
    consumer: {
      metrics: [
        { label: 'Total dépensé', value: 450000, trend: '+12% ce mois', icon: ShoppingCart, color: 'destructive' },
        { label: 'Commandes ce mois', value: 8, trend: '+3 ce mois', icon: Package, color: 'primary', isCount: true },
        { label: 'Économisé (promos)', value: 35000, trend: '-18% ce mois', icon: TrendingDown, color: 'success' },
      ],
      transactions: [
        { id: '1', date: '20/12/2024', type: 'expense', category: 'Légumes', amount: 25000, description: 'Tomates, oignons, piment' },
        { id: '2', date: '18/12/2024', type: 'expense', category: 'Céréales', amount: 35000, description: 'Riz 25kg' },
        { id: '3', date: '15/12/2024', type: 'expense', category: 'Fruits', amount: 18000, description: 'Bananes, mangues' },
      ],
    },
    default: {
      metrics: [
        { label: 'Revenus totaux', value: 3450000, trend: '+20% ce mois', icon: Landmark, color: 'success' },
        { label: 'Dépenses gestion', value: 1280000, trend: '+5% ce mois', icon: Users, color: 'destructive' },
        { label: 'Fonds disponibles', value: 2170000, trend: '+35% ce mois', icon: TrendingUp, color: 'primary' },
      ],
      transactions: [
        { id: '1', date: '20/12/2024', type: 'revenue', category: 'Ventes directes', amount: 485000, description: 'Vente groupée café' },
        { id: '2', date: '18/12/2024', type: 'revenue', category: 'Commissions', amount: 125000, description: 'Commission 3%' },
        { id: '3', date: '15/12/2024', type: 'expense', category: 'Salaires', amount: 285000, description: 'Salaires personnel' },
      ],
    },
  }
  return data[props.userRole] || data.default
}

const accountingData = computed(() => getAccountingData())

const getRoleInfo = () => {
  const infos: Record<string, { title: string; description: string; icon: any }> = {
    consumer: { title: "Mon Historique d'achats", description: 'Consultez vos dépenses sur TITRA', icon: ShoppingCart },
    farmer: { title: 'Ma Comptabilité Agricole', description: "Revenus de ventes, dépenses en intrants et main d'œuvre", icon: Sprout },
    processor: { title: 'Comptabilité de Transformation', description: 'Ventes de produits transformés, achats matières premières', icon: Factory },
    merchant: { title: 'Comptabilité Commerciale', description: "Chiffre d'affaires, achats stocks et marge commerciale", icon: Store },
    transporter: { title: 'Revenus de Transport', description: 'Frais de transport, commissions et dépenses véhicule', icon: Truck },
  }
  return infos[props.userRole] || { title: 'Comptabilité Institutionnelle', description: 'Revenus, cotisations et dépenses de gestion', icon: Landmark }
}

const roleInfo = computed(() => getRoleInfo())

const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return accountingData.value.transactions
  if (activeTab.value === 'revenue') return accountingData.value.transactions.filter((t: any) => t.type === 'revenue')
  return accountingData.value.transactions.filter((t: any) => t.type === 'expense')
})
</script>

<template>
  <div class="min-h-screen bg-background pb-20 lg:pb-0">
    <!-- Mobile Header -->
    <div class="lg:hidden sticky top-0 z-10 bg-background border-b">
      <div class="flex items-center gap-4 p-4">
        <button @click="emit('back')"><ArrowLeft class="w-6 h-6" /></button>
        <h2 class="font-semibold">Ma Comptabilité</h2>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-20">
       <Loader2 class="w-10 h-10 text-primary animate-spin mb-4" />
       <p class="text-muted-foreground">Chargement des comptes...</p>
    </div>

    <div v-else class="p-4 lg:p-0 space-y-6">
      <!-- Role-specific info banner -->
      <Card class="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <component :is="roleInfo.icon" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold text-primary">{{ roleInfo.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ roleInfo.description }}</p>
          </div>
        </div>
      </Card>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          v-for="(metric, index) in accountingData.metrics" 
          :key="index"
          :class="[
            'p-6',
            metric.color === 'success' ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/20' :
            metric.color === 'destructive' ? 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20' :
            'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
          ]"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ metric.label }}</span>
              <component 
                :is="metric.icon" 
                :class="[
                  'w-5 h-5',
                  metric.color === 'success' ? 'text-success' :
                  metric.color === 'destructive' ? 'text-destructive' : 'text-primary'
                ]" 
              />
            </div>
            <div class="text-2xl font-bold text-foreground">
              {{ metric.isCount ? metric.value : metric.value.toLocaleString() + ' FCFA' }}
            </div>
            <div :class="['flex items-center gap-1 text-sm', metric.trend?.includes('+') ? 'text-success' : 'text-destructive']">
              <component :is="metric.trend?.includes('+') ? TrendingUp : TrendingDown" class="w-4 h-4" />
              <span>{{ metric.trend }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <Button v-if="userRole !== 'consumer'" class="flex-1 bg-primary hover:bg-primary/90" @click="showEntryModal = true">
          <Plus class="w-4 h-4 mr-2" />Nouvelle écriture
        </Button>
        <Button variant="outline">
          <Download class="w-4 h-4 mr-2" />Exporter
        </Button>
      </div>

      <!-- Transactions -->
      <Card class="p-6">
        <!-- Tabs -->
        <div class="flex w-full mb-4 bg-muted rounded-lg p-1">
          <button 
            @click="activeTab = 'all'" 
            :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'all' ? 'bg-background shadow' : 'text-muted-foreground']"
          >
            Tout
          </button>
          <button 
            v-if="userRole !== 'consumer'"
            @click="activeTab = 'revenue'" 
            :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'revenue' ? 'bg-background shadow' : 'text-muted-foreground']"
          >
            Revenus
          </button>
          <button 
            @click="activeTab = 'expense'" 
            :class="['flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors', activeTab === 'expense' ? 'bg-background shadow' : 'text-muted-foreground']"
          >
            Dépenses
          </button>
        </div>

        <div class="space-y-3">
          <div v-if="filteredTransactions.length === 0" class="text-center py-10 text-muted-foreground">
             Aucune écriture trouvée.
          </div>
          <div 
            v-for="transaction in filteredTransactions" 
            :key="transaction.id" 
            class="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                transaction.type === 'revenue' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              ]">
                <component :is="transaction.type === 'revenue' ? TrendingUp : TrendingDown" class="w-5 h-5" />
              </div>
              <div>
                <div class="font-medium">{{ transaction.description }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ transaction.category }} • {{ transaction.date }}
                </div>
              </div>
            </div>
            <div :class="['font-semibold', transaction.type === 'revenue' ? 'text-success' : 'text-destructive']">
              {{ transaction.type === 'revenue' ? '+' : '' }}{{ (transaction.amount || 0).toLocaleString() }} FCFA
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- New Entry Modal -->
    <div v-if="showEntryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
       <Card class="w-full max-w-md p-6 space-y-6 relative">
          <button @click="showEntryModal = false" class="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
             <X class="w-6 h-6" />
          </button>

          <div>
             <h2 class="text-xl font-bold">Nouvelle écriture</h2>
             <p class="text-sm text-muted-foreground">Ajoutez manuellement un revenu ou une dépense.</p>
          </div>

          <div class="space-y-4">
             <div class="space-y-2">
                <Label>Type d'opération</Label>
                <div class="flex gap-2">
                   <Button 
                      :variant="entryForm.type === 'REVENUE' ? 'default' : 'outline'" 
                      class="flex-1"
                      @click="entryForm.type = 'REVENUE'; entryForm.categorie = 'VENTE_PRODUITS'"
                   >Revenu</Button>
                   <Button 
                      :variant="entryForm.type === 'EXPENSE' ? 'default' : 'outline'" 
                      class="flex-1"
                      @click="entryForm.type = 'EXPENSE'; entryForm.categorie = 'INTRANTS'"
                   >Dépense</Button>
                </div>
             </div>

             <div class="space-y-2">
                <Label>Catégorie</Label>
                <Select 
                   v-model="entryForm.categorie" 
                   :options="categoriesData[entryForm.type]" 
                />
             </div>

             <div class="space-y-2">
                <Label>Libellé (Titre)</Label>
                <Input v-model="entryForm.libelle" placeholder="Ex: Achat Engrais NPK" />
             </div>

             <div class="space-y-2">
                <Label>Montant (FCFA)</Label>
                <Input v-model="entryForm.montant" type="number" placeholder="0" />
             </div>

             <div class="space-y-2">
                <Label>Description (Optionnel)</Label>
                <Textarea v-model="entryForm.description" placeholder="Plus de détails..." />
             </div>
          </div>

          <div class="flex gap-3 pt-2">
             <Button variant="outline" class="flex-1" @click="showEntryModal = false">Annuler</Button>
             <Button class="flex-1 bg-primary" @click="handleAddEntry" :disabled="paysanStore.isLoading">
                <Loader2 v-if="paysanStore.isLoading" class="w-4 h-4 mr-2 animate-spin" />
                Enregistrer
             </Button>
          </div>
       </Card>
    </div>
  </div>
</template>
