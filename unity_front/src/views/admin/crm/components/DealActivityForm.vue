<script setup lang="ts">
/**
 * Deal Activity Form Component
 * Form for adding activities to a deal
 */

import { ref } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { ActivityType } from '@/types/crm'

// Props
interface Props {
  dealId: number
}

defineProps<Props>()

// Composables
const { t } = useTranslations()

// Emits
const emit = defineEmits<{
  (e: 'submit', data: { type: ActivityType; description: string }): void
}>()

// State
const activityType = ref<ActivityType>('note')
const description = ref('')
const isSubmitting = ref(false)
const showValidation = ref(false)

// Activity types
const activityTypes = [
  { value: 'note' as ActivityType, label: () => t('admin.crm.activity.types.note'), icon: '📝' },
  { value: 'call' as ActivityType, label: () => t('admin.crm.activity.types.call'), icon: '📞' },
  { value: 'email' as ActivityType, label: () => t('admin.crm.activity.types.email'), icon: '✉️' },
  { value: 'meeting' as ActivityType, label: () => t('admin.crm.activity.types.meeting'), icon: '🤝' },
]

// Handle submit
async function handleSubmit(): Promise<void> {
  if (!description.value.trim()) {
    showValidation.value = true
    return
  }

  isSubmitting.value = true

  try {
    emit('submit', {
      type: activityType.value,
      description: description.value.trim(),
    })

    // Reset form
    description.value = ''
    activityType.value = 'note'
    showValidation.value = false
  } finally {
    isSubmitting.value = false
  }
}

// Clear validation when user types
function handleInput(): void {
  if (description.value.trim()) {
    showValidation.value = false
  }
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h4 class="font-semibold text-gray-900 mb-4">{{ t('admin.crm.activity.new_activity') }}</h4>

    <form @submit.prevent="handleSubmit">
      <!-- Activity Type -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('admin.crm.activity.type') }}</label>
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="type in activityTypes"
            :key="type.value"
            class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
            :class="
              activityType === type.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            "
          >
            <input
              v-model="activityType"
              type="radio"
              :value="type.value"
              class="sr-only"
            />
            <span class="text-xl mr-2">{{ type.icon }}</span>
            <span class="text-sm font-medium text-gray-900">{{ type.label() }}</span>
          </label>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('admin.crm.activity.description') }}
          <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="description"
          rows="3"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 resize-none transition-colors"
          :class="showValidation && !description.trim() ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'"
          :placeholder="t('admin.crm.activity.description_placeholder')"
          :disabled="isSubmitting"
          @input="handleInput"
        ></textarea>
        <div class="flex items-center justify-between mt-1">
          <p v-if="showValidation && !description.trim()" class="text-sm text-red-600">
            {{ t('admin.crm.activity.description_required') }}
          </p>
          <p class="text-xs text-gray-500 ml-auto">
            {{ description.length }}/500
          </p>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!description.trim() || isSubmitting"
      >
        {{ isSubmitting ? t('admin.crm.activity.adding') : t('admin.crm.activity.add') }}
      </button>
    </form>
  </div>
</template>
