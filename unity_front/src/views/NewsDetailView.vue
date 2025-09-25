<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'
import { useNewsStore } from '@/stores/public/news'
import type { NewsArticle } from '@/types'

const route = useRoute()
const router = useRouter()
const { t } = useTranslations()
const newsStore = useNewsStore()

const article = ref<NewsArticle | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const relatedArticles = computed(() => {
  if (!article.value) return []

  const categoryArticles = newsStore.categorizedArticles[article.value.category] || []
  return categoryArticles.filter((a: NewsArticle) => a.id !== article.value?.id).slice(0, 3)
})

const formattedDate = computed(() => {
  if (!article.value) return ''

  const date = new Date(article.value.publish_date)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const categoryLabels: Record<string, { ka: string; en: string }> = {
  company: { ka: 'კომპანია', en: 'Company' },
  project: { ka: 'პროექტი', en: 'Project' },
  industry: { ka: 'ინდუსტრია', en: 'Industry' },
  event: { ka: 'ღონისძიება', en: 'Event' },
}

const copyToClipboard = () => {
  if (typeof window !== 'undefined' && window.navigator?.clipboard) {
    window.navigator.clipboard.writeText(window.location.href)
  }
}

const fetchArticle = async () => {
  const articleId = parseInt(route.params.id as string)

  if (isNaN(articleId)) {
    error.value = 'Invalid article ID'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const fetchedArticle = await newsStore.loadArticle(articleId)

    if (!fetchedArticle) {
      error.value = 'Article not found'
      router.push('/news')
      return
    }

    article.value = fetchedArticle
  } catch (err) {
    error.value = 'Failed to load article'
    console.error('Error fetching article:', err)
  } finally {
    isLoading.value = false
  }
}

// Watch for route changes
watch(() => route.params.id, fetchArticle, { immediate: true })

onMounted(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0)
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-300"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold text-red-600 mb-4">{{ error }}</h1>
      <router-link to="/news" class="text-amber-600 hover:text-amber-700 underline">
        უკან სიახლეებზე
      </router-link>
    </div>

    <!-- Article Content -->
    <div v-else-if="article" class="max-w-4xl mx-auto px-4 md:px-8 py-16">
      <!-- Breadcrumb -->
      <nav class="mb-8">
        <ol class="flex items-center space-x-2 text-sm text-zinc-600">
          <li>
            <router-link to="/" class="hover:text-amber-600">მთავარი</router-link>
          </li>
          <li>/</li>
          <li>
            <router-link to="/news" class="hover:text-amber-600">სიახლეები</router-link>
          </li>
          <li>/</li>
          <li class="text-zinc-900">{{ article.title }}</li>
        </ol>
      </nav>

      <!-- Article Header -->
      <header class="mb-12">
        <!-- Category & Date -->
        <div class="flex items-center gap-4 mb-6">
          <span class="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
            {{ categoryLabels[article.category].ka }}
          </span>
          <time class="text-zinc-600 text-sm">{{ formattedDate }}</time>
          <span class="text-zinc-400 text-sm">{{ article.views }} ნახვა</span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-normal font-roboto text-zinc-900 leading-tight mb-6">
          {{ article.title }}
        </h1>

        <!-- Excerpt -->
        <p class="text-xl text-zinc-700 leading-relaxed mb-8">
          {{ article.excerpt }}
        </p>

        <!-- Tags -->
        <div v-if="article.tags.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full"
          >
            #{{ tag }}
          </span>
        </div>
      </header>

      <!-- Main Image -->
      <div class="mb-12">
        <img
          :src="article.main_image || 'https://placehold.co/800x400'"
          :alt="article.title"
          class="w-full h-[400px] md:h-[500px] object-cover rounded-lg"
        />
      </div>

      <!-- Article Content -->
      <div class="prose prose-lg max-w-none">
        <div
          class="text-zinc-800 leading-relaxed whitespace-pre-line"
          v-html="article.content.replace(/\n/g, '<br>')"
        ></div>
      </div>

      <!-- Gallery Images -->
      <div v-if="article.gallery_images.length > 0" class="mt-12">
        <h3 class="text-2xl font-normal font-roboto text-zinc-900 mb-6">ფოტო გალერეა</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <img
            v-for="(image, index) in article.gallery_images"
            :key="index"
            :src="image"
            :alt="`${article.title} - სურათი ${index + 1}`"
            class="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </div>
      </div>

      <!-- Share Section -->
      <div class="mt-12 pt-8 border-t border-zinc-200">
        <h3 class="text-lg font-medium text-zinc-900 mb-4">გაუზიარე სტატია</h3>
        <div class="flex gap-4">
          <button
            @click="() => {}"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
              />
            </svg>
            Twitter
          </button>
          <button
            @click="() => {}"
            class="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            Facebook
          </button>
          <button
            @click="copyToClipboard"
            class="flex items-center gap-2 px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            კოპირება
          </button>
        </div>
      </div>
    </div>

    <!-- Related Articles -->
    <section v-if="relatedArticles.length > 0" class="bg-zinc-50 py-16">
      <div class="max-w-7xl mx-auto px-4 md:px-8">
        <h2 class="text-3xl font-normal font-roboto text-zinc-900 mb-8">მსგავსი სტატიები</h2>
        <img src="../assets/Vector_10.png" alt="" class="mb-12" />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article
            v-for="relatedArticle in relatedArticles"
            :key="relatedArticle.id"
            class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              :src="relatedArticle.main_image || 'https://placehold.co/400x250'"
              :alt="relatedArticle.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3">
                <span
                  class="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"
                >
                  {{ categoryLabels[relatedArticle.category].ka }}
                </span>
                <time class="text-zinc-500 text-xs">
                  {{ new Date(relatedArticle.publish_date).toLocaleDateString('ka-GE') }}
                </time>
              </div>

              <h3 class="text-lg font-medium text-zinc-900 mb-2 line-clamp-2">
                {{ relatedArticle.title }}
              </h3>

              <p class="text-zinc-600 text-sm mb-4 line-clamp-3">
                {{ relatedArticle.excerpt }}
              </p>

              <router-link
                :to="`/news/${relatedArticle.id}`"
                class="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                სრულად წაკითხვა →
              </router-link>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
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
