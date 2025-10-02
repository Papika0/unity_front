<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useGalleryPage } from '../composables/useGalleryPage'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const { t } = useTranslations()
const {
  galleryImages,
  categories,
  isLoading,
  isLoadingMore,
  hasMorePages,
  error,
  loadGalleryPage,
  loadMore,
  getCategoryLabel,
} = useGalleryPage()

const selectedCategory = ref('all')
const selectedImage = ref<number | null>(null)
const scrollProgress = ref(0)
const isTransitioning = ref(false)

// Scroll animation refs
const { element: heroElement, isVisible: heroVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
const { element: filtersElement, isVisible: filtersVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
const { element: galleryGridElement, isVisible: galleryGridVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })

// Scroll progress tracking
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

// Load gallery data on mount
onMounted(async () => {
  await loadGalleryPage()
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Gallery data is loaded once on mount via loadGalleryPage()

// Remove the computed filter since we'll fetch from API
const filteredGallery = computed(() => galleryImages.value)

const selectCategory = async (categoryValue: string) => {
  selectedCategory.value = categoryValue
  
  // Start transition
  isTransitioning.value = true
  
  // Wait for fade-out animation
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Fetch images for the selected category from API
  await loadGalleryPage(categoryValue)
  
  // Wait a bit then fade back in
  await new Promise(resolve => setTimeout(resolve, 50))
  isTransitioning.value = false
}

const openLightbox = (id: number) => {
  selectedImage.value = id
}

const closeLightbox = () => {
  selectedImage.value = null
}

const getSelectedImageData = computed(() => {
  if (selectedImage.value === null) return null
  return galleryImages.value.find((item) => item.id === selectedImage.value)
})

const nextImage = () => {
  if (selectedImage.value === null) return
  const currentIndex = filteredGallery.value.findIndex((item) => item.id === selectedImage.value)
  const nextIndex = (currentIndex + 1) % filteredGallery.value.length
  selectedImage.value = filteredGallery.value[nextIndex].id
}

const prevImage = () => {
  if (selectedImage.value === null) return
  const currentIndex = filteredGallery.value.findIndex((item) => item.id === selectedImage.value)
  const prevIndex = currentIndex === 0 ? filteredGallery.value.length - 1 : currentIndex - 1
  selectedImage.value = filteredGallery.value[prevIndex].id
}
</script>

<template>
  <div class="gallery-page">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out shadow-[0_0_15px_rgba(255,205,75,0.6)]"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Hero Section -->
    <section ref="heroElement" class="relative h-[45vh] min-h-[350px] overflow-hidden bg-black">
      <!-- Diagonal overlay accent -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent"
      ></div>

      <!-- Decorative corner elements -->
      <div class="absolute top-0 right-0 w-64 h-64 opacity-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'translate-x-0 translate-y-0': heroVisible,
          'translate-x-12 -translate-y-12': !heroVisible,
        }"
      >
        <div
          class="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#FFCD4B]"
        ></div>
      </div>
      <div class="absolute bottom-0 left-0 w-64 h-64 opacity-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'translate-x-0 translate-y-0': heroVisible,
          '-translate-x-12 translate-y-12': !heroVisible,
        }"
      >
        <div
          class="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#FFCD4B]"
        ></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full flex flex-col justify-center">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full">
          <div class="max-w-3xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': heroVisible,
              'opacity-0 translate-y-12 scale-95 blur-sm': !heroVisible,
            }"
          >
            <h1
              class="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-white transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
              :class="{
                'opacity-100 translate-y-0': heroVisible,
                'opacity-0 translate-y-8': !heroVisible,
              }"
            >
              {{ t('gallery.title') }}
            </h1>
            <div class="w-20 h-1 bg-gradient-to-r from-[#FFCD4B] to-transparent mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-left"
              :class="{
                'scale-x-100': heroVisible,
                'scale-x-0': !heroVisible,
              }"
            ></div>
            <p class="text-lg md:text-xl text-[#FFCD4B] font-light leading-relaxed max-w-2xl transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-300"
              :class="{
                'opacity-100 translate-y-0': heroVisible,
                'opacity-0 translate-y-8': !heroVisible,
              }"
            >
              {{ t('gallery.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter Section -->
    <section ref="filtersElement" class="py-16 bg-zinc-50 border-b border-zinc-100">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="flex flex-wrap gap-3 justify-center">
          <button
            v-for="(category, index) in categories"
            :key="category.value"
            @click="selectCategory(category.value)"
            class="px-6 py-2.5 text-sm uppercase tracking-wider font-light transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform hover:scale-105"
            :class="[
              selectedCategory === category.value
                ? 'bg-black text-[#FFCD4B] shadow-lg'
                : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300',
              {
                'opacity-100 translate-y-0 scale-100 blur-0': filtersVisible,
                'opacity-0 translate-y-8 scale-95 blur-sm': !filtersVisible,
              }
            ]"
            :style="{ transitionDelay: `${index * 100}ms` }"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading && selectedCategory === category.value"
              class="flex items-center gap-2"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-[#FFCD4B]"
              ></div>
              {{ category.label }}
            </span>
            <span v-else>{{ category.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Gallery Grid -->
    <section class="py-16 lg:py-20 bg-white">
      <div ref="galleryGridElement" class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-20">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"
          ></div>
          <p class="text-lg text-zinc-500 font-light uppercase tracking-wider">
            {{ t('gallery.loading') }}
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-5xl mb-6">⚠️</div>
          <h2 class="text-xl font-light text-zinc-800 mb-3">{{ t('gallery.error_title') }}</h2>
          <p class="text-base text-zinc-600 mb-8 font-light">{{ error }}</p>
          <button
            @click="loadGalleryPage()"
            class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900"
          >
            {{ t('buttons.retry') }}
          </button>
        </div>

        <!-- Empty State (shouldn't happen since we only show categories with images) -->
        <div v-else-if="filteredGallery.length === 0 && !isLoading" class="text-center py-20">
          <div class="text-5xl mb-6 text-zinc-300">🏗️</div>
          <h3 class="text-xl font-light text-zinc-600 mb-3">{{ t('gallery.no_images_found') }}</h3>
          <p class="text-base text-zinc-500 font-light">{{ t('gallery.no_images_available') }}</p>
        </div>

        <!-- Gallery Images -->
        <div
          v-else-if="filteredGallery.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300"
          :class="{
            'opacity-0 scale-95': isTransitioning,
            'opacity-100 scale-100': !isTransitioning,
          }"
        >
          <div
            v-for="(item, index) in filteredGallery"
            :key="item.id"
            @click="openLightbox(item.id)"
            class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 cursor-pointer"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': galleryGridVisible && !isTransitioning,
              'opacity-0 translate-y-12 scale-95 blur-sm': !galleryGridVisible || isTransitioning,
            }"
            :style="{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }"
          >
            <!-- Image -->
            <div class="relative h-72 bg-zinc-100 overflow-hidden">
              <img
                :src="item.url"
                :alt="item.alt_text || 'Gallery image'"
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

              <!-- Zoom Icon -->
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-75 group-hover:scale-100"
              >
                <div
                  class="w-16 h-16 bg-[#FFCD4B]/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>

              <!-- Category Badge -->
              <div
                v-if="item.category"
                class="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-light uppercase tracking-wider"
              >
                {{ getCategoryLabel(item.category) }}
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 bg-white relative overflow-hidden">
              <!-- Subtle background accent -->
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>

              <h3
                class="text-lg font-light text-zinc-900 mb-3 line-clamp-1 relative z-10 group-hover:text-[#C89116] transition-colors duration-300"
              >
                {{ item.title }}
              </h3>

              <p v-if="item.project" class="text-sm text-zinc-500 mb-3 line-clamp-1 relative z-10">
                {{ item.project }}
              </p>

              <div class="flex items-center justify-between relative z-10">
                <span class="text-xs text-zinc-400 font-light">
                  {{ new Date(item.created_at).toLocaleDateString('ka-GE') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <div class="text-5xl mb-6 text-zinc-300">📷</div>
          <h2 class="text-xl font-light text-zinc-800 mb-3">{{ t('gallery.no_images_title') }}</h2>
          <p class="text-base text-zinc-600 mb-8 font-light max-w-md mx-auto">
            {{
              selectedCategory === 'all'
                ? t('gallery.no_images_all')
                : `${t('gallery.no_images_category_prefix')} ${getCategoryLabel(selectedCategory)} ${t('gallery.no_images_category_suffix')}`
            }}
          </p>
          <button
            v-if="selectedCategory !== 'all'"
            @click="selectCategory('all')"
            class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900"
          >
            {{ t('gallery.view_all') }}
          </button>
        </div>

        <!-- Load More Button -->
        <div v-if="filteredGallery.length > 0 && hasMorePages" class="text-center mt-10">
          <button
            @click="loadMore(selectedCategory === 'all' ? undefined : selectedCategory)"
            :disabled="isLoadingMore"
            class="inline-flex items-center gap-3 px-10 py-4 bg-black text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-300 hover:bg-zinc-900 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoadingMore" class="flex items-center gap-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-[#FFCD4B]"
              ></div>
              {{ t('buttons.loading') }}
            </span>
            <span v-else class="flex items-center gap-3">
              {{ t('gallery.load_more') }}
              <svg
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="selectedImage && getSelectedImageData"
        @click="closeLightbox"
        class="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
      >
        <div class="relative max-w-6xl w-full max-h-[90vh]">
          <!-- Close Button -->
          <button
            @click="closeLightbox"
            class="absolute top-6 right-6 z-20 text-white hover:text-[#FFCD4B] transition-colors"
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

          <!-- Navigation Buttons -->
          <button
            @click.stop="prevImage"
            class="absolute left-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
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

          <button
            @click.stop="nextImage"
            class="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
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

          <!-- Image Container -->
          <div @click.stop class="lightbox-content bg-white overflow-hidden shadow-2xl">
            <!-- Large Image -->
            <div class="relative aspect-video bg-zinc-100">
              <img
                :src="getSelectedImageData.url"
                :alt="getSelectedImageData.alt_text || 'Gallery image'"
                class="w-full h-full object-cover"
              />

              <!-- Image Counter -->
              <div
                class="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm text-white text-sm font-light"
              >
                {{ filteredGallery.findIndex((item) => item.id === selectedImage) + 1 }} /
                {{ filteredGallery.length }}
              </div>
            </div>

            <!-- Image Info -->
            <div class="p-8">
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <h2 class="text-3xl font-light text-zinc-900 mb-3">
                    {{ getSelectedImageData.title }}
                  </h2>
                  <div class="flex items-center gap-4 text-zinc-600">
                    <span v-if="getSelectedImageData.project" class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {{ getSelectedImageData.project }}
                    </span>
                    <span v-if="getSelectedImageData.category" class="flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {{ getCategoryLabel(getSelectedImageData.category) }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-zinc-400 mb-1 font-light">
                    {{ t('gallery.created') }}
                  </div>
                  <div class="text-zinc-700 font-light">
                    {{
                      new Date(getSelectedImageData.created_at).toLocaleDateString('ka-GE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }}
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-4 pt-6 border-t border-zinc-200">
                <button
                  @click="closeLightbox"
                  class="px-6 py-3 bg-zinc-100 text-zinc-700 font-light transition-all duration-300 hover:bg-zinc-200"
                >
                  {{ t('gallery.close') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Fade in animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes expand {
  from {
    width: 0;
  }
  to {
    width: 5rem;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}

@keyframes floatDelayed {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, 20px);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.animate-expand {
  animation: expand 1s ease-out forwards;
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: floatDelayed 10s ease-in-out infinite;
}

/* Custom gradient text */
.gradient-text {
  background: linear-gradient(135deg, #ffcd4b, #ebb738);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced shadow effects */
.shadow-luxury {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Custom backdrop blur */
.backdrop-blur-luxury {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Smooth transitions for all interactive elements */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
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
