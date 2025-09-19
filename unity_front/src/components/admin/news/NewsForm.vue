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
    <FormCard title="ძირითადი ინფორმაცია" variant="emerald">
      <div class="space-y-10">
        <!-- Title -->
        <FormSection title="სათაური" variant="emerald">
          <MultiLanguageField
            field-name="title"
            placeholder="შეიყვანეთ სათაური"
            :form-data="form.title"
            :required="true"
            variant="emerald"
            :translating="translating"
            :show-translate-button="true"
            @translate="
              (fromLang: string, toLang: string) => handleTranslate('title', fromLang, toLang)
            "
            @update:form-data="updateMultiLangField('title', $event)"
          />
          <!-- Error Display for Title -->
          <div
            v-if="
              hasFieldError('title.ka') || hasFieldError('title.en') || hasFieldError('title.ru')
            "
            class="mt-3 space-y-2"
          >
            <div
              v-for="error in getFieldError('title.ka')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">ქართული სათაური:</span>
              <span>{{ error }}</span>
            </div>
            <div
              v-for="error in getFieldError('title.en')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">ინგლისური სათაური:</span>
              <span>{{ error }}</span>
            </div>
            <div
              v-for="error in getFieldError('title.ru')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">რუსული სათაური:</span>
              <span>{{ error }}</span>
            </div>
          </div>
        </FormSection>

        <!-- Excerpt -->
        <FormSection title="მოკლე აღწერა" variant="emerald">
          <MultiLanguageField
            field-name="excerpt"
            field-type="textarea"
            placeholder="შეიყვანეთ მოკლე აღწერა"
            :form-data="form.excerpt"
            :required="true"
            variant="emerald"
            :rows="3"
            :translating="translating"
            :show-translate-button="true"
            @translate="
              (fromLang: string, toLang: string) => handleTranslate('excerpt', fromLang, toLang)
            "
            @update:form-data="updateMultiLangField('excerpt', $event)"
          />
          <!-- Error Display for Excerpt -->
          <div
            v-if="
              hasFieldError('excerpt.ka') ||
              hasFieldError('excerpt.en') ||
              hasFieldError('excerpt.ru')
            "
            class="mt-3 space-y-2"
          >
            <div
              v-for="error in getFieldError('excerpt.ka')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">ქართული აღწერა:</span>
              <span>{{ error }}</span>
            </div>
            <div
              v-for="error in getFieldError('excerpt.en')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">ინგლისური აღწერა:</span>
              <span>{{ error }}</span>
            </div>
            <div
              v-for="error in getFieldError('excerpt.ru')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">რუსული აღწერა:</span>
              <span>{{ error }}</span>
            </div>
          </div>
        </FormSection>

        <!-- Content -->
        <FormSection title="სრული შინაარსი" variant="emerald">
          <MultiLanguageField
            field-name="content"
            field-type="textarea"
            placeholder="შეიყვანეთ სრული შინაარსი"
            :form-data="form.content"
            :required="true"
            variant="emerald"
            :rows="8"
            :translating="translating"
            :show-translate-button="true"
            @translate="
              (fromLang: string, toLang: string) => handleTranslate('content', fromLang, toLang)
            "
            @update:form-data="updateMultiLangField('content', $event)"
          />
          <!-- Error Display for Content -->
          <div
            v-if="
              hasFieldError('content.ka') ||
              hasFieldError('content.en') ||
              hasFieldError('content.ru')
            "
            class="mt-3 space-y-2"
          >
            <div
              v-for="error in getFieldError('content.ka')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">ქართული შინაარსი:</span>
              <span>{{ error }}</span>
            </div>
            <div
              v-for="error in getFieldError('content.en')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">ინგლისური შინაარსი:</span>
              <span>{{ error }}</span>
            </div>
            <div
              v-for="error in getFieldError('content.ru')"
              :key="error"
              class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
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
              <span class="font-medium">რუსული შინაარსი:</span>
              <span>{{ error }}</span>
            </div>
          </div>
        </FormSection>
      </div>
    </FormCard>

    <!-- Article Details Card -->
    <FormCard title="სტატიის დეტალები" variant="emerald">
      <div class="space-y-10">
        <!-- Category -->
        <FormSection title="კატეგორია" variant="emerald">
          <div>
            <label class="block text-sm font-semibold text-slate-800 mb-3">აირჩიეთ კატეგორია</label>
            <select
              :value="form.category"
              @change="updateForm('category', ($event.target as HTMLSelectElement).value)"
              required
              class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
              :class="{
                'border-red-300 focus:border-red-500 focus:ring-red-500': hasFieldError('category'),
              }"
            >
              <option value="">კატეგორიის არჩევა</option>
              <option value="company">კომპანია</option>
              <option value="project">პროექტი</option>
              <option value="industry">ინდუსტრია</option>
              <option value="event">ღონისძიება</option>
            </select>
            <!-- Error Display for Category -->
            <div v-if="hasFieldError('category')" class="mt-3 space-y-2">
              <div
                v-for="error in getFieldError('category')"
                :key="error"
                class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2"
              >
                <svg
                  class="w-4 h-4 flex-shrink-0"
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
                <span class="font-medium">კატეგორია:</span>
                <span>{{ error }}</span>
              </div>
            </div>
          </div>
        </FormSection>

        <!-- Publish Date -->
        <FormSection title="გამოქვეყნების თარიღი" variant="emerald">
          <div>
            <label class="block text-sm font-semibold text-slate-800 mb-3">აირჩიეთ თარიღი</label>
            <input
              :value="form.publish_date"
              @input="updateForm('publish_date', ($event.target as HTMLInputElement).value)"
              type="date"
              class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
            />
          </div>
        </FormSection>

        <!-- Status Checkboxes -->
        <div class="grid md:grid-cols-2 gap-6">
          <FormSection title="სტატუსი" variant="emerald">
            <div class="space-y-4">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  :checked="form.is_active"
                  @change="updateForm('is_active', ($event.target as HTMLInputElement).checked)"
                  type="checkbox"
                  class="w-5 h-5 text-emerald-600 border-2 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span class="text-sm font-medium text-slate-700">აქტიური</span>
              </label>
            </div>
          </FormSection>
        </div>
      </div>
    </FormCard>

    <!-- Media Card -->
    <FormCard title="მედია ფაილები" variant="emerald">
      <div class="space-y-10">
        <!-- Main Image -->
        <FormSection title="მთავარი სურათი" variant="emerald">
          <div
            class="border-2 border-dashed border-slate-300 rounded-2xl p-8 transition-all duration-300 bg-white/90 hover:border-emerald-400"
          >
            <input
              ref="mainImageInput"
              type="file"
              accept="image/*"
              class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 file:transition-all file:duration-300 shadow-sm"
              @change="handleMainImageChange"
            />
            <div v-if="mainImagePreview" class="mt-6">
              <img
                :src="mainImagePreview"
                alt="Main image preview"
                class="w-40 h-40 object-cover rounded-2xl border border-slate-300 shadow-lg"
              />
            </div>
          </div>
        </FormSection>

        <!-- Gallery Images -->
        <FormSection title="გალერეის სურათები" variant="emerald">
          <div
            class="border-2 border-dashed border-slate-300 rounded-2xl p-8 transition-all duration-300 bg-white/90 hover:border-emerald-400"
          >
            <input
              ref="galleryInput"
              type="file"
              accept="image/*"
              multiple
              class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 file:transition-all file:duration-300 shadow-sm"
              @change="handleGalleryChange"
            />
            <div
              v-if="galleryPreviews.length > 0"
              class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <div v-for="(preview, index) in galleryPreviews" :key="index" class="relative group">
                <img
                  :src="preview.url"
                  :alt="`Gallery image ${index + 1}`"
                  class="w-full h-28 object-cover rounded-2xl border border-slate-300 shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  @click="removeGalleryImage(index)"
                  type="button"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  ×
                </button>
                <!-- Badge to show if it's a new or existing image -->
                <div
                  class="absolute top-2 left-2 px-2 py-1 text-xs rounded-full text-white font-medium"
                  :class="preview.type === 'new' ? 'bg-green-500' : 'bg-blue-500'"
                >
                  {{ preview.type === 'new' ? 'New' : 'Current' }}
                </div>
              </div>
            </div>
          </div>
        </FormSection>
      </div>
    </FormCard>

    <!-- Tags Card -->
    <FormCard title="თაგები" variant="emerald">
      <FormSection title="თაგების მართვა" variant="emerald">
        <div class="space-y-4">
          <div class="flex gap-3">
            <input
              v-model="newTag"
              type="text"
              placeholder="დაამატეთ თაგი"
              class="flex-1 px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
              @keyup.enter="addTag"
            />
            <button
              type="button"
              @click="addTag"
              class="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
            >
              დამატება
            </button>
          </div>

          <!-- Tags Display -->
          <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="(tag, index) in form.tags"
              :key="index"
              class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(index)"
                class="text-emerald-500 hover:text-emerald-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </FormSection>
    </FormCard>

    <!-- SEO Card -->
    <FormCard title="SEO ოპტიმიზაცია" variant="emerald">
      <div class="space-y-10">
        <!-- Meta Title -->
        <FormSection title="მეტა სათაური" variant="emerald">
          <div>
            <label class="block text-sm font-semibold text-slate-800 mb-3">SEO სათაური</label>
            <input
              :value="form.meta_title"
              @input="updateForm('meta_title', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="შეიყვანეთ SEO სათაური"
              class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm"
            />
          </div>
        </FormSection>

        <!-- Meta Description -->
        <FormSection title="მეტა აღწერა" variant="emerald">
          <div>
            <label class="block text-sm font-semibold text-slate-800 mb-3">SEO აღწერა</label>
            <textarea
              :value="form.meta_description"
              @input="updateForm('meta_description', ($event.target as HTMLTextAreaElement).value)"
              rows="3"
              placeholder="შეიყვანეთ SEO აღწერა"
              class="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-slate-900 font-medium shadow-sm resize-none"
            ></textarea>
          </div>
        </FormSection>
      </div>
    </FormCard>

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
import { ref, computed, watch, nextTick } from 'vue'
import { Translator } from '@/utils/translator'
import { compressImageForType } from '@/utils/imageCompression'
import { FormCard, FormSection, MultiLanguageField } from '@/components/admin/forms'

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
  // For tracking gallery image changes
  removed_gallery_images: string[]
}

