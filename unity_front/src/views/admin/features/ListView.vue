<template>
  <div class="p-4 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 mb-6 sm:mb-8 lg:flex-row lg:justify-between lg:items-center">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">ფუნქციების მართვა</h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">პროექტის ფუნქციების და მათი თვისებების მართვა</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <router-link
          to="/admin/features/assign"
          class="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          ფუნქციების მინიჭება
        </router-link>
        <router-link
          to="/admin/features/add"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          ფუნქციის დამატება
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
      <div class="text-red-600 mb-2">
        <svg class="w-10 h-10 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 class="text-base sm:text-lg font-medium text-red-800 mb-2">ფუნქციების ჩატვირთვის შეცდომა</h3>
      <p class="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">{{ error }}</p>
      <button
        @click="loadFeatures"
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
      >
        კვლავ სცადეთ
      </button>
    </div>

    <!-- Features Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full divide-y divide-gray-200" style="min-width: 1000px">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 sm:w-48"
              >
                ფუნქცია
              </th>
              <th
                class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44 sm:w-56"
              >
                სათაური
              </th>
              <th
                class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 sm:w-48"
              >
                ხატულა და ფერი
              </th>
              <th
                class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-52 sm:w-64"
              >
                საკვანძო სიტყვები
              </th>
              <th
                class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-32"
              >
                სტატუსი
              </th>
              <th
                class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-32"
              >
                დალაგების რიგი
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80"
              >
                ქმედებები
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="feature in features" :key="feature.id" class="hover:bg-gray-50">
              <!-- Feature Name -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ feature.name }}</div>
              </td>

              <!-- Title -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ feature.title.ka || feature.title.en || 'N/A' }}
                </div>
              </td>

              <!-- Icon & Color -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white text-sm"
                    :class="feature.color"
                  >
                    {{ feature.icon }}
                  </div>
                </div>
              </td>

              <!-- Keywords -->
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="keyword in feature.keywords.slice(0, 3)"
                    :key="keyword"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                  >
                    {{ keyword }}
                  </span>
                  <span
                    v-if="feature.keywords.length > 3"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-600"
                  >
                    +{{ feature.keywords.length - 3 }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    feature.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  "
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ feature.is_active ? 'აქტივი' : 'არააქტივი' }}
                </span>
              </td>

              <!-- Sort Order -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ feature.sort_order }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-sm font-medium">
                <div class="flex flex-wrap items-center gap-3 w-80">
                  <router-link
                    :to="`/admin/features/edit/${feature.id}`"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors whitespace-nowrap"
                  >
                    რედაქტირება
                  </router-link>
                  <button
                    @click="toggleFeatureStatus(feature)"
                    :class="
                      feature.is_active
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    "
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
                  >
                    {{ feature.is_active ? 'გამორთვა' : 'ჩართვა' }}
                  </button>
                  <button
                    @click="deleteFeature(feature)"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors whitespace-nowrap"
                  >
                    წაშლა
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="features.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">ფუნქციები ვერ მოიძებნა</h3>
        <p class="text-gray-500 mb-4">დაიწყეთ თქვენი პირველი ფუნქციის შექმნით.</p>
        <router-link
          to="/admin/features/add"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ფუნქციის შექმნა
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { featuresApi, type Feature } from '@/services/featuresApi'
const features = ref<Feature[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const loadFeatures = async () => {
  isLoading.value = true
  error.value = null

  try {
    features.value = await featuresApi.adminGetAll()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ფუნქციების ჩატვირთვა ვერ მოხერხდა'
    console.error('Failed to load features:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleFeatureStatus = async (feature: Feature) => {
  try {
    await featuresApi.update(feature.id, {
      is_active: !feature.is_active,
    })

    // Update local state
    feature.is_active = !feature.is_active
  } catch (err) {
    console.error('Failed to toggle feature status:', err)
    alert('ფუნქციის სტატუსის განახლება ვერ მოხერხდა')
  }
}

const deleteFeature = async (feature: Feature) => {
  if (!confirm(`დარწმუნებული ხართ, რომ გსურთ ფუნქციის "${feature.name}" წაშლა?`)) {
    return
  }

  try {
    await featuresApi.delete(feature.id)

    // Remove from local state
    const index = features.value.findIndex((f) => f.id === feature.id)
    if (index > -1) {
      features.value.splice(index, 1)
    }
  } catch (err) {
    console.error('Failed to delete feature:', err)
    alert('ფუნქციის წაშლა ვერ მოხერხდა')
  }
}

onMounted(() => {
  loadFeatures()
})
</script>
