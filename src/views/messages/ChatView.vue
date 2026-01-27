<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { 
    ArrowLeft, Send, Image as ImageIcon, Mic, MoreVertical, 
    Check, CheckCheck, Loader2, Phone, Video
} from 'lucide-vue-next'
import { useChatStore, type ChatMessage } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const props = defineProps<{
    conversation: any
}>()

const emit = defineEmits<{
    back: []
}>()

const chatStore = useChatStore()
const authStore = useAuthStore()
const newMessage = ref('')
const scrollContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const currentUser = computed(() => authStore.user)
const otherUser = computed(() => {
    const conv = props.conversation
    if (!conv) return null
    
    // Handle different API versions/mocks
    const participant = conv.otherParticipant || conv.otherUser
    if (!participant) return null

    return {
        id: participant.id,
        name: participant.fullName || participant.name || 'Utilisateur',
        avatarUrl: participant.avatarUrl || participant.photo,
        role: participant.role
    }
})

onMounted(async () => {
    if (props.conversation?.id) {
        await chatStore.fetchMessages(props.conversation.id)
        chatStore.markAsRead(props.conversation.id)
    } else {
        chatStore.currentMessages = []
        chatStore.activeConversationId = null
    }
    scrollToBottom()
})

onUnmounted(() => {
    chatStore.activeConversationId = null
})

const messages = computed(() => chatStore.currentMessages)

async function handleSendMessage() {
    if (!newMessage.value.trim()) return
    const content = newMessage.value
    const recipientId = otherUser.value?.id
    if (!recipientId) {
        console.error('No recipient ID found')
        return
    }

    newMessage.value = ''
    try {
        await chatStore.sendMessage(recipientId, content)
        scrollToBottom()
    } catch (error) {
        console.error('Failed to send message:', error)
    }
}

function scrollToBottom() {
    nextTick(() => {
        if (scrollContainer.value) {
            scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
        }
    })
}

function formatMessageTime(dateString: string) {
    if (!dateString) return ''
    return format(new Date(dateString), 'HH:mm')
}

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    const recipientId = otherUser.value?.id
    if (file && recipientId) {
        chatStore.sendFile(recipientId, file, 'IMAGE')
    }
}

function getInitials(name: string) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
    <div class="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <!-- Chat Header -->
        <header class="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-10">
            <div class="flex items-center gap-3">
                <button @click="emit('back')" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft class="w-6 h-6 text-slate-600" />
                </button>
                <div class="flex items-center gap-3" v-if="otherUser">
                    <div class="relative">
                        <Avatar 
                            :src="otherUser.avatarUrl || ''" 
                            :fallback="getInitials(otherUser.name)"
                            class="w-10 h-10 border border-slate-100" 
                        />
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 text-sm leading-tight">{{ otherUser.name }}</h3>
                        <p class="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">En ligne</p>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <button class="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all">
                    <Phone class="w-5 h-5" />
                </button>
                <button class="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all">
                    <Video class="w-5 h-5" />
                </button>
                <button class="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                    <MoreVertical class="w-5 h-5" />
                </button>
            </div>
        </header>

        <!-- Messages Area -->
        <div 
            ref="scrollContainer"
            class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
            <div v-if="chatStore.isLoading && messages.length === 0" class="flex justify-center py-10">
                <Loader2 class="w-8 h-8 text-primary animate-spin" />
            </div>

            <template v-else>
                <div v-for="(message, index) in messages" :key="message.id" 
                    :class="['flex w-full', message.senderId === currentUser?.id ? 'justify-end' : 'justify-start']"
                >
                    <div :class="[
                        'max-w-[80%] rounded-2xl px-4 py-2 shadow-sm relative group',
                        message.senderId === currentUser?.id 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    ]">
                        <!-- Content -->
                        <div v-if="message.type === 'TEXT'" class="text-sm leading-relaxed">
                            {{ message.content }}
                        </div>
                        <div v-else-if="message.type === 'IMAGE'" class="rounded-lg overflow-hidden -mx-2 -mt-1 mb-1">
                            <img :src="message.fileUrl || ''" alt="Image" class="max-w-full h-auto object-cover min-h-[150px] bg-slate-200" />
                        </div>
                        
                        <!-- Footer / Time -->
                        <div :class="['flex items-center gap-1 mt-1 justify-end', message.senderId === currentUser?.id ? 'text-white/70' : 'text-slate-400']">
                            <span class="text-[10px] font-medium">{{ formatMessageTime(message.createdAt) }}</span>
                            <template v-if="message.senderId === currentUser?.id">
                                <CheckCheck v-if="message.isRead" class="w-3 h-3" />
                                <Check v-else class="w-3 h-3" />
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Input Area -->
        <div class="bg-white border-t p-4 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div class="flex items-end gap-3 max-w-4xl mx-auto">
                <div class="flex items-center gap-1 pb-1">
                    <button 
                        @click="fileInput?.click()"
                        class="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90"
                    >
                        <ImageIcon class="w-6 h-6" />
                    </button>
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
                    <button class="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-90">
                        <Mic class="w-6 h-6" />
                    </button>
                </div>

                <div class="flex-1 relative">
                    <textarea 
                        v-model="newMessage"
                        rows="1"
                        placeholder="Écrivez votre message..."
                        class="w-full bg-slate-100 border-none rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary/20 resize-none text-sm transition-all"
                        @keydown.enter.prevent="handleSendMessage"
                    ></textarea>
                </div>

                <button 
                    @click="handleSendMessage"
                    :disabled="!newMessage.trim()"
                    :class="[
                        'p-3.5 rounded-2xl shadow-lg transition-all active:scale-90 disabled:opacity-50 disabled:scale-100',
                        newMessage.trim() ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-200 text-slate-400'
                    ]"
                >
                    <Send class="w-6 h-6" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
