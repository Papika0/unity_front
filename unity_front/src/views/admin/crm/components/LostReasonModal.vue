<script setup lang="ts">
/**
 * Lost Reason Modal Component
 * Modal for selecting lost reason when moving deal to lost stage
 */

import { ref, onMounted } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useCrmStore } from '@/stores/admin/crm'

// Composables
const { t } = useTranslations()

// Emits
const emit = defineEmits<{
  (e: 'select', reasonId: number): void
  (e: 'cancel'): void
}>()

// Store
const crmStore = useCrmStore()

// State
const selectedReasonId = ref<number | null>(null)
const isLoading = ref(false)

// Load lost reasons on mount
onMounted(async () => {
  if (crmStore.lostReasons.length === 0) {
    isLoading.value = true
    try {
      await crmStore.fetchLostReasons()
    } catch (error) {
      console.error('Failed to load lost reasons:', error)
    } finally {
      isLoading.value = false
    }
  }
})

// Handle submit
function handleSubmit(): void {
  if (selectedReasonId.value) {
    emit('select', selectedReasonId.value)
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('cancel')"
      ></div>

      <!-- Modal -->
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lost-reason-modal-title"
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
          <h3 id="lost-reason-modal-title" class="text-lg font-semibold text-white">{{ t('admin.crm.lost_reason.title') }}</h3>
          <p class="text-sm text-red-100 mt-1">{{ t('admin.crm.lost_reason.subtitle') }}</p>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mx-auto"
            ></div>
            <p class="mt-4 text-gray-500 text-sm">{{ t('admin.crm.messages.loading') }}</p>
          </div>

          <!-- Reasons List -->
          <div v-else role="radiogroup" aria-label="Lost reason options" class="space-y-2">
            <label
              v-for="reason in crmStore.activeLostReasons"
              :key="reason.id"
              class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
              :class="
                selectedReasonId === reason.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
              "
            >
              <input
                v-model.number="selectedReasonId"
                type="radio"
                :value="reason.id"
                :aria-label="reason.label"
                class="mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <span class="ml-3 text-sm text-gray-900">{{ reason.label }}</span>
            </label>

            <!-- Empty State -->
            <div
              v-if="crmStore.activeLostReasons.length === 0"
              class="text-center py-8 text-gray-600"
            >
              <svg
                class="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p class="text-sm">{{ t('admin.crm.lost_reason.no_reasons') }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            aria-label="Cancel lost reason selection"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            @click="$emit('cancel')"
          >
            {{ t('admin.crm.form.cancel') }}
          </button>
          <button
            type="button"
            aria-label="Confirm lost reason and mark deal as lost"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedReasonId"
            @click="handleSubmit"
          >
            {{ t('admin.crm.form.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
