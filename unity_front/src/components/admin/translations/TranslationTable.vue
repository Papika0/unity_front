<template>
  <div
    class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden"
  >
    <!-- Mobile Card View -->
    <div class="block lg:hidden">
      <div
        v-for="translation in translations"
        :key="translation.id"
        class="border-b border-slate-200 p-4 hover:bg-slate-50/50 transition-colors duration-200"
      >
        <div class="space-y-3">
          <!-- Header Row -->
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-slate-900 truncate">
                {{ translation.key }}
              </h3>
              <div class="mt-1">
                <GroupBadge :group="translation.group" />
              </div>
            </div>
            <StatusBadge :active="translation.active" />
          </div>

          <!-- Languages -->
          <div class="space-y-2">
            <div v-if="translation.text_ka" class="text-xs">
              <span class="font-medium text-slate-600">🇬🇪 {{ t('admin.translations.language_ka') }}:</span>
              <p class="mt-1 text-slate-800 line-clamp-2">{{ translation.text_ka }}</p>
            </div>
            <div v-if="translation.text_en" class="text-xs">
              <span class="font-medium text-slate-600">🇬🇧 {{ t('admin.translations.language_en') }}:</span>
              <p class="mt-1 text-slate-800 line-clamp-2">{{ translation.text_en }}</p>
            </div>
            <div v-if="translation.text_ru" class="text-xs">
              <span class="font-medium text-slate-600">🇷🇺 {{ t('admin.translations.language_ru') }}:</span>
              <p class="mt-1 text-slate-800 line-clamp-2">{{ translation.text_ru }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              @click="$emit('edit', translation)"
              class="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all duration-200"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              {{ t('admin.common.edit') }}
            </button>
            <button
              @click="$emit('delete', translation)"
              class="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              {{ t('admin.common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden lg:block overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-gradient-to-r from-slate-50 to-slate-100">
          <tr>
            <th
              class="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/6"
            >
              {{ t('admin.translations.key') }}
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-20"
            >
              {{ t('admin.translations.group') }}
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/4"
            >
              🇬🇪 {{ t('admin.translations.language_ka') }}
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/4"
            >
              🇬🇧 {{ t('admin.translations.language_en') }}
            </th>
            <th
              class="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/6"
            >
              🇷🇺 {{ t('admin.translations.language_ru') }}
            </th>
            <th
              class="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16"
            >
              {{ t('admin.translations.status') }}
            </th>
            <th class="relative px-3 py-3 w-24">
              <span class="sr-only">{{ t('admin.translations.actions') }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-100">
          <tr
            v-for="translation in translations"
            :key="translation.id"
            class="hover:bg-slate-50/50 transition-colors duration-200"
          >
            <td class="px-3 py-3">
              <div class="text-sm font-medium text-slate-900 break-words leading-tight">
                {{ translation.key }}
              </div>
            </td>
            <td class="px-3 py-3">
              <GroupBadge :group="translation.group" />
            </td>
            <td class="px-3 py-3">
              <div
                class="text-sm text-slate-800 leading-snug break-words max-h-16 overflow-hidden"
                :title="translation.text_ka"
              >
                {{ translation.text_ka }}
              </div>
            </td>
            <td class="px-3 py-3">
              <div
                class="text-sm text-slate-800 leading-snug break-words max-h-16 overflow-hidden"
                :title="translation.text_en"
              >
                {{ translation.text_en }}
              </div>
            </td>
            <td class="px-3 py-3">
              <div
                class="text-sm text-slate-800 leading-snug break-words max-h-16 overflow-hidden"
                :title="translation.text_ru || '—'"
              >
                {{ translation.text_ru || '—' }}
              </div>
            </td>
            <td class="px-3 py-3 text-center">
              <StatusBadge :active="translation.active" />
            </td>
            <td class="px-3 py-3">
              <div class="flex space-x-1">
                <button
                  @click="$emit('edit', translation)"
                  class="inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  :title="t('admin.translations.edit_item', { item: translation.key })"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </button>
                <button
                  @click="$emit('delete', translation)"
                  class="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                  :title="t('admin.translations.delete_item', { item: translation.key })"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Translation } from '@/types'
import GroupBadge from '../ui/GroupBadge.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

interface Props {
  translations: Translation[]
}

interface Emits {
  (e: 'edit', translation: Translation): void
  (e: 'delete', translation: Translation): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
/* Enhanced hover effects */
tr:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}
</style>
