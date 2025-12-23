<script setup lang="ts">
/**
 * Deal Activity Form Component
 * Form for adding activities to a deal
 */

import { ref } from 'vue'
import type { ActivityType } from '@/types/crm'

// Props
interface Props {
  dealId: number
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'submit', data: { type: ActivityType; description: string }): void
}>()

// State
const activityType = ref<ActivityType>('note')
const description = ref('')
const isSubmitting = ref(false)

// Activity types
const activityTypes: Array<{ value: ActivityType; label: string; icon: string }> = [
  { value: 'note', label: 'შენიშვნა', icon: '📝' },
  { value: 'call', label: 'ზარი', icon: '📞' },
  { value: 'email', label: 'ელ. ფოსტა', icon: '✉️' },
  { value: 'meeting', label: 'შეხვედრა', icon: '🤝' },
]

// Handle submit
async function handleSubmit(): Promise<void> {
  if (!description.value.trim()) return

  isSubmitting.value = true

  try {
    emit('submit', {
      type: activityType.value,
      description: description.value.trim(),
    })

    // Reset form
    description.value = ''
    activityType.value = 'note'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h4 class="font-semibold text-gray-900 mb-4">ახალი აქტივობა</h4>

    <form @submit.prevent="handleSubmit">
      <!-- Activity Type -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">ტიპი</label>
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
            <span class="text-sm font-medium text-gray-900">{{ type.label }}</span>
          </label>
        </div>
      </div>

      <!-- Description -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">აღწერა *</label>
        <textarea
          v-model="description"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 resize-none"
          placeholder="დაწერეთ აქტივობის დეტალები..."
          :disabled="isSubmitting"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!description.trim() || isSubmitting"
      >
        {{ isSubmitting ? 'ემატება...' : 'აქტივობის დამატება' }}
      </button>
    </form>
  </div>
</template>
