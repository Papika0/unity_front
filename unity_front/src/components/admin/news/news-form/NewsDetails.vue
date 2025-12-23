<template>
  <FormCard title="სტატიის დეტალები" variant="emerald">
    <div class="space-y-10">
      <!-- Category -->
      <FormSection title="კატეგორია" variant="emerald">
        <div>
          <label class="block text-sm font-semibold text-slate-800 mb-3">აირჩიეთ კატეგორია</label>
          <select
            :value="category"
            @change="emit('update:category', ($event.target as HTMLSelectElement).value)"
            required
            class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
            :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': hasFieldError('category') }"
          >
            <option value="">კატეგორიის არჩევა</option>
            <option value="company">კომპანია</option>
            <option value="project">პროექტი</option>
            <option value="industry">ინდუსტრია</option>
            <option value="event">ღონისძიება</option>
          </select>
          <!-- Error Display for Category -->
          <div v-if="hasFieldError('category')" class="mt-3 space-y-2">
            <FieldError v-for="error in getFieldError('category')" :key="error" label="კატეგორია" :error="error" />
          </div>
        </div>
      </FormSection>

      <!-- Publish Date -->
      <FormSection title="გამოქვეყნების თარიღი" variant="emerald">
        <div>
          <label class="block text-sm font-semibold text-slate-800 mb-3">აირჩიეთ თარიღი</label>
          <input
            :value="publishDate"
            @input="emit('update:publishDate', ($event.target as HTMLInputElement).value)"
            type="date"
            class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
          />
        </div>
      </FormSection>

      <!-- Status Checkboxes -->
      <div class="grid md:grid-cols-2 gap-6">
        <FormSection title="სტატუსი" variant="emerald">
          <div class="space-y-4">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                :checked="isActive"
                @change="emit('update:isActive', ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                class="w-5 h-5 text-emerald-600 border-2 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <span class="text-sm font-medium text-slate-700">აქტიური</span>
            </label>
          </div>
        </FormSection>
      </div>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { FormCard, FormSection } from '@/components/admin/forms'
import FieldError from './FieldError.vue'

const props = defineProps<{
  category: string
  publishDate: string
  isActive: boolean
  errors: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:category': [value: string]
  'update:publishDate': [value: string]
  'update:isActive': [value: boolean]
}>()

const getFieldError = (fieldName: string) => props.errors[fieldName] || []
const hasFieldError = (fieldName: string) => getFieldError(fieldName).length > 0
</script>
