<script setup lang="ts">
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, DollarSign } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { mockTransactions } from '@/data/mockData'
import type { User, Transaction } from '@/types'

const props = defineProps<{ user: User }>()
const emit = defineEmits<{ back: [], navigate: [screen: string] }>()

const chartData = [
  { month: 'Jan', amount: 45000 },
  { month: 'Fév', amount: 52000 },
  { month: 'Mar', amount: 48000 },
  { month: 'Avr', amount: 65000 },
  { month: 'Mai', amount: 75000 },
  { month: 'Juin', amount: 82000 },
]

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR')
}
function formatTime(date: Date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <div class="sticky top-0 z-10 bg-white border-b p-4">
      <button @click="emit('back')" class="flex items-center gap-2">
        <ArrowLeft class="w-5 h-5" />
        <span>Mon portefeuille</span>
      </button>
    </div>

    <!-- Balance Card -->
    <div class="p-6">
      <Card class="bg-gradient-to-br from-primary to-[#4CAF50] text-white p-6">
        <div class="flex items-center gap-2 mb-6">
          <Wallet class="w-5 h-5" />
          <span class="text-sm opacity-90">Solde disponible</span>
        </div>
        <p class="text-4xl font-bold mb-6">{{ (user.balance || 0).toLocaleString() }} FCFA</p>
        <div class="flex items-center justify-between pt-4 border-t border-white/20">
          <div>
            <p class="text-xs opacity-75">En attente (Escrow)</p>
            <p class="font-semibold">{{ (user.pendingBalance || 0).toLocaleString() }} FCFA</p>
          </div>
          <Button @click="emit('navigate', 'withdrawal')" class="bg-white text-primary hover:bg-white/90">
            <DollarSign class="w-4 h-4 mr-2" />Retirer
          </Button>
        </div>
      </Card>
    </div>

    <!-- Statistics -->
    <div class="px-6 pb-6">
      <h3 class="mb-4">Statistiques du mois</h3>
      <div class="grid grid-cols-3 gap-4 mb-6">
        <Card class="p-4">
          <TrendingUp class="w-5 h-5 text-success mb-2" />
          <p class="text-xs text-muted-foreground mb-1">Ventes</p>
          <p class="font-semibold">24</p>
        </Card>
        <Card class="p-4">
          <DollarSign class="w-5 h-5 text-primary mb-2" />
          <p class="text-xs text-muted-foreground mb-1">Revenu total</p>
          <p class="font-semibold text-sm">125k</p>
        </Card>
        <Card class="p-4">
          <ArrowUpRight class="w-5 h-5 text-muted-foreground mb-2" />
          <p class="text-xs text-muted-foreground mb-1">Commission</p>
          <p class="font-semibold text-sm">6.2k</p>
        </Card>
      </div>

      <!-- Chart placeholder -->
      <Card class="p-4">
        <h4 class="mb-4">Évolution des revenus</h4>
        <div class="h-48 flex items-end justify-around gap-2">
          <div v-for="data in chartData" :key="data.month" class="flex flex-col items-center gap-2">
            <div class="w-8 bg-primary/20 rounded-t" :style="{ height: `${(data.amount / 82000) * 150}px` }">
              <div class="w-full bg-primary rounded-t" :style="{ height: '100%' }"></div>
            </div>
            <span class="text-xs text-muted-foreground">{{ data.month }}</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Transactions -->
    <div class="px-6 pb-6">
      <div class="flex items-center justify-between mb-4">
        <h3>Historique récent</h3>
        <Button variant="link" class="p-0 h-auto text-sm">Voir tout</Button>
      </div>

      <Card class="overflow-hidden">
        <div v-for="transaction in mockTransactions.slice(0, 5)" :key="transaction.id" class="p-4 border-b last:border-b-0">
          <div class="flex items-start gap-3">
            <div :class="['p-2 rounded-lg', transaction.amount > 0 ? 'bg-success/10' : 'bg-muted']">
              <component :is="transaction.amount > 0 ? ArrowDownLeft : ArrowUpRight" :class="['w-4 h-4', transaction.amount > 0 ? 'text-success' : 'text-foreground']" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm">{{ transaction.description }}</p>
              <p class="text-xs text-muted-foreground">{{ formatDate(transaction.date) }} à {{ formatTime(transaction.date) }}</p>
            </div>
            <div class="text-right">
              <p :class="['font-semibold', transaction.amount > 0 ? 'text-success' : 'text-foreground']">
                {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount.toLocaleString() }} FCFA
              </p>
              <p class="text-xs text-muted-foreground capitalize">
                {{ transaction.status === 'completed' ? 'Complété' : transaction.status === 'pending' ? 'En attente' : 'Échoué' }}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
