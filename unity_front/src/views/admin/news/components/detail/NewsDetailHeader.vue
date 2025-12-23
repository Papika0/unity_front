<template>
  <div class="mb-12">
    <button
      @click="$emit('back')"
      class="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-300 mb-6 group font-medium text-sm bg-white/80 px-4 py-2 rounded-full border border-slate-300 hover:border-emerald-500/50 shadow-sm"
    >
      <svg
        class="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
      {{ t('admin.news.back_to_news') }}
    </button>

    <!-- Title and Actions -->
    <div class="flex items-start justify-between mb-6">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-3">
          <h1
            class="text-5xl font-light bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 bg-clip-text text-transparent tracking-tight leading-tight py-1"
          >
            {{ article.title.ka || article.title.en || article.title.ru }}
          </h1>
          <div class="flex gap-2">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                article.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
              ]"
            >
              {{ article.is_active ? t('admin.common.active') : t('admin.common.inactive') }}
            </span>
            <span
              v-if="article.is_featured"
              class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
            >
              {{ t('admin.common.featured') }}
            </span>
          </div>
        </div>
        <p class="text-slate-600 text-xl font-light mb-2">
          {{ getCategoryName(article.category) }}
        </p>
        <div class="flex items-center gap-4 text-sm text-slate-500">
          <span>{{ t('admin.news.publish_date') }}: {{ article.formatted_publish_date }}</span>
          <span>•</span>
          <span>{{ t('admin.news.views') }}: {{ article.views }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 ml-6">
        <button
          @click="$emit('edit')"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          @click="$emit('delete')"
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { AdminNewsArticle } from '@/types'

defineProps<{
  article: AdminNewsArticle
}>()

defineEmits<{
  back: []
  edit: []
  delete: []
}>()

const { t } = useTranslations()

function getCategoryName(category: string): string {
  const categories = {
    company: 'კომპანია',
    project: 'პროექტი',
    industry: 'ინდუსტრია',
    event: 'ღონისძიება',
  }
  return categories[category as keyof typeof categories] || category
}
</script>
