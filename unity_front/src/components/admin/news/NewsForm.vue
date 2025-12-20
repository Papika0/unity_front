<template>
  <form @submit.prevent="onSubmit" class="space-y-12">
    <!-- Global Error Display -->
    <div
      v-if="Object.keys(props.errors).length > 0"
      class="bg-red-50 border-l-4 border-red-400 p-6 rounded-2xl shadow-sm"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-semibold text-red-800 mb-2">ფორმაში შეცდომები</h3>
          <p class="text-red-700 mb-4">გთხოვთ, გამოასწოროთ ქვემოთ მითითებული შეცდომები:</p>
          <ul class="list-disc list-inside space-y-1 text-red-700">
            <li v-for="(fieldErrors, fieldName) in props.errors" :key="fieldName">
              <span class="font-medium">{{ getFieldDisplayName(fieldName) }}:</span>
              {{ fieldErrors[0] }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Basic Information Card -->
    <NewsBasicInfo
      :title="form.title"
      :excerpt="form.excerpt"
      :content="form.content"
      :translating="translating"
      :errors="errors"
      @update:title="updateMultiLangField('title', $event)"
      @update:excerpt="updateMultiLangField('excerpt', $event)"
      @update:content="updateMultiLangField('content', $event)"
      @translate="handleTranslate"
    />

    <!-- Article Details Card -->
    <NewsDetails
      :category="form.category"
      :publish-date="form.publish_date"
      :is-active="form.is_active"
      :errors="errors"
      @update:category="updateForm('category', $event)"
      @update:publish-date="updateForm('publish_date', $event)"
      @update:is-active="updateForm('is_active', $event)"
    />

    <!-- Media Card -->
    <NewsMedia
      :main-image-preview="mainImagePreview"
      :gallery-previews="galleryPreviews"
      @main-image-change="handleMainImageChange"
      @gallery-change="handleGalleryChange"
      @gallery-remove="removeGalleryImage"
      @compression-progress="handleCompressionProgress"
      @compression-complete="handleCompressionComplete"
    />

    <!-- Tags Card -->
    <NewsTags
      :tags="form.tags"
      @add-tag="addTag"
      @remove-tag="removeTag"
    />

    <!-- SEO Card -->
    <NewsSEO
      :meta-title="form.meta_title"
      :meta-description="form.meta_description"
      @update:meta-title="updateForm('meta_title', $event)"
      @update:meta-description="updateForm('meta_description', $event)"
    />

    <!-- Submit Button -->
    <div class="flex justify-end">
      <button
        type="submit"
        :disabled="submitting"
        class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="submitting" class="flex items-center gap-2">
          <svg
            class="animate-spin w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ mode === 'edit' ? 'რედაქტირდება...' : 'იქმნება...' }}
        </span>
        <span v-else>
          {{ mode === 'edit' ? 'განახლება' : 'შექმნა' }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Translator } from '@/utils/translator'
import type { ImageData } from '@/types'

// Sub-components
import NewsBasicInfo from './news-form/NewsBasicInfo.vue'
import NewsDetails from './news-form/NewsDetails.vue'
import NewsMedia from './news-form/NewsMedia.vue'
import NewsTags from './news-form/NewsTags.vue'
import NewsSEO from './news-form/NewsSEO.vue'

interface NewsFormData {
  title: { ka: string; en: string; ru: string }
  excerpt: { ka: string; en: string; ru: string }
  content: { ka: string; en: string; ru: string }
  category: string
  publish_date: string
  is_active: boolean
  is_featured: boolean
  main_image: File | null
  gallery_images: File[]
  tags: string[]
  meta_title: string
  meta_description: string
  removed_gallery_images: string[]
}

interface Props {
  form: NewsFormData
  mode: 'add' | 'edit'
  submitting?: boolean
  currentMainImage?: string | ImageData | null
  currentGalleryImages?: Array<string | ImageData>
  errors?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false,
  currentMainImage: '',
  currentGalleryImages: () => [],
  errors: () => ({}),
})

const emit = defineEmits<{
  submit: [formData: FormData]
  'update:form': [form: NewsFormData]
  compressionProgress: [progress: number]
  compressionComplete: [files: File[]]
}>()

// Local refs
const translating = ref(false)
const backendUrl = import.meta.env.VITE_BACKEND_URL

// Computed
const mainImagePreview = computed(() => {
  if (props.form.main_image) return URL.createObjectURL(props.form.main_image)
  if (!props.currentMainImage) return ''
  if (typeof props.currentMainImage === 'object' && props.currentMainImage !== null && 'url' in props.currentMainImage) return props.currentMainImage.url
  if (typeof props.currentMainImage === 'string') return props.currentMainImage.startsWith('http') ? props.currentMainImage : backendUrl + props.currentMainImage
  return ''
})

