<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
        <div
          class="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent absolute top-0 left-0"
        ></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md mx-auto px-6">
        <div class="text-red-300 mb-6">
          <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-light text-slate-800 mb-4">{{ t('admin.news.article_not_found') }}</h2>
        <p class="text-slate-600 mb-8">{{ t('admin.news.article_not_found_desc') }}</p>
        <button
          @click="goBack"
          class="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
        >
          {{ t('admin.news.back_to_news') }}
        </button>
      </div>
    </div>

    <!-- Article Content -->
    <div class="container mx-auto px-6 py-12 max-w-5xl" v-else-if="article">
      <!-- Header -->
      <div class="mb-12">
        <button
          @click="goBack"
          class="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-300 mb-6 group font-medium text-sm bg-white/80 px-4 py-2 rounded-full border border-slate-300 hover:border-emerald-500/50 shadow-sm"
        >
          <svg
            class="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          {{ t('admin.news.back_to_news') }}
        </button>

        <!-- Title and Actions -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <h1
                class="text-5xl font-light bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 bg-clip-text text-transparent tracking-tight leading-tight py-1"
              >
                {{ article.title.ka || article.title.en || article.title.ru }}
              </h1>
              <div class="flex gap-2">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    article.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ article.is_active ? t('admin.common.active') : t('admin.common.inactive') }}
                </span>
                <span
                  v-if="article.is_featured"
                  class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
                >
                  {{ t('admin.common.featured') }}
                </span>
              </div>
            </div>
            <p class="text-slate-600 text-xl font-light mb-2">
              {{ getCategoryName(article.category) }}
            </p>
            <div class="flex items-center gap-4 text-sm text-slate-500">
              <span>{{ t('admin.news.publish_date') }}: {{ article.formatted_publish_date }}</span>
              <span>•</span>
              <span>{{ t('admin.news.views') }}: {{ article.views }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 ml-6">
            <button
              @click="editArticle"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              {{ t('admin.common.edit') }}
            </button>
            <button
              @click="showDeleteModal = true"
              class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              {{ t('admin.common.delete') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Image -->
      <div v-if="article.main_image" class="mb-12">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">{{ t('admin.news.main_image') }}</h2>
          </div>
          <div class="p-6">
            <img
              :src="getImageUrl(article.main_image)"
              :alt="article.title.ka || article.title.en"
              class="w-full max-h-96 object-cover rounded-xl"
            />
          </div>
        </div>
      </div>

      <!-- Content Cards -->
      <div class="space-y-8">
        <!-- Excerpt -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">{{ t('admin.news.brief_desc') }}</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-if="article.excerpt.ka">
                <h4 class="font-medium text-slate-700 mb-2">ქართული</h4>
                <p class="text-slate-600 leading-relaxed">{{ article.excerpt.ka }}</p>
              </div>
              <div v-if="article.excerpt.en">
                <h4 class="font-medium text-slate-700 mb-2">English</h4>
                <p class="text-slate-600 leading-relaxed">{{ article.excerpt.en }}</p>
              </div>
              <div v-if="article.excerpt.ru">
                <h4 class="font-medium text-slate-700 mb-2">Русский</h4>
                <p class="text-slate-600 leading-relaxed">{{ article.excerpt.ru }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Content -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">{{ t('admin.news.full_content') }}</h2>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div v-if="article.content.ka">
                <h4 class="font-medium text-slate-700 mb-3">ქართული</h4>
                <div class="prose prose-slate max-w-none">
                  <p class="text-slate-600 leading-relaxed whitespace-pre-line">
                    {{ article.content.ka }}
                  </p>
                </div>
              </div>
              <div v-if="article.content.en">
                <h4 class="font-medium text-slate-700 mb-3">English</h4>
                <div class="prose prose-slate max-w-none">
                  <p class="text-slate-600 leading-relaxed whitespace-pre-line">
                    {{ article.content.en }}
                  </p>
                </div>
              </div>
              <div v-if="article.content.ru">
                <h4 class="font-medium text-slate-700 mb-3">Русский</h4>
                <div class="prose prose-slate max-w-none">
                  <p class="text-slate-600 leading-relaxed whitespace-pre-line">
                    {{ article.content.ru }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gallery Images -->
        <div
          v-if="article.gallery_images && article.gallery_images.length"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">{{ t('admin.news.gallery_images') }}</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="(image, index) in article.gallery_images"
                :key="index"
                class="group cursor-pointer"
                @click="openImageModal(image)"
              >
                <img
                  :src="getImageUrl(image)"
                  :alt="`Gallery image ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg group-hover:shadow-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tags and SEO -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Tags -->
          <div
            v-if="article.tags && article.tags.length"
            class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
              <h2 class="text-xl font-semibold text-white">{{ t('admin.news.tags') }}</h2>
            </div>
            <div class="p-6">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in article.tags"
                  :key="tag"
                  class="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- SEO -->
          <div
            v-if="article.meta_title || article.meta_description"
            class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <h2 class="text-xl font-semibold text-white">{{ t('admin.news.seo') }}</h2>
            </div>
            <div class="p-6 space-y-4">
              <div v-if="article.meta_title">
                <h4 class="font-medium text-slate-700 mb-2">Meta Title</h4>
                <p class="text-slate-600 text-sm">{{ article.meta_title }}</p>
              </div>
              <div v-if="article.meta_description">
                <h4 class="font-medium text-slate-700 mb-2">Meta Description</h4>
                <p class="text-slate-600 text-sm">{{ article.meta_description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Meta Information -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-gradient-to-r from-slate-500 to-slate-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">{{ t('admin.news.meta_info') }}</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-slate-700 mb-2">{{ t('admin.news.created_at') }}</h4>
                <p class="text-slate-600 text-sm">{{ formatDate(article.created_at) }}</p>
              </div>
              <div>
                <h4 class="font-medium text-slate-700 mb-2">{{ t('admin.news.updated_at') }}</h4>
                <p class="text-slate-600 text-sm">{{ formatDate(article.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"
        ></div>
        <p class="text-slate-600">{{ t('admin.common.loading') }}</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ t('admin.news.delete_news_title') }}</h3>
        </div>
        <p class="text-gray-600 mb-6">
          {{ t('admin.news.delete_confirm') }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {{ t('admin.common.cancel') }}
          </button>
          <button
            @click="deleteArticle"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ deleting ? t('admin.news.deleting') : t('admin.common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      @click="selectedImage = null"
    >
      <div class="max-w-4xl max-h-full">
        <img
          :src="getImageUrl(selectedImage)"
          alt="Gallery image"
          class="max-w-full max-h-full object-contain rounded-lg"
          @click.stop
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'
import { useAdminNewsStore } from '@/stores/admin/news'
import type { AdminNewsArticle, ImageData } from '@/types'

const { t } = useTranslations()
const route = useRoute()
const router = useRouter()
const adminNewsStore = useAdminNewsStore()

// ... rest of the script ...

// Data
const article = ref<AdminNewsArticle | null>(null)
const loading = ref(true)
const error = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)
const selectedImage = ref<string | ImageData | null>(null)
const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

// Lifecycle
onMounted(async () => {
  await loadArticle()
})

// Methods
async function loadArticle() {
  loading.value = true
  error.value = false

  const id = Number(route.params.id)
  if (!id) {
    error.value = true
    loading.value = false
    return
  }

  try {
    const result = await adminNewsStore.fetchArticle(id)
    if (result && result.success && result.data) {
      article.value = result.data
      error.value = false
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Failed to load article:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'admin-news' })
}

function editArticle() {
  if (article.value) {
    router.push({ name: 'admin-news-edit', params: { id: article.value.id } })
  }
}

async function deleteArticle() {
  if (!article.value) return

  try {
    deleting.value = true
    const result = await adminNewsStore.removeArticle(article.value.id)
    if (result.success) {
      router.push({ name: 'admin-news' })
    } else {
      console.error('Delete failed:', result.error)
    }
  } catch (error) {
    console.error('Delete failed:', error)
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

function getCategoryName(category: string): string {
  const categories = {
    company: 'კომპანია',
    project: 'პროექტი',
    industry: 'ინდუსტრია',
    event: 'ღონისძიება',
  }
  return categories[category as keyof typeof categories] || category
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openImageModal(image: string | ImageData) {
  selectedImage.value = image
}

function getImageUrl(imagePath: string | ImageData | null): string {
  if (!imagePath) return ''
  
  // Handle ImageData object from our types
  if (typeof imagePath === 'object' && imagePath !== null && 'url' in imagePath) {
    return (imagePath as ImageData).url
  }
  
  // Handle string path (legacy)
  if (typeof imagePath === 'string') {
    return imagePath.startsWith('http') ? imagePath : backendUrl + imagePath
  }
  
  return ''
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.prose {
  color: #374151;
}

.prose p {
  margin-bottom: 1rem;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: #111827;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.prose ul,
.prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose a {
  color: #2563eb;
}

.prose a:hover {
  color: #1d4ed8;
}
</style>
