<template>
  <div class="icon-picker">
    <!-- Input Field -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        @focus="showPicker = true"
        @input="filterIcons"
      />
      <div class="absolute right-3 top-1/2 -translate-y-1/2">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- Icon Picker Dropdown -->
    <div
      v-if="showPicker"
      class="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      <!-- Search Results Header -->
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
      </div>

      <!-- Categories -->
      <div class="p-3">
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              selectedCategory === category
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ category }}
          </button>
        </div>

        <!-- Icons Grid -->
        <div class="grid grid-cols-8 gap-2">
          <button
            v-for="icon in filteredIcons"
            :key="icon.name"
            @click="selectIcon(icon)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all hover:scale-110',
              selectedIcon?.name === icon.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300',
            ]"
            :title="icon.name"
          >
            <span class="text-lg">{{ icon.emoji }}</span>
          </button>
        </div>

        <!-- No Results -->
        <div v-if="filteredIcons.length === 0" class="text-center py-8 text-gray-500">
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
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="showPicker" @click="showPicker = false" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Icon {
  name: string
  emoji: string
  category: string
  keywords: string[]
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('ყველა')
const selectedIcon = ref<Icon | null>(null)

// Comprehensive icon library
const icons: Icon[] = [
  // Location & Navigation
  {
    name: 'location',
    emoji: '📍',
    category: 'მდებარეობა',
    keywords: ['location', 'place', 'pin', 'map', 'address'],
  },
  {
    name: 'map',
    emoji: '🗺️',
    category: 'მდებარეობა',
    keywords: ['map', 'navigation', 'route', 'direction'],
  },
  {
    name: 'compass',
    emoji: '🧭',
    category: 'მდებარეობა',
    keywords: ['compass', 'direction', 'navigation', 'bearing'],
  },
  {
    name: 'globe',
    emoji: '🌍',
    category: 'მდებარეობა',
    keywords: ['globe', 'world', 'global', 'earth'],
  },
  {
    name: 'building',
    emoji: '🏢',
    category: 'მდებარეობა',
    keywords: ['building', 'office', 'structure', 'architecture'],
  },
  {
    name: 'home',
    emoji: '🏠',
    category: 'მდებარეობა',
    keywords: ['home', 'house', 'residence', 'dwelling'],
  },
  {
    name: 'city',
    emoji: '🏙️',
    category: 'მდებარეობა',
    keywords: ['city', 'urban', 'metropolis', 'skyline'],
  },

  // Infrastructure & Services
  {
    name: 'infrastructure',
    emoji: '🏗️',
    category: 'ინფრასტრუქტურა',
    keywords: ['infrastructure', 'construction', 'development', 'building'],
  },
  {
    name: 'hospital',
    emoji: '🏥',
    category: 'ინფრასტრუქტურა',
    keywords: ['hospital', 'medical', 'health', 'clinic'],
  },
  {
    name: 'school',
    emoji: '🏫',
    category: 'ინფრასტრუქტურა',
    keywords: ['school', 'education', 'learning', 'academy'],
  },
  {
    name: 'bank',
    emoji: '🏦',
    category: 'ინფრასტრუქტურა',
    keywords: ['bank', 'finance', 'money', 'financial'],
  },
  {
    name: 'shopping',
    emoji: '🛒',
    category: 'ინფრასტრუქტურა',
    keywords: ['shopping', 'store', 'retail', 'commerce'],
  },
  {
    name: 'restaurant',
    emoji: '🍽️',
    category: 'ინფრასტრუქტურა',
    keywords: ['restaurant', 'food', 'dining', 'cafe'],
  },
  {
    name: 'gas_station',
    emoji: '⛽',
    category: 'ინფრასტრუქტურა',
    keywords: ['gas', 'fuel', 'station', 'energy'],
  },
  {
    name: 'wifi',
    emoji: '📶',
    category: 'ინფრასტრუქტურა',
    keywords: ['wifi', 'internet', 'connection', 'network'],
  },

  // Security & Safety
  {
    name: 'security',
    emoji: '🔒',
    category: 'უსაფრთხოება',
    keywords: ['security', 'lock', 'safety', 'protection'],
  },
  {
    name: 'shield',
    emoji: '🛡️',
    category: 'უსაფრთხოება',
    keywords: ['shield', 'protection', 'defense', 'security'],
  },
  {
    name: 'camera',
    emoji: '📹',
    category: 'უსაფრთხოება',
    keywords: ['camera', 'surveillance', 'monitoring', 'security'],
  },
  {
    name: 'alarm',
    emoji: '🚨',
    category: 'უსაფრთხოება',
    keywords: ['alarm', 'alert', 'warning', 'emergency'],
  },
  {
    name: 'fire',
    emoji: '🔥',
    category: 'უსაფრთხოება',
    keywords: ['fire', 'safety', 'emergency', 'protection'],
  },
  {
    name: 'police',
    emoji: '👮',
    category: 'უსაფრთხოება',
    keywords: ['police', 'law', 'enforcement', 'security'],
  },

  // Transportation & Parking
  {
    name: 'parking',
    emoji: '🅿️',
    category: 'ტრანსპორტი',
    keywords: ['parking', 'car', 'vehicle', 'space'],
  },
  {
    name: 'car',
    emoji: '🚗',
    category: 'ტრანსპორტი',
    keywords: ['car', 'vehicle', 'automobile', 'transport'],
  },
  {
    name: 'bus',
    emoji: '🚌',
    category: 'ტრანსპორტი',
    keywords: ['bus', 'public', 'transport', 'transit'],
  },
  {
    name: 'metro',
    emoji: '🚇',
    category: 'ტრანსპორტი',
    keywords: ['metro', 'subway', 'underground', 'train'],
  },
  {
    name: 'bike',
    emoji: '🚲',
    category: 'ტრანსპორტი',
    keywords: ['bike', 'bicycle', 'cycling', 'transport'],
  },
  {
    name: 'walking',
    emoji: '🚶',
    category: 'ტრანსპორტი',
    keywords: ['walking', 'pedestrian', 'foot', 'walk'],
  },

  // Quality & Luxury
  {
    name: 'quality',
    emoji: '⭐',
    category: 'ხარისხი',
    keywords: ['quality', 'star', 'excellent', 'premium'],
  },
  {
    name: 'diamond',
    emoji: '💎',
    category: 'ხარისხი',
    keywords: ['diamond', 'luxury', 'premium', 'quality'],
  },
  {
    name: 'crown',
    emoji: '👑',
    category: 'ხარისხი',
    keywords: ['crown', 'royal', 'luxury', 'premium'],
  },
  {
    name: 'trophy',
    emoji: '🏆',
    category: 'ხარისხი',
    keywords: ['trophy', 'award', 'achievement', 'excellence'],
  },
  {
    name: 'medal',
    emoji: '🏅',
    category: 'ხარისხი',
    keywords: ['medal', 'award', 'recognition', 'achievement'],
  },
  {
    name: 'gem',
    emoji: '💠',
    category: 'ხარისხი',
    keywords: ['gem', 'jewel', 'precious', 'luxury'],
  },

  // Commercial & Business
  {
    name: 'commercial',
    emoji: '🏪',
    category: 'კომერცია',
    keywords: ['commercial', 'shop', 'store', 'business'],
  },
  {
    name: 'office',
    emoji: '💼',
    category: 'კომერცია',
    keywords: ['office', 'business', 'work', 'professional'],
  },
  {
    name: 'briefcase',
    emoji: '💼',
    category: 'კომერცია',
    keywords: ['briefcase', 'business', 'work', 'office'],
  },
  {
    name: 'money',
    emoji: '💰',
    category: 'კომერცია',
    keywords: ['money', 'finance', 'wealth', 'business'],
  },
  {
    name: 'chart',
    emoji: '📊',
    category: 'კომერცია',
    keywords: ['chart', 'graph', 'analytics', 'business'],
  },
  {
    name: 'handshake',
    emoji: '🤝',
    category: 'კომერცია',
    keywords: ['handshake', 'deal', 'agreement', 'business'],
  },

  // Technology & Modern
  {
    name: 'technology',
    emoji: '💻',
    category: 'ტექნოლოგია',
    keywords: ['technology', 'computer', 'digital', 'modern'],
  },
  {
    name: 'smartphone',
    emoji: '📱',
    category: 'ტექნოლოგია',
    keywords: ['smartphone', 'phone', 'mobile', 'device'],
  },
  {
    name: 'robot',
    emoji: '🤖',
    category: 'ტექნოლოგია',
    keywords: ['robot', 'ai', 'automation', 'technology'],
  },
  {
    name: 'satellite',
    emoji: '🛰️',
    category: 'ტექნოლოგია',
    keywords: ['satellite', 'space', 'technology', 'communication'],
  },
  {
    name: 'chip',
    emoji: '🔧',
    category: 'ტექნოლოგია',
    keywords: ['chip', 'processor', 'technology', 'hardware'],
  },

  // Environment & Nature
  {
    name: 'environment',
    emoji: '🌱',
    category: 'გარემო',
    keywords: ['environment', 'green', 'eco', 'nature'],
  },
  {
    name: 'tree',
    emoji: '🌳',
    category: 'გარემო',
    keywords: ['tree', 'nature', 'green', 'environment'],
  },
  { name: 'leaf', emoji: '🍃', category: 'გარემო', keywords: ['leaf', 'nature', 'green', 'eco'] },
  { name: 'sun', emoji: '☀️', category: 'გარემო', keywords: ['sun', 'solar', 'energy', 'bright'] },
  {
    name: 'water',
    emoji: '💧',
    category: 'გარემო',
    keywords: ['water', 'liquid', 'clean', 'resource'],
  },
  {
    name: 'recycle',
    emoji: '♻️',
    category: 'გარემო',
    keywords: ['recycle', 'eco', 'green', 'sustainable'],
  },

  // Recreation & Lifestyle
  {
    name: 'recreation',
    emoji: '🎯',
    category: 'დასვენება',
    keywords: ['recreation', 'leisure', 'fun', 'entertainment'],
  },
  {
    name: 'gym',
    emoji: '🏋️',
    category: 'დასვენება',
    keywords: ['gym', 'fitness', 'exercise', 'health'],
  },
  {
    name: 'pool',
    emoji: '🏊',
    category: 'დასვენება',
    keywords: ['pool', 'swimming', 'water', 'recreation'],
  },
  {
    name: 'garden',
    emoji: '🌻',
    category: 'დასვენება',
    keywords: ['garden', 'park', 'nature', 'green'],
  },
  {
    name: 'playground',
    emoji: '🎪',
    category: 'დასვენება',
    keywords: ['playground', 'kids', 'children', 'fun'],
  },
  {
    name: 'theater',
    emoji: '🎭',
    category: 'დასვენება',
    keywords: ['theater', 'entertainment', 'culture', 'arts'],
  },

  // Utilities & Services
  {
    name: 'utilities',
    emoji: '⚡',
    category: 'კომუნალური',
    keywords: ['utilities', 'electricity', 'power', 'energy'],
  },
  {
    name: 'water_drop',
    emoji: '💧',
    category: 'კომუნალური',
    keywords: ['water', 'utility', 'service', 'resource'],
  },
  {
    name: 'trash',
    emoji: '🗑️',
    category: 'კომუნალური',
    keywords: ['trash', 'waste', 'garbage', 'disposal'],
  },
  {
    name: 'wrench',
    emoji: '🔧',
    category: 'კომუნალური',
    keywords: ['wrench', 'maintenance', 'repair', 'service'],
  },
  {
    name: 'tools',
    emoji: '🛠️',
    category: 'კომუნალური',
    keywords: ['tools', 'maintenance', 'repair', 'service'],
  },

  // Communication & Connectivity
  {
    name: 'communication',
    emoji: '📞',
    category: 'კომუნიკაცია',
    keywords: ['communication', 'phone', 'contact', 'connect'],
  },
  {
    name: 'mail',
    emoji: '📧',
    category: 'კომუნიკაცია',
    keywords: ['mail', 'email', 'message', 'communication'],
  },
  {
    name: 'chat',
    emoji: '💬',
    category: 'კომუნიკაცია',
    keywords: ['chat', 'message', 'communication', 'talk'],
  },
  {
    name: 'megaphone',
    emoji: '📢',
    category: 'კომუნიკაცია',
    keywords: ['megaphone', 'announcement', 'broadcast', 'communication'],
  },

  // Time & Schedule
  { name: 'time', emoji: '⏰', category: 'დრო', keywords: ['time', 'clock', 'schedule', 'timing'] },
  {
    name: 'calendar',
    emoji: '📅',
    category: 'დრო',
    keywords: ['calendar', 'date', 'schedule', 'planning'],
  },
  { name: 'clock', emoji: '🕐', category: 'დრო', keywords: ['clock', 'time', 'hour', 'schedule'] },
  {
    name: 'stopwatch',
    emoji: '⏱️',
    category: 'დრო',
    keywords: ['stopwatch', 'timer', 'time', 'measurement'],
  },
]

const categories = computed(() => {
  const cats = ['ყველა', ...new Set(icons.map((icon) => icon.category))]
  return cats
})

const filteredIcons = computed(() => {
  let filtered = icons

  // Filter by category
  if (selectedCategory.value !== 'ყველა') {
    filtered = filtered.filter((icon) => icon.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (icon) =>
        icon.name.toLowerCase().includes(query) ||
        icon.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        icon.category.toLowerCase().includes(query),
    )
  }

  return filtered
})

const selectIcon = (icon: Icon) => {
  selectedIcon.value = icon
  emit('update:modelValue', icon.emoji)
  showPicker.value = false
  searchQuery.value = icon.name
}

const filterIcons = () => {
  // This will trigger the computed property to update
}

// Initialize selected icon if modelValue is provided
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const icon = icons.find((i) => i.emoji === newValue)
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
.icon-picker {
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
</style>
