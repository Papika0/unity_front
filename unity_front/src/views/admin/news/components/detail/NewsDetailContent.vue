<template>
  <div class="space-y-8">
    <!-- Excerpt -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
        <h2 class="text-xl font-semibold text-white">{{ t('admin.news.brief_desc') }}</h2>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-if="article.excerpt.ka">
            <h4 class="font-medium text-slate-700 mb-2">ქართული</h4>
            <p class="text-slate-600 leading-relaxed">{{ article.excerpt.ka }}</p>
          </div>
          <div v-if="article.excerpt.en">
            <h4 class="font-medium text-slate-700 mb-2">English</h4>
            <p class="text-slate-600 leading-relaxed">{{ article.excerpt.en }}</p>
          </div>
          <div v-if="article.excerpt.ru">
            <h4 class="font-medium text-slate-700 mb-2">Русский</h4>
            <p class="text-slate-600 leading-relaxed">{{ article.excerpt.ru }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Content -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h2 class="text-xl font-semibold text-white">{{ t('admin.news.full_content') }}</h2>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <div v-if="article.content.ka">
            <h4 class="font-medium text-slate-700 mb-3">ქართული</h4>
            <div class="prose prose-slate max-w-none">
              <p class="text-slate-600 leading-relaxed whitespace-pre-line">
                {{ article.content.ka }}
              </p>
            </div>
          </div>
          <div v-if="article.content.en">
            <h4 class="font-medium text-slate-700 mb-3">English</h4>
            <div class="prose prose-slate max-w-none">
              <p class="text-slate-600 leading-relaxed whitespace-pre-line">
                {{ article.content.en }}
              </p>
            </div>
          </div>
          <div v-if="article.content.ru">
            <h4 class="font-medium text-slate-700 mb-3">Русский</h4>
            <div class="prose prose-slate max-w-none">
              <p class="text-slate-600 leading-relaxed whitespace-pre-line">
                {{ article.content.ru }}
              </p>
            </div>
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
</script>

<style scoped>
.prose {
  color: #374151;
}

.prose p {
  margin-bottom: 1rem;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: #111827;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.prose ul,
.prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose a {
  color: #2563eb;
}

.prose a:hover {
  color: #1d4ed8;
}
</style>
