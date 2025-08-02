<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-6 py-12 max-w-5xl" v-if="article">
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
          უკან სიახლეებზე
        </button>
        <h1
          class="text-5xl font-light bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3 tracking-tight leading-tight py-1"
        >
          სიახლის რედაქტირება
        </h1>
        <p class="text-slate-600 text-xl font-light">განაახლეთ სიახლის ინფორმაცია</p>
      </div>

      <!-- News Form -->
      <NewsForm
        :form="form"
        mode="edit"
        :submitting="submitting"
        :errors="adminNewsStore.validationErrors"
        :current-main-image="currentMainImage"
        :current-gallery-images="currentGalleryImages"
        @submit="onSubmit"
        @update:form="updateForm"
      />
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"
        ></div>
        <p class="text-slate-600">სიახლე იტვირთება...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminNewsStore } from '@/stores/admin/news'
import { useToastStore } from '@/stores/ui/toast'
import NewsForm from '@/components/admin/news/NewsForm.vue'
import type { NewsArticle } from '@/types'

const route = useRoute()
const router = useRouter()
const adminNewsStore = useAdminNewsStore()
const toastStore = useToastStore()

// Refs
const submitting = ref(false)
const article = ref<NewsArticle | null>(null)
const currentMainImage = ref('')
const currentGalleryImages = ref<string[]>([])

// Form data
const form = reactive({
  title: { ka: '', en: '', ru: '' },
  excerpt: { ka: '', en: '', ru: '' },
  content: { ka: '', en: '', ru: '' },
  category: 'company',
  publish_date: '',
  is_active: true,
  is_featured: false,
  main_image: null as File | null,
  gallery_images: [] as File[],
  tags: [] as string[],
  meta_title: '',
  meta_description: '',
})

// Functions
function goBack() {
  // Clear validation errors when navigating away
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()
  router.push({ name: 'admin-news' })
}

function updateForm(updatedForm: any) {
  // Clear validation errors when form is updated
  adminNewsStore.clearValidationErrors()
  // Use Object.assign to maintain reactivity
  Object.assign(form, updatedForm)
}

function populateForm(articleData: NewsArticle) {
  // Update form with article data
  Object.assign(form, {
    title: articleData.title || { ka: '', en: '', ru: '' },
    excerpt: articleData.excerpt || { ka: '', en: '', ru: '' },
    content: articleData.content || { ka: '', en: '', ru: '' },
    category: articleData.category || 'company',
    publish_date: articleData.publish_date || '',
    is_active: articleData.is_active !== undefined ? articleData.is_active : true,
    is_featured: articleData.is_featured !== undefined ? articleData.is_featured : false,
    main_image: null,
    gallery_images: [],
    tags: articleData.tags || [],
    meta_title: articleData.meta_title || '',
    meta_description: articleData.meta_description || '',
  })

  // Set current images
  currentMainImage.value = articleData.main_image || ''
  currentGalleryImages.value = articleData.gallery_images || []
}

async function loadArticle() {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push({ name: 'admin-news' })
    return
  }

  const result = await adminNewsStore.fetchArticle(id)
  if (result.success && result.data) {
    article.value = result.data
    populateForm(result.data)
  } else {
    router.push({ name: 'admin-news' })
  }
}

async function onSubmit(formData: FormData) {
  if (!article.value) return

  try {
    submitting.value = true
    adminNewsStore.clearValidationErrors()

    // Add existing gallery images that weren't removed
    currentGalleryImages.value.forEach((image) => {
      formData.append('existing_gallery_images[]', image)
    })

    const result = await adminNewsStore.editArticle(article.value.id, formData)
    if (result.success) {
      toastStore.success('სიახლე წარმატებით განახლდა', 'სიახლის ინფორმაცია წარმატებით შეიცვალა')
      router.push({ name: 'admin-news' })
    } else {
      if (result.validationErrors) {
        toastStore.error('ფორმაში შეცდომები', 'გთხოვთ, შეასწოროთ ქვემოთ მითითებული ველები')
      } else {
        toastStore.error('შეცდომა', result.error || 'სიახლის განახლება ვერ მოხერხდა')
      }
    }
  } catch (error) {
    console.error('Update failed:', error)
    toastStore.error('შეცდომა', 'სიახლის განახლება ვერ მოხერხდა')
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Clear any existing validation errors when mounting
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()

  loadArticle()
})

// Cleanup when component is unmounted
onUnmounted(() => {
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
