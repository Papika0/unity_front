<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useNewsStore } from '@/stores/public/news'

const { t } = useTranslations()
const newsStore = useNewsStore()

// Get first 2 recent articles for homepage display
const displayArticles = computed(() =>
  newsStore.recentArticles.slice(0, 2).map((article) => ({
    id: article.id,
    title: article.title,
    image: article.main_image?.url || '',
    excerpt: article.excerpt,
    publishDate: article.publish_date,
  })),
)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <!-- News Section -->
  <section class="bg-white py-24">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <h3 class="text-zinc-900 text-4xl font-light uppercase tracking-wider mb-4">
        {{ t('news.title') }}
      </h3>
      <div class="w-20 h-0.5 bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] mb-16"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Articles -->
        <div
          v-for="article in displayArticles"
          :key="article.id"
          class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative"
        >
          <div class="relative overflow-hidden">
            <img
              :src="article.image"
              :alt="article.title"
              class="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
          </div>

          <div class="p-8">
            <div class="flex items-center gap-2 mb-4">
              <time class="text-[#C89116] text-sm font-light uppercase tracking-wider">{{
                formatDate(article.publishDate)
              }}</time>
            </div>
            <h3 class="text-zinc-900 text-2xl font-light leading-tight mb-4">
              {{ article.title }}
            </h3>
            <p class="text-zinc-600 text-base font-light leading-relaxed mb-6">
              {{ article.excerpt }}
            </p>
            <router-link
              :to="`/news/${article.id}`"
              class="inline-flex items-center gap-2 text-[#C89116] text-sm font-light uppercase tracking-wider hover:text-[#FFCD4B] transition-colors"
            >
              <span>{{ t('buttons.see_details') }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </router-link>
          </div>

          <!-- Golden Accent Line -->
          <div
            class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
          ></div>
        </div>

      </div>

      <!-- View All News Button -->
      <div class="text-center mt-16">
        <router-link
          to="/news"
          class="inline-flex items-center gap-3 px-10 py-4 bg-black hover:bg-zinc-900 text-[#FFCD4B] border border-[#FFCD4B]/30 font-light tracking-wider uppercase text-sm transition-all duration-300"
        >
          <span>{{ t('buttons.view_all') }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
