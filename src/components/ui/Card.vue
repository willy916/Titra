<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils'

interface Props {
  class?: any
}

const props = defineProps<Props>()

const cardClass = computed(() =>
  cn(
    'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border',
    props.class
  )
)
</script>

<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>
