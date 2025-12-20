<template>
  <FormCard title="თაგები" variant="emerald">
    <FormSection title="თაგების მართვა" variant="emerald">
      <div class="space-y-4">
        <div class="flex gap-3">
          <input
            v-model="internalNewTag"
            type="text"
            placeholder="დაამატეთ თაგი"
            class="flex-1 px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
            @keyup.enter="onAddTag"
          />
          <button
            type="button"
            @click="onAddTag"
            class="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
          >
            დამატება
          </button>
        </div>

        <!-- Tags Display -->
        <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="(tag, index) in tags"
            :key="index"
            class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
          >
            {{ tag }}
            <button
              type="button"
              @click="emit('remove-tag', index)"
              class="text-emerald-500 hover:text-emerald-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </FormSection>
  </FormCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormCard, FormSection } from '@/components/admin/forms'

const { tags } = defineProps<{
  tags: string[]
}>()

const emit = defineEmits<{
  'add-tag': [value: string]
  'remove-tag': [index: number]
}>()

const internalNewTag = ref('')

function onAddTag() {
  if (internalNewTag.value.trim()) {
    emit('add-tag', internalNewTag.value.trim())
    internalNewTag.value = ''
  }
}
</script>
