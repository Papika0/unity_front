<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.common.search') }}</label>
        <input
          v-model="filters.search"
          type="text"
          :placeholder="t('admin.customers.filters.search_placeholder')"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
          @keyup.enter="$emit('apply')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.common.status') }}</label>
        <select
          v-model="filters.status"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.customers.table.source') }}</label>
        <select
          v-model="filters.source"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
        >
          <option v-for="option in sourceOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="flex space-x-2 col-span-2">
        <button
          @click="$emit('apply')"
          class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          {{ t('admin.common.search') }}
        </button>
        <button
          @click="$emit('reset')"
          class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          {{ t('admin.common.clear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

const props = defineProps<{
  modelValue: {
    status: string
    source: string
    search: string
    date_from: string
    date_to: string
    per_page: number
    page: number
  }
}>()

const filters = props.modelValue

const statusOptions = computed(() => [
  { value: 'all', label: t('admin.common.all') },
  { value: 'new', label: t('admin.customers.status.new') },
  { value: 'contacted', label: t('admin.customers.status.contacted') },
  { value: 'in_progress', label: t('admin.customers.status.in_progress') },
  { value: 'completed', label: t('admin.customers.status.completed') },
  { value: 'cancelled', label: t('admin.customers.status.cancelled') },
])

const sourceOptions = computed(() => [
  { value: 'all', label: t('admin.common.all') },
  { value: 'contact_form', label: t('admin.customers.stats.contact_form') },
  { value: 'call_request', label: t('admin.customers.stats.call_request') },
])

defineEmits<{
  (e: 'apply'): void
  (e: 'reset'): void
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>()
</script>
