<script setup lang="ts">
import { Menu, Search } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Avatar from '@/components/ui/Avatar.vue'

const props = defineProps<{
  title: string
  showSearch?: boolean
  notificationCount?: number
  userName?: string
}>()

const emit = defineEmits<{
  menuClick: []
  notificationClick: []
  profileClick: []
}>()

function getInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
}
</script>

<template>
  <!-- Mobile TopBar -->
  <div class="lg:hidden flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 bg-white border-b border-border sticky top-0 z-40">
    <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
      <Button variant="ghost" size="icon" @click="emit('menuClick')" class="flex-shrink-0">
        <Menu class="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
      <h1 class="text-base sm:text-lg font-semibold truncate">{{ title }}</h1>
    </div>

    <div class="flex items-center gap-2 flex-shrink-0">
      <Button v-if="showSearch" variant="ghost" size="icon" class="hidden sm:flex">
        <Search class="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" class="relative p-0" @click="emit('profileClick')">
        <Avatar :fallback="getInitials(userName || '')" class="w-8 h-8 sm:w-9 sm:h-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all" />
      </Button>
    </div>
  </div>

  <!-- Desktop TopBar -->
  <div class="hidden lg:flex items-center justify-between h-16 px-6 bg-white border-b border-border sticky top-0 z-30">
    <h1 class="text-2xl font-semibold">{{ title }}</h1>

    <div class="flex items-center gap-4">
      <div v-if="showSearch" class="relative w-80">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." class="pl-10" />
      </div>
      <Button variant="ghost" size="icon" class="relative p-0" @click="emit('profileClick')">
        <Avatar :fallback="getInitials(userName || '')" class="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all" />
      </Button>
    </div>
  </div>
</template>
