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

      <!-- Search Bar -->
      <div class="mb-8">
        <SearchBar
          v-model="searchQuery"
          placeholder="ძიება თარგმანებში..."
          @update:model-value="debounceSearch"
        />
      </div>

      <!-- Translations Table -->
      <div class="mb-4">
        <div class="text-sm text-slate-700 mb-4 font-medium">
          <span v-if="totalPages > 1"> გვერდი {{ currentPage }} / {{ totalPages }} სულ </span>
          <span v-else> სულ {{ translations.length }} თარგმანი </span>
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
import { TranslationTable, TranslationModal, SearchBar, Pagination } from '@/components/admin'

const translations = ref<Translation[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const saving = ref(false)
const translating = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const editingTranslation = ref<Translation | null>(null)

const translationForm = reactive({
  key: '',
  text_en: '',
  text_ka: '',
  text_ru: '',
  group: 'general',
  active: true,
})

let searchTimeout: number

const loadTranslations = async () => {
  try {
    loading.value = true
    const response = await getTranslations(currentPage.value, searchQuery.value)

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

const translateText = async (fromLang: string, toLang: string) => {
  if (translating.value) return

  const sourceText = translationForm[`text_${fromLang}` as keyof typeof translationForm]
  if (!sourceText || typeof sourceText !== 'string') return

  try {
    translating.value = true
    // Mock translation - replace with real translation service
    const translatedText = await mockTranslate(sourceText, fromLang, toLang)

    if (toLang === 'en') {
      translationForm.text_en = translatedText
    } else if (toLang === 'ru') {
      translationForm.text_ru = translatedText
    }
  } catch (error) {
    console.error('Translation failed:', error)
  } finally {
    translating.value = false
  }
}

// Mock translation function - replace with real translation service
const mockTranslate = async (text: string, fromLang: string, toLang: string): Promise<string> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Basic mock translations for common phrases
  const translations: Record<string, Record<string, string>> = {
    // Common Georgian phrases to English/Russian
    'მთავარი გვერდი': { en: 'Home Page', ru: 'Главная страница' },
    კონტაქტი: { en: 'Contact', ru: 'Контакт' },
    'ჩვენ შესახებ': { en: 'About Us', ru: 'О нас' },
    პროექტები: { en: 'Projects', ru: 'Проекты' },
    სერვისები: { en: 'Services', ru: 'Услуги' },
    გამოცდილება: { en: 'Experience', ru: 'Опыт' },
    პორტფოლიო: { en: 'Portfolio', ru: 'Портфолио' },
    თანამშრომლობა: { en: 'Collaboration', ru: 'Сотрудничество' },
    'ახალი პროექტი': { en: 'New Project', ru: 'Новый проект' },
    წარმატებული: { en: 'Successful', ru: 'Успешный' },
  }

  // Check if we have a specific translation
  if (translations[text] && translations[text][toLang]) {
    return translations[text][toLang]
  }

  // For demo purposes, return transliterated or original text
  // In a real app, this would call a translation service like Google Translate API
  return text
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
  translationForm.group = translation.group || 'general'
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
  translationForm.group = 'general'
  translationForm.active = true
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
