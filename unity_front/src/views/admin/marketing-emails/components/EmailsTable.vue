<template>
  <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.marketing_emails.table.email') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.common.name') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.marketing_emails.table.description') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.common.status') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.common.created_at') }}</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">{{ t('admin.customers.table.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-12 text-center text-slate-500">{{ t('admin.common.loading') }}</td>
          </tr>
          <tr v-else-if="emails.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-slate-500">{{ t('admin.marketing_emails.table.not_found') }}</td>
          </tr>
          <tr
            v-for="email in emails"
            :key="email.id"
            class="hover:bg-slate-50 transition-colors"
          >
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-slate-900">{{ email.email }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-slate-900">{{ email.name || '-' }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-slate-500 max-w-xs truncate">{{ email.description || '-' }}</div>
            </td>
            <td class="px-6 py-4">
              <button
                @click="$emit('toggleActive', email)"
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors"
                :class="email.is_active
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'"
              >
                {{ email.is_active ? t('admin.marketing_emails.table.active') : t('admin.marketing_emails.table.inactive') }}
              </button>
            </td>
            <td class="px-6 py-4 text-sm text-slate-500">
              {{ formatDate(email.created_at) }}
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button
                @click="$emit('edit', email)"
                class="text-blue-600 hover:text-blue-800 transition-colors"
                :title="t('admin.common.edit')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="$emit('delete', email.id)"
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
</template>

<script setup lang="ts">
import type { MarketingEmail } from '@/services/adminMarketingEmailApi'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

defineProps<{
  emails: MarketingEmail[]
  loading: boolean
  pagination: Pagination
}>()

defineEmits<{
  (e: 'edit', email: MarketingEmail): void
  (e: 'delete', id: number): void
  (e: 'toggleActive', email: MarketingEmail): void
  (e: 'changePage', page: number): void
}>()

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
