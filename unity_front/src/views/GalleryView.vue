<script setup lang="ts">
import { useGallery } from './gallery/composables'
import {
  GalleryHero,
  GalleryFilters,
  GalleryGrid,
  GalleryLightbox,
} from './gallery/components'

const {
  t,
  categories,
  isLoading,
  isLoadingMore,
  hasMorePages,
  error,
  loadGalleryPage,
  getCategoryLabel,
  selectedCategory,
  selectedImage,
  scrollProgress,
  isTransitioning,
  filteredGallery,
  getSelectedImageData,
  selectCategory,
  openLightbox,
  closeLightbox,
  nextImage,
  prevImage,
  handleLoadMore,
} = useGallery()
</script>

<template>
  <div class="gallery-page">
    <!-- Hero Section -->
    <GalleryHero
      :scrollProgress="scrollProgress"
      :t="t"
    />

    <!-- Filter Section -->
    <GalleryFilters
      :categories="categories"
      :selectedCategory="selectedCategory"
      :isLoading="isLoading"
      @selectCategory="selectCategory"
    />

    <!-- Gallery Grid -->
    <GalleryGrid
      :images="filteredGallery"
      :isLoading="isLoading"
      :isLoadingMore="isLoadingMore"
      :hasMorePages="hasMorePages"
      :error="error"
      :isTransitioning="isTransitioning"
      :selectedCategory="selectedCategory"
      :getCategoryLabel="getCategoryLabel"
      :t="t"
      @openLightbox="openLightbox"
      @selectCategory="selectCategory"
      @loadMore="handleLoadMore"
      @retry="loadGalleryPage()"
    />

    <!-- Lightbox Modal -->
    <GalleryLightbox
      :selectedImage="selectedImage"
      :imageData="getSelectedImageData"
      :images="filteredGallery"
      :getCategoryLabel="getCategoryLabel"
      :t="t"
      @close="closeLightbox"
      @next="nextImage"
      @prev="prevImage"
    />
  </div>
</template>

<style scoped>
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
