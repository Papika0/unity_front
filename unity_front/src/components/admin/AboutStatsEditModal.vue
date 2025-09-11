<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  class="h-6 w-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  რედაქტირება - სტატისტიკა
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    შეცვალეთ სტატისტიკის მონაცემები, რომლებიც ნაჩვენებია "ჩვენს შესახებ" გვერდზე.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-4">
              <!-- Successful Projects -->
              <div>
                <label for="successful_projects" class="block text-sm font-medium text-gray-700">
                  წარმატებული პროექტები
                </label>
                <input
                  id="successful_projects"
                  v-model="formData.stats.successful_projects"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="მაგ: 150+"
                />
              </div>

              <!-- Years Experience -->
              <div>
                <label for="years_experience" class="block text-sm font-medium text-gray-700">
                  წლის გამოცდილება
                </label>
                <input
                  id="years_experience"
                  v-model="formData.stats.years_experience"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="მაგ: 15+"
                />
              </div>

              <!-- Satisfied Clients -->
              <div>
                <label for="satisfied_clients" class="block text-sm font-medium text-gray-700">
                  კმაყოფილი კლიენტი
                </label>
                <input
                  id="satisfied_clients"
                  v-model="formData.stats.satisfied_clients"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="მაგ: 50+"
                />
              </div>

              <!-- Client Satisfaction -->
              <div>
                <label for="client_satisfaction" class="block text-sm font-medium text-gray-700">
                  კლიენტის კმაყოფილება
                </label>
                <input
                  id="client_satisfaction"
                  v-model="formData.stats.client_satisfaction"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="მაგ: 98%"
                />
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="saving"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="saving" class="flex items-center">
                <svg
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
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                შენახვა...
              </span>
              <span v-else>შენახვა</span>
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              გაუქმება
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AboutInfoFormData } from '@/stores/admin/siteSettings'
import type { AboutInfo } from '@/composables/useAboutInfo'

interface Props {
  show: boolean
  aboutInfo: AboutInfo | null
  saving?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [data: AboutInfoFormData]
}>()

const formData = ref<AboutInfoFormData>({
  stats: {
    successful_projects: '',
    years_experience: '',
    satisfied_clients: '',
    client_satisfaction: '',
  },
})

// Watch for changes in aboutInfo prop to populate form
watch(
  () => props.aboutInfo,
  (newAboutInfo) => {
    if (newAboutInfo?.stats) {
      formData.value = {
        stats: { ...newAboutInfo.stats },
      }
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>