interface Props {
  form: NewsFormData
  mode: 'add' | 'edit'
  submitting?: boolean
  currentMainImage?: string
  currentGalleryImages?: string[]
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
}>()

// Local refs
const newTag = ref('')
const translating = ref(false)
const mainImageInput = ref<HTMLInputElement>()
const galleryInput = ref<HTMLInputElement>()
const backendUrl = import.meta.env.VITE_BACKEND_URL

// Computed
const mainImagePreview = computed(() => {
  if (props.form.main_image) {
    return URL.createObjectURL(props.form.main_image)
  }
  return backendUrl + props.currentMainImage || ''
})

// Helper function to get field errors
const getFieldError = (fieldName: string) => {
  return props.errors[fieldName] || []
}

const hasFieldError = (fieldName: string) => {
  return getFieldError(fieldName).length > 0
}

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

const galleryPreviews = computed(() => {
  const previews: Array<{ url: string; type: 'existing' | 'new'; path?: string; file?: File }> = []

  // Add current gallery images (filter out removed ones)
  if (props.currentGalleryImages) {
    props.currentGalleryImages
      .filter((img: string) => !props.form.removed_gallery_images.includes(img))
      .forEach((img: string) => {
        previews.push({
          url: img.startsWith('http') ? img : `${backendUrl}${img}`,
          type: 'existing',
          path: img,
        })
      })
  }

  // Add new gallery images
  props.form.gallery_images.forEach((file) => {
    previews.push({
      url: URL.createObjectURL(file),
      type: 'new',
      file: file,
    })
  })

  return previews
})

