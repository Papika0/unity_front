<template>
  <div class="space-y-8">
    <!-- Tags and SEO -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Tags -->
      <div
        v-if="article.tags && article.tags.length"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <h2 class="text-xl font-semibold text-white">{{ t('admin.news.tags') }}</h2>
        </div>
        <div class="p-6">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- SEO -->
      <div
        v-if="article.meta_title || article.meta_description"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <h2 class="text-xl font-semibold text-white">{{ t('admin.news.seo') }}</h2>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="article.meta_title">
            <h4 class="font-medium text-slate-700 mb-2">Meta Title</h4>
            <p class="text-slate-600 text-sm">{{ article.meta_title }}</p>
          </div>
          <div v-if="article.meta_description">
            <h4 class="font-medium text-slate-700 mb-2">Meta Description</h4>
            <p class="text-slate-600 text-sm">{{ article.meta_description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Meta Information -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="bg-gradient-to-r from-slate-500 to-slate-600 px-6 py-4">
        <h2 class="text-xl font-semibold text-white">{{ t('admin.news.meta_info') }}</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-slate-700 mb-2">{{ t('admin.news.created_at') }}</h4>
            <p class="text-slate-600 text-sm">{{ formatDate(article.created_at) }}</p>
          </div>
          <div>
            <h4 class="font-medium text-slate-700 mb-2">{{ t('admin.news.updated_at') }}</h4>
            <p class="text-slate-600 text-sm">{{ formatDate(article.updated_at) }}</p>
          </div>
        </div>
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

const { t } = useTranslations()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
