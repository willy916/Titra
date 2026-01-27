<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Toaster, toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useChatStore } from '@/stores/chat'
import type { UserRole, Screen } from '@/types'

// Auth Views
import SignupView from '@/views/auth/SignupView.vue'
import RoleSelectionView from '@/views/auth/RoleSelectionView.vue'

// Onboarding Views
import FarmerOnboarding from '@/views/onboarding/FarmerOnboarding.vue'
import TransformerOnboarding from '@/views/onboarding/TransformerOnboarding.vue'
import MerchantOnboarding from '@/views/onboarding/MerchantOnboarding.vue'
import TransporterOnboarding from '@/views/onboarding/TransporterOnboarding.vue'
import CooperativeOnboarding from '@/views/onboarding/CooperativeOnboarding.vue'
import AssociationOnboarding from '@/views/onboarding/AssociationOnboarding.vue'
import UnionOnboarding from '@/views/onboarding/UnionOnboarding.vue'
import FederationOnboarding from '@/views/onboarding/FederationOnboarding.vue'
import InterprofessionOnboarding from '@/views/onboarding/InterprofessionOnboarding.vue'

// Home Views
import ConsumerHome from '@/views/home/ConsumerHome.vue'
import FarmerHome from '@/views/home/FarmerHome.vue'
import MerchantHome from '@/views/home/MerchantHome.vue'
import TransporterHome from '@/views/home/TransporterHome.vue'
import TransformerHome from '@/views/home/TransformerHome.vue'
import CooperativeHome from '@/views/home/CooperativeHome.vue'
import InstitutionHome from '@/views/home/InstitutionHome.vue'

// Screen Views
import MessagesView from '@/views/messages/MessagesView.vue'
import ChatView from '@/views/messages/ChatView.vue'
import MyProductsView from '@/views/products/MyProductsView.vue'
import AddProductView from '@/views/products/AddProductView.vue'
import EditProductView from '@/views/products/EditProductView.vue'
import MarketplaceView from '@/views/marketplace/MarketplaceView.vue'
import ProductDetailView from '@/views/marketplace/ProductDetailView.vue'
import OrdersView from '@/views/orders/OrdersView.vue'
import OrderDetailView from '@/views/orders/OrderDetailView.vue'
import WalletView from '@/views/wallet/WalletView.vue'
import AccountingView from '@/views/accounting/AccountingView.vue'
import TrainingView from '@/views/training/TrainingView.vue'
import ProfileView from '@/views/profile/ProfileView.vue'
import SellerProfileView from '@/views/profile/SellerProfileView.vue'
import SettingsView from '@/views/settings/SettingsView.vue'
import StatsView from '@/views/stats/StatsView.vue'
import MembersView from '@/views/members/MembersView.vue'
import AddMemberView from '@/views/members/AddMemberView.vue'
import MissionsView from '@/views/transporter/MissionsView.vue'
import CoursesView from '@/views/transporter/CoursesView.vue'
import CartView from '@/views/cart/CartView.vue'


// Navigation
import Sidebar from '@/components/navigation/Sidebar.vue'
import TopBar from '@/components/navigation/TopBar.vue'
import MobileSidebar from '@/components/navigation/MobileSidebar.vue'

const authStore = useAuthStore()
const cartStore = useCartStore()
const chatStore = useChatStore()

const isInitializing = ref(true)
const currentScreen = ref<Screen>('signup')
const isMobileSidebarOpen = ref(false)
const selectedRole = ref<UserRole | null>(null)
const screenData = ref<any>(null)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

onMounted(async () => {
  await authStore.initializeAuth()
  isInitializing.value = false
  
  if (authStore.isAuthenticated) {
    const user = authStore.user
    
    // Consumer special case: they never have onboarding
    if (user?.role === 'consumer') {
      authStore.skipOnboarding('consumer')
      currentScreen.value = 'home'
      return
    }

    if (user?.onboardingCompleted) {
      currentScreen.value = 'home'
    } else if (user?.role && user.role !== 'USER') {
      // If we have a role but not completed, go to that role's onboarding
      selectedRole.value = user.role
      currentScreen.value = `${user.role}-onboarding` as Screen
    } else {
      currentScreen.value = 'role-selection'
    }
  }
})

