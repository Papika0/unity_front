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
              კონტაქტის ინფორმაციის მართვა
            </h1>
            <p class="text-slate-600 text-lg font-light">მართეთ საკონტაქტო ინფორმაცია</p>
          </div>
          <button
            v-if="store.hasContactInfo"
            @click="store.openEditModal()"
            class="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            რედაქტირება
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="store.error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
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
              <p>{{ store.error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Info Card -->
      <div v-else-if="store.hasContactInfo" class="max-w-4xl mx-auto">
        <div
          class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-200"
        >
          <div class="flex justify-between items-start mb-6">
            <button
              @click="store.openEditModal()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              რედაქტირება
            </button>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Email -->
              <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-2">ელ. ფოსტა</h3>
                <p class="text-lg font-medium text-gray-900">{{ store.contactInfo?.email }}</p>
              </div>

              <!-- Google Maps -->
              <div v-if="store.contactInfo?.google_maps_url">
                <h3 class="text-sm font-semibold text-gray-700 mb-2">ლოკაცია</h3>
                <a
                  :href="store.contactInfo.google_maps_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Google Maps-ზე ნახვა
                </a>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Phone Numbers -->
              <div>
                <h3 class="text-sm font-semibold text-gray-700 mb-3">ტელეფონები</h3>
                <div class="space-y-2">
                  <div
                    v-for="(phone, index) in store.contactInfo?.phone_numbers"
                    :key="index"
                    class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span class="text-gray-800 font-medium">{{ phone.display }}</span>
                    <a :href="phone.href" class="text-indigo-600 hover:text-indigo-500 font-medium">
                      {{ phone.number }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-2xl shadow-lg border border-slate-200">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 48 48"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
          />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">კონტაქტის ინფორმაცია არ არის</h3>
        <p class="mt-2 text-gray-500">კონტაქტის ინფორმაცია ჯერ კიდევ არ არის დაყენებული.</p>
        <div class="mt-6">
          <button
            @click="store.openEditModal()"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            კონტაქტის ინფორმაციის დაყენება
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <ContactInfoEditModal
      :show="store.showEditModal"
      :contact-info="store.contactInfo"
      @close="store.closeModal()"
      @submit="handleEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminContactInfoStore } from '@/stores/admin/contactInfo'
import type { ContactInfoFormData } from '@/stores/admin/contactInfo'
import ContactInfoEditModal from '@/components/admin/ContactInfoEditModal.vue'

const store = useAdminContactInfoStore()

onMounted(() => {
  store.loadContactInfo()
})

const handleEdit = async (formData: ContactInfoFormData) => {
  try {
    await store.updateContactInfo(formData)
  } catch (error) {
    console.error('Error updating contact info:', error)
  }
}
</script>
