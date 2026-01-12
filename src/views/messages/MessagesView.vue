<script setup lang="ts">
import { ArrowLeft, MessageSquare } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { mockConversations } from '@/data/mockData'

const emit = defineEmits<{ back: []; navigate: [screen: string, data?: any] }>()

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `Il y a ${minutes}m`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${days}j`
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('')
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20">
    <!-- Empty State -->
    <template v-if="mockConversations.length === 0">
      <div class="p-4 border-b">
        <button @click="emit('back')" class="flex items-center gap-2">
          <ArrowLeft class="w-5 h-5" />
          <span>Messages</span>
        </button>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center p-6">
        <div class="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageSquare class="w-16 h-16 text-muted-foreground" />
        </div>
        <h2 class="mb-2">Pas encore de conversations</h2>
        <p class="text-muted-foreground text-center">Commencez à échanger avec des vendeurs sur la marketplace</p>
      </div>
    </template>

    <!-- Conversations List -->
    <template v-else>
      <div class="sticky top-0 z-10 bg-white border-b p-4">
        <button @click="emit('back')" class="flex items-center gap-2">
          <ArrowLeft class="w-5 h-5" />
          <span>Messages</span>
        </button>
      </div>

      <div class="divide-y">
        <div
          v-for="conversation in mockConversations"
          :key="conversation.id"
          class="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
          @click="emit('navigate', 'chat', { conversation })"
        >
          <div class="flex gap-3">
            <div class="relative">
              <Avatar :fallback="getInitials(conversation.otherUser.name)" class="w-12 h-12" />
              <div
                v-if="conversation.unread > 0"
                class="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
              >
                {{ conversation.unread }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-1">
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ conversation.otherUser.name }}</p>
                  <Badge v-if="conversation.orderId" variant="outline" class="text-xs mt-1">
                    Commande {{ conversation.orderId }}
                  </Badge>
                </div>
                <span class="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {{ formatTime(conversation.lastMessageTime) }}
                </span>
              </div>
              <p :class="['text-sm line-clamp-2', conversation.unread > 0 ? 'font-medium' : 'text-muted-foreground']">
                {{ conversation.lastMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
