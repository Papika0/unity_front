<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="container mx-auto px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-4xl font-light bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 tracking-tight"
            >
              თარგმანების მართვა
            </h1>
            <p class="text-slate-600 text-lg font-light">მართეთ აპლიკაციის თარგმანები სამ ენაზე</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            ახალი თარგმანი
          </button>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="mb-8 space-y-4">
        <!-- Search Bar -->
        <SearchBar
          v-model="searchQuery"
          placeholder="ძიება თარგმანებში..."
          @update:model-value="debounceSearch"
        />

        <!-- Group Filter -->
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
        >
          <label class="text-sm font-semibold text-slate-700 whitespace-nowrap"
            >ჯგუფის ფილტრი:</label
          >
          <div class="w-full sm:w-64">
            <CustomDropdown
              v-model="selectedGroup"
              :options="groupOptions"
              placeholder="ყველა ჯგუფი"
              @update:model-value="handleGroupFilter"
            />
          </div>
          <button
            v-if="selectedGroup"
            @click="clearGroupFilter"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            გასუფთავება
          </button>
        </div>
      </div>

      <!-- Translations Table -->
      <div class="mb-4">
        <!-- Filter Summary -->
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <div class="text-sm text-slate-700 font-medium">
            <span v-if="totalPages > 1"> გვერდი {{ currentPage }} / {{ totalPages }} </span>
            <span> სულ {{ translations.length }} თარგმანი </span>
          </div>
          <div v-if="searchQuery || selectedGroup" class="flex items-center gap-2">
            <span class="text-xs text-slate-500">აქტიური ფილტრები:</span>
            <span
              v-if="searchQuery"
              class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              🔍 "{{ searchQuery }}"
            </span>
            <span
              v-if="selectedGroup"
              class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
            >
              {{ groupOptions.find((g) => g.value === selectedGroup)?.icon }}
              {{ groupOptions.find((g) => g.value === selectedGroup)?.label }}
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
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
            <span class="text-slate-700 font-medium">იტვირთება...</span>
          </div>
        </div>

        <!-- Translations Table -->
        <TranslationTable
          v-else
          :translations="translations"
          @edit="editTranslation"
          @delete="deleteTranslationConfirm"
        />
      </div>

      <!-- Pagination -->
      <div class="mt-8">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @previous="previousPage"
          @next="nextPage"
          @goto="goToPage"
        />
      </div>

      <!-- Create/Edit Modal -->
      <TranslationModal
        :is-open="showCreateModal || showEditModal"
        :is-edit="showEditModal"
        :form="translationForm"
        :saving="saving"
        :translating="translating"
        @close="closeModal"
        @submit="saveTranslation"
        @translate="translateText"
        @translateBoth="translateBoth"
        @update:form="updateForm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
} from '@/services/translations'
import type { Translation } from '@/types'
import {
  TranslationTable,
  TranslationModal,
  SearchBar,
  Pagination,
  CustomDropdown,
} from '@/components/admin'
import { Translator } from '@/utils/translator'

