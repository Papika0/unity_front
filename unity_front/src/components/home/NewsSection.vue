<script setup lang="ts">
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const newsItems = [
  {
    title: t('news.article1'),
    image: 'https://placehold.co/1400x525',
  },
  {
    title: t('news.article2'),
    image: 'https://placehold.co/1400x527',
  },
]
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
      <div class="h-6 bg-amber-300 mb-12"></div>

      <div class="space-y-16">
        <div v-for="(news, index) in newsItems" :key="index" class="space-y-8">
          <img
            :src="news.image"
            :alt="news.title"
            class="w-full h-[527px] object-cover bg-zinc-300"
          />
          <div>
            <p class="text-zinc-900 text-xl font-normal font-roboto leading-7 mb-4">
              {{ news.title }}
            </p>
            <button
              class="text-zinc-900 text-base font-normal font-roboto underline uppercase leading-tight tracking-[3.36px] hover:text-zinc-600 transition-colors"
            >
              {{ t('news.readMore') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
