<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <label
        :for="language"
        class="flex items-center space-x-2 text-sm font-semibold text-slate-800"
      >
        <div
          class="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            ></path>
          </svg>
        </div>
        <span>{{ label }}</span>
        <span v-if="required" class="text-red-500 text-xs">*</span>
      </label>
      <button
        v-if="canTranslate && !translating"
        @click="$emit('translate')"
        type="button"
        class="relative z-10 inline-flex items-center gap-2 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-2 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-200 hover:border-blue-300 transform hover:scale-105 shadow-sm hover:shadow-md"
      >
        <svg v-if="translating" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          ></path>
        </svg>
        🔄 თარგმნა
      </button>
    </div>
    <div class="relative z-0">
      <textarea
        :id="language"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        rows="4"
        :required="required"
        class="relative z-0 block w-full px-4 py-4 text-base text-slate-900 border-2 border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none placeholder:text-slate-500 bg-white"
        :placeholder="placeholder"
      ></textarea>
      <div
        class="absolute bottom-3 right-3 text-xs text-slate-500 bg-white/95 px-2 py-1 rounded-lg z-5 font-medium"
      >
        {{ modelValue?.length || 0 }} chars
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  language: string
  label: string
  placeholder: string
  required?: boolean
  canTranslate?: boolean
  translating?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'translate'): void
}

withDefaults(defineProps<Props>(), {
  required: false,
  canTranslate: false,
  translating: false,
})

defineEmits<Emits>()
</script>
