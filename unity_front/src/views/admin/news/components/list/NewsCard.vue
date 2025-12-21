<template>
  <article
    class="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 hover:border-amber-200 transform hover:-translate-y-1 flex flex-col h-full"
  >
    <!-- Article Image -->
    <div class="relative overflow-hidden">
      <img
        v-if="article.main_image"
        :src="
          typeof article.main_image === 'string' ? article.main_image : article.main_image.url
        "
        :alt="
          typeof article.main_image === 'string'
            ? article.title.ka
            : article.main_image.alt_text || article.title.ka
        "
        class="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div
        v-else
        class="w-full h-40 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 flex items-center justify-center"
      >
        <svg
          class="h-16 w-16 text-amber-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>

      <!-- Overlay gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>

      <!-- Status badges -->
      <div class="absolute top-4 left-4 flex gap-2">
        <span
          v-if="article.is_featured"
          class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-medium rounded-full shadow-lg"
        >
          ⭐ {{ t('admin.common.featured') }}
        </span>
        <span
          v-if="!article.is_active"
          class="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-full shadow-lg"
        >
          🚫 {{ t('admin.common.inactive') }}
        </span>
      </div>

      <!-- Category badge -->
      <div class="absolute top-4 right-4">
        <span
          class="px-3 py-1 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-medium rounded-full border border-slate-200 shadow-sm"
        >
          {{ getCategoryLabel(article.category) }}
        </span>
      </div>
    </div>

    <!-- Article Info -->
    <div class="p-4 flex flex-col h-full">
      <!-- Meta info -->
      <div class="flex items-center justify-between text-sm text-slate-500 mb-2">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="font-medium">{{ formatDate(article.publish_date) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span class="font-medium">{{ article.views }} {{ t('admin.news.views') }}</span>
        </div>
      </div>

      <!-- Title -->
      <h3
        class="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300 leading-snug"
      >
        {{ article.title.ka }}
      </h3>

      <!-- Excerpt -->
      <p class="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {{ article.excerpt.ka }}
      </p>

      <!-- Tags -->
      <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in article.tags.slice(0, 3)"
          :key="tag"
          class="px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-200"
        >
          {{ tag }}
        </span>
        <span
          v-if="article.tags.length > 3"
          class="px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200"
        >
          +{{ article.tags.length - 3 }}
        </span>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col gap-3 mt-auto">
        <!-- Primary Actions Row -->
        <div class="grid grid-cols-2 gap-3">
          <button
            @click="$emit('view', article.id)"
            class="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-3 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 font-medium text-sm border border-blue-200 flex items-center justify-center gap-2 group/btn"
          >
            <svg
              class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span class="hidden sm:inline">{{ t('admin.common.view') }}</span>
            <span class="sm:hidden">👁</span>
          </button>
          <button
            @click="$emit('edit', article.id)"
            class="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 px-4 py-3 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-all duration-300 font-medium text-sm border border-amber-200 flex items-center justify-center gap-2 group/btn"
          >
            <svg
              class="w-4 h-4 group-hover/btn:rotate-12 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span class="hidden sm:inline">{{ t('admin.common.edit') }}</span>
            <span class="sm:hidden">✏️</span>
          </button>
        </div>

        <!-- Secondary Action Row -->
        <button
          @click="$emit('delete', article)"
          class="w-full bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-4 py-3 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 font-medium text-sm border border-red-200 flex items-center justify-center gap-2 group/btn"
        >
          <svg
            class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>{{ t('admin.common.delete') }}</span>
          <span class="text-xs opacity-75">({{ t('admin.common.dangerous') }})</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { AdminNewsArticle } from '@/types/index'
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  article: AdminNewsArticle
}>()

defineEmits<{
  (e: 'view', id: number): void
  (e: 'edit', id: number): void
  (e: 'delete', article: AdminNewsArticle): void
}>()

const { t } = useTranslations()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getCategoryLabel = (category: string) => {
  const key = `admin.news.category_${category}`
  return t(key) !== key ? t(key) : category
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