// Global WebSocket management
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    chatStore.connectWebSocket()
  } else {
    chatStore.disconnectWebSocket()
  }
}, { immediate: true })

// Screen title mapping
const screenTitles: Record<string, string> = {
  home: 'Accueil',
  marketplace: 'Marketplace',
  cart: 'Panier',
  orders: 'Commandes',
  messages: 'Messages',
  wallet: 'Portefeuille',
  profile: 'Mon profil',
  'seller-profile': 'Profil Vendeur',
  settings: 'Paramètres',
  'my-products': 'Mes produits',
  missions: 'Missions',
  members: 'Membres',
  stats: 'Statistiques',
  accounting: 'Comptabilité',
  training: 'Formation',
}

const currentTitle = computed(() => screenTitles[currentScreen.value] || '')

const showFullLayout = computed(() => {
  return isAuthenticated.value && !['signup', 'role-selection'].includes(currentScreen.value) && !currentScreen.value.includes('onboarding')
})

// Navigation handlers
function handleVerifyOTP() {
  const user = authStore.user
  
  if (!user) {
    currentScreen.value = 'role-selection'
    return
  }

  // If onboarding is completed, always go home
  if (user.onboardingCompleted) {
    currentScreen.value = 'home'
    toast.success('Bon retour sur TITRA !')
    setTimeout(() => {
      window.location.reload()
    }, 500)
    return
  }

  // Consumer special case: directly to home as they have no onboarding
  if (user.role === 'consumer') {
    authStore.skipOnboarding('consumer')
    currentScreen.value = 'home'
    toast.success('Bienvenue sur TITRA !')
    setTimeout(() => {
      window.location.reload()
    }, 500)
    return
  }

  // If user has a specific role but is not fully registered (completed: false)
  if (user.role && user.role !== 'USER' && !user.onboardingCompleted) {
    selectedRole.value = user.role
    currentScreen.value = `${user.role}-onboarding` as Screen
    return
  }
  
  // Default: role selection
  currentScreen.value = 'role-selection'
}

function handleSelectRole(role: UserRole) {
  selectedRole.value = role
  authStore.selectRole(role)
  
  // Consumer doesn't need onboarding
  if (role === 'consumer') {
    authStore.skipOnboarding(role)
    currentScreen.value = 'home'
    toast.success('Bienvenue sur TITRA !')
    return
  }
  
  // Route to appropriate onboarding
  currentScreen.value = `${role}-onboarding` as Screen
}

function handleCompleteOnboarding() {
  authStore.completeOnboarding()
}

function handleNavigate(screen: string, data?: any) {
  currentScreen.value = screen as Screen
  screenData.value = data || null
  isMobileSidebarOpen.value = false
}

function handleAddToCart(product: any, quantity: number = 1) {
  cartStore.addToCart(product, quantity)
  toast.success(`${quantity} produit(s) ajouté(s) au panier`)
}

function handleLogout() {
  authStore.logout()
  currentScreen.value = 'signup'
  selectedRole.value = null
  isMobileSidebarOpen.value = false
  toast.success('Déconnexion réussie')
}

function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

// Get correct home component based on role
const HomeComponent = computed(() => {
  if (!user.value) return ConsumerHome
  
  const role = user.value.role
  
  switch (role) {
    case 'consumer': return ConsumerHome
    case 'farmer': return FarmerHome
    case 'processor': return TransformerHome
    case 'merchant': return MerchantHome
    case 'transporter': return TransporterHome
    case 'cooperative': return CooperativeHome
    case 'association': return InstitutionHome
    case 'union': return InstitutionHome
    case 'federation': return InstitutionHome
    case 'interprofession': return InstitutionHome
    default: 
      // If role is unknown or 'USER', return to role selection if possible
      // But HomeComponent is only for home screen
      return FarmerHome
  }
})

