<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

interface NewsArticle {
  id: number
  title: string
  excerpt: string
  category: string
  publish_date: string
  is_featured: boolean
  views: number
  main_image?: {
    url: string
    alt_text?: string | null
  } | null
}

defineProps<{
  articles: NewsArticle[]
  isTransitioning: boolean
  categoryLabels: Record<string, string>
  formatDate: (date: string) => string
  t: (key: string) => string
}>()

// Component manages its own scroll animation
const { element: articlesGridElement, isVisible: articlesGridVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <div ref="articlesGridElement" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
    <article
      v-for="(article, index) in articles"
      :key="article.id"
      class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 relative"
      :class="{
        'opacity-100 translate-y-0 scale-100 blur-0': articlesGridVisible && !isTransitioning,
        'opacity-0 translate-y-12 scale-95 blur-sm': !articlesGridVisible || isTransitioning,
      }"
      :style="{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }"
    >
      <div class="relative h-56 bg-zinc-100 overflow-hidden">
        <img
          :src="article.main_image?.url || 'https://placehold.co/400x280'"
          :alt="article.main_image?.alt_text || article.title"
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

        <!-- Category Badge -->
        <div class="absolute top-4 left-4">
          <span
            class="px-3 py-1 bg-white/90 backdrop-blur-sm text-zinc-800 text-xs font-light uppercase tracking-wider"
          >
            {{ categoryLabels[article.category] }}
          </span>
        </div>

        <!-- Featured Badge -->
        <div v-if="article.is_featured" class="absolute top-4 right-4">
          <span
            class="px-3 py-1 bg-gradient-to-r from-[#FFCD4B] to-[#C89116] text-black text-xs font-light uppercase tracking-wider"
          >
            {{ t('news.featured.badge') }}
          </span>
        </div>
      </div>

      <div class="p-6 bg-white relative overflow-hidden">
        <!-- Subtle background accent -->
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        ></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-4">
            <time class="text-zinc-500 text-sm font-light">
              {{ formatDate(article.publish_date) }}
            </time>
            <span class="text-zinc-300">•</span>
            <span class="text-zinc-500 text-sm font-light"
              >{{ article.views }} {{ t('news.views') }}</span
            >
          </div>

          <h3
            class="text-lg font-light text-zinc-900 mb-4 line-clamp-2 group-hover:text-[#C89116] transition-colors duration-300 leading-snug"
          >
            {{ article.title }}
          </h3>

          <p class="text-zinc-600 text-sm mb-6 line-clamp-3 leading-relaxed font-light">
            {{ article.excerpt }}
          </p>

          <router-link
            :to="`/news/${article.id}`"
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
</template>

<style scoped>
/* Line clamp utilities */
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
