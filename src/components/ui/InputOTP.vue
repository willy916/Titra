<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { cn } from '@/utils'

interface Props {
  modelValue?: string
  maxLength?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  maxLength: 6,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [value: string]
}>()

const inputs = ref<HTMLInputElement[]>([])
const values = ref<string[]>(Array(props.maxLength).fill(''))

// Initialize values from modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const chars = newVal.split('').slice(0, props.maxLength)
      values.value = [...chars, ...Array(props.maxLength - chars.length).fill('')]
    }
  },
  { immediate: true }
)

const combinedValue = computed(() => values.value.join(''))

function updateModelValue() {
  emit('update:modelValue', combinedValue.value)
  if (combinedValue.value.length === props.maxLength) {
    emit('complete', combinedValue.value)
  }
}

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Only allow digits
  if (!/^\d*$/.test(value)) {
    target.value = values.value[index]
    return
  }

  // Handle paste
  if (value.length > 1) {
    const chars = value.split('').filter(c => /\d/.test(c))
    for (let i = 0; i < chars.length && index + i < props.maxLength; i++) {
      values.value[index + i] = chars[i]
    }
    const nextIndex = Math.min(index + chars.length, props.maxLength - 1)
    inputs.value[nextIndex]?.focus()
  } else {
    values.value[index] = value
    if (value && index < props.maxLength - 1) {
      inputs.value[index + 1]?.focus()
    }
  }

  updateModelValue()
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace') {
    if (!values.value[index] && index > 0) {
      inputs.value[index - 1]?.focus()
    }
    values.value[index] = ''
    updateModelValue()
  } else if (event.key === 'ArrowLeft' && index > 0) {
    inputs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < props.maxLength - 1) {
    inputs.value[index + 1]?.focus()
  }
}

function handleFocus(event: FocusEvent) {
  const target = event.target as HTMLInputElement
  target.select()
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/\D/g, '').slice(0, props.maxLength)
  
  for (let i = 0; i < digits.length; i++) {
    values.value[i] = digits[i]
  }
  
  const focusIndex = Math.min(digits.length, props.maxLength - 1)
  inputs.value[focusIndex]?.focus()
  updateModelValue()
}

const containerClass = computed(() => cn('flex items-center gap-2', props.class))
</script>

<template>
  <div :class="containerClass">
    <input
      v-for="(_, index) in maxLength"
      :key="index"
      :ref="(el) => { if (el) inputs[index] = el as HTMLInputElement }"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :value="values[index]"
      class="h-12 w-12 rounded-lg border border-border bg-input-background text-center text-lg font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
      @input="handleInput(index, $event)"
      @keydown="handleKeydown(index, $event)"
      @focus="handleFocus"
      @paste="handlePaste"
    />
  </div>
</template>