// Get correct onboarding component based on selected role
const OnboardingComponent = computed(() => {
  const role = selectedRole.value || (user.value?.role && user.value.role !== 'USER' ? user.value.role : null)
  
  switch (role) {
    case 'farmer': return FarmerOnboarding
    case 'processor': return TransformerOnboarding
    case 'merchant': return MerchantOnboarding
    case 'transporter': return TransporterOnboarding
    case 'cooperative': return CooperativeOnboarding
    case 'association': return AssociationOnboarding
    case 'union': return UnionOnboarding
    case 'federation': return FederationOnboarding
    case 'interprofession': return InterprofessionOnboarding
    default: return null
  }
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Initial Loader -->
    <div v-if="isInitializing" class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
      <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-muted-foreground animate-pulse">Initialisation de TITRA...</p>
    </div>

    <!-- Unauthenticated: Signup -->
    <SignupView
      v-if="currentScreen === 'signup'"
      @login="currentScreen = 'signup'"
      @verify-otp="handleVerifyOTP"
    />
    
    <!-- Role Selection -->
    <RoleSelectionView
      v-else-if="currentScreen === 'role-selection'"
      @select-role="handleSelectRole"
    />
    
    <!-- Onboarding Screens -->
    <component
      v-else-if="currentScreen.includes('onboarding')"
      :is="OnboardingComponent"
      @complete="handleCompleteOnboarding"
    />

    <!-- Authenticated: Main App -->
    <template v-else-if="isAuthenticated">
      <!-- Desktop Sidebar (fixed) -->
      <Sidebar
        v-if="user"
        :active-screen="currentScreen"
        :role="(user.role || 'farmer') as UserRole"
        :user-name="user.name || ''"
        :user-photo="user.photo"
        :user-matricule="user.matricule || ''"
        :cart-count="cartStore.totalItems"
        @navigate="handleNavigate"
        @logout="handleLogout"
      />

      <!-- Mobile Sidebar -->
      <MobileSidebar
        v-if="user"
        :is-open="isMobileSidebarOpen"
        :active-screen="currentScreen"
        :role="(user.role || 'farmer') as UserRole"
        :user-name="user.name || ''"
        :user-photo="user.photo"
        :user-matricule="user.matricule || ''"
        :cart-count="cartStore.totalItems"
        @close="isMobileSidebarOpen = false"
        @navigate="handleNavigate"
        @logout="handleLogout"
      />

      <!-- Main Content Area - décalé de 256px sur desktop (lg:ml-64) -->
      <div class="lg:ml-64">
        <!-- Top Bar -->
        <TopBar
          v-if="showFullLayout && user"
          :title="currentTitle"
          :user-name="user.name || ''"
          @menu-click="toggleMobileSidebar"
          @profile-click="handleNavigate('profile')"
        />

        <!-- Page Content -->
        <div class="lg:p-6">
          <!-- Home -->
          <component
            v-if="currentScreen === 'home' && user"
            :is="HomeComponent"
            :user="user"
            @navigate="handleNavigate"
          />

          <!-- Messages -->
          <MessagesView
            v-else-if="currentScreen === 'messages'"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Chat -->
          <ChatView
            v-else-if="currentScreen === 'chat' && (screenData?.conversation || screenData?.otherUser)"
            :conversation="screenData.conversation || { otherUser: screenData.otherUser }"
            @back="handleNavigate('messages')"
          />

          <!-- My Products -->
          <MyProductsView
            v-else-if="currentScreen === 'my-products' && user"
            :user-role="user.role === 'processor' ? 'processor' : (user.role === 'merchant' ? 'merchant' : 'farmer')"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Add Product -->
          <AddProductView
            v-else-if="currentScreen === 'add-product' && user"
            :user-role="user.role === 'processor' ? 'processor' : (user.role === 'merchant' ? 'merchant' : (user.role === 'cooperative' || user.role === 'association' || user.role === 'union' || user.role === 'federation' || user.role === 'interprofession' ? 'cooperative' : 'farmer'))"
            @back="handleNavigate('my-products')"
            @navigate="handleNavigate"
          />

          <!-- Edit Product -->
          <EditProductView
            v-else-if="currentScreen === 'edit-product' && user && screenData?.product"
            :product="screenData.product"
            :user-role="user.role === 'processor' ? 'processor' : (user.role === 'merchant' ? 'merchant' : 'farmer')"
            @back="handleNavigate('my-products')"
            @navigate="handleNavigate"
          />

          <!-- Marketplace -->
          <MarketplaceView
            v-else-if="currentScreen === 'marketplace'"
            :initial-data="screenData"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Product Detail -->
          <ProductDetailView
            v-else-if="currentScreen === 'product-detail' && screenData?.product"
            :product="screenData.product"
            @back="handleNavigate(screenData.from || 'marketplace')"
            @navigate="handleNavigate"
            @add-to-cart="handleAddToCart"
          />

          <!-- Orders -->
          <OrdersView
            v-else-if="currentScreen === 'orders' && user"
            :user-role="(user.role || 'farmer') as UserRole"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Order Detail -->
          <OrderDetailView
            v-else-if="currentScreen === 'order-detail' && screenData?.order && user"
            :order="screenData.order"
            :user-role="(user.role || 'farmer') as UserRole"
            @back="handleNavigate('orders')"
            @navigate="handleNavigate"
          />

          <!-- Wallet -->
          <WalletView
            v-else-if="currentScreen === 'wallet' && user"
            :user="user"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Accounting -->
          <AccountingView
            v-else-if="currentScreen === 'accounting' && user"
            :user-role="(user.role || 'farmer') as UserRole"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Stats -->
          <StatsView
            v-else-if="currentScreen === 'stats' && user"
            :user-role="(user.role || 'farmer') as UserRole"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Members -->
          <MembersView
            v-else-if="currentScreen === 'members' && user"
            :user-role="(user.role || 'farmer') as UserRole"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Add Member -->
          <AddMemberView
            v-else-if="currentScreen === 'add-member' && user"
            :user-role="(user.role || 'farmer') as UserRole"
            @back="handleNavigate('members')"
            @navigate="handleNavigate"
          />

          <!-- Training -->
          <TrainingView
            v-else-if="currentScreen === 'training'"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Missions (Transporter) -->
          <MissionsView
            v-else-if="currentScreen === 'missions'"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Courses (Transporter) -->
          <CoursesView
            v-else-if="currentScreen === 'courses'"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Cart (Consumer) -->
          <CartView
            v-else-if="currentScreen === 'cart'"
            @back="handleNavigate('marketplace')"
            @navigate="handleNavigate"
          />

          <!-- Profile -->
          <ProfileView
            v-else-if="currentScreen === 'profile' && user"
            :user="user"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
            @logout="handleLogout"
          />

          <!-- Seller Profile -->
          <SellerProfileView
            v-else-if="currentScreen === 'seller-profile' && screenData?.sellerId"
            :seller-id="screenData.sellerId"
            :seller-data="screenData.seller"
            @back="handleNavigate('home')"
            @navigate="handleNavigate"
          />

          <!-- Settings -->
          <SettingsView
            v-else-if="currentScreen === 'settings'"
            @back="handleNavigate('home')"
          />

          <!-- Placeholder screens -->
          <div v-else-if="currentScreen !== 'home'" class="p-6 pb-20 lg:pb-6">
            <h2 class="text-xl font-semibold mb-4">{{ currentTitle || currentScreen }}</h2>
            <p class="text-muted-foreground">Cette section sera implémentée prochainement.</p>
          </div>
        </div>

        <!-- Bottom Navigation removed for mobile - only desktop sidebar -->
      </div>
    </template>

    <!-- Toast notifications -->
    <Toaster position="top-center" :rich-colors="true" />
  </div>
</template>