// Helper functions
function updateForm<K extends keyof NewsFormData>(key: K, value: NewsFormData[K]) {
  const updatedForm = { ...props.form }
  updatedForm[key] = value
  emit('update:form', updatedForm)
}

function updateMultiLangField(
  field: 'title' | 'excerpt' | 'content',
  value: Record<string, string>,
) {
  console.log(`Updating ${field}:`, value)
  const updatedForm = { ...props.form }
  updatedForm[field] = { ka: value.ka || '', en: value.en || '', ru: value.ru || '' }
  emit('update:form', updatedForm)
}

// Translation handler
async function handleTranslate(
  field: 'title' | 'excerpt' | 'content',
  fromLang: string,
  toLang: string,
) {
  if (translating.value) return

  // Wait for any pending updates to complete
  await nextTick()

  // Get the latest form data directly from the current field value
  const fieldData = props.form[field]
  const sourceText = fieldData[fromLang as keyof typeof fieldData]

  if (!sourceText || typeof sourceText !== 'string' || sourceText.trim() === '') {
    console.warn(`No source text found for ${field}.${fromLang}`)
    return
  }

  translating.value = true
  try {
    const translatedText = await Translator.translate(sourceText, fromLang, toLang)
    if (translatedText) {
      const updatedForm = { ...props.form }
      updatedForm[field][toLang as keyof (typeof updatedForm)[typeof field]] = translatedText
      emit('update:form', updatedForm)
    }
  } catch (error) {
    console.error('Translation failed:', error)
  } finally {
    translating.value = false
  }
}

