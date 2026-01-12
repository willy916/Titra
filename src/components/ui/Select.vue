<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { cn } from '@/utils'
import { ChevronDown } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Sélectionner...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectedLabel = computed(() => {
  const option = props.options.find(o => o.value === props.modelValue)
  return option?.label ?? props.placeholder
})

const triggerClass = computed(() =>
  cn(
    'flex h-10 w-full items-center justify-between rounded-lg border border-border bg-input-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
)

function toggleOpen() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

// Close on click outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.select-container')) {
    isOpen.value = false
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<template>
  <div class="select-container relative">
    <button
      type="button"
      :class="triggerClass"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span :class="{ 'text-muted-foreground': !modelValue }">
        {{ selectedLabel }}
      </span>
      <ChevronDown
        class="h-4 w-4 opacity-50 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg"
      >
        <div class="max-h-60 overflow-auto p-1">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none hover:bg-muted focus:bg-muted"
            :class="{ 'bg-muted': option.value === modelValue }"
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
