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
  featuredArticle: NewsArticle | null
  selectedCategory: string
  searchQuery: string
  isTransitioning: boolean
  categoryLabels: Record<string, string>
  formatDate: (date: string) => string
  t: (key: string) => string
}>()

// Component manages its own scroll animation
const { element: featuredElement, isVisible: featuredVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <div
    ref="featuredElement"
    v-if="featuredArticle && selectedCategory === 'all' && !searchQuery.trim()"
    class="mb-20 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': featuredVisible && !isTransitioning,
      'opacity-0 translate-y-12 scale-95 blur-sm': !featuredVisible || isTransitioning,
    }"
  >
    <div class="text-center mb-12 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="{
        'opacity-100 translate-y-0': featuredVisible,
        'opacity-0 translate-y-8': !featuredVisible,
      }"
    >
      <h2 class="text-3xl md:text-4xl font-light text-zinc-900 mb-4">
        {{ t('news.featured.title') }}
      </h2>
      <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-center"
        :class="{
          'scale-x-100': featuredVisible,
          'scale-x-0': !featuredVisible,
        }"
      ></div>
    </div>

    <div
      class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative"
    >
      <div class="lg:flex">
        <div class="lg:w-3/5 relative overflow-hidden">
          <img
            :src="featuredArticle.main_image?.url || 'https://placehold.co/800x500'"
            :alt="featuredArticle.main_image?.alt_text || featuredArticle.title"
            class="w-full h-64 lg:h-96 object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <!-- Golden accent line on hover -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>

        <div class="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center relative">
          <!-- Subtle background accent -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-6">
              <span class="px-4 py-1.5 bg-black/5 text-zinc-800 text-sm font-light uppercase tracking-wider border border-zinc-200">
                {{ categoryLabels[featuredArticle.category] }}
              </span>
              <time class="text-zinc-500 text-sm font-light">
                {{ formatDate(featuredArticle.publish_date) }}
              </time>
            </div>

            <h3 class="text-2xl lg:text-3xl font-light text-zinc-900 mb-6 leading-tight group-hover:text-[#C89116] transition-colors duration-300">
              {{ featuredArticle.title }}
            </h3>

            <p class="text-zinc-700 leading-relaxed mb-8 text-base font-light">
              {{ featuredArticle.excerpt }}
            </p>

            <router-link
              :to="`/news/${featuredArticle.id}`"
              class="inline-flex items-center gap-3 text-[#FFCD4B] hover:text-[#C89116] font-light text-sm uppercase tracking-wider group/link"
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
      </div>
    </div>
  </div>
</template>
