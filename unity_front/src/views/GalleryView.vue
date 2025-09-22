<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useGalleryPage } from '../composables/useGalleryPage'

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

// Load gallery data on mount
onMounted(async () => {
  await loadGalleryPage()
})

// Gallery data is loaded once on mount via loadGalleryPage()

// Remove the computed filter since we'll fetch from API
const filteredGallery = computed(() => galleryImages.value)

const selectCategory = async (categoryValue: string) => {
  selectedCategory.value = categoryValue
  // Fetch images for the selected category from API
  await loadGalleryPage(categoryValue)
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
    <!-- Hero Section -->
    <section
      class="relative h-[50vh] min-h-[400px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-orange-900"
    >
      <div class="absolute inset-0 bg-black/20"></div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
      ></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16 text-white">
          <div class="max-w-4xl">
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-light mb-8 leading-tight">
              {{ t('gallery.title') }}
            </h1>
            <div class="w-24 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 mb-8"></div>
            <p class="text-lg md:text-xl text-orange-100 font-light leading-relaxed max-w-3xl">
              {{ t('gallery.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter Section -->
    <section class="py-16 bg-gradient-to-b from-white to-slate-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
            {{ t('gallery.filter_title') }}
          </h2>
          <div class="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto"></div>
        </div>
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            v-for="category in categories"
            :key="category.value"
            @click="selectCategory(category.value)"
            class="px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            :class="
              selectedCategory === category.value
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-orange-50 border border-slate-200 hover:border-orange-200'
            "
            :disabled="isLoading"
          >
            <span
              v-if="isLoading && selectedCategory === category.value"
              class="flex items-center gap-2"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
              ></div>
              {{ category.label }}
            </span>
            <span v-else>{{ category.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Gallery Grid -->
    <section class="py-20 bg-gradient-to-br from-zinc-50 to-orange-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-20 min-h-[400px]">
          <div class="text-center">
            <div class="relative mb-8">
              <div
                class="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-500 mx-auto"
              ></div>
            </div>
            <p class="text-slate-600 text-xl font-light">გალერეის სურათები იტვირთება...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div
            class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center"
          >
            <svg class="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h2 class="text-3xl font-light text-slate-800 mb-4">{{ t('gallery.error_title') }}</h2>
          <p class="text-slate-600 mb-8 text-lg">{{ error }}</p>
          <button
            @click="loadGalleryPage()"
            class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
          >
            {{ t('buttons.retry') }}
          </button>
        </div>

        <!-- Empty State (shouldn't happen since we only show categories with images) -->
        <div v-else-if="filteredGallery.length === 0 && !isLoading" class="text-center py-20">
          <div
            class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 class="text-3xl font-light text-slate-800 mb-4">No Images Found</h2>
          <p class="text-slate-600 mb-8 text-lg">No gallery images are available at the moment.</p>
        </div>

        <!-- Gallery Images -->
        <div
          v-else-if="filteredGallery.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <div
            v-for="item in filteredGallery"
            :key="item.id"
            @click="openLightbox(item.id)"
            class="gallery-item group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up"
          >
            <!-- Image -->
            <div class="aspect-square relative overflow-hidden">
              <img
                :src="item.url"
                :alt="item.alt_text || 'Gallery image'"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>

              <!-- Zoom Icon -->
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-75 group-hover:scale-100"
              >
                <div
                  class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
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
                class="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {{ getCategoryLabel(item.category) }}
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <h3 class="text-lg font-medium text-slate-800 mb-2 line-clamp-2">
                {{ item.title }}
              </h3>
              <p v-if="item.project" class="text-sm text-slate-500 mb-3 line-clamp-1">
                {{ item.project }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400">
                  {{ new Date(item.created_at).toLocaleDateString('ka-GE') }}
                </span>
                <div
                  class="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <div
            class="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-12 h-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 class="text-3xl font-light text-slate-800 mb-4">
            {{ t('gallery.no_images_title') }}
          </h2>
          <p class="text-slate-600 mb-8 text-lg max-w-md mx-auto">
            {{
              selectedCategory === 'all'
                ? t('gallery.no_images_all')
                : `${t('gallery.no_images_category_prefix')} ${getCategoryLabel(selectedCategory)} ${t('gallery.no_images_category_suffix')}`
            }}
          </p>
          <button
            v-if="selectedCategory !== 'all'"
            @click="selectCategory('all')"
            class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
          >
            {{ t('gallery.view_all') }}
          </button>
        </div>

        <!-- Load More Button -->
        <div v-if="filteredGallery.length > 0 && hasMorePages" class="text-center mt-16">
          <button
            @click="loadMore(selectedCategory === 'all' ? undefined : selectedCategory)"
            :disabled="isLoadingMore"
            class="px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoadingMore" class="flex items-center gap-2">
              <div
                class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
              ></div>
              Loading...
            </span>
            <span v-else>{{ t('gallery.load_more') }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Lightbox Modal -->
    <div
      v-if="selectedImage && getSelectedImageData"
      @click="closeLightbox"
      class="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
    >
      <div class="relative max-w-6xl w-full max-h-[90vh]">
        <!-- Close Button -->
        <button
          @click="closeLightbox"
          class="absolute -top-4 -right-4 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Image Container -->
        <div
          @click.stop
          class="lightbox-content bg-white rounded-2xl overflow-hidden shadow-2xl animate-fade-in-scale"
        >
          <!-- Large Image -->
          <div class="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200">
            <img
              :src="getSelectedImageData.url"
              :alt="getSelectedImageData.alt_text || 'Gallery image'"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
            ></div>

            <!-- Image Counter -->
            <div
              class="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700"
            >
              {{ filteredGallery.findIndex((item) => item.id === selectedImage) + 1 }} /
              {{ filteredGallery.length }}
            </div>
          </div>

          <!-- Image Info -->
          <div class="p-8">
            <div class="flex items-start justify-between mb-6">
              <div class="flex-1">
                <h2 class="text-3xl font-light text-slate-800 mb-3">
                  {{ getSelectedImageData.title }}
                </h2>
                <div class="flex items-center gap-4 text-slate-500">
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
                <div class="text-sm text-slate-400 mb-1">{{ t('gallery.created') }}</div>
                <div class="text-slate-600 font-medium">
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
            <div class="flex items-center gap-4 pt-6 border-t border-slate-200">
              <button
                @click="closeLightbox"
                class="px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                {{ t('gallery.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Line clamp utilities */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* Custom animations */
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

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in-scale {
  animation: fadeInScale 0.4s ease-out;
}

/* Smooth transitions for gallery items */
.gallery-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-item:hover {
  transform: translateY(-8px) scale(1.02);
}

/* Custom scrollbar for lightbox */
.lightbox-content::-webkit-scrollbar {
  width: 6px;
}

.lightbox-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.lightbox-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.lightbox-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
