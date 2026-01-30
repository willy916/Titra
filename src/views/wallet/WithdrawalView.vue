<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Wallet, Smartphone, ShieldCheck, Loader2, AlertCircle, Info } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { useWalletStore } from '@/stores/wallet'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const walletStore = useWalletStore()
const authStore = useAuthStore()

const amount = ref<number | null>(null)
const phoneNumber = ref(authStore.user?.phone || '')
const isSubmitting = ref(false)

const availableBalance = computed(() => walletStore.walletData?.soldeDisponible || 0)
const minWithdrawal = 1000

const isValid = computed(() => {
  return amount.value !== null && amount.value >= minWithdrawal && amount.value <= availableBalance.value && phoneNumber.value.length >= 8
})

async function handleWithdraw() {
  if (!amount.value || amount.value < minWithdrawal) {
    toast.error(`Le montant minimum est de ${minWithdrawal} FCFA`)
    return
  }

  if (amount.value > availableBalance.value) {
    toast.error('Solde insuffisant')
    return
  }

  isSubmitting.value = true
  try {
    const result = await walletStore.withdraw(amount.value, phoneNumber.value)
    if (result.success || result.body?.success) {
      toast.success('Demande de retrait envoyée !', {
        description: `Un montant de ${amount.value.toLocaleString()} FCFA sera transféré sur le numéro ${phoneNumber.value}`
      })
      emit('back')
    } else {
      toast.error(result.message || 'Une erreur est survenue lors du retrait')
    }
  } catch (error: any) {
    console.error('Withdrawal error:', error)
    const errorMsg = error.response?.data?.message || 'Erreur lors du traitement du retrait'
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
}

function setAmount(percent: number) {
  amount.value = Math.floor(availableBalance.value * percent)
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b p-4">
      <button @click="emit('back')" class="flex items-center gap-2">
        <ArrowLeft class="w-5 h-5" />
        <span class="font-medium">Demande de retrait</span>
      </button>
    </div>

    <div class="p-6 space-y-6">
      <!-- Balance Info -->
      <Card class="bg-primary/5 border-primary/10 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Disponible pour retrait</p>
            <p class="text-2xl font-bold text-primary">{{ availableBalance.toLocaleString() }} <span class="text-sm font-normal">FCFA</span></p>
          </div>
        </div>
      </Card>

      <!-- Form -->
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="amount">Montant à retirer (FCFA)</Label>
          <div class="relative">
            <Input 
              id="amount" 
              type="number" 
              v-model.number="amount" 
              placeholder="0" 
              class="pl-4 h-12 text-lg font-semibold"
              :min="minWithdrawal"
              :max="availableBalance"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
               <button @click="setAmount(0.5)" class="text-[10px] bg-muted px-2 py-1 rounded hover:bg-muted/80">50%</button>
               <button @click="setAmount(1)" class="text-[10px] bg-muted px-2 py-1 rounded hover:bg-muted/80">Max</button>
            </div>
          </div>
          <p v-if="amount && amount < minWithdrawal" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="w-3 h-3" /> Minimum {{ minWithdrawal }} FCFA
          </p>
          <p v-else-if="amount && amount > availableBalance" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="w-3 h-3" /> Solde disponible insuffisant
          </p>
          <p v-else class="text-xs text-muted-foreground">Le montant sera déduit immédiatement de votre solde.</p>
        </div>

        <div class="space-y-2">
          <Label for="phone">Numéro de téléphone (Mobile Money)</Label>
          <div class="relative">
            <Smartphone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              id="phone" 
              v-model="phoneNumber" 
              placeholder="Ex: 0102030405" 
              class="pl-10 h-12"
            />
          </div>
          <p class="text-xs text-muted-foreground">Le transfert sera effectué via Wave ou Orange Money.</p>
        </div>
      </div>

      <!-- Security Note -->
      <Card class="p-4 bg-muted/30 border-dashed">
        <div class="flex gap-3">
          <ShieldCheck class="w-5 h-5 text-success shrink-0" />
          <div>
            <p class="text-sm font-semibold">Transaction sécurisée</p>
            <p class="text-xs text-muted-foreground">Les demandes de retrait sont traitées sous 24h ouvrées. Assurez-vous que le numéro est correct.</p>
          </div>
        </div>
      </Card>

      <!-- Fees Info -->
      <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
        <Info class="w-5 h-5 text-blue-500 shrink-0" />
        <div class="text-sm text-blue-700">
          <p class="font-semibold">Frais de service</p>
          <p>Des frais de transfert peuvent être appliqués par votre opérateur mobile lors de la réception des fonds.</p>
        </div>
      </div>

      <!-- Action -->
      <Button 
        class="w-full h-12 bg-primary text-lg shadow-lg shadow-primary/20" 
        :disabled="!isValid || isSubmitting"
        @click="handleWithdraw"
      >
        <Loader2 v-if="isSubmitting" class="w-5 h-5 mr-2 animate-spin" />
        Confirmer le retrait
      </Button>
    </div>
  </div>
</template>
