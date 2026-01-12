<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils'

interface Props {
  value?: number
  max?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  max: 100,
})

const percentage = computed(() => {
  const val = Math.min(Math.max(props.value, 0), props.max)
  return (val / props.max) * 100
})

const progressClass = computed(() =>
  cn(
    'relative h-2 w-full overflow-hidden rounded-full bg-muted',
    props.class
  )
)
</script>

<template>
  <div :class="progressClass">
    <div
      class="h-full bg-primary transition-all duration-300 ease-in-out"
      :style="{ width: `${percentage}%` }"
    />
  </div>
</template>
