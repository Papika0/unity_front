<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>

        <!-- Dialog Container -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <Transition name="dialog-scale">
            <div
              v-if="show"
              class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all"
              @click.stop
            >
              <!-- Header -->
              <div class="border-b border-gray-200 px-6 py-4">
                <div class="flex items-start justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <svg
                        class="h-6 w-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ title }}
                    </h3>
                  </div>
                </div>
              </div>

              <!-- Body -->
              <div class="px-6 py-4">
                <p class="text-sm text-gray-600 leading-relaxed">
                  {{ message }}
                </p>
              </div>

              <!-- Footer -->
              <div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div class="flex items-center justify-end space-x-3">
                  <!-- Cancel Button -->
                  <button
                    type="button"
                    @click="handleCancel"
                    :disabled="isLoading"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ cancelText || t('admin.confirm_dialog.cancel') }}
                  </button>

                  <!-- Destructive Button (Discard) -->
                  <button
                    v-if="destructiveText"
                    type="button"
                    @click="handleDestructive"
                    :disabled="isLoading"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ destructiveText }}
                  </button>

                  <!-- Confirm Button (Save) -->
                  <button
                    type="button"
                    @click="handleConfirm"
                    :disabled="isLoading"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <svg
                      v-if="isLoading"
                      class="animate-spin h-4 w-4 text-white"
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
                    <span>{{ confirmText || t('admin.confirm_dialog.confirm') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  destructiveText?: string
  isLoading?: boolean
  allowBackdropClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  allowBackdropClose: true,
  isLoading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  destructive: []
}>()

const handleConfirm = () => {
  if (!props.isLoading) {
    emit('confirm')
  }
}

const handleCancel = () => {
  if (!props.isLoading) {
    emit('cancel')
  }
}

const handleDestructive = () => {
  if (!props.isLoading) {
    emit('destructive')
  }
}

const handleBackdropClick = () => {
  if (props.allowBackdropClose && !props.isLoading) {
    emit('cancel')
  }
}

// Keyboard support
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.show) return

  if (e.key === 'Escape' && !props.isLoading) {
    e.preventDefault()
    emit('cancel')
  } else if (e.key === 'Enter' && !props.isLoading) {
    e.preventDefault()
    emit('confirm')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* Dialog fade transition */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

/* Dialog scale transition */
.dialog-scale-enter-active,
.dialog-scale-leave-active {
  transition: all 0.2s ease;
}

.dialog-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
