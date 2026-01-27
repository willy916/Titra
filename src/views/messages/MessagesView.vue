<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { ArrowLeft, MessageSquare, Search, Loader2 } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Input from '@/components/ui/Input.vue'
import { useChatStore } from '@/stores/chat'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()
const chatStore = useChatStore()
const searchQuery = ref('')

onMounted(async () => {
  try {
    await chatStore.fetchConversations()
  } catch (error) {
    console.error('Failed to load conversations:', error)
  }
})

onUnmounted(() => {
  // Keep connection alive for the app session
  // chatStore.disconnectWebSocket()
})

const filteredConversations = computed(() => {
  if (!searchQuery.value) return chatStore.conversations
  const query = searchQuery.value.toLowerCase()
  return chatStore.conversations.filter(c => 
    c.otherUser.name.toLowerCase().includes(query) || 
    c.lastMessage.toLowerCase().includes(query)
  )
})

function formatTime(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr })
  } catch (e) {
    return '...'
  }
}

function getInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getParticipantName(conv: any) {
  const p = conv.otherParticipant || conv.otherUser
  return p?.fullName || p?.name || 'Utilisateur'
}

function getParticipantAvatar(conv: any) {
  const p = conv.otherParticipant || conv.otherUser
  return p?.avatarUrl || p?.photo || ''
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <button @click="emit('back')" class="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
          <ArrowLeft class="w-6 h-6" />
          <span class="font-bold text-lg">Messages</span>
        </button>
        <div class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          {{ chatStore.conversations.length }} discussions
        </div>
      </div>

      <div class="relative group">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input 
          v-model="searchQuery" 
          placeholder="Rechercher une discussion..." 
          class="pl-10 bg-slate-100 border-none h-11 focus:ring-2 focus:ring-primary/20" 
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="chatStore.isLoading && chatStore.conversations.length === 0" class="flex flex-col items-center justify-center p-12">
      <Loader2 class="w-10 h-10 text-primary animate-spin mb-4" />
      <p class="text-slate-500 font-medium">Chargement de vos messages...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredConversations.length === 0" class="flex flex-col items-center justify-center p-10 mt-10">
      <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <MessageSquare class="w-10 h-10 text-slate-300" />
      </div>
      <h3 class="text-slate-800 font-bold text-lg mb-2">Pas encore de conversations</h3>
      <p class="text-slate-500 text-center max-w-xs">Commencez à échanger avec des producteurs ou acheteurs sur Titra.</p>
    </div>

    <!-- Conversations List -->
    <div v-else class="divide-y divide-slate-100 bg-white shadow-sm ring-1 ring-slate-100">
      <div
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        class="p-4 hover:bg-slate-50 cursor-pointer transition-all active:bg-slate-100 flex gap-4 group"
        @click="emit('navigate', 'chat', { conversation })"
      >
        <div class="relative">
          <Avatar 
            :src="getParticipantAvatar(conversation)" 
            :fallback="getInitials(getParticipantName(conversation))" 
            class="w-14 h-14 border-2 border-slate-50 shadow-sm" 
          />
          <div v-if="conversation.unreadCount > 0" class="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-white">
            {{ conversation.unreadCount }}
          </div>
        </div>

        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-bold text-slate-900 truncate">{{ getParticipantName(conversation) }}</h4>
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {{ formatTime(conversation.lastMessageTime || conversation.lastMessageDate) }}
            </span>
          </div>
          
          <div class="flex items-center justify-between gap-2">
            <p :class="['text-sm truncate flex-1', conversation.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium']">
              {{ conversation.lastMessage }}
            </p>
            <Badge v-if="conversation.orderId" variant="outline" class="text-[9px] py-0 h-4 border-slate-200 text-slate-400 font-bold shrink-0">
              #{{ conversation.orderId.slice(0, 8) }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
