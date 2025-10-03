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
              "ჩვენს შესახებ" გვერდის პარამეტრები
            </h1>
            <p class="text-slate-600 text-lg font-light">
              მართეთ "ჩვენს შესახებ" გვერდის სტატისტიკა და სურათები
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">შეცდომა</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="max-w-4xl mx-auto">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Statistics Section -->
          <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold text-gray-900 mb-2">სტატისტიკის მონაცემები</h2>
              <p class="text-gray-600">
                განაახლეთ სტატისტიკური მონაცემები, რომლებიც ნაჩვენებია ღია გვერდზე
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Successful Projects -->
              <div>
                <label
                  for="successful_projects"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  წარმატებული პროექტები
                </label>
                <input
                  id="successful_projects"
                  v-model="formData.stats.successful_projects"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="მაგ: 150+"
                />
              </div>

              <!-- Years Experience -->
              <div>
                <label for="years_experience" class="block text-sm font-medium text-gray-700 mb-2">
                  წლის გამოცდილება
                </label>
                <input
                  id="years_experience"
                  v-model="formData.stats.years_experience"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="მაგ: 15+"
                />
              </div>

              <!-- Satisfied Clients -->
              <div>
                <label for="satisfied_clients" class="block text-sm font-medium text-gray-700 mb-2">
                  კმაყოფილი კლიენტი
                </label>
                <input
                  id="satisfied_clients"
                  v-model="formData.stats.satisfied_clients"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="მაგ: 50+"
                />
              </div>

              <!-- Client Satisfaction -->
              <div>
                <label
                  for="client_satisfaction"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  კლიენტის კმაყოფილება
                </label>
                <input
                  id="client_satisfaction"
                  v-model="formData.stats.client_satisfaction"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="მაგ: 98%"
                />
              </div>
            </div>
          </div>

          <!-- Images Section -->
          <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div class="mb-6">
              <h2 class="text-2xl font-semibold text-gray-900 mb-2">გვერდის სურათები</h2>
              <p class="text-gray-600">
                აირჩიეთ სურათები "ჩვენს შესახებ" გვერდის სხვადასხვა სექციებისთვის
              </p>
            </div>

            <div class="space-y-8">
              <!-- Philosophy Image -->
              <div>
                <ImageSelector
                  v-model="formData.philosophy_image_id"
                  :image-data="getPhilosophyImageData()"
                  label="ფილოსოფიის სექციის სურათი"
                  help-text="სურათი, რომელიც ნაჩვენებია ფილოსოფიის სექციაში"
                  category="about"
                  :simple-upload="true"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                v-if="saving"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span v-if="saving">შენახვა...</span>
              <span v-else>შენახვა</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToastStore } from '@/stores/ui/toast'
import { type AboutInfoFormData, useAdminSiteSettingsStore } from '@/stores/admin/siteSettings'
import ImageSelector from '@/components/admin/ImageSelector.vue'

const toastStore = useToastStore()
const siteSettingsStore = useAdminSiteSettingsStore()

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const formData = ref<AboutInfoFormData>({
  stats: {
    successful_projects: '',
    years_experience: '',
    satisfied_clients: '',
    client_satisfaction: '',
  },
  philosophy_image_id: null,
})

const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    await siteSettingsStore.loadAboutInfo()

    if (siteSettingsStore.aboutInfo) {
      // Extract philosophy_image_id from either direct property or nested object
      const philosophyImageId = 
        siteSettingsStore.aboutInfo.philosophy_image_id || 
        siteSettingsStore.aboutInfo.philosophy_image?.id || 
        null

      formData.value = {
        stats: { ...siteSettingsStore.aboutInfo.stats },
        philosophy_image_id: philosophyImageId,
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'მონაცემების ჩატვირთვა ვერ მოხერხდა'
  } finally {
    loading.value = false
  }
}

// Helper function to get philosophy image data
const getPhilosophyImageData = () => {
  const aboutInfo = siteSettingsStore.aboutInfo
  if (!aboutInfo) return null

  // First priority: use philosophy_image object if available
  if (aboutInfo.philosophy_image) {
    return {
      id: aboutInfo.philosophy_image.id,
      url: aboutInfo.philosophy_image.url,
      alt_text: typeof aboutInfo.philosophy_image.alt_text === 'string' 
        ? aboutInfo.philosophy_image.alt_text 
        : aboutInfo.philosophy_image.alt_text || undefined,
      title: typeof aboutInfo.philosophy_image.title === 'string'
        ? aboutInfo.philosophy_image.title
        : aboutInfo.philosophy_image.title || 'ფილოსოფიის სექციის სურათი',
    }
  }

  // Fallback: use separate id and url fields
  if (aboutInfo.philosophy_image_id && aboutInfo.philosophy_image_url) {
    return {
      id: aboutInfo.philosophy_image_id,
      url: aboutInfo.philosophy_image_url,
      title: 'ფილოსოფიის სექციის სურათი',
    }
  }

  return null
}

const handleSubmit = async () => {
  try {
    saving.value = true

    await siteSettingsStore.updateAboutInfo(formData.value)

    toastStore.success('წარმატება', 'პარამეტრები წარმატებით განახლდა')

    // Reload data to show updated values
    await loadData()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'პარამეტრების განახლება ვერ მოხერხდა'
    toastStore.error('შეცდომა', message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