const translations = ref<Translation[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const saving = ref(false)
const translating = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const selectedGroup = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const editingTranslation = ref<Translation | null>(null)

// Group options for the filter dropdown
const groupOptions = [
  { value: '', label: 'ყველა ჯგუფი', icon: '📁' },
  { value: 'header', label: 'ნავიგაცია(ზედა)', icon: '🧭' },
  { value: 'footer', label: 'ნავიგაცია(ქვედა)', icon: '🔻' },
  { value: 'home', label: 'მთავარი გვერდი', icon: '🏠' },
  { value: 'about', label: 'ჩვენს შესახებ', icon: 'ℹ️' },
  { value: 'projects', label: 'პროექტები', icon: '🏗️' },
  { value: 'gallery', label: 'გალერეა', icon: '🖼️' },
  { value: 'faq', label: 'FAQ', icon: '❓' },
  { value: 'contact', label: 'კონტაქტი', icon: '📞' },
  { value: 'buttons', label: 'ღილაკები', icon: '🔘' },
  { value: 'messages', label: 'შეტყობინებები', icon: '💬' },
  { value: 'errors', label: 'შეცდომები', icon: '⚠️' },
  { value: 'admin', label: 'ადმინისტრაცია', icon: '👨‍💼' },
  { value: 'auth', label: 'ავთენტიფიკაცია', icon: '🔐' },
  { value: 'testimonials', label: 'რეკომენდაციები', icon: '💭' },
]

const translationForm = reactive({
  key: '',
  text_en: '',
  text_ka: '',
  text_ru: '',
  group: '',
  active: true,
})

let searchTimeout: number

const loadTranslations = async () => {
  try {
    loading.value = true
    const response = await getTranslations(
      currentPage.value,
      searchQuery.value,
      selectedGroup.value,
    )

    // Handle different API response structures
    if (response.data.data && Array.isArray(response.data.data)) {
      // Laravel paginated response structure
      translations.value = response.data.data
      if (response.data.meta) {
        totalPages.value = response.data.meta.last_page || 1
        currentPage.value = response.data.meta.current_page || 1
      } else {
        totalPages.value = Math.ceil((response.data.total || translations.value.length) / 15)
      }
    } else if (Array.isArray(response.data)) {
      // Simple array response
      translations.value = response.data
      totalPages.value = 1
    } else {
      // Fallback
      translations.value = []
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Error loading translations:', error)
    translations.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadTranslations()
  }, 300)
}

const handleGroupFilter = () => {
  currentPage.value = 1
  loadTranslations()
}

const clearGroupFilter = () => {
  selectedGroup.value = ''
  currentPage.value = 1
  loadTranslations()
}

const translateText = async (fromLang: string, toLang: string) => {
  if (translating.value) return

  const sourceText = translationForm[`text_${fromLang}` as keyof typeof translationForm]
  if (!sourceText || typeof sourceText !== 'string') return

  try {
    translating.value = true
    // Use real translation service
    const translatedText = await Translator.translate(sourceText, fromLang, toLang)

    if (toLang === 'en') {
      translationForm.text_en = translatedText
    } else if (toLang === 'ru') {
      translationForm.text_ru = translatedText
    }
  } catch (error) {
    console.error('Translation failed:', error)
    // Show user-friendly error message or keep original text
  } finally {
    translating.value = false
  }
}

const translateBoth = async () => {
  if (translating.value || !translationForm.text_ka) return

  try {
    translating.value = true

    // Translate to both English and Russian in parallel
    const [englishTranslation, russianTranslation] = await Promise.all([
      Translator.translate(translationForm.text_ka, 'ka', 'en'),
      Translator.translate(translationForm.text_ka, 'ka', 'ru'),
    ])

    translationForm.text_en = englishTranslation
    translationForm.text_ru = russianTranslation
  } catch (error) {
    console.error('Translation failed:', error)
    // Show user-friendly error message or keep original text
  } finally {
    translating.value = false
  }
}

const saveTranslation = async () => {
  try {
    saving.value = true

    const formData = {
      key: translationForm.key,
      text: {
        en: translationForm.text_en,
        ka: translationForm.text_ka,
        ru: translationForm.text_ru,
      },
      group: translationForm.group,
      active: translationForm.active,
    }

    if (showEditModal.value && editingTranslation.value) {
      await updateTranslation(editingTranslation.value.id, formData)
    } else {
      await addTranslation(formData)
    }

    await loadTranslations()
    closeModal()
  } catch (error) {
    console.error('Error saving translation:', error)
  } finally {
    saving.value = false
  }
}

const editTranslation = (translation: Translation) => {
  editingTranslation.value = translation
  translationForm.key = translation.key
  translationForm.text_en = translation.text_en
  translationForm.text_ka = translation.text_ka
  translationForm.text_ru = translation.text_ru || ''
  translationForm.group = translation.group || ''
  translationForm.active = translation.active === 1
  showEditModal.value = true
}

const deleteTranslationConfirm = async (translation: Translation) => {
  if (confirm(`დარწმუნებული ხართ, რომ გსურთ თარგმანის "${translation.key}" წაშლა?`)) {
    try {
      await deleteTranslation(translation.id)
      await loadTranslations()
    } catch (error) {
      console.error('Error deleting translation:', error)
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTranslation.value = null
  translationForm.key = ''
  translationForm.text_en = ''
  translationForm.text_ka = ''
  translationForm.text_ru = ''
  translationForm.group = ''
  translationForm.active = true
}

const updateForm = (newForm: typeof translationForm) => {
  Object.assign(translationForm, newForm)
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadTranslations()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadTranslations()
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadTranslations()
  }
}

onMounted(() => {
  loadTranslations()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* Custom scrollbar for light theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.8);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

/* Gradient text animation */
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 6s ease-in-out infinite;
}

/* Button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}
</style>
