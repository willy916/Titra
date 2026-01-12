<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils'

interface Props {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'text-foreground',
  destructive: 'border-transparent bg-destructive text-white',
}

const badgeClass = computed(() =>
  cn(
    'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden',
    variantClasses[props.variant],
    props.class
  )
)
</script>

<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>
