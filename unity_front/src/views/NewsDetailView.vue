<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'
import { useNewsStore } from '@/stores/public/news'
import { useLocaleStore } from '@/stores/ui/locale'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const route = useRoute()
const router = useRouter()
const { t } = useTranslations()
const newsStore = useNewsStore()
const localeStore = useLocaleStore()

// Scroll animation refs
const { element: breadcrumbElement, isVisible: breadcrumbVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
const { element: headerElement, isVisible: headerVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
const { element: mainImageElement, isVisible: mainImageVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
const { element: contentElement, isVisible: contentVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
const { element: galleryElement, isVisible: galleryVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
const { element: relatedElement, isVisible: relatedVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })

const article = computed(() => newsStore.currentArticle)
const isLoading = computed(() => newsStore.loading)
const error = ref<string | null>(null)
const showGalleryModal = ref(false)
const currentGalleryIndex = ref(0)
const scrollProgress = ref(0)

// Scroll progress tracking
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

const relatedArticles = computed(() => {
  // Use related articles from API response
  return article.value?.related_articles || []
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
    
    // Scroll to top smoothly to trigger animations properly
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Wait for scroll to complete and DOM to update
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (err) {
    error.value = t('errors.loadFailed') || 'Failed to load article'
    console.error('Error fetching article:', err)
  }
}

// Watch for route changes
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    await fetchArticle()
  }
}, { immediate: true })

onMounted(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0)
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out shadow-[0_0_15px_rgba(255,205,75,0.6)]"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen bg-white">
      <div class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"
        ></div>
        <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">
          {{ t('news.loading') }}
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen bg-white">
      <div class="text-5xl mb-6">⚠️</div>
      <h1 class="text-xl font-light text-zinc-800 mb-4">{{ error }}</h1>
      <router-link
        to="/news"
        class="inline-flex items-center gap-3 px-8 py-3 bg-black text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-300 hover:bg-zinc-900"
      >
        {{ t('buttons.back') }}
      </router-link>
    </div>

    <!-- Article Content -->
    <div v-else-if="article && article.id" class="max-w-4xl mx-auto px-8 lg:px-16 xl:px-20 py-16">
      <!-- Breadcrumb -->
      <nav ref="breadcrumbElement" class="mb-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0': breadcrumbVisible,
          'opacity-0 translate-y-8': !breadcrumbVisible,
        }"
      >
        <ol class="flex items-center space-x-2 text-sm text-zinc-600 font-light">
          <li>
            <router-link to="/" class="hover:text-[#FFCD4B] transition-colors">{{
              t('header.home')
            }}</router-link>
          </li>
          <li>/</li>
          <li>
            <router-link to="/news" class="hover:text-[#FFCD4B] transition-colors">{{
              t('news.title')
            }}</router-link>
          </li>
          <li>/</li>
          <li class="text-zinc-900">{{ article.title }}</li>
        </ol>
      </nav>

      <!-- Article Header -->
      <header ref="headerElement" class="mb-12">
        <!-- Category & Date -->
        <div class="flex items-center gap-4 mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-x-0': headerVisible,
            'opacity-0 -translate-x-8': !headerVisible,
          }"
        >
          <span
            class="px-4 py-1.5 bg-black/5 text-zinc-800 text-sm font-light uppercase tracking-wider border border-zinc-200"
          >
            {{ categoryLabels[article.category] || article.category }}
          </span>
          <time class="text-zinc-600 text-sm font-light">{{ formattedDate }}</time>
          <span class="text-zinc-400 text-sm font-light"
            >{{ article.views }} {{ t('news.views') }}</span
          >
        </div>

        <!-- Title -->
        <h1
          class="text-4xl md:text-5xl font-light text-zinc-900 leading-tight mb-6 tracking-tight transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
          :class="{
            'opacity-100 translate-y-0': headerVisible,
            'opacity-0 translate-y-8': !headerVisible,
          }"
        >
          {{ article.title }}
        </h1>

        <!-- Divider -->
        <div class="w-20 h-0.5 bg-[#FFCD4B] mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-left"
          :class="{
            'scale-x-100': headerVisible,
            'scale-x-0': !headerVisible,
          }"
        ></div>

        <!-- Excerpt -->
        <p class="text-xl text-zinc-700 leading-relaxed font-light transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-300"
          :class="{
            'opacity-100 translate-y-0': headerVisible,
            'opacity-0 translate-y-8': !headerVisible,
          }"
        >
          {{ article.excerpt }}
        </p>
      </header>

      <!-- Main Image -->
      <div ref="mainImageElement" class="mb-12 group transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'opacity-100 translate-y-0 scale-100 blur-0': mainImageVisible,
          'opacity-0 translate-y-12 scale-95 blur-sm': !mainImageVisible,
        }"
      >
        <div class="relative overflow-hidden border border-zinc-100">
          <img
            :src="article.main_image?.url || 'https://placehold.co/800x400'"
            :alt="article.main_image?.alt_text || article.title"
            class="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <!-- Golden accent line on hover -->
          <div
            class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          ></div>
        </div>
      </div>

      <!-- Article Content -->
      <article ref="contentElement" class="mb-20">
        <div
          class="prose prose-lg prose-zinc max-w-none transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': contentVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !contentVisible,
          }"
          style="color: #18181b;"
          v-html="article.content"
        ></div>
      </article>

      <!-- Gallery Images -->
      <div ref="galleryElement" v-if="article.gallery_images && article.gallery_images.length > 0" class="mb-12">
        <h3 class="text-2xl font-light text-zinc-900 mb-4 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0': galleryVisible,
            'opacity-0 translate-y-8': !galleryVisible,
          }"
        >
          {{ t('news.gallery.title') }}
        </h3>
        <div class="w-20 h-0.5 bg-[#FFCD4B] mb-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 origin-left"
          :class="{
            'scale-x-100': galleryVisible,
            'scale-x-0': !galleryVisible,
          }"
        ></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(image, index) in article.gallery_images"
            :key="index"
            class="group relative overflow-hidden border border-zinc-100 hover:border-[#FFCD4B]/30 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
            :class="{
              'opacity-100 translate-y-0 scale-100': galleryVisible,
              'opacity-0 translate-y-12 scale-95': !galleryVisible,
            }"
            :style="{ transitionDelay: `${200 + index * 80}ms` }"
            @click="openGallery(index)"
          >
            <img
              :src="image.url"
              :alt="image.alt_text || `${article.title || ''} - ${t('news.gallery.image')} ${index + 1}`"
              class="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
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
              class="absolute top-6 right-6 z-20 text-white hover:text-[#FFCD4B] transition-colors"
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
              class="absolute left-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
              @click.stop="prevImage"
            >
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                :src="article.gallery_images[currentGalleryIndex].url"
                :alt="article.gallery_images[currentGalleryIndex].alt_text || `${article.title} - ${t('news.gallery.image')} ${currentGalleryIndex + 1}`"
                class="max-w-full max-h-[90vh] object-contain"
              />
              <p class="text-white text-center mt-4 font-light">
                {{ currentGalleryIndex + 1 }} / {{ article.gallery_images.length }}
              </p>
            </div>

            <!-- Next Button -->
            <button
              v-if="article.gallery_images.length > 1"
              class="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
              @click.stop="nextImage"
            >
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <section ref="relatedElement" v-if="relatedArticles.length > 0" class="bg-zinc-50 py-16">
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
            v-for="(relatedArticle, index) in relatedArticles"
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
                    {{
                      new Date(relatedArticle.publish_date).toLocaleDateString(
                        { ka: 'ka-GE', en: 'en-US', ru: 'ru-RU' }[localeStore.currentLocale] ||
                          'ka-GE',
                      )
                    }}
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

/* Prose content styling - ensure all text is visible and black */
:deep(.prose) {
  color: #18181b;
}

:deep(.prose p),
:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4),
:deep(.prose h5),
:deep(.prose h6),
:deep(.prose li),
:deep(.prose span),
:deep(.prose div) {
  color: #18181b !important;
}

:deep(.prose a) {
  color: #FFCD4B !important;
  text-decoration: underline;
}

:deep(.prose a:hover) {
  color: #C89116 !important;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ffcd4b, #ebb738, #c89116);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ebb738, #c89116, #a37814);
}

/* Selection color */
::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}
</style>
