<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn, getInitials } from '@/utils'

interface Props {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'default' | 'lg' | 'xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const imageError = ref(false)

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  default: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const avatarClass = computed(() =>
  cn(
    'relative flex shrink-0 overflow-hidden rounded-full',
    sizeClasses[props.size],
    props.class
  )
)

const showImage = computed(() => props.src && !imageError.value)

const fallbackText = computed(() => {
  if (props.fallback) return props.fallback
  if (props.alt) return getInitials(props.alt)
  return '?'
})

function handleImageError() {
  imageError.value = true
}
</script>

<template>
  <span :class="avatarClass">
    <img
      v-if="showImage"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
      @error="handleImageError"
    />
    <span
      v-else
      class="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-medium"
    >
      {{ fallbackText }}
    </span>
  </span>
</template>
