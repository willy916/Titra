<script setup lang="ts">
import { provide, computed } from 'vue'
import { cn } from '@/utils'
import { radioGroupInjectionKey } from './radioGroupKey'

interface Props {
  modelValue?: string
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

provide(radioGroupInjectionKey, {
  modelValue: computed(() => props.modelValue),
  updateValue: (value: string) => emit('update:modelValue', value),
})

const groupClass = computed(() => cn('grid gap-3', props.class))
</script>

<template>
  <div :class="groupClass" role="radiogroup">
    <slot />
  </div>
</template>
