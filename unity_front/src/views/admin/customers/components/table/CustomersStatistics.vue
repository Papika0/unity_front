<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-600">{{ t('admin.customers.stats.total') }}</p>
          <p class="text-2xl font-bold text-slate-800 mt-1">{{ statistics.total }}</p>
        </div>
        <div class="bg-blue-100 p-3 rounded-lg">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-600">{{ t('admin.customers.stats.new') }}</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">{{ statistics.new }}</p>
        </div>
        <div class="bg-green-100 p-3 rounded-lg">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-600">{{ t('admin.customers.stats.contact_form') }}</p>
          <p class="text-2xl font-bold text-indigo-600 mt-1">{{ statistics.contact_form }}</p>
        </div>
        <div class="bg-indigo-100 p-3 rounded-lg">
          <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-600">{{ t('admin.customers.stats.call_request') }}</p>
          <p class="text-2xl font-bold text-emerald-600 mt-1">{{ statistics.call_request }}</p>
        </div>
        <div class="bg-emerald-100 p-3 rounded-lg">
          <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomerStatistics } from '@/services/adminCustomerApi'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

defineProps<{
  statistics: CustomerStatistics
}>()
</script>
