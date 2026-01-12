import type { InjectionKey, ComputedRef } from 'vue'

export interface RadioGroupContext {
  modelValue: ComputedRef<string | undefined>
  updateValue: (value: string) => void
}

export const radioGroupInjectionKey: InjectionKey<RadioGroupContext> = Symbol('radioGroup')
