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
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          მინიჭება პროექტზე
        </router-link>
        <router-link
          to="/admin/features/add"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p class="text-red-600 mb-4 text-sm sm:text-base">{{ error }}</p>
      <button
        @click="loadFeatures"
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
      >
        კვლავ სცადეთ
      </button>
    </div>

    <!-- Features Table -->
    <FeaturesTable
      v-else
      :features="features"
      @delete="deleteFeature"
    />
  </div>
</template>

<script setup lang="ts">
import { FeaturesTable } from './components'
import { useFeaturesList } from './composables'

const { features, isLoading, error, loadFeatures, deleteFeature } = useFeaturesList()
</script>
