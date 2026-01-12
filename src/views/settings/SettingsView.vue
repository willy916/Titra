<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Bell, Lock, Globe, HelpCircle, Shield, CreditCard, ChevronRight } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import Switch from '@/components/ui/Switch.vue'
import { toast } from 'vue-sonner'

const emit = defineEmits<{ back: [] }>()

const notifications = ref({ orders: true, messages: true, promotions: false, updates: true })
const privacy = ref({ showLocation: true })
</script>

<template>
  <div class="min-h-screen bg-background pb-24">
    <!-- Header -->
    <div class="bg-primary text-white p-6">
      <div class="flex items-center gap-4">
        <button @click="emit('back')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <h1 class="text-white text-2xl">Paramètres</h1>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Notifications -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <Bell class="w-5 h-5 text-primary" />
          <h3 class="text-primary">Notifications</h3>
        </div>
        <Card class="p-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <Label for="notif-orders" class="font-normal cursor-pointer">Commandes</Label>
              <p class="text-xs text-muted-foreground">Notifications sur vos commandes</p>
            </div>
            <Switch id="notif-orders" v-model="notifications.orders" />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex-1">
              <Label for="notif-messages" class="font-normal cursor-pointer">Messages</Label>
              <p class="text-xs text-muted-foreground">Nouveaux messages et discussions</p>
            </div>
            <Switch id="notif-messages" v-model="notifications.messages" />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex-1">
              <Label for="notif-promos" class="font-normal cursor-pointer">Promotions</Label>
              <p class="text-xs text-muted-foreground">Offres spéciales et promotions</p>
            </div>
            <Switch id="notif-promos" v-model="notifications.promotions" />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex-1">
              <Label for="notif-updates" class="font-normal cursor-pointer">Mises à jour</Label>
              <p class="text-xs text-muted-foreground">Nouvelles fonctionnalités et actualités</p>
            </div>
            <Switch id="notif-updates" v-model="notifications.updates" />
          </div>
        </Card>
      </div>

      <!-- Privacy -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <Shield class="w-5 h-5 text-primary" />
          <h3 class="text-primary">Confidentialité</h3>
        </div>
        <Card class="p-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <Label for="show-location" class="font-normal cursor-pointer">Afficher ma localisation</Label>
              <p class="text-xs text-muted-foreground">Aide les acheteurs à vous trouver</p>
            </div>
            <Switch id="show-location" v-model="privacy.showLocation" />
          </div>
        </Card>
      </div>

      <!-- Other Settings -->
      <div>
        <h3 class="text-primary mb-3">Général</h3>
        <div class="space-y-2">
          <Card class="p-4">
            <button class="w-full flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Lock class="w-5 h-5 text-muted-foreground" />
                <span>Sécurité et mot de passe</span>
              </div>
              <ChevronRight class="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>

          <Card class="p-4">
            <button class="w-full flex items-center justify-between">
              <div class="flex items-center gap-3">
                <CreditCard class="w-5 h-5 text-muted-foreground" />
                <span>Moyens de paiement</span>
              </div>
              <ChevronRight class="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>

          <Card class="p-4">
            <button class="w-full flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Globe class="w-5 h-5 text-muted-foreground" />
                <span>Langue</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">Français</span>
                <ChevronRight class="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          </Card>

          <Card class="p-4">
            <button class="w-full flex items-center justify-between">
              <div class="flex items-center gap-3">
                <HelpCircle class="w-5 h-5 text-muted-foreground" />
                <span>Aide et support</span>
              </div>
              <ChevronRight class="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>
        </div>
      </div>

      <!-- Save button -->
      <Button class="w-full" @click="toast.success('Paramètres enregistrés')">
        Enregistrer les modifications
      </Button>
    </div>
  </div>
</template>
