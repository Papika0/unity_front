<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
      <GalleryHeader />

      <GalleryFilters
        v-model:searchQuery="searchQuery"
        v-model:selectedCategory="selectedCategory"
        v-model:selectedProject="selectedProject"
        :categories="categories"
        :projects="projects"
        :loading="loading"
        @refresh="refreshImages"
        @open-upload="openUploadModal"
      />

      <GalleryStatistics
        :totalImages="totalImages"
        :activeImages="activeImages"
        :categoryCount="categories.length"
        :projectCount="projects.length"
      />

      <GalleryGrid
        :images="images"
        :loading="loading"
        :error="error"
        :has-filters="Boolean(searchQuery || selectedCategory || selectedProject)"
        @refresh="refreshImages"
        @clear-filters="clearFilters"
        @open-upload="openUploadModal"
        @view="viewImage"
        @edit="editImage"
        @delete="deleteImage"
      />

      <GalleryPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :pages="visiblePages"
        @page-change="changePage"
      />
    </div>

    <!-- Modals -->
    <ImageUploadModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="handleImageUploaded"
    />

    <ImageViewModal
      v-if="selectedImage"
      :image="selectedImage"
      @close="selectedImage = null"
      @edit="editImage"
      @delete="deleteImage"
    />

    <ImageEditModal
      v-if="editingImage"
      :image="editingImage"
      @close="editingImage = null"
      @updated="handleImageUpdated"
    />

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGalleryList } from './composables/useGalleryList'
import GalleryHeader from './components/grid/GalleryHeader.vue'
import GalleryFilters from './components/grid/GalleryFilters.vue'
import GalleryStatistics from './components/grid/GalleryStatistics.vue'
import GalleryGrid from './components/grid/GalleryGrid.vue'
import GalleryPagination from './components/grid/GalleryPagination.vue'
import ImageUploadModal from '@/components/admin/gallery/ImageUploadModal.vue'
import ImageViewModal from '@/components/admin/gallery/ImageViewModal.vue'
import ImageEditModal from '@/components/admin/gallery/ImageEditModal.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const {
  images,
  categories,
  projects,
  loading,
  error,
  searchQuery,
  selectedCategory,
  selectedProject,
  currentPage,
  totalPages,
  totalImages,
  activeImages,
  visiblePages,
  showUploadModal,
  selectedImage,
  editingImage,
  loadImages,
  clearFilters,
  refreshImages,
  openUploadModal,
  viewImage,
  editImage,
  deleteImage,
  handleImageUploaded,
  handleImageUpdated,
  changePage
} = useGalleryList()

// Lifecycle
onMounted(() => {
  loadImages()
})
</script>