// File handling
function handleMainImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  updateForm('main_image', file || null)
}

function handleGalleryChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  const currentFiles = [...props.form.gallery_images]
  updateForm('gallery_images', [...currentFiles, ...files])
}

function removeGalleryImage(index: number) {
  const preview = galleryPreviews.value[index]

  if (preview.type === 'existing') {
    // Mark existing image for removal
    const removedImages = props.form.removed_gallery_images
    if (preview.path && !removedImages.includes(preview.path)) {
      updateForm('removed_gallery_images', [...removedImages, preview.path])
    }
  } else {
    // Remove new file from the array
    const existingCount = props.currentGalleryImages
      ? props.currentGalleryImages.filter(
          (img: string) => !props.form.removed_gallery_images.includes(img),
        ).length
      : 0
    const newFileIndex = index - existingCount

    if (newFileIndex >= 0) {
      const updatedFiles = [...props.form.gallery_images]
      updatedFiles.splice(newFileIndex, 1)
      updateForm('gallery_images', updatedFiles)
    }
  }
}

// Tag management
function addTag() {
  if (newTag.value.trim() && !props.form.tags.includes(newTag.value.trim())) {
    const updatedTags = [...props.form.tags, newTag.value.trim()]
    updateForm('tags', updatedTags)
    newTag.value = ''
  }
}

function removeTag(index: number) {
  const updatedTags = [...props.form.tags]
  updatedTags.splice(index, 1)
  updateForm('tags', updatedTags)
}

// Form submission
async function onSubmit() {
  const formData = new FormData()

  // Add multilingual fields
  Object.keys(props.form.title).forEach((lang) => {
    const value = props.form.title[lang as keyof typeof props.form.title]
    formData.append(`title[${lang}]`, value)
  })
  Object.keys(props.form.excerpt).forEach((lang) => {
    const value = props.form.excerpt[lang as keyof typeof props.form.excerpt]
    formData.append(`excerpt[${lang}]`, value)
  })
  Object.keys(props.form.content).forEach((lang) => {
    const value = props.form.content[lang as keyof typeof props.form.content]
    formData.append(`content[${lang}]`, value)
  })

  // Add other fields
  formData.append('category', props.form.category)
  if (props.form.publish_date) {
    formData.append('publish_date', props.form.publish_date)
  }

  // Convert boolean values to proper format for Laravel
  formData.append('is_active', props.form.is_active ? '1' : '0')
  formData.append('is_featured', props.form.is_featured ? '1' : '0')

  // Add files with compression
  if (props.form.main_image) {
    const compressedMainImage = await compressImageForType(props.form.main_image, 'main')
    if (compressedMainImage) {
      formData.append('main_image', compressedMainImage)
    }
  }

  // Compress and add gallery images
  for (const file of props.form.gallery_images) {
    if (file instanceof File) {
      const compressedFile = await compressImageForType(file, 'gallery')
      if (compressedFile) {
        formData.append('gallery_images[]', compressedFile)
      }
    }
  }

  // Add tags
  props.form.tags.forEach((tag) => {
    formData.append('tags[]', tag)
  })

  // Add SEO fields
  if (props.form.meta_title) {
    formData.append('meta_title', props.form.meta_title)
  }
  if (props.form.meta_description) {
    formData.append('meta_description', props.form.meta_description)
  }

  emit('submit', formData)
}

// Watch for form changes to emit updates
watch(
  () => props.form.category,
  (newValue) => {
    updateForm('category', newValue)
  },
)

watch(
  () => props.form.publish_date,
  (newValue) => {
    updateForm('publish_date', newValue)
  },
)

watch(
  () => props.form.is_active,
  (newValue) => {
    updateForm('is_active', newValue)
  },
)

watch(
  () => props.form.is_featured,
  (newValue) => {
    updateForm('is_featured', newValue)
  },
)

watch(
  () => props.form.meta_title,
  (newValue) => {
    updateForm('meta_title', newValue)
  },
)

watch(
  () => props.form.meta_description,
  (newValue) => {
    updateForm('meta_description', newValue)
  },
)
</script>
