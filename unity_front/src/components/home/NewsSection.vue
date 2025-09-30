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
    image: article.main_image,
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
  <section class="bg-white py-16">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <h3
        class="text-zinc-900 text-4xl font-normal font-roboto uppercase leading-loose tracking-[3px] mb-8"
      >
        {{ t('news.title') }}
      </h3>
      <img src="../../assets/Vector_10.png" alt="" class="mb-12" />

      <div class="space-y-16">
        <!-- Articles -->
        <div v-for="article in displayArticles" :key="article.id" class="space-y-8">
          <img
            :src="article.image"
            :alt="article.title"
            class="w-full h-[527px] object-cover bg-zinc-300"
          />
          <div>
            <div class="flex items-center gap-2 mb-2">
              <time class="text-zinc-600 text-sm">{{ formatDate(article.publishDate) }}</time>
            </div>
            <h3 class="text-zinc-900 text-xl font-normal font-roboto leading-7 mb-4">
              {{ article.title }}
            </h3>
            <p class="text-zinc-700 text-base leading-relaxed mb-4">
              {{ article.excerpt }}
            </p>
            <router-link
              :to="`/news/${article.id}`"
              class="text-zinc-900 text-base font-normal font-roboto underline uppercase leading-tight tracking-[3.36px] hover:text-zinc-600 transition-colors"
            >
              {{ t('buttons.see_details') }}
            </router-link>
          </div>
        </div>

        <!-- View All News Button -->
        <div class="text-center pt-8">
          <router-link
            to="/news"
            class="inline-flex items-center px-8 py-3 bg-amber-300 text-zinc-900 font-roboto font-medium uppercase tracking-[2px] hover:bg-amber-400 transition-colors"
          >
            {{ t('buttons.view_all') }}
            <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
