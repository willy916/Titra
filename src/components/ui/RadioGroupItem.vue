<script setup lang="ts">
import { inject, computed } from 'vue'
import { Circle } from 'lucide-vue-next'
import { cn } from '@/utils'
import { radioGroupInjectionKey } from './radioGroupKey'

interface Props {
  value: string
  id?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const radioGroup = inject(radioGroupInjectionKey)

const isChecked = computed(() => radioGroup?.modelValue.value === props.value)

const itemClass = computed(() =>
  cn(
    'aspect-square h-4 w-4 shrink-0 rounded-full border border-input text-primary shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    isChecked.value && 'border-primary',
    props.class
  )
)

function handleChange() {
  if (!props.disabled && radioGroup) {
    radioGroup.updateValue(props.value)
  }
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="isChecked"
    :data-state="isChecked ? 'checked' : 'unchecked'"
    :disabled="disabled"
    :id="id"
    :class="itemClass"
    @click="handleChange"
  >
    <span v-if="isChecked" class="flex items-center justify-center">
      <Circle class="h-2.5 w-2.5 fill-primary text-primary" />
    </span>
  </button>
</template>
