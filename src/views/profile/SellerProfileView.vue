<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, MapPin, Star, MessageSquare, Package, ChevronRight, Loader2, CheckCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useMarketplaceStore } from '@/stores/marketplace'
import { useChatStore } from '@/stores/chat'
import { toast } from 'vue-sonner'

const props = defineProps<{
    sellerId: string
    sellerData?: any // Optional pre-loaded data
}>()

const emit = defineEmits<{
    back: []
    navigate: [screen: string, data?: any]
}>()

const marketplaceStore = useMarketplaceStore()
const chatStore = useChatStore()
const isLoading = ref(true)
const seller = ref<any>(null)
const products = ref<any[]>([])

async function fetchData() {
    isLoading.value = true
    try {
        // In a real app, we'd have a specific endpoint for seller profile
        // For now, if we have sellerData passed, use it, otherwise mock/fetch
        if (props.sellerData) {
            seller.value = props.sellerData
        } else {
            // Fallback mock if data not provided
            seller.value = {
                id: props.sellerId,
                name: 'Producteur Titra',
                type: 'COOPÉRATIVE',
                location: 'Abidjan, Côte d\'Ivoire',
                rating: 4.8,
                verified: true,
                phoneNumber: '2250101010101',
                bio: 'Producteur certifié passionné par l\'agriculture durable et la qualité.',
                memberSince: '2023'
            }
        }

        // Fetch seller products
        const response = await marketplaceStore.fetchMarketplace('PAYSAN')
        products.value = response.filter((p: any) => p.vendeur?.id === props.sellerId || p.seller?.id === props.sellerId).slice(0, 4)
        
        // If no products associated with this specific ID in mock marketplace, just show some random ones
        if (products.value.length === 0) {
            products.value = response.slice(0, 4)
        }
    } catch (error) {
        console.error('Error fetching seller profile:', error)
        toast.error('Impossible de charger le profil')
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchData)

async function handleStartChat() {
    if (!seller.value?.phoneNumber) {
        toast.error('Numéro de téléphone non disponible')
        return
    }

    try {
        const conversation = await chatStore.startConversation(seller.value.phoneNumber)
        emit('navigate', 'chat', { conversation })
    } catch (error) {
        console.error('Failed to start chat:', error)
        toast.error('Impossible de démarrer la discussion')
    }
}

function getInitials(name: string) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 pb-20">
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-white border-b p-4 flex items-center justify-between">
            <button @click="emit('back')" class="flex items-center gap-2 text-slate-600">
                <ArrowLeft class="w-5 h-5" />
                <span class="font-bold">Profil Vendeur</span>
            </button>
        </div>

        <div v-if="isLoading" class="flex flex-col items-center justify-center p-20">
            <Loader2 class="w-10 h-10 text-primary animate-spin mb-4" />
            <p class="text-slate-500">Chargement du profil...</p>
        </div>

        <template v-else-if="seller">
            <!-- Hero Section -->
            <div class="bg-white p-6 shadow-sm">
                <div class="flex flex-col items-center text-center">
                    <div class="relative mb-4">
                        <Avatar 
                            :src="seller.avatarUrl || seller.photo" 
                            :fallback="getInitials(seller.name)"
                            class="w-24 h-24 rounded-[32px] border-4 border-slate-50 shadow-xl" 
                        />
                        <div v-if="seller.verified" class="absolute -bottom-1 -right-1 bg-success text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                            <CheckCircle class="w-4 h-4 fill-success" />
                        </div>
                    </div>
                    
                    <h1 class="text-2xl font-bold text-slate-900">{{ seller.name }}</h1>
                    <div class="flex items-center gap-2 mt-1">
                        <Badge variant="outline" class="text-[10px] font-bold uppercase border-slate-200">{{ seller.type }}</Badge>
                        <div class="flex items-center gap-1 text-amber-500 text-sm font-bold">
                            <Star class="w-4 h-4 fill-amber-500" />
                            {{ seller.rating }}
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5 text-slate-500 text-sm mt-2">
                        <MapPin class="w-4 h-4" />
                        {{ seller.location }}
                    </div>

                    <p class="mt-4 text-slate-600 text-sm max-w-sm leading-relaxed">
                        {{ seller.bio || 'Producteur de confiance sur la plateforme Titra.' }}
                    </p>

                    <div class="flex gap-4 w-full mt-8 max-w-sm mx-auto">
                        <Button class="flex-1 rounded-2xl h-12 gap-2" @click="handleStartChat">
                            <MessageSquare class="w-5 h-5" />
                            Message
                        </Button>
                        <Button variant="outline" class="flex-1 rounded-2xl h-12 gap-2">
                            <Package class="w-5 h-5" />
                            Produits
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-3 gap-px bg-slate-100 border-y border-slate-100 mb-6">
                <div class="bg-white p-4 text-center">
                    <p class="text-xl font-bold text-slate-900">{{ products.length }}+</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Produits</p>
                </div>
                <div class="bg-white p-4 text-center">
                    <p class="text-xl font-bold text-slate-900">100%</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fiabilité</p>
                </div>
                <div class="bg-white p-4 text-center">
                    <p class="text-xl font-bold text-slate-900">{{ seller.memberSince }}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Membre</p>
                </div>
            </div>

            <!-- Products -->
            <div class="px-6 pb-10">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-slate-900 text-lg">Top produits</h3>
                    <button class="text-primary text-sm font-bold">Voir tout</button>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <Card v-for="product in products" :key="product.id" @click="emit('navigate', 'product-detail', { product })" class="p-0 overflow-hidden border-0 shadow-sm rounded-3xl group">
                        <div class="relative aspect-square">
                            <img :src="product.images?.[0] || product.photo || product.image" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div class="absolute bottom-3 left-3 right-3 text-white">
                                <p class="text-xs font-bold leading-tight">{{ product.name || product.nom }}</p>
                                <p class="text-[10px] font-medium opacity-80">{{ product.prix || product.price }} FCFA</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </template>
    </div>
</template>
