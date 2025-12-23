<template>
  <div class="online-icon-picker">
    <!-- Search Input with Icon Preview -->
    <div class="relative">
      <div
        class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white"
      >
        <!-- Selected Icon Preview -->
        <div v-if="selectedIcon" class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
            :class="selectedIcon.color || 'bg-gradient-to-r from-blue-500 to-cyan-500'"
          >
            <span class="emoji-icon">{{ selectedIcon.emoji }}</span>
          </div>
          <span class="text-sm text-gray-700 font-medium">{{ selectedIcon.name }}</span>
          <button
            @click="clearSelection"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="წაშლა"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Search Input -->
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="selectedIcon ? 'ძებნა სხვა ხატულისთვის...' : placeholder"
          class="flex-1 border-0 outline-none text-gray-900 placeholder-gray-400"
          @input="searchIcons"
          @focus="showPicker = true"
        />

        <!-- Search Icon -->
        <div class="text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4"
    >
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span class="ml-2 text-gray-600">ძებნა ხატულების...</span>
      </div>
    </div>

    <!-- Icon Picker Dropdown -->
    <div
      v-if="showPicker && !isLoading"
      class="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      <!-- Header -->
      <div class="p-3 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900">აირჩიეთ ხატულა</h3>
          <button @click="showPicker = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">ძებნა ხატულების ონლაინ ბიბლიოთეკებში</p>
      </div>

      <!-- Search Results -->
      <div class="p-3">
        <!-- Popular Icons (when no search) -->
        <div v-if="!searchQuery.trim()" class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">პოპულარული ხატულები</h4>
          <div class="grid grid-cols-8 gap-2">
            <button
              v-for="icon in popularIcons"
              :key="icon.name"
              @click="selectIcon(icon)"
              class="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-110 bg-gradient-to-br from-gray-50 to-gray-100"
              :title="icon.name"
            >
              <span class="emoji-icon large">{{ icon.emoji }}</span>
            </button>
          </div>
        </div>

        <!-- Search Results -->
        <div v-else>
          <h4 class="text-sm font-medium text-gray-700 mb-2">
            შედეგები "{{ searchQuery }}"-ისთვის
          </h4>

          <!-- Icons Grid -->
          <div v-if="searchResults.length > 0" class="grid grid-cols-8 gap-2">
            <button
              v-for="icon in searchResults"
              :key="icon.name"
              @click="selectIcon(icon)"
              :class="[
                'w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all hover:scale-110',
                selectedIcon?.name === icon.name
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100',
              ]"
              :title="icon.name"
            >
              <span class="emoji-icon large">{{ icon.emoji }}</span>
            </button>
          </div>

          <!-- No Results -->
          <div v-else class="text-center py-8 text-gray-500">
            <svg
              class="w-12 h-12 mx-auto mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.57M15 6.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p>ხატულა ვერ მოიძებნა</p>
            <p class="text-xs mt-1">სცადეთ სხვა საძიებო სიტყვა</p>
          </div>
        </div>

        <!-- Icon Sources -->
        <div class="mt-4 pt-3 border-t border-gray-100">
          <p class="text-xs text-gray-500 text-center">
            ხატულები მოწოდებულია
            <a href="https://emojipedia.org" target="_blank" class="text-blue-500 hover:underline"
              >Emojipedia</a
            >
            -ის მიერ
          </p>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="showPicker" @click="showPicker = false" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { EMOJI_DATABASE, POPULAR_ICONS, type Icon } from '@/constants/icons'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'icon-selected': [icon: Icon]
}>()

const showPicker = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const searchResults = ref<Icon[]>([])
const selectedIcon = ref<Icon | null>(null)

const popularIcons = POPULAR_ICONS
const emojiDatabase = EMOJI_DATABASE

const searchIcons = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isLoading.value = true

  // Simulate API delay for better UX
  setTimeout(() => {
    const query = searchQuery.value.toLowerCase()

    searchResults.value = emojiDatabase.filter(
      (icon) =>
        icon.name.toLowerCase().includes(query) ||
        icon.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        icon.category.toLowerCase().includes(query) ||
        icon.emoji.includes(query),
    )

    isLoading.value = false
  }, 300)
}

const selectIcon = (icon: Icon) => {
  selectedIcon.value = icon
  emit('update:modelValue', icon.emoji)
  emit('icon-selected', icon)
  showPicker.value = false
  searchQuery.value = icon.name
}

const clearSelection = () => {
  selectedIcon.value = null
  emit('update:modelValue', '')
  searchQuery.value = ''
}

// Initialize selected icon if modelValue is provided
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const icon = emojiDatabase.find((i) => i.emoji === newValue)
      if (icon) {
        selectedIcon.value = icon
        searchQuery.value = icon.name
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.online-icon-picker {
  position: relative;
}

/* Custom scrollbar for the dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Emoji display improvements */
.emoji-icon {
  font-family:
    'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Android Emoji', 'EmojiSymbols',
    sans-serif;
  font-size: 1.25rem;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure consistent emoji sizing */
.emoji-icon.large {
  font-size: 1.5rem;
}

.emoji-icon.small {
  font-size: 1rem;
}
</style>
