<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      type="button"
      :class="[
        'relative w-full px-4 py-3 text-left bg-white border-2 border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 cursor-pointer hover:border-slate-300 hover:shadow-md',
        isOpen ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      :disabled="disabled"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span v-if="selectedOption?.icon" class="text-lg">{{ selectedOption.icon }}</span>
          <span :class="selectedOption ? 'text-slate-900' : 'text-slate-500'">
            {{ selectedOption ? selectedOption.label : placeholder }}
          </span>
        </div>
        <svg
          :class="[
            'w-5 h-5 text-slate-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl backdrop-blur-sm max-h-60 overflow-auto ring-1 ring-black/5"
      >
        <div class="py-2">
          <button
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            type="button"
            :class="[
              'w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors duration-150 flex items-center space-x-3',
              modelValue === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-900',
            ]"
          >
            <span v-if="option.icon" class="text-lg">{{ option.icon }}</span>
            <span class="font-medium">{{ option.label }}</span>
            <svg
              v-if="modelValue === option.value"
              class="w-4 h-4 text-indigo-600 ml-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface DropdownOption {
  value: string
  label: string
  icon?: string
}

interface Props {
  modelValue: string
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option...',
  disabled: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue)
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: DropdownOption) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
