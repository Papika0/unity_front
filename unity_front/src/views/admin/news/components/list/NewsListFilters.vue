<template>
  <div class="mb-8 sm:mb-12 md:mb-16 relative">
    <div
      class="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 p-4 sm:p-6 md:p-8 overflow-visible"
      style="overflow: visible !important"
    >
      <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start lg:items-center justify-between">
        <!-- Search Input -->
        <div class="flex-1 w-full lg:max-w-2xl">
          <div class="relative group">
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value); $emit('search')"
              type="text"
              placeholder="ძებნა სიახლეებში..."
              class="w-full px-4 sm:px-6 py-3 sm:py-4 pl-10 sm:pl-14 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 text-slate-800 placeholder-slate-500 shadow-sm hover:shadow-md text-sm sm:text-base"
            />
            <svg
              class="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors"
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
        </div>

        <!-- Filter and Info Section -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full lg:w-auto">
          <!-- Category Filter -->
          <div class="flex items-center gap-2 relative z-10 w-full sm:w-auto">
            <label
              for="category-filter"
              class="text-slate-600 font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              კატეგორია:
            </label>
            <div class="relative custom-dropdown-container flex-1 sm:flex-initial">
              <!-- Custom Dropdown Button -->
              <button
                @click="toggleCategoryDropdown"
                @blur="handleDropdownBlur"
                class="appearance-none w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 text-slate-800 text-xs sm:text-sm min-w-[140px] sm:min-w-[160px] font-medium shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer text-left flex items-center justify-between"
                :class="{ 'border-amber-400 ring-4 ring-amber-500/20': showCategoryDropdown }"
              >
                <span class="truncate">{{ getCategoryDisplayText(selectedCategory) }}</span>
                <!-- Custom dropdown arrow -->
                <svg
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-all duration-200 ml-2 flex-shrink-0"
                  :class="{
                    'text-amber-500': selectedCategory,
                    'rotate-180': showCategoryDropdown,
                  }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Custom Dropdown Options Portal -->
              <Teleport to="body">
                <div
                  v-if="showCategoryDropdown"
                  ref="dropdownOptions"
                  class="fixed bg-white/95 backdrop-blur-sm border-2 border-slate-200 rounded-xl shadow-2xl z-[99999] min-w-[160px] overflow-hidden"
                  :style="dropdownPosition"
                >
                  <div class="py-2">
                    <button
                      v-for="option in categoryOptions"
                      :key="option.value"
                      @click="selectCategory(option.value)"
                      class="w-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2"
                      :class="{
                        'text-slate-600': option.value === '',
                        'text-slate-800': option.value !== '',
                        'bg-amber-100 text-amber-800':
                          selectedCategory === option.value,
                      }"
                    >
                      <span class="flex-1">{{ option.label }}</span>
                      <svg
                        v-if="selectedCategory === option.value"
                        class="w-4 h-4 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </Teleport>
            </div>
          </div>

          <!-- Filter Tags -->
          <div class="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <div
              class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg sm:rounded-xl border border-slate-200"
            >
              <svg
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
                />
              </svg>
              <span class="text-slate-600 font-medium text-xs sm:text-sm whitespace-nowrap"
                >სულ: {{ articlesCount }} სიახლე</span
              >
            </div>

            <!-- Active Filter Indicator -->
            <div
              v-if="selectedCategory"
              class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg sm:rounded-xl border border-amber-200"
            >
              <svg
                class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span class="text-amber-700 font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {{ getCategoryLabel(selectedCategory) }}
              </span>
              <button
                @click="$emit('clearCategory')"
                class="ml-0.5 sm:ml-1 text-amber-600 hover:text-amber-800 transition-colors flex-shrink-0"
              >
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps<{
  searchQuery: string
  selectedCategory: string
  articlesCount: number
  categoryOptions: Array<{ value: string; label: string }>
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'search'): void
  (e: 'update:selectedCategory', value: string): void
  (e: 'selectCategory', value: string): void
  (e: 'clearCategory'): void
}>()

// Dropdown UI logic
const showCategoryDropdown = ref(false)
const dropdownOptions = ref<HTMLElement | null>(null)
const dropdownPosition = ref({})

const toggleCategoryDropdown = (event: Event) => {
  event.preventDefault()
  showCategoryDropdown.value = !showCategoryDropdown.value

  if (showCategoryDropdown.value) {
    const target = event.target as HTMLElement
    const rect = target.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 200

    const spaceBelow = viewportHeight - rect.bottom
    const shouldShowAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

    dropdownPosition.value = {
      left: `${rect.left}px`,
      top: shouldShowAbove ? `${rect.top - dropdownHeight}px` : `${rect.bottom + 4}px`,
      width: `${rect.width}px`,
      maxHeight: shouldShowAbove ? `${rect.top - 10}px` : `${spaceBelow - 10}px`,
    }

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (dropdownOptions.value && !dropdownOptions.value.contains(target)) {
    showCategoryDropdown.value = false
    document.removeEventListener('click', handleClickOutside)
  }
}

const handleDropdownBlur = () => {
  setTimeout(() => {
    if (dropdownOptions.value && !dropdownOptions.value.contains(document.activeElement)) {
      showCategoryDropdown.value = false
      document.removeEventListener('click', handleClickOutside)
    }
  }, 100)
}

const selectCategory = (value: string) => {
  emit('update:selectedCategory', value)
  emit('selectCategory', value)
  showCategoryDropdown.value = false
  document.removeEventListener('click', handleClickOutside)
}

const getCategoryDisplayText = (value: string) => {
  const option = props.categoryOptions.find((opt) => opt.value === value)
  return option ? option.label : 'ყველა კატეგორია'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    company: 'კომპანია',
    project: 'პროექტი',
    industry: 'ინდუსტრია',
    event: 'ღონისძიება',
  }
  return labels[category] || category
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom dropdown container styling */
.custom-dropdown-container {
  position: relative;
  z-index: 10;
}

/* Custom dropdown smooth animations */
.custom-dropdown-container button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-dropdown-container button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 8px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Dropdown options styling with enhanced animations */
.custom-dropdown-container div[class*='fixed'] {
  animation: dropdownFadeIn 0.2s ease-out;
  transform-origin: top;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced option hover effects */
.custom-dropdown-container button[class*='hover:bg-amber-50']:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  transform: translateX(4px);
}

/* Mobile responsiveness for custom dropdown */
@media (max-width: 640px) {
  .custom-dropdown-container {
    width: 100%;
    min-width: 160px;
  }

  .custom-dropdown-container button {
    width: 100%;
    min-width: 160px;
  }
}
</style>
