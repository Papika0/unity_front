<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-6 py-12 max-w-7xl">
      <!-- Header -->
      <div class="mb-12">
        <h1
          class="text-5xl font-light bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 tracking-tight leading-tight py-1"
        >
          გალერეის მართვა
        </h1>
        <p class="text-slate-600 text-xl font-light">
          მართეთ სურათები, ორგანიზება კატეგორიების მიხედვით და ატვირთეთ ახალი სურათები
        </p>
      </div>

      <!-- Filters and Actions -->
      <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <!-- Search and Filters -->
          <div class="flex flex-col sm:flex-row gap-4 flex-1">
            <!-- Search -->
            <div class="relative flex-1 max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ძებნა სურათების მიხედვით..."
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                @input="handleSearch"
              />
            </div>

            <!-- Category Filter -->
            <select
              v-model="selectedCategory"
              @change="handleCategoryChange"
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">ყველა კატეგორია</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ getCategoryLabel(category) }}
              </option>
            </select>

            <!-- Project Filter -->
            <select
              v-model="selectedProject"
              @change="handleProjectChange"
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">ყველა პროექტი</option>
              <option v-for="project in projects" :key="project" :value="project">
                {{ project }}
              </option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="refreshImages"
              :disabled="loading"
              class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
            >
              <svg
                class="w-5 h-5 mr-2 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              განახლება
            </button>
            <button
              @click="openUploadModal"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                class="w-5 h-5 mr-2 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              ახალი სურათი
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg
                class="w-6 h-6 text-blue-600"
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
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">სულ სურათები</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalImages }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">აქტიური</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeImages }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">კატეგორიები</p>
              <p class="text-2xl font-bold text-gray-900">{{ categories.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div class="flex items-center">
            <div class="p-3 bg-orange-100 rounded-lg">
              <svg
                class="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">პროექტები</p>
              <p class="text-2xl font-bold text-gray-900">{{ projects.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Loading images...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Error Loading Images</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="loadImages"
          class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Images Grid -->
      <div
        v-else-if="filteredImages.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="image in paginatedImages"
          :key="image.id"
          class="group bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <!-- Image -->
          <div class="aspect-square relative overflow-hidden">
            <img
              :src="image.url"
              :alt="image.alt_text || image.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <!-- Overlay Actions -->
            <div
              class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center"
            >
              <div
                class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <button
                  @click="viewImage(image)"
                  class="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  title="View"
                >
                  <svg
                    class="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                <button
                  @click="editImage(image)"
                  class="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Edit"
                >
                  <svg
                    class="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click="deleteImage(image)"
                  class="p-2 bg-red-500 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Delete"
                >
                  <svg
                    class="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-3 right-3">
              <span
                :class="image.is_active ? 'bg-green-500' : 'bg-red-500'"
                class="px-2 py-1 text-xs font-medium text-white rounded-full"
              >
                {{ image.is_active ? 'აქტიური' : 'არააქტიური' }}
              </span>
            </div>
          </div>

          <!-- Image Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-2 truncate">{{ image.title }}</h3>
            <div class="space-y-1 text-sm text-gray-600">
              <div v-if="image.project" class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                {{ image.project }}
              </div>
              <div v-if="image.category" class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {{ getCategoryLabel(image.category) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(image.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-gray-400 text-6xl mb-4">📷</div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">No Images Found</h2>
        <p class="text-gray-600 mb-4">
          {{
            searchQuery || selectedCategory || selectedProject
              ? 'No images match your filters.'
              : 'No images available yet.'
          }}
        </p>
        <button
          v-if="searchQuery || selectedCategory || selectedProject"
          @click="clearFilters"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-4"
        >
          Clear Filters
        </button>
        <button
          @click="openUploadModal"
          class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Upload First Image
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-12">
        <nav class="flex items-center space-x-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="page !== '...'"
              @click="currentPage = Number(page)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg',
                currentPage === page
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="px-3 py-2 text-sm text-gray-500">...</span>
          </template>

          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </div>

    <!-- Image Upload Modal -->
    <ImageUploadModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="handleImageUploaded"
    />

    <!-- Image View Modal -->
    <ImageViewModal
      v-if="selectedImage"
      :image="selectedImage"
      @close="selectedImage = null"
      @edit="editImage"
      @delete="deleteImage"
    />

    <!-- Image Edit Modal -->
    <ImageEditModal
      v-if="editingImage"
      :image="editingImage"
      @close="editingImage = null"
      @updated="handleImageUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { adminImageApi } from '@/services/adminImageApi'
import ImageUploadModal from '@/components/admin/gallery/ImageUploadModal.vue'
import ImageViewModal from '@/components/admin/gallery/ImageViewModal.vue'
import ImageEditModal from '@/components/admin/gallery/ImageEditModal.vue'

interface GalleryImage {
  id: number
  url: string
  title: string
  project: string | null
  alt_text: string | null
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const router = useRouter()

// State
const images = ref<GalleryImage[]>([])
const categories = ref<string[]>([])
const projects = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedProject = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

// Modal states
const showUploadModal = ref(false)
const selectedImage = ref<GalleryImage | null>(null)
const editingImage = ref<GalleryImage | null>(null)

// Computed
const filteredImages = computed(() => {
  let filtered = images.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (img) =>
        img.title.toLowerCase().includes(query) ||
        img.alt_text?.toLowerCase().includes(query) ||
        img.project?.toLowerCase().includes(query),
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((img) => img.category === selectedCategory.value)
  }

  if (selectedProject.value) {
    filtered = filtered.filter((img) => img.project === selectedProject.value)
  }

  return filtered
})

const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredImages.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredImages.value.length / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 3) pages.push('...')
    pages.push(total)
  }

  return pages
})

const totalImages = computed(() => images.value.length)
const activeImages = computed(() => images.value.filter((img) => img.is_active).length)

// Methods
const loadImages = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await adminImageApi.getImages({
      per_page: 1000, // Get all images for filtering
    })

    if (response.success) {
      images.value = response.data.data
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load images'
    console.error('Failed to load images:', err)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await adminImageApi.getCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

const loadProjects = async () => {
  try {
    const response = await adminImageApi.getProjects()
    if (response.success) {
      projects.value = response.data
    }
  } catch (err) {
    console.error('Failed to load projects:', err)
  }
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    exterior: 'ფასადები',
    interior: 'ინტერიერი',
    landscape: 'ლანდშაფტი',
    commercial: 'კომერციული',
    residential: 'საცხოვრებელი',
    about: 'ჩვენ შესახებ',
    projects: 'პროექტები',
    news: 'სიახლეები',
  }
  return labels[category] || category
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ka-GE')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleCategoryChange = () => {
  currentPage.value = 1
}

const handleProjectChange = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedProject.value = ''
  currentPage.value = 1
}

const refreshImages = () => {
  loadImages()
  loadCategories()
  loadProjects()
}

const openUploadModal = () => {
  showUploadModal.value = true
}

const viewImage = (image: GalleryImage) => {
  selectedImage.value = image
}

const editImage = (image: GalleryImage) => {
  editingImage.value = image
}

const deleteImage = async (image: GalleryImage) => {
  if (confirm(`Are you sure you want to delete "${image.title}"?`)) {
    try {
      const response = await adminImageApi.deleteImage(image.id)
      if (response.success) {
        images.value = images.value.filter((img) => img.id !== image.id)
      }
    } catch (err) {
      console.error('Failed to delete image:', err)
    }
  }
}

const handleImageUploaded = (newImage: GalleryImage) => {
  images.value.unshift(newImage)
  showUploadModal.value = false
}

const handleImageUpdated = (updatedImage: GalleryImage) => {
  const index = images.value.findIndex((img) => img.id === updatedImage.id)
  if (index !== -1) {
    images.value[index] = updatedImage
  }
  editingImage.value = null
}

// Watch for page changes
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Lifecycle
onMounted(() => {
  loadImages()
  loadCategories()
  loadProjects()
})
</script>