const galleryPreviews = computed(() => {
  const previews: Array<{ url: string; type: 'existing' | 'new'; path?: string; file?: File }> = []
  if (props.currentGalleryImages) {
    props.currentGalleryImages
      .filter((img: string | ImageData) => {
        const imageId = typeof img === 'string' ? img : img.id ? img.id.toString() : img.url
        return !props.form.removed_gallery_images.includes(imageId)
      })
      .forEach((img: string | ImageData) => {
        let imageUrl: string
        let imagePath: string
        if (typeof img === 'string') {
          imageUrl = img.startsWith('http') ? img : `${backendUrl}${img}`
          imagePath = img
        } else {
          imageUrl = img.url
          imagePath = img.id ? img.id.toString() : img.url
        }
        previews.push({ url: imageUrl, type: 'existing', path: imagePath })
      })
  }
  props.form.gallery_images.forEach((file) => {
    previews.push({ url: URL.createObjectURL(file), type: 'new', file: file })
  })
  return previews
})

// Get display name for field
const getFieldDisplayName = (fieldName: string) => {
  const fieldNames: Record<string, string> = {
    'title.ka': 'ქართული სათაური',
    'title.en': 'ინგლისური სათაური',
    'title.ru': 'რუსული სათაური',
    'excerpt.ka': 'ქართული აღწერა',
    'excerpt.en': 'ინგლისური აღწერა',
    'excerpt.ru': 'რუსული აღწერა',
    'content.ka': 'ქართული შინაარსი',
    'content.en': 'ინგლისური შინაარსი',
    'content.ru': 'რუსული შინაარსი',
    category: 'კატეგორია',
    publish_date: 'გამოქვეყნების თარიღი',
    main_image: 'მთავარი სურათი',
    meta_title: 'SEO სათაური',
    meta_description: 'SEO აღწერა',
  }
  return fieldNames[fieldName] || fieldName
}

// Helper functions
function updateForm<K extends keyof NewsFormData>(key: K, value: NewsFormData[K]) {
  const updatedForm = { ...props.form, [key]: value }
  emit('update:form', updatedForm)
}

function updateMultiLangField(field: 'title' | 'excerpt' | 'content', value: Record<string, string>) {
  const updatedForm = { ...props.form }
  updatedForm[field] = { ka: value.ka || '', en: value.en || '', ru: value.ru || '' }
  emit('update:form', updatedForm)
}

async function handleTranslate(field: 'title' | 'excerpt' | 'content', fromLang: string, toLang: string) {
  if (translating.value) return
  await nextTick()
  const fieldData = props.form[field]
  const sourceText = fieldData[fromLang as keyof typeof fieldData]
  if (!sourceText || typeof sourceText !== 'string' || sourceText.trim() === '') return
  translating.value = true
  try {
    const translatedText = await Translator.translate(sourceText, fromLang, toLang)
    if (translatedText) {
      const updatedForm = { ...props.form }
      updatedForm[field] = { ...updatedForm[field], [toLang]: translatedText }
      emit('update:form', updatedForm)
    }
  } catch (error) { console.error('Translation failed:', error) }
  finally { translating.value = false }
}

function handleMainImageChange(files: FileList | null) { updateForm('main_image', files?.[0] || null) }
function handleGalleryChange(files: FileList | null) {
  if (files) updateForm('gallery_images', [...props.form.gallery_images, ...Array.from(files)])
}

function removeGalleryImage(index: number) {
  const preview = galleryPreviews.value[index]
  if (preview.type === 'existing' && preview.path) {
    updateForm('removed_gallery_images', [...props.form.removed_gallery_images, preview.path])
  } else {
    const existingCount = props.currentGalleryImages ? props.currentGalleryImages.filter((img: string | ImageData) => {
      const imageId = typeof img === 'string' ? img : img.id ? img.id.toString() : img.url
      return !props.form.removed_gallery_images.includes(imageId)
    }).length : 0
    const newFileIndex = index - existingCount
    if (newFileIndex >= 0) {
      const updatedFiles = [...props.form.gallery_images]
      updatedFiles.splice(newFileIndex, 1)
      updateForm('gallery_images', updatedFiles)
    }
  }
}

function handleCompressionProgress(progress: number) { emit('compressionProgress', progress) }
function handleCompressionComplete(files: File[]) { emit('compressionComplete', files) }

function addTag(tag: string) {
  if (!props.form.tags.includes(tag)) updateForm('tags', [...props.form.tags, tag])
}

function removeTag(index: number) {
  const updatedTags = [...props.form.tags]; updatedTags.splice(index, 1); updateForm('tags', updatedTags)
}

function onSubmit() {
  const formData = new FormData()
  Object.entries(props.form).forEach(([key, value]) => {
    if (key === 'title' || key === 'excerpt' || key === 'content') {
      Object.entries(value as Record<string, string>).forEach(([lang, val]) => {
        formData.append(`${key}[${lang}]`, val)
      })
    } else if (key === 'gallery_images') {
      (value as File[]).forEach((file) => formData.append('gallery_images[]', file))
    } else if (key === 'tags' || key === 'removed_gallery_images') {
      (value as string[]).forEach((item) => formData.append(`${key}[]`, item))
    } else if (value !== null) {
      formData.append(key, value instanceof File ? value : String(value))
    }
  })
  emit('submit', formData)
}
</script>
