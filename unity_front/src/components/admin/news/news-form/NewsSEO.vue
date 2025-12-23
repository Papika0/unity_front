<template>
  <FormCard title="SEO ოპტიმიზაცია" variant="emerald">
    <div class="space-y-10">
      <!-- Meta Title -->
      <FormSection title="მეტა სათაური" variant="emerald">
        <div>
          <label class="block text-sm font-semibold text-slate-800 mb-3">SEO სათაური</label>
          <input
            :value="metaTitle"
            @input="emit('update:metaTitle', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="შეიყვანეთ SEO სათაური"
            class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
          />
        </div>
      </FormSection>

      <!-- Meta Description -->
      <FormSection title="მეტა აღწერა" variant="emerald">
        <div>
          <label class="block text-sm font-semibold text-slate-800 mb-3">SEO აღწერა</label>
          <textarea
            :value="metaDescription"
            @input="emit('update:metaDescription', ($event.target as HTMLTextAreaElement).value)"
            rows="3"
            placeholder="შეიყვანეთ SEO აღწერა"
            class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm resize-none"
          ></textarea>
        </div>
      </FormSection>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { FormCard, FormSection } from '@/components/admin/forms'

defineProps<{
  metaTitle: string
  metaDescription: string
}>()

const emit = defineEmits<{
  'update:metaTitle': [value: string]
  'update:metaDescription': [value: string]
}>()
</script>
