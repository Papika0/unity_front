<script setup lang="ts">
import type { Feature } from '@/services/featuresApi'
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  feature: Feature
  isSelected: boolean
}>()

const model = defineModel<number[]>({ required: true })
const { t, currentLocale } = useTranslations()
</script>

<template>
  <div
    class="flex items-center p-4 border rounded-lg transition-all"
    :class="[
      isSelected
        ? 'border-green-300 bg-green-50'
        : 'border-gray-200 hover:bg-gray-50',
    ]"
  >
    <input
      :id="`feature-${feature.id}`"
      v-model="model"
      :value="feature.id"
      type="checkbox"
      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label :for="`feature-${feature.id}`" class="ml-3 flex-1 cursor-pointer">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-md bg-gradient-to-r flex items-center justify-center text-white text-sm"
          :class="feature.color"
        >
          {{ feature.icon }}
        </div>
        <div class="flex-1">
          <div class="font-medium text-gray-900 flex items-center gap-2">
            {{ feature.title[currentLocale] || feature.title.ka || feature.name }}
            <span
              v-if="isSelected"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {{ t('admin.features.assigned') }}
            </span>
          </div>
          <div class="text-sm text-gray-600">
            {{ feature.description[currentLocale] || feature.description.ka || '' }}
          </div>
        </div>
      </div>
    </label>
  </div>
</template>
