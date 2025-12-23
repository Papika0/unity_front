<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
    <div class="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
      <div class="flex items-center">
        <div class="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="ml-3 sm:ml-4 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">{{ t('admin.gallery.total_images') }}</p>
          <p class="text-lg sm:text-2xl font-bold text-gray-900">{{ totalImages }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div class="flex items-center">
        <div class="p-3 bg-green-100 rounded-lg">
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">{{ t('admin.gallery.active_images') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ activeImages }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div class="flex items-center">
        <div class="p-3 bg-purple-100 rounded-lg">
          <svg
            class="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">{{ t('admin.gallery.categories') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ categoryCount }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
      <div class="flex items-center">
        <div class="p-3 bg-orange-100 rounded-lg">
          <svg
            class="w-6 h-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">{{ t('admin.gallery.projects') }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ projectCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

defineProps<{
  totalImages: number
  activeImages: number
  categoryCount: number
  projectCount: number
}>()
</script>
