<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

interface GalleryImage {
  id: number
  url: string
  title: string
  alt_text?: string | null
  category?: string | null
  project?: string | null
  created_at: string
}

defineProps<{
  images: GalleryImage[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMorePages: boolean
  error: string | null
  isTransitioning: boolean
  selectedCategory: string
  getCategoryLabel: (category: string) => string
  t: (key: string) => string
}>()

const emit = defineEmits<{
  openLightbox: [id: number]
  selectCategory: [category: string]
  loadMore: []
  retry: []
}>()

// Component manages its own scroll animation
const { element: galleryGridElement, isVisible: galleryGridVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
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
          @click="emit('retry')"
          class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900"
        >
          {{ t('buttons.retry') }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="images.length === 0 && !isLoading" class="text-center py-20">
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
          @click="emit('selectCategory', 'all')"
          class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900"
        >
          {{ t('gallery.view_all') }}
        </button>
      </div>

      <!-- Gallery Images -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300"
        :class="{
          'opacity-0 scale-95': isTransitioning,
          'opacity-100 scale-100': !isTransitioning,
        }"
      >
        <div
          v-for="(item, index) in images"
          :key="item.id"
          @click="emit('openLightbox', item.id)"
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
              class="absolute top-4 left-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-[#FFCD4B] text-xs font-medium uppercase tracking-wider shadow-lg border border-[#FFCD4B]/20"
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

      <!-- Load More Button -->
      <div v-if="images.length > 0 && hasMorePages" class="text-center mt-10">
        <button
          @click="emit('loadMore')"
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
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
