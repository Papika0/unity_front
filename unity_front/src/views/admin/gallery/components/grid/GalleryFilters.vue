<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
      <!-- Search and Filters -->
      <div class="flex flex-col gap-3 sm:gap-4 flex-1">
        <!-- Search -->
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="ძებნა სურათების მიხედვით..."
            class="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
          />
        </div>

        <!-- Filters Row -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <!-- Category Filter -->
          <select
            :value="selectedCategory"
            @change="$emit('update:selectedCategory', ($event.target as HTMLSelectElement).value)"
            class="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-medium text-gray-900 bg-white text-sm sm:text-base"
          >
            <option value="" class="text-gray-500">ყველა კატეგორია</option>
            <option v-for="category in categories" :key="category" :value="category" class="text-gray-900">
              {{ getCategoryLabel(category) }}
            </option>
          </select>

          <!-- Project Filter -->
          <select
            :value="selectedProject"
            @change="$emit('update:selectedProject', ($event.target as HTMLSelectElement).value)"
            class="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-medium text-gray-900 bg-white text-sm sm:text-base"
          >
            <option value="" class="text-gray-500">ყველა პროექტი</option>
            <option v-for="project in projects" :key="project" :value="project" class="text-gray-900">
              {{ project }}
            </option>
          </select>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
        <button
          @click="$emit('refresh')"
          :disabled="loading"
          class="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base"
        >
          <svg
            class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          განახლება
        </button>
        <button
          @click="$emit('openUpload')"
          class="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          <svg
            class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          ახალი სურათი
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  searchQuery: string
  selectedCategory: string
  selectedProject: string
  categories: string[]
  projects: string[]
  loading: boolean
}>()

defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:selectedCategory', value: string): void
  (e: 'update:selectedProject', value: string): void
  (e: 'refresh'): void
  (e: 'openUpload'): void
}>()

// Use the helper, but since we are in a component, we can just import it or pass it.
// To avoid circular dependency or context issues, I'll allow importing the composable purely for utility function or duplicate it.
// Duplicating it is safer if `useGalleryList` has state.
// Actually `useGalleryList` exports `getCategoryLabel`.
// But `useGalleryList` creates state. I cannot destructure it here without creating a new instance.
// So I will recreate the helper or expect it as prop? Recreating is easier for now.

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    exterior: 'ფასადები',
    interior: 'ინტერიერი',
    landscape: 'ლანდშაფტი',
    commercial: 'კომერციული',
    residential: 'საცხოვრებელი',
    about: 'ჩვენ შესახებ',
    projects: 'პროექტები',
    news: 'სიახლეები',
  }
  return labels[category] || category
}
</script>
