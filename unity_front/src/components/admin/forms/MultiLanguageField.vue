<template>
  <div class="space-y-6">
    <div v-for="lang in langs" :key="`${fieldName}-${lang}`">
      <label
        :for="`${fieldName}-${lang}`"
        class="flex items-center justify-between text-sm font-semibold text-slate-800 mb-3"
      >
        <span>{{ getLanguageLabel(lang) }}</span>
        <button
          v-if="lang !== 'ka' && showTranslateButton"
          @click="handleTranslate(lang)"
          type="button"
          :class="[
            'relative z-10 inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-all duration-300 font-medium',
            formData.ka && !translating
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed',
          ]"
          :disabled="translating || !formData.ka"
        >
          <svg
            v-if="translating"
            class="animate-spin w-3 h-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <svg
            v-else
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            ></path>
          </svg>
          {{
            translating ? 'თარგმნა...' : !formData.ka ? 'ჯერ ქართული ტექსტი შეიყვანეთ' : 'თარგმნა'
          }}
        </button>
      </label>
      <component
        :is="fieldType"
        :id="`${fieldName}-${lang}`"
        :value="formData[lang]"
        :type="inputType"
        :rows="rows"
        :required="required"
        :class="`relative z-0 ${inputClasses}`"
        :placeholder="getPlaceholder(lang)"
        @input="handleInput(lang, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'

interface Props {
  fieldName: string
  fieldType?: 'input' | 'textarea'
  inputType?: string
  placeholder: string
  formData: Record<string, string>
  required?: boolean
  rows?: number
  variant?: 'amber' | 'emerald' | 'violet'
  showTranslateButton?: boolean
  translating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fieldType: 'input',
  inputType: 'text',
  required: false,
  rows: 4,
  variant: 'amber',
  showTranslateButton: true,
  translating: false,
})

const emit = defineEmits<{
  translate: [fromLang: string, toLang: string]
  'update:formData': [value: Record<string, string>]
}>()

const langs = ['ka', 'en', 'ru']

function handleInput(lang: string, event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  const newFormData = { ...props.formData }
  newFormData[lang] = target.value
  emit('update:formData', newFormData)
}

const inputClasses = computed(() => {
  const focusColors = {
    amber: 'focus:ring-amber-500 focus:border-amber-500',
    emerald: 'focus:ring-emerald-500 focus:border-emerald-500',
    violet: 'focus:ring-violet-500 focus:border-violet-500',
  }

  const baseClasses =
    'w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 transition-all duration-300 text-slate-900 placeholder-slate-500 font-medium shadow-sm'
  const resizeClass = props.fieldType === 'textarea' ? 'resize-none' : ''

  return `${baseClasses} ${focusColors[props.variant]} ${resizeClass}`
})

function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    ka: 'ქართული',
    en: 'English',
    ru: 'Русский',
  }
  return labels[lang] || lang
}

function getPlaceholder(lang: string): string {
  return `${props.placeholder} (${getLanguageLabel(lang)})`
}

function handleTranslate(toLang: string) {
  // Get the current value directly from the Georgian input field
  const kaInput = document.getElementById(`${props.fieldName}-ka`) as
    | HTMLInputElement
    | HTMLTextAreaElement

  // Update form data with current input value first
  if (kaInput && kaInput.value !== props.formData.ka) {
    const newFormData = { ...props.formData }
    newFormData.ka = kaInput.value
    emit('update:formData', newFormData)
  }

  // Emit translate with a small delay to ensure update propagation
  nextTick(() => {
    emit('translate', 'ka', toLang)
  })
}
</script>
