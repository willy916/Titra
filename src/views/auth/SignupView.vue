<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Phone, Leaf } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import InputOTP from '@/components/ui/InputOTP.vue'
import bgImage from '@/assets/bg-agriculture.jpg'
import logo from '@/assets/styles/logo.jpeg'

const emit = defineEmits<{
  login: []
  'verify-otp': [data: any]
}>()

type Step = 'phone' | 'otp'

const step = ref<Step>('phone')
const phone = ref('')
const otp = ref('')
const countdown = ref(60)
let countdownInterval: ReturnType<typeof setInterval> | null = null

function startCountdown() {
  countdown.value = 60
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval!)
      countdownInterval = null
    }
  }, 1000)
}

const authStore = useAuthStore()

function getFormattedPhone() {
  const cleanPhone = phone.value.replace(/\s+/g, '')
  if (cleanPhone.startsWith('225')) {
    return cleanPhone
  } else if (cleanPhone.length === 10) {
    return `225${cleanPhone}`
  }
  return null
}

async function handleSendOTP() {
  const finalPhone = getFormattedPhone()
  
  if (!finalPhone || finalPhone.length !== 13) {
    toast.error('Le numéro doit comporter 10 chiffres (l\'indicatif 225 sera ajouté)')
    return
  }

  try {
    await authStore.sendOtp(finalPhone)
    step.value = 'otp'
    startCountdown()
    toast.success('Code OTP envoyé')
  } catch (error) {
    toast.error('Erreur lors de l\'envoi du code')
  }
}

async function handleResendOTP() {
  const finalPhone = getFormattedPhone()
  if (!finalPhone) return

  try {
    await authStore.sendOtp(finalPhone)
    startCountdown()
    toast.success('Code OTP renvoyé')
  } catch (error) {
    toast.error('Erreur lors du renvoi du code')
  }
}

async function handleVerifyOTP() {
  if (otp.value.length !== 6) return
  
  const finalPhone = getFormattedPhone()
  if (!finalPhone) {
    toast.error('Erreur de format du numéro')
    return
  }

  try {
    const result = await authStore.verifyOtp(finalPhone, otp.value)
    emit('verify-otp', result)
  } catch (error) {
    toast.error('Code OTP invalide')
  }
}

function handleBack() {
  step.value = 'phone'
  otp.value = ''
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<template>
  <div class="min-h-screen bg-background flex">
    <!-- Left Side - Image (Desktop Only) -->
    <Transition
      appear
      enter-active-class="transition-all duration-[600ms] ease-out"
      enter-from-class="opacity-0 -translate-x-5"
      enter-to-class="opacity-100 translate-x-0"
    >
      <div
        class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-left"
        :style="{ backgroundImage: `url(${bgImage})` }"
      >
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-between p-12 w-full">
          <!-- Logo -->
          <div class="flex items-center gap-2 text-white">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Leaf class="w-6 h-6 text-primary" />
            </div>
            <span class="text-2xl font-bold">TITRA</span>
            <img :src="logo" alt="TITRA Logo" class="h-12 w-auto brightness-0 invert" />
          </div>

          <!-- Main Content -->
          <Transition
            appear
            enter-active-class="transition-all duration-[600ms] ease-out delay-200"
            enter-from-class="opacity-0 translate-y-5"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div class="flex-1 flex flex-col justify-end pb-12">
              <div class="text-white">
                <h2 class="text-4xl font-bold mb-4">
                  Rejoignez +25 000 entreprises agricoles
                </h2>
                <p class="text-xl text-white/90">
                  et propulsez votre croissance
                </p>
              </div>
            </div>
          </Transition>

          <!-- Partner Text -->
          <Transition
            appear
            enter-active-class="transition-all duration-[600ms] ease-out delay-[400ms]"
            enter-from-class="opacity-0 translate-y-5"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div class="flex items-center justify-center gap-8 text-white/70">
              <div class="text-sm">Partenaires de confiance</div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- Right Side - Form -->
    <div class="w-full lg:w-1/2 flex flex-col">
      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Transition
          appear
          enter-active-class="transition-all duration-[600ms] ease-out"
          enter-from-class="opacity-0 translate-y-5"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div class="w-full max-w-md">
            <!-- Mobile Logo -->
            <div class="flex items-center gap-2 mb-8 lg:hidden">
              <img :src="logo" alt="TITRA Logo" class="h-10 w-auto" />
            </div>

            <!-- Phone Step -->
            <Transition
              mode="out-in"
              enter-active-class="transition-opacity duration-[400ms] ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-[400ms] ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div v-if="step === 'phone'" key="phone" class="space-y-6">
                <div class="space-y-2">
                  <h1 class="text-3xl lg:text-4xl font-bold text-foreground">
                    Nous sommes heureux de vous revoir
                  </h1>
                  <p class="text-muted-foreground text-base">
                    Veuillez vous connecter à votre compte pour consulter et gérer vos transactions
                  </p>
                </div>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <Label for="phone" class="text-sm font-medium">
                      Numéro de téléphone
                    </Label>
                    <div class="flex gap-2">
                      <div class="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border">
                        <Phone class="w-4 h-4 text-muted-foreground" />
                        <span class="text-sm">+225</span>
                      </div>
                      <Input
                        id="phone"
                        v-model="phone"
                        type="tel"
                        placeholder="07 12 34 56 78"
                        class="flex-1"
                      />
                    </div>
                    <p class="text-xs text-muted-foreground">
                      Exactement 10 chiffres (l'indicatif 225 sera ajouté)
                    </p>
                  </div>

                  <Button
                    class="w-full h-12"
                    :disabled="!phone || authStore.isLoading"
                    :loading="authStore.isLoading"
                    @click="handleSendOTP"
                  >
                    Connexion
                  </Button>

                  <div class="text-center">
                    <button
                      class="text-sm text-primary hover:underline"
                      @click="$emit('login')"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                      <div class="w-full border-t border-border" />
                    </div>
                    <div class="relative flex justify-center text-xs">
                      <span class="bg-background px-2 text-muted-foreground">
                        Nouveau sur TITRA ?
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    class="w-full h-12"
                    @click="$emit('login')"
                  >
                    Créer un compte
                  </Button>
                </div>
              </div>

              <!-- OTP Step -->
              <div v-else key="otp" class="space-y-6">
                <div class="space-y-2">
                  <h1 class="text-3xl lg:text-4xl font-bold text-foreground">
                    Vérification
                  </h1>
                  <p class="text-muted-foreground text-base">
                    Entrez le code à 6 chiffres envoyé au<br />
                    <strong class="text-foreground">+225 {{ phone }}</strong>
                  </p>
                </div>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <Label class="text-sm font-medium">Code OTP</Label>
                    <div class="flex justify-center">
                      <InputOTP v-model="otp" :max-length="6" />
                    </div>
                  </div>

                  <div class="text-center text-sm text-muted-foreground">
                    <p v-if="countdown > 0">Renvoyer le code dans {{ countdown }}s</p>
                    <button
                      v-else
                      class="text-primary hover:underline"
                      @click="handleResendOTP"
                    >
                      Renvoyer le code
                    </button>
                  </div>

                  <Button
                    class="w-full h-12"
                    :disabled="otp.length !== 6 || authStore.isLoading"
                    :loading="authStore.isLoading"
                    @click="handleVerifyOTP"
                  >
                    Vérifier
                  </Button>

                  <Button
                    variant="outline"
                    class="w-full h-12"
                    @click="handleBack"
                  >
                    Retour
                  </Button>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
