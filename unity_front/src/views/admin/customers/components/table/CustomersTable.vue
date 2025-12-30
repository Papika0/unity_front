<template>
  <div>
    <!-- Bulk Actions -->
    <div v-if="selectedIds.length > 0 && isAdmin" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-blue-900">
          {{ t('admin.customers.table.selected_count', { count: selectedIds.length }) }}
        </span>
      </div>
      <div class="mt-3 flex space-x-3">
        <select
          @change="handleBulkUpdate"
          class="px-3 py-1.5 text-sm border border-blue-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{{ t('admin.customers.table.change_status') }}</option>
          <option value="contacted">{{ t('admin.customers.status.contacted') }}</option>
          <option value="in_progress">{{ t('admin.customers.status.in_progress') }}</option>
          <option value="completed">{{ t('admin.customers.status.completed') }}</option>
          <option value="cancelled">{{ t('admin.customers.status.cancelled') }}</option>
        </select>
        <button
          @click="$emit('bulkDelete')"
          class="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          {{ t('admin.common.delete') }}
        </button>
        <button
          @click="$emit('bulkCreateLeads')"
          class="px-4 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          {{ t('admin.customers.table.create_leads') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th v-if="isAdmin" class="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="$emit('toggleAll', ($event.target as HTMLInputElement).checked)"
                  class="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.common.name') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.customers.table.contact') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.customers.table.source') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.common.status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.common.date') }}</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.customers.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading">
              <td :colspan="isAdmin ? 7 : 6" class="px-6 py-12 text-center text-slate-500">{{ t('admin.common.loading') }}</td>
            </tr>
            <tr v-else-if="customers.length === 0">
              <td :colspan="isAdmin ? 7 : 6" class="px-6 py-12 text-center text-slate-500">{{ t('admin.customers.table.not_found') }}</td>
            </tr>
            <tr
              v-for="customer in customers"
              :key="customer.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td v-if="isAdmin" class="px-4 py-4">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(customer.id)"
                  @change="toggleOne(customer.id)"
                  class="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-900">{{ customer.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-900">{{ customer.email }}</div>
                <div class="text-sm text-slate-500">{{ customer.phone }}</div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getSourceBadgeClass(customer.source)"
                >
                  {{ getSourceLabel(customer.source) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <select
                  :value="customer.status"
                  @change="(e) => $emit('updateStatus', customer.id, (e.target as HTMLSelectElement).value)"
                  class="px-2 py-1 text-xs font-semibold rounded-full border-0"
                  :class="getStatusBadgeClass(customer.status)"
                >
                  <option value="new">{{ t('admin.customers.status.new') }}</option>
                  <option value="contacted">{{ t('admin.customers.status.contacted') }}</option>
                  <option value="in_progress">{{ t('admin.customers.status.in_progress') }}</option>
                  <option value="completed">{{ t('admin.customers.status.completed') }}</option>
                  <option value="cancelled">{{ t('admin.customers.status.cancelled') }}</option>
                </select>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ formatDate(customer.created_at) }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="$emit('viewDetails', customer)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  :title="t('admin.customers.table.details')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  v-if="isAdmin"
                  @click="$emit('delete', customer.id)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                  :title="t('admin.common.delete')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-700 font-medium">
            {{ t('admin.common.pagination_info', { from: pagination.from, to: pagination.to, total: pagination.total }) }}
          </div>
          <div class="flex space-x-2">
            <button
              :disabled="pagination.current_page === 1"
              @click="$emit('changePage', pagination.current_page - 1)"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
              {{ t('admin.common.prev') }}
            </button>
            <button
              :disabled="pagination.current_page === pagination.last_page"
              @click="$emit('changePage', pagination.current_page + 1)"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {{ t('admin.common.next') }}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Customer } from '@/services/adminCustomerApi'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

const props = defineProps<{
  customers: Customer[]
  loading: boolean
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  selectedIds: number[]
  allSelected: boolean
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selectedIds', ids: number[]): void
  (e: 'toggleAll', checked: boolean): void
  (e: 'viewDetails', customer: Customer): void
  (e: 'delete', id: number): void
  (e: 'updateStatus', id: number, status: string): void
  (e: 'bulkUpdateStatus', status: string): void
  (e: 'bulkDelete'): void
  (e: 'bulkCreateLeads'): void
  (e: 'changePage', page: number): void
}>()

const handleBulkUpdate = (e: Event) => {
  const target = e.target as HTMLSelectElement
  if (target.value) {
    emit('bulkUpdateStatus', target.value)
    target.value = ''
  }
}

const toggleOne = (id: number) => {
  const newSelectedIds = props.selectedIds.includes(id)
    ? props.selectedIds.filter((selectedId) => selectedId !== id)
    : [...props.selectedIds, id]
  emit('update:selectedIds', newSelectedIds)
}

// Helper functions for badge classes and labels
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
