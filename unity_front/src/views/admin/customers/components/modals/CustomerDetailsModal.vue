<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show && customer"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click="$emit('close')"
      >
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-800">{{ t('admin.customers.details_modal.title') }}</h3>
            <button
              @click="$emit('close')"
              class="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.common.name') }}</label>
              <p class="text-slate-900">{{ customer.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.login.email') }}</label>
              <a :href="`mailto:${customer.email}`" class="text-blue-600 hover:text-blue-800">
                {{ customer.email }}
              </a>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.common.phone') }}</label>
              <a :href="`tel:${customer.phone}`" class="text-blue-600 hover:text-blue-800">
                {{ customer.phone }}
              </a>
            </div>

            <div v-if="customer.subject">
              <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.common.subject') }}</label>
              <p class="text-slate-900">{{ customer.subject }}</p>
            </div>

            <div v-if="customer.message">
              <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.common.message') }}</label>
              <p class="text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                {{ customer.message }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.customers.table.source') }}</label>
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getSourceBadgeClass(customer.source)"
                >
                  {{ getSourceLabel(customer.source) }}
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.common.status') }}</label>
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getStatusBadgeClass(customer.status)"
                >
                  {{ getStatusLabel(customer.status) }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('admin.common.created_at') }}</label>
              <p class="text-slate-900">{{ formatDate(customer.created_at) }}</p>
            </div>

            <!-- Notes Section -->
            <div class="border-t border-slate-200 pt-4">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-slate-700">{{ t('admin.customers.details_modal.notes') }}</label>
                <button
                  v-if="!editingNotes"
                  @click="startEditing"
                  class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {{ customer.notes ? t('admin.customers.details_modal.edit_notes') : t('admin.customers.details_modal.add_notes') }}
                </button>
              </div>
              
              <div v-if="editingNotes">
                <textarea
                  v-model="localNotes"
                  rows="4"
                  :placeholder="t('admin.customers.details_modal.notes_placeholder')"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 resize-none"
                ></textarea>
                <div class="flex justify-end space-x-2 mt-2">
                  <button
                    @click="cancelEditing"
                    class="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    {{ t('admin.common.cancel') }}
                  </button>
                  <button
                    @click="saveNotes"
                    class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {{ t('admin.common.save') }}
                  </button>
                </div>
              </div>
              
              <div v-else>
                <p
                  v-if="customer.notes"
                  class="text-slate-900 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg"
                >
                  {{ customer.notes }}
                </p>
                <p v-else class="text-slate-500 italic">{{ t('admin.customers.details_modal.no_notes') }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="$emit('close')"
              class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              {{ t('admin.common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Customer } from '@/services/adminCustomerApi'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

const props = defineProps<{
  show: boolean
  customer: Customer | null
  editingNotes: boolean
  notesInput: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:editingNotes', value: boolean): void
  (e: 'update:notesInput', value: string): void
  (e: 'saveNotes'): void
}>()

const localNotes = ref('')

watch(() => props.notesInput, (newVal) => {
  localNotes.value = newVal
})

const startEditing = () => {
  emit('update:editingNotes', true)
  localNotes.value = props.notesInput
}

const cancelEditing = () => {
  emit('update:editingNotes', false)
  localNotes.value = props.customer?.notes || ''
  emit('update:notesInput', localNotes.value) // Reset parent input too if strictly controlled
}

const saveNotes = () => {
  emit('update:notesInput', localNotes.value)
  emit('saveNotes')
}

// Helper functions (duplicated for self-containment, or could be imported from utils)
const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getSourceBadgeClass = (source: string) => {
  return source === 'contact_form'
    ? 'bg-indigo-100 text-indigo-800'
    : 'bg-emerald-100 text-emerald-800'
}

const getStatusLabel = (status: string) => {
  return t(`admin.customers.status.${status}`)
}

const getSourceLabel = (source: string) => {
  return source === 'contact_form' ? t('admin.customers.stats.contact_form') : t('admin.customers.stats.call_request')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
