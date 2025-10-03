<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">სურათის არჩევა</h2>
          <p class="text-sm text-gray-500 mt-1">აირჩიეთ სურათი გალერეიდან</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Filters -->
      <div class="p-6 border-b border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row gap-4">
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
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>

          <!-- Category Filter -->
          <select
            v-model="selectedCategoryFilter"
            @change="handleCategoryChange"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">ყველა კატეგორია</option>
            <option value="about">About</option>
            <option value="gallery">Gallery</option>
            <option value="hero">Hero</option>
            <option value="news">News</option>
            <option value="projects">Projects</option>
          </select>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto" style="max-height: calc(90vh - 200px)">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg
                class="h-5 w-5 text-red-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">შეცდომა</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ error }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Images Grid -->
        <div v-else-if="images.length > 0" class="p-6">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="image in images"
              :key="image.id"
              @click="selectImage(image)"
              class="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all duration-200"
            >
              <img
                :src="image.url"
                :alt="getImageAltText(image)"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center"
              >
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2"
              >
                <p class="text-white text-xs truncate">{{ image.title }}</p>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.last_page > 1" class="flex justify-center mt-8">
            <nav class="flex items-center space-x-2">
              <button
                @click="goToPage(pagination.current_page - 1)"
                :disabled="pagination.current_page <= 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                წინა
              </button>

              <span class="px-4 py-2 text-sm text-gray-700">
                {{ pagination.current_page }} / {{ pagination.last_page }}
              </span>

              <button
                @click="goToPage(pagination.current_page + 1)"
                :disabled="pagination.current_page >= pagination.last_page"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                შემდეგი
              </button>
            </nav>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="p-12 text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
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
          <h3 class="mt-2 text-sm font-medium text-gray-900">სურათები ვერ მოიძებნა</h3>
          <p class="mt-1 text-sm text-gray-500">შეცვალეთ ფილტრები ან ატვირთეთ ახალი სურათები</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { adminImageApi, type AdminImage } from '@/services/adminImageApi'

interface Props {
  category?: string
}

const props = withDefaults(defineProps<Props>(), {
  category: '',
})

const emit = defineEmits<{
  close: []
  select: [image: AdminImage]
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const images = ref<AdminImage[]>([])
const searchQuery = ref('')
const selectedCategoryFilter = ref(props.category || '')

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})

let searchTimeout: ReturnType<typeof setTimeout>

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadImages()
  }, 300)
}

const handleCategoryChange = () => {
  loadImages()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page
    loadImages()
  }
}

const loadImages = async () => {
  try {
    loading.value = true
    error.value = null

    const filters = {
      search: searchQuery.value || undefined,
      category: selectedCategoryFilter.value || undefined,
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
    }

    const response = await adminImageApi.getImages(filters)

    if (response.success) {
      images.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      }
    } else {
      throw new Error('Failed to load images')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    images.value = []
  } finally {
    loading.value = false
  }
}

const selectImage = (image: AdminImage) => {
  emit('select', image)
}

const getImageAltText = (image: AdminImage): string => {
  const altOrTitle = image.alt_text || image.title
  if (typeof altOrTitle === 'string') {
    return altOrTitle
  }
  return altOrTitle.ka
}

// Watch for category prop changes
watch(
  () => props.category,
  (newCategory) => {
    selectedCategoryFilter.value = newCategory || ''
    loadImages()
  },
)

onMounted(() => {
  loadImages()
})
</script>
