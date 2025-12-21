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
      <NewsDetailHeader 
        :article="article" 
        @back="goBack"
        @edit="editArticle"
        @delete="showDeleteModal = true"
      />

      <NewsDetailGallery 
        :article="article"
        @open-image="openImageModal"
      />

      <NewsDetailContent :article="article" />

      <NewsDetailMeta :article="article" />
    </div>

    <!-- Loading state fallback -->
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
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useAdminNewsStore } from '@/stores/admin/news'
import { NewsDetailHeader, NewsDetailContent, NewsDetailGallery, NewsDetailMeta } from './components/detail'
import type { AdminNewsArticle, ImageData } from '@/types'

const { t } = useTranslations()
const route = useRoute()
const router = useRouter()
const adminNewsStore = useAdminNewsStore()

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

function openImageModal(image: string | ImageData) {
  selectedImage.value = image
}

function getImageUrl(imagePath: string | ImageData | null): string {
  if (!imagePath) return ''
  
  if (typeof imagePath === 'object' && imagePath !== null && 'url' in imagePath) {
    return (imagePath as ImageData).url
  }
  
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
</style>
