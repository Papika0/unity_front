<script setup lang="ts">
import { computed } from 'vue'
import type { RelatedArticle } from '@/types/news'
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useLocaleStore } from '@/stores/ui/locale'
import { useTranslations } from '@/composables/i18n/useTranslations'

defineProps<{
  articles: RelatedArticle[]
}>()

const { t } = useTranslations()
const localeStore = useLocaleStore()
const { element: relatedElement, isVisible: relatedVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })

// Use computed so it updates when translations load
const categoryLabels = computed(() => ({
  all: t('news.categories.all'),
  company: t('news.categories.company'),
  project: t('news.categories.project'),
  industry: t('news.categories.industry'),
  event: t('news.categories.event'),
}))

const formatDate = (publishDate: string) => {
  const localeMap: Record<string, string> = {
    ka: 'ka-GE',
    en: 'en-US',
    ru: 'ru-RU',
  }
  return new Date(publishDate).toLocaleDateString(
    localeMap[localeStore.currentLocale] || 'ka-GE',
  )
}
</script>

<template>
  <section ref="relatedElement" v-if="articles.length > 0" class="bg-zinc-50 py-16">
    <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <h2 class="text-3xl font-light text-zinc-900 mb-4 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0': relatedVisible,
          'opacity-0 translate-y-8': !relatedVisible,
        }"
      >
        {{ t('news.related.title') }}
      </h2>
      <div class="w-20 h-0.5 bg-[#FFCD4B] mb-12 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 origin-left"
        :class="{
          'scale-x-100': relatedVisible,
          'scale-x-0': !relatedVisible,
        }"
      ></div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article
          v-for="(relatedArticle, index) in articles"
          :key="relatedArticle.id"
          class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 relative"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': relatedVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !relatedVisible,
          }"
          :style="{ transitionDelay: `${200 + index * 80}ms` }"
        >
          <div class="relative h-48 bg-zinc-100 overflow-hidden">
            <img
              :src="relatedArticle.main_image?.url || 'https://placehold.co/400x250'"
              :alt="relatedArticle.main_image?.alt_text || relatedArticle.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
            />

            <!-- Gradient overlay on hover -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <!-- Golden accent line on hover -->
            <div
              class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            ></div>
          </div>

          <div class="p-6 bg-white relative overflow-hidden">
            <!-- Subtle background accent -->
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-3">
                <span
                  class="px-3 py-1 bg-black/5 text-zinc-800 text-xs font-light uppercase tracking-wider border border-zinc-200"
                >
                  {{ categoryLabels[relatedArticle.category] || relatedArticle.category }}
                </span>
                <time class="text-zinc-500 text-xs font-light">
                  {{ formatDate(relatedArticle.publish_date) }}
                </time>
              </div>

              <h3
                class="text-lg font-light text-zinc-900 mb-3 line-clamp-2 group-hover:text-[#C89116] transition-colors duration-300"
              >
                {{ relatedArticle.title }}
              </h3>

              <p class="text-zinc-600 text-sm mb-4 line-clamp-3 font-light">
                {{ relatedArticle.excerpt }}
              </p>

              <router-link
                :to="`/news/${relatedArticle.id}`"
                class="inline-flex items-center gap-2 text-[#FFCD4B] hover:text-[#C89116] text-sm font-light uppercase tracking-wider group/link"
              >
                {{ t('news.readMore') }}
                <svg
                  class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </router-link>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

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
