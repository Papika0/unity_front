<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'
import { useNewsStore } from '@/stores/public/news'
import { useLocaleStore } from '@/stores/ui/locale'
import type { NewsArticle } from '@/types'

const route = useRoute()
const router = useRouter()
const { t } = useTranslations()
const newsStore = useNewsStore()
const localeStore = useLocaleStore()

const article = computed(() => newsStore.currentArticle)
const isLoading = computed(() => newsStore.loading)
const error = ref<string | null>(null)
const showGalleryModal = ref(false)
const currentGalleryIndex = ref(0)

const relatedArticles = computed(() => {
  if (!article.value) return []

  const categoryArticles = newsStore.categorizedArticles[article.value.category] || []
  return categoryArticles.filter((a: NewsArticle) => a.id !== article.value?.id).slice(0, 3)
})

const formattedDate = computed(() => {
  if (!article.value) return ''

  const date = new Date(article.value.publish_date)
  const localeMap = {
    ka: 'ka-GE',
    en: 'en-US',
    ru: 'ru-RU',
  }
  const locale = localeMap[localeStore.currentLocale] || 'ka-GE'

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const categoryLabels = computed(() => ({
  all: t('news.categories.all'),
  company: t('news.categories.company'),
  project: t('news.categories.project'),
  industry: t('news.categories.industry'),
  event: t('news.categories.event'),
}))

const openGallery = (index: number) => {
  currentGalleryIndex.value = index
  showGalleryModal.value = true
}

const closeGallery = () => {
  showGalleryModal.value = false
}

const nextImage = () => {
  if (!article.value?.gallery_images) return
  currentGalleryIndex.value = (currentGalleryIndex.value + 1) % article.value.gallery_images.length
}

const prevImage = () => {
  if (!article.value?.gallery_images) return
  currentGalleryIndex.value =
    (currentGalleryIndex.value - 1 + article.value.gallery_images.length) %
    article.value.gallery_images.length
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!showGalleryModal.value) return

  switch (e.key) {
    case 'Escape':
      closeGallery()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'ArrowLeft':
      prevImage()
      break
  }
}

const fetchArticle = async () => {
  const articleId = parseInt(route.params.id as string)

  if (isNaN(articleId)) {
    error.value = t('errors.invalidId') || 'Invalid article ID'
    return
  }

  try {
    error.value = null

    const fetchedArticle = await newsStore.loadArticle(articleId)

    if (!fetchedArticle) {
      error.value = t('errors.notFound') || 'Article not found'
      router.push('/news')
      return
    }
  } catch (err) {
    error.value = t('errors.loadFailed') || 'Failed to load article'
    console.error('Error fetching article:', err)
  }
}

// Watch for route changes
watch(() => route.params.id, fetchArticle, { immediate: true })

onMounted(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0)
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
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
        {{ t('buttons.back') }}
      </router-link>
    </div>

    <!-- Article Content -->
    <div v-else-if="article && article.id" class="max-w-4xl mx-auto px-4 md:px-8 py-16">
      <!-- Breadcrumb -->
      <nav class="mb-8">
        <ol class="flex items-center space-x-2 text-sm text-zinc-600">
          <li>
            <router-link to="/" class="hover:text-amber-600">{{ t('header.home') }}</router-link>
          </li>
          <li>/</li>
          <li>
            <router-link to="/news" class="hover:text-amber-600">{{ t('news.title') }}</router-link>
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
            {{ categoryLabels[article.category] || article.category }}
          </span>
          <time class="text-zinc-600 text-sm">{{ formattedDate }}</time>
          <span class="text-zinc-400 text-sm">{{ article.views }} {{ t('news.views') }}</span>
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
        <!-- <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full"
          >
            #{{ tag }}
          </span>
        </div> -->
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
          v-html="(article.content || '').replace(/\n/g, '<br>')"
        ></div>
      </div>

      <!-- Gallery Images -->
      <div v-if="article.gallery_images && article.gallery_images.length > 0" class="mt-12">
        <h3 class="text-2xl font-normal font-roboto text-zinc-900 mb-6">
          {{ t('news.gallery.title') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <img
            v-for="(image, index) in article.gallery_images"
            :key="index"
            :src="image"
            :alt="`${article.title || ''} - ${t('news.gallery.image')} ${index + 1}`"
            class="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
            @click="openGallery(index)"
          />
        </div>
      </div>

      <!-- Gallery Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="showGalleryModal && article && article.gallery_images"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
            @click="closeGallery"
          >
            <!-- Close Button -->
            <button
              class="absolute top-4 right-4 text-white hover:text-amber-300 transition-colors z-10"
              @click="closeGallery"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <!-- Previous Button -->
            <button
              v-if="article.gallery_images.length > 1"
              class="absolute left-4 text-white hover:text-amber-300 transition-colors z-10"
              @click.stop="prevImage"
            >
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <!-- Image -->
            <div class="max-w-7xl max-h-[90vh] px-16" @click.stop>
              <img
                :src="article.gallery_images[currentGalleryIndex]"
                :alt="`${article.title} - ${t('news.gallery.image')} ${currentGalleryIndex + 1}`"
                class="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <p class="text-white text-center mt-4">
                {{ currentGalleryIndex + 1 }} / {{ article.gallery_images.length }}
              </p>
            </div>

            <!-- Next Button -->
            <button
              v-if="article.gallery_images.length > 1"
              class="absolute right-4 text-white hover:text-amber-300 transition-colors z-10"
              @click.stop="nextImage"
            >
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </Transition>
      </Teleport>

      <!-- Share Section -->
    </div>

    <!-- Related Articles -->
    <section v-if="relatedArticles.length > 0" class="bg-zinc-50 py-16">
      <div class="max-w-7xl mx-auto px-4 md:px-8">
        <h2 class="text-3xl font-normal font-roboto text-zinc-900 mb-8">
          {{ t('news.related.title') }}
        </h2>
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
                  {{ categoryLabels[relatedArticle.category] || relatedArticle.category }}
                </span>
                <time class="text-zinc-500 text-xs">
                  {{
                    new Date(relatedArticle.publish_date).toLocaleDateString(
                      { ka: 'ka-GE', en: 'en-US', ru: 'ru-RU' }[localeStore.currentLocale] ||
                        'ka-GE',
                    )
                  }}
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
                {{ t('news.readMore') }} →
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
